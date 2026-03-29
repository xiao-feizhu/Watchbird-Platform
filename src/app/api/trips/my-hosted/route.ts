import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { TripStatus } from '@prisma/client'
import { z } from 'zod'

const querySchema = z.object({
  status: z.nativeEnum(TripStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

/**
 * GET: List my hosted trips
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
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请求参数错误'),
        { status: 400 }
      )
    }

    const { status, page, limit } = queryValidation.data

    const where: {
      organizerId: string
      status?: TripStatus
    } = {
      organizerId: auth.userId,
    }

    if (status) {
      where.status = status
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
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
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.trip.count({ where }),
    ])

    const formattedTrips = trips.map((trip) => ({
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
      approvedCount: trip._count.participants,
    }))

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
    console.error('List my hosted trips error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
