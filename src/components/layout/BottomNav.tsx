"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Ellipsis } from "lucide-react"

const mainItems = [
  { href: "/", label: "Dashboard", icon: "/icons/dashboard.svg" },
  { href: "/stock", label: "Stock DB", icon: "/icons/stock.svg" },
  { href: "/kunjungan", label: "Kunjungan", icon: "/icons/kunjungan.svg" },
  { href: "/kanban", label: "Kanban", icon: "/icons/kanban.svg" },
]

const moreItems = [
  { href: "/peta", label: "Peta", icon: "/icons/peta.svg" },
  { href: "/foto", label: "Foto", icon: "/icons/foto.svg" },
  { href: "/sekolah", label: "Sekolah", icon: "/icons/sekolah.svg" },
  { href: "/akun", label: "Akun", icon: "/icons/akun.svg" },
]

export function BottomNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isMoreActive = moreItems.some(
    (item) =>
      pathname === item.href ||
      (item.href !== "/" && pathname?.startsWith(item.href))
  )

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 px-1" ref={containerRef}>
        {mainItems.map((item) => {
          const isActive = pathname
            ? pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href))
            : item.href === "/"
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 transition-colors",
                isActive ? "text-orange-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <img
                src={item.icon}
                alt={item.label}
                className={cn(
                  "size-5 shrink-0",
                  isActive && "drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]"
                )}
                style={{
                  filter: isActive
                    ? "invert(51%) sepia(97%) saturate(2878%) hue-rotate(346deg) brightness(99%) contrast(96%)"
                    : "brightness(0) invert(50%)",
                }}
              />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}

        {/* More button */}
        <div className="relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1">
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-colors",
              isMoreActive ? "text-orange-500" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Ellipsis
              className={cn(
                "size-5",
                isMoreActive && "drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]"
              )}
            />
            <span className="text-[10px] font-medium leading-none">Lainnya</span>
          </button>

          {open && (
            <div className="absolute bottom-full mb-2 right-0 w-40 rounded-xl border border-border bg-popover shadow-xl p-1.5 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
              {moreItems.map((item) => {
                const isActive = pathname
                  ? pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))
                  : false
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-orange-500/10 text-orange-500"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="size-4 shrink-0"
                      style={{
                        filter: isActive
                          ? "invert(51%) sepia(97%) saturate(2878%) hue-rotate(346deg) brightness(99%) contrast(96%)"
                          : "brightness(0) invert(50%)",
                      }}
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
