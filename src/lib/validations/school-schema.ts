import { z } from "zod"

export const schoolFormSchema = z.object({
  name: z.string().min(1, "Nama sekolah wajib diisi").max(200, "Nama maksimal 200 karakter"),
  address: z.string().min(1, "Alamat wajib diisi").max(500, "Alamat maksimal 500 karakter"),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  regional: z.string().min(1, "Regional wajib diisi").max(100, "Regional maksimal 100 karakter"),
  contactPerson: z.string().min(1, "Kontak person wajib diisi").max(200, "Kontak maksimal 200 karakter"),
})

export type SchoolFormValues = z.infer<typeof schoolFormSchema>
