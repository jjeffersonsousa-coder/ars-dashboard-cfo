"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, Bell, Search, CalendarDays, CalendarRange, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onToggleSidebar: () => void
}

interface Notif {
  id: string
  tipo: "reuniao" | "evento" | "decisao"
  titulo: string
  hora?: string
  label: string
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const now = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const [showNotifs, setShowNotifs] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    const list: Notif[] = []

    try {
      const reunioes = JSON.parse(localStorage.getItem("ars_reunioes") || "[]")
      for (const r of reunioes) {
        if (r.data === hoje) {
          list.push({ id: `r_${r.id}`, tipo: "reuniao", titulo: r.titulo, hora: r.hora, label: "Reunião hoje" })
        }
      }
    } catch { /* ignore */ }

    try {
      const eventos = JSON.parse(localStorage.getItem("ars_eventos_meta") || "[]")
      for (const e of eventos) {
        if (e.dataEvento === hoje) {
          list.push({ id: `e_${e.id}`, tipo: "evento", titulo: e.nome, label: "Evento hoje" })
        }
      }
    } catch { /* ignore */ }

    try {
      const decisoes = JSON.parse(localStorage.getItem("ars_decisoes") || "[]")
      const pendentes = decisoes.filter((d: { implementado: boolean }) => !d.implementado)
      if (pendentes.length > 0) {
        list.push({ id: "dec_pend", tipo: "decisao", titulo: `${pendentes.length} decisão(ões) pendente(s)`, label: "Pendências" })
      }
    } catch { /* ignore */ }

    setNotifs(list)
  }, [showNotifs])

  const typeIcon = {
    reuniao: <CalendarDays className="w-4 h-4 text-blue-500" />,
    evento: <CalendarRange className="w-4 h-4 text-emerald-500" />,
    decisao: <FileText className="w-4 h-4 text-orange-500" />,
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Dashboard Administrativo</h1>
          <p className="text-xs text-slate-500 capitalize">{now}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="w-5 h-5" />
        </Button>
        <div className="relative" ref={ref}>
          <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell className="w-5 h-5" />
            {notifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-80">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Notificações</h3>
                <button onClick={() => setShowNotifs(false)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Nenhuma notificação para hoje</p>
                  </div>
                ) : notifs.map(n => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="shrink-0 mt-0.5">{typeIcon[n.tipo]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{n.label}</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{n.titulo}</p>
                      {n.hora && <p className="text-xs text-slate-400 mt-0.5">{n.hora}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">Hoje · {new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          )}
          {showNotifs && <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />}
        </div>
      </div>
    </header>
  )
}
