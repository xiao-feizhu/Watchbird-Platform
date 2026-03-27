export interface GuideUser {
  nickname: string
  avatar?: string
}

export type GuideLevel = 'BASIC' | 'ADVANCED' | 'GOLD' | 'PREMIUM'

export interface Service {
  id: string
  title: string
  description: string
  price: number
  priceType: 'per_person' | 'total'
  duration: number
  maxPeople: number
  region: string
  images: string[]
  status: 'active' | 'paused'
  guide: {
    id: string
    level: GuideLevel
    rating: number
    user: GuideUser
  }
}

export interface FilterState {
  search: string
  region: string
  minPrice: string
  maxPrice: string
  duration: string
  sortBy: string
}

export interface ServicesResponse {
  services: Service[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export const REGION_OPTIONS = [
  '云南',
  '四川',
  '西藏',
  '青海',
  '新疆',
  '北京',
  '上海',
  '广东',
  '浙江',
  '江苏',
]

export const DURATION_OPTIONS = [
  { value: 'half', label: '半日' },
  { value: '1', label: '1日' },
  { value: '2', label: '2日' },
  { value: 'multi', label: '多日' },
]

export const SORT_OPTIONS = [
  { value: 'default', label: '综合排序' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'rating', label: '评分最高' },
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
