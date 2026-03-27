'use client'

import { type ChangeEvent } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  required?: boolean
  placeholder?: string
  className?: string
  id?: string
}

export function Select({
  label,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder,
  className = '',
  id,
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 11)}`

  const baseStyles =
    'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'

  const disabledStyles = disabled
    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
    : 'bg-white text-gray-900'

  const classes = [baseStyles, disabledStyles, className].join(' ')

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className={classes}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
