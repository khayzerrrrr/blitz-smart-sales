import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://svhqpggynlscezwhvgef.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aHFwZ2d5bmxzY2V6d2h2Z2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzA1OTAsImV4cCI6MjEwMDY0NjU5MH0.TPiejVXKPV211BgGxg_X4xWRXnbQXWS_xMHzHioIWLs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
