"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { fetchVisitById } from "@/services/visit.service"

export default function KunjunganDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { data: visit, isLoading } = useQuery({
    queryKey: ["visits", id],
    queryFn: () => fetchVisitById(id),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Kunjungan tidak ditemukan.</p>
        <Link href="/kunjungan">
          <Button variant="link" className="mt-2 text-orange-500">
            Kembali ke daftar
          </Button>
        </Link>
      </div>
    )
  }

  const statusVariant = {
    Selesai: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Proses: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Dijadwalkan: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  }[visit.status] ?? ""

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/kunjungan">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Detail Kunjungan
          </h1>
          <p className="text-sm text-muted-foreground">ID: {visit.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Informasi Kunjungan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Tanggal</p>
                <p className="text-sm text-foreground">
                  {format(new Date(visit.visit_date), "EEEE, dd MMMM yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge className={statusVariant}>{visit.status}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sekolah</p>
                <p className="text-sm text-foreground">{visit.school_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sales</p>
                <p className="text-sm text-foreground">{visit.user_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nama PIC</p>
                <p className="text-sm text-foreground">{visit.pic_name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nomor HP/WA</p>
                <p className="text-sm text-foreground">{visit.pic_phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Siswa</p>
                <p className="text-sm text-foreground">{visit.total_students}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Guru</p>
                <p className="text-sm text-foreground">{visit.total_teachers}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bilingual</p>
                <p className="text-sm text-foreground">
                  {visit.has_bilingual ? "Ya" : "Tidak"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {visit.notes}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
