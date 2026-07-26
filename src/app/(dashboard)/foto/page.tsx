"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"

export default function FotoPage() {
  const [search, setSearch] = useState("")
  const [lightbox, setLightbox] = useState<string | null>(null)

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("school_photos")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })

  const filtered = photos.filter(
    (p) =>
      (p.school_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.uploaded_by ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Foto Sekolah</h1>
          <p className="text-sm text-muted-foreground">Galeri dokumentasi kunjungan.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Upload className="size-4" />
          Upload Foto
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari sekolah atau pengupload..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 border-border bg-muted text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-muted-foreground">Memuat foto...</p>
      ) : filtered.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Upload className="size-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Belum ada foto.</p>
            <p className="text-sm text-muted-foreground">Upload foto dari kunjungan sekolah.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((photo, i) => (
            <div
              key={photo.id ?? i}
              onClick={() => setLightbox(photo.storage_path)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={`${photo.storage_path}?random=${photo.id}`}
                  alt={photo.school_name ?? ""}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-foreground">{photo.school_name}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{photo.uploaded_by}</span>
                  <span>{format(new Date(photo.created_at), "dd MMM yyyy")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-muted p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
          <img
            src={lightbox}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
