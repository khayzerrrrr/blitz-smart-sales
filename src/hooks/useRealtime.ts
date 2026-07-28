"use client"

import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

type RealtimeEvent = "*" | "INSERT" | "UPDATE" | "DELETE"

interface UseRealtimeOptions {
  table: string
  queryKey: readonly unknown[]
  schema?: string
  event?: RealtimeEvent
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected"

export function useRealtime({
  table,
  queryKey,
  schema = "public",
  event = "*",
}: UseRealtimeOptions) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const keyRef = useRef(queryKey)

  useEffect(() => {
    keyRef.current = queryKey
  })

  useEffect(() => {
    const supabase = createClient()
    const channelName = `realtime:${table}`

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event, schema, table },
        () => {
          queryClient.invalidateQueries({ queryKey: keyRef.current })
        }
      )
      .subscribe((subStatus) => {
        if (subStatus === "SUBSCRIBED") {
          setStatus("connected")
        } else if (subStatus === "CHANNEL_ERROR" || subStatus === "TIMED_OUT") {
          setStatus("disconnected")
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, queryClient, event, schema])

  return { status }
}
