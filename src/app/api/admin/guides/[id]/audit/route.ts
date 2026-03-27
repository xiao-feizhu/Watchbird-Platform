import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { GuideLevel, GuideStatus, UserRole } from '@prisma/client'

/**
 * PATCH: Admin approve or reject guide application
 * - Only ADMIN role can access
 * - Can set status to APPROVED or REJECTED
 * - When approved, can set guide level (default: BASIC)
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

    // Check admin role
    if (payload.role !== UserRole.ADMIN) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', '只有管理员可以审核鸟导'),
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, level } = body

    // Validate status
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '审核状态必须是 APPROVED 或 REJECTED'),
        { status: 400 }
      )
    }

    // Fetch guide profile
    const guide = await prisma.guideProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            phone: true,
          },
        },
      },
    })

    if (!guide) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '鸟导不存在'),
        { status: 404 }
      )
    }

    // Only PENDING or REJECTED guides can be approved
    // Only PENDING guides can be rejected
    if (status === 'APPROVED' && guide.status !== GuideStatus.PENDING && guide.status !== GuideStatus.REJECTED) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '该鸟导已经审核通过'),
        { status: 400 }
      )
    }
    if (status === 'REJECTED' && guide.status !== GuideStatus.PENDING) {
      return NextResponse.json(
        createErrorResponse('INVALID_STATUS', '只能拒绝待审核的申请'),
        { status: 400 }
      )
    }

    // Validate level if approving
    let guideLevel: GuideLevel = GuideLevel.BASIC
    if (status === 'APPROVED' && level) {
      const levelMap: Record<string, GuideLevel> = {
        BASIC: GuideLevel.BASIC,
        ADVANCED: GuideLevel.ADVANCED,
        GOLD: GuideLevel.GOLD,
        PREMIUM: GuideLevel.PREMIUM,
      }
      if (!levelMap[level]) {
        return NextResponse.json(
          createErrorResponse('INVALID_LEVEL', '无效的鸟导等级'),
          { status: 400 }
        )
      }
      guideLevel = levelMap[level]
    }

    // Set commission rate based on level
    const commissionRates: Record<GuideLevel, number> = {
      [GuideLevel.BASIC]: 0.15,
      [GuideLevel.ADVANCED]: 0.12,
      [GuideLevel.GOLD]: 0.08,
      [GuideLevel.PREMIUM]: 0.05,
    }

    // Update guide status
    const updatedGuide = await prisma.guideProfile.update({
      where: { id: params.id },
      data: {
        status: status as GuideStatus,
        level: status === 'APPROVED' ? guideLevel : guide.level,
        commissionRate: status === 'APPROVED' ? commissionRates[guideLevel] : guide.commissionRate,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            phone: true,
          },
        },
      },
    })

    // If approved, update user role to GUIDE
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: guide.userId },
        data: { role: UserRole.GUIDE },
      })
    }

    return NextResponse.json(
      createSuccessResponse({
        guide: updatedGuide,
        message: status === 'APPROVED' ? '鸟导申请已通过' : '鸟导申请已拒绝',
      })
    )
  } catch (error) {
    console.error('Audit guide error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
