"use client"

import { useState, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, X, Upload, ImageIcon } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { fetchAllSchools } from "@/services/school.service"
import { fetchPhotos, createPhoto, type PhotoRecord } from "@/services/photo.service"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"

export default function FotoPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
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
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger>
            <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
              <Upload className="size-4" />
              Upload Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Upload Foto Sekolah</DialogTitle>
            </DialogHeader>
            <UploadForm onSuccess={() => {
              setUploadOpen(false)
              queryClient.invalidateQueries({ queryKey: ["photos"] })
            }} />
          </DialogContent>
        </Dialog>
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
            <ImageIcon className="size-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {photos.length === 0
                ? "Belum ada foto. Jalankan SQL untuk membuat tabel school_photos dan bucket storage."
                : "Tidak ditemukan."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((photo, i) => {
            const url = photo.storage_path ?? ""
            return (
              <div
                key={photo.id ?? i}
                onClick={() => setLightbox(url)}
                className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={url}
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
            )
          })}
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

function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [selectedSchool, setSelectedSchool] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const authUser = useAuthStore((s) => s.user)
  const userName = authUser?.user_metadata?.name ?? authUser?.email ?? "User"

  const { data: schools = [] } = useQuery({
    queryKey: ["schools"],
    queryFn: fetchAllSchools,
  })

  const handleUpload = async () => {
    if (!file || !selectedSchool) {
      toast.error("Pilih sekolah dan file foto!")
      return
    }
    setUploading(true)
    try {
      const supabase = createClient()
      const school = schools.find((s) => s.id === selectedSchool)
      const fileExt = file.name.split(".").pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `school-photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("school-photos")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicUrl } = supabase.storage
        .from("school-photos")
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase.from("school_photos").insert([
        {
          school_id: selectedSchool,
            school_name: school?.name ?? "",
            uploaded_by: userName,
          storage_path: publicUrl.publicUrl,
        },
      ])

      if (dbError) throw dbError

      toast.success("Foto berhasil diupload!")
      onSuccess()
    } catch (err) {
      toast.error(`Gagal upload: ${err instanceof Error ? err.message : "Unknown"}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Sekolah</label>
        <Select value={selectedSchool} onValueChange={(v) => v && setSelectedSchool(v)}>
          <SelectTrigger className="border-border bg-muted text-foreground">
            <SelectValue placeholder="Pilih Sekolah" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-foreground">
            {schools.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">File Foto</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 hover:border-orange-500/50 hover:bg-muted/30 transition-colors"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          {file ? (
            <div className="text-center">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="mx-auto max-h-40 rounded-lg mb-2"
              />
              <p className="text-sm text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          ) : (
            <>
              <Upload className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Klik untuk pilih foto</p>
            </>
          )}
        </div>
      </div>

      <Button
        onClick={handleUpload}
        className="w-full bg-orange-500 hover:bg-orange-600"
        disabled={uploading}
      >
        {uploading ? "Mengupload..." : "Upload Foto"}
      </Button>
    </div>
  )
}
