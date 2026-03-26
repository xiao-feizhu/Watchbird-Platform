import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { ServiceStatus } from '@prisma/client'

/**
 * Verify JWT token and return payload
 */
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

/**
 * GET: Fetch service product details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.serviceProduct.findUnique({
      where: { id: params.id },
      include: {
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

    if (!service) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '服务不存在'),
        { status: 404 }
      )
    }

    return NextResponse.json(createSuccessResponse({ service }))
  } catch (error) {
    console.error('Get service error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * PATCH: Update service product
 */
export async function PATCH(
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

    // Verify ownership
    const guide = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    const service = await prisma.serviceProduct.findUnique({
      where: { id: params.id },
    })

    if (!service || service.guideId !== guide?.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '无权操作'),
        { status: 403 }
      )
    }

    const updateData = await request.json()

    // Remove protected fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, guideId: _guideId, createdAt: _createdAt, updatedAt: _updatedAt, ...safeUpdateData } = updateData

    const updated = await prisma.serviceProduct.update({
      where: { id: params.id },
      data: safeUpdateData,
    })

    return NextResponse.json(createSuccessResponse({ service: updated }))
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}

/**
 * DELETE: Soft delete service product (set status to PAUSED)
 */
export async function DELETE(
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

    const guide = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    const service = await prisma.serviceProduct.findUnique({
      where: { id: params.id },
    })

    if (!service || service.guideId !== guide?.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '无权操作'),
        { status: 403 }
      )
    }

    // Soft delete: set status to PAUSED
    await prisma.serviceProduct.update({
      where: { id: params.id },
      data: { status: ServiceStatus.PAUSED },
    })

    return NextResponse.json(
      createSuccessResponse({ message: '服务已下架' })
    )
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
