"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CalendarDays, Users, FileText, X, Download } from "lucide-react"
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
  const [showPautaModal, setShowPautaModal] = useState(false)
  const [editPauta, setEditPauta] = useState<string[]>([])
  const [novoPautaItem, setNovoPautaItem] = useState("")
  const editorRef = useRef<HTMLDivElement>(null)

  const execCmd = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
  }, [])

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

  function exportAtaPDF(r: Reuniao) {
    const dataFormatada = new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    const pauta = r.pauta.map((item, i) => `<li style="margin-bottom:6px">${item}</li>`).join("")
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Ata — ${r.titulo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1E293B; }
  .page { max-width: 760px; margin: 0 auto; padding: 48px 56px; }

  /* Header */
  .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 3px solid #006494; margin-bottom: 32px; }
  .logo-box { display: flex; align-items: center; gap: 12px; }
  .logo-circle { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg,#1B98E0,#006494); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 16px; }
  .org-name { font-size: 13px; font-weight: 700; color: #13293D; line-height: 1.2; }
  .org-sub { font-size: 11px; color: #64748B; margin-top: 2px; }
  .doc-label { text-align: right; }
  .doc-label-title { font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; }
  .doc-label-date { font-size: 13px; color: #006494; font-weight: 600; margin-top: 4px; }

  /* Title block */
  .title-block { background: linear-gradient(135deg, #13293D 0%, #006494 100%); border-radius: 12px; padding: 28px 32px; margin-bottom: 28px; color: #fff; }
  .title-block h1 { font-size: 22px; font-weight: 800; margin-bottom: 10px; line-height: 1.3; }
  .meta-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; }
  .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.85); }
  .meta-dot { width: 6px; height: 6px; border-radius: 50%; background: #1B98E0; flex-shrink: 0; }

  /* Sections */
  .section { margin-bottom: 28px; }
  .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid #E2E8F0; }
  .section-badge { width: 28px; height: 28px; border-radius: 8px; background: #EFF6FF; display: flex; align-items: center; justify-content: center; }
  .section-badge svg { width: 14px; height: 14px; fill: #006494; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #006494; }

  /* Pauta */
  .pauta-list { list-style: none; padding: 0; }
  .pauta-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 14px; border-radius: 8px; margin-bottom: 6px; background: #F8FAFC; border-left: 3px solid #1B98E0; }
  .pauta-num { width: 22px; height: 22px; border-radius: 50%; background: #006494; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .pauta-text { font-size: 13px; color: #334155; line-height: 1.5; }

  /* Ata */
  .ata-box { background: #FAFBFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 24px 28px; font-size: 13px; line-height: 1.8; color: #334155; }
  .ata-box ul { padding-left: 20px; margin: 8px 0; }
  .ata-box ol { padding-left: 20px; margin: 8px 0; }
  .ata-box li { margin-bottom: 4px; }
  .ata-box strong { color: #13293D; }
  .ata-box p { margin-bottom: 8px; }

  /* Footer */
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
  .footer-text { font-size: 11px; color: #94A3B8; }
  .sign-area { text-align: center; }
  .sign-line { width: 200px; border-top: 1px solid #64748B; margin: 0 auto 6px; }
  .sign-label { font-size: 11px; color: #64748B; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 32px 40px; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-box">
      <div class="logo-circle">AR</div>
      <div>
        <div class="org-name">Associação Rio Sul da IASD</div>
        <div class="org-sub">ARS Dashboard CFO</div>
      </div>
    </div>
    <div class="doc-label">
      <div class="doc-label-title">Ata de Reunião</div>
      <div class="doc-label-date">${dataFormatada}</div>
    </div>
  </div>

  <div class="title-block">
    <h1>${r.titulo}</h1>
    <div class="meta-grid">
      <div class="meta-item"><span class="meta-dot"></span>${dataFormatada} às ${r.hora}</div>
      ${r.local ? `<div class="meta-item"><span class="meta-dot"></span>${r.local}</div>` : ""}
      ${r.departamento !== "geral" ? `<div class="meta-item"><span class="meta-dot"></span>${nomeDept(r.departamento)}</div>` : ""}
      <div class="meta-item"><span class="meta-dot"></span>Registrado por: ${r.criadoPorNome}</div>
    </div>
  </div>

  ${r.pauta.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <div class="section-badge">
        <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      </div>
      <span class="section-title">Pauta da Reunião</span>
    </div>
    <ul class="pauta-list">
      ${r.pauta.map((item, i) => `
      <li class="pauta-item">
        <span class="pauta-num">${i + 1}</span>
        <span class="pauta-text">${item}</span>
      </li>`).join("")}
    </ul>
  </div>` : ""}

  ${r.ata ? `
  <div class="section">
    <div class="section-header">
      <div class="section-badge">
        <svg viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      </div>
      <span class="section-title">Ata / Deliberações</span>
    </div>
    <div class="ata-box">${r.ata}</div>
  </div>` : ""}

  <div class="footer">
    <div class="footer-text">Documento gerado em ${new Date().toLocaleDateString("pt-BR")} · ARS Dashboard CFO</div>
    <div class="sign-area">
      <div class="sign-line"></div>
      <div class="sign-label">${r.criadoPorNome}</div>
    </div>
  </div>
</div>
<script>window.onload = () => { window.print() }<\/script>
</body></html>`)
    win.document.close()
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
                <div className="flex items-start justify-between gap-2">
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
                  {reuniao.ata && (
                    <button onClick={() => exportAtaPDF(reuniao)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white shrink-0"
                      style={{ background: "#13293D" }}>
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  )}
                </div>

                {reuniao.pauta.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Pauta
                      </h4>
                      {(reuniao.criadoPor === userId || nivel <= 2) && (
                        <button className="text-xs text-blue-600 hover:underline"
                          onClick={() => { setEditPauta([...reuniao.pauta]); setNovoPautaItem(""); setShowPautaModal(true) }}>
                          Editar
                        </button>
                      )}
                    </div>
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
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-700">Ata / Deliberações</h4>
                      {(reuniao.criadoPor === userId || nivel <= 2) && (
                        <button className="text-xs text-blue-600 hover:underline"
                          onClick={() => { setAtaText(reuniao.ata); setShowAtaModal(true) }}>
                          Editar
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: reuniao.ata }} />
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

      {/* Modal Editar Pauta */}
      {showPautaModal && reuniao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800">Editar Pauta</h3>
              <button onClick={() => setShowPautaModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">{reuniao.titulo}</p>

            <ul className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {editPauta.map((item, i) => (
                <li key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center shrink-0 font-medium">{i + 1}</span>
                  <input
                    value={item}
                    onChange={e => setEditPauta(p => p.map((v, j) => j === i ? e.target.value : v))}
                    className="flex-1 text-sm bg-transparent focus:outline-none text-slate-700"
                  />
                  <button onClick={() => setEditPauta(p => p.filter((_, j) => j !== i))}
                    className="text-slate-300 hover:text-red-400 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 mb-4">
              <input
                value={novoPautaItem}
                onChange={e => setNovoPautaItem(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && novoPautaItem.trim()) {
                    setEditPauta(p => [...p, novoPautaItem.trim()])
                    setNovoPautaItem("")
                  }
                }}
                placeholder="Novo item de pauta..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={() => { if (novoPautaItem.trim()) { setEditPauta(p => [...p, novoPautaItem.trim()]); setNovoPautaItem("") } }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "#006494" }}>
                + Adicionar
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowPautaModal(false)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button
                onClick={() => {
                  const updated = reunioes.map(r => r.id === reuniao.id ? { ...r, pauta: editPauta } : r)
                  saveReunioes(updated); setReunioes(updated)
                  setShowPautaModal(false)
                }}
                className="flex-1 px-3 py-2 text-sm rounded-lg text-white font-medium"
                style={{ background: "#006494" }}>Salvar Pauta</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar/Editar Ata */}
      {showAtaModal && reuniao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800">{reuniao.ata ? "Editar Ata" : "Registrar Ata"}</h3>
              <button onClick={() => setShowAtaModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-3">{reuniao.titulo} · {new Date(reuniao.data + "T00:00:00").toLocaleDateString("pt-BR")}</p>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border border-slate-200 rounded-t-lg px-2 py-1.5 bg-slate-50">
              {[
                { cmd: "bold", label: <strong>N</strong>, title: "Negrito (Ctrl+B)" },
                { cmd: "italic", label: <em>I</em>, title: "Itálico (Ctrl+I)" },
                { cmd: "underline", label: <u>S</u>, title: "Sublinhado (Ctrl+U)" },
                { cmd: "strikeThrough", label: <s>R</s>, title: "Tachado" },
              ].map(({ cmd, label, title }) => (
                <button key={cmd} title={title} onMouseDown={e => { e.preventDefault(); execCmd(cmd) }}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-slate-200 transition-colors">
                  {label}
                </button>
              ))}
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button title="Lista com marcadores" onMouseDown={e => {
                e.preventDefault()
                editorRef.current?.focus()
                const sel = window.getSelection()
                if (sel && sel.rangeCount > 0) {
                  const range = sel.getRangeAt(0)
                  const ul = document.createElement("ul")
                  ul.style.cssText = "list-style-type:disc;padding-left:1.5em;margin:4px 0"
                  const li = document.createElement("li")
                  li.innerHTML = "<br>"
                  ul.appendChild(li)
                  range.deleteContents()
                  range.insertNode(ul)
                  range.setStart(li, 0)
                  range.collapse(true)
                  sel.removeAllRanges()
                  sel.addRange(range)
                }
              }} className="w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-slate-200">
                <span className="text-xs font-mono">• —</span>
              </button>
              <button title="Lista numerada" onMouseDown={e => {
                e.preventDefault()
                editorRef.current?.focus()
                const sel = window.getSelection()
                if (sel && sel.rangeCount > 0) {
                  const range = sel.getRangeAt(0)
                  const ol = document.createElement("ol")
                  ol.style.cssText = "list-style-type:decimal;padding-left:1.5em;margin:4px 0"
                  const li = document.createElement("li")
                  li.innerHTML = "<br>"
                  ol.appendChild(li)
                  range.deleteContents()
                  range.insertNode(ol)
                  range.setStart(li, 0)
                  range.collapse(true)
                  sel.removeAllRanges()
                  sel.addRange(range)
                }
              }} className="w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-slate-200">
                <span className="text-xs font-mono">1.</span>
              </button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button title="Alinhar à esquerda" onMouseDown={e => { e.preventDefault(); execCmd("justifyLeft") }}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><rect x="1" y="2" width="14" height="1.5"/><rect x="1" y="6" width="9" height="1.5"/><rect x="1" y="10" width="12" height="1.5"/><rect x="1" y="14" width="7" height="1.5"/></svg>
              </button>
              <button title="Centralizar" onMouseDown={e => { e.preventDefault(); execCmd("justifyCenter") }}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><rect x="1" y="2" width="14" height="1.5"/><rect x="3.5" y="6" width="9" height="1.5"/><rect x="2" y="10" width="12" height="1.5"/><rect x="4.5" y="14" width="7" height="1.5"/></svg>
              </button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <select onMouseDown={e => e.stopPropagation()}
                onChange={e => { execCmd("fontSize", e.target.value); e.target.value = "" }}
                className="text-xs border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600 h-7">
                <option value="">Tamanho</option>
                <option value="2">Pequeno</option>
                <option value="3">Normal</option>
                <option value="4">Médio</option>
                <option value="5">Grande</option>
              </select>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              {/* Cor do texto */}
              <div className="flex items-center gap-1" title="Cor do texto">
                {["#1E293B","#DC2626","#D97706","#16A34A","#006494","#7C3AED","#DB2777"].map(cor => (
                  <button key={cor} onMouseDown={e => { e.preventDefault(); execCmd("foreColor", cor) }}
                    className="w-4 h-4 rounded-sm border border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ background: cor }} title={cor} />
                ))}
              </div>
            </div>

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => {}}
              dangerouslySetInnerHTML={ataText ? { __html: ataText } : undefined}
              className="w-full min-h-[220px] px-3 py-2 text-sm border border-t-0 border-slate-200 rounded-b-lg focus:outline-none focus:border-blue-400 overflow-y-auto"
              style={{ maxHeight: 320 }}
              data-placeholder="Registre aqui as decisões, deliberações e pontos discutidos na reunião..."
            />
            <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#94a3b8;pointer-events:none}`}</style>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAtaModal(false)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button
                onClick={() => {
                  const html = editorRef.current?.innerHTML ?? ""
                  if (!html || html === "<br>") return
                  const updated = reunioes.map(r => r.id === reuniao.id ? { ...r, ata: html, status: "Concluída" as const } : r)
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
