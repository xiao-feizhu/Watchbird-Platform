import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { z } from 'zod'

const querySchema = z.object({
  unreadOnly: z.coerce.boolean().default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const markReadSchema = z.object({
  markAll: z.boolean().optional(),
  ids: z.array(z.string().uuid()).optional(),
})

/**
 * GET: List notifications for current user
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '请先登录'),
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    const queryValidation = querySchema.safeParse({
      unreadOnly: searchParams.get('unreadOnly') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请求参数错误'),
        { status: 400 }
      )
    }

    const { unreadOnly, page, limit } = queryValidation.data

    const where: {
      userId: string
      isRead?: boolean
    } = {
      userId: auth.userId,
    }

    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: auth.userId,
          isRead: false,
        },
      }),
    ])

    const formattedNotifications = notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    }))

    return NextResponse.json(
      createSuccessResponse({
        notifications: formattedNotifications,
        unreadCount,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    )
  } catch (error) {
    console.error('List notifications error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * PUT: Mark notifications as read
 * Requires authentication
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '请先登录'),
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = markReadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请求参数错误'),
        { status: 400 }
      )
    }

    const { markAll, ids } = validation.data

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          userId: auth.userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })

      return NextResponse.json(
        createSuccessResponse({
          markedCount: await prisma.notification.count({
            where: {
              userId: auth.userId,
              isRead: true,
            },
          }),
        })
      )
    }

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请提供通知ID列表'),
        { status: 400 }
      )
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: ids,
        },
        userId: auth.userId,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json(
      createSuccessResponse({
        markedCount: result.count,
      })
    )
  } catch (error) {
    console.error('Mark notifications read error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
