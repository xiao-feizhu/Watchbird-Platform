'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function GuideApplyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    realName: '',
    idCard: '',
    bio: '',
    regions: '',
    languages: '中文',
    contactPhone: '',
    contactWechat: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        setIsLoading(false)
        return
      }

      // Parse regions and languages as arrays
      const regions = formData.regions
        .split(/[,，]/)
        .map((r) => r.trim())
        .filter(Boolean)

      const languages = formData.languages
        .split(/[,，]/)
        .map((l) => l.trim())
        .filter(Boolean)

      const response = await fetch('/api/guides/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          realName: formData.realName,
          idCard: formData.idCard || undefined,
          bio: formData.bio || undefined,
          regions,
          languages,
          contactPhone: formData.contactPhone,
          contactWechat: formData.contactWechat || undefined,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error?.message || '申请提交失败')
        return
      }

      // Redirect to profile page on success
      router.push('/guide/profile')
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回首页
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">鸟导入驻申请</h1>
            <p className="mt-2 text-sm text-gray-600">
              填写以下信息申请成为鸟导，审核通过后即可开始接单
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
                htmlFor="realName"
                className="block text-sm font-medium text-gray-700"
              >
                真实姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="realName"
                name="realName"
                required
                value={formData.realName}
                onChange={handleChange}
                placeholder="请输入真实姓名"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="idCard"
                className="block text-sm font-medium text-gray-700"
              >
                身份证号
              </label>
              <input
                type="text"
                id="idCard"
                name="idCard"
                value={formData.idCard}
                onChange={handleChange}
                placeholder="请输入身份证号（可选）"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                个人简介
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="请简要介绍您的观鸟经验、擅长领域等"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="regions"
                className="block text-sm font-medium text-gray-700"
              >
                服务地区 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="regions"
                name="regions"
                required
                value={formData.regions}
                onChange={handleChange}
                placeholder="请输入服务地区，多个地区用逗号分隔，如：北京，河北"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                多个地区请用逗号分隔
              </p>
            </div>

            <div>
              <label
                htmlFor="languages"
                className="block text-sm font-medium text-gray-700"
              >
                语言能力
              </label>
              <input
                type="text"
                id="languages"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="请输入语言能力，多个语言用逗号分隔"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                多个语言请用逗号分隔，默认为中文
              </p>
            </div>

            <div>
              <label
                htmlFor="contactPhone"
                className="block text-sm font-medium text-gray-700"
              >
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                required
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="请输入联系电话"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="contactWechat"
                className="block text-sm font-medium text-gray-700"
              >
                微信号
              </label>
              <input
                type="text"
                id="contactWechat"
                name="contactWechat"
                value={formData.contactWechat}
                onChange={handleChange}
                placeholder="请输入微信号（可选）"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '提交中...' : '提交申请'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
