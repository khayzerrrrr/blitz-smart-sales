"use client"

import { useState } from "react"
import { MapPin, Loader2, Crosshair, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const LeafletLocationMap = dynamic(() => import("./LeafletLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full rounded-lg bg-muted">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  schoolLatitude?: number
  schoolLongitude?: number
  schoolName?: string
  onChange: (lat: number, lng: number) => void
  onCaptureStart?: () => void
}

export function LocationPicker({
  latitude,
  longitude,
  schoolLatitude,
  schoolLongitude,
  schoolName,
  onChange,
  onCaptureStart,
}: LocationPickerProps) {
  const [gpsLoading, setGpsLoading] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung GPS")
      return
    }
    setGpsLoading(true)
    onCaptureStart?.()
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        onChange(lat, lng)
        setMapOpen(true)
        toast.success(`Lokasi: ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        setGpsLoading(false)
      },
      (err) => {
        toast.error(`GPS gagal: ${err.message}`)
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Lokasi GPS</span>
        {latitude != null && (
          <span className="text-xs font-mono text-emerald-400">
            {latitude.toFixed(5)}, {longitude?.toFixed(5)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCaptureGPS}
          disabled={gpsLoading}
          className="gap-2 border-border text-muted-foreground hover:text-foreground"
        >
          {gpsLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Crosshair className="size-4" />
          )}
          Ambil GPS
        </Button>

        {latitude != null && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setMapOpen(!mapOpen)}
            className="gap-2 border-border text-muted-foreground hover:text-foreground"
          >
            <MapPin className="size-4" />
            {mapOpen ? "Tutup Peta" : "Lihat Peta"}
          </Button>
        )}
      </div>

      {latitude != null && longitude != null && mapOpen && (
        <div className="rounded-lg overflow-hidden border border-border">
          <div className="h-56 w-full relative">
            <LeafletLocationMap
              latitude={latitude!}
              longitude={longitude!}
              schoolLatitude={schoolLatitude}
              schoolLongitude={schoolLongitude}
              schoolName={schoolName}
              onLocationChange={onChange}
            />
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Klik peta untuk menyesuaikan lokasi
            </span>
            <GripVertical className="size-3 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  )
}
