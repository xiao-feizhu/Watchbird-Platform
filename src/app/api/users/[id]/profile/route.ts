import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

/**
 * GET: Fetch public profile of a user by ID
 * Returns limited fields for public viewing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
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
            joinedTrips: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        createErrorResponse('USER_NOT_FOUND', '用户不存在'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      createSuccessResponse({
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        profile: user.userProfile,
      })
    )
  } catch (error) {
    console.error('Get public profile error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
