'use client'

import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Rating } from '@/components/ui/Rating'
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
  repliedAt: string | null
  createdAt: string
}

interface ReviewSummary {
  averageRating: number
  totalReviews: number
  distribution: { star: number; count: number }[]
}

interface ReviewsProps {
  reviews: Review[]
  summary: ReviewSummary
  isLoading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Reviews({
  reviews,
  summary,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: ReviewsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
              <div className="h-16 bg-gray-200 rounded" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="bg-gray-50">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-4xl font-bold text-gray-900">
                {summary.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 mt-1">
                <Rating value={summary.averageRating} size="sm" readonly />
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {summary.totalReviews} 条评价
              </div>
            </div>

            {/* Distribution */}
            <div className="flex-1 max-w-md">
              {summary.distribution.map(({ star, count }) => {
                const percentage =
                  summary.totalReviews > 0
                    ? (count / summary.totalReviews) * 100
                    : 0
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-8 text-gray-500">{star}星</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-gray-500">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
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
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评价</h3>
          <p className="text-gray-500">该鸟导还没有收到评价</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <div className="p-6">
                {/* Reviewer Info */}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar
                    src={review.reviewer.avatar || undefined}
                    fallback={review.reviewer.nickname}
                    size="sm"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.reviewer.nickname}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-3">
                  <Rating value={review.rating} size="sm" readonly />
                </div>

                {/* Tags */}
                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content */}
                <p className="text-gray-700 mb-4">{review.content}</p>

                {/* Images */}
                {review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`评价图片 ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Reply */}
                {review.reply && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-emerald-600">
                        鸟导回复
                      </span>
                      {review.repliedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(review.repliedAt).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{review.reply}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            上一页
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}
