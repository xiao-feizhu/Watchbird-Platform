import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { ReviewAuditStatus, UserRole } from '@prisma/client'

/**
 * GET: List reviews for admin audit
 * - Only ADMIN role can access
 * - Filter by audit status (default: PENDING)
 * - Includes pagination
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

    // Check admin role
    if (payload.role !== UserRole.ADMIN) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有管理员可以访问'),
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Validate status filter
    const validStatuses = ['PENDING', 'PASSED', 'REJECTED']
    const auditStatus = validStatuses.includes(status) ? status as ReviewAuditStatus : ReviewAuditStatus.PENDING

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { auditStatus },
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
          order: {
            select: {
              id: true,
              orderNo: true,
              totalPrice: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { auditStatus } }),
    ])

    return NextResponse.json(
      createSuccessResponse({
        reviews,
        meta: { page, limit, total },
      })
    )
  } catch (error) {
    console.error('Get reviews for audit error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
