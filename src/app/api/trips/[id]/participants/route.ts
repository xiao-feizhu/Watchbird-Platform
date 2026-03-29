import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import {
  TripStatus,
  ParticipantStatus,
} from '@prisma/client'

/**
 * DELETE: Leave a trip (participant only)
 * - Set participant status to CANCELLED
 * - Decrement trip currentCount
 * - Update trip status from FULL to OPEN if needed
 * - Decrement user's joinedTrips count
 * - Use transaction
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

    // Fetch trip with participant info
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        participants: {
          where: {
            userId: auth.userId,
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

    // Check if user is the organizer (organizer cannot leave)
    if (trip.organizerId === auth.userId) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '组织者不能退出自己创建的活动'),
        { status: 403 }
      )
    }

    // Check trip status - cannot leave cancelled or completed trips
    if (
      trip.status === TripStatus.CANCELLED ||
      trip.status === TripStatus.COMPLETED
    ) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '已取消或已完成的活动不能退出'),
        { status: 400 }
      )
    }

    // Find participant record
    const participant = trip.participants[0]

    if (!participant) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '您没有参加该活动'),
        { status: 404 }
      )
    }

    // Check if already cancelled
    if (participant.status === ParticipantStatus.CANCELLED) {
      return NextResponse.json(
        createErrorResponse('ALREADY_CANCELLED', '您已经退出该活动'),
        { status: 400 }
      )
    }

    // Use transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Update participant status to CANCELLED
      await tx.tripParticipant.update({
        where: { id: participant.id },
        data: {
          status: ParticipantStatus.CANCELLED,
          respondedAt: new Date(),
        },
      })

      // Only decrement count if participant was APPROVED
      if (participant.status === ParticipantStatus.APPROVED) {
        // Calculate new count and status
        const newCount = Math.max(0, trip.currentCount - 1)
        const newStatus =
          trip.status === TripStatus.FULL ? TripStatus.OPEN : trip.status

        // Update trip
        await tx.trip.update({
          where: { id: tripId },
          data: {
            currentCount: newCount,
            status: newStatus,
          },
        })

        // Decrement user's joinedTrips count
        await tx.userProfile.update({
          where: { userId: auth.userId },
          data: {
            joinedTrips: {
              decrement: 1,
            },
          },
        })
      }
    })

    return NextResponse.json(
      createSuccessResponse({
        success: true,
        message: '已成功退出活动',
      })
    )
  } catch (error) {
    console.error('Leave trip error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
