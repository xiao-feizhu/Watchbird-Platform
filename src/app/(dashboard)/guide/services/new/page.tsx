'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewServicePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    region: '',
    duration: '',
    maxPeople: '',
    price: '',
    priceType: 'per_person',
    includes: '',
    excludes: '',
    birdSpecies: '',
    bestSeason: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        setIsLoading(false)
        return
      }

      // Parse comma-separated fields
      const includes = formData.includes
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean)

      const excludes = formData.excludes
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean)

      const birdSpecies = formData.birdSpecies
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean)

      const bestSeason = formData.bestSeason
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean)

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          region: formData.region,
          duration: parseInt(formData.duration),
          maxPeople: parseInt(formData.maxPeople),
          price: parseFloat(formData.price),
          priceType: formData.priceType,
          includes,
          excludes,
          birdSpecies,
          bestSeason,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error?.message || '创建服务失败')
        setIsLoading(false)
        return
      }

      // Redirect to services list on success
      router.push('/guide/services')
    } catch {
      setError('网络错误，请稍后重试')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/guide/services"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回服务列表
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">创建服务产品</h1>
            <p className="mt-2 text-sm text-gray-600">
              填写以下信息创建新的观鸟服务产品
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                服务标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="例如：北京野鸭湖观鸟一日游"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                服务描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="请详细描述服务内容、行程安排、注意事项等"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="region"
                className="block text-sm font-medium text-gray-700"
              >
                服务地区 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="region"
                name="region"
                required
                value={formData.region}
                onChange={handleChange}
                placeholder="例如：北京延庆"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  服务时长(小时) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="例如：8"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="maxPeople"
                  className="block text-sm font-medium text-gray-700"
                >
                  最多人数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="maxPeople"
                  name="maxPeople"
                  required
                  min="1"
                  value={formData.maxPeople}
                  onChange={handleChange}
                  placeholder="例如：6"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  价格(元) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="例如：500"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="priceType"
                  className="block text-sm font-medium text-gray-700"
                >
                  计价方式 <span className="text-red-500">*</span>
                </label>
                <select
                  id="priceType"
                  name="priceType"
                  required
                  value={formData.priceType}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="per_person">每人</option>
                  <option value="per_group">每团</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="includes"
                className="block text-sm font-medium text-gray-700"
              >
                费用包含
              </label>
              <input
                type="text"
                id="includes"
                name="includes"
                value={formData.includes}
                onChange={handleChange}
                placeholder="例如：导游服务，望远镜租赁，保险（用逗号分隔）"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">多个项目请用逗号分隔</p>
            </div>

            <div>
              <label
                htmlFor="excludes"
                className="block text-sm font-medium text-gray-700"
              >
                费用不含
              </label>
              <input
                type="text"
                id="excludes"
                name="excludes"
                value={formData.excludes}
                onChange={handleChange}
                placeholder="例如：交通费，餐饮，门票（用逗号分隔）"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">多个项目请用逗号分隔</p>
            </div>

            <div>
              <label
                htmlFor="birdSpecies"
                className="block text-sm font-medium text-gray-700"
              >
                目标鸟种
              </label>
              <input
                type="text"
                id="birdSpecies"
                name="birdSpecies"
                value={formData.birdSpecies}
                onChange={handleChange}
                placeholder="例如：大鸨，白鹤，黑鹳（用逗号分隔）"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">多个鸟种请用逗号分隔</p>
            </div>

            <div>
              <label
                htmlFor="bestSeason"
                className="block text-sm font-medium text-gray-700"
              >
                最佳季节
              </label>
              <input
                type="text"
                id="bestSeason"
                name="bestSeason"
                value={formData.bestSeason}
                onChange={handleChange}
                placeholder="例如：春季，秋季（用逗号分隔）"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">多个季节请用逗号分隔</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '创建中...' : '创建服务'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
