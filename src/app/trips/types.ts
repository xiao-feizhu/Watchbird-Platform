export type TripStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'COMPLETED' | 'CANCELLED'
export type FeeType = 'FREE' | 'AA' | 'FIXED' | 'VARIABLE'

export interface TripOrganizer {
  id: string
  nickname: string
  avatar: string | null
  profile?: {
    age?: number | null
    gender?: string | null
    region?: string | null
    bio?: string | null
    birdingYears?: number
    expertBirds?: string[]
    equipment?: string | null
    canDrive?: boolean
    carCapacity?: number | null
    hostedTrips?: number
  }
}

export interface TripParticipant {
  id: string
  user: {
    id: string
    nickname: string
    avatar: string | null
    birdingYears: number
  }
  bio: string | null
  appliedAt: string
}

export interface Trip {
  id: string
  title: string
  destination: string
  destinationLat: number | null
  destinationLng: number | null
  startDate: string
  endDate: string | null
  maxParticipants: number
  currentCount: number
  requirements: string | null
  feeType: FeeType
  feeAmount: number | null
  feeDescription: string | null
  description: string
  status: TripStatus
  createdAt: string
  updatedAt: string
  organizer: TripOrganizer
  participants: TripParticipant[]
  chatGroupId?: string
}

export interface TripApplication {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  bio: string | null
  appliedAt: string
  respondedAt: string | null
  trip: {
    id: string
    title: string
    destination: string
    startDate: string
    status: TripStatus
  }
}

export interface TripsResponse {
  trips: Trip[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TripFilters {
  search?: string
  destination?: string
  status?: TripStatus[]
  feeType?: FeeType[]
  startDateFrom?: string
  startDateTo?: string
}

export const STATUS_LABELS: Record<TripStatus, string> = {
  OPEN: '报名中',
  FULL: '已满员',
  CLOSED: '已截止',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

export const STATUS_VARIANTS: Record<
  TripStatus,
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  OPEN: 'success',
  FULL: 'warning',
  CLOSED: 'info',
  COMPLETED: 'default',
  CANCELLED: 'danger',
}

export const FEE_TYPE_LABELS: Record<FeeType, string> = {
  FREE: '免费',
  AA: 'AA制',
  FIXED: '固定费用',
  VARIABLE: '费用面议',
}

export const FEE_TYPE_OPTIONS = [
  { value: 'FREE', label: '免费' },
  { value: 'AA', label: 'AA制' },
  { value: 'FIXED', label: '固定费用' },
  { value: 'VARIABLE', label: '费用面议' },
]

export const STATUS_OPTIONS = [
  { value: 'OPEN', label: '报名中' },
  { value: 'FULL', label: '已满员' },
  { value: 'CLOSED', label: '已截止' },
]
