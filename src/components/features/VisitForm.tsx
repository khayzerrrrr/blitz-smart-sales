"use client"

import { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { visitFormSchema, type VisitFormValues } from "@/lib/validations/visit-schema"
import { format } from "date-fns"
import { toast } from "sonner"
import { Camera, X } from "lucide-react"
import { fetchAllSchools, createSchool } from "@/services/school.service"
import { createVisit, type CreateVisitInput } from "@/services/visit.service"
import { checkPipelineExists, createPipeline } from "@/services/pipeline.service"
import { createClient } from "@/lib/supabase/client"
import { SchoolCombobox } from "@/components/features/SchoolCombobox"
import { LocationPicker } from "@/components/features/LocationPicker"
import { CreateSchoolModal } from "@/components/features/CreateSchoolModal"
import { useAuthStore } from "@/store/useAuthStore"

interface VisitFormProps {
  onSubmit?: () => void
}

export function VisitForm({ onSubmit }: VisitFormProps) {
  const queryClient = useQueryClient()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newSchoolName, setNewSchoolName] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const authUser = useAuthStore((s) => s.user)

  const { data: schools = [] } = useQuery({
    queryKey: ["schools"],
    queryFn: fetchAllSchools,
  })

  const visitMutation = useMutation({
    mutationFn: createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] })
      queryClient.invalidateQueries({ queryKey: ["pipelines"] })
    },
    onError: (err: Error) => toast.error(`Gagal simpan: ${err.message}`),
  })

  const schoolCreateMutation = useMutation({
    mutationFn: createSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] })
    },
  })

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      schoolId: "",
      visitDate: format(new Date(), "yyyy-MM-dd"),
      status: "Dijadwalkan",
      notes: "",
      picName: "",
      picPhone: "",
      totalStudents: 0,
      totalTeachers: 0,
      hasBilingual: "Tidak",
    },
  })

  const watchedSchoolId = form.watch("schoolId")
  const selectedSchool = watchedSchoolId
    ? schools.find((s) => s.id === watchedSchoolId) ?? null
    : null

  const mappedSchools = schools.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address ?? "",
    regional: s.regional ?? "",
    totalStudents: s.total_students ?? 0,
    totalTeachers: s.total_teachers ?? 0,
    latitude: s.latitude ?? 0,
    longitude: s.longitude ?? 0,
    contactPerson: s.contact_person ?? "",
    isFromStock: true,
  }))

  const handleCreateNew = (name: string) => {
    setNewSchoolName(name)
    setCreateModalOpen(true)
  }

  const handleSchoolCreated = async (school: (typeof mappedSchools)[0]) => {
    try {
      const newSchool = await schoolCreateMutation.mutateAsync({
        name: school.name,
        address: school.address,
        regional: school.regional,
        total_students: school.totalStudents,
        total_teachers: school.totalTeachers,
        latitude: school.latitude,
        longitude: school.longitude,
        contact_person: school.contactPerson,
      })
      form.setValue("schoolId", newSchool.id)
      form.setValue("totalStudents", newSchool.total_students ?? 0)
      form.setValue("totalTeachers", newSchool.total_teachers ?? 0)
      await createPipeline({
        school_id: newSchool.id,
        school_name: newSchool.name,
        contact_person: newSchool.contact_person ?? "",
        total_students: newSchool.total_students ?? 0,
        stage: "Prospect",
        offer_price: null,
        deal_price: null,
        last_action: "Auto-created dari kunjungan",
      })
      queryClient.invalidateQueries({ queryKey: ["schools"] })
      queryClient.invalidateQueries({ queryKey: ["pipelines"] })
      toast.success(`Sekolah "${newSchool.name}" ditambahkan + pipeline otomatis!`)
    } catch (err) {
      toast.error(`Gagal: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const handleSchoolChange = (schoolId: string) => {
    form.setValue("schoolId", schoolId)
    const school = schools.find((s) => s.id === schoolId)
    if (school) {
      form.setValue("totalStudents", school.total_students ?? 0)
      form.setValue("totalTeachers", school.total_teachers ?? 0)
    }
  }

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (values: VisitFormValues) => {
    try {
      const selected = schools.find((s) => s.id === values.schoolId)
      const input: CreateVisitInput = {
        school_id: values.schoolId,
        user_id: authUser?.id ?? "00000000-0000-0000-0000-000000000000",
        user_name: authUser?.user_metadata?.name ?? authUser?.email ?? "User",
        school_name: selected?.name ?? "Unknown",
        visit_date: values.visitDate,
        status: values.status,
        notes: values.notes,
        pic_name: values.picName,
        pic_phone: values.picPhone,
        total_students: values.totalStudents,
        total_teachers: values.totalTeachers,
        has_bilingual: values.hasBilingual === "Ya",
        latitude,
        longitude,
      }

      const existingPipeline = await checkPipelineExists(values.schoolId)
      if (!existingPipeline) {
        await createPipeline({
          school_id: values.schoolId,
          school_name: selected?.name ?? "Unknown",
          contact_person: selected?.contact_person ?? "",
          total_students: values.totalStudents,
          stage: "Prospect",
          offer_price: null,
          deal_price: null,
          last_action: "Auto-created dari kunjungan",
        })
        queryClient.invalidateQueries({ queryKey: ["pipelines"] })
      }

      await visitMutation.mutateAsync(input)

      if (photoFile) {
        const supabaseClient = createClient()
        const ext = photoFile.name.split(".").pop() ?? "jpg"
        const path = `${values.schoolId}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabaseClient.storage
          .from("school-photos")
          .upload(path, photoFile, { upsert: true })
        if (!uploadError) {
          await supabaseClient.from("school_photos").insert({
            school_id: values.schoolId,
            school_name: selected?.name ?? "Unknown",
            storage_path: `school-photos/${path}`,
            uploaded_by: authUser?.id,
          })
          queryClient.invalidateQueries({ queryKey: ["photos"] })
        }
      }

      toast.success(`Kunjungan ke "${selected?.name}" berhasil disimpan!`)
      form.reset()
      setLatitude(null)
      setLongitude(null)
      setPhotoFile(null)
      setPhotoPreview(null)
      onSubmit?.()
    } catch (err) {
      toast.error(`Gagal: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="schoolId"
            render={() => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Sekolah</FormLabel>
                <FormControl>
                  <SchoolCombobox
                    schools={mappedSchools}
                    value={form.watch("schoolId")}
                    onChange={handleSchoolChange}
                    onCreateNew={handleCreateNew}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="visitDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Tanggal Kunjungan</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="border-border bg-muted text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={(v) => field.onChange(v ?? "Dijadwalkan")}>
                      <SelectTrigger className="border-border bg-muted text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover text-foreground">
                        <SelectItem value="Selesai">Selesai</SelectItem>
                        <SelectItem value="Proses">Proses</SelectItem>
                        <SelectItem value="Dijadwalkan">Dijadwalkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Catatan</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    placeholder="Tulis catatan kunjungan..."
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="picName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Nama PIC</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nama PIC" className="border-border bg-muted text-foreground placeholder:text-muted-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="picPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Nomor HP/WA</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0812xxxxxxxx" className="border-border bg-muted text-foreground placeholder:text-muted-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="totalStudents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Jumlah Siswa</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      placeholder="0"
                      className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalTeachers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Jumlah Guru</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      placeholder="0"
                      className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="hasBilingual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Program Bilingual</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={(v) => field.onChange(v ?? "Tidak")}>
                    <SelectTrigger className="border-border bg-muted text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover text-foreground">
                      <SelectItem value="Ya">Ya</SelectItem>
                      <SelectItem value="Tidak">Tidak</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            schoolLatitude={selectedSchool?.latitude}
            schoolLongitude={selectedSchool?.longitude}
            schoolName={selectedSchool?.name}
            onChange={handleLocationChange}
          />

          <div className="space-y-2">
            <FormLabel className="text-muted-foreground">Foto Kunjungan</FormLabel>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 border-border text-muted-foreground hover:text-foreground w-full">
                <Camera className="size-4" />
                Ambil / Pilih Foto
              </Button>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={visitMutation.isPending}
          >
            {visitMutation.isPending ? "Menyimpan..." : "Simpan Kunjungan"}
          </Button>
        </form>
      </Form>

      <CreateSchoolModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleSchoolCreated}
        initialName={newSchoolName}
      />
    </>
  )
}
