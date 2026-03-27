'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

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

interface ServiceInfoProps {
  service: {
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

const priceTypeLabels: Record<string, string> = {
  per_person: '每人',
  per_group: '每组',
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function ServiceInfo({ service }: ServiceInfoProps) {
  const mainImage = service.images && service.images.length > 0
    ? service.images[0]
    : null

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video">
        {mainImage ? (
          <img
            src={mainImage}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Service Title & Price */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {service.title}
        </h1>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-red-600">
            ¥{service.price.toLocaleString()}
          </span>
          <span className="text-gray-500">
            /{priceTypeLabels[service.priceType]}
          </span>
        </div>
      </div>

      {/* Guide Info Card */}
      <Card className="bg-gray-50">
        <div className="flex items-center gap-4">
          <Avatar
            src={service.guide.user.avatar || undefined}
            alt={service.guide.user.nickname}
            fallback={service.guide.user.nickname}
            size="lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {service.guide.user.nickname}
              </span>
              <Badge variant={levelVariants[service.guide.level] || 'default'}>
                {levelLabels[service.guide.level] || service.guide.level}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Rating value={service.guide.rating} size="sm" readonly />
              <span>{service.guide.rating.toFixed(1)}</span>
              <span>({service.guide.reviewCount} 条评价)</span>
            </div>
          </div>
          <Link href={`/guides/${service.guide.id}`}>
            <Button variant="secondary" size="sm">
              查看主页
            </Button>
          </Link>
        </div>
      </Card>

      {/* Service Details */}
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">服务区域</div>
          <div className="font-medium text-gray-900">{service.region}</div>
        </div>
        <div className="text-center border-x border-gray-200">
          <div className="text-sm text-gray-500 mb-1">服务时长</div>
          <div className="font-medium text-gray-900">{service.duration} 小时</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">最多人数</div>
          <div className="font-medium text-gray-900">{service.maxPeople} 人</div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">服务介绍</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {service.description}
        </p>
      </div>

      {/* Includes */}
      {service.includes && service.includes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">费用包含</h2>
          <ul className="space-y-2">
            {service.includes.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Excludes */}
      {service.excludes && service.excludes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">费用不含</h2>
          <ul className="space-y-2">
            {service.excludes.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CrossIcon />
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Target Species */}
      {service.targetSpecies && service.targetSpecies.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">目标鸟种</h2>
          <div className="flex flex-wrap gap-2">
            {service.targetSpecies.map((species, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-50 text-emerald-700"
              >
                {species}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Best Season */}
      {service.bestSeason && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">最佳季节</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{service.bestSeason}</span>
          </div>
        </div>
      )}
    </div>
  )
}
