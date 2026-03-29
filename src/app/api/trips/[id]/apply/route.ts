import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { applyTripSchema } from '@/lib/validations/application'
import { TripStatus, ParticipantStatus, NotificationType } from '@prisma/client'

/**
 * POST: Apply to join a trip
 * Requires authentication and user profile
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '请先登录'),
        { status: 401 }
      )
    }

    const { id: tripId } = await params

    // Check if user has a profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: auth.userId },
    })

    if (!userProfile) {
      return NextResponse.json(
        createErrorResponse('PROFILE_REQUIRED', '请先完善个人资料'),
        { status: 403 }
      )
    }

    // Check trip exists and is open
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        status: true,
        organizerId: true,
        title: true,
      },
    })

    if (!trip) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '帖子不存在'),
        { status: 404 }
      )
    }

    if (trip.status !== TripStatus.OPEN) {
      return NextResponse.json(
        createErrorResponse('TRIP_NOT_OPEN', '该帖子当前不接受申请'),
        { status: 400 }
      )
    }

    // Prevent organizer from applying to own trip
    if (trip.organizerId === auth.userId) {
      return NextResponse.json(
        createErrorResponse('CANNOT_APPLY_OWN', '不能申请自己组织的活动'),
        { status: 400 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validation = applyTripSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请求参数错误'),
        { status: 400 }
      )
    }

    const { bio } = validation.data

    // Check for existing application
    const existingApplication = await prisma.tripParticipant.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: auth.userId,
        },
      },
    })

    if (existingApplication) {
      if (existingApplication.status !== ParticipantStatus.CANCELLED) {
        return NextResponse.json(
          createErrorResponse('ALREADY_APPLIED', '您已经申请过该活动'),
          { status: 409 }
        )
      }

      // Re-apply if previously cancelled
      const updated = await prisma.tripParticipant.update({
        where: { id: existingApplication.id },
        data: {
          status: ParticipantStatus.PENDING,
          bio,
          appliedAt: new Date(),
          respondedAt: null,
        },
      })

      // Create notification for organizer
      await prisma.notification.create({
        data: {
          userId: trip.organizerId,
          type: NotificationType.TRIP_APPLICATION,
          title: '新的入队申请',
          content: `有人重新申请加入您的活动「${trip.title}」`,
          data: { tripId, participantId: updated.id },
        },
      })

      return NextResponse.json(
        createSuccessResponse({
          id: updated.id,
          status: updated.status,
          appliedAt: updated.appliedAt.toISOString(),
        }),
        { status: 200 }
      )
    }

    // Create new application
    const application = await prisma.tripParticipant.create({
      data: {
        tripId,
        userId: auth.userId,
        status: ParticipantStatus.PENDING,
        bio,
      },
    })

    // Create notification for organizer
    await prisma.notification.create({
      data: {
        userId: trip.organizerId,
        type: NotificationType.TRIP_APPLICATION,
        title: '新的入队申请',
        content: `有人申请加入您的活动「${trip.title}」`,
        data: { tripId, participantId: application.id },
      },
    })

    return NextResponse.json(
      createSuccessResponse({
        id: application.id,
        status: application.status,
        appliedAt: application.appliedAt.toISOString(),
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Apply to trip error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * DELETE: Cancel own application
 * Requires authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '请先登录'),
        { status: 401 }
      )
    }

    const { id: tripId } = await params

    // Find the application
    const application = await prisma.tripParticipant.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: auth.userId,
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '申请记录不存在'),
        { status: 404 }
      )
    }

    if (application.status === ParticipantStatus.CANCELLED) {
      return NextResponse.json(
        createErrorResponse('ALREADY_CANCELLED', '申请已经取消'),
        { status: 400 }
      )
    }

    // Cancel the application
    await prisma.tripParticipant.update({
      where: { id: application.id },
      data: {
        status: ParticipantStatus.CANCELLED,
        respondedAt: new Date(),
      },
    })

    return NextResponse.json(createSuccessResponse({ success: true }))
  } catch (error) {
    console.error('Cancel application error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
