'use client'

import { useState, useEffect, useMemo } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useApi } from '@/hooks/useApi'
import { ServiceCard } from './ServiceCard'
import { SearchFilter } from './SearchFilter'
import { Service, FilterState, ServicesResponse } from './types'

const INITIAL_FILTERS: FilterState = {
  search: '',
  region: '',
  minPrice: '',
  maxPrice: '',
  duration: '',
  sortBy: 'default',
}

function matchesDuration(serviceDuration: number, filterDuration: string): boolean {
  switch (filterDuration) {
    case 'half':
      return serviceDuration <= 4
    case '1':
      return serviceDuration > 4 && serviceDuration <= 8
    case '2':
      return serviceDuration > 8 && serviceDuration <= 16
    case 'multi':
      return serviceDuration > 16
    default:
      return true
  }
}

function filterServices(services: Service[], filters: FilterState): Service[] {
  return services.filter((service) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        service.title.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.region.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    if (filters.region && service.region !== filters.region) {
      return false
    }

    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice)
      if (!isNaN(minPrice) && service.price < minPrice) {
        return false
      }
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice)
      if (!isNaN(maxPrice) && service.price > maxPrice) {
        return false
      }
    }

    if (filters.duration && !matchesDuration(service.duration, filters.duration)) {
      return false
    }

    return true
  })
}

function sortServices(services: Service[], sortBy: string): Service[] {
  const sorted = [...services]

  switch (sortBy) {
    case 'price_asc':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      sorted.sort((a, b) => b.guide.rating - a.guide.rating)
      break
    default:
      break
  }

  return sorted
}

export default function ServicesPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const { data, isLoading, error, execute } = useApi<ServicesResponse>()

  useEffect(() => {
    execute('/api/services')
  }, [execute])

  const filteredServices = useMemo(() => {
    if (!data?.services) return []

    const activeServices = data.services.filter((s) => s.status === 'active')
    const filtered = filterServices(activeServices, filters)
    return sortServices(filtered, filters.sortBy)
  }, [data, filters])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">服务产品</h1>
          <p className="mt-1 text-gray-600">探索专业鸟导提供的观鸟服务</p>
        </div>

        <SearchFilter filters={filters} onFiltersChange={setFilters} />

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">加载失败: {error.message}</p>
            <button
              onClick={() => execute('/api/services')}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              重试
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>共 {filteredServices.length} 个服务</span>
            </div>

            {filteredServices.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  没有找到符合条件的服务
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  尝试调整筛选条件或搜索关键词
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
