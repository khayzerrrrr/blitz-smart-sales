"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { setupTestAccounts } from "@/lib/actions/setup"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function SetupPage() {
  const [results, setResults] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSetup = async () => {
    setLoading(true)
    try {
      const res = await setupTestAccounts()
      setResults(res)
    } catch (err) {
      setResults([`ERROR: ${err instanceof Error ? err.message : "Gagal"}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="border-border bg-card max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-foreground text-center">Setup Test Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Buat akun test: Admin, Sales 1, Sales 2
          </p>
          <div className="text-xs text-muted-foreground text-center font-mono bg-muted rounded p-2">
            admin@blitzcrm.com / admin123<br />
            sales@blitzcrm.com / sales123<br />
            sales2@blitzcrm.com / sales123
          </div>
          <Button
            onClick={handleSetup}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {loading ? (
              <><Loader2 className="size-4 animate-spin mr-2" /> Membuat akun...</>
            ) : (
              "Buat Akun Test"
            )}
          </Button>

          {results && (
            <div className="space-y-1 text-sm">
              {results.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  {r.includes("BERHASIL") || r.includes("sudah ada") ? (
                    <CheckCircle className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span className={r.includes("BERHASIL") || r.includes("sudah ada") ? "text-emerald-400" : "text-red-400"}>
                    {r}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
