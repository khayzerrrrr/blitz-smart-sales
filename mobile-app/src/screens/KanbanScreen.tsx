import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native"
import { supabase } from "../lib/supabase"

type PipelineRow = { id: string; school_name: string; stage: string; total_students: number }

const STAGES = ["Prospect", "Presentasi", "Proposal", "MoU", "Not This Time"]

export default function KanbanScreen() {
  const [pipelines, setPipelines] = useState<PipelineRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPipelines()
  }, [])

  const loadPipelines = async () => {
    try {
      const { data } = await supabase.from("pipelines").select("*").order("updated_at", { ascending: false })
      if (data) setPipelines(data)
    } catch (e) {
      console.warn("Offline kanban")
    } finally {
      setLoading(false)
    }
  }

  const byStage = (stage: string) => pipelines.filter((p) => p.stage === stage)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pipeline Kanban</Text>
      {loading ? <ActivityIndicator color="#f97316" /> : (
        <FlatList
          data={STAGES}
          horizontal
          renderItem={({ item: stage }) => (
            <View style={styles.column}>
              <Text style={styles.colHeader}>{stage} ({byStage(stage).length})</Text>
              {byStage(stage).map((p) => (
                <View key={p.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{p.school_name}</Text>
                  <Text style={styles.muted}>{p.total_students} siswa</Text>
                </View>
              ))}
            </View>
          )}
          keyExtractor={(s) => s}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", padding: 12 },
  title: { fontSize: 22, fontWeight: "bold", color: "#f8fafc", marginBottom: 12 },
  column: { width: 180, marginRight: 10, backgroundColor: "#0f172a", borderRadius: 10, padding: 8, borderWidth: 1, borderColor: "#1e293b" },
  colHeader: { color: "#f8fafc", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  card: { backgroundColor: "#1e293b", padding: 10, borderRadius: 8, marginBottom: 6 },
  cardTitle: { color: "#f8fafc", fontSize: 13, fontWeight: "600" },
  muted: { color: "#94a3b8", fontSize: 11, marginTop: 3 },
})
