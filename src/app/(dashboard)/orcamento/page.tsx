"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Upload, TrendingUp, TrendingDown, Minus, X, ChevronDown,
  Search, FileText, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react"
import { ORCAMENTO_2026, MES_REFERENCIA, ANO_REFERENCIA, type DeptOrcamento } from "@/data/orcamento-2026"
import { DEPT_RESPONSAVEIS } from "@/data/responsaveis"
import { BALANCETE_MENSAL, MESES_DISPONIVEIS, type MesDisponivel } from "@/data/balancete-mensal"

const anos = ["2026", "2025", "2024"]
const TODOS_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const
const MESES_SET = new Set<string>(MESES_DISPONIVEIS)

const STORAGE_KEY = "ars_orcamento_data"
const RESP_OVERRIDES_KEY = "ars_dept_responsaveis"

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadData(): DeptOrcamento[] {
  if (typeof window === "undefined") return ORCAMENTO_2026
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return ORCAMENTO_2026
}

// Responsável overrides: localStorage takes priority over Excel data
function loadRespMap(): Record<string, string[]> {
  if (typeof window === "undefined") return buildDefaultRespMap()
  try {
    const raw = localStorage.getItem(RESP_OVERRIDES_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return buildDefaultRespMap()
}

function buildDefaultRespMap(): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  for (const d of DEPT_RESPONSAVEIS) {
    if (d.responsavel && d.responsavel !== "Receita") {
      map[d.codigo] = [d.responsavel]
    }
  }
  return map
}

function saveRespMap(m: Record<string, string[]>) {
  localStorage.setItem(RESP_OVERRIDES_KEY, JSON.stringify(m))
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function pct(realizado: number, orcado: number) {
  if (!orcado) return 0
  return Math.round((realizado / orcado) * 100)
}

function parseBrNumber(s: string): number | null {
  s = s.trim()
  if (!s || s === "0,00" || s === "-") return 0
  const neg = s.startsWith("(") && s.endsWith(")")
  s = s.replace(/[()]/g, "").replace(/\./g, "").replace(",", ".")
  const v = parseFloat(s)
  if (isNaN(v)) return null
  return neg ? -v : v
}

async function parsePdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const decoder = new TextDecoder("latin1")
  const raw = decoder.decode(bytes)
  const matches = raw.match(/\(([^)]{3,})\)/g) || []
  return matches.map(m => m.slice(1, -1)).join(" ")
}

function parseBalancetePdf(text: string): DeptOrcamento[] | null {
  const lines = text.split(/\n|\r/)
  const results: Record<string, DeptOrcamento> = {}
  let inDist = false
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (/Departamento:\s+000?1\b/.test(line)) { inDist = true; continue }
    if (/Departamento:\s+\d/.test(line) && inDist) { inDist = false; continue }
    if (!inDist) continue
    const m = line.match(/^(\d{5,})\s+(.+?)\s+([\d.,()\-]+)\s+([\d.,()\-]+)\s+([\d.,()\-]+)\s+([\d.,()\-]+)\s+([\d.,()\-]+)\s+([\d.,()\-]+)/)
    if (!m) continue
    const code = m[1]
    const nome = m[2].trim()
    if (nome === nome.toUpperCase() && nome.length > 8) continue
    if (nome.includes("(-)") || nome.toUpperCase().includes("TRANSFERÊNCIA")) continue
    const SKIP = new Set(["6000000","6200000","6200001","3119000","3119005","3119012",
      "3119100","3119105","3119110","3119120","6400000","6400045","1881906","909111","910111"])
    if (SKIP.has(code)) continue
    const acumOrc = parseBrNumber(m[7])
    const acumReal = parseBrNumber(m[8])
    if (acumOrc === null || acumOrc === 0) continue
    results[code] = { codigo: code, nome, acumOrcado: Math.abs(acumOrc), acumRealizado: Math.abs(acumReal ?? 0) }
  }
  const arr = Object.values(results)
  return arr.length > 0 ? arr : null
}

// ── Multi-select dropdown ─────────────────────────────────────────────────────

