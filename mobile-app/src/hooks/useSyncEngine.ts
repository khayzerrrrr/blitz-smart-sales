import AsyncStorage from "@react-native-async-storage/async-storage"
import NetInfo from "@react-native-community/netinfo"
import { supabase } from "../lib/supabase"
import { deleteLocalPhoto } from "../lib/storage"

const SYNC_QUEUE_KEY = "@blitz_sync_queue"

type SyncAction =
  | { type: "CREATE_SCHOOL"; data: Record<string, unknown> }
  | { type: "CREATE_VISIT"; data: Record<string, unknown> }
  | { type: "UPLOAD_PHOTO"; data: { localPath: string; schoolId: string; fileName: string } }
  | { type: "UPDATE_PIPELINE"; data: { id: string; stage: string } }

async function getQueue(): Promise<SyncAction[]> {
  const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY)
  return raw ? JSON.parse(raw) : []
}

async function saveQueue(queue: SyncAction[]) {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
}

export function addToQueue(action: SyncAction) {
  return getQueue().then((queue) => {
    queue.push(action)
    return saveQueue(queue)
  })
}

let syncInProgress = false

export async function processSyncQueue() {
  if (syncInProgress) return
  syncInProgress = true

  try {
    const queue = await getQueue()
    if (queue.length === 0) return

    const remaining: SyncAction[] = []

    for (const action of queue) {
      try {
        switch (action.type) {
          case "CREATE_SCHOOL": {
            const { error } = await supabase.from("schools").insert([action.data])
            if (error) throw error
            break
          }
          case "CREATE_VISIT": {
            const { error } = await supabase.from("visits").insert([action.data])
            if (error) throw error
            break
          }
          case "UPLOAD_PHOTO": {
            const { localPath, schoolId, fileName } = action.data
            const fileData = await fetch(localPath).then((r) => r.blob())
            const { error: uploadErr } = await supabase.storage
              .from("school-photos")
              .upload(`school-photos/${fileName}`, fileData)
            if (uploadErr) throw uploadErr

            const { data: urlData } = supabase.storage
              .from("school-photos")
              .getPublicUrl(`school-photos/${fileName}`)

            const { error: dbErr } = await supabase.from("school_photos").insert([
              { school_id: schoolId, storage_path: urlData.publicUrl, uploaded_by: "Mobile User" },
            ])
            if (dbErr) throw dbErr

            await deleteLocalPhoto(fileName)
            break
          }
          case "UPDATE_PIPELINE": {
            const { error } = await supabase
              .from("pipelines")
              .update({ stage: action.data.stage, updated_at: new Date().toISOString() })
              .eq("id", action.data.id)
            if (error) throw error
            break
          }
        }
      } catch {
        remaining.push(action)
      }
    }

    await saveQueue(remaining)
    console.log(`Sync: ${queue.length - remaining.length}/${queue.length} berhasil`)
  } finally {
    syncInProgress = false
  }
}

export function useSyncEngine() {
  NetInfo.addEventListener((state) => {
    if (state.isConnected) processSyncQueue()
  })
}
