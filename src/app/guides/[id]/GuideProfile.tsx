'use client'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { Button } from '@/components/ui/Button'

interface GuideProfileData {
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

const levelLabels: Record<string, string> = {
  BASIC: '初级鸟导',
  ADVANCED: '中级鸟导',
  GOLD: '金牌鸟导',
  PREMIUM: '尊享鸟导',
}

const levelVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  BASIC: 'default',
  ADVANCED: 'info',
  GOLD: 'warning',
  PREMIUM: 'success',
}

interface GuideProfileProps {
  guide: GuideProfileData
}

export function GuideProfile({ guide }: GuideProfileProps) {
  const joinDate = new Date(guide.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center md:items-start">
          <Avatar
            src={guide.user.avatar || undefined}
            fallback={guide.user.nickname}
            size="lg"
            className="w-24 h-24 md:w-32 md:h-32 text-2xl"
          />
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left">
          {/* Name and Level */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {guide.user.nickname}
            </h1>
            <Badge variant={levelVariants[guide.level] || 'default'}>
              {levelLabels[guide.level] || guide.level}
            </Badge>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <Rating value={guide.rating} size="md" readonly />
            <span className="text-lg font-semibold text-gray-900">
              {guide.rating.toFixed(1)}
            </span>
            <span className="text-gray-500">
              ({guide.reviewCount} 条评价)
            </span>
          </div>

          {/* Bio */}
          {guide.bio && (
            <p className="text-gray-600 mb-4 leading-relaxed">
              {guide.bio}
            </p>
          )}

          {/* Regions */}
          <div className="mb-4">
            <span className="text-sm text-gray-500 mr-2">服务区域:</span>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
              {guide.regions.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-50 text-emerald-700"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="mb-4">
            <span className="text-sm text-gray-500 mr-2">语言能力:</span>
            <span className="text-gray-700">
              {guide.languages.join('、')}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-gray-500 mb-6">
            <div>
              <span className="font-semibold text-gray-900">{guide.completedOrders}</span>
              <span className="ml-1">次服务</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{guide.totalOrders}</span>
              <span className="ml-1">次订单</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{joinDate}</span>
              <span className="ml-1">入驻</span>
            </div>
          </div>

          {/* Contact Button */}
          <Button
            size="lg"
            className="w-full md:w-auto"
            onClick={() => {
              // TODO: Implement contact functionality
              alert('联系功能即将上线')
            }}
          >
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            联系鸟导
          </Button>
        </div>
      </div>
    </div>
  )
}
