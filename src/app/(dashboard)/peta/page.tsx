"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation } from "lucide-react"
import { fetchAllSchools } from "@/services/school.service"

export default function PetaPage() {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)

  const { data: schools = [] } = useQuery({
    queryKey: ["schools"],
    queryFn: fetchAllSchools,
  })

  const school = selectedSchool ? schools.find((s) => s.id === selectedSchool) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Peta Sekolah</h1>
        <p className="text-sm text-muted-foreground">Visualisasi lokasi sekolah di peta.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[16/10] bg-muted flex items-center justify-center">
                <div className="text-center space-y-3">
                  <MapPin className="size-12 mx-auto text-orange-500 opacity-50" />
                  <p className="text-muted-foreground text-sm">Peta interaktif akan dimuat di sini</p>
                  <p className="text-muted-foreground/60 text-xs">(React Leaflet membutuhkan konfigurasi client-side)</p>
                </div>
                {schools.map((s) => (
                  <div
                    key={s.id}
                    className="absolute cursor-pointer transition-transform hover:scale-125"
                    style={{
                      left: `${((Number(s.longitude ?? 0) + 180) / 360) * 100}%`,
                      top: `${((90 - Number(s.latitude ?? 0)) / 180) * 100}%`,
                    }}
                    onClick={() => setSelectedSchool(selectedSchool === s.id ? null : s.id)}
                  >
                    <div
                      className={`size-3 rounded-full border-2 border-white shadow-lg ${
                        selectedSchool === s.id
                          ? "bg-orange-500 ring-2 ring-orange-500/50"
                          : "bg-blue-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Daftar Sekolah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
              {schools.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSchool(s.id === selectedSchool ? null : s.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    selectedSchool === s.id
                      ? "border-orange-500 bg-orange-500/5"
                      : "border-border bg-muted/30 hover:border-foreground/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Navigation
                      className={`size-4 mt-0.5 shrink-0 ${
                        selectedSchool === s.id ? "text-orange-500" : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.regional}</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {school && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground">{school.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{school.address}</p>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>Lat: {Number(school.latitude).toFixed(4)}</span>
              <span>Long: {Number(school.longitude).toFixed(4)}</span>
              <span>Siswa: {school.total_students}</span>
              <span>{school.contact_person}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
