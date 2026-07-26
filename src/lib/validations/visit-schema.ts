import { z } from "zod"

export const visitFormSchema = z.object({
  schoolId: z.string().min(1, "Sekolah wajib dipilih"),
  visitDate: z.string().min(1, "Tanggal kunjungan wajib diisi"),
  status: z.enum(["Selesai", "Proses", "Dijadwalkan"], {
    message: "Status wajib dipilih",
  }),
  notes: z.string().min(1, "Catatan wajib diisi").max(1000, "Catatan maksimal 1000 karakter"),
  picName: z.string().min(1, "Nama PIC wajib diisi").max(200, "Nama maksimal 200 karakter"),
  picPhone: z.string().min(1, "Nomor HP/WA wajib diisi").max(20, "Nomor maksimal 20 karakter"),
  totalStudents: z.number().min(0, "Jumlah siswa minimal 0").max(99999, "Jumlah siswa terlalu besar"),
  totalTeachers: z.number().min(0, "Jumlah guru minimal 0").max(99999, "Jumlah guru terlalu besar"),
  hasBilingual: z.enum(["Ya", "Tidak"], {
    message: "Program bilingual wajib dipilih",
  }),
})

export type VisitFormValues = z.infer<typeof visitFormSchema>
