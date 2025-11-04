"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconSearch } from "@tabler/icons-react"

export function DudiSearch() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [pageSize, setPageSize] = React.useState(6)

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari perusahaan, bidang usaha, lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Display Control */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 whitespace-nowrap">Tampilkan:</span>
        <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
          <SelectTrigger className="w-20 h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="9">9</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="15">15</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-600 whitespace-nowrap">per halaman</span>
      </div>
    </div>
  )
}

