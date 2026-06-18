"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Rocket, Clock, CheckCircle2, XCircle, X, FileText } from "lucide-react"

interface Implementacao {
  id: string
  titulo: string
  responsavel: string
  inicio: string
  previsao: string
  status: "Em andamento" | "Concluído" | "Atrasado" | "Planejado"
  progresso: number
  prioridade: "Alta" | "Média" | "Baixa"
  descricao: string
}

const STORAGE_KEY = "ars_implementacoes"

const SEED: Implementacao[] = [
  { id: "i1", titulo: "Sistema de Gestão Financeira", responsavel: "João Silva", inicio: "2026-01-10", previsao: "2026-08-30", status: "Em andamento", progresso: 60, prioridade: "Alta", descricao: "" },
  { id: "i2", titulo: "Implantação ERP", responsavel: "Maria Costa", inicio: "2026-03-01", previsao: "2026-12-31", status: "Em andamento", progresso: 25, prioridade: "Alta", descricao: "" },
  { id: "i3", titulo: "Treinamento de Líderes", responsavel: "Carlos Melo", inicio: "2026-02-15", previsao: "2026-07-15", status: "Concluído", progresso: 100, prioridade: "Média", descricao: "" },
  { id: "i4", titulo: "Revisão dos POPs", responsavel: "Ana Lima", inicio: "2026-05-01", previsao: "2026-06-30", status: "Atrasado", progresso: 40, prioridade: "Alta", descricao: "" },
  { id: "i5", titulo: "Integração de Distritos", responsavel: "Pedro Souza", inicio: "2026-06-01", previsao: "2026-09-30", status: "Planejado", progresso: 0, prioridade: "Baixa", descricao: "" },
]

const statusIcon: Record<string, React.ReactNode> = {
  "Em andamento": <Clock className="w-4 h-4 text-blue-500" />,
  "Concluído": <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  "Atrasado": <XCircle className="w-4 h-4 text-red-500" />,
  "Planejado": <Rocket className="w-4 h-4 text-slate-400" />,
}

const prioridadeColor: Record<string, string> = {
  Alta: "bg-red-100 text-red-700",
  Média: "bg-yellow-100 text-yellow-700",
  Baixa: "bg-slate-100 text-slate-600",
}

function load(): Implementacao[] {
  if (typeof window === "undefined") return SEED
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return SEED
}

