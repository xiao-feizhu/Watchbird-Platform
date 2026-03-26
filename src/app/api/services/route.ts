import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { GuideStatus } from '@prisma/client'

/**
 * GET: Fetch service products list
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guideId = searchParams.get('guideId')
    const region = searchParams.get('region')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = { status: 'ACTIVE' }
    if (guideId) where.guideId = guideId
    if (region) where.region = { contains: region }

    const [services, total] = await Promise.all([
      prisma.serviceProduct.findMany({
        where,
        include: {
          guide: {
            include: {
              user: {
                select: {
                  nickname: true,
                  avatar: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.serviceProduct.count({ where }),
    ])

    return NextResponse.json(
      createSuccessResponse({
        services,
        meta: { page, limit, total },
      })
    )
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * POST: Create a new service product
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request)
    if (!payload) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '未授权，请先登录'),
        { status: 401 }
      )
    }

    // Get guide profile
    const guide = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    if (!guide || guide.status !== GuideStatus.APPROVED) {
      return NextResponse.json(
        createErrorResponse('NOT_APPROVED', '鸟导未通过审核'),
        { status: 403 }
      )
    }

    const serviceData = await request.json()

    const service = await prisma.serviceProduct.create({
      data: {
        ...serviceData,
        guideId: guide.id,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json(
      createSuccessResponse({ service }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
