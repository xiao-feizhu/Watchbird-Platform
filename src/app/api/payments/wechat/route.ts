import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { OrderStatus } from '@prisma/client'
import {
  unifiedOrder,
  generatePaymentParams,
  generateNonceStr,
} from '@/lib/payment'

/**
 * GET: Query payment status
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

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        createErrorResponse('INVALID_ORDER', '订单ID不能为空'),
        { status: 400 }
      )
    }

    // Fetch order to verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        guide: true,
        payment: true,
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

    return NextResponse.json(
      createSuccessResponse({
        orderId: order.id,
        orderNo: order.orderNo,
        status: order.status,
        payment: order.payment,
      })
    )
  } catch (error) {
    console.error('Get payment status error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * POST: Create WeChat Pay unified order
 * - Check order status is PENDING_PAYMENT
 * - Generate prepay_id via WeChat Pay API
 * - Create Payment record
 * - Return payment params for JSAPI
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request)
    if (!payload) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '未授权，请先登录'),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        createErrorResponse('INVALID_ORDER', '订单ID不能为空'),
        { status: 400 }
      )
    }

    // Fetch order with user info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        product: true,
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '订单不存在'),
        { status: 404 }
      )
    }

    // Verify order ownership
    if (order.userId !== payload.userId) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '无权操作该订单'),
        { status: 403 }
      )
    }

    // Check order status is PENDING_PAYMENT
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '订单状态不允许支付'),
        { status: 400 }
      )
    }

    // Check if payment already exists and is pending
    if (order.payment && order.payment.status === 'PENDING') {
      // Return existing payment params
      const nonceStr = generateNonceStr()
      const paymentParams = generatePaymentParams(order.payment.prepayId || '', nonceStr)
      return NextResponse.json(
        createSuccessResponse({
          orderId: order.id,
          orderNo: order.orderNo,
          paymentParams,
        })
      )
    }

    // Check if already paid
    if (order.payment && order.payment.status === 'SUCCESS') {
      return NextResponse.json(
        createErrorResponse('ALREADY_PAID', '订单已支付'),
        { status: 400 }
      )
    }

    // Get user's WeChat openid
    const openid = order.user.wechatOpenId
    if (!openid) {
      return NextResponse.json(
        createErrorResponse('NO_OPENID', '用户未绑定微信'),
        { status: 400 }
      )
    }

    // Calculate total fee in cents (WeChat Pay uses cents)
    const totalFee = Math.round(Number(order.totalPrice) * 100)

    // Build notify URL
    const notifyUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/payments/callback`

    // Call WeChat Pay unified order API
    const wechatResult = await unifiedOrder({
      body: order.product.title,
      outTradeNo: order.orderNo,
      totalFee,
      spbillCreateIp: '127.0.0.1', // In production, get from request
      notifyUrl,
      openid,
      attach: order.id, // Attach order ID for callback reference
    })

    if (wechatResult.returnCode !== 'SUCCESS' || wechatResult.resultCode !== 'SUCCESS') {
      console.error('WeChat unified order failed:', wechatResult)
      return NextResponse.json(
        createErrorResponse(
          'PAYMENT_FAILED',
          wechatResult.errCodeDes || wechatResult.returnMsg || '创建支付订单失败'
        ),
        { status: 500 }
      )
    }

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        wechatOrderId: wechatResult.wechatOrderId || null,
        prepayId: wechatResult.prepayId || null,
        amount: order.totalPrice,
        status: 'PENDING',
      },
      update: {
        wechatOrderId: wechatResult.wechatOrderId || null,
        prepayId: wechatResult.prepayId || null,
        status: 'PENDING',
      },
    })

    // Generate payment params for frontend
    const nonceStr = generateNonceStr()
    const paymentParams = generatePaymentParams(wechatResult.prepayId || '', nonceStr)

    return NextResponse.json(
      createSuccessResponse({
        orderId: order.id,
        orderNo: order.orderNo,
        paymentId: payment.id,
        paymentParams,
      })
    )
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
