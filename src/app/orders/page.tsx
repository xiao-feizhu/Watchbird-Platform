'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { OrderCard } from './OrderCard'
import { OrdersResponse, OrderStatus, STATUS_FILTERS } from './types'

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const { data, isLoading, error, execute } = useApi<OrdersResponse>()

  useEffect(() => {
    const url =
      activeFilter === 'ALL'
        ? '/api/orders'
        : `/api/orders?status=${activeFilter}`
    execute(url)
  }, [execute, activeFilter])

  const orders = data?.orders || []
  const total = data?.meta?.total || 0

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>
          <p className="mt-1 text-gray-600">查看和管理您的观鸟服务订单</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">加载失败: {error.message}</p>
            <button
              onClick={() => {
                const url =
                  activeFilter === 'ALL'
                    ? '/api/orders'
                    : `/api/orders?status=${activeFilter}`
                execute(url)
              }}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              重试
            </button>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && (
          <>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                共 {total} 个订单
                {activeFilter !== 'ALL' && (
                  <span className="ml-1 text-gray-400">
                    (已筛选: {STATUS_FILTERS.find((f) => f.value === activeFilter)?.label})
                  </span>
                )}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  暂无订单
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeFilter === 'ALL'
                    ? '您还没有下过任何订单，快去探索观鸟服务吧！'
                    : '该状态下没有订单'}
                </p>
                {activeFilter === 'ALL' && (
                  <div className="mt-4">
                    <Button onClick={() => (window.location.href = '/services')}>
                      浏览服务
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
