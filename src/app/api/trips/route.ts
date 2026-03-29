import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import {
  createTripSchema,
  listTripsQuerySchema,
} from '@/lib/validations/trip'
import { TripStatus, FeeType } from '@prisma/client'

/**
 * GET: List trips with filters and pagination
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const queryValidation = listTripsQuerySchema.safeParse({
      region: searchParams.get('region') || undefined,
      startDateFrom: searchParams.get('startDateFrom') || undefined,
      startDateTo: searchParams.get('startDateTo') || undefined,
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

    const { region, startDateFrom, startDateTo, status, page, limit } =
      queryValidation.data

    const where: {
      status?: TripStatus
      destination?: { contains: string; mode: 'insensitive' }
      startDate?: { gte?: Date; lte?: Date }
    } = {
      status: TripStatus.OPEN,
    }

    if (status) {
      where.status = status
    }

    if (region) {
      where.destination = { contains: region, mode: 'insensitive' }
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {}
      if (startDateFrom) {
        where.startDate.gte = new Date(startDateFrom)
      }
      if (startDateTo) {
        where.startDate.lte = new Date(startDateTo)
      }
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
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
      organizer: {
        id: trip.organizer.id,
        nickname: trip.organizer.nickname || '未知用户',
        avatar: trip.organizer.avatar,
        birdingYears: trip.organizer.userProfile?.birdingYears ?? 0,
        hostedTrips: trip.organizer.userProfile?.hostedTrips ?? 0,
      },
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
    console.error('List trips error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * POST: Create a new trip
 * Requires authentication and user profile
 */
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '请先登录'),
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = createTripSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请求参数错误'),
        { status: 400 }
      )
    }

    const data = validation.data

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: auth.userId },
    })

    if (!userProfile) {
      return NextResponse.json(
        createErrorResponse('PROFILE_REQUIRED', '请先完善个人资料'),
        { status: 403 }
      )
    }

    const startDate = new Date(data.startDate)
    const endDate = data.endDate ? new Date(data.endDate) : undefined

    if (endDate && endDate <= startDate) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '结束日期必须晚于开始日期'),
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          organizerId: auth.userId,
          title: data.title,
          destination: data.destination,
          destinationLat: data.destinationLat,
          destinationLng: data.destinationLng,
          startDate: startDate,
          endDate: endDate,
          maxParticipants: data.maxParticipants,
          requirements: data.requirements,
          feeType: data.feeType,
          feeAmount:
            data.feeType === FeeType.FIXED && data.feeAmount !== undefined
              ? data.feeAmount
              : undefined,
          feeDescription: data.feeDescription,
          description: data.description,
          status: TripStatus.OPEN,
          currentCount: 1,
        },
      })

      await tx.chatGroup.create({
        data: {
          tripId: trip.id,
          name: `${data.title} 讨论群`,
          status: 'ACTIVE',
        },
      })

      await tx.userProfile.update({
        where: { userId: auth.userId },
        data: {
          hostedTrips: {
            increment: 1,
          },
        },
      })

      return trip
    })

    return NextResponse.json(
      createSuccessResponse({
        id: result.id,
        title: result.title,
        destination: result.destination,
        startDate: result.startDate.toISOString(),
        status: result.status,
        createdAt: result.createdAt.toISOString(),
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Create trip error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
