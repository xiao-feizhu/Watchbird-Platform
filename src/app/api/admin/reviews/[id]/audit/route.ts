import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { ReviewAuditStatus, UserRole } from '@prisma/client'

/**
 * PATCH: Admin audit a review
 * - Only ADMIN role can audit
 * - Update audit status to PASSED or REJECTED
 * - If PASSED, update guide's rating stats
 */
export async function PATCH(
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

    // Check admin role
    if (payload.role !== UserRole.ADMIN) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有管理员可以审核评价'),
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, remark } = body

    // Validate status
    if (!status || !['PASSED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '审核状态必须是 PASSED 或 REJECTED'),
        { status: 400 }
      )
    }

    // Fetch review
    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '评价不存在'),
        { status: 404 }
      )
    }

    // Only PENDING reviews can be audited
    if (review.auditStatus !== ReviewAuditStatus.PENDING) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '该评价已经审核过了'),
        { status: 400 }
      )
    }

    // Update review audit status
    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        auditStatus: status as ReviewAuditStatus,
        auditRemark: remark || null,
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

    // If approved, update guide's rating stats
    if (status === 'PASSED') {
      await updateGuideRating(review.revieweeId)
    }

    return NextResponse.json(
      createSuccessResponse({
        review: updatedReview,
        message: status === 'PASSED' ? '评价已通过审核' : '评价已驳回',
      })
    )
  } catch (error) {
    console.error('Audit review error:', error)
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
