'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { sendMessageSchema } from '@/lib/validations/chat'
import { ChatGroupStatus, MessageType } from '@prisma/client'

const MESSAGES_PER_PAGE = 20

/**
 * GET: List messages with cursor-based pagination
 * Requires authentication - members only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '请先登录'),
        { status: 401 }
      )
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')

    // Get chat group with trip info to verify membership
    const chatGroup = await prisma.chatGroup.findUnique({
      where: { id },
      include: {
        trip: {
          select: {
            organizerId: true,
            participants: {
              where: {
                status: 'APPROVED',
              },
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!chatGroup) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '群聊不存在'),
        { status: 404 }
      )
    }

    // Check if user is organizer or approved participant
    const isOrganizer = chatGroup.trip.organizerId === auth.userId
    const isApprovedParticipant = chatGroup.trip.participants.some(
      (p) => p.userId === auth.userId
    )

    if (!isOrganizer && !isApprovedParticipant) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有成员可以查看消息'),
        { status: 403 }
      )
    }

    // Build query with cursor pagination
    const query: {
      where: { groupId: string }
      take: number
      orderBy: { createdAt: 'asc' }
      cursor?: { id: string }
      skip?: number
      include: {
        sender: {
          select: {
            id: true
            nickname: true
            avatar: true
          }
        }
      }
    } = {
      where: { groupId: id },
      take: MESSAGES_PER_PAGE,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    }

    if (cursor) {
      query.cursor = { id: cursor }
      query.skip = 1 // Skip the cursor item
    }

    const messages = await prisma.chatMessage.findMany(query)

    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      messageType: message.messageType,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id,
        nickname: message.sender.nickname || '未知用户',
        avatar: message.sender.avatar,
      },
    }))

    // Get next cursor
    const nextCursor =
      messages.length === MESSAGES_PER_PAGE
        ? messages[messages.length - 1].id
        : null

    return NextResponse.json(
      createSuccessResponse({
        messages: formattedMessages,
        nextCursor,
      })
    )
  } catch (error) {
    console.error('List messages error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * POST: Send a message
 * Requires authentication - members only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '请先登录'),
        { status: 401 }
      )
    }

    const { id } = await params

    // Get chat group with trip info to verify membership
    const chatGroup = await prisma.chatGroup.findUnique({
      where: { id },
      include: {
        trip: {
          select: {
            organizerId: true,
            participants: {
              where: {
                status: 'APPROVED',
              },
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!chatGroup) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '群聊不存在'),
        { status: 404 }
      )
    }

    // Check if user is organizer or approved participant
    const isOrganizer = chatGroup.trip.organizerId === auth.userId
    const isApprovedParticipant = chatGroup.trip.participants.some(
      (p) => p.userId === auth.userId
    )

    if (!isOrganizer && !isApprovedParticipant) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有成员可以发送消息'),
        { status: 403 }
      )
    }

    // Check if group is active (not disabled)
    if (chatGroup.status === ChatGroupStatus.DISABLED) {
      return NextResponse.json(
        createErrorResponse('GROUP_DISABLED', '群聊已禁言'),
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validation = sendMessageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', '请求参数错误'),
        { status: 400 }
      )
    }

    const { content, messageType } = validation.data

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        groupId: id,
        senderId: auth.userId,
        content,
        messageType: messageType as MessageType,
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    })

    const formattedMessage = {
      id: message.id,
      content: message.content,
      messageType: message.messageType,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id,
        nickname: message.sender.nickname || '未知用户',
        avatar: message.sender.avatar,
      },
    }

    return NextResponse.json(
      createSuccessResponse({ message: formattedMessage }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
