import { type ReactNode } from 'react'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  src?: string
  alt?: string
  size?: AvatarSize
  fallback?: string
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Avatar({
  src,
  alt = '',
  size = 'md',
  fallback,
  className = '',
}: AvatarProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium overflow-hidden'

  const classes = [baseStyles, sizeStyles[size], className].join(' ')

  const renderFallback = (): ReactNode => {
    if (fallback) {
      return <span>{getInitials(fallback)}</span>
    }

    // Default placeholder icon
    return (
      <svg
        className="w-1/2 h-1/2 text-gray-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }

  return (
    <div className={classes}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide broken image and show fallback
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      ) : (
        renderFallback()
      )}
    </div>
  )
}
