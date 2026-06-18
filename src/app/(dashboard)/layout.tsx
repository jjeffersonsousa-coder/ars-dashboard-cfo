"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

// Pages that need full-screen layout (no padding, no scroll wrapper)
const FULLSCREEN_ROUTES = ["/make-a-budget"]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const isFullscreen = FULLSCREEN_ROUTES.some(r => pathname.startsWith(r))

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        {isFullscreen ? (
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        ) : (
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        )}
      </div>
    </div>
  )
}
