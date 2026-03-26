import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { UserRole, GuideStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '未授权，请先登录'),
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', '登录已过期，请重新登录'),
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      realName,
      idCard,
      bio,
      regions,
      languages,
      contactPhone,
      contactWechat,
    } = body

    // Validate required fields
    if (!realName || typeof realName !== 'string') {
      return NextResponse.json(
        createErrorResponse('INVALID_REAL_NAME', '真实姓名不能为空'),
        { status: 400 }
      )
    }

    if (!contactPhone || typeof contactPhone !== 'string') {
      return NextResponse.json(
        createErrorResponse('INVALID_CONTACT_PHONE', '联系电话不能为空'),
        { status: 400 }
      )
    }

    if (!regions || !Array.isArray(regions) || regions.length === 0) {
      return NextResponse.json(
        createErrorResponse('INVALID_REGIONS', '请至少选择一个服务地区'),
        { status: 400 }
      )
    }

    // Check if user already has a guide profile
    const existingProfile = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    if (existingProfile) {
      return NextResponse.json(
        createErrorResponse('ALREADY_APPLIED', '您已经提交过鸟导申请'),
        { status: 409 }
      )
    }

    // Create guide profile with PENDING status
    const guideProfile = await prisma.guideProfile.create({
      data: {
        userId: payload.userId,
        realName,
        idCard: idCard || null,
        bio: bio || null,
        regions,
        languages: languages || ['中文'],
        contactPhone,
        contactWechat: contactWechat || null,
        status: GuideStatus.PENDING,
        level: 'BASIC',
        commissionRate: 0.15,
      },
    })

    // Update user role to GUIDE
    await prisma.user.update({
      where: { id: payload.userId },
      data: { role: UserRole.GUIDE },
    })

    return NextResponse.json(
      createSuccessResponse({
        guideProfile: {
          id: guideProfile.id,
          realName: guideProfile.realName,
          status: guideProfile.status,
          level: guideProfile.level,
          createdAt: guideProfile.createdAt,
        },
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Guide application error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
