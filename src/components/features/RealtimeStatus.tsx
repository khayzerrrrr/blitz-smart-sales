"use client"

import { WifiOff, Loader2 } from "lucide-react"
import type { ConnectionStatus } from "@/hooks/useRealtime"

interface RealtimeStatusProps {
  status: ConnectionStatus
  label?: string
}

export function RealtimeStatus({ status, label }: RealtimeStatusProps) {
  if (status === "connected") return null

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs shadow-lg">
      {status === "connecting" ? (
        <>
          <Loader2 className="size-3 animate-spin text-amber-400" />
          <span className="text-muted-foreground">{label ?? "Menyambung..."}</span>
        </>
      ) : (
        <>
          <WifiOff className="size-3 text-red-400" />
          <span className="text-muted-foreground">{label ?? "Offline"}</span>
        </>
      )}
    </div>
  )
}
