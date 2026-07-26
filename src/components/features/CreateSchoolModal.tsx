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
import { toast } from "sonner"
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
  const [name, setName] = useState(initialName)
  const [address, setAddress] = useState("")
  const [regional, setRegional] = useState("")
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalTeachers, setTotalTeachers] = useState(0)
  const [contactPerson, setContactPerson] = useState("")

  const handleSubmit = () => {
    if (!name || !address || !regional) {
      toast.error("Nama, Alamat, dan Regional wajib diisi!")
      return
    }
    const newSchool: SchoolStock = {
      id: `st-new-${crypto.randomUUID().slice(0, 8)}`,
      name,
      address,
      regional,
      totalStudents,
      totalTeachers,
      contactPerson,
      latitude: -6.2,
      longitude: 106.8,
      isFromStock: true,
    }
    onCreated(newSchool)
    toast.success(`Sekolah "${name}" berhasil ditambahkan ke Stock Database!`)
    setName("")
    setAddress("")
    setRegional("")
    setTotalStudents(0)
    setTotalTeachers(0)
    setContactPerson("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Tambah Sekolah Baru
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Nama Sekolah</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama sekolah"
              className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Alamat</Label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat lengkap"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none min-h-[60px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Regional</Label>
            <Input
              value={regional}
              onChange={(e) => setRegional(e.target.value)}
              placeholder="Contoh: Jakarta Pusat"
              className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Jumlah Siswa</Label>
              <Input
                type="number"
                value={totalStudents || ""}
                onChange={(e) => setTotalStudents(Number(e.target.value) || 0)}
                placeholder="0"
                className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Jumlah Guru</Label>
              <Input
                type="number"
                value={totalTeachers || ""}
                onChange={(e) => setTotalTeachers(Number(e.target.value) || 0)}
                placeholder="0"
                className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Kontak Person</Label>
            <Input
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Nama kontak"
              className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full bg-orange-500 hover:bg-orange-600 mt-2"
          >
            Simpan Sekolah
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
