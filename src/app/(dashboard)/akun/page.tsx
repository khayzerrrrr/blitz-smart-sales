"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Shield } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { listUsersAction, createUserAction } from "@/lib/actions/admin"

export default function AkunPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        return await listUsersAction()
      } catch (err) {
        console.warn("Admin API error:", err)
        return [] as Awaited<ReturnType<typeof listUsersAction>>
      }
    },
  })

  const filtered = users.filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.role ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Manajemen Akun</h1>
          <p className="text-sm text-muted-foreground">Kelola pengguna dan peran akses via Supabase Auth.</p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
              <Plus className="size-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Tambah User Baru</DialogTitle>
            </DialogHeader>
            <AddUserForm
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, atau role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-border bg-muted text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Memuat data user...</p>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Tambahkan <code className="bg-muted px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> ke
                environment variables untuk mengaktifkan manajemen user via Supabase Auth Admin API.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Nama</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">Terdaftar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Tidak ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                            {(user.name ?? "U")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.role === "admin"
                              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }
                        >
                          <Shield className="mr-1 size-3" />
                          {user.role === "admin" ? "Admin" : "Sales"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), "dd MMM yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AddUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("sales")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      toast.error("Semua field wajib diisi!")
      return
    }
    setSubmitting(true)
    try {
      await createUserAction(email, password, name, role)
      toast.success(`User "${name}" berhasil dibuat!`)
      onSuccess()
    } catch (err) {
      toast.error(`Gagal: ${err instanceof Error ? err.message : "Unknown"}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Nama Lengkap</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama"
          className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contoh@email.com"
          className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 6 karakter"
          className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Role</label>
        <Select value={role} onValueChange={(v) => v && setRole(v)}>
          <SelectTrigger className="border-border bg-muted text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-foreground">
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600"
        disabled={submitting}
      >
        {submitting ? "Membuat..." : "Tambah User"}
      </Button>
    </div>
  )
}
