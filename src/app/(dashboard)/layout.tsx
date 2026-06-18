"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { getSession } from "@/lib/auth"

const FULLSCREEN_ROUTES = ["/make-a-budget"]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [ready, setReady] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isFullscreen = FULLSCREEN_ROUTES.some(r => pathname.startsWith(r))

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace("/login")
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#13293D" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg"
            style={{ background: "linear-gradient(135deg, #1B98E0, #006494)" }}>
            AR
          </div>
          <svg className="animate-spin w-5 h-5 text-white opacity-60" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      </div>
    )
  }

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
