'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { updateTripSchema } from '@/lib/validations/trip'
import { TripStatus, FeeType } from '@prisma/client'

/**
 * GET: Get trip detail
 * Public endpoint - no authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            userProfile: {
              select: {
                age: true,
                gender: true,
                region: true,
                bio: true,
                birdingYears: true,
                expertBirds: true,
                equipment: true,
                canDrive: true,
                carCapacity: true,
                hostedTrips: true,
              },
            },
          },
        },
        participants: {
          where: {
            status: 'APPROVED',
          },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
                userProfile: {
                  select: {
                    birdingYears: true,
                  },
                },
              },
            },
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

    const formattedTrip = {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      destinationLat: trip.destinationLat,
      destinationLng: trip.destinationLng,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate?.toISOString(),
      maxParticipants: trip.maxParticipants,
      currentCount: trip.currentCount,
      requirements: trip.requirements,
      feeType: trip.feeType,
      feeAmount: trip.feeAmount ? Number(trip.feeAmount) : undefined,
      feeDescription: trip.feeDescription,
      description: trip.description,
      status: trip.status,
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
      organizer: {
        id: trip.organizer.id,
        nickname: trip.organizer.nickname || '未知用户',
        avatar: trip.organizer.avatar,
        profile: trip.organizer.userProfile,
      },
      participants: trip.participants.map((p) => ({
        id: p.id,
        user: {
          id: p.user.id,
          nickname: p.user.nickname || '未知用户',
          avatar: p.user.avatar,
          birdingYears: p.user.userProfile?.birdingYears ?? 0,
        },
        bio: p.bio,
        appliedAt: p.appliedAt.toISOString(),
      })),
      chatGroupId: trip.chatGroup?.id,
    }

    return NextResponse.json(createSuccessResponse({ trip: formattedTrip }))
  } catch (error) {
    console.error('Get trip error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * PUT: Update trip
 * Requires authentication - organizer only
 */
export async function PUT(
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

    const { id } = await params

    const existingTrip = await prisma.trip.findUnique({
      where: { id },
      select: {
        organizerId: true,
        status: true,
      },
    })

    if (!existingTrip) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '帖子不存在'),
        { status: 404 }
      )
    }

    if (existingTrip.organizerId !== auth.userId) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有组织者可以编辑帖子'),
        { status: 403 }
      )
    }

    if (
      existingTrip.status === TripStatus.CANCELLED ||
      existingTrip.status === TripStatus.COMPLETED
    ) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '已取消或已完成的帖子不能编辑'),
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = updateTripSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请求参数错误'),
        { status: 400 }
      )
    }

    const data = validation.data

    const updateData: {
      title?: string
      destination?: string
      destinationLat?: number
      destinationLng?: number
      startDate?: Date
      endDate?: Date | null
      maxParticipants?: number
      requirements?: string | null
      feeType?: FeeType
      feeAmount?: number | null
      feeDescription?: string | null
      description?: string
    } = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.destination !== undefined) updateData.destination = data.destination
    if (data.destinationLat !== undefined)
      updateData.destinationLat = data.destinationLat
    if (data.destinationLng !== undefined)
      updateData.destinationLng = data.destinationLng
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null
    }
    if (data.maxParticipants !== undefined)
      updateData.maxParticipants = data.maxParticipants
    if (data.requirements !== undefined)
      updateData.requirements = data.requirements || null
    if (data.feeType !== undefined) updateData.feeType = data.feeType
    if (data.feeAmount !== undefined)
      updateData.feeAmount = data.feeAmount ?? null
    if (data.feeDescription !== undefined)
      updateData.feeDescription = data.feeDescription || null
    if (data.description !== undefined) updateData.description = data.description

    if (updateData.startDate && updateData.endDate) {
      if (updateData.endDate <= updateData.startDate) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', '结束日期必须晚于开始日期'),
          { status: 400 }
        )
      }
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(
      createSuccessResponse({
        id: updatedTrip.id,
        title: updatedTrip.title,
        destination: updatedTrip.destination,
        startDate: updatedTrip.startDate.toISOString(),
        status: updatedTrip.status,
        updatedAt: updatedTrip.updatedAt.toISOString(),
      })
    )
  } catch (error) {
    console.error('Update trip error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * DELETE: Soft delete trip (set status to CANCELLED)
 * Requires authentication - organizer only
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

    const { id } = await params

    const existingTrip = await prisma.trip.findUnique({
      where: { id },
      select: {
        organizerId: true,
        status: true,
      },
    })

    if (!existingTrip) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '帖子不存在'),
        { status: 404 }
      )
    }

    if (existingTrip.organizerId !== auth.userId) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有组织者可以取消帖子'),
        { status: 403 }
      )
    }

    if (existingTrip.status === TripStatus.CANCELLED) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '帖子已经取消'),
        { status: 400 }
      )
    }

    if (existingTrip.status === TripStatus.COMPLETED) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '已完成的帖子不能取消'),
        { status: 400 }
      )
    }

    await prisma.trip.update({
      where: { id },
      data: {
        status: TripStatus.CANCELLED,
      },
    })

    return NextResponse.json(createSuccessResponse({ success: true }))
  } catch (error) {
    console.error('Delete trip error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
