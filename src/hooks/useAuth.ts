'use client'

import { useState, useEffect, useCallback } from 'react'

export interface User {
  id: string
  phone: string
  nickname: string
  avatar?: string
  role: 'USER' | 'GUIDE' | 'ADMIN'
}

export interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  checkAuth: () => boolean
}

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const token = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (token && storedUser && !isTokenExpired(token)) {
      try {
        const parsedUser = JSON.parse(storedUser) as User
        setUser(parsedUser)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    } else if (token && isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }

    setIsLoading(false)
  }, [])

  const login = useCallback((token: string, newUser: User): void => {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setUser(newUser)
  }, [])

  const logout = useCallback((): void => {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const checkAuth = useCallback((): boolean => {
    if (typeof window === 'undefined') {
      return false
    }

    const token = localStorage.getItem(TOKEN_KEY)
    if (!token || isTokenExpired(token)) {
      return false
    }
    return user !== null
  }, [user])

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    checkAuth,
  }
}
