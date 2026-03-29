import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

/**
 * GET: List trips I have joined (approved participation)
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '请先登录'),
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    const queryValidation = querySchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请求参数错误'),
        { status: 400 }
      )
    }

    const { page, limit } = queryValidation.data

    const [participants, total] = await Promise.all([
      prisma.tripParticipant.findMany({
        where: {
          userId: auth.userId,
          status: 'APPROVED',
        },
        include: {
          trip: {
            include: {
              organizer: {
                select: {
                  id: true,
                  nickname: true,
                  avatar: true,
                  userProfile: {
                    select: {
                      birdingYears: true,
                      hostedTrips: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  participants: {
                    where: {
                      status: 'APPROVED',
                    },
                  },
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { appliedAt: 'desc' },
      }),
      prisma.tripParticipant.count({
        where: {
          userId: auth.userId,
          status: 'APPROVED',
        },
      }),
    ])

    const formattedTrips = participants.map((participant) => {
      const trip = participant.trip
      return {
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        destinationLat: trip.destinationLat,
        destinationLng: trip.destinationLng,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate?.toISOString(),
        maxParticipants: trip.maxParticipants,
        currentCount: trip.currentCount,
        feeType: trip.feeType,
        feeAmount: trip.feeAmount ? Number(trip.feeAmount) : undefined,
        status: trip.status,
        createdAt: trip.createdAt.toISOString(),
        organizer: {
          id: trip.organizer.id,
          nickname: trip.organizer.nickname || '未知用户',
          avatar: trip.organizer.avatar,
          birdingYears: trip.organizer.userProfile?.birdingYears ?? 0,
          hostedTrips: trip.organizer.userProfile?.hostedTrips ?? 0,
        },
        approvedCount: trip._count.participants,
        joinedAt: participant.appliedAt.toISOString(),
      }
    })

    return NextResponse.json(
      createSuccessResponse({
        trips: formattedTrips,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    )
  } catch (error) {
    console.error('List my joined trips error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
