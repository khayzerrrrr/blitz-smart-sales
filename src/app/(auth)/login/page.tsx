"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, Smartphone, Apple, Monitor, Share2 } from "lucide-react"

function getDeviceInfo(): "android" | "ios" | "desktop" {
  if (typeof navigator === "undefined") return "desktop"
  const ua = navigator.userAgent.toLowerCase()
  if (/android/.test(ua)) return "android"
  if (/iphone|ipad|ipod/.test(ua)) return "ios"
  return "desktop"
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [device, setDevice] = useState<"android" | "ios" | "desktop">("desktop")
  const [showPwaGuide, setShowPwaGuide] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setDevice(getDeviceInfo())
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Email dan password wajib diisi!")
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success("Login berhasil!")
      router.push("/")
    } catch (err) {
      toast.error(`Login gagal: ${err instanceof Error ? err.message : "Periksa email & password"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
      <div className="flex justify-center mb-4">
        <img src="/icon-apps.png" alt="Blitz CRM" className="w-16 h-16 object-contain" />
      </div>
      <h1 className="text-center text-2xl font-bold text-foreground">
        Blitz<span className="text-orange-500">CRM</span>
      </h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Silakan login untuk melanjutkan
      </p>

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="size-4 animate-spin" />Masuk...</> : "Masuk"}
        </button>
      </form>

      {/* Download App Section */}
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-center text-xs text-muted-foreground mb-4">
          Gunakan aplikasi mobile untuk pengalaman terbaik
        </p>

        {device === "android" && (
          <a
            href="/apk/blitz-crm-android.apk"
            download
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Smartphone className="size-4" />
            Download for Android (APK)
          </a>
        )}

        {device === "ios" && (
          <>
            <button
              onClick={() => setShowPwaGuide(!showPwaGuide)}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Apple className="size-4" />
              Install for iPhone (PWA)
            </button>
            {showPwaGuide && (
              <div className="mt-3 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">Cara Install di iPhone:</p>
                <ol className="list-decimal ml-4 space-y-1 text-xs">
                  <li>Buka halaman ini di <strong>Safari</strong></li>
                  <li>Tap ikon <Share2 className="inline size-3" /> <strong>Share</strong> di bawah</li>
                  <li>Scroll ke bawah, pilih <strong>Add to Home Screen</strong></li>
                  <li>Tap <strong>Add</strong> di pojok kanan atas</li>
                </ol>
              </div>
            )}
          </>
        )}

        {device === "desktop" && (
          <p className="text-center text-xs text-muted-foreground">
            Buka halaman ini di smartphone untuk download aplikasi mobile
          </p>
        )}
      </div>
    </div>
  )
}
