"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="size-6 text-red-400" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Terjadi kesalahan
            </h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              {this.state.error?.message ?? "Komponen gagal dimuat. Coba muat ulang halaman."}
            </p>
          </div>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Muat Ulang
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
