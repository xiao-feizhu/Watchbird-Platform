export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_CONFIRM'
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'

export interface OrderGuide {
  id: string
  nickname: string
  avatar?: string
}

export interface OrderService {
  id: string
  title: string
  images: string[]
  region: string
  duration: number
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  totalPrice: number
  peopleCount: number
  bookingDate: string
  remark?: string
  createdAt: string
  service: OrderService
  guide: OrderGuide
}

export interface OrderDetail extends Order {
  priceBreakdown: {
    servicePrice: number
    peopleCount: number
    subtotal: number
    discount: number
    total: number
  }
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'PARTIAL_REFUND'
  timeline: OrderTimelineItem[]
}

export interface OrderTimelineItem {
  id: string
  status: OrderStatus
  title: string
  description: string
  createdAt: string
}

export interface OrdersResponse {
  orders: Order[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export interface OrderActionRequest {
  action: 'cancel' | 'complete' | 'pay' | 'review'
  payload?: Record<string, unknown>
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '待付款',
  PENDING_CONFIRM: '待确认',
  IN_PROGRESS: '进行中',
  PENDING_REVIEW: '待评价',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

export const STATUS_VARIANTS: Record<
  OrderStatus,
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  PENDING_PAYMENT: 'warning',
  PENDING_CONFIRM: 'info',
  IN_PROGRESS: 'info',
  PENDING_REVIEW: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

export const STATUS_FILTERS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'PENDING_PAYMENT', label: '待付款' },
  { value: 'PENDING_CONFIRM', label: '待确认' },
  { value: 'IN_PROGRESS', label: '进行中' },
  { value: 'PENDING_REVIEW', label: '待评价' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
]

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: '未支付',
  PAID: '已支付',
  REFUNDED: '已退款',
  PARTIAL_REFUND: '部分退款',
}
