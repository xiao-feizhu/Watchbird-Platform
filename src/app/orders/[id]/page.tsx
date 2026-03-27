'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MainLayout } from '@/components/layout/MainLayout'
import { useApi } from '@/hooks/useApi'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import {
  OrderDetail,
  OrderStatus,
  STATUS_LABELS,
  STATUS_VARIANTS,
  PAYMENT_STATUS_LABELS,
  OrderActionRequest,
} from '../types'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const { data: order, isLoading, error, execute } = useApi<OrderDetail>()
  const { execute: executeAction, isLoading: isActionLoading } = useApi<{ success: boolean }>()

  useEffect(() => {
    if (orderId) {
      execute(`/api/orders/${orderId}`)
    }
  }, [execute, orderId])

  const handleAction = async (action: 'cancel' | 'complete' | 'pay') => {
    const result = await executeAction(`/api/orders/${orderId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ action } as OrderActionRequest),
    })

    if (result) {
      // Refresh order data
      execute(`/api/orders/${orderId}`)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getActionButtons = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => handleAction('cancel')}
              loading={isActionLoading}
            >
              取消订单
            </Button>
            <Button onClick={() => handleAction('pay')} loading={isActionLoading}>
              立即支付
            </Button>
          </div>
        )
      case 'IN_PROGRESS':
        return (
          <Button onClick={() => handleAction('complete')} loading={isActionLoading}>
            确认完成
          </Button>
        )
      case 'PENDING_REVIEW':
        return (
          <Link href={`/orders/${orderId}/review`}>
            <Button>去评价</Button>
          </Link>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">加载失败: {error.message}</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button variant="ghost" onClick={() => router.push('/orders')}>
              返回订单列表
            </Button>
            <Button onClick={() => execute(`/api/orders/${orderId}`)}>重试</Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">订单不存在</p>
          <Button className="mt-4" onClick={() => router.push('/orders')}>
            返回订单列表
          </Button>
        </div>
      </MainLayout>
    )
  }

  const statusVariant = STATUS_VARIANTS[order.status]
  const statusLabel = STATUS_LABELS[order.status]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/orders')}>
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
        </div>

        {/* Order Status Card */}
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500">订单号: {order.orderNumber}</p>
              <div className="mt-2 flex items-center gap-3">
                <Badge variant={statusVariant} className="text-sm px-3 py-1">
                  {statusLabel}
                </Badge>
                <span className="text-sm text-gray-500">
                  支付状态: {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">订单金额</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPrice(order.totalPrice)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {getActionButtons(order.status) && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              {getActionButtons(order.status)}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Service & Guide Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Info */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">服务信息</h2>
              <Link href={`/services/${order.service.id}`} className="flex gap-4 group">
                <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {order.service.images && order.service.images.length > 0 ? (
                    <Image
                      src={order.service.images[0]}
                      alt={order.service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {order.service.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.service.region} · {order.service.duration}小时
                  </p>
                </div>
              </Link>
            </Card>

            {/* Guide Info */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">鸟导信息</h2>
              <Link href={`/guides/${order.guide.id}`} className="flex items-center gap-4 group">
                <Avatar
                  src={order.guide.avatar}
                  alt={order.guide.nickname}
                  size="lg"
                  fallback={order.guide.nickname}
                />
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {order.guide.nickname}
                  </h3>
                  <p className="text-sm text-gray-500">专业鸟导</p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </Card>

            {/* Booking Details */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">预约信息</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">预约日期</span>
                  <span className="text-gray-900">{formatDate(order.bookingDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">出行人数</span>
                  <span className="text-gray-900">{order.peopleCount} 人</span>
                </div>
                {order.remark && (
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-gray-500">备注</span>
                    <p className="mt-1 text-gray-900">{order.remark}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Price & Timeline */}
          <div className="space-y-6">
            {/* Price Breakdown */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">费用明细</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    服务费用 ({order.priceBreakdown.peopleCount}人)
                  </span>
                  <span className="text-gray-900">
                    {formatPrice(order.priceBreakdown.servicePrice * order.priceBreakdown.peopleCount)}
                  </span>
                </div>
                {order.priceBreakdown.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">优惠</span>
                    <span className="text-green-600">
                      -{formatPrice(order.priceBreakdown.discount)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <span className="font-medium text-gray-900">合计</span>
                  <span className="font-bold text-red-600">
                    {formatPrice(order.priceBreakdown.total)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">订单状态</h2>
                <div className="space-y-4">
                  {order.timeline.map((item, index) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                        {index < order.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-medium ${index === 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(item.createdAt)}
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
