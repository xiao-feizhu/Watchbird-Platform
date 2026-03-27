import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { OrderStatus, ReviewAuditStatus } from '@prisma/client'

/**
 * GET: List reviews for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyAuth(request)
    if (!payload) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '未授权，请先登录'),
        { status: 401 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        guide: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
            reviewee: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '订单不存在'),
        { status: 404 }
      )
    }

    // Check authorization - only order participants can view reviews
    const isOrderOwner = order.userId === payload.userId
    const isGuide = order.guide.userId === payload.userId

    if (!isOrderOwner && !isGuide) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '无权访问该订单的评价'),
        { status: 403 }
      )
    }

    return NextResponse.json(createSuccessResponse({ reviews: order.reviews }))
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * POST: Create a review for an order
 * - Only allowed when order status is PENDING_REVIEW or COMPLETED
 * - Each party can only review once
 * - Rating 1-3 triggers audit (PENDING status)
 * - Rating 4-5 is auto-approved (PASSED status)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyAuth(request)
    if (!payload) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '未授权，请先登录'),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { rating, content, tags, images } = body

    // Validate rating
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        createErrorResponse('INVALID_RATING', '评分必须是1-5之间的数字'),
        { status: 400 }
      )
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length < 5) {
      return NextResponse.json(
        createErrorResponse('INVALID_CONTENT', '评价内容至少需要5个字符'),
        { status: 400 }
      )
    }

    if (content.length > 500) {
      return NextResponse.json(
        createErrorResponse('INVALID_CONTENT', '评价内容不能超过500个字符'),
        { status: 400 }
      )
    }

    // Fetch order with guide info
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        guide: true,
        reviews: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '订单不存在'),
        { status: 404 }
      )
    }

    // Check authorization
    const isOrderOwner = order.userId === payload.userId
    const isGuide = order.guide.userId === payload.userId

    if (!isOrderOwner && !isGuide) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '无权评价该订单'),
        { status: 403 }
      )
    }

    // Check order status allows review
    if (order.status !== OrderStatus.PENDING_REVIEW && order.status !== OrderStatus.COMPLETED) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '订单状态不允许评价'),
        { status: 400 }
      )
    }

    // Determine reviewer and reviewee
    const reviewerId = payload.userId
    const revieweeId = isOrderOwner ? order.guide.userId : order.userId

    // Check if already reviewed
    const existingReview = order.reviews.find(
      (r) => r.reviewerId === reviewerId
    )
    if (existingReview) {
      return NextResponse.json(
        createErrorResponse('ALREADY_REVIEWED', '您已经评价过该订单'),
        { status: 400 }
      )
    }

    // Determine audit status based on rating
    // Ratings <= 3 require manual audit, ratings 4-5 are auto-approved
    const auditStatus = rating <= 3 ? ReviewAuditStatus.PENDING : ReviewAuditStatus.PASSED

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        reviewerId,
        revieweeId,
        rating,
        content: content.trim(),
        tags: tags || [],
        images: images || [],
        auditStatus,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    })

    // If auto-approved (rating 4-5), update guide's rating stats
    if (auditStatus === ReviewAuditStatus.PASSED) {
      await updateGuideRating(revieweeId)
    }

    // Update order status to COMPLETED if both parties have reviewed
    const allReviews = await prisma.review.findMany({
      where: { orderId: order.id },
    })
    if (allReviews.length >= 2 && order.status === OrderStatus.PENDING_REVIEW) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.COMPLETED },
      })
    }

    return NextResponse.json(
      createSuccessResponse({
        review,
        message: rating <= 3 ? '评价已提交，等待审核' : '评价已提交',
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * Update guide's rating statistics
 * Recalculates average rating and review count
 */
async function updateGuideRating(guideUserId: string): Promise<void> {
  const guide = await prisma.guideProfile.findUnique({
    where: { userId: guideUserId },
  })

  if (!guide) return

  // Get all approved reviews for this guide
  const reviews = await prisma.review.findMany({
    where: {
      revieweeId: guideUserId,
      auditStatus: ReviewAuditStatus.PASSED,
    },
  })

  const reviewCount = reviews.length
  const averageRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 5.0

  await prisma.guideProfile.update({
    where: { userId: guideUserId },
    data: {
      rating: averageRating,
      reviewCount,
    },
  })
}
