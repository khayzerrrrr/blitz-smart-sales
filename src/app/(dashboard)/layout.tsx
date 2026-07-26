import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col w-full overflow-hidden">
        <Topbar />
        <div className="flex-1 p-4 md:p-6 w-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
