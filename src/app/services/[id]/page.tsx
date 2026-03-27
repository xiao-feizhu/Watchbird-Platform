'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { ServiceInfo } from './ServiceInfo'
import { BookingForm } from './BookingForm'
import { ReviewsSection } from './ReviewsSection'

interface Guide {
  id: string
  user: {
    nickname: string
    avatar: string | null
  }
  level: string
  rating: number
  reviewCount: number
}

interface Service {
  id: string
  title: string
  description: string
  price: number
  priceType: 'per_person' | 'per_group'
  duration: number
  maxPeople: number
  region: string
  images: string[]
  includes: string[]
  excludes: string[]
  targetSpecies: string[]
  bestSeason: string
  guide: Guide
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
  createdAt: string
}

interface ReviewSummary {
  averageRating: number
  totalReviews: number
  distribution: { star: number; count: number }[]
}

export default function ServiceDetailPage() {
  const params = useParams()
  const serviceId = params.id as string

  // Fetch service data
  const {
    data: serviceData,
    isLoading: serviceLoading,
    error: serviceError,
    execute: fetchService,
  } = useApi<{ service: Service }>()

  // Fetch guide reviews
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    execute: fetchReviews,
  } = useApi<{
    reviews: Review[]
    summary: ReviewSummary
  }>()

  useEffect(() => {
    if (serviceId) {
      fetchService(`/api/services/${serviceId}`)
    }
  }, [serviceId, fetchService])

  useEffect(() => {
    const guideId = serviceData?.service?.guide?.id
    if (guideId) {
      fetchReviews(`/api/reviews?revieweeId=${guideId}&limit=3`)
    }
  }, [serviceData, fetchReviews])

  const service = serviceData?.service

  // Loading state
  if (serviceLoading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb skeleton */}
          <div className="mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Error state
  if (serviceError || !service) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  首页
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/guides" className="text-gray-500 hover:text-gray-700">
                  鸟导列表
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900">服务详情</li>
            </ol>
          </nav>

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
              {serviceError?.message || '无法加载服务信息'}
            </p>
            <Button onClick={() => fetchService(`/api/services/${serviceId}`)}>
              重试
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                首页
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/guides" className="text-gray-500 hover:text-gray-700">
                鸟导列表
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href={`/guides/${service.guide.id}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {service.guide.user.nickname}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 truncate max-w-xs">{service.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <ServiceInfo service={service} />

            {/* Reviews Section */}
            <ReviewsSection
              guideId={service.guide.id}
              summary={
                reviewsData?.summary || {
                  averageRating: service.guide.rating,
                  totalReviews: service.guide.reviewCount,
                  distribution: [],
                }
              }
              reviews={reviewsData?.reviews || []}
              isLoading={reviewsLoading}
            />
          </div>

          {/* Sidebar - Booking Form */}
          <div className="lg:col-span-1">
            <BookingForm
              service={{
                id: service.id,
                price: service.price,
                priceType: service.priceType,
                maxPeople: service.maxPeople,
                title: service.title,
              }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
