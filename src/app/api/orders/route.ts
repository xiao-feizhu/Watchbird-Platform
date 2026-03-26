import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { OrderStatus, ServiceStatus, GuideStatus } from '@prisma/client'
import { generateOrderNo } from '@/lib/payment'

/**
 * GET: List user's orders (as buyer) with pagination
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
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: Record<string, unknown> = { userId: payload.userId }
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              region: true,
              duration: true,
              images: true,
            },
          },
          guide: {
            include: {
              user: {
                select: {
                  nickname: true,
                  avatar: true,
                },
              },
            },
          },
          payment: {
            select: {
              status: true,
              paidAt: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json(
      createSuccessResponse({
        orders,
        meta: { page, limit, total },
      })
    )
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * POST: Create new order from service product
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
    const { productId, serviceDate, peopleCount, userRemark } = body

    // Validate required fields
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        createErrorResponse('INVALID_PRODUCT', '服务产品ID不能为空'),
        { status: 400 }
      )
    }

    if (!serviceDate) {
      return NextResponse.json(
        createErrorResponse('INVALID_DATE', '服务日期不能为空'),
        { status: 400 }
      )
    }

    const parsedPeopleCount = parseInt(peopleCount)
    if (!parsedPeopleCount || parsedPeopleCount < 1) {
      return NextResponse.json(
        createErrorResponse('INVALID_PEOPLE_COUNT', '人数必须大于0'),
        { status: 400 }
      )
    }

    // Fetch product with guide info
    const product = await prisma.serviceProduct.findUnique({
      where: { id: productId },
      include: {
        guide: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '服务产品不存在'),
        { status: 404 }
      )
    }

    // Validate service is ACTIVE
    if (product.status !== ServiceStatus.ACTIVE) {
      return NextResponse.json(
        createErrorResponse('SERVICE_UNAVAILABLE', '服务产品未上架'),
        { status: 400 }
      )
    }

    // Validate guide is APPROVED
    if (product.guide.status !== GuideStatus.APPROVED) {
      return NextResponse.json(
        createErrorResponse('GUIDE_NOT_APPROVED', '鸟导未通过审核'),
        { status: 400 }
      )
    }

    // Validate people count doesn't exceed max
    if (parsedPeopleCount > product.maxPeople) {
      return NextResponse.json(
        createErrorResponse('EXCEED_MAX_PEOPLE', `人数不能超过${product.maxPeople}人`),
        { status: 400 }
      )
    }

    // Validate service date is in the future
    const serviceDateObj = new Date(serviceDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (serviceDateObj < now) {
      return NextResponse.json(
        createErrorResponse('INVALID_DATE', '服务日期必须在未来'),
        { status: 400 }
      )
    }

    // Validate priceType
    if (!['per_person', 'per_group'].includes(product.priceType)) {
      return NextResponse.json(
        createErrorResponse('INVALID_PRICE_TYPE', '无效的计价方式'),
        { status: 400 }
      )
    }

    // Calculate total price
    const price = Number(product.price)
    const totalPrice = product.priceType === 'per_person'
      ? price * parsedPeopleCount
      : price

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        userId: payload.userId,
        guideId: product.guideId,
        productId: product.id,
        type: product.type,
        serviceDate: serviceDateObj,
        peopleCount: parsedPeopleCount,
        totalPrice,
        status: OrderStatus.PENDING_PAYMENT,
        userRemark: userRemark || null,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            region: true,
            duration: true,
            images: true,
          },
        },
        guide: {
          include: {
            user: {
              select: {
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      createSuccessResponse({ order }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
