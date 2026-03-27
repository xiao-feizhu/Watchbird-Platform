'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { ReviewAuditStatus } from '@prisma/client'

/**
 * GET: Fetch reviews for a specific user (public endpoint)
 * Query params: revieweeId, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const revieweeId = searchParams.get('revieweeId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!revieweeId) {
      return NextResponse.json(
        createErrorResponse('MISSING_PARAM', '缺少revieweeId参数'),
        { status: 400 }
      )
    }

    // Calculate rating distribution
    const allReviews = await prisma.review.findMany({
      where: {
        revieweeId,
        auditStatus: ReviewAuditStatus.PASSED,
      },
      select: {
        rating: true,
      },
    })

    const totalReviews = allReviews.length
    const averageRating =
      totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

    // Calculate distribution by star
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: allReviews.filter((r) => r.rating === star).length,
    }))

    // Fetch paginated reviews with reviewer info
    const reviews = await prisma.review.findMany({
      where: {
        revieweeId,
        auditStatus: ReviewAuditStatus.PASSED,
      },
      include: {
        reviewer: {
          select: {
            nickname: true,
            avatar: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    // Format reviews
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      reviewer: {
        nickname: review.reviewer.nickname || '匿名用户',
        avatar: review.reviewer.avatar,
      },
      rating: review.rating,
      content: review.content,
      tags: review.tags,
      images: review.images,
      reply: review.reply,
      repliedAt: review.repliedAt,
      createdAt: review.createdAt.toISOString(),
    }))

    return NextResponse.json(
      createSuccessResponse({
        reviews: formattedReviews,
        summary: {
          averageRating: Number(averageRating.toFixed(1)),
          totalReviews,
          distribution,
        },
        meta: {
          page,
          limit,
          total: totalReviews,
          totalPages: Math.ceil(totalReviews / limit),
        },
      })
    )
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
