import * as FileSystem from "expo-file-system"
import AsyncStorage from "@react-native-async-storage/async-storage"

const PHOTO_DIR = `${FileSystem.documentDirectory}photos/`

export async function ensurePhotoDir() {
  const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true })
  }
}

export async function savePhotoLocally(uri: string, fileName: string): Promise<string> {
  await ensurePhotoDir()
  const dest = `${PHOTO_DIR}${fileName}`
  await FileSystem.copyAsync({ from: uri, to: dest })
  return dest
}

export async function getLocalPhotos(): Promise<string[]> {
  await ensurePhotoDir()
  const files = await FileSystem.readDirectoryAsync(PHOTO_DIR)
  return files.map((f) => `${PHOTO_DIR}${f}`)
}

export async function deleteLocalPhoto(fileName: string) {
  const path = `${PHOTO_DIR}${fileName}`
  const info = await FileSystem.getInfoAsync(path)
  if (info.exists) await FileSystem.deleteAsync(path)
}
