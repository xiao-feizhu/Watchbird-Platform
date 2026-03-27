import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { GuideStatus } from '@prisma/client'

/**
 * GET: Fetch approved guides list (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')
    const page = parseInt(searchParams.get('page') || '1')

    const [guides, total] = await Promise.all([
      prisma.guideProfile.findMany({
        where: {
          status: GuideStatus.APPROVED,
        },
        include: {
          user: {
            select: {
              nickname: true,
              avatar: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { completedOrders: 'desc' },
        ],
      }),
      prisma.guideProfile.count({
        where: {
          status: GuideStatus.APPROVED,
        },
      }),
    ])

    // Transform the data for the response
    const formattedGuides = guides.map((guide) => ({
      id: guide.id,
      user: {
        nickname: guide.user.nickname || '未知用户',
        avatar: guide.user.avatar,
      },
      level: guide.level,
      regions: guide.regions,
      rating: Number(guide.rating),
      reviewCount: guide.reviewCount,
      bio: guide.bio,
      totalOrders: guide.totalOrders,
      completedOrders: guide.completedOrders,
    }))

    return NextResponse.json(
      createSuccessResponse({
        guides: formattedGuides,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    )
  } catch (error) {
    console.error('Get guides error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
