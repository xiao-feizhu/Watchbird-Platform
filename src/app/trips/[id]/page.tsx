'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useApi } from '@/hooks/useApi'
import type { Trip } from '../types'
import { STATUS_LABELS, STATUS_VARIANTS, FEE_TYPE_LABELS } from '../types'

interface TripDetailResponse {
  trip: Trip
}

interface ApplicationResponse {
  success: boolean
  message?: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = formatDate(startDate)
  if (!endDate) return start
  const end = formatDate(endDate)
  return `${start} 至 ${end}`
}

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string

  const { data, isLoading, error, execute: fetchTrip } = useApi<TripDetailResponse>()
  const { isLoading: isApplying, execute: applyTrip } = useApi<ApplicationResponse>()
  const { isLoading: isCancelling, execute: cancelTrip } = useApi<ApplicationResponse>()
  const { isLoading: isCompleting, execute: completeTrip } = useApi<ApplicationResponse>()

  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [applicationBio, setApplicationBio] = useState('')

  const trip = data?.trip

  // Fetch trip data
  useEffect(() => {
    if (tripId) {
      fetchTrip(`/api/trips/${tripId}`)
    }
  }, [tripId, fetchTrip])

  // Handle apply
  const handleApply = useCallback(async () => {
    const result = await applyTrip(`/api/trips/${tripId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ bio: applicationBio }),
    })

    if (result?.success) {
      setShowApplyModal(false)
      fetchTrip(`/api/trips/${tripId}`)
    }
  }, [tripId, applicationBio, applyTrip, fetchTrip])

  // Handle cancel application
  const handleCancelApplication = useCallback(async () => {
    const result = await cancelTrip(`/api/trips/${tripId}/apply`, {
      method: 'DELETE',
    })

    if (result?.success) {
      setShowCancelModal(false)
      fetchTrip(`/api/trips/${tripId}`)
    }
  }, [tripId, cancelTrip, fetchTrip])

  // Handle complete trip
  const handleComplete = useCallback(async () => {
    const result = await completeTrip(`/api/trips/${tripId}/complete`, {
      method: 'POST',
    })

    if (result?.success) {
      setShowCompleteModal(false)
      fetchTrip(`/api/trips/${tripId}`)
    }
  }, [tripId, completeTrip, fetchTrip])

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="h-40 bg-gray-200 rounded" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
              <div className="h-60 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Error state
  if (error || !trip) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <svg
            className="w-16 h-16 text-red-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-gray-600 mb-4">加载失败，请稍后重试</p>
          <Button variant="primary" onClick={() => fetchTrip(`/api/trips/${tripId}`)}>
            重新加载
          </Button>
        </div>
      </MainLayout>
    )
  }

  const isOpen = trip.status === 'OPEN'
  const isOrganizer = false // TODO: Check if current user is organizer
  const hasApplied = false // TODO: Check if current user has applied
  const isApproved = false // TODO: Check if current user is approved

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回列表
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant={STATUS_VARIANTS[trip.status]}>{STATUS_LABELS[trip.status]}</Badge>
            <span className="text-sm text-gray-500">
              发布于 {new Date(trip.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{trip.title}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">活动信息</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-emerald-500 mt-0.5"
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
                  <div>
                    <p className="text-sm text-gray-500">目的地</p>
                    <p className="font-medium text-gray-900">{trip.destination}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-emerald-500 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">活动时间</p>
                    <p className="font-medium text-gray-900">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-emerald-500 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">人数</p>
                    <p className="font-medium text-gray-900">
                      {trip.currentCount} / {trip.maxParticipants} 人
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-emerald-500 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">费用</p>
                    <p className="font-medium text-gray-900">
                      {FEE_TYPE_LABELS[trip.feeType]}
                      {trip.feeAmount && ` ¥${trip.feeAmount}`}
                    </p>
                    {trip.feeDescription && (
                      <p className="text-sm text-gray-500">{trip.feeDescription}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">活动详情</h2>
              <div className="prose prose-emerald max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{trip.description}</p>
              </div>
            </Card>

            {/* Requirements */}
            {trip.requirements && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">参加要求</h2>
                <p className="whitespace-pre-wrap text-gray-700">{trip.requirements}</p>
              </Card>
            )}

            {/* Participants */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                参与者 ({trip.participants.length})
              </h2>
              {trip.participants.length > 0 ? (
                <div className="space-y-3">
                  {trip.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Avatar
                        src={participant.user.avatar || undefined}
                        fallback={participant.user.nickname}
                        size="md"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{participant.user.nickname}</p>
                        {participant.user.birdingYears > 0 && (
                          <p className="text-sm text-gray-500">
                            观鸟 {participant.user.birdingYears} 年
                          </p>
                        )}
                      </div>
                      {participant.bio && (
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {participant.bio}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">暂无参与者</p>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">组织者</h2>
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  src={trip.organizer.avatar || undefined}
                  fallback={trip.organizer.nickname}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-gray-900">{trip.organizer.nickname}</p>
                  {trip.organizer.profile?.birdingYears && (
                    <p className="text-sm text-gray-500">
                      观鸟 {trip.organizer.profile.birdingYears} 年
                    </p>
                  )}
                </div>
              </div>
              {trip.organizer.profile && (
                <div className="space-y-2 text-sm">
                  {trip.organizer.profile.region && (
                    <p className="text-gray-600">
                      <span className="text-gray-400">地区：</span>
                      {trip.organizer.profile.region}
                    </p>
                  )}
                  {trip.organizer.profile.expertBirds &&
                    trip.organizer.profile.expertBirds.length > 0 && (
                      <p className="text-gray-600">
                        <span className="text-gray-400">擅长：</span>
                        {trip.organizer.profile.expertBirds.slice(0, 3).join('、')}
                      </p>
                    )}
                  {trip.organizer.profile.canDrive && (
                    <p className="text-emerald-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      可提供用车
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* Actions */}
            <Card className="p-6">
              {isOrganizer ? (
                <div className="space-y-3">
                  <Link href={`/trips/${trip.id}/applications`} className="block">
                    <Button variant="primary" className="w-full">
                      管理申请
                    </Button>
                  </Link>
                  {trip.status === 'CLOSED' && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => setShowCompleteModal(true)}
                    >
                      标记完成
                    </Button>
                  )}
                  {trip.status !== 'CANCELLED' && trip.status !== 'COMPLETED' && (
                    <Button variant="danger" className="w-full">
                      取消活动
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {isOpen && !hasApplied && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => setShowApplyModal(true)}
                    >
                      申请参加
                    </Button>
                  )}
                  {hasApplied && !isApproved && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowCancelModal(true)}
                    >
                      取消申请
                    </Button>
                  )}
                  {isApproved && trip.chatGroupId && (
                    <Link href={`/trips/${trip.id}/chat`} className="block">
                      <Button variant="primary" className="w-full">
                        进入群聊
                      </Button>
                    </Link>
                  )}
                  {!isOpen && !hasApplied && (
                    <Button variant="ghost" className="w-full" disabled>
                      {STATUS_LABELS[trip.status]}
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Apply Modal */}
        <Modal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          title="申请参加活动"
        >
          <div className="space-y-4">
            <p className="text-gray-600">请简单介绍一下自己，让组织者了解你的情况：</p>
            <textarea
              rows={4}
              placeholder="例如：我有3年观鸟经验，擅长识别林鸟..."
              value={applicationBio}
              onChange={(e) => setApplicationBio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowApplyModal(false)}>
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleApply}
                loading={isApplying}
                disabled={isApplying}
              >
                提交申请
              </Button>
            </div>
          </div>
        </Modal>

        {/* Cancel Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="取消申请"
        >
          <div className="space-y-4">
            <p className="text-gray-600">确定要取消参加申请吗？</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
                再想想
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelApplication}
                loading={isCancelling}
                disabled={isCancelling}
              >
                确认取消
              </Button>
            </div>
          </div>
        </Modal>

        {/* Complete Modal */}
        <Modal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          title="标记活动完成"
        >
          <div className="space-y-4">
            <p className="text-gray-600">确定要将此活动标记为已完成吗？</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowCompleteModal(false)}>
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleComplete}
                loading={isCompleting}
                disabled={isCompleting}
              >
                确认完成
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  )
}
