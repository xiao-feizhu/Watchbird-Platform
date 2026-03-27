'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Order, OrderStatus, STATUS_LABELS, STATUS_VARIANTS } from './types'

interface OrderCardProps {
  order: Order
}

interface OrderAction {
  label: string
  href: string
}

function getActionButton(status: OrderStatus, orderId: string): OrderAction | null {
  switch (status) {
    case 'PENDING_PAYMENT':
      return { label: '立即支付', href: `/orders/${orderId}/pay` }
    case 'IN_PROGRESS':
      return { label: '确认完成', href: `/orders/${orderId}/complete` }
    case 'PENDING_REVIEW':
      return { label: '去评价', href: `/orders/${orderId}/review` }
    default:
      return null
  }
}

export function OrderCard({ order }: OrderCardProps) {
  const action = getActionButton(order.status, order.id)
  const statusVariant = STATUS_VARIANTS[order.status]
  const statusLabel = STATUS_LABELS[order.status]

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>订单号: {order.orderNumber}</span>
          <span className="text-gray-300">|</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      <Link href={`/orders/${order.id}`} className="block">
        <div className="p-4 flex gap-4">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {order.service.images && order.service.images.length > 0 ? (
              <Image
                src={order.service.images[0]}
                alt={order.service.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-8 h-8"
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

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {order.service.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {order.service.region} · {order.service.duration}小时
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Avatar
                src={order.guide.avatar}
                alt={order.guide.nickname}
                size="sm"
                fallback={order.guide.nickname}
              />
              <span className="text-sm text-gray-600">
                {order.guide.nickname}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          共 {order.peopleCount} 人 · 预约日期: {formatDate(order.bookingDate)}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">合计:</span>
          <span className="text-lg font-semibold text-red-600">
            {formatPrice(order.totalPrice)}
          </span>
        </div>
      </div>

      {action && (
        <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
          {order.status === 'PENDING_PAYMENT' && (
            <Button variant="ghost" size="sm">
              取消订单
            </Button>
          )}
          <Link href={action.href}>
            <Button size="sm">{action.label}</Button>
          </Link>
        </div>
      )}
    </Card>
  )
}
