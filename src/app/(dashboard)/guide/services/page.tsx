'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Service {
  id: string
  type: string
  title: string
  description: string
  region: string
  duration: number
  maxPeople: number
  price: number
  priceType: string
  status: string
  createdAt: string
}

interface GuideProfile {
  id: string
  status: string
  services: Service[]
}

export default function GuideServicesPage() {
  const [profile, setProfile] = useState<GuideProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        setLoading(false)
        return
      }

      const response = await fetch('/api/guides/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error?.message || '获取资料失败')
        setLoading(false)
        return
      }

      setProfile(data.data.guideProfile)
      setLoading(false)
    } catch {
      setError('网络错误，请稍后重试')
      setLoading(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('确定要下架此服务吗？')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        return
      }

      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error?.message || '下架服务失败')
        return
      }

      // Refresh the list
      fetchProfile()
    } catch {
      setError('网络错误，请稍后重试')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      ACTIVE: { text: '已上架', className: 'bg-green-100 text-green-800' },
      DRAFT: { text: '草稿', className: 'bg-gray-100 text-gray-800' },
      PAUSED: { text: '已暂停', className: 'bg-yellow-100 text-yellow-800' },
    }
    const statusInfo = statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center text-gray-600">加载中...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center text-gray-600">无法加载资料</div>
          </div>
        </div>
      </div>
    )
  }

  if (profile.status !== 'APPROVED') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <div className="text-yellow-600 mb-4">
                您的鸟导申请正在审核中，审核通过后即可管理服务产品
              </div>
              <Link
                href="/guide/profile"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                查看资料
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/guide/profile"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回鸟导资料
          </Link>
          <Link
            href="/guide/services/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            + 新建服务
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">服务产品管理</h1>
            <p className="mt-1 text-sm text-gray-600">
              管理您的观鸟服务产品，共 {profile.services.length} 个
            </p>
          </div>

          {profile.services.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">暂无服务产品</div>
              <Link
                href="/guide/services/new"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                创建第一个服务
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {profile.services.map((service) => (
                <div key={service.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {service.title}
                        </h3>
                        {getStatusBadge(service.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>地区: {service.region}</span>
                        <span>时长: {service.duration}小时</span>
                        <span>最多: {service.maxPeople}人</span>
                        <span className="text-blue-600 font-medium">
                          ¥{service.price}
                          {service.priceType === 'per_person' ? '/人' : '/团'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/guide/services/${service.id}`}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50"
                      >
                        编辑
                      </Link>
                      {service.status !== 'PAUSED' && (
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-600 rounded-md hover:bg-red-50"
                        >
                          下架
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
