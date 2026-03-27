import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, isValidPhone, generateToken } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password, nickname } = body

    // Validate required fields
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        createErrorResponse('INVALID_PHONE', '手机号不能为空'),
        { status: 400 }
      )
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        createErrorResponse('INVALID_PHONE', '手机号格式不正确'),
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        createErrorResponse('INVALID_PASSWORD', '密码不能为空'),
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        createErrorResponse('INVALID_PASSWORD', '密码长度不能少于6位'),
        { status: 400 }
      )
    }

    // Check if phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json(
        createErrorResponse('PHONE_EXISTS', '该手机号已注册'),
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname: nickname || null,
      },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    })

    return NextResponse.json(
      createSuccessResponse({ user, token }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