function save(list: Implementacao[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function ImplementacoesPage() {
  const [items, setItems] = useState<Implementacao[]>([])
  const [filtro, setFiltro] = useState("Todos")
  const [selected, setSelected] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [nova, setNova] = useState<Partial<Implementacao>>({})
  const statuses = ["Todos", "Em andamento", "Concluído", "Atrasado", "Planejado"]

  useEffect(() => { setItems(load()) }, [])

  const filtered = filtro === "Todos" ? items : items.filter(d => d.status === filtro)
  const detalhe = items.find(d => d.id === selected)

  function handleSalvar() {
    if (!nova.titulo?.trim()) return
    const item: Implementacao = {
      id: `i${Date.now()}`,
      titulo: nova.titulo ?? "",
      responsavel: nova.responsavel ?? "",
      inicio: nova.inicio ?? new Date().toISOString().slice(0, 10),
      previsao: nova.previsao ?? "",
      status: (nova.status as Implementacao["status"]) ?? "Planejado",
      progresso: nova.progresso ?? 0,
      prioridade: (nova.prioridade as Implementacao["prioridade"]) ?? "Média",
      descricao: nova.descricao ?? "",
    }
    const updated = [item, ...items]
    save(updated); setItems(updated)
    setShowModal(false); setNova({})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Implementações</h2>
          <p className="text-slate-500 mt-1">Projetos e iniciativas em acompanhamento</p>
        </div>
        <Button className="gap-2" style={{ backgroundColor: "#006494" }}
          onClick={() => { setNova({ status: "Planejado", prioridade: "Média", progresso: 0, inicio: new Date().toISOString().slice(0, 10) }); setShowModal(true) }}>
          <Plus className="w-4 h-4" />
          Nova Implementação
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFiltro(s)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              filtro === s ? "text-white border-transparent" : "border-slate-200 hover:border-blue-300"
            }`}
            style={filtro === s ? { backgroundColor: "#006494" } : {}}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id}
              className={`hover:shadow-md transition-all cursor-pointer ${selected === item.id ? "ring-2" : ""}`}
              style={selected === item.id ? { outline: "2px solid #006494" } : {}}
              onClick={() => setSelected(item.id === selected ? null : item.id)}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcon[item.status]}
                      <h3 className="font-semibold text-slate-800">{item.titulo}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prioridadeColor[item.prioridade]}`}>
                        {item.prioridade}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      Responsável: {item.responsavel} · Início: {new Date(item.inicio + "T00:00:00").toLocaleDateString("pt-BR")}
                      {item.previsao && <> · Previsão: {new Date(item.previsao + "T00:00:00").toLocaleDateString("pt-BR")}</>}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.status === "Atrasado" ? "bg-red-500" : item.status === "Concluído" ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${item.progresso}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600 w-10">{item.progresso}%</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    item.status === "Em andamento" ? "bg-blue-100 text-blue-700" :
                    item.status === "Concluído" ? "bg-emerald-100 text-emerald-700" :
                    item.status === "Atrasado" ? "bg-red-100 text-red-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-10 h-10 text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">Nenhuma implementação encontrada</p>
            </div>
          )}
        </div>

        {detalhe ? (
          <Card className="h-fit sticky top-4">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {statusIcon[detalhe.status]}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prioridadeColor[detalhe.prioridade]}`}>
                      {detalhe.prioridade}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      detalhe.status === "Em andamento" ? "bg-blue-100 text-blue-700" :
                      detalhe.status === "Concluído" ? "bg-emerald-100 text-emerald-700" :
                      detalhe.status === "Atrasado" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                    }`}>{detalhe.status}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{detalhe.titulo}</h3>
                </div>
                <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Responsável", value: detalhe.responsavel },
                  { label: "Progresso", value: `${detalhe.progresso}%` },
                  { label: "Início", value: new Date(detalhe.inicio + "T00:00:00").toLocaleDateString("pt-BR") },
                  { label: "Previsão", value: detalhe.previsao ? new Date(detalhe.previsao + "T00:00:00").toLocaleDateString("pt-BR") : "—" },
                ].map(f => (
                  <div key={f.label} className="rounded-lg p-2.5" style={{ backgroundColor: "#E8F1F2" }}>
                    <p className="text-xs text-slate-400">{f.label}</p>
                    <p className="font-semibold text-slate-700 mt-0.5 text-sm">{f.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-500">Progresso geral</span>
                  <span className="text-xs font-bold text-slate-700">{detalhe.progresso}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    detalhe.status === "Atrasado" ? "bg-red-500" : detalhe.status === "Concluído" ? "bg-emerald-500" : "bg-blue-500"
                  }`} style={{ width: `${detalhe.progresso}%` }} />
                </div>
              </div>

              {detalhe.descricao && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Descrição</h4>
                  <p className="text-sm text-slate-600 rounded-lg p-3" style={{ backgroundColor: "#f8fafc" }}>{detalhe.descricao}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {detalhe.progresso < 100 && (
                  <Button size="sm" variant="outline" className="flex-1"
                    onClick={() => {
                      const np = Math.min(100, detalhe.progresso + 10)
                      const st: Implementacao["status"] = np === 100 ? "Concluído" : detalhe.status === "Planejado" ? "Em andamento" : detalhe.status
                      const updated = items.map(i => i.id === detalhe.id ? { ...i, progresso: np, status: st } : i)
                      save(updated); setItems(updated)
                    }}>
                    +10% Progresso
                  </Button>
                )}
                {detalhe.status !== "Concluído" && (
                  <Button size="sm" className="flex-1" style={{ backgroundColor: "#006494" }}
                    onClick={() => {
                      const updated = items.map(i => i.id === detalhe.id ? { ...i, progresso: 100, status: "Concluído" as const } : i)
                      save(updated); setItems(updated)
                    }}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Concluir
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="hidden lg:flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
            Selecione uma implementação para ver os detalhes
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Nova Implementação</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Título *</label>
                <input value={nova.titulo ?? ""} onChange={e => setNova(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="Ex: Implantação do sistema X" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Responsável</label>
                <input value={nova.responsavel ?? ""} onChange={e => setNova(p => ({ ...p, responsavel: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="Nome do responsável" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Data de Início</label>
                  <input type="date" value={nova.inicio ?? ""} onChange={e => setNova(p => ({ ...p, inicio: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Previsão de Conclusão</label>
                  <input type="date" value={nova.previsao ?? ""} onChange={e => setNova(p => ({ ...p, previsao: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Prioridade</label>
                  <select value={nova.prioridade ?? "Média"} onChange={e => setNova(p => ({ ...p, prioridade: e.target.value as Implementacao["prioridade"] }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400">
                    {["Alta", "Média", "Baixa"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Status</label>
                  <select value={nova.status ?? "Planejado"} onChange={e => setNova(p => ({ ...p, status: e.target.value as Implementacao["status"] }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400">
                    {["Planejado", "Em andamento", "Atrasado", "Concluído"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Progresso inicial (%)</label>
                <input type="number" min="0" max="100" value={nova.progresso ?? 0}
                  onChange={e => setNova(p => ({ ...p, progresso: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Descrição</label>
                <textarea value={nova.descricao ?? ""} onChange={e => setNova(p => ({ ...p, descricao: e.target.value }))} rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none" placeholder="Descreva o objetivo desta implementação..." />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={handleSalvar}
                className="flex-1 px-3 py-2 text-sm rounded-lg text-white font-medium"
                style={{ background: "#006494" }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
