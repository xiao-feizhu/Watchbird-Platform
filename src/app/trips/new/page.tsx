'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useApi } from '@/hooks/useApi'
import type { FeeType } from '../types'
import { FEE_TYPE_OPTIONS } from '../types'

interface TripFormData {
  title: string
  destination: string
  destinationLat: number | null
  destinationLng: number | null
  startDate: string
  endDate: string
  maxParticipants: number
  requirements: string
  feeType: FeeType
  feeAmount: string
  feeDescription: string
  description: string
}

const INITIAL_FORM_DATA: TripFormData = {
  title: '',
  destination: '',
  destinationLat: null,
  destinationLng: null,
  startDate: '',
  endDate: '',
  maxParticipants: 5,
  requirements: '',
  feeType: 'AA',
  feeAmount: '',
  feeDescription: '',
  description: '',
}

export default function NewTripPage() {
  const router = useRouter()
  const { isLoading, error, execute } = useApi<{ id: string }>()
  const [formData, setFormData] = useState<TripFormData>(INITIAL_FORM_DATA)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TripFormData, string>>>({})

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof TripFormData, string>> = {}

    if (!formData.title.trim()) {
      errors.title = '请输入活动标题'
    } else if (formData.title.length < 5) {
      errors.title = '标题至少需要5个字符'
    }

    if (!formData.destination.trim()) {
      errors.destination = '请输入目的地'
    }

    if (!formData.startDate) {
      errors.startDate = '请选择开始日期'
    }

    if (formData.endDate && formData.startDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end <= start) {
        errors.endDate = '结束日期必须晚于开始日期'
      }
    }

    if (formData.maxParticipants < 2) {
      errors.maxParticipants = '至少需要2人'
    }

    if (formData.feeType === 'FIXED' && !formData.feeAmount) {
      errors.feeAmount = '请输入费用金额'
    }

    if (!formData.description.trim()) {
      errors.description = '请输入活动详情'
    } else if (formData.description.length < 20) {
      errors.description = '活动详情至少需要20个字符'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      const payload = {
        ...formData,
        feeAmount: formData.feeType === 'FIXED' ? parseFloat(formData.feeAmount) : null,
        maxParticipants: parseInt(formData.maxParticipants.toString(), 10),
      }

      const result = await execute('/api/trips', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (result?.id) {
        router.push(`/trips/${result.id}`)
      }
    },
    [formData, validateForm, execute, router]
  )

  const handleChange = useCallback(
    (field: keyof TripFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear error when user starts typing
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    },
    [formErrors]
  )

  const today = new Date().toISOString().split('T')[0]

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">发布活动</h1>
          <p className="text-gray-600">创建一个新的观鸟活动，邀请其他鸟友一起参加</p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活动标题 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="例如：云南高黎贡山春季观鸟之旅"
                value={formData.title}
                onChange={(value) => handleChange('title', value)}
                error={!!formErrors.title}
                errorMessage={formErrors.title}
                className="w-full"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目的地 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="例如：云南高黎贡山"
                  value={formData.destination}
                  onChange={(value) => handleChange('destination', value)}
                  error={!!formErrors.destination}
                  errorMessage={formErrors.destination}
                  className="w-full pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  开始日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={today}
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={`block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 px-3 py-2 border ${
                    formErrors.startDate
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {formErrors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  结束日期
                </label>
                <input
                  type="date"
                  min={formData.startDate || today}
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={`block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 px-3 py-2 border ${
                    formErrors.endDate
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {formErrors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>
                )}
              </div>
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大人数 <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={2}
                max={50}
                value={formData.maxParticipants.toString()}
                onChange={(value) => handleChange('maxParticipants', parseInt(value, 10) || 5)}
                error={!!formErrors.maxParticipants}
                errorMessage={formErrors.maxParticipants}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">包括组织者在内</p>
            </div>

            {/* Fee Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                费用类型 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FEE_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border p-3 text-center transition-colors ${
                      formData.feeType === option.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-emerald-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feeType"
                      value={option.value}
                      checked={formData.feeType === option.value}
                      onChange={(e) => handleChange('feeType', e.target.value as FeeType)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fee Amount (only for FIXED) */}
            {formData.feeType === 'FIXED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  费用金额 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ¥
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={formData.feeAmount}
                    onChange={(value) => handleChange('feeAmount', value)}
                    error={!!formErrors.feeAmount}
                    errorMessage={formErrors.feeAmount}
                    className="w-full pl-8"
                  />
                </div>
              </div>
            )}

            {/* Fee Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                费用说明
              </label>
              <Input
                type="text"
                placeholder="例如：包含交通、住宿、保险"
                value={formData.feeDescription}
                onChange={(value) => handleChange('feeDescription', value)}
                className="w-full"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                参加要求
              </label>
              <textarea
                rows={3}
                placeholder="例如：需要自备望远镜，建议有一定观鸟经验..."
                value={formData.requirements}
                onChange={(e) => handleChange('requirements', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors resize-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活动详情 <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="详细描述活动行程、目标鸟种、集合地点等信息..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 outline-none transition-colors resize-none ${
                  formErrors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                }`}
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                至少20个字符，已输入 {formData.description.length} 个字符
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
              >
                发布活动
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
