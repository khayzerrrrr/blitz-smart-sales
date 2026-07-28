"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Database,
  TrendingUp,
  CheckCircle2,
  CalendarCheck,
  Building2,
  Target,
  Users,
} from "lucide-react"
import { fetchAllSchools } from "@/services/school.service"
import { fetchPipelines } from "@/services/pipeline.service"
import { fetchVisits } from "@/services/visit.service"
import { useAuthStore } from "@/store/useAuthStore"
import { DEFAULT_PROPOSAL_PRICE } from "@/lib/constants"

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export default function DashboardPage() {
  const today = new Date().toISOString().split("T")[0]
  const [regionalFilter, setRegionalFilter] = useState("all")
  const user = useAuthStore((s) => s.user)
  const userRole = user?.user_metadata?.role ?? "sales"

  const { data: schools = [] } = useQuery({
    queryKey: ["schools"],
    queryFn: fetchAllSchools,
  })

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: fetchPipelines,
  })

  const { data: visits = [] } = useQuery({
    queryKey: ["visits"],
    queryFn: () => fetchVisits(),
  })

  const regionals = useMemo(
    () => [...new Set(schools.map((s) => s.regional).filter(Boolean))],
    [schools]
  )

  const filteredVisits = useMemo(() => {
    if (regionalFilter === "all") return visits
    return visits.filter((v) => {
      const school = schools.find((s) => s.id === v.school_id)
      return school?.regional === regionalFilter
    })
  }, [visits, schools, regionalFilter])

  const filteredPipelines = useMemo(() => {
    if (regionalFilter === "all") return pipelines
    return pipelines.filter((p) => {
      const school = schools.find((s) => s.id === p.school_id)
      return school?.regional === regionalFilter
    })
  }, [pipelines, schools, regionalFilter])

  const filteredSchools = useMemo(() => {
    if (regionalFilter === "all") return schools
    return schools.filter((s) => s.regional === regionalFilter)
  }, [schools, regionalFilter])

  const kunjunganHariIni = filteredVisits.filter((v) => v.visit_date === today).length
  const totalSekolah = filteredSchools.length
  const prospekAktif = filteredPipelines.filter((p) => p.stage === "Prospect").length

  const totalPotentialRevenue = filteredPipelines
    .filter((p) => p.stage === "Proposal")
    .reduce((sum, p) => {
      const price = p.offer_price ?? DEFAULT_PROPOSAL_PRICE
      return sum + price * (p.total_students ?? 0)
    }, 0)

  const totalRealizedRevenue = filteredPipelines
    .filter((p) => p.stage === "MoU")
    .reduce((sum, p) => {
      const price = p.deal_price ?? 0
      return sum + price * (p.total_students ?? 0)
    }, 0)

  const totalMarketingRevenue = Math.round(totalRealizedRevenue * 0.1)

  const weeklyVisits = (() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
    const result: { label: string; visits: number }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = d.toISOString().split("T")[0]
      const count = filteredVisits.filter((v) => v.visit_date === dateStr).length
      result.push({ label: DAY_NAMES[d.getDay()], visits: count })
    }
    return result
  })()
  const maxVisits = Math.max(...weeklyVisits.map((d) => d.visits), 1)

  const salesPerformance = useMemo(() => {
    if (userRole !== "admin") return []
    const grouped: Record<string, {
      name: string
      totalVisits: number
      weeklyVisits: number
      totalPipelines: number
      mouRevenue: number
    }> = {}

    for (const v of visits) {
      const key = v.user_id
      if (!grouped[key]) {
        grouped[key] = { name: v.user_name, totalVisits: 0, weeklyVisits: 0, totalPipelines: 0, mouRevenue: 0 }
      }
      grouped[key].totalVisits++
      const today = new Date()
      const dayOfWeek = today.getDay()
      const monday = new Date(today)
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
      if (new Date(v.visit_date) >= monday) {
        grouped[key].weeklyVisits++
      }
    }

    for (const p of pipelines) {
      if (!p.created_by) continue
      const key = p.created_by
      if (!grouped[key]) {
        grouped[key] = { name: "Unknown", totalVisits: 0, weeklyVisits: 0, totalPipelines: 0, mouRevenue: 0 }
      }
      grouped[key].totalPipelines++
      if (p.stage === "MoU") {
        const price = p.deal_price ?? 0
        grouped[key].mouRevenue += price * (p.total_students ?? 0)
      }
    }

    return Object.entries(grouped)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.mouRevenue - a.mouRevenue)
  }, [visits, pipelines, userRole])

  const revenueCards = [
    {
      title: "Total Stock Database",
      value: totalSekolah,
      subtitle: "sekolah",
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Potensi Revenue (Proposal)",
      value: formatRupiah(totalPotentialRevenue),
      subtitle: "est. bulanan",
      icon: TrendingUp,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      title: "Realized Revenue (MoU)",
      value: formatRupiah(totalRealizedRevenue),
      subtitle: `Marketing 10%: ${formatRupiah(totalMarketingRevenue)}`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ]

  const statCards = [
    {
      title: "Kunjungan Hari Ini",
      value: kunjunganHariIni,
      icon: CalendarCheck,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Total Sekolah",
      value: totalSekolah,
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Prospek Aktif",
      value: prospekAktif,
      icon: Target,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan performa penjualan, revenue, dan kunjungan.
          </p>
        </div>
        <Select value={regionalFilter} onValueChange={(v) => setRegionalFilter(v ?? "all")}>
          <SelectTrigger className="border-border bg-muted text-foreground w-full sm:w-48">
            <SelectValue placeholder="Filter Regional" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-foreground">
            <SelectItem value="all">Semua Regional</SelectItem>
            {regionals.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {revenueCards.map((card) => (
          <Card key={card.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`size-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground truncate">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`size-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Kunjungan Minggu Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-48">
            {weeklyVisits.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {item.visits || ""}
                </span>
                <div
                  className="w-full rounded-t-md bg-orange-500/80 transition-all hover:bg-orange-500"
                  style={{ height: `${Math.max((item.visits / maxVisits) * 140, 4)}px` }}
                />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {userRole === "admin" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="size-5 text-orange-500" />
              Pencapaian Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-3 px-2 font-medium">Sales</th>
                    <th className="text-center py-3 px-2 font-medium">Kunjungan</th>
                    <th className="text-center py-3 px-2 font-medium">Minggu Ini</th>
                    <th className="text-center py-3 px-2 font-medium">Pipeline</th>
                    <th className="text-right py-3 px-2 font-medium">Revenue (MoU)</th>
                  </tr>
                </thead>
                <tbody>
                  {salesPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        Belum ada data kunjungan atau pipeline.
                      </td>
                    </tr>
                  ) : (
                    salesPerformance.map((s) => (
                      <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2 font-medium text-foreground">{s.name}</td>
                        <td className="py-3 px-2 text-center text-muted-foreground">{s.totalVisits}</td>
                        <td className="py-3 px-2 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-500">
                            {s.weeklyVisits}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-muted-foreground">{s.totalPipelines}</td>
                        <td className="py-3 px-2 text-right font-medium text-emerald-400">
                          {formatRupiah(s.mouRevenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
