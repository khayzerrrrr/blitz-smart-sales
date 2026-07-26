"use client"

import Image from "next/image"
import Link from "next/link"
import { Bell, Sun, Moon, Menu, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/layout/Sidebar"
import { useSidebarStore } from "@/store/useSidebarStore"
import { useTheme } from "next-themes"

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const toggleSidebar = useSidebarStore((s) => s.toggle)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
            <SidebarContent />
          </SheetContent>
        </Sheet>

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
            RP
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Reza Pahrul</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  )
}
