// @refresh reset
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { BALANCETE_DEPT, MESES_KEYS, MES_LABEL, type MesKey, type DeptInfo } from "@/data/balancete-dept"
import {
  ChevronRight, ChevronDown, Download, Search, X,
  CheckCircle2, TrendingUp, TrendingDown, Minus,
  BarChart3, FileText, List, PanelLeftClose, PanelLeftOpen,
  Circle,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "edicao" | "resumo-fundos" | "resumo-operacional"
type AjusteData = { pct: string; valor: string }

// ── Constants ─────────────────────────────────────────────────────────────────
const TODOS_MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"] as const
const MESES_SET = new Set<string>(MESES_KEYS.map(k => k))
const MES_TO_KEY: Record<string, MesKey> = { "Janeiro":"Jan","Fevereiro":"Fev","Março":"Mar","Abril":"Abr","Maio":"Mai" }

const STORAGE_AJUSTES = "ars_mab3_ajustes"
const STORAGE_DEPT = "ars_mab3_dept"
const STORAGE_EXPANDED = "ars_mab3_exp"
const STORAGE_STATUS = "ars_mab3_dstatus"

type DeptStatus = "pendente" | "analisado" | "revisar" | "concluido"
const STATUS_LABEL: Record<DeptStatus, string> = { pendente: "Pendente", analisado: "Analisado", revisar: "Revisar", concluido: "Concluído" }
const STATUS_COLOR: Record<DeptStatus, string> = { pendente: "#DC2626", analisado: "#006494", revisar: "#D97706", concluido: "#059669" }

// Account group mappings for resumo
const GRUPOS_RECEITA: Record<string, {label: string; codes: string[]}> = {
  "A311": { label: "A311 (=) DÍZIMOS LÍQUIDOS DE REPASSES", codes: ["3110000"] },
  "A312": { label: "A312 OFERTAS LÍQUIDAS", codes: ["3120000","3121000"] },
  "A313": { label: "A313 DOAÇÕES", codes: ["3130000","3131000"] },
  "A318A": { label: "A318A RECEITAS FINANCEIRAS", codes: ["3181000","3180000"] },
  "A318B": { label: "A318B OUTRAS RECEITAS RECORRENTES", codes: ["3182000","3183000","3184000","3185000","3186000","3187000","3188000","3190000","3191000","3193000"] },
}
const GRUPOS_DESPESA: Record<string, {label: string; codes: string[]}> = {
  "A411": { label: "A411 DESPESAS COM PESSOAL", codes: ["4110000"] },
  "A412": { label: "A412 ADMINISTRATIVAS E GERAIS", codes: ["4120000"] },
  "A414": { label: "A414 EDUCAÇÃO, ASSIST. E ORIENT. SOCIAL", codes: ["4140000","4141000","4142000","4143000","4144000","4145000"] },
  "A419": { label: "A419 OUTORGAMENTOS", codes: ["4190000","4191000","4192000","4193000","4194000","4195000","4196000","4197000","4198000","4199000"] },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtBR(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `R$ ${(n/1_000_000).toFixed(2)}M`
  return `R$ ${fmtBR(n)}`
}
function parseBR(s: string): number {
  if (!s || s === "0,00") return 0
  return parseFloat(s.replace(/\./g,"").replace(",",".")) || 0
}
function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g,"")
  if (!digits) return ""
  const num = parseInt(digits, 10)
  const reais = Math.floor(num / 100)
  const centavos = num % 100
  return `${reais.toLocaleString("pt-BR")},${String(centavos).padStart(2,"0")}`
}

function getPeriodData(dept: DeptInfo, acctCode: string, selectedMeses: string[]) {
  const conta = dept.contas[acctCode]
  if (!conta) return { orcPeriodo: 0, realPeriodo: 0 }
  const valid = selectedMeses.map(m => MES_TO_KEY[m]).filter(Boolean) as MesKey[]
  if (valid.length === 0) return { orcPeriodo: 0, realPeriodo: 0 }
  const sorted = [...valid].sort((a,b) => MESES_KEYS.indexOf(a) - MESES_KEYS.indexOf(b))
  if (sorted.length === 1) {
    const d = conta.d[sorted[0]]
    return { orcPeriodo: d?.[0] ?? 0, realPeriodo: d?.[1] ?? 0 }
  }
  const last = sorted[sorted.length - 1]
  const d = conta.d[last]
  return { orcPeriodo: d?.[2] ?? 0, realPeriodo: d?.[3] ?? 0 }
}

function getNumMeses(selectedMeses: string[]): number {
  return selectedMeses.filter(m => MES_TO_KEY[m]).length || 1
}

// Consolidated "TOTAL" virtual entry
const TOTAL_DEPT_CODE = "__TOTAL__"

// Get all depts with their fundo label
const ALL_DEPTS = [
  { code: TOTAL_DEPT_CODE, nome: "CONSOLIDADO — Todos os Departamentos", fundo: "__total__" },
  ...Object.entries(BALANCETE_DEPT)
    .map(([code, d]) => ({ code, nome: d.nome, fundo: d.fundo }))
    .sort((a, b) => a.code.localeCompare(b.code))
]

const FUNDOS = ["__total__","10","25","69","outros"]
function getFundoLabel(f: string) {
  if (f === "__total__") return "Visão Consolidada"
  if (f === "10") return "Fundo 10 – Operativo"
  if (f === "25") return "Fundo 25 – Adm."
  if (f === "69") return "Fundo 69 – Educ."
  return "Outros Fundos"
}

// ── Summary helper: compute group total per dept respecting leaf ajustes ────────
function computeGroupTotal(
  dCode: string, d: DeptInfo, groupPrefix: string,
  selectedMeses: string[], nMeses: number,
  ajustes: Record<string, Record<string, AjusteData>>
): number {
  const deptAjustes = ajustes[dCode] ?? {}
  const hasAnyAjuste = Object.keys(deptAjustes).length > 0
  if (!hasAnyAjuste) return d.contas[groupPrefix]?.orcadoAnual ?? 0

  const allCodes = Object.keys(d.contas)
  const groupAccounts = allCodes.filter(c => c === groupPrefix || c.startsWith(groupPrefix))
  const leaves = groupAccounts.filter(c => {
    if (c === groupPrefix) return false
    return !groupAccounts.some(o => o !== c && o.startsWith(c))
  })

  function leafTotal(lCode: string): number {
    const cv = d.contas[lCode]
    if (!cv) return 0
    const ajuste = deptAjustes[lCode]
    if (ajuste?.valor) {
      const valid = selectedMeses.map(m => MES_TO_KEY[m]).filter(Boolean) as MesKey[]
      const sorted = [...valid].sort((a,b) => MESES_KEYS.indexOf(a) - MESES_KEYS.indexOf(b))
      const last = sorted[sorted.length-1]
      const real = sorted.length === 1 ? (cv.d[sorted[0]]?.[1] ?? 0) : (cv.d[last]?.[3] ?? 0)
      return (real / nMeses) * 12 + parseBR(ajuste.valor)
    }
    return cv.orcadoAnual
  }

  if (leaves.length === 0) return leafTotal(groupPrefix)
  return leaves.reduce((s, lc) => s + leafTotal(lc), 0)
}

