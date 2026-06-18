"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CheckSquare, Clock, AlertCircle, X, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Decisao {
  id: string
  titulo: string
  descricao: string
  data: string
  responsavel: string
  categoria: string
  implementado: boolean
}

const STORAGE_KEY = "ars_decisoes"

const SEED: Decisao[] = [
  { id: "d1", titulo: "Aprovação do Orçamento 2026", descricao: "Orçamento anual aprovado com total de R$ 1.2M", data: "2026-01-15", responsavel: "Diretoria", categoria: "Financeiro", implementado: true },
  { id: "d2", titulo: "Revisão da Política de Subvenções", descricao: "Nova política entra em vigor a partir de março/2026", data: "2026-02-10", responsavel: "CFO", categoria: "Administrativo", implementado: true },
  { id: "d3", titulo: "Contratação de Sistema ERP", descricao: "Aprovada contratação do fornecedor XYZ para implantação do ERP", data: "2026-03-05", responsavel: "Diretoria", categoria: "Tecnologia", implementado: false },
  { id: "d4", titulo: "Criação do Comitê de Governança", descricao: "Estruturação do comitê com reuniões mensais", data: "2026-04-20", responsavel: "Presidente", categoria: "Governança", implementado: false },
  { id: "d5", titulo: "Revisão dos POPs Financeiros", descricao: "Todos os POPs devem ser revisados até junho/2026", data: "2026-05-08", responsavel: "CFO", categoria: "Administrativo", implementado: false },
]

const categorias = ["Todas", "Financeiro", "Administrativo", "Tecnologia", "Governança"]

function load(): Decisao[] {
  if (typeof window === "undefined") return SEED
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return SEED
}

function save(list: Decisao[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function DecisoesPage() {
  const [decisoes, setDecisoes] = useState<Decisao[]>([])
  const [categoria, setCategoria] = useState("Todas")
  const [busca, setBusca] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [nova, setNova] = useState<Partial<Decisao>>({})

  useEffect(() => {
    setDecisoes(load())
  }, [])

  const filtered = decisoes.filter((d) => {
    if (categoria !== "Todas" && d.categoria !== categoria) return false
    if (busca && !d.titulo.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const total = decisoes.length
  const implementadas = decisoes.filter(d => d.implementado).length
  const pendentes = filtered.filter(d => !d.implementado).length

  const detalhe = decisoes.find(d => d.id === selected)

  function handleSalvar() {
    if (!nova.titulo?.trim()) return
    const item: Decisao = {
      id: `d${Date.now()}`,
      titulo: nova.titulo ?? "",
      descricao: nova.descricao ?? "",
      data: nova.data ?? new Date().toISOString().slice(0, 10),
      responsavel: nova.responsavel ?? "",
      categoria: nova.categoria ?? "Financeiro",
      implementado: nova.implementado ?? false,
    }
    const updated = [item, ...decisoes]
    save(updated)
    setDecisoes(updated)
    setShowModal(false)
    setNova({})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Decisões Tomadas</h2>
          <p className="text-slate-500 mt-1">Histórico de deliberações institucionais</p>
        </div>
        <Button className="gap-2" style={{ backgroundColor: "#006494" }} onClick={() => { setNova({ categoria: "Financeiro", data: new Date().toISOString().slice(0, 10) }); setShowModal(true) }}>
          <Plus className="w-4 h-4" />
          Registrar Decisão
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total de Decisões</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Implementadas</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{implementadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Pendentes</p>
            <p className="text-2xl font-bold text-orange-500 mt-1">{pendentes}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {categorias.map((c) => (
              <button key={c} onClick={() => setCategoria(c)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  categoria === c ? "text-white border-transparent" : "border-slate-200 hover:border-blue-300"
                }`}
                style={categoria === c ? { backgroundColor: "#006494" } : {}}>
                {c}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs">
            <Input placeholder="Buscar decisão..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id}
              className={`hover:shadow-md transition-all cursor-pointer ${selected === item.id ? "ring-2" : ""}`}
              style={selected === item.id ? { outline: "2px solid #006494" } : {}}
              onClick={() => setSelected(item.id === selected ? null : item.id)}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg shrink-0 ${item.implementado ? "bg-emerald-50" : "bg-orange-50"}`}>
                    {item.implementado
                      ? <CheckSquare className="w-5 h-5 text-emerald-600" />
                      : <Clock className="w-5 h-5 text-orange-500" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800">{item.titulo}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{item.categoria}</span>
                      {!item.implementado && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.descricao}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR")} · Responsável: {item.responsavel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-10 h-10 text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">Nenhuma decisão encontrada</p>
            </div>
          )}
        </div>

        {detalhe ? (
          <Card className="h-fit sticky top-4">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{detalhe.categoria}</span>
                    {detalhe.implementado
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">Implementado</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700">Pendente</span>}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base leading-snug">{detalhe.titulo}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="shrink-0">
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Data", value: new Date(detalhe.data + "T00:00:00").toLocaleDateString("pt-BR") },
                  { label: "Responsável", value: detalhe.responsavel },
                ].map(f => (
                  <div key={f.label} className="rounded-lg p-2.5" style={{ backgroundColor: "#E8F1F2" }}>
                    <p className="text-xs text-slate-400">{f.label}</p>
                    <p className="font-semibold text-slate-700 mt-0.5 text-sm">{f.value}</p>
                  </div>
                ))}
              </div>

              {detalhe.descricao && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Descrição / Deliberação</h4>
                  <p className="text-sm text-slate-600 rounded-lg p-3" style={{ backgroundColor: "#f8fafc" }}>{detalhe.descricao}</p>
                </div>
              )}

              {!detalhe.implementado && (
                <Button size="sm" className="w-full gap-2" style={{ backgroundColor: "#006494" }}
                  onClick={() => {
                    const updated = decisoes.map(d => d.id === detalhe.id ? { ...d, implementado: true } : d)
                    save(updated); setDecisoes(updated)
                  }}>
                  <CheckSquare className="w-4 h-4" /> Marcar como Implementado
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="hidden lg:flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
            Selecione uma decisão para ver os detalhes
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Registrar Decisão</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Título *</label>
                <input value={nova.titulo ?? ""} onChange={e => setNova(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="Ex: Aprovação do orçamento suplementar" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Data *</label>
                  <input type="date" value={nova.data ?? ""} onChange={e => setNova(p => ({ ...p, data: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Categoria</label>
                  <select value={nova.categoria ?? "Financeiro"} onChange={e => setNova(p => ({ ...p, categoria: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400">
                    {["Financeiro", "Administrativo", "Tecnologia", "Governança"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Responsável</label>
                <input value={nova.responsavel ?? ""} onChange={e => setNova(p => ({ ...p, responsavel: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="Ex: Diretoria, CFO, Comissão..." />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Descrição / Deliberação</label>
                <textarea value={nova.descricao ?? ""} onChange={e => setNova(p => ({ ...p, descricao: e.target.value }))} rows={4}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none" placeholder="Descreva os detalhes da decisão tomada..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="impl" checked={nova.implementado ?? false}
                  onChange={e => setNova(p => ({ ...p, implementado: e.target.checked }))} />
                <label htmlFor="impl" className="text-sm text-slate-600">Já implementado</label>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={handleSalvar}
                className="flex-1 px-3 py-2 text-sm rounded-lg text-white font-medium"
                style={{ background: "#006494" }}>Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
