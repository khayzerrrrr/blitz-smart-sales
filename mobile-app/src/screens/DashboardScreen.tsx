import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { supabase } from "../lib/supabase"

export default function DashboardScreen() {
  const [stats, setStats] = useState({ schools: 0, pipelines: 0, potential: 0, realized: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data: schools } = await supabase.from("schools").select("id", { count: "exact", head: true })
      const { data: pipelines } = await supabase.from("pipelines").select("*")

      const proposal = (pipelines ?? []).filter((p) => p.stage === "Proposal")
        .reduce((s, p) => s + (p.offer_price ?? 65000) * (p.total_students ?? 0), 0)
      const mou = (pipelines ?? []).filter((p) => p.stage === "MoU")
        .reduce((s, p) => s + (p.deal_price ?? 0) * (p.total_students ?? 0), 0)

      setStats({
        schools: (schools as { count?: number }[])?.length ?? 0,
        pipelines: (pipelines ?? []).length,
        potential: proposal,
        realized: mou,
      })
    } catch (e) {
      console.warn("Offline dashboard")
    } finally {
      setLoading(false)
    }
  }

  const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      {loading ? <ActivityIndicator color="#f97316" /> : (
        <ScrollView contentContainerStyle={styles.grid}>
          {[
            { label: "Stock DB", value: stats.schools, color: "#3b82f6" },
            { label: "Pipeline", value: stats.pipelines, color: "#f59e0b" },
            { label: "Potensi Revenue", value: formatRp(stats.potential), color: "#f97316" },
            { label: "Realized Revenue", value: formatRp(stats.realized), color: "#10b981" },
            { label: "Marketing 10%", value: formatRp(Math.round(stats.realized * 0.1)), color: "#8b5cf6" },
          ].map((card, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.muted}>{card.label}</Text>
              <Text style={[styles.value, { color: card.color }]}>{card.value}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#f8fafc", marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#1e293b", borderRadius: 10, padding: 16, width: "47%" },
  muted: { color: "#94a3b8", fontSize: 12 },
  value: { fontSize: 20, fontWeight: "bold", marginTop: 4 },
})
