"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { schoolFormSchema, type SchoolFormValues } from "@/lib/validations/school-schema"
import type { SchoolStock } from "@/types"

interface CreateSchoolModalProps {
  open: boolean
  onClose: () => void
  onCreated: (school: SchoolStock) => void
  initialName: string
}

export function CreateSchoolModal({
  open,
  onClose,
  onCreated,
  initialName,
}: CreateSchoolModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      name: initialName,
      address: "",
      regional: "",
      contactPerson: "",
    },
  })

  const handleSubmit = async (values: SchoolFormValues) => {
    setSubmitting(true)
    try {
      const newSchool: SchoolStock = {
        id: `st-new-${crypto.randomUUID().slice(0, 8)}`,
        name: values.name,
        address: values.address,
        regional: values.regional,
        totalStudents: 0,
        totalTeachers: 0,
        contactPerson: values.contactPerson,
        latitude: values.latitude ?? 0,
        longitude: values.longitude ?? 0,
        isFromStock: true,
      }
      await onCreated(newSchool)
      toast.success(`Sekolah "${values.name}" berhasil ditambahkan ke Stock Database!`)
      form.reset()
      onClose()
    } catch (err) {
      toast.error(`Gagal: ${err instanceof Error ? err.message : "Terjadi kesalahan"}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Tambah Sekolah Baru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Nama Sekolah</Label>
            <Input
              {...form.register("name")}
              placeholder="Nama sekolah"
              className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Alamat</Label>
            <textarea
              {...form.register("address")}
              placeholder="Alamat lengkap"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none min-h-[60px]"
            />
            {form.formState.errors.address && (
              <p className="text-xs text-red-400">{form.formState.errors.address.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Regional</Label>
            <Input
              {...form.register("regional")}
              placeholder="Contoh: Jakarta Pusat"
              className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
            />
            {form.formState.errors.regional && (
              <p className="text-xs text-red-400">{form.formState.errors.regional.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Kontak Person</Label>
            <Input
              {...form.register("contactPerson")}
              placeholder="Nama kontak"
              className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
            />
            {form.formState.errors.contactPerson && (
              <p className="text-xs text-red-400">{form.formState.errors.contactPerson.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 mt-2"
            disabled={submitting}
          >
            {submitting ? (
              <><Loader2 className="size-4 animate-spin mr-2" />Menyimpan...</>
            ) : (
              "Simpan Sekolah"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
