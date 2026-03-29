import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { TripStatus, ChatGroupStatus, NotificationType } from '@prisma/client'

/**
 * POST: Cancel a trip
 * Requires authentication - organizer only
 * - Set trip status to CANCELLED
 * - Disable chat group (set status to DISABLED)
 * - Create notifications for all approved participants
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

    // Fetch trip with organizer and approved participants
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        participants: {
          where: {
            status: 'APPROVED',
          },
          select: {
            userId: true,
          },
        },
        chatGroup: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!trip) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '帖子不存在'),
        { status: 404 }
      )
    }

    // Check if user is the organizer
    if (trip.organizerId !== auth.userId) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有组织者可以取消活动'),
        { status: 403 }
      )
    }

    // Check if trip can be cancelled
    if (trip.status === TripStatus.CANCELLED) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '活动已经取消'),
        { status: 400 }
      )
    }

    if (trip.status === TripStatus.COMPLETED) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '已完成的活动不能取消'),
        { status: 400 }
      )
    }

    // Use transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Update trip status to CANCELLED
      await tx.trip.update({
        where: { id: tripId },
        data: {
          status: TripStatus.CANCELLED,
        },
      })

      // Disable chat group if exists
      if (trip.chatGroup) {
        await tx.chatGroup.update({
          where: { id: trip.chatGroup.id },
          data: {
            status: ChatGroupStatus.DISABLED,
            disabledAt: new Date(),
            disabledReason: '活动已取消',
          },
        })
      }

      // Create notifications for all approved participants
      const participantIds = trip.participants.map((p) => p.userId)

      if (participantIds.length > 0) {
        await tx.notification.createMany({
          data: participantIds.map((userId) => ({
            userId,
            type: NotificationType.TRIP_CANCELLED,
            title: '活动已取消',
            content: `您参加的活动「${trip.title}」已被组织者取消`,
            data: { tripId },
          })),
        })
      }
    })

    return NextResponse.json(
      createSuccessResponse({
        success: true,
        message: '活动已取消',
      })
    )
  } catch (error) {
    console.error('Cancel trip error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
