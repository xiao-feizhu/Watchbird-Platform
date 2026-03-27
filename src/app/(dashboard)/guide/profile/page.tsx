'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface GuideProfile {
  id: string
  level: string
  status: string
  realName: string
  idCard: string | null
  bio: string | null
  regions: string[]
  languages: string[]
  commissionRate: number
  contactPhone: string
  contactWechat: string | null
  contactEmail: string | null
  certificates: string[]
  totalOrders: number
  completedOrders: number
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    phone: string
    nickname: string | null
    avatar: string | null
    role: string
  }
  services: Array<{
    id: string
    title: string
    description: string
    region: string
    duration: number
    maxPeople: number
    price: number
    status: string
    createdAt: string
  }>
}

export default function GuideProfilePage() {
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
        if (data.error?.code === 'PROFILE_NOT_FOUND') {
          setError('您还没有申请成为鸟导')
        } else {
          setError(data.error?.message || '获取资料失败')
        }
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      PENDING: { text: '审核中', className: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { text: '已通过', className: 'bg-green-100 text-green-800' },
      REJECTED: { text: '已拒绝', className: 'bg-red-100 text-red-800' },
      SUSPENDED: { text: '已暂停', className: 'bg-gray-100 text-gray-800' },
    }
    const statusInfo = statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    )
  }

  const getLevelBadge = (level: string) => {
    const levelMap: Record<string, { text: string; className: string }> = {
      BASIC: { text: '基础', className: 'bg-blue-100 text-blue-800' },
      ADVANCED: { text: '进阶', className: 'bg-purple-100 text-purple-800' },
      GOLD: { text: '金牌', className: 'bg-yellow-100 text-yellow-800' },
      PREMIUM: { text: '尊享', className: 'bg-orange-100 text-orange-800' },
    }
    const levelInfo = levelMap[level] || { text: level, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelInfo.className}`}>
        {levelInfo.text}
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
              {error === '您还没有申请成为鸟导' && (
                <Link
                  href="/guide/apply"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  立即申请
                </Link>
              )}
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回首页
          </Link>
          <Link
            href="/guide/apply"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            重新申请
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">鸟导资料</h1>
            <div className="flex gap-2">
              {getStatusBadge(profile.status)}
              {getLevelBadge(profile.level)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">真实姓名</label>
              <p className="text-gray-900">{profile.realName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">用户昵称</label>
              <p className="text-gray-900">{profile.user.nickname || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">联系电话</label>
              <p className="text-gray-900">{profile.contactPhone}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">微信号</label>
              <p className="text-gray-900">{profile.contactWechat || '-'}</p>
            </div>
          </div>
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">服务信息</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">服务地区</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.regions.map((region) => (
                  <span
                    key={region}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {region}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">语言能力</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">个人简介</label>
              <p className="text-gray-900 mt-1">{profile.bio || '暂无简介'}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">数据统计</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {profile.totalOrders}
              </div>
              <div className="text-sm text-gray-500">总订单</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {profile.completedOrders}
              </div>
              <div className="text-sm text-gray-500">已完成</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {profile.rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">评分</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {profile.reviewCount}
              </div>
              <div className="text-sm text-gray-500">评价数</div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">服务产品</h2>
            <span className="text-sm text-gray-500">
              共 {profile.services.length} 个
            </span>
          </div>

          {profile.services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无服务产品
            </div>
          ) : (
            <div className="space-y-4">
              {profile.services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {service.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        service.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : service.status === 'DRAFT'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {service.status === 'ACTIVE'
                        ? '已上架'
                        : service.status === 'DRAFT'
                        ? '草稿'
                        : '已暂停'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>地区: {service.region}</span>
                    <span>时长: {service.duration}小时</span>
                    <span>最多: {service.maxPeople}人</span>
                    <span className="text-blue-600 font-medium">
                      ¥{service.price}
                    </span>
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
