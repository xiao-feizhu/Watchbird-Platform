'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { Button } from '@/components/ui/Button'
import { type Guide, LEVEL_LABELS, LEVEL_VARIANTS } from './types'

interface GuideCardProps {
  guide: Guide
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function GuideCard({ guide }: GuideCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 group">
      <div className="flex flex-col p-6">
        {/* Header with avatar and basic info */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar
            src={guide.user.avatar || undefined}
            fallback={guide.user.nickname}
            size="lg"
            className="group-hover:scale-105 transition-transform duration-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {guide.user.nickname}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={LEVEL_VARIANTS[guide.level]}>
                {LEVEL_LABELS[guide.level]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <Rating value={guide.rating} size="sm" readonly />
          <span className="text-sm text-gray-600">
            {guide.rating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400">
            ({guide.reviewCount} 评价)
          </span>
        </div>

        {/* Regions */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {guide.regions.slice(0, 4).map((region) => (
            <span
              key={region}
              className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"
            >
              {region}
            </span>
          ))}
          {guide.regions.length > 4 && (
            <span className="text-xs text-gray-400">
              +{guide.regions.length - 4}
            </span>
          )}
        </div>

        {/* Languages */}
        {guide.languages && guide.languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {guide.languages.slice(0, 3).map((language) => (
              <span
                key={language}
                className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
              >
                {language}
              </span>
            ))}
            {guide.languages.length > 3 && (
              <span className="text-xs text-gray-400">
                +{guide.languages.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
          {truncateText(guide.bio, 80)}
        </p>

        {/* Action button */}
        <Link href={`/guides/${guide.id}`} className="mt-auto">
          <Button variant="primary" size="md" className="w-full">
            查看详情
          </Button>
        </Link>
      </div>
    </Card>
  )
}