function MultiSelectDropdown({
  label, placeholder, options, selected, onChange,
}: {
  label: string
  placeholder: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  const filtered = options.filter(o => !search || o.toLowerCase().includes(search.toLowerCase()))

  function toggle(o: string) {
    onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o])
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-1.5 items-center">
        {selected.map(s => (
          <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#006494" }}>
            {s.length > 25 ? s.slice(0, 25) + "…" : s}
            <button onClick={() => toggle(s)}><X className="w-3 h-3 opacity-70 hover:opacity-100" /></button>
          </span>
        ))}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-slate-200 hover:border-blue-400 bg-white transition-colors"
          >
            {selected.length === 0 ? placeholder : "Adicionar…"}
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute z-30 top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-xl w-80">
              {/* Search */}
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                    placeholder="Filtrar…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>
              {selected.length > 0 && (
                <button onClick={() => onChange([])}
                  className="w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 font-medium border-b border-slate-100 text-left">
                  Limpar seleção ({selected.length})
                </button>
              )}
              {/* Item list — explicit maxHeight, no flex gymnastics */}
              <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {filtered.length === 0 && (
                  <p className="px-3 py-4 text-xs text-slate-400 text-center">Nenhum resultado</p>
                )}
                {filtered.map(o => (
                  <button key={o} onClick={() => toggle(o)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${selected.includes(o) ? "bg-blue-50 font-medium" : "hover:bg-slate-50"}`}>
                    <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${selected.includes(o) ? "border-transparent" : "border-slate-300"}`}
                      style={selected.includes(o) ? { backgroundColor: "#006494" } : {}}>
                      {selected.includes(o) && <span className="text-white text-xs font-bold leading-none">✓</span>}
                    </span>
                    <span className="truncate">{o}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {open && <div className="fixed inset-0 z-20" onClick={() => { setOpen(false); setSearch("") }} />}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type ImportStatus = "idle" | "loading" | "success" | "error"

// ── Period data computation ───────────────────────────────────────────────────

function getPeriodData(codigo: string, selectedMeses: string[]): { orcado: number; realizado: number } {
  const mesData = BALANCETE_MENSAL[codigo]
  if (!mesData || selectedMeses.length === 0) return { orcado: 0, realizado: 0 }

  const validMeses = selectedMeses.filter(m => MESES_SET.has(m)) as MesDisponivel[]
  if (validMeses.length === 0) return { orcado: 0, realizado: 0 }

  if (validMeses.length === 1) {
    const d = mesData[validMeses[0]]
    return d ? { orcado: d.mesOrcado, realizado: d.mesRealizado } : { orcado: 0, realizado: 0 }
  }

  // Multiple months: use acumulado from the last (most recent) selected month
  const mesOrder = [...MESES_DISPONIVEIS]
  const sorted = validMeses.sort((a, b) => mesOrder.indexOf(a) - mesOrder.indexOf(b))
  const lastMes = sorted[sorted.length - 1]
  const d = mesData[lastMes]
  return d ? { orcado: d.acumOrcado, realizado: d.acumRealizado } : { orcado: 0, realizado: 0 }
}

export default function OrcamentoPage() {
  const [ano, setAno] = useState("2026")
  const [selectedMeses, setSelectedMeses] = useState<string[]>(["Maio"])
  const [busca, setBusca] = useState("")
  const [selectedDeptos, setSelectedDeptos] = useState<string[]>([])
  const [selectedResps, setSelectedResps] = useState<string[]>([])
  const [data, setData] = useState<DeptOrcamento[]>(() => loadData())
  const [respMap, setRespMap] = useState<Record<string, string[]>>(() => buildDefaultRespMap())
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle")
  const [importMsg, setImportMsg] = useState("")
  const [showImportHint, setShowImportHint] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setData(loadData())
    setRespMap(loadRespMap())
  }, [])

  // Get responsáveis for each dept row
  function getResps(codigo: string): string[] {
    return respMap[codigo] || []
  }

  // All unique dept names for dropdown
  const allNomes = [...new Set(data.map(d => d.nome))].sort()

  // All unique responsáveis actually in use
  const allRespsInUse = [...new Set(Object.values(respMap).flat())].sort()

  const filtered = data.filter(d => {
    if (selectedDeptos.length > 0 && !selectedDeptos.includes(d.nome)) return false
    if (selectedResps.length > 0) {
      const resps = getResps(d.codigo)
      if (!selectedResps.some(r => resps.includes(r))) return false
    }
    if (busca && !d.nome.toLowerCase().includes(busca.toLowerCase()) && !d.codigo.includes(busca)) return false
    return true
  })

  // Period label for display (sorted chronologically)
  const mesOrder = [...MESES_DISPONIVEIS]
  const sortedMeses = [...selectedMeses].sort((a, b) => mesOrder.indexOf(a as MesDisponivel) - mesOrder.indexOf(b as MesDisponivel))
  const mesLabel = sortedMeses.length === 0
    ? "—"
    : sortedMeses.length === 1
      ? sortedMeses[0]
      : `${sortedMeses[0].slice(0, 3)}–${sortedMeses[sortedMeses.length - 1].slice(0, 3)} (Acum.)`

  const totalOrcadoAnual = filtered.reduce((s, d) => s + d.acumOrcado, 0)
  const totalPeriodo = filtered.reduce((s, d) => {
    const p = getPeriodData(d.codigo, selectedMeses)
    return { orcado: s.orcado + p.orcado, realizado: s.realizado + p.realizado }
  }, { orcado: 0, realizado: 0 })
  const execucao = totalPeriodo.orcado > 0 ? pct(totalPeriodo.realizado, totalPeriodo.orcado) : 0

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus("loading")
    setImportMsg(`Processando ${file.name}…`)
    try {
      const text = await parsePdfText(file)
      const parsed = parseBalancetePdf(text)
      if (parsed && parsed.length > 5) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
        setData(parsed)
        setImportStatus("success")
        setImportMsg(`✓ ${parsed.length} departamentos importados de ${file.name}`)
      } else {
        setImportStatus("error")
        setImportMsg("Não foi possível extrair os dados automaticamente. Peça ao Claude para atualizar o arquivo.")
      }
    } catch {
      setImportStatus("error")
      setImportMsg("Erro ao processar o arquivo. Tente novamente ou peça ao Claude para atualizar.")
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Acompanhamento Orçamentário</h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            Orçado vs. Realizado — {ANO_REFERENCIA}
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#E8F1F2", color: "#006494" }}>
              Base: {MES_REFERENCIA}/{ANO_REFERENCIA}
            </span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          <Button className="gap-2" style={{ backgroundColor: "#006494" }}
            onClick={() => fileInputRef.current?.click()} disabled={importStatus === "loading"}>
            {importStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Importar Balancete
          </Button>
          <button onClick={() => setShowImportHint(!showImportHint)}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2">
            Como importar?
          </button>
        </div>
      </div>

      {/* Import hint */}
      {showImportHint && (
        <div className="rounded-xl p-4 text-sm border" style={{ backgroundColor: "#E8F1F2", borderColor: "#D4E8F0" }}>
          <p className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: "#006494" }} />
            Como atualizar o balancete
          </p>
          <div className="space-y-1.5 text-slate-600">
            <p>• <strong>Upload direto:</strong> clique em "Importar Balancete" e selecione o PDF</p>
            <p>• <strong>Via Claude:</strong> coloque o PDF na pasta <code className="bg-white px-1 rounded text-xs">Base de Dados - Atualização/</code> e peça: <em>"Claude, atualize o orçamento com o novo balancete"</em></p>
          </div>
        </div>
      )}

      {/* Import status */}
      {importStatus !== "idle" && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${importStatus === "success" ? "bg-emerald-50 text-emerald-700" : importStatus === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
          {importStatus === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {importStatus === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
          {importStatus === "loading" && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
          {importMsg}
          {importStatus !== "loading" && <button onClick={() => setImportStatus("idle")} className="ml-auto"><X className="w-3.5 h-3.5" /></button>}
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 pb-5 space-y-4">
          {/* Ano + Mês */}
          <div className="flex flex-wrap gap-4 items-start">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ano</label>
              <div className="flex gap-1">
                {anos.map(a => (
                  <button key={a} onClick={() => setAno(a)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${ano === a ? "text-white border-transparent" : "border-slate-200 hover:border-blue-300"}`}
                    style={ano === a ? { backgroundColor: "#006494" } : {}}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Mês — seleção múltipla
                </label>
                {selectedMeses.length > 0 && (
                  <button onClick={() => setSelectedMeses([])}
                    className="text-xs text-slate-400 hover:text-red-500 ml-4">limpar</button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {TODOS_MESES.map(m => {
                  const available = MESES_SET.has(m)
                  const active = selectedMeses.includes(m)
                  return (
                    <button key={m}
                      disabled={!available}
                      onClick={() => {
                        if (!available) return
                        setSelectedMeses(prev =>
                          prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
                        )
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                        active ? "text-white border-transparent"
                        : available ? "border-slate-200 hover:border-blue-300 text-slate-600"
                        : "border-slate-100 text-slate-300 cursor-not-allowed"
                      }`}
                      style={active ? { backgroundColor: "#006494" } : {}}>
                      {m.slice(0, 3)}
                    </button>
                  )
                })}
              </div>
              {sortedMeses.length > 1 && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Exibindo acumulado até <strong>{sortedMeses[sortedMeses.length - 1]}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Buscar por nome ou código…"
              value={busca} onChange={e => setBusca(e.target.value)} />
          </div>

          {/* Filtros multi-select em linha */}
          <div className="flex flex-wrap gap-6 items-start">
            <MultiSelectDropdown
              label="Departamento"
              placeholder="Todos os departamentos"
              options={allNomes}
              selected={selectedDeptos}
              onChange={setSelectedDeptos}
            />
            <MultiSelectDropdown
              label="Responsável"
              placeholder="Todos os responsáveis"
              options={allRespsInUse}
              selected={selectedResps}
              onChange={setSelectedResps}
            />
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="card-hover-glow">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Orçado Anual 2026</p>
            <p className="text-2xl font-bold text-slate-800 mt-1 valor-glow">{fmt(totalOrcadoAnual)}</p>
            <p className="text-xs text-slate-400 mt-1">{filtered.length} departamentos</p>
          </CardContent>
        </Card>
        <Card className="card-hover-glow">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Orçado no Período</p>
            <p className="text-2xl font-bold text-slate-800 mt-1 valor-glow">{fmt(totalPeriodo.orcado)}</p>
            <p className="text-xs text-slate-400 mt-1">{mesLabel}</p>
          </CardContent>
        </Card>
        <Card className="card-hover-glow">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Realizado no Período</p>
            <p className={`text-2xl font-bold mt-1 valor-glow ${totalPeriodo.realizado > totalPeriodo.orcado ? "text-red-600" : "text-emerald-600"}`}>
              {fmt(totalPeriodo.realizado)}
            </p>
            <p className="text-xs text-slate-400 mt-1">{mesLabel}</p>
          </CardContent>
        </Card>
        <Card className="card-hover-glow">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-slate-500">Execução do Período</p>
                <p className={`text-2xl font-bold mt-1 valor-glow ${execucao > 100 ? "text-red-600" : execucao > 80 ? "text-orange-500" : "text-blue-600"}`}>
                  {execucao}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Saldo</p>
                <p className={`text-lg font-bold mt-0.5 valor-glow ${totalPeriodo.orcado - totalPeriodo.realizado < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {fmt(totalPeriodo.orcado - totalPeriodo.realizado)}
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${execucao > 100 ? "bg-red-500" : execucao > 80 ? "bg-orange-400" : "bg-blue-500"}`}
                style={{ width: `${Math.min(execucao, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{fmt(totalPeriodo.realizado)} de {fmt(totalPeriodo.orcado)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Detalhamento — {mesLabel} / {ano}
            {(selectedDeptos.length > 0 || selectedResps.length > 0 || busca) && (
              <span className="text-sm font-normal text-slate-400 ml-2">
                · {filtered.length} resultado(s)
                {selectedResps.length > 0 && ` · resp: ${selectedResps.join(", ")}`}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="max-h-[520px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10 border-b">
                  <tr>
                    <th className="text-left py-3 px-2 font-semibold text-slate-600 whitespace-nowrap">Cód.</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-600">Departamento / Conta</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-600">Responsável(is)</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-600 whitespace-nowrap">Orçado Anual</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-600 whitespace-nowrap">Orç. Período</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-600 whitespace-nowrap">Realizado</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-600 whitespace-nowrap">Saldo</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-600">Execução</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => {
                    const period = getPeriodData(row.codigo, selectedMeses)
                    const diff = period.orcado - period.realizado
                    const exec = pct(period.realizado, period.orcado)
                    const resps = getResps(row.codigo)
                    return (
                      <tr key={row.codigo} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-2 font-mono text-xs text-slate-400">{row.codigo}</td>
                        <td className="py-2.5 px-2 font-medium text-slate-800">{row.nome}</td>
                        <td className="py-2.5 px-2">
                          {resps.length === 0
                            ? <span className="text-xs text-slate-300">—</span>
                            : resps.map(r => (
                              <span key={r} className="inline-block mr-1 px-1.5 py-0.5 rounded text-xs font-medium"
                                style={{ backgroundColor: "#E8F1F2", color: "#006494" }}>
                                {r}
                              </span>
                            ))
                          }
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-500 text-xs">{fmt(row.acumOrcado)}</td>
                        <td className="py-2.5 px-2 text-right text-slate-600">{period.orcado > 0 ? fmt(period.orcado) : <span className="text-slate-300">—</span>}</td>
                        <td className="py-2.5 px-2 text-right font-medium">{period.realizado > 0 ? fmt(period.realizado) : <span className="text-slate-300">—</span>}</td>
                        <td className={`py-2.5 px-2 text-right font-medium ${diff < 0 ? "text-red-600" : period.orcado > 0 ? "text-emerald-600" : "text-slate-300"}`}>{period.orcado > 0 ? fmt(diff) : "—"}</td>
                        <td className="py-2.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${exec > 100 ? "bg-red-500" : exec > 80 ? "bg-orange-400" : "bg-blue-500"}`}
                                style={{ width: `${Math.min(exec, 100)}%` }} />
                            </div>
                            <span className="text-xs w-8">{exec}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          {exec > 100
                            ? <TrendingUp className="w-4 h-4 text-red-500" />
                            : exec < 80
                              ? <TrendingDown className="w-4 h-4 text-emerald-500" />
                              : <Minus className="w-4 h-4 text-slate-400" />}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">Nenhum resultado para os filtros aplicados.</p>
              )}
            </div>
          </div>
          <div className="pt-3 mt-2 border-t flex items-center justify-between text-xs text-slate-400">
            <span>{filtered.length} de {data.length} departamentos</span>
            <span>Base orçada: {MES_REFERENCIA}/{ANO_REFERENCIA} · Realizado: Jan–Mai/2026</span>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
