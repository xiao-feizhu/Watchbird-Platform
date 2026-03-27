'use client'

import { useState } from 'react'

type RatingSize = 'sm' | 'md' | 'lg'

interface RatingProps {
  value: number
  size?: RatingSize
  showValue?: boolean
  readonly?: boolean
  onChange?: (value: number) => void
  className?: string
}

const sizeStyles: Record<RatingSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

const StarIcon = ({
  filled,
  size,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  filled: boolean
  size: RatingSize
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) => (
  <svg
    className={`${sizeStyles[size]} ${filled ? 'text-yellow-400' : 'text-gray-300'} ${onClick ? 'cursor-pointer' : ''} transition-colors`}
    fill="currentColor"
    viewBox="0 0 20 20"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

export function Rating({
  value,
  size = 'md',
  showValue = false,
  readonly = true,
  onChange,
  className = '',
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue ?? value
  const clampedValue = Math.max(0, Math.min(5, displayValue))

  const handleStarClick = (starIndex: number) => {
    if (!readonly && onChange) {
      onChange(starIndex)
    }
  }

  const handleStarHover = (starIndex: number) => {
    if (!readonly) {
      setHoverValue(starIndex)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null)
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            filled={star <= clampedValue}
            size={size}
            onClick={readonly ? undefined : () => handleStarClick(star)}
            onMouseEnter={
              readonly ? undefined : () => handleStarHover(star)
            }
          />
        ))}
      </div>
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
