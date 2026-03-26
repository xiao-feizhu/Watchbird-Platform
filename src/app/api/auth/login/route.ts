import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    // Validate required fields
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        createErrorResponse('INVALID_PHONE', '手机号不能为空'),
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        createErrorResponse('INVALID_PASSWORD', '密码不能为空'),
        { status: 400 }
      )
    }

    // Find user by phone (exclude password from selection)
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        role: true,
        password: true,
        wechatOpenId: true,
        wechatUnionId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        createErrorResponse('INVALID_CREDENTIALS', '手机号或密码错误'),
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        createErrorResponse('INVALID_CREDENTIALS', '手机号或密码错误'),
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    })

    // Return user without password field
    const userResponse = {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      wechatOpenId: user.wechatOpenId,
      wechatUnionId: user.wechatUnionId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json(
      createSuccessResponse({ user: userResponse, token }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
