"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebarStore } from "@/store/useSidebarStore"
import { useAuthStore } from "@/store/useAuthStore"
import {
  LayoutDashboard,
  MapPin,
  Camera,
  Building2,
  KanbanSquare,
  Users,
  Database,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const isCollapsed = useSidebarStore((s) => s.isCollapsed)
  const toggle = useSidebarStore((s) => s.toggle)
  const user = useAuthStore((s) => s.user)

  const userName = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "User"
  const userRole = user?.user_metadata?.role ?? "sales"
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center border-b border-border py-4 transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "px-5"
        )}
      >
        <Link href="/" className="flex flex-col items-center shrink-0 gap-2">
          <Image
            src="/icon-apps.png"
            alt="Blitz CRM"
            width={isCollapsed ? 36 : 40}
            height={isCollapsed ? 36 : 40}
            className="object-contain shrink-0 transition-all duration-300"
            priority
          />
          <span
            className={cn(
              "text-lg font-bold tracking-tight text-foreground whitespace-nowrap overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Blitz<span className="text-orange-500">CRM</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-orange-500/10 text-orange-500"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <item.icon
                className={cn(
                  "size-5 shrink-0",
                  isActive ? "text-orange-500" : "text-muted-foreground/60"
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap overflow-hidden transition-all duration-300",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2 transition-all duration-300",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
            {initials}
          </div>
          <div
            className={cn(
              "flex-1 overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            <p className="truncate text-sm font-medium text-foreground">{userName}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            "w-full mt-2 text-muted-foreground hover:text-foreground transition-all duration-300",
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span className="ml-2 text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed)

  return (
    <aside
      className={cn(
        "hidden md:flex md:shrink-0 md:flex-col md:border-r md:border-border md:bg-background md:sticky md:top-0 md:h-screen transition-all duration-300",
        isCollapsed ? "md:w-16" : "md:w-64"
      )}
    >
      <SidebarContent />
    </aside>
  )
}
