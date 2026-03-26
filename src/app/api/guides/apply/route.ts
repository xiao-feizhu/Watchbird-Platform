import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, isValidPhone } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { UserRole, GuideStatus } from '@prisma/client'

const DEFAULT_COMMISSION_RATE = 0.15
const DEFAULT_LEVEL = 'BASIC'
const DEFAULT_LANGUAGE = '中文'
const MAX_BIO_LENGTH = 2000

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

    if (!isValidPhone(contactPhone)) {
      return NextResponse.json(
        createErrorResponse('INVALID_PHONE_FORMAT', '联系电话格式不正确'),
        { status: 400 }
      )
    }

    if (bio && (typeof bio !== 'string' || bio.length > MAX_BIO_LENGTH)) {
      return NextResponse.json(
        createErrorResponse('INVALID_BIO', `个人简介不能超过${MAX_BIO_LENGTH}字符`),
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
        languages: languages || [DEFAULT_LANGUAGE],
        contactPhone,
        contactWechat: contactWechat || null,
        status: GuideStatus.PENDING,
        level: DEFAULT_LEVEL,
        commissionRate: DEFAULT_COMMISSION_RATE,
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
