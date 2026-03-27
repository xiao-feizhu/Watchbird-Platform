import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

// Protected fields that cannot be updated via PATCH
const PROTECTED_FIELDS = [
  'id',
  'userId',
  'status',
  'level',
  'commissionRate',
  'totalOrders',
  'completedOrders',
  'rating',
  'reviewCount',
  'createdAt',
  'updatedAt',
]

// Shared include block for guide profile queries
const PROFILE_INCLUDE = {
  user: {
    select: {
      id: true,
      phone: true,
      nickname: true,
      avatar: true,
      role: true,
    },
  },
  services: {
    select: {
      id: true,
      title: true,
      description: true,
      region: true,
      duration: true,
      maxPeople: true,
      price: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
}

/**
 * Verify JWT token and return payload
 */
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

/**
 * GET: Fetch guide profile with user info and services
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request)
    if (!payload) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '未授权，请先登录'),
        { status: 401 }
      )
    }

    const guideProfile = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
      include: PROFILE_INCLUDE,
    })

    if (!guideProfile) {
      return NextResponse.json(
        createErrorResponse('PROFILE_NOT_FOUND', '鸟导资料不存在'),
        { status: 404 }
      )
    }

    return NextResponse.json(createSuccessResponse({ guideProfile }))
  } catch (error) {
    console.error('Get guide profile error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * PATCH: Update guide profile (excluding protected fields)
 */
export async function PATCH(request: NextRequest) {
  try {
    const payload = await verifyAuth(request)
    if (!payload) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '未授权，请先登录'),
        { status: 401 }
      )
    }

    const body = await request.json()

    // Check if any protected fields are being modified
    const attemptedProtectedFields = Object.keys(body).filter((key) =>
      PROTECTED_FIELDS.includes(key)
    )

    if (attemptedProtectedFields.length > 0) {
      return NextResponse.json(
        createErrorResponse(
          'PROTECTED_FIELD',
          `以下字段不允许修改: ${attemptedProtectedFields.join(', ')}`
        ),
        { status: 403 }
      )
    }

    // Check if guide profile exists
    const existingProfile = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    if (!existingProfile) {
      return NextResponse.json(
        createErrorResponse('PROFILE_NOT_FOUND', '鸟导资料不存在'),
        { status: 404 }
      )
    }

    // Map camelCase field names to database field names
    const fieldMapping: Record<string, string> = {
      realName: 'realName',
      idCard: 'idCard',
      bio: 'bio',
      regions: 'regions',
      languages: 'languages',
      contactPhone: 'contactPhone',
      contactWechat: 'contactWechat',
      contactEmail: 'contactEmail',
      certificates: 'certificates',
    }

    const updateData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      const dbField = fieldMapping[key]
      if (dbField) {
        updateData[dbField] = value
      }
    }

    // Update guide profile
    const updatedProfile = await prisma.guideProfile.update({
      where: { userId: payload.userId },
      data: updateData,
      include: PROFILE_INCLUDE,
    })

    return NextResponse.json(
      createSuccessResponse({ guideProfile: updatedProfile })
    )
  } catch (error) {
    console.error('Update guide profile error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
