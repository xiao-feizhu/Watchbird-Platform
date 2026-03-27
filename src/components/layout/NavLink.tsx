'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'

interface NavLinkProps {
  href: string
  children: ReactNode
  active?: boolean
  className?: string
}

export function NavLink({
  href,
  children,
  active = false,
  className = '',
}: NavLinkProps) {
  const baseStyles =
    'relative px-3 py-2 text-sm font-medium transition-colors duration-200 group'

  const activeStyles = active
    ? 'text-blue-600'
    : 'text-gray-700 hover:text-blue-600'

  const underlineStyles =
    'absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform origin-left transition-transform duration-200 ease-out'

  return (
    <Link href={href} className={`${baseStyles} ${activeStyles} ${className}`}>
      <span>{children}</span>
      <span
        className={`${underlineStyles} ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  )
}
