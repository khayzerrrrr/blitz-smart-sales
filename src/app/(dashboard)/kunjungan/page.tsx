"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRealtime } from "@/hooks/useRealtime"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, MapPin, Camera } from "lucide-react"
import { format } from "date-fns"
import { VisitForm } from "@/components/features/VisitForm"
import { fetchVisits, type VisitRecord } from "@/services/visit.service"

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  Selesai: "default",
  Proses: "secondary",
  Dijadwalkan: "outline",
}

export default function KunjunganPage() {
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useRealtime({ table: "visits", queryKey: ["visits"] })

  const { data: visitsRaw = [], isLoading } = useQuery({
    queryKey: ["visits"],
    queryFn: () => fetchVisits(),
  })

  const filtered = useMemo(() => {
    let result: VisitRecord[] = visitsRaw
    if (dateFilter) {
      result = result.filter((v) => v.visit_date === dateFilter)
    }
    if (statusFilter !== "all") {
      result = result.filter((v) => v.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (v) =>
          v.school_name.toLowerCase().includes(q) ||
          v.user_name.toLowerCase().includes(q) ||
          v.notes.toLowerCase().includes(q)
      )
    }
    return result
  }, [visitsRaw, dateFilter, statusFilter, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Kunjungan</h1>
          <p className="text-sm text-muted-foreground">Kelola data kunjungan ke sekolah.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
              <Plus className="size-4" />
              Tambah Kunjungan
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">Tambah Kunjungan Baru</DialogTitle>
            </DialogHeader>
            <VisitForm onSubmit={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              Daftar Kunjungan
            </CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-border bg-muted text-foreground placeholder:text-muted-foreground w-full sm:w-56"
                />
              </div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border-border bg-muted text-foreground w-full sm:w-44"
              />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                <SelectTrigger className="border-border bg-muted text-foreground w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-foreground">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                  <SelectItem value="Proses">Proses</SelectItem>
                  <SelectItem value="Dijadwalkan">Dijadwalkan</SelectItem>
                </SelectContent>
              </Select>
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
                  <TableHead className="text-muted-foreground">Tanggal</TableHead>
                  <TableHead className="text-muted-foreground">Sekolah</TableHead>
                  <TableHead className="text-muted-foreground">Sales</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Catatan</TableHead>
                  <TableHead className="text-muted-foreground w-16">GPS</TableHead>
                  <TableHead className="text-muted-foreground w-16">Foto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {visitsRaw.length === 0
                        ? "Belum ada data kunjungan. Buat kunjungan pertama!"
                        : "Tidak ditemukan."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((visit) => (
                    <TableRow
                      key={visit.id}
                      className="border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        const win = window.open(`/kunjungan/${visit.id}`, "_self")
                        if (win) win.opener = null
                      }}
                    >
                      <TableCell className="text-foreground">
                        {format(new Date(visit.visit_date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {visit.school_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{visit.user_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[visit.status] ?? "secondary"}
                          className={
                            visit.status === "Selesai"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : visit.status === "Proses"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }
                        >
                          {visit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {visit.notes}
                      </TableCell>
                      <TableCell>
                        {visit.latitude != null ? (
                          <MapPin className="size-4 text-green-400" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Camera className="size-4 text-muted-foreground" />
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
