export interface UserProfile {
  id: string
  phone: string
  nickname: string
  avatar?: string
  role: 'USER' | 'GUIDE' | 'ADMIN'
  createdAt?: string
  updatedAt?: string
}

export interface UserSettings {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  privacy: {
    showProfile: boolean
    showActivity: boolean
  }
}

export interface ProfileFormData {
  nickname: string
  avatar?: string
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
