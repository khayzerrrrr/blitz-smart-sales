import React, { useEffect, useState } from "react"
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from "react-native"
import { supabase } from "../lib/supabase"

type SchoolRow = { id: string; name: string; regional: string; total_students: number }

export default function StockScreen() {
  const [schools, setSchools] = useState<SchoolRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSchools()
  }, [])

  const loadSchools = async () => {
    try {
      const { data, error } = await supabase.from("schools").select("*")
      if (!error) setSchools(data ?? [])
    } catch (e) {
      console.warn("Offline: using local cache")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Database</Text>
      {loading ? (
        <ActivityIndicator color="#f97316" />
      ) : (
        <ScrollView>
          {schools.map((s) => (
            <View key={s.id} style={styles.card}>
              <Text style={styles.schoolName}>{s.name}</Text>
              <Text style={styles.muted}>{s.regional} · {s.total_students} siswa</Text>
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
  card: { backgroundColor: "#0f172a", padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: "#1e293b" },
  schoolName: { color: "#f8fafc", fontSize: 15, fontWeight: "600" },
  muted: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
})
