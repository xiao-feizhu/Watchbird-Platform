'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  type FilterState,
  type GuideLevel,
  LEVEL_OPTIONS,
  REGION_OPTIONS,
  LANGUAGE_OPTIONS,
} from './types'

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onApplyFilters: () => void
  onClearFilters: () => void
  resultCount: number
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
      {children}
    </div>
  )
}

interface CheckboxFilterProps<T extends string> {
  options: { value: T; label: string }[] | string[]
  selectedValues: T[]
  onChange: (values: T[]) => void
}

function CheckboxFilter<T extends string>({
  options,
  selectedValues,
  onChange,
}: CheckboxFilterProps<T>) {
  const handleToggle = (value: T) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]
    onChange(newValues)
  }

  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt as T, label: opt } : opt
  )

  return (
    <div className="space-y-2">
      {normalizedOptions.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
        >
          <input
            type="checkbox"
            checked={selectedValues.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  )
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  resultCount,
}: FilterSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleLevelsChange = (levels: GuideLevel[]) => {
    onFiltersChange({ ...filters, levels })
  }

  const handleRegionsChange = (regions: string[]) => {
    onFiltersChange({ ...filters, regions })
  }

  const handleLanguagesChange = (languages: string[]) => {
    onFiltersChange({ ...filters, languages })
  }

  const hasActiveFilters =
    filters.search ||
    filters.levels.length > 0 ||
    filters.regions.length > 0 ||
    filters.languages.length > 0

  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      {/* Mobile toggle button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="secondary"
          size="md"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          筛选条件
          {hasActiveFilters && (
            <span className="bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {
                [
                  filters.search,
                  ...filters.levels,
                  ...filters.regions,
                  ...filters.languages,
                ].filter(Boolean).length
              }
            </span>
          )}
        </Button>
      </div>

      {/* Filter content */}
      <div
        className={`${
          isMobileOpen ? 'block' : 'hidden'
        } lg:block bg-white rounded-lg shadow-sm border border-gray-200 p-4`}
      >
        {/* Result count */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-sm text-gray-600">
            找到 <span className="font-semibold text-emerald-600">{resultCount}</span> 位鸟导
          </p>
        </div>

        {/* Search */}
        <FilterSection title="搜索">
          <Input
            type="text"
            placeholder="搜索鸟导姓名..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </FilterSection>

        {/* Level filter */}
        <FilterSection title="等级">
          <CheckboxFilter
            options={LEVEL_OPTIONS}
            selectedValues={filters.levels}
            onChange={handleLevelsChange}
          />
        </FilterSection>

        {/* Region filter */}
        <FilterSection title="服务地区">
          <CheckboxFilter
            options={REGION_OPTIONS}
            selectedValues={filters.regions}
            onChange={handleRegionsChange}
          />
        </FilterSection>

        {/* Language filter */}
        <FilterSection title="语言">
          <CheckboxFilter
            options={LANGUAGE_OPTIONS}
            selectedValues={filters.languages}
            onChange={handleLanguagesChange}
          />
        </FilterSection>

        {/* Action buttons */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => {
              onApplyFilters()
              setIsMobileOpen(false)
            }}
          >
            应用筛选
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="w-full"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
          >
            清除筛选
          </Button>
        </div>
      </div>
    </div>
  )
}
