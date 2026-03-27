'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { useApi } from '@/hooks/useApi'

interface Guide {
  id: string
  user: {
    nickname: string
    avatar: string | null
  }
  level: string
  regions: string[]
  rating: number
  reviewCount: number
  bio: string | null
}

const levelLabels: Record<string, string> = {
  BASIC: '初级',
  ADVANCED: '中级',
  GOLD: '金牌',
  PREMIUM: '尊享',
}

const levelVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  BASIC: 'default',
  ADVANCED: 'info',
  GOLD: 'warning',
  PREMIUM: 'success',
}

export function FeaturedGuides() {
  const { data, isLoading, error, execute } = useApi<{ guides: Guide[] }>()
  const [guides, setGuides] = useState<Guide[]>([])

  useEffect(() => {
    execute('/api/guides?limit=4')
  }, [execute])

  useEffect(() => {
    if (data?.guides) {
      setGuides(data.guides)
    }
  }, [data])

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">推荐鸟导</h2>
            <p className="mt-2 text-gray-600">经验丰富的专业鸟导，带您探索自然之美</p>
          </div>
          <Link
            href="/guides"
            className="hidden sm:flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            查看更多
            <svg
              className="w-5 h-5 ml-1"
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
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex flex-col items-center p-6">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mb-4" />
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-gray-500">加载失败，请稍后重试</p>
          </div>
        )}

        {/* Guides grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide) => (
              <Link key={guide.id} href={`/guides/${guide.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex flex-col items-center p-6">
                    {/* Avatar */}
                    <div className="relative mb-4">
                      <Avatar
                        src={guide.user.avatar || undefined}
                        fallback={guide.user.nickname}
                        size="lg"
                        className="group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {guide.user.nickname}
                    </h3>

                    {/* Level badge */}
                    <Badge variant={levelVariants[guide.level] || 'default'} className="mb-3">
                      {levelLabels[guide.level] || guide.level}
                    </Badge>

                    {/* Regions */}
                    <div className="flex flex-wrap justify-center gap-1 mb-3">
                      {guide.regions.slice(0, 3).map((region) => (
                        <span
                          key={region}
                          className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                        >
                          {region}
                        </span>
                      ))}
                      {guide.regions.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{guide.regions.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center">
                      <Rating value={guide.rating} size="sm" readonly />
                      <span className="ml-2 text-sm text-gray-500">
                        {guide.rating.toFixed(1)} ({guide.reviewCount})
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && guides.length === 0 && (
          <div className="text-center py-12">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-gray-500">暂无推荐鸟导</p>
          </div>
        )}

        {/* Mobile view more link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/guides"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
          >
            查看更多鸟导
            <svg
              className="w-5 h-5 ml-1"
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
        </div>
      </div>
    </section>
  )
}
