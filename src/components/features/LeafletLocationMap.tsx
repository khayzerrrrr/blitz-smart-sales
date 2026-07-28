"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const userIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const schoolIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface LeafletLocationMapProps {
  latitude: number
  longitude: number
  schoolLatitude?: number
  schoolLongitude?: number
  schoolName?: string
  onLocationChange: (lat: number, lng: number) => void
}

export default function LeafletLocationMap({
  latitude,
  longitude,
  schoolLatitude,
  schoolLongitude,
  schoolName,
  onLocationChange,
}: LeafletLocationMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 16,
      zoomControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [latitude, longitude])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
    }

    const marker = L.marker([latitude, longitude], { icon: userIcon, draggable: true })
      .addTo(map)
      .bindPopup("<strong>Lokasi Anda</strong><br/><small>Geser marker untuk menyesuaikan</small>")
      .openPopup()

    marker.on("dragend", () => {
      const pos = marker.getLatLng()
      onLocationChange(pos.lat, pos.lng)
    })

    marker.on("click", () => {
      marker.dragging?.enable()
    })

    userMarkerRef.current = marker

    map.setView([latitude, longitude], map.getZoom() < 15 ? 16 : map.getZoom())
  }, [latitude, longitude, onLocationChange])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (schoolLatitude != null && schoolLongitude != null) {
      L.marker([schoolLatitude, schoolLongitude], {
        icon: schoolIcon,
      })
        .addTo(map)
        .bindPopup(`<strong>${schoolName ?? "Sekolah"}</strong>`)

      const bounds = L.latLngBounds([
        [latitude, longitude],
        [schoolLatitude, schoolLongitude],
      ])
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
    } else {
      map.setView([latitude, longitude], 16)
    }
  }, [schoolLatitude, schoolLongitude, schoolName, latitude, longitude])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handleClick = (e: L.LeafletMouseEvent) => {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    }

    map.on("click", handleClick)
    return () => {
      map.off("click", handleClick)
    }
  }, [onLocationChange])

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: 220 }}
    />
  )
}
