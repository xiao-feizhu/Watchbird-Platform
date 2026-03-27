'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Rating } from '@/components/ui/Rating'
import { Service, LEVEL_LABELS, LEVEL_VARIANTS } from './types'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { id, title, region, duration, maxPeople, price, priceType, images, guide } = service

  const priceLabel = priceType === 'per_person' ? '每人' : '总价'
  const levelVariant = LEVEL_VARIANTS[guide.level]
  const levelLabel = LEVEL_LABELS[guide.level]

  return (
    <Link href={`/services/${id}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden rounded-t-lg -m-6 mb-4">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
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
          <div className="absolute top-2 left-2">
            <Badge variant="info">{region}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{duration}小时</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
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
              <span>最多{maxPeople}人</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-red-600">
                ¥{price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">/{priceLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Avatar
              src={guide.user.avatar}
              fallback={guide.user.nickname}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {guide.user.nickname}
                </span>
                <Badge variant={levelVariant} className="text-xs">
                  {levelLabel}
                </Badge>
              </div>
              <Rating value={guide.rating} size="sm" showValue />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
