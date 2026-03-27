'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
  })

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleDeleteAccount = () => {
    // Mock delete account - just logout for MVP
    logout()
    window.location.href = '/'
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
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        <p className="mt-1 text-gray-600">管理您的账户设置和偏好</p>
      </div>

      {/* Account Settings */}
      <Card padding="lg" shadow="md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">账户设置</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">修改密码</p>
              <p className="text-sm text-gray-500">定期更改密码可以保护您的账户安全</p>
            </div>
            <Button variant="secondary" size="sm" disabled>
              即将上线
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">绑定邮箱</p>
              <p className="text-sm text-gray-500">绑定邮箱可用于找回密码和接收通知</p>
            </div>
            <Button variant="secondary" size="sm" disabled>
              即将上线
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card padding="lg" shadow="md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">通知设置</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">邮件通知</p>
              <p className="text-sm text-gray-500">接收订单状态、活动提醒等邮件通知</p>
            </div>
            <button
              onClick={() => handleNotificationChange('email')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.email ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">短信通知</p>
              <p className="text-sm text-gray-500">接收订单状态、验证码等短信通知</p>
            </div>
            <button
              onClick={() => handleNotificationChange('sms')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.sms ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.sms ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">推送通知</p>
              <p className="text-sm text-gray-500">接收App推送通知（即将上线）</p>
            </div>
            <button
              onClick={() => handleNotificationChange('push')}
              disabled
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-not-allowed"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
            </button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card padding="lg" shadow="md">
        <h2 className="text-lg font-semibold text-red-600 mb-4">危险区域</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">注销账户</p>
              <p className="text-sm text-gray-500">注销后您的账户数据将被永久删除，此操作不可恢复</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              注销账户
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认注销账户"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-red-800">警告：此操作不可恢复</p>
                <p className="text-sm text-red-700 mt-1">
                  注销账户后，您的所有数据（包括订单记录、评价等）将被永久删除，无法恢复。
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600">请输入您的手机号 <strong>{user.phone}</strong> 以确认注销：</p>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              确认注销
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
