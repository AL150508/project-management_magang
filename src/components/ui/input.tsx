import * as React from "react"
import { AlertCircle } from "lucide-react"

import { cn } from "@/lib & database connection/utils"

// Input: elemen input teks standar dengan style konsisten dan state fokus/error.

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
  email?: boolean
  number?: boolean
  min?: number
  max?: number
}

export interface InputProps extends React.ComponentProps<"input"> {
  validation?: ValidationRule
  showValidation?: boolean
  errorMessage?: string
}

function Input({ className, type, validation, onChange, showValidation = true, errorMessage, "aria-invalid": ariaInvalid, ...props }: InputProps) {
  const [internalValue, setInternalValue] = React.useState(props.value?.toString() || "")
  const [error, setError] = React.useState<string | null>(null)
  const [touched, setTouched] = React.useState(false)
  
  // Sync internal value with props.value for controlled components
  React.useEffect(() => {
    if (props.value !== undefined) {
      setInternalValue(props.value.toString())
    }
  }, [props.value])
  
  const currentValue = props.value !== undefined ? props.value.toString() : internalValue
  
  const validateValue = React.useCallback((val: string): string | null => {
    if (!validation) return null
    
    // Required validation
    if (validation.required && (!val || val.trim() === "")) {
      return "Field ini wajib diisi"
    }
    
    // Skip other validations if empty and not required
    if (!val || val.trim() === "") return null
    
    // Email validation
    if (validation.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(val)) {
        return "Format email tidak valid"
      }
    }
    
    // Number validation
    if (validation.number) {
      const num = parseFloat(val)
      if (isNaN(num)) {
        return "Harus berupa angka"
      }
      if (validation.min !== undefined && num < validation.min) {
        return `Nilai minimum ${validation.min}`
      }
      if (validation.max !== undefined && num > validation.max) {
        return `Nilai maksimum ${validation.max}`
      }
    }
    
    // Length validation
    if (validation.minLength && val.length < validation.minLength) {
      return `Minimal ${validation.minLength} karakter`
    }
    if (validation.maxLength && val.length > validation.maxLength) {
      return `Maksimal ${validation.maxLength} karakter`
    }
    
    // Pattern validation
    if (validation.pattern && !validation.pattern.test(val)) {
      return "Format tidak sesuai"
    }
    
    // Custom validation
    if (validation.custom) {
      return validation.custom(val)
    }
    
    return null
  }, [validation])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    // Update internal value only if not controlled
    if (props.value === undefined) {
      setInternalValue(newValue)
    }
    
    // Always call original onChange for backward compatibility
    if (onChange) {
      onChange(e)
    }
    
    // Handle validation if enabled
    if (validation) {
      if (touched || newValue !== "") {
        const validationError = validateValue(newValue)
        setError(validationError)
      }
    }
  }
  
  const handleBlur = () => {
    if (validation) {
      setTouched(true)
      const validationError = validateValue(currentValue)
      setError(validationError)
    }
  }
  
  const hasError = validation && showValidation && touched && (error || errorMessage)
  const displayError = errorMessage || error
  
  // If no validation, render simple input (backward compatibility)
  if (!validation) {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        onChange={onChange}
        {...props}
      />
    )
  }
  
  // Render with validation
  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            // Tambahkan styling error seperti referensi
            hasError 
              ? "border-red-500 bg-red-50 text-red-900 placeholder:text-red-400 focus-visible:ring-red-500/20 pr-10" 
              : "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={hasError ? "true" : undefined}
          {...props}
        />
        {hasError && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-sm text-red-600 mt-1">
          {displayError}
        </p>
      )}
    </div>
  )
}

export { Input }
