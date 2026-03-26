import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import {
  parseXml,
  verifyCallbackSignature,
  generateSuccessXml,
  generateFailXml,
} from '@/lib/payment'

/**
 * POST: Handle WeChat Pay async notification callback
 * - Verify signature
 * - Update order status to PENDING_CONFIRM on success
 * - Update payment status and paidAt timestamp
 * - Return success XML response
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw XML body
    const xmlBody = await request.text()

    if (!xmlBody) {
      return new NextResponse(generateFailXml('Empty body'), {
        status: 400,
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    // Parse XML to object
    const params = parseXml(xmlBody)

    // Check return code
    if (params.return_code !== 'SUCCESS') {
      console.error('WeChat callback return code not SUCCESS:', params.return_msg)
      return new NextResponse(generateFailXml(params.return_msg || 'Return code not SUCCESS'), {
        status: 400,
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    // Verify signature
    const signature = params.sign
    if (!signature) {
      console.error('WeChat callback missing signature')
      return new NextResponse(generateFailXml('Missing signature'), {
        status: 400,
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    // Remove sign from params for verification
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sign: _sign, ...paramsWithoutSign } = params
    const isValidSign = verifyCallbackSignature(paramsWithoutSign, signature)

    if (!isValidSign) {
      console.error('WeChat callback signature verification failed')
      return new NextResponse(generateFailXml('Invalid signature'), {
        status: 400,
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    // Check result code
    if (params.result_code !== 'SUCCESS') {
      console.error('WeChat callback result code not SUCCESS:', params.err_code, params.err_code_des)
      // Still return success to stop WeChat from retrying
      return new NextResponse(generateSuccessXml(), {
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    // Extract payment info
    const outTradeNo = params.out_trade_no
    const wechatOrderId = params.transaction_id
    const totalFeeCents = parseInt(params.total_fee) // Keep in cents to avoid precision loss
    const timeEnd = params.time_end // Format: yyyyMMddHHmmss
    const attach = params.attach // Contains order ID for verification

    if (!outTradeNo || !wechatOrderId) {
      console.error('WeChat callback missing required fields')
      return new NextResponse(generateFailXml('Missing required fields'), {
        status: 400,
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    // Find order by order number
    const order = await prisma.order.findUnique({
      where: { orderNo: outTradeNo },
      include: { payment: true },
    })

    if (!order) {
      console.error('WeChat callback order not found:', outTradeNo)
      return new NextResponse(generateFailXml('Order not found'), {
        status: 400,
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    // Verify amount matches (compare in cents to avoid floating point precision issues)
    const expectedAmountCents = Math.round(Number(order.totalPrice) * 100)
    if (totalFeeCents !== expectedAmountCents) {
      console.error('WeChat callback amount mismatch:', totalFeeCents, expectedAmountCents)
      return new NextResponse(generateFailXml('Amount mismatch'), {
        status: 400,
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    // Verify attach matches order ID
    if (attach && attach !== order.id) {
      console.error('WeChat callback attach mismatch:', attach, order.id)
      return new NextResponse(generateFailXml('Invalid attach'), {
        status: 400,
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    // Parse payment time
    let paidAt: Date | null = null
    if (timeEnd && timeEnd.length === 14) {
      const year = parseInt(timeEnd.substring(0, 4))
      const month = parseInt(timeEnd.substring(4, 6)) - 1
      const day = parseInt(timeEnd.substring(6, 8))
      const hour = parseInt(timeEnd.substring(8, 10))
      const minute = parseInt(timeEnd.substring(10, 12))
      const second = parseInt(timeEnd.substring(12, 14))
      paidAt = new Date(year, month, day, hour, minute, second)
    } else {
      paidAt = new Date()
    }

    // Update order and payment in a transaction
    await prisma.$transaction(async (tx) => {
      // Update order status to PENDING_CONFIRM
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PENDING_CONFIRM,
          paidAt,
        },
      })

      // Update payment record
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'SUCCESS',
            wechatOrderId,
            paidAt,
          },
        })
      } else {
        // Create payment record if not exists
        await tx.payment.create({
          data: {
            orderId: order.id,
            wechatOrderId,
            amount: order.totalPrice,
            status: 'SUCCESS',
            paidAt,
          },
        })
      }
    })

    console.log('WeChat callback processed successfully:', outTradeNo, wechatOrderId)

    // Return success XML response
    return new NextResponse(generateSuccessXml(), {
      headers: { 'Content-Type': 'application/xml' },
    })
  } catch (error) {
    console.error('WeChat callback error:', error)
    return new NextResponse(generateFailXml('Internal error'), {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}
