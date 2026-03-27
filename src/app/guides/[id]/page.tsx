'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { GuideProfile } from './GuideProfile'
import { ServicesList } from './ServicesList'
import { Reviews } from './Reviews'

type TabType = 'profile' | 'services' | 'reviews'

interface GuideData {
  id: string
  user: {
    nickname: string
    avatar: string | null
  }
  level: string
  regions: string[]
  languages: string[]
  rating: number
  reviewCount: number
  bio: string | null
  totalOrders: number
  completedOrders: number
  createdAt: string
}

interface Service {
  id: string
  title: string
  description: string
  price: number
  duration: number
  maxPeople: number
  region: string
}

interface Review {
  id: string
  reviewer: {
    nickname: string
    avatar: string | null
  }
  rating: number
  content: string
  tags: string[]
  images: string[]
  reply: string | null
  repliedAt: string | null
  createdAt: string
}

interface ReviewSummary {
  averageRating: number
  totalReviews: number
  distribution: { star: number; count: number }[]
}

const tabs = [
  { id: 'profile' as TabType, label: '个人资料' },
  { id: 'services' as TabType, label: '服务项目' },
  { id: 'reviews' as TabType, label: '用户评价' },
]

export default function GuideDetailPage() {
  const params = useParams()
  const guideId = params.id as string
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [reviewPage, setReviewPage] = useState(1)

  // Fetch guide data
  const {
    data: guideData,
    isLoading: guideLoading,
    error: guideError,
    execute: fetchGuide,
  } = useApi<{ guide: GuideData }>()

  // Fetch services
  const {
    data: servicesData,
    isLoading: servicesLoading,
    execute: fetchServices,
  } = useApi<{ services: Service[] }>()

  // Fetch reviews
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    execute: fetchReviews,
  } = useApi<{
    reviews: Review[]
    summary: ReviewSummary
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>()

  useEffect(() => {
    if (guideId) {
      fetchGuide(`/api/guides/${guideId}`)
    }
  }, [guideId, fetchGuide])

  useEffect(() => {
    if (guideId && activeTab === 'services') {
      fetchServices(`/api/services?guideId=${guideId}`)
    }
  }, [guideId, activeTab, fetchServices])

  useEffect(() => {
    if (guideId && activeTab === 'reviews') {
      fetchReviews(`/api/reviews?revieweeId=${guideId}&page=${reviewPage}&limit=10`)
    }
  }, [guideId, activeTab, reviewPage, fetchReviews])

  const guide = guideData?.guide

  // Loading state
  if (guideLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* Back button skeleton */}
          <div className="mb-6">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          {/* Profile skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-20 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Error state
  if (guideError || !guide) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Link href="/guides">
            <Button variant="ghost" className="mb-6">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              返回
            </Button>
          </Link>
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              加载失败
            </h2>
            <p className="text-gray-500 mb-4">
              {guideError?.message || '无法加载鸟导信息'}
            </p>
            <Button onClick={() => fetchGuide(`/api/guides/${guideId}`)}>
              重试
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/guides">
          <Button variant="ghost" className="mb-6">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            返回
          </Button>
        </Link>

        {/* Guide Profile */}
        <GuideProfile guide={guide} />

        {/* Tab Navigation */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                关于鸟导
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {guide.bio || '该鸟导暂无详细介绍'}
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                服务统计
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {guide.completedOrders}
                  </div>
                  <div className="text-sm text-gray-500">完成服务</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {guide.reviewCount}
                  </div>
                  <div className="text-sm text-gray-500">收到评价</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {guide.rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">平均评分</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <ServicesList
              services={servicesData?.services || []}
              isLoading={servicesLoading}
            />
          )}

          {activeTab === 'reviews' && (
            <Reviews
              reviews={reviewsData?.reviews || []}
              summary={
                reviewsData?.summary || {
                  averageRating: 0,
                  totalReviews: 0,
                  distribution: [],
                }
              }
              isLoading={reviewsLoading}
              page={reviewPage}
              totalPages={reviewsData?.meta?.totalPages || 1}
              onPageChange={setReviewPage}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
}
