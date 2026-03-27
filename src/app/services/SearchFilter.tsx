'use client'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { FilterState, REGION_OPTIONS, DURATION_OPTIONS, SORT_OPTIONS } from './types'

interface SearchFilterProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function SearchFilter({ filters, onFiltersChange }: SearchFilterProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleRegionChange = (value: string) => {
    onFiltersChange({ ...filters, region: value })
  }

  const handleMinPriceChange = (value: string) => {
    onFiltersChange({ ...filters, minPrice: value })
  }

  const handleMaxPriceChange = (value: string) => {
    onFiltersChange({ ...filters, maxPrice: value })
  }

  const handleDurationChange = (value: string) => {
    onFiltersChange({ ...filters, duration: value })
  }

  const handleSortChange = (value: string) => {
    onFiltersChange({ ...filters, sortBy: value })
  }

  const handleClear = () => {
    onFiltersChange({
      search: '',
      region: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      sortBy: 'default',
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.region ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.duration ||
    filters.sortBy !== 'default'

  const regionOptions = [
    { value: '', label: '全部地区' },
    ...REGION_OPTIONS.map((region) => ({ value: region, label: region })),
  ]

  const durationOptions = [
    { value: '', label: '全部时长' },
    ...DURATION_OPTIONS,
  ]

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="搜索服务产品..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-40">
            <Select
              options={regionOptions}
              value={filters.region}
              onChange={handleRegionChange}
              placeholder="选择地区"
            />
          </div>

          <div className="flex gap-2">
            <div className="w-28">
              <Input
                type="number"
                placeholder="最低价格"
                value={filters.minPrice}
                onChange={handleMinPriceChange}
              />
            </div>
            <span className="flex items-center text-gray-500">-</span>
            <div className="w-28">
              <Input
                type="number"
                placeholder="最高价格"
                value={filters.maxPrice}
                onChange={handleMaxPriceChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-32">
            <Select
              options={durationOptions}
              value={filters.duration}
              onChange={handleDurationChange}
              placeholder="时长"
            />
          </div>

          <div className="w-full sm:w-40">
            <Select
              options={SORT_OPTIONS}
              value={filters.sortBy}
              onChange={handleSortChange}
            />
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleClear}>
              清除筛选
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
