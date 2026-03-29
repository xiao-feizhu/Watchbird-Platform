'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Trip } from './types'
import { STATUS_LABELS, STATUS_VARIANTS, FEE_TYPE_LABELS } from './types'

interface TripCardProps {
  trip: Trip
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = formatDate(startDate)
  if (!endDate) return start
  const end = formatDate(endDate)
  return `${start} - ${end}`
}

export function TripCard({ trip }: TripCardProps) {
  const isJoinable = trip.status === 'OPEN'

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 group">
      <div className="flex flex-col p-5">
        {/* Header: Status and Date */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant={STATUS_VARIANTS[trip.status]}>
            {STATUS_LABELS[trip.status]}
          </Badge>
          <span className="text-sm text-gray-500">
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {trip.title}
        </h3>

        {/* Destination */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
          <svg
            className="w-4 h-4 text-emerald-500"
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
          <span className="line-clamp-1">{trip.destination}</span>
        </div>

        {/* Fee Info */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {FEE_TYPE_LABELS[trip.feeType]}
          </span>
          {trip.feeAmount && trip.feeType === 'FIXED' && (
            <span className="text-sm font-medium text-emerald-600">
              ¥{trip.feeAmount}
            </span>
          )}
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {trip.participants.slice(0, 3).map((p, i) => (
                <div
                  key={p.id}
                  className={`relative ${i === 0 ? 'z-30' : i === 1 ? 'z-20' : 'z-10'}`}
                >
                  <Avatar
                    src={p.user.avatar || undefined}
                    fallback={p.user.nickname}
                    size="sm"
                    className="border-2 border-white"
                  />
                </div>
              ))}
              {trip.participants.length === 0 && (
                <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center z-10">
                  <span className="text-xs text-gray-400">?</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {trip.currentCount}/{trip.maxParticipants}人
            </span>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mb-4">
          <Avatar
            src={trip.organizer.avatar || undefined}
            fallback={trip.organizer.nickname}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {trip.organizer.nickname}
            </p>
            {trip.organizer.profile?.birdingYears && (
              <p className="text-xs text-gray-500">
                观鸟{trip.organizer.profile.birdingYears}年
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/trips/${trip.id}`} className="mt-auto">
          <Button
            variant={isJoinable ? 'primary' : 'ghost'}
            size="md"
            className="w-full"
            disabled={!isJoinable}
          >
            {isJoinable ? '查看详情' : STATUS_LABELS[trip.status]}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
