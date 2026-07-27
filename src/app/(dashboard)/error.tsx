"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
      <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle className="size-6 text-red-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Terjadi kesalahan
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          {error.message ?? "Halaman gagal dimuat."}
        </p>
      </div>
      <Button onClick={reset} className="bg-orange-500 hover:bg-orange-600">
        Coba Lagi
      </Button>
    </div>
  )
}
