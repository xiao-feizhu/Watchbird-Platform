import crypto from 'crypto'

/**
 * Payment configuration from environment variables
 */
const WECHAT_MCH_ID = process.env.WECHAT_MCH_ID || ''
const WECHAT_API_KEY = process.env.WECHAT_API_KEY || ''
const WECHAT_APP_ID = process.env.WECHAT_APP_ID || ''

/**
 * Generate unique order number
 * Format: WB + timestamp + random (e.g., WB20240327123456123456789)
 */
export function generateOrderNo(): string {
  const timestamp = Date.now().toString()
  const random = Math.floor(1000 + Math.random() * 9000).toString()
  return `WB${timestamp}${random}`
}

/**
 * Generate WeChat Pay signature
 * Uses HMAC-SHA256 with the API key
 */
export function generateWechatSign(params: Record<string, string | number | undefined>): string {
  // Filter out undefined values and sign field
  const filteredParams: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && key !== 'sign') {
      filteredParams[key] = value
    }
  }

  // Sort keys alphabetically
  const sortedKeys = Object.keys(filteredParams).sort()

  // Build string: key1=value1&key2=value2...
  const stringA = sortedKeys
    .map((key) => `${key}=${filteredParams[key]}`)
    .join('&')

  // Build final string: stringA&key=API_KEY
  const stringSignTemp = `${stringA}&key=${WECHAT_API_KEY}`

  // Generate HMAC-SHA256 signature
  return crypto
    .createHmac('sha256', WECHAT_API_KEY)
    .update(stringSignTemp)
    .digest('hex')
    .toUpperCase()
}

/**
 * Generate payment params for frontend JSAPI
 * Returns the params needed to call WeChat Pay in the frontend
 */
export function generatePaymentParams(
  prepayId: string,
  nonceStr: string
): {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
} {
  const timeStamp = Math.floor(Date.now() / 1000).toString()
  const packageValue = `prepay_id=${prepayId}`

  const params = {
    appId: WECHAT_APP_ID,
    timeStamp,
    nonceStr,
    package: packageValue,
    signType: 'HMAC-SHA256',
  }

  // For RSA signing, we would need a private key
  // For MVP, we use the same HMAC-SHA256 approach
  // In production, this should use RSA with a proper certificate
  const paySign = generateWechatSign(params)

  return {
    ...params,
    paySign,
  }
}

/**
 * Generate random nonce string for WeChat Pay
 */
export function generateNonceStr(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Build XML from object for WeChat Pay API request
 */
export function buildXml(obj: Record<string, unknown>): string {
  let xml = '<xml>'
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      xml += `<${key}><![CDATA[${value}]]></${key}>`
    }
  }
  xml += '</xml>'
  return xml
}

/**
 * Parse XML to object for WeChat Pay API response
 */
export function parseXml(xml: string): Record<string, string> {
  const result: Record<string, string> = {}
  const regex = /<(\w+)>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/\w+>/g
  let match

  while ((match = regex.exec(xml)) !== null) {
    result[match[1]] = match[2]
  }

  return result
}

/**
 * Call WeChat Pay unified order API
 * Creates a unified order and returns prepay_id
 */
export async function unifiedOrder(params: {
  body: string
  outTradeNo: string
  totalFee: number
  spbillCreateIp: string
  notifyUrl: string
  openid: string
  attach?: string
}): Promise<{
  returnCode: string
  returnMsg?: string
  resultCode?: string
  errCode?: string
  errCodeDes?: string
  prepayId?: string
  tradeType?: string
  wechatOrderId?: string
}> {
  const nonceStr = generateNonceStr()

  const requestParams = {
    appid: WECHAT_APP_ID,
    mch_id: WECHAT_MCH_ID,
    nonce_str: nonceStr,
    body: params.body,
    out_trade_no: params.outTradeNo,
    total_fee: params.totalFee,
    spbill_create_ip: params.spbillCreateIp,
    notify_url: params.notifyUrl,
    trade_type: 'JSAPI',
    openid: params.openid,
    attach: params.attach || '',
  }

  const sign = generateWechatSign(requestParams)

  const xmlData = buildXml({ ...requestParams, sign })

  try {
    const response = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xmlData,
    })

    const responseXml = await response.text()
    const responseData = parseXml(responseXml)

    return {
      returnCode: responseData.return_code || 'FAIL',
      returnMsg: responseData.return_msg,
      resultCode: responseData.result_code,
      errCode: responseData.err_code,
      errCodeDes: responseData.err_code_des,
      prepayId: responseData.prepay_id,
      tradeType: responseData.trade_type,
      wechatOrderId: responseData.transaction_id,
    }
  } catch (error) {
    console.error('WeChat unified order error:', error)
    return {
      returnCode: 'FAIL',
      returnMsg: 'Network error',
    }
  }
}

/**
 * Verify WeChat Pay callback signature
 * Ensures the callback is genuinely from WeChat Pay
 */
export function verifyCallbackSignature(
  params: Record<string, string>,
  signature: string
): boolean {
  const expectedSign = generateWechatSign(params)
  return expectedSign === signature
}

/**
 * Generate success XML response for WeChat Pay callback
 */
export function generateSuccessXml(): string {
  return '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>'
}

/**
 * Generate fail XML response for WeChat Pay callback
 */
export function generateFailXml(message: string): string {
  return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[${message}]]></return_msg></xml>`
}
