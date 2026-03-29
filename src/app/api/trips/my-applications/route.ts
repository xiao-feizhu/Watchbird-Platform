import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { ParticipantStatus } from '@prisma/client'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

/**
 * GET: List my trip applications (PENDING or REJECTED)
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
          status: {
            in: [ParticipantStatus.PENDING, ParticipantStatus.REJECTED],
          },
        },
        include: {
          trip: {
            select: {
              id: true,
              title: true,
              destination: true,
              destinationLat: true,
              destinationLng: true,
              startDate: true,
              endDate: true,
              maxParticipants: true,
              currentCount: true,
              feeType: true,
              feeAmount: true,
              status: true,
              createdAt: true,
              organizer: {
                select: {
                  id: true,
                  nickname: true,
                  avatar: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { status: 'asc' },
          { appliedAt: 'desc' },
        ],
      }),
      prisma.tripParticipant.count({
        where: {
          userId: auth.userId,
          status: {
            in: [ParticipantStatus.PENDING, ParticipantStatus.REJECTED],
          },
        },
      }),
    ])

    const formattedApplications = participants.map((participant) => ({
      id: participant.id,
      status: participant.status,
      bio: participant.bio,
      appliedAt: participant.appliedAt.toISOString(),
      respondedAt: participant.respondedAt?.toISOString(),
      trip: {
        id: participant.trip.id,
        title: participant.trip.title,
        destination: participant.trip.destination,
        destinationLat: participant.trip.destinationLat,
        destinationLng: participant.trip.destinationLng,
        startDate: participant.trip.startDate.toISOString(),
        endDate: participant.trip.endDate?.toISOString(),
        maxParticipants: participant.trip.maxParticipants,
        currentCount: participant.trip.currentCount,
        feeType: participant.trip.feeType,
        feeAmount: participant.trip.feeAmount
          ? Number(participant.trip.feeAmount)
          : undefined,
        status: participant.trip.status,
        createdAt: participant.trip.createdAt.toISOString(),
        organizer: {
          id: participant.trip.organizer.id,
          nickname: participant.trip.organizer.nickname || '未知用户',
          avatar: participant.trip.organizer.avatar,
        },
      },
    }))

    return NextResponse.json(
      createSuccessResponse({
        applications: formattedApplications,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    )
  } catch (error) {
    console.error('List my applications error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
