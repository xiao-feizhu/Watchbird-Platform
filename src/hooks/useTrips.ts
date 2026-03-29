'use client'

import { useState, useCallback, useEffect } from 'react'
import { useApi } from '@/hooks/useApi'
import type { Trip, TripsResponse, TripFilters } from '@/app/trips/types'

interface UseTripsReturn {
  trips: Trip[]
  isLoading: boolean
  error: Error | null
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  fetchTrips: (filters?: TripFilters, page?: number) => Promise<void>
  refresh: () => Promise<void>
}

const ITEMS_PER_PAGE = 12

export function useTrips(): UseTripsReturn {
  const { data, isLoading, error, execute } = useApi<TripsResponse>()
  const [trips, setTrips] = useState<Trip[]>([])
  const [currentFilters, setCurrentFilters] = useState<TripFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  })

  const fetchTrips = useCallback(
    async (filters: TripFilters = {}, page: number = 1) => {
      setCurrentFilters(filters)
      setCurrentPage(page)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      })

      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.destination) {
        params.append('destination', filters.destination)
      }
      if (filters.status && filters.status.length > 0) {
        filters.status.forEach((s) => params.append('status', s))
      }
      if (filters.feeType && filters.feeType.length > 0) {
        filters.feeType.forEach((f) => params.append('feeType', f))
      }
      if (filters.startDateFrom) {
        params.append('startDateFrom', filters.startDateFrom)
      }
      if (filters.startDateTo) {
        params.append('startDateTo', filters.startDateTo)
      }

      await execute(`/api/trips?${params.toString()}`)
    },
    [execute]
  )

  const refresh = useCallback(async () => {
    await fetchTrips(currentFilters, currentPage)
  }, [fetchTrips, currentFilters, currentPage])

  useEffect(() => {
    if (data) {
      setTrips(data.trips)
      setMeta(data.meta)
    }
  }, [data])

  return {
    trips,
    isLoading,
    error,
    meta,
    fetchTrips,
    refresh,
  }
}
