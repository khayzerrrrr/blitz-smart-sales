"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MapPin,
  Camera,
  Building2,
  KanbanSquare,
  Users,
  Database,
  ClipboardCheck,
} from "lucide-react"

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stock", label: "Stock DB", icon: Database },
  { href: "/kunjungan", label: "Kunjungan", icon: ClipboardCheck },
  { href: "/peta", label: "Peta", icon: MapPin },
  { href: "/foto", label: "Foto", icon: Camera },
  { href: "/sekolah", label: "Sekolah", icon: Building2 },
  { href: "/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/akun", label: "Akun", icon: Users },
]

export function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo-dashboard.png"
            alt="Blitz CRM"
            width={130}
            height={40}
            className="object-contain w-auto h-8"
            priority
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-orange-500/10 text-orange-500"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "size-5 shrink-0",
                  isActive ? "text-orange-500" : "text-muted-foreground/60"
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
            RP
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">
              Reza Pahrul
            </p>
            <p className="truncate text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-background md:sticky md:top-0 md:h-screen">
      <SidebarContent />
    </aside>
  )
}
