'use client'

import { useState, useEffect, useCallback } from 'react'

export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  removeValue: () => void
}

function getStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue
  }

  try {
    const item = window.localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : initialValue
  } catch {
    return initialValue
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [value, setStoredValue] = useState<T>(() =>
    getStoredValue(key, initialValue)
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storedValue = window.localStorage.getItem(key)
    if (storedValue) {
      try {
        setStoredValue(JSON.parse(storedValue) as T)
      } catch {
        // Invalid JSON, keep initial value
      }
    }
  }, [key])

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)): void => {
      if (typeof window === 'undefined') {
        return
      }

      setStoredValue((prev) => {
        const valueToStore = newValue instanceof Function ? newValue(prev) : newValue
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        return valueToStore
      })
    },
    [key]
  )

  const removeValue = useCallback((): void => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.removeItem(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  return {
    value,
    setValue,
    removeValue,
  }
}