// ── Semaphore icon ─────────────────────────────────────────────────────────────
function SemaIcon({ orcPeriodo, realPeriodo }: { orcPeriodo: number; realPeriodo: number }) {
  if (orcPeriodo === 0 || realPeriodo === 0) return <Minus className="w-3.5 h-3.5 opacity-30" />
  const pct = (realPeriodo - orcPeriodo) / orcPeriodo * 100
  if (pct <= 10 && pct >= -10) return <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#059669" }} />
  if (pct > 10) return <TrendingUp className="w-3.5 h-3.5" style={{ color: "#DC2626" }} />
  return <TrendingDown className="w-3.5 h-3.5" style={{ color: "#D97706" }} />
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MakeABudgetPage() {
  const [selectedMeses, setSelectedMeses] = useState<string[]>(["Maio"])
  const [selectedDept, setSelectedDept] = useState<string>("0001")
  const [tab, setTab] = useState<Tab>("edicao")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [ajustes, setAjustes] = useState<Record<string, Record<string, AjusteData>>>({})
  const [search, setSearch] = useState("")
  const [deptSearch, setDeptSearch] = useState("")
  const [viewReceitas, setViewReceitas] = useState(false)
  const [deptStatuses, setDeptStatuses] = useState<Record<string, DeptStatus>>({})
  const [deptPanelOpen, setDeptPanelOpen] = useState(true)
  const [selectedRow, setSelectedRow] = useState<string | null>(null)
  const [globalPct, setGlobalPct] = useState("")
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [newAccCode, setNewAccCode] = useState("")
  const [newAccName, setNewAccName] = useState("")
  const [newAccParent, setNewAccParent] = useState("")
  const [customAccounts, setCustomAccounts] = useState<Record<string, Array<{code: string; nome: string}>>>({})
  const STORAGE_CUSTOM = "ars_mab3_custom"

  useEffect(() => {
    try {
      const a = localStorage.getItem(STORAGE_AJUSTES)
      if (a) setAjustes(JSON.parse(a))
      const d = localStorage.getItem(STORAGE_DEPT)
      if (d) setSelectedDept(d)
      const e = localStorage.getItem(STORAGE_EXPANDED)
      if (e) setExpanded(new Set(JSON.parse(e)))
      const s = localStorage.getItem(STORAGE_STATUS)
      if (s) setDeptStatuses(JSON.parse(s))
      const c = localStorage.getItem("ars_mab3_custom")
      if (c) setCustomAccounts(JSON.parse(c))
    } catch { /* ignore */ }
  }, [])

  const saveAjustes = useCallback((next: Record<string, Record<string, AjusteData>>) => {
    setAjustes(next)
    localStorage.setItem(STORAGE_AJUSTES, JSON.stringify(next))
  }, [])

  const saveStatus = useCallback((next: Record<string, DeptStatus>) => {
    setDeptStatuses(next)
    localStorage.setItem(STORAGE_STATUS, JSON.stringify(next))
  }, [])

  const setDeptStatus = useCallback((dCode: string, status: DeptStatus) => {
    saveStatus({ ...deptStatuses, [dCode]: status })
  }, [deptStatuses, saveStatus])

  const selectDept = (code: string) => {
    setSelectedDept(code)
    localStorage.setItem(STORAGE_DEPT, code)
    setTab("edicao")
    setSelectedRow(null)
    // Auto-expand first-level accounts
    const d = BALANCETE_DEPT[code]
    if (d) {
      const codes = Object.keys(d.contas)
      const codeSet = new Set(codes)
      const roots: string[] = []
      for (const ac of codes) {
        let isRoot = true
        for (let len = ac.length - 1; len >= 4; len--) {
          if (codeSet.has(ac.slice(0, len))) { isRoot = false; break }
        }
        if (isRoot) roots.push(ac)
      }
      const autoExpand = new Set(roots)
      setExpanded(autoExpand)
      localStorage.setItem(STORAGE_EXPANDED, JSON.stringify([...autoExpand]))
    }
  }

  const toggleMes = (mes: string) => {
    if (!MES_TO_KEY[mes]) return
    setSelectedMeses(prev =>
      prev.includes(mes) ? (prev.length > 1 ? prev.filter(m => m !== mes) : prev) : [...prev, mes]
    )
  }

  const toggleExpand = (code: string) => {
    const next = new Set(expanded)
    if (next.has(code)) next.delete(code); else next.add(code)
    setExpanded(next)
    localStorage.setItem(STORAGE_EXPANDED, JSON.stringify([...next]))
  }

  // Build aggregated dept when TOTAL is selected
  const dept: DeptInfo | undefined = useMemo(() => {
    if (selectedDept !== TOTAL_DEPT_CODE) return BALANCETE_DEPT[selectedDept]
    // Aggregate all departments
    const allContas: Record<string, import("@/data/balancete-dept").DeptContaInfo> = {}
    for (const d of Object.values(BALANCETE_DEPT)) {
      for (const [code, cv] of Object.entries(d.contas)) {
        if (!allContas[code]) {
          allContas[code] = { nome: cv.nome, isTot: cv.isTot, orcadoAnual: 0, d: {} }
        }
        allContas[code].orcadoAnual += cv.orcadoAnual
        for (const [mk, vals] of Object.entries(cv.d)) {
          const key = mk as MesKey
          if (!allContas[code].d[key]) allContas[code].d[key] = [0,0,0,0]
          const existing = allContas[code].d[key]!
          allContas[code].d[key] = [
            existing[0] + (vals?.[0] ?? 0),
            existing[1] + (vals?.[1] ?? 0),
            existing[2] + (vals?.[2] ?? 0),
            existing[3] + (vals?.[3] ?? 0),
          ]
        }
      }
    }
    return { fundo: "__total__", nome: "CONSOLIDADO", contas: allContas }
  }, [selectedDept])

  const nMeses = getNumMeses(selectedMeses)

  // Sort selectedMeses
  const sortedSel = [...selectedMeses].sort((a,b) => MESES_KEYS.indexOf(MES_TO_KEY[a]) - MESES_KEYS.indexOf(MES_TO_KEY[b]))
  const mesLabel = sortedSel.length === 1 ? sortedSel[0]
    : `${sortedSel[0]?.slice(0,3)}–${sortedSel[sortedSel.length-1]?.slice(0,3)} (Acum.)`

  // Ajuste handlers for a dept/account
  const getAjuste = (dCode: string, aCode: string): AjusteData =>
    ajustes[dCode]?.[aCode] ?? { pct: "", valor: "" }

  const handlePct = (dCode: string, aCode: string, pct: string) => {
    const d = BALANCETE_DEPT[dCode]
    if (!d) return
    const { realPeriodo } = getPeriodData(d, aCode, selectedMeses)
    const proj = (realPeriodo / nMeses) * 12
    let valor = ""
    const pctNum = parseBR(pct.replace(",","."))
    if (!isNaN(pctNum) && proj !== 0) {
      const v = proj * pctNum / 100
      valor = applyMask(String(Math.round(Math.abs(v) * 100)))
      if (v < 0) valor = "-" + valor
    }
    const next = { ...ajustes, [dCode]: { ...(ajustes[dCode] ?? {}), [aCode]: { pct, valor } } }
    saveAjustes(next)
  }

  const handleValor = (dCode: string, aCode: string, rawInput: string) => {
    const isNeg = rawInput.startsWith("-")
    const digits = rawInput.replace(/\D/g,"")
    const valor = (isNeg ? "-" : "") + (digits ? applyMask(digits) : "")
    const d = BALANCETE_DEPT[dCode]
    if (!d) return
    const { realPeriodo } = getPeriodData(d, aCode, selectedMeses)
    const proj = (realPeriodo / nMeses) * 12
    let pct = ""
    const valorNum = parseBR(valor)
    if (!isNaN(valorNum) && proj !== 0) {
      pct = (valorNum / proj * 100).toFixed(2).replace(".",",")
    }
    const next = { ...ajustes, [dCode]: { ...(ajustes[dCode] ?? {}), [aCode]: { pct, valor } } }
    saveAjustes(next)
  }

  // Apply global % to all leaf accounts in current dept
  const applyToAll = () => {
    if (!dept || !globalPct) return
    const pctNum = parseFloat(globalPct.replace(",","."))
    if (isNaN(pctNum)) return
    const codes = Object.keys(dept.contas).sort()
    const codeSetLocal = new Set(codes)
    const childrenLocal: Record<string, boolean> = {}
    for (const c of codes) {
      for (let len = c.length - 1; len >= 4; len--) {
        if (codeSetLocal.has(c.slice(0, len))) { childrenLocal[c] = true; break }
      }
    }
    // leaves = codes that have no children (are not parents)
    const parentSet = new Set<string>()
    for (const c of codes) {
      for (let len = c.length - 1; len >= 4; len--) {
        if (codeSetLocal.has(c.slice(0, len))) { parentSet.add(c.slice(0, len)); break }
      }
    }
    const leaves = codes.filter(c => !parentSet.has(c))
    let batch = { ...(ajustes[selectedDept] ?? {}) }
    for (const aCode of leaves) {
      const cv = dept.contas[aCode]
      if (!cv || cv.isTot) continue
      const { realPeriodo } = getPeriodData(dept, aCode, selectedMeses)
      const proj = (realPeriodo / nMeses) * 12
      let valor = ""
      if (proj !== 0) {
        const v = proj * pctNum / 100
        valor = applyMask(String(Math.round(Math.abs(v) * 100)))
        if (v < 0) valor = "-" + valor
      }
      batch[aCode] = { pct: globalPct, valor }
    }
    saveAjustes({ ...ajustes, [selectedDept]: batch })
  }

  // Add custom account to dept
  const addCustomAccount = () => {
    if (!newAccCode.trim() || !newAccName.trim() || !selectedDept) return
    const next = { ...customAccounts, [selectedDept]: [...(customAccounts[selectedDept] ?? []), { code: newAccCode.trim(), nome: newAccName.trim() }] }
    setCustomAccounts(next)
    localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(next))
    setNewAccCode(""); setNewAccName(""); setNewAccParent(""); setShowAddAccount(false)
  }

  // Export PDF for fundos/operacional
  const exportTabPDF = (tabName: string, htmlContent: string) => {
    const logoBase64 = typeof window !== "undefined" ? localStorage.getItem("ars_logo_base64") || "" : ""
    const logoHtml = logoBase64
      ? `<img src="${logoBase64}" style="height:48px;object-fit:contain;" />`
      : `<div style="width:48px;height:48px;background:linear-gradient(135deg,#1B98E0,#006494);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;">AR</div>`
    const win = window.open("","_blank")
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Make a Budget — ${tabName}</title>
    <style>
      body{margin:0;padding:32px 40px;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1E293B;}
      @media print{body{padding:16px 20px;}}
      table{width:100%;border-collapse:collapse;}
      th{background:#1E3A8A;color:#E0F2FE;padding:8px 10px;text-align:right;font-size:10px;}
      th:first-child{text-align:left;}
      td{padding:5px 10px;border-bottom:1px solid #F1F5F9;text-align:right;}
      td:first-child{text-align:left;}
      .bold{font-weight:700;}
      .blue-row{background:#EFF6FF;}
      .yellow-row{background:#FFFBEB;}
      .result-row{background:#FFFBEB;border-top:2px solid #FCD34D;}
    </style></head><body>
    <div style="display:flex;align-items:center;gap:14px;padding-bottom:12px;border-bottom:3px solid #006494;margin-bottom:20px;">
      ${logoHtml}
      <div>
        <div style="font-size:9px;color:#64748b;">Associação Rio Sul da IASD — Make a Budget</div>
        <div style="font-size:18px;font-weight:800;color:#13293D;">${tabName}</div>
        <div style="font-size:11px;color:#006494;font-weight:600;">Exercício ${new Date().getFullYear() + 1}</div>
      </div>
      <div style="margin-left:auto;text-align:right;font-size:9px;color:#94a3b8;">
        <div>Gerado em</div>
        <div style="font-weight:600;color:#374151;">${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>
      </div>
    </div>
    ${htmlContent}
    </body></html>`)
    win.document.close()
    setTimeout(() => { win.print() }, 400)
  }

  // Build tree for current dept (including custom accounts)
  const customForDept = customAccounts[selectedDept] ?? []
  const deptCodes = dept
    ? [...Object.keys(dept.contas), ...customForDept.map(c => c.code)].sort()
    : []
  const codeSet = new Set(deptCodes)
  const parentOf: Record<string, string | null> = {}
  const children: Record<string, string[]> = {}
  const roots: string[] = []

  // meaningful prefix = code with trailing zeros stripped (e.g. "4190000" → "419")
  const meaningful: Record<string, string> = {}
  for (const c of deptCodes) meaningful[c] = c.replace(/0+$/, "") || c[0]

  for (const code of deptCodes) {
    const m = meaningful[code]
    let parent: string | null = null
    let bestLen = 0
    for (const cand of deptCodes) {
      if (cand === code) continue
      const cm = meaningful[cand]
      if (m.startsWith(cm) && cm.length > bestLen) { parent = cand; bestLen = cm.length }
    }
    parentOf[code] = parent
    if (parent) { if (!children[parent]) children[parent] = []; children[parent].push(code) }
    else roots.push(code)
  }

  // Filter by receitas/despesas
  const prefix = viewReceitas ? "3" : "4"
  const filteredRoots = roots.filter(c => c.startsWith(prefix))

  // Dept totals for selected period
  const deptTotals = useMemo(() => {
    if (!dept) return { orc: 0, real: 0, proj: 0, orcAnual: 0 }
    const topCode = viewReceitas ? "3000000" : "4000000"
    const { orcPeriodo, realPeriodo } = getPeriodData(dept, topCode, selectedMeses)
    const conta = dept.contas[topCode]
    return {
      orc: orcPeriodo, real: realPeriodo,
      proj: (realPeriodo / nMeses) * 12,
      orcAnual: conta?.orcadoAnual ?? 0,
    }
  }, [dept, selectedMeses, viewReceitas, nMeses])

  // Recursive sum of totalProxAno for all leaf descendants (includes individual adjustments)
  const calcTotalProxAno = useCallback((code: string): number => {
    if (!dept) return 0
    const kids = children[code] ?? []
    if (kids.length === 0) {
      // Leaf account
      const { realPeriodo } = getPeriodData(dept, code, selectedMeses)
      const proj = (realPeriodo / nMeses) * 12
      const ajuste = getAjuste(selectedDept, code)
      return proj + parseBR(ajuste.valor)
    }
    return kids.reduce((sum, k) => sum + calcTotalProxAno(k), 0)
  }, [dept, children, selectedMeses, nMeses, selectedDept, getAjuste])

  // ── Row renderer ─────────────────────────────────────────────────────────────
  const renderRow = (code: string, depth: number): React.ReactNode => {
    if (!dept) return null
    // Support custom accounts (not in dept.contas)
    const customAcc = customForDept.find(c => c.code === code)
    const conta = dept.contas[code] ?? (customAcc ? { nome: customAcc.nome, isTot: false, orcadoAnual: 0, d: {} } : null)
    if (!conta) return null
    if (search && !code.includes(search) && !conta.nome.toLowerCase().includes(search.toLowerCase())) {
      // Check if any child matches
      const kids = children[code] ?? []
      const anyKidMatches = kids.some(k => {
        const kc = dept.contas[k]
        return kc && (k.includes(search) || kc.nome.toLowerCase().includes(search.toLowerCase()))
      })
      if (!anyKidMatches) return null
    }

    const kids = children[code] ?? []
    const hasKids = kids.length > 0
    const isExpanded = expanded.has(code)
    const isTot = conta.isTot || hasKids

    const { orcPeriodo, realPeriodo } = getPeriodData(dept, code, selectedMeses)
    const projecao = (realPeriodo / nMeses) * 12
    const ajuste = getAjuste(selectedDept, code)
    const ajusteValor = parseBR(ajuste.valor)
    const totalProxAno = projecao + ajusteValor
    const hasAjuste = ajuste.valor !== "" && ajusteValor !== 0

    const indent = depth * 18

    const isRowSelected = selectedRow === code

    return (
      <div key={code}>
        <div
          className="flex items-center border-b group transition-colors"
          style={{
            borderColor: "#F1F5F9",
            background: isRowSelected ? "#DBEAFE"
              : isTot
                ? depth === 0 ? "#EFF6FF" : depth === 1 ? "#F0F9FF" : "#F8FAFC"
                : "#fff",
            minHeight: isTot ? 34 : 30,
            cursor: "pointer",
          }}
          onClick={() => setSelectedRow(isRowSelected ? null : code)}
        >
          {/* Account code + name */}
          <div
            className="flex items-center gap-1 shrink-0"
            style={{ width: 400, paddingLeft: 10 + indent, paddingRight: 6 }}
            onClick={e => { e.stopPropagation(); if (hasKids) { toggleExpand(code); setSelectedRow(code) } else setSelectedRow(isRowSelected ? null : code) }}
          >
            <span className="w-4 shrink-0 flex items-center justify-center">
              {hasKids
                ? isExpanded
                  ? <ChevronDown className="w-3 h-3" style={{ color: "#006494" }} />
                  : <ChevronRight className="w-3 h-3" style={{ color: "#94A3B8" }} />
                : <span className="w-3" />}
            </span>
            <span className="font-mono shrink-0 mr-1.5 text-right" style={{ fontSize: 10, color: isTot ? "#1E3A8A" : "#94A3B8", minWidth: 68 }}>
              {code}
            </span>
            <span className="truncate" style={{
              fontSize: isTot ? 11 : 11,
              fontWeight: isTot ? 700 : 400,
              color: isTot ? "#1E293B" : "#374151",
            }}>
              {conta.nome}
            </span>
          </div>

          {/* Orç. Período */}
          <Cell isTot={isTot} color={isTot ? "#1E3A8A" : undefined}>{orcPeriodo ? fmtBR(orcPeriodo) : "—"}</Cell>

          {/* Real. Período */}
          <Cell isTot={isTot} color={isTot ? "#059669" : undefined}>{realPeriodo ? fmtBR(realPeriodo) : "—"}</Cell>

          {/* Orç. Anual */}
          <Cell isTot={isTot} color={isTot ? "#1E3A8A" : undefined}>{conta.orcadoAnual ? fmtBR(conta.orcadoAnual) : "—"}</Cell>

          {/* Projeção Anual + semaphore */}
          <div className="text-right shrink-0 flex items-center justify-end gap-1 pr-2" style={{ width: 130 }}>
            <SemaIcon orcPeriodo={orcPeriodo} realPeriodo={realPeriodo} />
            <span style={{ fontSize: 11, color: isTot ? "#7C3AED" : "#374151", fontWeight: isTot ? 700 : 400 }}>
              {projecao ? fmtBR(projecao) : "—"}
            </span>
          </div>

          {/* % Reajuste */}
          <div className="shrink-0 px-1" style={{ width: 88 }}>
            {!isTot ? (
              <input
                type="text"
                value={ajuste.pct}
                onChange={e => handlePct(selectedDept, code, e.target.value)}
                placeholder="0,00"
                className="w-full text-right px-1.5 py-0.5 rounded border outline-none"
                style={{ fontSize: 11, borderColor: ajuste.pct ? "#006494" : "#E2E8F0", color: "#374151" }}
              />
            ) : <span className="block text-right text-xs pr-1" style={{ color: "#CBD5E1" }}>—</span>}
          </div>

          {/* R$ Reajuste */}
          <div className="shrink-0 px-1" style={{ width: 110 }}>
            {!isTot ? (
              <input
                type="text"
                value={ajuste.valor}
                onChange={e => handleValor(selectedDept, code, e.target.value)}
                placeholder="0,00"
                className="w-full text-right px-1.5 py-0.5 rounded border outline-none"
                style={{ fontSize: 11, borderColor: ajuste.valor ? "#006494" : "#E2E8F0", color: "#374151" }}
              />
            ) : <span className="block text-right text-xs pr-1" style={{ color: "#CBD5E1" }}>—</span>}
          </div>

          {/* Total Próx. Ano — destaque */}
          {(() => {
            const displayTotal = isTot ? calcTotalProxAno(code) : totalProxAno
            const showValue = displayTotal !== 0 || hasAjuste
            return (
              <div
                className="text-right shrink-0 px-2"
                style={{
                  width: 128,
                  background: hasAjuste ? "#F0FDF4" : showValue ? "#F8FAFF" : "transparent",
                  borderLeft: `2px solid ${hasAjuste ? "#059669" : "#E2E8F0"}`,
                }}
              >
                {showValue ? (
                  <span style={{
                    fontSize: 11,
                    fontWeight: isTot ? 700 : hasAjuste ? 700 : 400,
                    color: isTot ? "#1E3A8A" : hasAjuste ? "#059669" : "#374151",
                  }}>
                    {fmtBR(displayTotal)}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: "#CBD5E1" }}>—</span>
                )}
              </div>
            )
          })()}
        </div>

        {hasKids && isExpanded && kids.map(k => renderRow(k, depth + 1))}
      </div>
    )
  }

  // ── Dept filtered list ────────────────────────────────────────────────────────
  const filteredDepts = ALL_DEPTS.filter(d =>
    !deptSearch || d.nome.toLowerCase().includes(deptSearch.toLowerCase()) || d.code.includes(deptSearch)
  )
  const deptsByFundo: Record<string, typeof filteredDepts> = {}
  for (const d of filteredDepts) {
    const f = d.fundo || "outros"
    if (!deptsByFundo[f]) deptsByFundo[f] = []
    deptsByFundo[f].push(d)
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#F0F4F8" }}>

      {/* ── LEFT: Department list ── */}
      {deptPanelOpen && (
        <div className="flex flex-col shrink-0 border-r" style={{ width: 260, background: "#fff", borderColor: "#E2E8F0" }}>
          <div className="px-3 py-3 border-b" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold" style={{ color: "#13293D" }}>Departamentos</p>
              <button onClick={() => setDeptPanelOpen(false)} title="Ocultar painel" className="p-0.5 rounded hover:bg-slate-100">
                <PanelLeftClose className="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: "#9CA3AF" }} />
              <input
                value={deptSearch}
                onChange={e => setDeptSearch(e.target.value)}
                placeholder="Buscar departamento..."
                className="w-full pl-6 pr-2 py-1 rounded border outline-none"
                style={{ fontSize: 11, borderColor: "#E2E8F0", color: "#374151" }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto text-xs">
            {FUNDOS.map(fundo => {
              const depts = deptsByFundo[fundo] ?? []
              if (!depts.length) return null
              return (
                <div key={fundo}>
                  <div className="px-3 py-1.5 font-semibold sticky top-0" style={{ fontSize: 10, background: "#F8FAFC", color: "#64748B", borderBottom: "1px solid #F1F5F9" }}>
                    {getFundoLabel(fundo)}
                  </div>
                  {depts.map(d => {
                    const isSelected = selectedDept === d.code
                    const status = deptStatuses[d.code] as DeptStatus | undefined
                    return (
                      <button
                        key={d.code}
                        onClick={() => selectDept(d.code)}
                        className="w-full text-left px-3 py-2 border-b flex items-center gap-1.5"
                        style={{
                          borderColor: "#F8FAFC",
                          background: isSelected ? "#EFF6FF" : "transparent",
                          borderLeft: `3px solid ${isSelected ? "#006494" : "transparent"}`,
                        }}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{
                          background: status ? STATUS_COLOR[status] : "#E2E8F0",
                        }} title={status ? STATUS_LABEL[status] : "Pendente"} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium" style={{ fontSize: 11, color: isSelected ? "#006494" : "#374151" }}>{d.nome}</p>
                          <p style={{ fontSize: 10, color: "#94A3B8" }}>{d.code}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── RIGHT: Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="shrink-0 px-4 py-2.5 flex flex-wrap gap-2 items-center" style={{ background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
          {!deptPanelOpen && (
            <button onClick={() => setDeptPanelOpen(true)} title="Mostrar departamentos" className="p-1 rounded hover:bg-slate-100 shrink-0">
              <PanelLeftOpen className="w-4 h-4" style={{ color: "#64748B" }} />
            </button>
          )}
          <div className="shrink-0 mr-1">
            <p className="text-sm font-bold leading-none" style={{ color: "#13293D" }}>Make a Budget</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
              {dept ? `${dept.nome} · Fundo ${dept.fundo}` : "Selecione um departamento"}
            </p>
          </div>
          {/* Status buttons */}
          {dept && tab === "edicao" && (() => {
            const curStatus = deptStatuses[selectedDept] as DeptStatus | undefined
            return (
              <div className="flex items-center gap-1 shrink-0">
                {(["analisado","revisar","concluido"] as DeptStatus[]).map(s => (
                  <button key={s}
                    onClick={() => setDeptStatus(selectedDept, s === curStatus ? "pendente" : s)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-all"
                    style={{
                      borderColor: curStatus === s ? STATUS_COLOR[s] : "#E2E8F0",
                      background: curStatus === s ? STATUS_COLOR[s] + "20" : "#fff",
                      color: curStatus === s ? STATUS_COLOR[s] : "#94A3B8",
                    }}>
                    <Circle className="w-2 h-2 fill-current" />
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            )
          })()}

          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#E2E8F0" }}>
            {([
              { key: "edicao", icon: List, label: "Edição" },
              { key: "resumo-fundos", icon: BarChart3, label: "Por Fundos" },
              { key: "resumo-operacional", icon: FileText, label: "Operacional" },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium"
                style={{ background: tab === t.key ? "#006494" : "#fff", color: tab === t.key ? "#fff" : "#6B7280" }}>
                <t.icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>

          {tab === "edicao" && (
            <>
              {/* Receitas/Despesas */}
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#E2E8F0" }}>
                <button onClick={() => setViewReceitas(false)}
                  className="px-2.5 py-1.5 text-xs font-semibold"
                  style={{ background: !viewReceitas ? "#DC2626" : "#fff", color: !viewReceitas ? "#fff" : "#6B7280" }}>
                  Despesas
                </button>
                <button onClick={() => setViewReceitas(true)}
                  className="px-2.5 py-1.5 text-xs font-semibold"
                  style={{ background: viewReceitas ? "#059669" : "#fff", color: viewReceitas ? "#fff" : "#6B7280" }}>
                  Receitas
                </button>
              </div>

              {/* Month selector */}
              <div className="flex gap-1 flex-wrap">
                {TODOS_MESES.map(mes => {
                  const available = !!MES_TO_KEY[mes]
                  const sel = selectedMeses.includes(mes)
                  return (
                    <button key={mes} onClick={() => toggleMes(mes)} disabled={!available}
                      style={{
                        padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500,
                        background: sel ? "#006494" : available ? "#F1F5F9" : "#F8FAFC",
                        color: sel ? "#fff" : available ? "#374151" : "#CBD5E1",
                        border: `1px solid ${sel ? "#006494" : "#E2E8F0"}`,
                        cursor: available ? "pointer" : "not-allowed",
                      }}>
                      {mes.slice(0,3)}
                    </button>
                  )
                })}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: "#9CA3AF" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar conta..."
                  className="pl-6 pr-6 py-1 rounded-lg border outline-none"
                  style={{ fontSize: 11, borderColor: "#E2E8F0", color: "#374151", width: 160 }} />
                {search && <button onClick={() => setSearch("")} className="absolute right-1.5 top-1/2 -translate-y-1/2"><X className="w-3 h-3" style={{ color: "#9CA3AF" }} /></button>}
              </div>

              <div className="flex gap-1">
                <button onClick={() => setExpanded(new Set(deptCodes))}
                  className="px-2 py-1 rounded text-xs border" style={{ borderColor: "#E2E8F0", color: "#6B7280" }}>
                  Expandir tudo
                </button>
                <button onClick={() => setExpanded(new Set())}
                  className="px-2 py-1 rounded text-xs border" style={{ borderColor: "#E2E8F0", color: "#6B7280" }}>
                  Recolher tudo
                </button>
              </div>

              {/* Aplicar a todos */}
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs" style={{ color: "#94A3B8" }}>% global:</span>
                <input
                  type="text" value={globalPct}
                  onChange={e => setGlobalPct(e.target.value)}
                  placeholder="ex: 10"
                  className="w-16 text-right px-1.5 py-1 rounded border outline-none text-xs"
                  style={{ borderColor: globalPct ? "#006494" : "#E2E8F0" }}
                />
                <button onClick={applyToAll}
                  className="px-2.5 py-1 rounded text-xs font-semibold text-white"
                  style={{ background: globalPct ? "#006494" : "#CBD5E1" }}
                  disabled={!globalPct}
                  title="Aplica o % a todas as contas folha do departamento">
                  Aplicar a todos
                </button>
                <button onClick={() => setShowAddAccount(true)}
                  className="px-2 py-1 rounded text-xs border font-medium"
                  style={{ borderColor: "#E2E8F0", color: "#6B7280" }}
                  title="Adicionar conta ou sub-conta ao departamento">
                  + Conta
                </button>
              </div>
            </>
          )}

          {/* PDF export for Por Fundos / Operacional */}
          {(tab === "resumo-fundos" || tab === "resumo-operacional") && (
            <button
              onClick={() => {
                const el = document.getElementById("resumo-print-area")
                if (el) exportTabPDF(tab === "resumo-fundos" ? "Resumo por Fundos" : "Resumo Operacional", el.innerHTML)
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ml-auto"
              style={{ background: "#13293D", color: "#fff" }}>
              <Download className="w-3.5 h-3.5" />PDF
            </button>
          )}

          {tab === "edicao" && (
            <button onClick={() => window.print()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "#13293D", color: "#fff" }}>
              <Download className="w-3.5 h-3.5" />PDF
            </button>
          )}
        </div>

        {/* ── KPI bar (edição only) ── */}
        {tab === "edicao" && dept && (
          <div className="shrink-0 flex gap-4 px-4 py-2 items-center" style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
            {[
              { label: "Orç. Anual", v: deptTotals.orcAnual, color: "#13293D" },
              { label: `Orç. ${mesLabel}`, v: deptTotals.orc, color: "#006494" },
              { label: `Real. ${mesLabel}`, v: deptTotals.real, color: "#059669" },
              { label: "Projeção Anual", v: deptTotals.proj, color: "#7C3AED" },
              { label: "% Execução", v: deptTotals.orc > 0 ? deptTotals.real/deptTotals.orc*100 : 0, isPct: true, color: deptTotals.real > deptTotals.orc ? "#DC2626" : "#059669" },
            ].map(k => (
              <div key={k.label} className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: "#94A3B8" }}>{k.label}:</span>
                <span className="text-xs font-bold" style={{ color: k.color }}>
                  {"isPct" in k && k.isPct ? `${k.v.toFixed(1)}%` : fmtK(k.v)}
                </span>
                <span className="text-xs" style={{ color: "#E2E8F0" }}>|</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab content ── */}
        {tab === "edicao" ? (
          dept ? (
            <div className="flex-1 overflow-auto">
              <div style={{ minWidth: 1180 }}>
              {/* Table header — sticky top so it stays visible on vertical scroll */}
              <div className="flex items-center sticky top-0 z-10" style={{ background: "#1E3A8A" }}>
                <div className="shrink-0 px-3 py-2 text-xs font-semibold" style={{ width: 400, color: "#E0F2FE" }}>Conta · Descrição</div>
                {[
                  { label: `Orç. ${mesLabel}`, w: 100 },
                  { label: `Real. ${mesLabel}`, w: 100 },
                  { label: "Orç. Anual", w: 110 },
                  { label: `Projeção (÷${nMeses}×12)`, w: 130 },
                  { label: "% Reajuste", w: 88 },
                  { label: "R$ Reajuste", w: 110 },
                  { label: "Total Próx. Ano", w: 128 },
                ].map(c => (
                  <div key={c.label} className="text-right text-xs font-semibold py-2 px-2 shrink-0" style={{ width: c.w, color: "#BAE6FD" }}>{c.label}</div>
                ))}
              </div>
              {/* Table body */}
              <div>
                  {filteredRoots.map(code => renderRow(code, 0))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm" style={{ color: "#94A3B8" }}>Selecione um departamento na lista ao lado</p>
            </div>
          )
        ) : tab === "resumo-fundos" ? (
          <div id="resumo-print-area" className="flex-1 overflow-auto">
            <ResumoFundos ajustes={ajustes} selectedMeses={selectedMeses} nMeses={nMeses} />
          </div>
        ) : (
          <div id="resumo-print-area" className="flex-1 overflow-auto">
            <ResumoOperacional ajustes={ajustes} selectedMeses={selectedMeses} nMeses={nMeses} />
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
            <h3 className="text-sm font-bold mb-4" style={{ color: "#13293D" }}>Adicionar Conta ao Departamento</h3>
            <p className="text-xs text-slate-500 mb-4">
              Departamento: <strong>{dept?.nome}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Código da conta</label>
                <input value={newAccCode} onChange={e => setNewAccCode(e.target.value)}
                  placeholder="ex: 4115099"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Nome da conta</label>
                <input value={newAccName} onChange={e => setNewAccName(e.target.value)}
                  placeholder="ex: Subsistência Complementar Especial"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
              <p className="text-xs text-slate-400">
                A conta será inserida na hierarquia pelo prefixo do código. Ex: "4115099" será filho de "411500" ou "41150" se existirem.
              </p>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddAccount(false)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={addCustomAccount} disabled={!newAccCode.trim() || !newAccName.trim()}
                className="flex-1 px-3 py-2 text-sm rounded-lg text-white font-medium"
                style={{ background: newAccCode && newAccName ? "#006494" : "#CBD5E1" }}>
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print { header, nav, aside, [data-sidebar] { display:none!important; } body { background:white!important; } }
      `}</style>
    </div>
  )
}

// ── Cell helper ────────────────────────────────────────────────────────────────
function Cell({ children, isTot, color, width = 100 }: { children: React.ReactNode; isTot: boolean; color?: string; width?: number }) {
  return (
    <div className="text-right shrink-0 px-2" style={{ width, fontSize: 11, fontWeight: isTot ? 700 : 400, color: color ?? "#374151" }}>
      {children}
    </div>
  )
}

// ── Resumo por Fundos ─────────────────────────────────────────────────────────
function ResumoFundos({ ajustes, selectedMeses, nMeses }: {
  ajustes: Record<string, Record<string, AjusteData>>
  selectedMeses: string[]
  nMeses: number
}) {
  const fundos = ["10","25","69"]
  const fundoLabel: Record<string, string> = { "10":"Fundo 10", "25":"Fundo 25", "69":"Fundo 69" }

  function getGroupValue(grupoCode: string, fundoFilter: string | null): number {
    let total = 0
    for (const [dCode, d] of Object.entries(BALANCETE_DEPT)) {
      if (fundoFilter && d.fundo !== fundoFilter) continue
      if (!d.contas[grupoCode]) continue
      total += computeGroupTotal(dCode, d, grupoCode, selectedMeses, nMeses, ajustes)
    }
    return total
  }

  const grupos = [
    { key: "receitas", label: "TOTAL DAS RECEITAS", code: "3000000", items: [
      { label: "DÍZIMOS", code: "3111000" },
      { label: "(-)REPASSE DÍZIMOS", code: "3119000", neg: true },
      { label: "A311 (=) DÍZIMOS LÍQUIDOS", code: "3110000", sub: true },
      { label: "A312 OFERTAS LÍQUIDAS", code: "3120000", sub: true },
      { label: "A313 DOAÇÕES", code: "3130000", sub: true },
      { label: "A318A RECEITAS FINANCEIRAS", code: "3181000", sub: true },
      { label: "A318B OUTRAS RECEITAS", code: "3182000", sub: true },
    ]},
    { key: "despesas", label: "TOTAL DAS DESPESAS", code: "4000000", items: [
      { label: "A411 DESPESAS COM PESSOAL", code: "4110000", sub: true },
      { label: "A412 ADMINISTRATIVAS E GERAIS", code: "4120000", sub: true },
      { label: "A414 EDUCAÇÃO E ASSISTÊNCIA", code: "4140000", sub: true },
      { label: "A419 OUTORGAMENTOS", code: "4190000", sub: true },
    ]},
  ]

  return (
    <div className="p-5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-5">
          <h2 className="text-base font-bold" style={{ color: "#13293D" }}>ASSOCIAÇÃO RIO SUL – RELIGIOSA</h2>
          <h3 className="text-sm font-semibold mt-1" style={{ color: "#374151" }}>ORÇAMENTO - TODOS OS FUNDOS</h3>
          <p className="text-xs" style={{ color: "#6B7280" }}>Exercício {new Date().getFullYear() + 1} (baseado nos dados de {selectedMeses.join(", ")})</p>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "#1E3A8A" }}>
                <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "#E0F2FE", width: "35%" }}>Conta</th>
                {fundos.map(f => <th key={f} className="text-right px-3 py-2.5 font-semibold" style={{ color: "#BAE6FD" }}>{fundoLabel[f]}</th>)}
                <th className="text-right px-3 py-2.5 font-semibold" style={{ color: "#FDE68A" }}>TOTAL ANUAL</th>
                <th className="text-right px-4 py-2.5 font-semibold" style={{ color: "#BAE6FD" }}>TOTAL MENSAL</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map(grupo => {
                const totalVal = getGroupValue(grupo.code, null)
                const totalMensal = totalVal / 12
                return (
                  <>
                    <tr key={grupo.key} style={{ background: "#EFF6FF", borderBottom: "2px solid #BFDBFE" }}>
                      <td className="px-4 py-2 font-bold text-xs" style={{ color: "#1E3A8A" }}>{grupo.label}</td>
                      {fundos.map(f => {
                        const v = getGroupValue(grupo.code, f)
                        return <td key={f} className="text-right px-3 py-2 font-bold" style={{ color: "#1E3A8A" }}>{v ? fmtBR(v) : "0,00"}</td>
                      })}
                      <td className="text-right px-3 py-2 font-bold" style={{ color: "#1E3A8A" }}>{totalVal ? fmtBR(totalVal) : "0,00"}</td>
                      <td className="text-right px-4 py-2 font-bold" style={{ color: "#1E3A8A" }}>{totalMensal ? fmtBR(totalMensal) : "0,00"}</td>
                    </tr>
                    {grupo.items.map((item, i) => {
                      const v = getGroupValue(item.code, null)
                      const vm = v / 12
                      return (
                        <tr key={item.code} style={{ background: i%2===0?"#fff":"#FAFAFA", borderBottom: "1px solid #F1F5F9" }}>
                          <td className="px-4 py-1.5 font-medium" style={{ color: item.sub ? "#374151" : "#1E293B", paddingLeft: item.sub ? 24 : 16 }}>
                            {item.label}
                          </td>
                          {fundos.map(f => {
                            const fv = getGroupValue(item.code, f)
                            return <td key={f} className="text-right px-3 py-1.5" style={{ color: "neg" in item && item.neg ? "#DC2626" : "#374151" }}>{fv ? fmtBR(fv) : "0,00"}</td>
                          })}
                          <td className="text-right px-3 py-1.5 font-semibold" style={{ color: "neg" in item && item.neg ? "#DC2626" : "#374151" }}>{v ? fmtBR(v) : "0,00"}</td>
                          <td className="text-right px-4 py-1.5" style={{ color: "#6B7280" }}>{vm ? fmtBR(vm) : "0,00"}</td>
                        </tr>
                      )
                    })}
                  </>
                )
              })}
              {/* Resultado */}
              <tr style={{ background: "#FFFBEB", borderTop: "2px solid #FCD34D" }}>
                <td className="px-4 py-2 font-bold" style={{ color: "#92400E" }}>RESULTADO DO EXERCÍCIO</td>
                {fundos.map(f => {
                  const rec = getGroupValue("3000000", f)
                  const desp = getGroupValue("4000000", f)
                  const res = rec - desp
                  return <td key={f} className="text-right px-3 py-2 font-bold" style={{ color: res >= 0 ? "#059669" : "#DC2626" }}>{fmtBR(res)}</td>
                })}
                {(() => {
                  const rec = getGroupValue("3000000", null)
                  const desp = getGroupValue("4000000", null)
                  const res = rec - desp
                  return <>
                    <td className="text-right px-3 py-2 font-bold" style={{ color: res >= 0 ? "#059669" : "#DC2626" }}>{fmtBR(res)}</td>
                    <td className="text-right px-4 py-2 font-bold" style={{ color: res >= 0 ? "#059669" : "#DC2626" }}>{fmtBR(res/12)}</td>
                  </>
                })()}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Resumo Operacional ────────────────────────────────────────────────────────
function ResumoOperacional({ ajustes, selectedMeses, nMeses }: {
  ajustes: Record<string, Record<string, AjusteData>>
  selectedMeses: string[]
  nMeses: number
}) {
  function getVal(code: string): number {
    let total = 0
    for (const [dCode, d] of Object.entries(BALANCETE_DEPT)) {
      if (!d.contas[code]) continue
      total += computeGroupTotal(dCode, d, code, selectedMeses, nMeses, ajustes)
    }
    return total
  }

  const rec = getVal("3000000")
  const div = getVal("3111000")
  const repasse = getVal("3119000")
  const dizLiq = getVal("3110000")
  const ofertas = getVal("3120000")
  const doacoes = getVal("3130000")
  const recFin = getVal("3181000")
  const outrasRec = getVal("3182000")

  const desp = getVal("4000000")
  const pessoal = getVal("4110000")
  const adm = getVal("4120000")
  const educ = getVal("4140000")
  const outorg = getVal("4190000")

  const subvRec = getVal("3190000")
  const subvRep = getVal("3193000")
  const subvLiq = subvRec - subvRep

  const resultSemSubv = rec - desp
  const resultComSubv = resultSemSubv + subvLiq

  const rows = [
    { label: "TOTAL DAS RECEITAS", val: rec, bold: true, sep: true },
    { label: "  DÍZIMOS", val: div },
    { label: "  (-)REPASSE DÍZIMOS", val: -Math.abs(repasse), color: "#DC2626" },
    { label: "A311 (=) DÍZIMOS LÍQUIDOS DE REPASSES", val: dizLiq, bold: true, sub: true },
    { label: "A312 OFERTAS LÍQUIDAS", val: ofertas, sub: true },
    { label: "A313 DOAÇÕES", val: doacoes, sub: true },
    { label: "A318A RECEITAS FINANCEIRAS", val: recFin, sub: true },
    { label: "A318B OUTRAS RECEITAS RECORRENTES", val: outrasRec, sub: true },
    null,
    { label: "TOTAL DAS DESPESAS", val: desp, bold: true, sep: true },
    { label: "A411 DESPESAS COM PESSOAL", val: pessoal, sub: true },
    { label: "A412 ADMINISTRATIVAS E GERAIS", val: adm, sub: true },
    { label: "A414 EDUCAÇÃO, ASSIST. E ORIENT. SOCIAL", val: educ, sub: true },
    { label: "A419 OUTORGAMENTOS", val: outorg, sub: true },
    null,
    { label: "RESULTADO OPERACIONAL S/ Subv.", val: resultSemSubv, bold: true, color: resultSemSubv >= 0 ? "#059669" : "#DC2626", sep: true },
    null,
    { label: "SUBVENÇÕES RECEBIDAS", val: subvRec },
    { label: "(-)SUBVENÇÕES REPASSADAS", val: -Math.abs(subvRep), color: "#DC2626" },
    { label: "A319 (=) SUBVENÇÕES LÍQUIDAS", val: subvLiq, bold: true, sub: true },
    null,
    { label: "RESULTADO DO EXERCÍCIO", val: resultComSubv, bold: true, color: resultComSubv >= 0 ? "#059669" : "#DC2626", sep: true },
  ]

  const avBase = dizLiq || 1

  return (
    <div className="p-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-5">
          <h2 className="text-base font-bold" style={{ color: "#13293D" }}>ASSOCIAÇÃO RIO SUL</h2>
          <h3 className="text-sm font-semibold mt-0.5" style={{ color: "#374151" }}>ORÇAMENTO OPERACIONAL</h3>
          <p className="text-xs" style={{ color: "#6B7280" }}>Exercício {new Date().getFullYear() + 1}</p>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "#1E3A8A" }}>
                <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "#E0F2FE" }}>Descrição</th>
                <th className="text-right px-4 py-2.5 font-semibold" style={{ color: "#BAE6FD" }}>Valor</th>
                <th className="text-right px-4 py-2.5 font-semibold" style={{ color: "#BAE6FD" }}>% AV</th>
                <th className="text-right px-4 py-2.5 font-semibold" style={{ color: "#FDE68A" }}>IDEAL %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                if (!row) return (
                  <tr key={`sep-${i}`}><td colSpan={4} style={{ padding: "4px 0", background: "#F8FAFC" }} /></tr>
                )
                const av = avBase ? (row.val / avBase * 100) : 0
                const ideal: Record<string, number> = {
                  "TOTAL DAS RECEITAS": 105.50, "A311 (=) DÍZIMOS LÍQUIDOS DE REPASSES": 100,
                  "A312 OFERTAS LÍQUIDAS": 2.50, "A413 DOAÇÕES": 1.50, "A318A RECEITAS FINANCEIRAS": 9.60,
                  "A411 DESPESAS COM PESSOAL": 64, "A412 ADMINISTRATIVAS E GERAIS": 19,
                  "A414 EDUCAÇÃO, ASSIST. E ORIENT. SOCIAL": 9, "A419 OUTORGAMENTOS": 8,
                  "RESULTADO DO EXERCÍCIO": 7,
                }
                const idealVal = ideal[row.label] ?? null
                return (
                  <tr key={i} style={{
                    background: row.sep ? (i < 5 ? "#EFF6FF" : "#FEF3C7") : i%2===0?"#fff":"#FAFAFA",
                    borderBottom: `1px solid ${row.sep ? "#BFDBFE" : "#F1F5F9"}`,
                    borderTop: row.sep ? "1px solid #BFDBFE" : undefined,
                  }}>
                    <td className="px-4 py-1.5" style={{
                      fontWeight: row.bold ? 700 : 400,
                      color: row.color ?? "#374151",
                      paddingLeft: row.sub ? 28 : 16,
                    }}>
                      {row.label}
                    </td>
                    <td className="text-right px-4 py-1.5" style={{ fontWeight: row.bold ? 700 : 400, color: row.color ?? "#374151" }}>
                      {fmtBR(row.val)}
                    </td>
                    <td className="text-right px-4 py-1.5" style={{ color: "#6B7280" }}>
                      {row.bold ? <span style={{ fontWeight: 700, textDecoration: "underline" }}>{av.toFixed(2)}</span> : av.toFixed(2)}
                    </td>
                    <td className="text-right px-4 py-1.5" style={{ color: "#6B7280" }}>
                      {idealVal !== null ? idealVal.toFixed(2) : ""}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
