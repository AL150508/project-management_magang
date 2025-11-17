import * as React from "react"

import { cn } from "@/lib & database connection/utils"

// Textarea: input teks multi-baris untuk formulir dengan style konsisten.
//
// Kapan dipakai:
// - Input deskripsi, catatan, komentar yang panjang
//
// Props umum:
// - rows, placeholder, disabled, defaultValue/value, onChange
// - className untuk penyesuaian style
//
// Contoh:
// <Textarea rows={4} placeholder="Tulis catatan..." />

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
