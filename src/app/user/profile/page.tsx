'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { ProfileFormData } from '../types'

interface UpdateProfileResponse {
  success: boolean
  user: {
    id: string
    phone: string
    nickname: string
    avatar?: string
    role: 'USER' | 'GUIDE' | 'ADMIN'
  }
}

export default function ProfilePage() {
  const { user, login } = useAuth()
  const { isLoading: isUpdating, error: updateError } = useApi<UpdateProfileResponse>()
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState<ProfileFormData>({
    nickname: '',
    avatar: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        avatar: user.avatar || '',
      })
    }
  }, [user])

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {}

    if (!formData.nickname.trim()) {
      errors.nickname = '请输入昵称'
    } else if (formData.nickname.length < 2) {
      errors.nickname = '昵称至少需要2个字符'
    } else if (formData.nickname.length > 20) {
      errors.nickname = '昵称不能超过20个字符'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setSuccessMessage('')

    // Mock API call for MVP - simulate success
    // In production, this would call the actual API
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update local user data
    if (user) {
      const updatedUser = {
        ...user,
        nickname: formData.nickname,
        avatar: formData.avatar,
      }
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
      login(token, updatedUser)
    }

    setSuccessMessage('个人资料更新成功')
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        avatar: user.avatar || '',
      })
    }
    setFormErrors({})
    setSuccessMessage('')
    setIsEditing(false)
  }

  if (!user) {
    return (
      <Card padding="lg" shadow="md">
        <div className="text-center py-8">
          <p className="text-gray-600">请先登录</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">个人资料</h1>
        <p className="mt-1 text-gray-600">查看和管理您的个人信息</p>
      </div>

      <Card padding="lg" shadow="md">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        {updateError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">更新失败: {updateError.message}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 mb-8">
          <Avatar
            src={user.avatar}
            fallback={user.nickname}
            size="lg"
            className="w-20 h-20 text-xl"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.nickname}</h2>
            <p className="text-gray-500">{user.phone}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
              {user.role === 'GUIDE' ? '鸟导' : user.role === 'ADMIN' ? '管理员' : '普通用户'}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="昵称"
              value={formData.nickname}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, nickname: value }))
                if (formErrors.nickname) {
                  setFormErrors((prev) => ({ ...prev, nickname: undefined }))
                }
              }}
              disabled={!isEditing}
              error={!!formErrors.nickname}
              errorMessage={formErrors.nickname}
              placeholder="请输入昵称"
            />

            <Input
              label="手机号"
              value={user.phone}
              disabled={true}
              placeholder="手机号"
            />
          </div>

          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              手机号用于登录和接收通知，如需修改请联系客服
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                编辑资料
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSubmit}
                  loading={isUpdating}
                  disabled={isUpdating}
                >
                  保存修改
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  取消
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
