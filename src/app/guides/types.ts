export interface GuideUser {
  nickname: string
  avatar: string | null
}

export type GuideLevel = 'BASIC' | 'ADVANCED' | 'GOLD' | 'PREMIUM'

export interface Guide {
  id: string
  user: GuideUser
  level: GuideLevel
  regions: string[]
  languages: string[]
  rating: number
  reviewCount: number
  bio: string | null
  totalOrders: number
  completedOrders: number
}

export interface FilterState {
  search: string
  levels: GuideLevel[]
  regions: string[]
  languages: string[]
}

export interface GuidesResponse {
  guides: Guide[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const LEVEL_OPTIONS: { value: GuideLevel; label: string }[] = [
  { value: 'BASIC', label: '基础' },
  { value: 'ADVANCED', label: '高级' },
  { value: 'GOLD', label: '金牌' },
  { value: 'PREMIUM', label: '顶级' },
]

export const REGION_OPTIONS = [
  '云南',
  '四川',
  '西藏',
  '青海',
  '新疆',
  '北京',
  '上海',
]

export const LANGUAGE_OPTIONS = [
  { value: '中文', label: '中文' },
  { value: '英语', label: '英语' },
  { value: '日语', label: '日语' },
  { value: '韩语', label: '韩语' },
]

export const LEVEL_LABELS: Record<GuideLevel, string> = {
  BASIC: '基础',
  ADVANCED: '高级',
  GOLD: '金牌',
  PREMIUM: '顶级',
}

export const LEVEL_VARIANTS: Record<
  GuideLevel,
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  BASIC: 'default',
  ADVANCED: 'info',
  GOLD: 'warning',
  PREMIUM: 'success',
}
