"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CalendarDays, Users, FileText, X } from "lucide-react"
import { getSession } from "@/lib/auth"
import { ORCAMENTO_2026 } from "@/data/orcamento-2026"

const STORAGE_KEY = "ars_reunioes"

interface Reuniao {
  id: string
  titulo: string
  data: string
  hora: string
  local: string
  departamento: string   // código ou "geral"
  criadoPor: string      // userId
  criadoPorNome: string
  participantes: string[]
  status: "Agendada" | "Hoje" | "Concluída" | "Cancelada"
  pauta: string[]
  ata: string
}

const REUNIOES_BASE: Reuniao[] = [
  {
    id: "r1", titulo: "Reunião de Diretoria — Junho", data: "2026-06-17", hora: "14:00", local: "Sala de Reuniões",
    departamento: "geral", criadoPor: "u02911242599", criadoPorNome: "Jefferson de Sousa Santos",
    participantes: ["CFO", "Presidente", "Secretário"], status: "Hoje",
    pauta: ["Aprovação do orçamento 2° semestre", "Revisão das subvenções pendentes", "Atualização dos POPs"], ata: "",
  },
  {
    id: "r2", titulo: "Reunião Financeira — Maio", data: "2026-05-28", hora: "10:00", local: "Sala de Reuniões",
    departamento: "geral", criadoPor: "u02911242599", criadoPorNome: "Jefferson de Sousa Santos",
    participantes: ["CFO", "Contador", "Tesoureiro"], status: "Concluída",
    pauta: ["Fechamento de maio", "Análise de desvios"],
    ata: "Aprovado o fechamento de maio. Identificado desvio de 8% no departamento de eventos.",
  },
  {
    id: "r3", titulo: "Planejamento 2° Semestre", data: "2026-07-05", hora: "09:00", local: "Auditório",
    departamento: "geral", criadoPor: "u09776921671", criadoPorNome: "Lucas Junio Rodrigues",
    participantes: ["CFO", "Diretores"], status: "Agendada",
    pauta: ["Metas do 2° semestre", "Revisão orçamentária"], ata: "",
  },
]

const statusColor: Record<string, string> = {
  Hoje: "bg-blue-100 text-blue-700",
  Concluída: "bg-emerald-100 text-emerald-700",
  Agendada: "bg-slate-100 text-slate-600",
  Cancelada: "bg-red-100 text-red-700",
}

const DEPTOS = [{ codigo: "geral", nome: "Geral / Institucional" }, ...ORCAMENTO_2026.map(d => ({ codigo: d.codigo, nome: d.nome }))]

function loadReunioes(): Reuniao[] {
  if (typeof window === "undefined") return REUNIOES_BASE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return REUNIOES_BASE
}

