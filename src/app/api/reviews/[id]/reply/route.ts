import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

/**
 * POST: Reply to a review
 * - Only the reviewee can reply
 * - Can only reply once
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
    const { reply } = body

    // Validate reply content
    if (!reply || typeof reply !== 'string' || reply.trim().length < 1) {
      return NextResponse.json(
        createErrorResponse('INVALID_REPLY', '回复内容不能为空'),
        { status: 400 }
      )
    }

    if (reply.length > 300) {
      return NextResponse.json(
        createErrorResponse('INVALID_REPLY', '回复内容不能超过300个字符'),
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

    // Only reviewee can reply
    if (review.revieweeId !== payload.userId) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有被评价者可以回复'),
        { status: 403 }
      )
    }

    // Check if already replied
    if (review.reply) {
      return NextResponse.json(
        createErrorResponse('ALREADY_REPLIED', '您已经回复过该评价'),
        { status: 400 }
      )
    }

    // Update review with reply
    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        reply: reply.trim(),
        repliedAt: new Date(),
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

    return NextResponse.json(createSuccessResponse({ review: updatedReview }))
  } catch (error) {
    console.error('Reply to review error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
