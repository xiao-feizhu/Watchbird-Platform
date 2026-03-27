'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Rating } from '@/components/ui/Rating'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

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

interface ReviewsSectionProps {
  guideId: string
  summary: ReviewSummary
  reviews: Review[]
  isLoading?: boolean
}

export function ReviewsSection({ guideId, summary, reviews, isLoading }: ReviewsSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-20 w-full bg-gray-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  // Calculate percentage for each star rating
  const getPercentage = (count: number): number => {
    if (summary.totalReviews === 0) return 0
    return Math.round((count / summary.totalReviews) * 100)
  }

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">用户评价</h2>
          <Link href={`/guides/${guideId}?tab=reviews`}>
            <Button variant="ghost" size="sm">
              查看全部
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>

        {/* Rating Summary */}
        <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 rounded-lg">
          {/* Overall Rating */}
          <div className="flex flex-col items-center justify-center md:border-r md:border-gray-200 md:pr-6">
            <div className="text-4xl font-bold text-gray-900">
              {summary.averageRating.toFixed(1)}
            </div>
            <Rating value={summary.averageRating} size="md" readonly className="mt-2" />
            <div className="text-sm text-gray-500 mt-1">
              共 {summary.totalReviews} 条评价
            </div>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const distItem = summary.distribution.find(d => d.star === star)
              const count = distItem?.count || 0
              const percentage = getPercentage(count)

              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">{star}星</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>暂无评价</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                {/* Review Header */}
                <div className="flex items-center gap-3 mb-2">
                  <Avatar
                    src={review.reviewer.avatar || undefined}
                    alt={review.reviewer.nickname}
                    fallback={review.reviewer.nickname}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {review.reviewer.nickname}
                    </div>
                    <div className="flex items-center gap-2">
                      <Rating value={review.rating} size="sm" readonly />
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <p className="text-gray-600 text-sm mb-2">{review.content}</p>

                {/* Tags */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {review.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {review.images.slice(0, 3).map((image, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={image}
                          alt={`评价图片 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {review.images.length > 3 && (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                        +{review.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Reply */}
                {review.reply && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">鸟导回复：</div>
                    <p className="text-sm text-gray-700">{review.reply}</p>
                  </div>
                )}
              </div>
            ))}

            {/* View All Link */}
            {reviews.length > 3 && (
              <Link href={`/guides/${guideId}?tab=reviews`}>
                <Button variant="ghost" className="w-full mt-4">
                  查看全部 {summary.totalReviews} 条评价
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