function saveReunioes(list: Reuniao[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function ReunioesPage() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [verTodas, setVerTodas] = useState(false)
  const [userId, setUserId] = useState("")
  const [userNome, setUserNome] = useState("")
  const [nivel, setNivel] = useState(5)
  const [nova, setNova] = useState<Partial<Reuniao>>({})
  const [showAtaModal, setShowAtaModal] = useState(false)
  const [ataText, setAtaText] = useState("")

  useEffect(() => {
    const session = getSession()
    setUserId(session?.userId ?? "")
    setUserNome(session?.nome ?? "")
    setNivel(session?.nivel ?? 5)
    setReunioes(loadReunioes())
  }, [])

  const podeVerTodas = nivel <= 2

  const visiveis = reunioes.filter(r =>
    podeVerTodas || verTodas ? true : r.criadoPor === userId
  )

  const reuniao = visiveis.find(r => r.id === selected)

  function handleNova() {
    setNova({ data: "", hora: "09:00", local: "", departamento: "geral", pauta: [], ata: "", status: "Agendada" })
    setShowModal(true)
  }

  function handleSalvar() {
    if (!nova.titulo || !nova.data) return
    const hoje = new Date().toISOString().slice(0, 10)
    const status: Reuniao["status"] = nova.data === hoje ? "Hoje" : nova.data! > hoje ? "Agendada" : "Concluída"
    const item: Reuniao = {
      id: `r${Date.now()}`,
      titulo: nova.titulo ?? "",
      data: nova.data ?? "",
      hora: nova.hora ?? "09:00",
      local: nova.local ?? "",
      departamento: nova.departamento ?? "geral",
      criadoPor: userId,
      criadoPorNome: userNome,
      participantes: nova.participantes ?? [],
      status,
      pauta: nova.pauta ?? [],
      ata: "",
    }
    const updated = [item, ...reunioes]
    saveReunioes(updated)
    setReunioes(updated)
    setShowModal(false)
  }

  function addPauta(texto: string) {
    if (!texto.trim()) return
    setNova(p => ({ ...p, pauta: [...(p.pauta ?? []), texto.trim()] }))
  }

  function nomeDept(codigo: string) {
    return DEPTOS.find(d => d.codigo === codigo)?.nome ?? codigo
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reuniões</h2>
          <p className="text-slate-500 mt-1">Pautas, atas e deliberações</p>
        </div>
        <div className="flex items-center gap-2">
          {podeVerTodas && (
            <button
              onClick={() => setVerTodas(!verTodas)}
              className="px-3 py-2 text-sm rounded-lg border transition-colors"
              style={verTodas ? { backgroundColor: "#006494", color: "white", borderColor: "#006494" } : { borderColor: "#E2E8F0", color: "#64748B" }}>
              {verTodas ? "Todas as reuniões" : "Minhas reuniões"}
            </button>
          )}
          <Button onClick={handleNova} className="gap-2" style={{ backgroundColor: "#006494" }}>
            <Plus className="w-4 h-4" /> Nova Reunião
          </Button>
        </div>
      </div>

      {visiveis.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarDays className="w-12 h-12 text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma reunião encontrada</p>
          <p className="text-slate-400 text-sm mt-1">Clique em "Nova Reunião" para criar a primeira.</p>
        </div>
      )}

      {visiveis.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {visiveis.map((r) => (
              <Card key={r.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selected === r.id ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => setSelected(r.id === selected ? null : r.id)}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                        <CalendarDays className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{r.titulo}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")} às {r.hora}
                          {r.local && <> · {r.local}</>}
                        </p>
                        {r.departamento !== "geral" && (
                          <p className="text-xs text-slate-400 mt-0.5">{nomeDept(r.departamento)}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">{r.criadoPorNome.split(" ")[0]}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColor[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reuniao ? (
            <Card className="h-fit">
              <CardContent className="pt-5 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{reuniao.titulo}</h3>
                  <p className="text-sm text-slate-500">
                    {new Date(reuniao.data + "T00:00:00").toLocaleDateString("pt-BR")} às {reuniao.hora}
                    {reuniao.local && <> · {reuniao.local}</>}
                  </p>
                  {reuniao.departamento !== "geral" && (
                    <p className="text-xs mt-0.5" style={{ color: "#006494" }}>{nomeDept(reuniao.departamento)}</p>
                  )}
                </div>

                {reuniao.pauta.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Pauta
                    </h4>
                    <ul className="space-y-1">
                      {reuniao.pauta.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center shrink-0 font-medium">{i + 1}</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {reuniao.ata && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Ata / Deliberações</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{reuniao.ata}</p>
                  </div>
                )}

                {!reuniao.ata && reuniao.criadoPor === userId && (
                  <Button variant="outline" className="w-full gap-2"
                    onClick={() => { setAtaText(""); setShowAtaModal(true) }}>
                    <FileText className="w-4 h-4" /> Registrar Ata
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="hidden lg:flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
              Selecione uma reunião para ver os detalhes
            </div>
          )}
        </div>
      )}

      {/* Modal Registrar Ata */}
      {showAtaModal && reuniao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Registrar Ata</h3>
              <button onClick={() => setShowAtaModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-3">{reuniao.titulo} · {new Date(reuniao.data + "T00:00:00").toLocaleDateString("pt-BR")}</p>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Ata / Deliberações *</label>
              <textarea value={ataText} onChange={e => setAtaText(e.target.value)} rows={8}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Registre aqui as decisões, deliberações e pontos discutidos na reunião..." />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAtaModal(false)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button
                onClick={() => {
                  if (!ataText.trim()) return
                  const updated = reunioes.map(r => r.id === reuniao.id ? { ...r, ata: ataText.trim(), status: "Concluída" as const } : r)
                  saveReunioes(updated); setReunioes(updated)
                  setShowAtaModal(false)
                }}
                className="flex-1 px-3 py-2 text-sm rounded-lg text-white font-medium"
                style={{ background: "#006494" }}>Salvar Ata</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Reunião */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Nova Reunião</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Título *</label>
                <input value={nova.titulo ?? ""} onChange={e => setNova(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="Ex: Reunião de Planejamento" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Data *</label>
                  <input type="date" value={nova.data ?? ""} onChange={e => setNova(p => ({ ...p, data: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Hora</label>
                  <input type="time" value={nova.hora ?? "09:00"} onChange={e => setNova(p => ({ ...p, hora: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Local</label>
                <input value={nova.local ?? ""} onChange={e => setNova(p => ({ ...p, local: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="Ex: Sala de Reuniões" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Departamento</label>
                <select value={nova.departamento ?? "geral"} onChange={e => setNova(p => ({ ...p, departamento: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400">
                  {DEPTOS.map(d => <option key={d.codigo} value={d.codigo}>{d.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Itens de pauta</label>
                <PautaInput onAdd={addPauta} />
                {(nova.pauta ?? []).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {(nova.pauta ?? []).map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">{i + 1}</span>
                        {item}
                        <button onClick={() => setNova(p => ({ ...p, pauta: (p.pauta ?? []).filter((_, j) => j !== i) }))} className="ml-auto">
                          <X className="w-3 h-3 text-slate-300 hover:text-red-400" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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

function PautaInput({ onAdd }: { onAdd: (v: string) => void }) {
  const [val, setVal] = useState("")
  return (
    <div className="flex gap-2">
      <input value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { onAdd(val); setVal("") } }}
        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
        placeholder="Adicionar item e pressionar Enter" />
      <button onClick={() => { onAdd(val); setVal("") }}
        className="px-3 py-2 text-sm rounded-lg text-white"
        style={{ background: "#006494" }}>+</button>
    </div>
  )
}
