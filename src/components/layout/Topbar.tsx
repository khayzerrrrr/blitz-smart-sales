"use client"

import Image from "next/image"
import Link from "next/link"
import { Bell, Sun, Moon, PanelLeft, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "@/store/useSidebarStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const toggleSidebar = useSidebarStore((s) => s.toggle)
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const router = useRouter()

  const userName = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "User"
  const userRole = user?.user_metadata?.role ?? "sales"
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    await signOut()
    toast.success("Berhasil logout")
    router.push("/login")
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-sm"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        minHeight: "64px",
      }}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex text-muted-foreground hover:text-foreground"
          aria-label="Toggle Sidebar"
        >
          <PanelLeft className="size-5" />
        </Button>

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

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground"
          suppressHydrationWarning
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-500" />
        </Button>

        <div className="hidden items-center gap-3 rounded-lg px-3 py-1.5 md:flex">
          <div className="flex size-9 items-center justify-center rounded-full bg-orange-500/10 text-sm font-semibold text-orange-500 ring-2 ring-orange-500/20">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-red-400"
          title="Logout"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
