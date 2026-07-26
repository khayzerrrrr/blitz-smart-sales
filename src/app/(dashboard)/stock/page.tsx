"use client"

import { useCallback, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDropzone } from "react-dropzone"
import { Upload, Search, Trash2, Database, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import {
  fetchAllSchools,
  createSchoolsBatch,
  deleteSchool,
  type CreateSchoolInput,
} from "@/services/school.service"
import * as XLSX from "xlsx"

function parseFile(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error("File kosong atau tidak dapat dibaca."))
          return
        }
        if (ext === "json") {
          const parsed = JSON.parse(data as string)
          resolve(Array.isArray(parsed) ? parsed : [parsed])
          return
        }
        const workbook =
          ext === "csv"
            ? XLSX.read(data, { type: "string", raw: true })
            : XLSX.read(data, { type: "array", raw: true })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) { resolve([]); return }
        const sheet = workbook.Sheets[sheetName]
        resolve(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" }))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error("Gagal membaca file"))
    if (ext === "json" || ext === "csv") {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  })
}

function parseSchoolRow(row: Record<string, unknown>): CreateSchoolInput | null {
  const name = String(row.name ?? row.Name ?? row.NAME ?? row["Nama Sekolah"] ?? "").trim()
  if (!name) return null
  return {
    name,
    address: String(row.address ?? row.Address ?? row.Alamat ?? "").trim(),
    regional: String(row.regional ?? row.Regional ?? "").trim(),
    total_students: Number(row.total_students ?? row.totalStudents ?? row["Total Siswa"] ?? 0) || 0,
    total_teachers: Number(row.total_teachers ?? row.totalTeachers ?? row["Total Guru"] ?? 0) || 0,
    latitude: 0,
    longitude: 0,
    contact_person: String(row.contact_person ?? row.contactPerson ?? row["Kontak Person"] ?? "").trim(),
  }
}

export default function StockPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ["schools"],
    queryFn: fetchAllSchools,
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string; name: string }) => deleteSchool(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schools"] })
      toast.success(`"${variables.name}" dihapus.`)
    },
    onError: (err: Error) => toast.error(`Gagal hapus: ${err.message}`),
  })

  const batchMutation = useMutation({
    mutationFn: createSchoolsBatch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["schools"] })
      toast.success(`${data.length} sekolah berhasil di-upload!`)
    },
    onError: (err: Error) => toast.error(`Gagal upload: ${err.message}`),
  })

  const onDrop = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      try {
        const rows = await parseFile(files[0])
        const schools = rows.map(parseSchoolRow).filter(Boolean) as CreateSchoolInput[]
        if (schools.length === 0) {
          toast.error("Tidak ada data sekolah valid di file.")
          return
        }
        batchMutation.mutate(schools)
      } catch (err) {
        toast.error(`Gagal baca file: ${err instanceof Error ? err.message : "Format tidak valid"}`)
      }
    },
    [batchMutation]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
      "application/json": [".json"],
    },
    maxFiles: 1,
  })

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.regional ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id: string, name: string) => {
    deleteMutation.mutate({ id, name })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Stock Database
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload file Excel, CSV, atau JSON untuk mengelola database sekolah.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
              isDragActive
                ? "border-orange-500 bg-orange-500/5"
                : "border-border hover:border-foreground/20 bg-muted/30"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-4">
                <FileSpreadsheet className="size-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drag & drop file Excel / CSV / JSON
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Format: name, address, regional, total_students, total_teachers
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-border text-muted-foreground hover:bg-muted"
              >
                <Upload className="size-4 mr-2" />
                Browse Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Database className="size-5 text-orange-400" />
              <CardTitle className="text-base font-semibold text-foreground">
                Daftar Stock Database ({schools.length})
              </CardTitle>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau regional..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-border bg-muted text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Memuat data...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Nama Sekolah</TableHead>
                  <TableHead className="text-muted-foreground">Regional</TableHead>
                  <TableHead className="text-muted-foreground text-right">Siswa</TableHead>
                  <TableHead className="text-muted-foreground text-right">Guru</TableHead>
                  <TableHead className="text-muted-foreground text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {schools.length === 0
                        ? "Belum ada data. Jalankan SQL migration untuk seed data."
                        : "Tidak ditemukan."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((school) => (
                    <TableRow key={school.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{school.name}</TableCell>
                      <TableCell className="text-muted-foreground">{school.regional}</TableCell>
                      <TableCell className="text-right text-foreground">
                        {school.total_students}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        {school.total_teachers}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-red-400"
                          onClick={() => handleDelete(school.id, school.name)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
