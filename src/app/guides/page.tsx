'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { GuideCard } from './GuideCard'
import { FilterSidebar } from './FilterSidebar'
import {
  type Guide,
  type FilterState,
  type GuidesResponse,
} from './types'

const ITEMS_PER_PAGE = 12

const INITIAL_FILTERS: FilterState = {
  search: '',
  levels: [],
  regions: [],
  languages: [],
}

export default function GuidesPage() {
  const { data, isLoading, error, execute } = useApi<GuidesResponse>()
  const [guides, setGuides] = useState<Guide[]>([])
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch guides on mount
  useEffect(() => {
    execute('/api/guides?limit=100')
  }, [execute])

  // Update guides when data changes
  useEffect(() => {
    if (data?.guides) {
      setGuides(data.guides)
    }
  }, [data])

  // Filter guides based on current filters
  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      // Search filter (by name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const nameMatch = guide.user.nickname.toLowerCase().includes(searchLower)
        if (!nameMatch) return false
      }

      // Level filter
      if (filters.levels.length > 0) {
        if (!filters.levels.includes(guide.level)) return false
      }

      // Region filter
      if (filters.regions.length > 0) {
        const hasMatchingRegion = guide.regions.some((region) =>
          filters.regions.includes(region)
        )
        if (!hasMatchingRegion) return false
      }

      // Language filter
      if (filters.languages.length > 0) {
        const hasMatchingLanguage = guide.languages?.some((language) =>
          filters.languages.includes(language)
        )
        if (!hasMatchingLanguage) return false
      }

      return true
    })
  }, [guides, filters])

  // Pagination
  const totalPages = Math.ceil(filteredGuides.length / ITEMS_PER_PAGE)
  const paginatedGuides = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredGuides.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredGuides, currentPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  const handleApplyFilters = useCallback(() => {
    // Filters are applied automatically via useMemo
    // This function is for explicit "Apply" button click
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">鸟导列表</h1>
          <p className="text-gray-600">
            浏览所有经过认证的鸟导，找到适合您的专业向导
          </p>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            resultCount={filteredGuides.length}
          />

          {/* Results area */}
          <div className="flex-1">
            {/* Loading state */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
                    <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
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
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => execute('/api/guides?limit=100')}
                >
                  重新加载
                </Button>
              </div>
            )}

            {/* Guides grid */}
            {!isLoading && !error && paginatedGuides.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedGuides.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {/* Previous button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
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

                    {/* Page numbers */}
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
                            variant={
                              currentPage === page ? 'primary' : 'ghost'
                            }
                            size="sm"
                            onClick={() => handlePageChange(page as number)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    {/* Next button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
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

                {/* Page info */}
                <div className="mt-4 text-center text-sm text-gray-500">
                  第 {currentPage} / {totalPages} 页，共 {filteredGuides.length} 位鸟导
                </div>
              </>
            )}

            {/* Empty state */}
            {!isLoading && !error && paginatedGuides.length === 0 && (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  没有找到符合条件的鸟导
                </h3>
                <p className="text-gray-500 mb-4">请尝试调整筛选条件</p>
                <Button variant="primary" size="md" onClick={handleClearFilters}>
                  清除所有筛选
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
