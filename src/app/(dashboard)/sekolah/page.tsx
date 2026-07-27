"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react"
import { useSchools } from "@/hooks/useSchools"
import { format } from "date-fns"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { schoolFormSchema, type SchoolFormValues } from "@/lib/validations/school-schema"
import {
  createSchool,
  updateSchool,
  deleteSchool,
  type SchoolRecord,
} from "@/services/school.service"

export default function SekolahPage() {
  const queryClient = useQueryClient()
  const { schools, isLoading, search, setSearch } = useSchools(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<SchoolRecord | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    setDeleting(id)
    try {
      await deleteSchool(id)
      queryClient.invalidateQueries({ queryKey: ["schools"] })
      toast.success(`Sekolah "${name}" berhasil dihapus!`)
    } catch (err) {
      toast.error(`Gagal hapus: ${err instanceof Error ? err.message : "Unknown"}`)
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (school: SchoolRecord) => {
    setEditingSchool(school)
    setEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Data Sekolah
          </h1>
          <p className="text-sm text-muted-foreground">
            Manajemen data master sekolah.
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger>
            <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
              <Plus className="size-4" />
              Tambah Sekolah
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Tambah Sekolah Baru
              </DialogTitle>
            </DialogHeader>
            <SchoolForm
              onSubmit={async (values) => {
                await createSchool({
                  name: values.name,
                  address: values.address,
                  regional: values.regional,
                  contact_person: values.contactPerson,
                  total_students: 0,
                  total_teachers: 0,
                  latitude: values.latitude ?? 0,
                  longitude: values.longitude ?? 0,
                })
                queryClient.invalidateQueries({ queryKey: ["schools"] })
                setAddDialogOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama sekolah atau regional..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-border bg-muted text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Nama Sekolah</TableHead>
                  <TableHead className="text-muted-foreground">Regional</TableHead>
                  <TableHead className="text-muted-foreground">Kontak</TableHead>
                  <TableHead className="text-muted-foreground">
                    Terakhir Diupdate
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      Tidak ada data sekolah yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  schools.map((school) => (
                    <TableRow
                      key={school.id}
                      className="border-border hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-foreground">
                        {school.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {school.regional}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {school.contact_person}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(school.updated_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-orange-400"
                            onClick={() => handleEdit(school)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-red-400"
                            onClick={() => handleDelete(school.id, school.name)}
                            disabled={deleting === school.id}
                          >
                            {deleting === school.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit Sekolah
            </DialogTitle>
          </DialogHeader>
          {editingSchool && (
            <SchoolForm
              defaultValues={{
                name: editingSchool.name,
                address: editingSchool.address,
                regional: editingSchool.regional,
                contactPerson: editingSchool.contact_person,
                latitude: editingSchool.latitude,
                longitude: editingSchool.longitude,
              }}
              onSubmit={async (values) => {
                await updateSchool(editingSchool.id, {
                  name: values.name,
                  address: values.address,
                  regional: values.regional,
                  contact_person: values.contactPerson,
                  latitude: values.latitude ?? editingSchool.latitude,
                  longitude: values.longitude ?? editingSchool.longitude,
                })
                queryClient.invalidateQueries({ queryKey: ["schools"] })
                setEditDialogOpen(false)
                setEditingSchool(null)
              }}
              submitLabel="Simpan Perubahan"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SchoolForm({
  defaultValues,
  onSubmit,
  submitLabel = "Simpan Sekolah",
}: {
  defaultValues?: SchoolFormValues
  onSubmit: (values: SchoolFormValues) => Promise<void>
  submitLabel?: string
}) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      address: "",
      regional: "",
      contactPerson: "",
    },
  })

  const handleSubmit = async (values: SchoolFormValues) => {
    setSubmitting(true)
    try {
      await onSubmit(values)
      toast.success(`Sekolah "${values.name}" berhasil disimpan!`)
      form.reset()
    } catch (err) {
      toast.error(`Gagal: ${err instanceof Error ? err.message : "Terjadi kesalahan"}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Nama Sekolah</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Masukkan nama sekolah"
                  className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Alamat</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  placeholder="Masukkan alamat lengkap"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="regional"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Regional</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Contoh: Jakarta Pusat"
                  className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Kontak Person</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nama dan gelar"
                  className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600"
          disabled={submitting}
        >
          {submitting ? (
            <><Loader2 className="size-4 animate-spin mr-2" />Menyimpan...</>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </Form>
  )
}
