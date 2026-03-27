'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { GuideStatus } from '@prisma/client'

/**
 * GET: Fetch a single guide by ID (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const guide = await prisma.guideProfile.findUnique({
      where: {
        id,
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
    })

    if (!guide) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '鸟导不存在'),
        { status: 404 }
      )
    }

    // Transform the data for the response
    const formattedGuide = {
      id: guide.id,
      user: {
        nickname: guide.user.nickname || '未知用户',
        avatar: guide.user.avatar,
      },
      level: guide.level,
      regions: guide.regions,
      languages: guide.languages,
      rating: Number(guide.rating),
      reviewCount: guide.reviewCount,
      bio: guide.bio,
      totalOrders: guide.totalOrders,
      completedOrders: guide.completedOrders,
      createdAt: guide.createdAt.toISOString(),
    }

    return NextResponse.json(createSuccessResponse({ guide: formattedGuide }))
  } catch (error) {
    console.error('Get guide error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
