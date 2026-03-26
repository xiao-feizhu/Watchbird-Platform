import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { OrderStatus } from '@prisma/client'

/**
 * POST: Handle specific order actions
 * Actions: confirm, reject, start, complete, cancel
 * Updates status timestamps (confirmedAt, completedAt, cancelledAt)
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
    const { action, ...data } = body

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        createErrorResponse('INVALID_ACTION', '操作类型不能为空'),
        { status: 400 }
      )
    }

    // Fetch order with guide info
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        guide: true,
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
        createErrorResponse('FORBIDDEN', '无权操作该订单'),
        { status: 403 }
      )
    }

    let updatedOrder
    const now = new Date()

    switch (action) {
      case 'confirm': {
        // Only guide can confirm when status is PENDING_CONFIRM
        if (!isGuide) {
          return NextResponse.json(
            createErrorResponse('FORBIDDEN', '只有鸟导可以确认订单'),
            { status: 403 }
          )
        }
        if (order.status !== OrderStatus.PENDING_CONFIRM) {
          return NextResponse.json(
            createErrorResponse('INVALID_STATUS', '订单状态不允许确认'),
            { status: 400 }
          )
        }
        updatedOrder = await prisma.order.update({
          where: { id: params.id },
          data: {
            status: OrderStatus.CONFIRMED,
            confirmedAt: now,
          },
        })
        break
      }

      case 'reject': {
        // Only guide can reject when status is PENDING_CONFIRM
        if (!isGuide) {
          return NextResponse.json(
            createErrorResponse('FORBIDDEN', '只有鸟导可以拒绝订单'),
            { status: 403 }
          )
        }
        if (order.status !== OrderStatus.PENDING_CONFIRM) {
          return NextResponse.json(
            createErrorResponse('INVALID_STATUS', '订单状态不允许拒绝'),
            { status: 400 }
          )
        }
        updatedOrder = await prisma.order.update({
          where: { id: params.id },
          data: {
            status: OrderStatus.CANCELLED,
            cancelledAt: now,
            guideRemark: data.reason || '鸟导拒绝了该订单',
          },
        })
        break
      }

      case 'start': {
        // Either party can mark service as started when CONFIRMED
        if (order.status !== OrderStatus.CONFIRMED) {
          return NextResponse.json(
            createErrorResponse('INVALID_STATUS', '订单状态不允许开始服务'),
            { status: 400 }
          )
        }
        // Check if service date is today or in the past
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const serviceDate = new Date(order.serviceDate)
        serviceDate.setHours(0, 0, 0, 0)
        if (serviceDate > today) {
          return NextResponse.json(
            createErrorResponse('TOO_EARLY', '服务日期未到'),
            { status: 400 }
          )
        }
        updatedOrder = await prisma.order.update({
          where: { id: params.id },
          data: {
            status: OrderStatus.IN_SERVICE,
          },
        })
        break
      }

      case 'complete': {
        // Either party can mark service as completed when IN_SERVICE
        if (order.status !== OrderStatus.IN_SERVICE) {
          return NextResponse.json(
            createErrorResponse('INVALID_STATUS', '订单状态不允许完成服务'),
            { status: 400 }
          )
        }
        updatedOrder = await prisma.order.update({
          where: { id: params.id },
          data: {
            status: OrderStatus.PENDING_REVIEW,
            completedAt: now,
          },
        })
        break
      }

      case 'cancel': {
        // Only order owner can cancel before payment
        // Either party can cancel before service starts (CONFIRMED status)
        if (order.status === OrderStatus.PENDING_PAYMENT) {
          if (!isOrderOwner) {
            return NextResponse.json(
              createErrorResponse('FORBIDDEN', '只有订单创建者可以取消未支付订单'),
              { status: 403 }
            )
          }
        } else if (order.status === OrderStatus.PENDING_CONFIRM || order.status === OrderStatus.CONFIRMED) {
          // Both can cancel
        } else {
          return NextResponse.json(
            createErrorResponse('INVALID_STATUS', '订单状态不允许取消'),
            { status: 400 }
          )
        }
        updatedOrder = await prisma.order.update({
          where: { id: params.id },
          data: {
            status: OrderStatus.CANCELLED,
            cancelledAt: now,
            guideRemark: data.reason || null,
          },
        })
        break
      }

      default:
        return NextResponse.json(
          createErrorResponse('INVALID_ACTION', '未知的操作类型'),
          { status: 400 }
        )
    }

    return NextResponse.json(createSuccessResponse({ order: updatedOrder }))
  } catch (error) {
    console.error('Order action error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
