"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Database,
  TrendingUp,
  CheckCircle2,
  CalendarCheck,
  Building2,
  Target,
} from "lucide-react"
import { fetchAllSchools } from "@/services/school.service"
import { fetchPipelines } from "@/services/pipeline.service"
import { fetchVisits } from "@/services/visit.service"
import { DEFAULT_PROPOSAL_PRICE } from "@/lib/constants"

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export default function DashboardPage() {
  const today = new Date().toISOString().split("T")[0]

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

  const kunjunganHariIni = visits.filter((v) => v.visit_date === today).length
  const totalSekolah = schools.length
  const prospekAktif = pipelines.filter((p) => p.stage === "Prospect").length

  const totalPotentialRevenue = pipelines
    .filter((p) => p.stage === "Proposal")
    .reduce((sum, p) => {
      const price = p.offer_price ?? DEFAULT_PROPOSAL_PRICE
      return sum + price * (p.total_students ?? 0)
    }, 0)

  const totalRealizedRevenue = pipelines
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
      const count = visits.filter((v) => v.visit_date === dateStr).length
      result.push({ label: DAY_NAMES[d.getDay()], visits: count })
    }
    return result
  })()
  const maxVisits = Math.max(...weeklyVisits.map((d) => d.visits), 1)

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan performa penjualan, revenue, dan kunjungan.
        </p>
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
    </div>
  )
}
