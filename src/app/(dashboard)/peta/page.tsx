"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "lucide-react"
import { fetchAllSchools } from "@/services/school.service"
import dynamic from "next/dynamic"

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted">
      <p className="text-muted-foreground">Memuat peta...</p>
    </div>
  ),
})

export default function PetaPage() {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null)

  const { data: schools = [] } = useQuery({
    queryKey: ["schools"],
    queryFn: fetchAllSchools,
  })

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId)

  const schoolsWithCoords = schools.filter(
    (s) => s.latitude && s.longitude
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Peta Sekolah</h1>
        <p className="text-sm text-muted-foreground">Visualisasi lokasi sekolah di peta interaktif.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="w-full aspect-[16/10]">
                <LeafletMap
                  schools={schoolsWithCoords}
                  selectedSchoolId={selectedSchoolId}
                  onSelectSchool={setSelectedSchoolId}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                Daftar Sekolah
              </CardTitle>
              <p className="text-xs text-muted-foreground">{schoolsWithCoords.length} sekolah dengan koordinat</p>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[420px] overflow-y-auto">
              {schoolsWithCoords.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    setSelectedSchoolId(selectedSchoolId === s.id ? null : s.id)
                  }
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    selectedSchoolId === s.id
                      ? "border-orange-500 bg-orange-500/5"
                      : "border-border bg-muted/30 hover:border-foreground/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Navigation
                      className={`size-4 mt-0.5 shrink-0 ${
                        selectedSchoolId === s.id ? "text-orange-500" : "text-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.regional}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {s.total_students} siswa · {s.total_teachers} guru
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedSchool && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground">{selectedSchool.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{selectedSchool.address}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Lat: {Number(selectedSchool.latitude).toFixed(6)}</span>
              <span>Long: {Number(selectedSchool.longitude).toFixed(6)}</span>
              <span>Siswa: {selectedSchool.total_students}</span>
              <span>Kontak: {selectedSchool.contact_person}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
