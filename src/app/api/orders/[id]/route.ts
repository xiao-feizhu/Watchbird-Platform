import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

/**
 * GET: Fetch order details with product and guide info
 * Authorization: User can only access their own orders, guide can access orders for their services
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
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            region: true,
            duration: true,
            maxPeople: true,
            price: true,
            priceType: true,
            includes: true,
            excludes: true,
            images: true,
          },
        },
        guide: {
          include: {
            user: {
              select: {
                nickname: true,
                avatar: true,
                phone: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            phone: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            paidAt: true,
            wechatOrderId: true,
          },
        },
        reviews: {
          select: {
            id: true,
            reviewerId: true,
            rating: true,
            content: true,
            createdAt: true,
          },
        },
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
        createErrorResponse('FORBIDDEN', '无权访问该订单'),
        { status: 403 }
      )
    }

    return NextResponse.json(createSuccessResponse({ order }))
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * PATCH: Handle order status update
 * NOTE: This endpoint is deprecated. Use POST /api/orders/[id]/actions instead.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect to actions endpoint
  return NextResponse.json(
    createErrorResponse('DEPRECATED', '请使用 POST /api/orders/[id]/actions'),
    { status: 307, headers: { 'Location': `/api/orders/${params.id}/actions` } }
  )
}
