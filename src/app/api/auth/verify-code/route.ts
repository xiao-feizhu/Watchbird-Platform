import { NextRequest, NextResponse } from 'next/server'
import { generateVerifyCode, isValidPhone } from '@/lib/auth'
import { storeVerificationCode } from '@/lib/verify-code-store'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    // Validate phone number
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

    // Generate 6-digit verification code
    const code = generateVerifyCode()

    // Store code with 5-minute expiry
    storeVerificationCode(phone, code)

    // Log code to console for testing
    // TODO: Integrate with SMS service (e.g., Aliyun SMS, Tencent Cloud SMS)
    console.log(`[SMS Verification] Phone: ${phone}, Code: ${code}`)

    return NextResponse.json(
      createSuccessResponse({ message: '验证码已发送' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '服务器内部错误'),
      { status: 500 }
    )
  }
}
