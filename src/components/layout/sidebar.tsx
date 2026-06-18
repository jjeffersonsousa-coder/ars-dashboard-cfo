"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { getSession, clearSession, type Session } from "@/lib/auth"
import { NIVEL_LABEL } from "@/data/usuarios"
import {
  LayoutDashboard, DollarSign, HandCoins, Rocket,
  CalendarDays, CheckSquare, BookOpen, HelpCircle,
  CalendarRange, Settings, BarChart3, LogOut,
} from "lucide-react"

const ALL_NAV = [
  { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard",      color: "#1B98E0" },
  { href: "/orcamento",      icon: DollarSign,      label: "Orçamento",      color: "#2ECC71" },
  { href: "/make-a-budget",  icon: BarChart3,       label: "Make a Budget",  color: "#F39C12" },
  { href: "/subvencoes",     icon: HandCoins,       label: "Subvenções",     color: "#1ABC9C" },
  { href: "/implementacoes", icon: Rocket,          label: "Implementações", color: "#9B59B6" },
  { href: "/reunioes",       icon: CalendarDays,    label: "Reuniões",       color: "#E67E22" },
  { href: "/decisoes",       icon: CheckSquare,     label: "Decisões",       color: "#E74C3C" },
  { href: "/pop",            icon: BookOpen,        label: "POP",            color: "#F1C40F" },
  { href: "/eventos",        icon: CalendarRange,   label: "Eventos",        color: "#1ABC9C" },
  { href: "/help",           icon: HelpCircle,      label: "Help / Base IA", color: "#247BA0" },
]

const BOTTOM_NAV = [
  { href: "/configuracoes", icon: Settings, label: "Configurações", color: "#95A5A6" },
]

export function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    setSession(getSession())
  }, [])

  function canAccess(href: string): boolean {
    if (!session) return false
    if (session.nivel === 1 || session.menus.length === 0) return true
    return session.menus.includes(href)
  }

  function handleLogout() {
    clearSession()
    router.replace("/login")
  }

  const visibleNav = ALL_NAV.filter(item => canAccess(item.href))
  const visibleBottom = BOTTOM_NAV.filter(item =>
    session?.nivel === 1 || session?.menus.includes(item.href) || session?.menus.length === 0
  )

  function NavLink({ href, icon: Icon, label, color }: { href: string; icon: React.ElementType; label: string; color: string }) {
    const active = pathname.startsWith(href) && (href !== "/" || pathname === "/")
    return (
      <Link
        href={href}
        title={!open ? label : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
          active ? "text-white" : "text-slate-400 hover:text-white"
        )}
        style={active ? { backgroundColor: color + "33", color } : {}}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.07)" }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "" }}
      >
        <Icon className="w-4 h-4 shrink-0" style={{ color: active ? color : undefined }} />
        {open && <span>{label}</span>}
        {open && active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />}
      </Link>
    )
  }

  return (
    <aside
      className={cn("flex flex-col text-white transition-all duration-300 shrink-0 overflow-hidden", open ? "w-64" : "w-0")}
      style={{ backgroundColor: "#13293D" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 font-bold text-white text-sm"
          style={{ background: "linear-gradient(135deg, #1B98E0, #006494)" }}>
          AR
        </div>
        {open && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-none">ARS</p>
            <p className="text-xs leading-none mt-0.5" style={{ color: "#1B98E0" }}>Dashboard CFO</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {visibleNav.map(item => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* Bottom */}
      <div className="py-3 px-2 space-y-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {visibleBottom.map(item => <NavLink key={item.href} {...item} />)}

        {/* Logout */}
        {open && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 transition-all"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(220,38,38,0.1)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "" }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sair</span>
          </button>
        )}

        {/* User info */}
        {open && session && (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
              style={{ background: "linear-gradient(135deg, #1B98E0, #006494)" }}>
              {session.initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white leading-none truncate">{session.nome}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "#1B98E0" }}>
                {NIVEL_LABEL[session.nivel as keyof typeof NIVEL_LABEL] ?? "Usuário"}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
