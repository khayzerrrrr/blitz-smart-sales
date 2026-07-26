"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SchoolStock } from "@/types"

interface SchoolComboboxProps {
  schools: SchoolStock[]
  value: string
  onChange: (schoolId: string) => void
  onCreateNew: (name: string) => void
  placeholder?: string
}

export function SchoolCombobox({
  schools,
  value,
  onChange,
  onCreateNew,
  placeholder = "Pilih Sekolah",
}: SchoolComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = schools.find((s) => s.id === value)

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regional.toLowerCase().includes(search.toLowerCase())
  )

  const showCreateNew =
    search.length >= 2 && !filtered.some((s) => s.name.toLowerCase() === search.toLowerCase())

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
          "border-border bg-muted",
          open ? "border-orange-500" : "hover:border-border"
        )}
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? selected.name : placeholder}
        </span>
        <Search className="size-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-muted shadow-xl">
          <div className="p-2">
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama sekolah..."
              className="border-border bg-card text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && !showCreateNew && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                Tidak ditemukan.
              </p>
            )}

            {filtered.map((school) => (
              <button
                key={school.id}
                type="button"
                onClick={() => {
                  onChange(school.id)
                  setOpen(false)
                  setSearch("")
                }}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                  school.id === value && "bg-orange-500/10"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate">{school.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {school.regional} · {school.totalStudents} siswa
                  </p>
                </div>
              </button>
            ))}

            {showCreateNew && (
              <button
                type="button"
                onClick={() => {
                  onCreateNew(search)
                  setOpen(false)
                  setSearch("")
                }}
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-orange-400 transition-colors hover:bg-orange-500/10"
              >
                <Plus className="size-4 shrink-0" />
                <span>Create New School: &quot;{search}&quot;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
