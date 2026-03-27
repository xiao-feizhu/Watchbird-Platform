import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { UserRole, GuideStatus, OrderStatus, ReviewAuditStatus } from '@prisma/client'

/**
 * GET: Admin dashboard statistics
 * - Only ADMIN role can access
 * - Returns overview counts for dashboard
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

    const [
      totalUsers,
      totalGuides,
      pendingGuides,
      totalOrders,
      pendingPaymentOrders,
      pendingConfirmOrders,
      completedOrders,
      totalReviews,
      pendingReviews,
    ] = await Promise.all([
      // User stats
      prisma.user.count(),

      // Guide stats
      prisma.guideProfile.count(),
      prisma.guideProfile.count({ where: { status: GuideStatus.PENDING } }),

      // Order stats
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.PENDING_PAYMENT } }),
      prisma.order.count({ where: { status: OrderStatus.PENDING_CONFIRM } }),
      prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),

      // Review stats
      prisma.review.count(),
      prisma.review.count({ where: { auditStatus: ReviewAuditStatus.PENDING } }),
    ])

    // Calculate total revenue from completed orders
    const revenue = await prisma.order.aggregate({
      where: { status: OrderStatus.COMPLETED },
      _sum: { totalPrice: true },
    })

    return NextResponse.json(
      createSuccessResponse({
        users: {
          total: totalUsers,
        },
        guides: {
          total: totalGuides,
          pending: pendingGuides,
        },
        orders: {
          total: totalOrders,
          pendingPayment: pendingPaymentOrders,
          pendingConfirm: pendingConfirmOrders,
          completed: completedOrders,
        },
        reviews: {
          total: totalReviews,
          pending: pendingReviews,
        },
        revenue: revenue._sum.totalPrice || 0,
      })
    )
  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
