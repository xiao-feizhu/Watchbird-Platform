'use client'

import { type InputHTMLAttributes, type ChangeEvent } from 'react'

type InputType = 'text' | 'email' | 'tel' | 'password' | 'number' | 'date'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  type?: InputType
  label?: string
  error?: boolean
  errorMessage?: string
  onChange?: (value: string) => void
}

export function Input({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  errorMessage,
  required = false,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 11)}`

  const baseStyles =
    'block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0'

  const stateStyles = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'

  const disabledStyles = disabled
    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
    : 'bg-white text-gray-900'

  const classes = [baseStyles, stateStyles, disabledStyles, className].join(' ')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={classes}
        {...props}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}
