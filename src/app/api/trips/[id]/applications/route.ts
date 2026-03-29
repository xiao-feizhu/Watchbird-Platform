import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

/**
 * GET: List all applications for a trip
 * Requires authentication - organizer only
 */
export async function GET(
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

    // Check trip exists and user is the organizer
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
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

    if (trip.organizerId !== auth.userId) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有组织者可以查看申请列表'),
        { status: 403 }
      )
    }

    // Get all applications with applicant profile info
    const applications = await prisma.tripParticipant.findMany({
      where: { tripId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            userProfile: {
              select: {
                age: true,
                gender: true,
                region: true,
                birdingYears: true,
                expertBirds: true,
                equipment: true,
                canDrive: true,
                carCapacity: true,
                joinedTrips: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { appliedAt: 'desc' },
      ],
    })

    const formattedApplications = applications.map((app) => ({
      id: app.id,
      user: {
        id: app.user.id,
        nickname: app.user.nickname || '未知用户',
        avatar: app.user.avatar,
        profile: app.user.userProfile,
      },
      status: app.status,
      bio: app.bio,
      appliedAt: app.appliedAt.toISOString(),
      respondedAt: app.respondedAt?.toISOString(),
    }))

    return NextResponse.json(
      createSuccessResponse({
        applications: formattedApplications,
        meta: {
          total: applications.length,
        },
      })
    )
  } catch (error) {
    console.error('List applications error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
