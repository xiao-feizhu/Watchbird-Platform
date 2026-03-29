import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { updateUserProfileSchema } from '@/lib/validations/user-profile'

/**
 * GET: Fetch current user's profile
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

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        role: true,
        userProfile: true,
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
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        profile: user.userProfile,
      })
    )
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * PUT: Update current user's profile
 * Requires authentication
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '请先登录'),
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = updateUserProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请求参数错误'),
        { status: 400 }
      )
    }

    const data = validation.data

    // Upsert user profile - create if not exists, update if exists
    const profile = await prisma.userProfile.upsert({
      where: { userId: auth.userId },
      create: {
        userId: auth.userId,
        age: data.age,
        gender: data.gender,
        region: data.region,
        bio: data.bio,
        birdingYears: data.birdingYears ?? 0,
        expertBirds: data.expertBirds ?? [],
        equipment: data.equipment,
        canDrive: data.canDrive ?? false,
        carCapacity: data.carCapacity ?? 0,
      },
      update: {
        age: data.age,
        gender: data.gender,
        region: data.region,
        bio: data.bio,
        birdingYears: data.birdingYears,
        expertBirds: data.expertBirds,
        equipment: data.equipment,
        canDrive: data.canDrive,
        carCapacity: data.carCapacity,
      },
    })

    return NextResponse.json(createSuccessResponse(profile))
  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
