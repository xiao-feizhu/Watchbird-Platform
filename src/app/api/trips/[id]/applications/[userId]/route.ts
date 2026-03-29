import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { reviewApplicationSchema } from '@/lib/validations/application'
import {
  TripStatus,
  ParticipantStatus,
  NotificationType,
} from '@prisma/client'

/**
 * PUT: Review an application (approve or reject)
 * Requires authentication - organizer only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '请先登录'),
        { status: 401 }
      )
    }

    const { id: tripId, userId: applicantId } = await params

    // Validate request body
    const body = await request.json()
    const validation = reviewApplicationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请求参数错误'),
        { status: 400 }
      )
    }

    const { status: newStatus } = validation.data

    // Check trip exists and user is the organizer
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        organizerId: true,
        title: true,
        maxParticipants: true,
        currentCount: true,
        status: true,
      },
    })

    if (!trip) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '帖子不存在'),
        { status: 404 }
      )
    }

    if (trip.organizerId !== auth.userId) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有组织者可以审核申请'),
        { status: 403 }
      )
    }

    // Find the application
    const application = await prisma.tripParticipant.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: applicantId,
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '申请记录不存在'),
        { status: 404 }
      )
    }

    if (application.status !== ParticipantStatus.PENDING) {
      return NextResponse.json(
        createErrorResponse('ALREADY_REVIEWED', '该申请已经处理过了'),
        { status: 400 }
      )
    }

    // If approving, check trip is not full
    if (newStatus === 'APPROVED') {
      if (trip.status === TripStatus.FULL) {
        return NextResponse.json(
          createErrorResponse('TRIP_FULL', '该活动已满员'),
          { status: 400 }
        )
      }

      if (trip.currentCount >= trip.maxParticipants) {
        return NextResponse.json(
          createErrorResponse('TRIP_FULL', '该活动已满员'),
          { status: 400 }
        )
      }
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.tripParticipant.update({
        where: { id: application.id },
        data: {
          status:
            newStatus === 'APPROVED'
              ? ParticipantStatus.APPROVED
              : ParticipantStatus.REJECTED,
          respondedAt: new Date(),
        },
      })

      let updatedTrip = null

      // If approved, update trip count and potentially status
      if (newStatus === 'APPROVED') {
        const newCount = trip.currentCount + 1
        const newTripStatus =
          newCount >= trip.maxParticipants ? TripStatus.FULL : TripStatus.OPEN

        updatedTrip = await tx.trip.update({
          where: { id: tripId },
          data: {
            currentCount: newCount,
            status: newTripStatus,
          },
        })

        // Increment participant's joinedTrips count
        await tx.userProfile.update({
          where: { userId: applicantId },
          data: {
            joinedTrips: {
              increment: 1,
            },
          },
        })
      }

      // Create notification for applicant
      await tx.notification.create({
        data: {
          userId: applicantId,
          type:
            newStatus === 'APPROVED'
              ? NotificationType.TRIP_APPROVED
              : NotificationType.TRIP_REJECTED,
          title: newStatus === 'APPROVED' ? '申请已通过' : '申请未通过',
          content:
            newStatus === 'APPROVED'
              ? `您申请加入的活动「${trip.title}」已通过审核`
              : `您申请加入的活动「${trip.title}」未通过审核`,
          data: { tripId, status: newStatus },
        },
      })

      return { application: updatedApplication, trip: updatedTrip }
    })

    return NextResponse.json(
      createSuccessResponse({
        id: result.application.id,
        status: result.application.status,
        respondedAt: result.application.respondedAt?.toISOString(),
        tripStatus: result.trip?.status,
        currentCount: result.trip?.currentCount,
      })
    )
  } catch (error) {
    console.error('Review application error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
