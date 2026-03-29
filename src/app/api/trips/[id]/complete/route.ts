import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { TripStatus } from '@prisma/client'

/**
 * POST: Mark trip as completed
 * Requires authentication - organizer only
 * - Check status is CLOSED (not OPEN/FULL)
 * - Set status to COMPLETED
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

    // Fetch trip
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        organizerId: true,
        title: true,
        status: true,
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
        createErrorResponse('FORBIDDEN', '只有组织者可以完成活动'),
        { status: 403 }
      )
    }

    // Check if trip status is CLOSED (only CLOSED trips can be marked as completed)
    if (trip.status !== TripStatus.CLOSED) {
      return NextResponse.json(
        createErrorResponse(
          'INVALID_STATUS',
          '只有已截止的活动可以标记为完成'
        ),
        { status: 400 }
      )
    }

    // Update trip status to COMPLETED
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
      },
    })

    return NextResponse.json(
      createSuccessResponse({
        id: updatedTrip.id,
        status: updatedTrip.status,
        message: '活动已标记为完成',
      })
    )
  } catch (error) {
    console.error('Complete trip error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
