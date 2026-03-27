import { type ReactNode } from 'react'

type CardPadding = 'none' | 'sm' | 'md' | 'lg'
type CardShadow = 'none' | 'sm' | 'md' | 'lg'

interface CardProps {
  children: ReactNode
  padding?: CardPadding
  shadow?: CardShadow
  className?: string
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const shadowStyles: Record<CardShadow, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
}

export function Card({
  children,
  padding = 'md',
  shadow = 'md',
  className = '',
}: CardProps) {
  const baseStyles = 'bg-white rounded-lg'

  const classes = [
    baseStyles,
    paddingStyles[padding],
    shadowStyles[shadow],
    className,
  ].join(' ')

  return <div className={classes}>{children}</div>
}
