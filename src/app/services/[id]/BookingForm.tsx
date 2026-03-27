'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'

interface BookingFormProps {
  service: {
    id: string
    price: number
    priceType: 'per_person' | 'per_group'
    maxPeople: number
    title: string
  }
}

interface OrderResponse {
  order: {
    id: string
    orderNo: string
    totalPrice: number
  }
}

export function BookingForm({ service }: BookingFormProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { execute: createOrder, isLoading } = useApi<OrderResponse>()

  const [serviceDate, setServiceDate] = useState('')
  const [peopleCount, setPeopleCount] = useState(1)
  const [userRemark, setUserRemark] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate total price
  const totalPrice = service.priceType === 'per_person'
    ? service.price * peopleCount
    : service.price

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!serviceDate) {
      newErrors.serviceDate = '请选择服务日期'
    } else {
      const selectedDate = new Date(serviceDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.serviceDate = '服务日期必须在未来'
      }
    }

    if (peopleCount < 1) {
      newErrors.peopleCount = '人数至少为1人'
    } else if (peopleCount > service.maxPeople) {
      newErrors.peopleCount = `人数不能超过${service.maxPeople}人`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [serviceDate, peopleCount, service.maxPeople])

  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    if (!validateForm()) {
      return
    }

    const result = await createOrder('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        productId: service.id,
        serviceDate,
        peopleCount,
        userRemark: userRemark || undefined,
      }),
    })

    if (result?.order) {
      // Redirect to payment page
      router.push(`/orders/${result.order.id}/payment`)
    }
  }, [isAuthenticated, validateForm, createOrder, service.id, serviceDate, peopleCount, userRemark, router])

  // Get tomorrow's date for min attribute
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <Card className="sticky top-4">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">预订服务</h2>

        {!isAuthenticated && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-amber-800">
                  请先登录后再预订服务
                </p>
                <button
                  onClick={() => router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))}
                  className="text-sm text-amber-700 underline hover:text-amber-900 mt-1"
                >
                  去登录
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Date Picker */}
        <Input
          type="date"
          label="服务日期"
          value={serviceDate}
          onChange={setServiceDate}
          error={!!errors.serviceDate}
          errorMessage={errors.serviceDate}
          required
          min={minDate}
        />

        {/* People Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            人数 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={peopleCount <= 1}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              type="number"
              min={1}
              max={service.maxPeople}
              value={peopleCount}
              onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
              className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setPeopleCount(Math.min(service.maxPeople, peopleCount + 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={peopleCount >= service.maxPeople}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {errors.peopleCount && (
            <p className="mt-1 text-sm text-red-600">{errors.peopleCount}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            最多可预订 {service.maxPeople} 人
          </p>
        </div>

        {/* Remark */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            备注信息
          </label>
          <textarea
            value={userRemark}
            onChange={(e) => setUserRemark(e.target.value)}
            placeholder="如有特殊需求请在此说明"
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Price Summary */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">
              {service.priceType === 'per_person' ? `¥${service.price} × ${peopleCount}人` : '每组价格'}
            </span>
            <span className="text-gray-900">
              ¥{service.priceType === 'per_person' ? service.price * peopleCount : service.price}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-lg font-semibold text-gray-900">总计</span>
            <span className="text-2xl font-bold text-red-600">
              ¥{totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          loading={isLoading}
          disabled={!isAuthenticated}
        >
          {isAuthenticated ? '立即预订' : '请先登录'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          点击预订即表示您同意我们的服务条款
        </p>
      </div>
    </Card>
  )
}
