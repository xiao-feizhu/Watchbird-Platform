'use client'

import { useState, useCallback } from 'react'

export interface UseApiReturn<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  execute: (url: string, options?: RequestInit) => Promise<T | null>
  reset: () => void
}

const TOKEN_KEY = 'token'

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {}
  }

  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useApi<T>(): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const reset = useCallback((): void => {
    setData(null)
    setIsLoading(false)
    setError(null)
  }, [])

  const execute = useCallback(
    async (url: string, options: RequestInit = {}): Promise<T | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
          ...(options.headers as Record<string, string>),
        }

        const response = await fetch(url, {
          ...options,
          headers,
        })

        const responseData = await response.json()

        if (!response.ok) {
          const errorMessage =
            responseData.error?.message || `HTTP error! status: ${response.status}`
          throw new Error(errorMessage)
        }

        if (!responseData.success) {
          const errorMessage = responseData.error?.message || 'Request failed'
          throw new Error(errorMessage)
        }

        const result = responseData.data as T
        setData(result)
        return result
      } catch (err) {
        const apiError =
          err instanceof Error ? err : new Error('An unexpected error occurred')
        setError(apiError)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  }
}
