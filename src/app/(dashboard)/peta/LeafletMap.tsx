"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const selectedIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface SchoolCoord {
  id: string
  name: string
  address: string
  regional: string
  latitude: number
  longitude: number
  total_students: number
}

interface LeafletMapProps {
  schools: SchoolCoord[]
  selectedSchoolId: string | null
  onSelectSchool: (id: string | null) => void
}

export default function LeafletMap({
  schools,
  selectedSchoolId,
  onSelectSchool,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView([-2.5, 118], 5)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => map.removeLayer(m))
    markersRef.current = []

    const bounds = L.latLngBounds([])

    schools.forEach((school) => {
      const lat = Number(school.latitude)
      const lng = Number(school.longitude)
      if (isNaN(lat) || isNaN(lng)) return

      const marker = L.marker([lat, lng], {
        icon: school.id === selectedSchoolId ? selectedIcon : defaultIcon,
      })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:180px">
            <strong>${school.name}</strong><br/>
            <small>${school.address}</small><br/>
            <small>${school.regional} · ${school.total_students} siswa</small>
          </div>`
        )

      marker.on("click", () => onSelectSchool(school.id))
      markersRef.current.push(marker)
      bounds.extend([lat, lng])
    })

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 })
    }
  }, [schools, selectedSchoolId, onSelectSchool])

  useEffect(() => {
    markersRef.current.forEach((m, i) => {
      const sid = schools[i]?.id ?? null
      m.setIcon(sid === selectedSchoolId ? selectedIcon : defaultIcon)
    })
  }, [selectedSchoolId, schools])

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: 400 }}
    />
  )
}
