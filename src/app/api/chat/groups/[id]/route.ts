'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

/**
 * GET: Get chat group info
 * Requires authentication - members only (organizer or approved participant)
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

    // Get chat group with trip and participants info
    const chatGroup = await prisma.chatGroup.findUnique({
      where: { id },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            endDate: true,
            organizerId: true,
            organizer: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
            participants: {
              where: {
                status: 'APPROVED',
              },
              select: {
                userId: true,
                user: {
                  select: {
                    id: true,
                    nickname: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
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
        createErrorResponse('FORBIDDEN', '只有成员可以访问群聊'),
        { status: 403 }
      )
    }

    const formattedGroup = {
      id: chatGroup.id,
      name: chatGroup.name,
      status: chatGroup.status,
      createdAt: chatGroup.createdAt.toISOString(),
      updatedAt: chatGroup.updatedAt.toISOString(),
      trip: {
        id: chatGroup.trip.id,
        title: chatGroup.trip.title,
        destination: chatGroup.trip.destination,
        startDate: chatGroup.trip.startDate.toISOString(),
        endDate: chatGroup.trip.endDate?.toISOString(),
        organizer: {
          id: chatGroup.trip.organizer.id,
          nickname: chatGroup.trip.organizer.nickname || '未知用户',
          avatar: chatGroup.trip.organizer.avatar,
        },
      },
      members: [
        {
          id: chatGroup.trip.organizer.id,
          nickname: chatGroup.trip.organizer.nickname || '未知用户',
          avatar: chatGroup.trip.organizer.avatar,
          role: 'ORGANIZER',
        },
        ...chatGroup.trip.participants.map((p) => ({
          id: p.user.id,
          nickname: p.user.nickname || '未知用户',
          avatar: p.user.avatar,
          role: 'MEMBER' as const,
        })),
      ],
      messageCount: chatGroup._count.messages,
    }

    return NextResponse.json(createSuccessResponse({ group: formattedGroup }))
  } catch (error) {
    console.error('Get chat group error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
