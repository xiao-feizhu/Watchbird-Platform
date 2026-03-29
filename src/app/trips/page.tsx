'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTrips } from '@/hooks/useTrips'
import { TripCard } from './TripCard'
import type { TripFilters, TripStatus, FeeType } from './types'
import { STATUS_OPTIONS, FEE_TYPE_OPTIONS } from './types'

export default function TripsPage() {
  const { trips, isLoading, error, meta, fetchTrips } = useTrips()
  const [filters, setFilters] = useState<TripFilters>({})
  const [searchInput, setSearchInput] = useState('')

  // Initial fetch
  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  // Handle search
  const handleSearch = useCallback(() => {
    fetchTrips({ ...filters, search: searchInput })
  }, [fetchTrips, filters, searchInput])

  // Handle status filter
  const handleStatusChange = useCallback(
    (value: string) => {
      const status = value ? [value as TripStatus] : undefined
      const newFilters = { ...filters, status }
      setFilters(newFilters)
      fetchTrips(newFilters)
    },
    [fetchTrips, filters]
  )

  // Handle fee type filter
  const handleFeeTypeChange = useCallback(
    (value: string) => {
      const feeType = value ? [value as FeeType] : undefined
      const newFilters = { ...filters, feeType }
      setFilters(newFilters)
      fetchTrips(newFilters)
    },
    [fetchTrips, filters]
  )

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      fetchTrips(filters, page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [fetchTrips, filters]
  )

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({})
    setSearchInput('')
    fetchTrips()
  }, [fetchTrips])

  // Generate pagination
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (meta.totalPages <= maxVisible) {
      for (let i = 1; i <= meta.totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (meta.page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(meta.totalPages)
      } else if (meta.page >= meta.totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = meta.totalPages - 3; i <= meta.totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = meta.page - 1; i <= meta.page + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(meta.totalPages)
      }
    }

    return pages
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">找搭子</h1>
            <p className="text-gray-600">
              发现观鸟伙伴，一起探索自然
            </p>
          </div>
          <Link href="/trips/new">
            <Button variant="primary" size="lg">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              发布活动
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="搜索目的地或活动..."
                value={searchInput}
                onChange={(value) => setSearchInput(value)}
                className="flex-1"
              />
              <Button variant="ghost" size="md" onClick={handleSearch}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </Button>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status?.[0] || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full md:w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            >
              <option value="">所有状态</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Fee Type Filter */}
            <select
              value={filters.feeType?.[0] || ''}
              onChange={(e) => handleFeeTypeChange(e.target.value)}
              className="w-full md:w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            >
              <option value="">费用类型</option>
              {FEE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filters.status || filters.feeType || filters.search) && (
              <Button variant="ghost" size="md" onClick={handleClearFilters}>
                清除筛选
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm p-5 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-5 w-16 bg-gray-200 rounded" />
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 bg-gray-200 rounded-full" />
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <svg
                className="w-16 h-16 text-red-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-gray-600 mb-4">加载失败，请稍后重试</p>
              <Button variant="primary" size="md" onClick={() => fetchTrips()}>
                重新加载
              </Button>
            </div>
          )}

          {/* Trips Grid */}
          {!isLoading && !error && trips.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="px-3"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </Button>

                  <div className="flex items-center gap-1">
                    {getPaginationNumbers().map((page, index) =>
                      page === '...' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-2 text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={meta.page === page ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page === meta.totalPages}
                    className="px-3"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              )}

              <div className="text-center text-sm text-gray-500">
                第 {meta.page} / {meta.totalPages} 页，共 {meta.total} 个活动
              </div>
            </>
          )}

          {/* Empty */}
          {!isLoading && !error && trips.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                没有找到符合条件的活动
              </h3>
              <p className="text-gray-500 mb-4">尝试调整筛选条件或发布新活动</p>
              <div className="flex gap-3 justify-center">
                <Button variant="ghost" size="md" onClick={handleClearFilters}>
                  清除筛选
                </Button>
                <Link href="/trips/new">
                  <Button variant="primary" size="md">
                    发布活动
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
