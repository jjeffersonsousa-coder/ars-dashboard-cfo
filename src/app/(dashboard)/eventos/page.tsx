"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft, Plus, Trash2, Printer, CalendarRange,
  MapPin, Users, TrendingUp, TrendingDown, CheckCircle2,
  Clock, AlertCircle, Circle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = "Concluído" | "Em andamento" | "Pendente" | "Atrasado"

interface ReceitaRow    { id: string; categoria: string; descricao: string; valorUnitario: number; quantidade: number }
interface AlimRow       { id: string; item: string; descricao: string; custoPorPessoa: number; qtdPessoas: number; qtdDias: number }
interface EstruturaRow  { id: string; item: string; descricao: string; valorUnitario: number; quantidade: number; dias: number }
interface PalRow        { id: string; nome: string; tema: string; cache: number; passagens: number; hospedagem: number }
interface CantorRow     { id: string; nome: string; tipo: string; cache: number; passagens: number; rider: number }
interface OpRow         { id: string; item: string; descricao: string; valorUnitario: number; quantidade: number }
interface CronoRow      { id: string; tarefa: string; responsavel: string; dataInicio: string; dataFim: string; status: Status; observacoes: string }
interface RastrRow      { id: string; responsavel: string; tarefa: string; cronograma: string; dataInicio: string; dataFim: string; status: Status }
interface NotaRow       { id: string; responsavel: string; item: string; observacao: string; status: Status }

interface EventoData {
  nome: string; dataEvento: string; local: string; participantes: number
  receitas: ReceitaRow[]
  alimentacao: AlimRow[]
  estrutura: EstruturaRow[]
  palestrantes: PalRow[]
  cantores: CantorRow[]
  operacionais: OpRow[]
  cronogramaPreEvento: CronoRow[]
  cronogramaDiaEvento: CronoRow[]
  cronogramaPosEvento: CronoRow[]
  rastreamento: RastrRow[]
  notas: NotaRow[]
}

interface EventoMeta { id: string; nome: string; dataEvento: string; local: string; participantes: number; status: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9)
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const num = (v: unknown) => Number(v) || 0

const STATUS_COLORS: Record<Status, string> = {
  "Concluído":    "bg-emerald-100 text-emerald-700",
  "Em andamento": "bg-blue-100 text-blue-700",
  "Pendente":     "bg-yellow-100 text-yellow-700",
  "Atrasado":     "bg-red-100 text-red-700",
}
const STATUS_ICON: Record<Status, React.ReactNode> = {
  "Concluído":    <CheckCircle2 className="w-3.5 h-3.5" />,
  "Em andamento": <Clock className="w-3.5 h-3.5" />,
  "Pendente":     <Circle className="w-3.5 h-3.5" />,
  "Atrasado":     <AlertCircle className="w-3.5 h-3.5" />,
}
const STATUS_OPTS: Status[] = ["Pendente", "Em andamento", "Concluído", "Atrasado"]

// ─── Default data ─────────────────────────────────────────────────────────────
function defaultEvento(): EventoData {
  return {
    nome: "", dataEvento: "", local: "", participantes: 0,
    receitas: [
      { id: uid(), categoria: "Inscrições",      descricao: "Venda de ingressos participantes",       valorUnitario: 0, quantidade: 0 },
      { id: uid(), categoria: "Doações",          descricao: "Doações recebidas",                      valorUnitario: 0, quantidade: 0 },
      { id: uid(), categoria: "Patrocínios",      descricao: "Patrocinadores (Gold, Silver, Bronze)",  valorUnitario: 0, quantidade: 0 },
      { id: uid(), categoria: "Estandes/Stands",  descricao: "Venda de espaços comerciais",            valorUnitario: 0, quantidade: 0 },
      { id: uid(), categoria: "Taxa",             descricao: "Taxa sobre vendas (%)",                  valorUnitario: 0, quantidade: 0 },
      { id: uid(), categoria: "Outras Receitas",  descricao: "Receitas diversas",                      valorUnitario: 0, quantidade: 0 },
    ],
    alimentacao: [
      { id: uid(), item: "Café da Manhã", descricao: "Coffee break matinal",    custoPorPessoa: 0, qtdPessoas: 0, qtdDias: 0 },
      { id: uid(), item: "Almoço",        descricao: "Buffet/marmita",          custoPorPessoa: 0, qtdPessoas: 0, qtdDias: 0 },
      { id: uid(), item: "Jantar",        descricao: "Jantar",                  custoPorPessoa: 0, qtdPessoas: 0, qtdDias: 0 },
      { id: uid(), item: "Coffee Break",  descricao: "Intervalo (manhã/tarde)", custoPorPessoa: 0, qtdPessoas: 0, qtdDias: 0 },
      { id: uid(), item: "Coquetel",      descricao: "Encerramento/networking", custoPorPessoa: 0, qtdPessoas: 0, qtdDias: 0 },
      { id: uid(), item: "Água/Bebidas",  descricao: "Hidratação geral",        custoPorPessoa: 0, qtdPessoas: 0, qtdDias: 0 },
      { id: uid(), item: "Outros",        descricao: "Alimentação extra",       custoPorPessoa: 0, qtdPessoas: 0, qtdDias: 0 },
    ],
    estrutura: [
      { id: uid(), item: "Locação de Espaço",     descricao: "Auditório/salão",          valorUnitario: 0, quantidade: 1, dias: 1 },
      { id: uid(), item: "Telão/Projetor",         descricao: "Equipamento audiovisual",  valorUnitario: 0, quantidade: 1, dias: 1 },
      { id: uid(), item: "Som e Microfones",       descricao: "Sistema de áudio",         valorUnitario: 0, quantidade: 1, dias: 1 },
      { id: uid(), item: "Iluminação",             descricao: "Iluminação cênica",        valorUnitario: 0, quantidade: 1, dias: 1 },
      { id: uid(), item: "Infláveis",              descricao: "Crianças e Adultos",       valorUnitario: 0, quantidade: 1, dias: 1 },
      { id: uid(), item: "Cadeiras/Mesas",         descricao: "Mobiliário",               valorUnitario: 0, quantidade: 0, dias: 0 },
      { id: uid(), item: "Decoração",              descricao: "Flores, painéis",          valorUnitario: 0, quantidade: 1, dias: 1 },
      { id: uid(), item: "Gerador",                descricao: "Energia backup",           valorUnitario: 0, quantidade: 1, dias: 1 },
      { id: uid(), item: "Banheiros Químicos",     descricao: "Se necessário",            valorUnitario: 0, quantidade: 0, dias: 0 },
      { id: uid(), item: "Tendas/Coberturas",      descricao: "Área externa",             valorUnitario: 0, quantidade: 0, dias: 0 },
      { id: uid(), item: "Outros",                 descricao: "Estrutura extra",          valorUnitario: 0, quantidade: 0, dias: 0 },
    ],
    palestrantes: [
      { id: uid(), nome: "", tema: "", cache: 0, passagens: 0, hospedagem: 0 },
      { id: uid(), nome: "", tema: "", cache: 0, passagens: 0, hospedagem: 0 },
    ],
    cantores: [
      { id: uid(), nome: "", tipo: "", cache: 0, passagens: 0, rider: 0 },
      { id: uid(), nome: "", tipo: "", cache: 0, passagens: 0, rider: 0 },
    ],
    operacionais: [
      { id: uid(), item: "Dinâmica",                    descricao: "Ecobags, canetas, etc", valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Crachás",                     descricao: "Identificação",         valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Impressos",                   descricao: "Programação, folders",  valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Marketing",                   descricao: "Anúncios, redes sociais", valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Equipe/Staff",                descricao: "Recepção, apoio",       valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Segurança",                   descricao: "Seguranças",            valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Limpeza",                     descricao: "Equipe de limpeza",     valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Seguros",                     descricao: "Seguro do evento",      valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Ambulância/Primeiros Socorros", descricao: "Equipe médica",       valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Transporte",                  descricao: "Transfer/fretado",      valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Certificados",                descricao: "Impressão certificados", valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Taxas/Alvarás",               descricao: "Taxas municipais",      valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Internet/Wi-Fi",              descricao: "Conexão",               valorUnitario: 0, quantidade: 0 },
      { id: uid(), item: "Outros",                      descricao: "Despesas diversas",     valorUnitario: 0, quantidade: 0 },
    ],
    cronogramaPreEvento: [
      { id: uid(), tarefa: "Definir data e local",      responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Contratar palestrantes",    responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Abrir inscrições",          responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Contratar estrutura",       responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Fechar cardápio",           responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Material gráfico",          responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Divulgação",                responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
    ],
    cronogramaDiaEvento: [
      { id: uid(), tarefa: "06:00 - Chegada equipe montagem",   responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "07:00 - Montagem estrutura",        responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "08:00 - Teste de som e imagem",     responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "09:00 - Abertura credenciamento",   responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "09:30 - Início evento - Abertura",  responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "10:00 - Palestra 1",                responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "12:00 - Almoço",                    responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "19:30 - Encerramento",              responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
    ],
    cronogramaPosEvento: [
      { id: uid(), tarefa: "Pesquisa de satisfação",         responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Emissão de certificados",        responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Relatório financeiro",           responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Relatório de resultados",        responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Agradecimentos participantes",   responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Post-mortem",                    responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
      { id: uid(), tarefa: "Arquivo de documentos",          responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" },
    ],
    rastreamento: [],
    notas: [{ id: uid(), responsavel: "", item: "", observacao: "", status: "Pendente" }],
  }
}

const MOCK_LIST: EventoMeta[] = [
  { id: "evt1", nome: "Retiro ARS | 2026", dataEvento: "13 a 17 de Fevereiro de 2026", local: "CATRE - Satulina", participantes: 105, status: "Em andamento" },
]

// ─── Input helpers ────────────────────────────────────────────────────────────
function TI({ value, onChange, className = "" }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full px-2 py-1 text-sm border border-slate-200 rounded focus:border-blue-400 focus:outline-none transition-colors bg-white ${className}`}
    />
  )
}
function NI({ value, onChange, className = "" }: { value: number; onChange: (v: number) => void; className?: string }) {
  return (
    <input
      type="number"
      min={0}
      value={value || ""}
      onChange={e => onChange(Number(e.target.value) || 0)}
      className={`w-full px-2 py-1 text-sm border border-slate-200 rounded focus:border-blue-400 focus:outline-none transition-colors bg-white text-right ${className}`}
    />
  )
}
function SI({ value, onChange }: { value: Status; onChange: (v: Status) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as Status)}
      className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:border-blue-400 focus:outline-none bg-white"
    >
      {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  )
}

// ─── PDF Export ───────────────────────────────────────────────────────────────
function exportPDF(data: EventoData) {
  const totalReceitas = data.receitas.reduce((s, r) => s + num(r.valorUnitario) * num(r.quantidade), 0)
  const totalAlim = data.alimentacao.reduce((s, r) => s + num(r.custoPorPessoa) * num(r.qtdPessoas) * num(r.qtdDias), 0)
  const totalEstr = data.estrutura.reduce((s, r) => s + num(r.valorUnitario) * num(r.quantidade) * num(r.dias), 0)
  const totalPal = data.palestrantes.reduce((s, r) => s + num(r.cache) + num(r.passagens) + num(r.hospedagem), 0)
  const totalCant = data.cantores.reduce((s, r) => s + num(r.cache) + num(r.passagens) + num(r.rider), 0)
  const totalOp = data.operacionais.reduce((s, r) => s + num(r.valorUnitario) * num(r.quantidade), 0)
  const totalDespesas = totalAlim + totalEstr + totalPal + totalCant + totalOp
  const resultado = totalReceitas - totalDespesas
  const allTarefas = [...data.cronogramaPreEvento, ...data.cronogramaDiaEvento, ...data.cronogramaPosEvento]

  const fmtBR = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const row = (cols: string[], bold = false) =>
    `<tr>${cols.map(c => `<td style="padding:4px 8px;border:1px solid #e2e8f0;font-size:12px;${bold ? "font-weight:600;background:#f8fafc;" : ""}">${c}</td>`).join("")}</tr>`

  const tableHead = (cols: string[]) =>
    `<tr>${cols.map(c => `<th style="padding:5px 8px;background:#006494;color:white;font-size:11px;text-align:left;border:1px solid #006494;">${c}</th>`).join("")}</tr>`

  const logoBase64 = typeof window !== "undefined" ? localStorage.getItem("ars_logo_base64") || "" : ""
  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" style="height:52px;object-fit:contain;" />`
    : `<div style="width:52px;height:52px;background:linear-gradient(135deg,#1B98E0,#006494);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:bold;">AR</div>`

  const section = (title: string, content: string) => `
    <div style="page-break-before:always;padding:32px 40px;font-family:'Segoe UI',sans-serif;">
      <div style="margin-bottom:20px;padding-bottom:12px;border-bottom:3px solid #006494;display:flex;align-items:center;gap:16px;">
        ${logoHtml}
        <div style="flex:1;">
          <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Associação Rio Sul da IASD — Gestão de Eventos</div>
          <h2 style="margin:3px 0 0;font-size:20px;font-weight:800;color:#13293D;">${data.nome || "Evento"}</h2>
          <div style="font-size:12px;color:#006494;font-weight:600;margin-top:2px;">${title}${data.dataEvento ? " · " + data.dataEvento : ""}${data.local ? " · " + data.local : ""}</div>
        </div>
        <div style="text-align:right;font-size:10px;color:#94a3b8;">
          <div>Gerado em</div>
          <div style="font-weight:600;color:#374151;">${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>
        </div>
      </div>
      ${content}
    </div>`

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${data.nome || "Evento"} — Relatório</title>
  <style>* { box-sizing: border-box; margin: 0; } body { color: #1e293b; } @media print { @page { margin: 0.5cm; } }</style>
  </head><body>

  ${section("Dashboard", `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;">
        <div style="font-size:11px;color:#64748b;margin-bottom:2px;">Nome do Evento</div>
        <div style="font-size:16px;font-weight:700;">${data.nome || "—"}</div>
      </div>
      <div style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;">
        <div style="font-size:11px;color:#64748b;margin-bottom:2px;">Data</div>
        <div style="font-size:16px;font-weight:700;">${data.dataEvento || "—"}</div>
      </div>
      <div style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;">
        <div style="font-size:11px;color:#64748b;margin-bottom:2px;">Local</div>
        <div style="font-size:16px;font-weight:700;">${data.local || "—"}</div>
      </div>
      <div style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;">
        <div style="font-size:11px;color:#64748b;margin-bottom:2px;">Participantes</div>
        <div style="font-size:16px;font-weight:700;">${data.participantes}</div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Categoria","Valor"])}
      ${row(["Total de Receitas", fmtBR(totalReceitas)])}
      ${row(["Total de Despesas", fmtBR(totalDespesas)])}
      ${row(["Resultado (Lucro/Prejuízo)", fmtBR(resultado)], true)}
      ${row(["Margem", totalReceitas > 0 ? ((resultado/totalReceitas)*100).toFixed(1)+"%" : "—"])}
    </table>
    <div style="margin-top:16px;">
      <table style="width:100%;border-collapse:collapse;">
        ${tableHead(["Resumo de Tarefas","Qtd"])}
        ${row(["Total de Tarefas", String(allTarefas.length)])}
        ${row(["Concluídas", String(allTarefas.filter(t=>t.status==="Concluído").length)])}
        ${row(["Em Andamento", String(allTarefas.filter(t=>t.status==="Em andamento").length)])}
        ${row(["Pendentes", String(allTarefas.filter(t=>t.status==="Pendente").length)])}
        ${row(["Atrasadas", String(allTarefas.filter(t=>t.status==="Atrasado").length)])}
      </table>
    </div>
  `)}

  ${section("Receitas", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Categoria","Descrição","Vlr Unit.","Quantidade","TOTAL"])}
      ${data.receitas.map(r => row([r.categoria, r.descricao, fmtBR(r.valorUnitario), String(r.quantidade), fmtBR(num(r.valorUnitario)*num(r.quantidade))])).join("")}
      ${row(["<strong>TOTAL DE RECEITAS</strong>","","","",`<strong>${fmtBR(totalReceitas)}</strong>`], true)}
    </table>
  `)}

  ${section("Despesas — Alimentação", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Item","Descrição","Custo/Pessoa","Qtd Pessoas","Qtd Dias","TOTAL"])}
      ${data.alimentacao.map(r => row([r.item, r.descricao, fmtBR(r.custoPorPessoa), String(r.qtdPessoas), String(r.qtdDias), fmtBR(num(r.custoPorPessoa)*num(r.qtdPessoas)*num(r.qtdDias))])).join("")}
      ${row(["<strong>SUBTOTAL ALIMENTAÇÃO</strong>","","","","",`<strong>${fmtBR(totalAlim)}</strong>`], true)}
    </table>
  `)}

  ${section("Despesas — Estrutura", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Item","Descrição","Vlr Unit.","Quantidade","Dias","TOTAL"])}
      ${data.estrutura.map(r => row([r.item, r.descricao, fmtBR(r.valorUnitario), String(r.quantidade), String(r.dias), fmtBR(num(r.valorUnitario)*num(r.quantidade)*num(r.dias))])).join("")}
      ${row(["<strong>SUBTOTAL ESTRUTURA</strong>","","","","",`<strong>${fmtBR(totalEstr)}</strong>`], true)}
    </table>
  `)}

  ${section("Despesas — Palestrantes", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Nome","Tema","Cachê","Passagens","Hospedagem","TOTAL"])}
      ${data.palestrantes.filter(r=>r.nome).map(r => row([r.nome, r.tema, fmtBR(r.cache), fmtBR(r.passagens), fmtBR(r.hospedagem), fmtBR(num(r.cache)+num(r.passagens)+num(r.hospedagem))])).join("")}
      ${row(["<strong>SUBTOTAL PALESTRANTES</strong>","","","","",`<strong>${fmtBR(totalPal)}</strong>`], true)}
    </table>
  `)}

  ${section("Despesas — Cantores / Artistas", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Nome","Tipo","Cachê","Passagens","Rider Técnico","TOTAL"])}
      ${data.cantores.filter(r=>r.nome).map(r => row([r.nome, r.tipo, fmtBR(r.cache), fmtBR(r.passagens), fmtBR(r.rider), fmtBR(num(r.cache)+num(r.passagens)+num(r.rider))])).join("")}
      ${row(["<strong>SUBTOTAL CANTORES</strong>","","","","",`<strong>${fmtBR(totalCant)}</strong>`], true)}
    </table>
  `)}

  ${section("Despesas — Operacionais", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Item","Descrição","Vlr Unit.","Quantidade","TOTAL"])}
      ${data.operacionais.map(r => row([r.item, r.descricao, fmtBR(r.valorUnitario), String(r.quantidade), fmtBR(num(r.valorUnitario)*num(r.quantidade))])).join("")}
      ${row(["<strong>SUBTOTAL OPERACIONAIS</strong>","","","",`<strong>${fmtBR(totalOp)}</strong>`], true)}
    </table>
  `)}

  ${section("Resumo de Despesas", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Categoria","Total"])}
      ${row(["Alimentação", fmtBR(totalAlim)])}
      ${row(["Estrutura", fmtBR(totalEstr)])}
      ${row(["Palestrantes", fmtBR(totalPal)])}
      ${row(["Cantores / Artistas", fmtBR(totalCant)])}
      ${row(["Operacionais", fmtBR(totalOp)])}
      ${row(["<strong>TOTAL GERAL</strong>", `<strong>${fmtBR(totalDespesas)}</strong>`], true)}
    </table>
  `)}

  ${section("Cronograma — Pré-Evento", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Tarefa","Responsável","Início","Fim","Status","Observações"])}
      ${data.cronogramaPreEvento.map(r => row([r.tarefa, r.responsavel, r.dataInicio, r.dataFim, r.status, r.observacoes])).join("")}
    </table>
  `)}

  ${section("Cronograma — Dia do Evento", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Tarefa","Responsável","Início","Fim","Status","Observações"])}
      ${data.cronogramaDiaEvento.map(r => row([r.tarefa, r.responsavel, r.dataInicio, r.dataFim, r.status, r.observacoes])).join("")}
    </table>
  `)}

  ${section("Cronograma — Pós-Evento", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Tarefa","Responsável","Início","Fim","Status","Observações"])}
      ${data.cronogramaPosEvento.map(r => row([r.tarefa, r.responsavel, r.dataInicio, r.dataFim, r.status, r.observacoes])).join("")}
    </table>
  `)}

  ${section("Rastreamento por Responsável", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Responsável","Tarefa","Cronograma","Início","Fim","Status"])}
      ${data.rastreamento.map(r => row([r.responsavel, r.tarefa, r.cronograma, r.dataInicio, r.dataFim, r.status])).join("")}
    </table>
  `)}

  ${section("Notas", `
    <table style="width:100%;border-collapse:collapse;">
      ${tableHead(["Responsável","Item","Observação","Status"])}
      ${data.notas.map(r => row([r.responsavel, r.item, r.observacao, r.status])).join("")}
    </table>
  `)}

  </body></html>`

  const w = window.open("", "_blank")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.onload = () => w.print()
}

// ─── Tab label helper ─────────────────────────────────────────────────────────
type Tab = "dashboard"|"receitas"|"alimentacao"|"estrutura"|"palestrantes"|"cantores"|"operacional"|"cronograma"|"rastreamento"|"notas"
type CronoSub = "pre"|"dia"|"pos"

// ─── Main component ───────────────────────────────────────────────────────────
export default function EventosPage() {
  const [eventoId, setEventoId] = useState<string | null>(null)
  const [data, setData] = useState<EventoData>(defaultEvento)
  const [tab, setTab] = useState<Tab>("dashboard")
  const [cronoSub, setCronoSub] = useState<CronoSub>("pre")
  const [saveState, setSaveState] = useState<"idle"|"saving"|"saved">("idle")
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Load from localStorage when entering an event
  useEffect(() => {
    if (!eventoId) return
    try {
      const stored = localStorage.getItem(`evento_${eventoId}`)
      if (stored) setData(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [eventoId])

  // Auto-save
  useEffect(() => {
    if (!eventoId) return
    setSaveState("saving")
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(`evento_${eventoId}`, JSON.stringify(data))
      setSaveState("saved")
    }, 900)
    return () => clearTimeout(saveTimer.current)
  }, [data, eventoId])

  // ── Update helpers ──
  function upd<K extends keyof EventoData>(key: K, val: EventoData[K]) {
    setData(d => ({ ...d, [key]: val }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function updRow(key: keyof EventoData, id: string, patch: Record<string, any>) {
    setData(d => ({
      ...d,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key]: (d[key] as any[]).map((r: any) => r.id === id ? { ...r, ...patch } : r),
    }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addRow(key: keyof EventoData, blank: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData(d => ({ ...d, [key]: [...(d[key] as any[]), { id: uid(), ...blank }] }))
  }

  function delRow(key: keyof EventoData, id: string) {
    setData(d => ({ ...d, [key]: (d[key] as { id: string }[]).filter(r => r.id !== id) }))
  }

  // ── Computed totals ──
  const totReceitas  = data.receitas.reduce((s, r) => s + num(r.valorUnitario) * num(r.quantidade), 0)
  const totAlim      = data.alimentacao.reduce((s, r) => s + num(r.custoPorPessoa) * num(r.qtdPessoas) * num(r.qtdDias), 0)
  const totEstr      = data.estrutura.reduce((s, r) => s + num(r.valorUnitario) * num(r.quantidade) * num(r.dias), 0)
  const totPal       = data.palestrantes.reduce((s, r) => s + num(r.cache) + num(r.passagens) + num(r.hospedagem), 0)
  const totCant      = data.cantores.reduce((s, r) => s + num(r.cache) + num(r.passagens) + num(r.rider), 0)
  const totOp        = data.operacionais.reduce((s, r) => s + num(r.valorUnitario) * num(r.quantidade), 0)
  const totDespesas  = totAlim + totEstr + totPal + totCant + totOp
  const resultado    = totReceitas - totDespesas
  const allTarefas   = [...data.cronogramaPreEvento, ...data.cronogramaDiaEvento, ...data.cronogramaPosEvento]

  // ─── LIST VIEW ───────────────────────────────────────────────────────────────
  if (!eventoId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Eventos</h2>
            <p className="text-slate-500 mt-1">Planejamento e controle de eventos da ARS</p>
          </div>
          <Button
            className="gap-2" style={{ backgroundColor: "#006494" }}
            onClick={() => {
              const id = uid()
              MOCK_LIST.push({ id, nome: "Novo Evento", dataEvento: "", local: "", participantes: 0, status: "Planejamento" })
              setData(defaultEvento())
              setEventoId(id)
              setTab("dashboard")
            }}
          >
            <Plus className="w-4 h-4" /> Novo Evento
          </Button>
        </div>

        <div className="grid gap-4">
          {MOCK_LIST.map(ev => (
            <Card key={ev.id} className="cursor-pointer card-hover-glow" onClick={() => { setEventoId(ev.id); setTab("dashboard") }}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1B98E0, #006494)" }}>
                      <CalendarRange className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base">{ev.nome}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.local || "—"}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ev.participantes} participantes</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[ev.status as Status] || "bg-slate-100 text-slate-600"}`}>
                      {ev.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{ev.dataEvento || "Data a definir"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ─── DETAIL VIEW ─────────────────────────────────────────────────────────────
  const TABS: { key: Tab; label: string }[] = [
    { key: "dashboard",   label: "Dashboard" },
    { key: "receitas",    label: "Receitas" },
    { key: "alimentacao", label: "Alimentação" },
    { key: "estrutura",   label: "Estrutura" },
    { key: "palestrantes",label: "Palestrantes" },
    { key: "cantores",    label: "Cantores" },
    { key: "operacional", label: "Operacional" },
    { key: "cronograma",  label: "Cronograma" },
    { key: "rastreamento",label: "Rastreamento" },
    { key: "notas",       label: "Notas" },
  ]

  const thCls = "text-left py-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b"
  const tdCls = "py-1.5 px-2 border-b border-slate-50"
  const totalCellCls = "text-right font-bold text-blue-700"

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setEventoId(null)} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Eventos
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{data.nome || "Novo Evento"}</h2>
            <p className="text-xs text-slate-400">
              {saveState === "saving" ? "Salvando..." : saveState === "saved" ? "✓ Salvo automaticamente" : ""}
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-2" style={{ backgroundColor: "#006494" }} onClick={() => exportPDF(data)}>
          <Printer className="w-4 h-4" /> Exportar PDF
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 flex-wrap border-b border-slate-200">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === "dashboard" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Informações do Evento</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Nome do Evento</label>
                <TI value={data.nome} onChange={v => upd("nome", v)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Data do Evento</label>
                <TI value={data.dataEvento} onChange={v => upd("dataEvento", v)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Local</label>
                <TI value={data.local} onChange={v => upd("local", v)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Nº de Participantes</label>
                <NI value={data.participantes} onChange={v => upd("participantes", v)} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="card-hover-glow">
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm font-semibold text-slate-600">Resumo Financeiro</p>
                {[
                  { label: "Total Receitas",  val: totReceitas,  cls: "text-emerald-700" },
                  { label: "Total Despesas",  val: totDespesas,  cls: "text-red-600" },
                  { label: "Resultado",        val: resultado,    cls: resultado >= 0 ? "text-emerald-700" : "text-red-600" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">{row.label}</span>
                    <span className={`text-lg font-bold valor-glow ${row.cls}`}>{fmt(row.val)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-slate-500">Margem</span>
                  <span className="text-sm font-semibold">{totReceitas > 0 ? ((resultado / totReceitas) * 100).toFixed(1) + "%" : "—"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover-glow">
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm font-semibold text-slate-600">Resumo de Tarefas</p>
                {[
                  { label: "Total", count: allTarefas.length, cls: "text-slate-700" },
                  { label: "Concluídas", count: allTarefas.filter(t => t.status === "Concluído").length, cls: "text-emerald-700" },
                  { label: "Em andamento", count: allTarefas.filter(t => t.status === "Em andamento").length, cls: "text-blue-600" },
                  { label: "Pendentes", count: allTarefas.filter(t => t.status === "Pendente").length, cls: "text-yellow-600" },
                  { label: "Atrasadas", count: allTarefas.filter(t => t.status === "Atrasado").length, cls: "text-red-600" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">{r.label}</span>
                    <span className={`text-lg font-bold valor-glow ${r.cls}`}>{r.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-4">
              <p className="text-sm font-semibold text-slate-600 mb-3">Despesas por Categoria</p>
              {[
                { label: "Alimentação",   val: totAlim },
                { label: "Estrutura",     val: totEstr },
                { label: "Palestrantes",  val: totPal },
                { label: "Cantores",      val: totCant },
                { label: "Operacionais",  val: totOp },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-slate-500 w-28 shrink-0">{r.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: totDespesas > 0 ? `${(r.val / totDespesas) * 100}%` : "0%",
                      backgroundColor: "#006494"
                    }} />
                  </div>
                  <span className="text-sm font-medium w-28 text-right">{fmt(r.val)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── RECEITAS ── */}
      {tab === "receitas" && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Receitas do Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className={thCls}>Categoria</th>
                  <th className={thCls}>Descrição</th>
                  <th className={`${thCls} text-right`}>Vlr Unit.</th>
                  <th className={`${thCls} text-right`}>Quantidade</th>
                  <th className={`${thCls} text-right`}>TOTAL</th>
                  <th className={thCls} />
                </tr>
              </thead>
              <tbody>
                {data.receitas.map(r => {
                  const total = num(r.valorUnitario) * num(r.quantidade)
                  return (
                    <tr key={r.id}>
                      <td className={tdCls}><TI value={r.categoria} onChange={v => updRow("receitas", r.id, { categoria: v })} /></td>
                      <td className={tdCls}><TI value={r.descricao} onChange={v => updRow("receitas", r.id, { descricao: v })} /></td>
                      <td className={tdCls}><NI value={r.valorUnitario} onChange={v => updRow("receitas", r.id, { valorUnitario: v })} /></td>
                      <td className={tdCls}><NI value={r.quantidade} onChange={v => updRow("receitas", r.id, { quantidade: v })} /></td>
                      <td className={`${tdCls} ${totalCellCls}`}>{fmt(total)}</td>
                      <td className={tdCls}><button onClick={() => delRow("receitas", r.id)}><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" /></button></td>
                    </tr>
                  )
                })}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="py-2 px-2 text-sm text-slate-700">TOTAL DE RECEITAS</td>
                  <td className={`py-2 px-2 text-right font-bold ${totReceitas > 0 ? "text-emerald-700" : "text-slate-700"}`}>{fmt(totReceitas)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
            <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => addRow("receitas", { categoria: "", descricao: "", valorUnitario: 0, quantidade: 0 })}>
              <Plus className="w-3.5 h-3.5" /> Adicionar linha
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── ALIMENTAÇÃO ── */}
      {tab === "alimentacao" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Despesas — Alimentação</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr>
                <th className={thCls}>Item</th>
                <th className={thCls}>Descrição</th>
                <th className={`${thCls} text-right`}>Custo/Pessoa</th>
                <th className={`${thCls} text-right`}>Qtd Pessoas</th>
                <th className={`${thCls} text-right`}>Qtd Dias</th>
                <th className={`${thCls} text-right`}>TOTAL</th>
                <th className={thCls} />
              </tr></thead>
              <tbody>
                {data.alimentacao.map(r => {
                  const total = num(r.custoPorPessoa) * num(r.qtdPessoas) * num(r.qtdDias)
                  return (
                    <tr key={r.id}>
                      <td className={tdCls}><TI value={r.item} onChange={v => updRow("alimentacao", r.id, { item: v })} /></td>
                      <td className={tdCls}><TI value={r.descricao} onChange={v => updRow("alimentacao", r.id, { descricao: v })} /></td>
                      <td className={tdCls}><NI value={r.custoPorPessoa} onChange={v => updRow("alimentacao", r.id, { custoPorPessoa: v })} /></td>
                      <td className={tdCls}><NI value={r.qtdPessoas} onChange={v => updRow("alimentacao", r.id, { qtdPessoas: v })} /></td>
                      <td className={tdCls}><NI value={r.qtdDias} onChange={v => updRow("alimentacao", r.id, { qtdDias: v })} /></td>
                      <td className={`${tdCls} ${totalCellCls}`}>{fmt(total)}</td>
                      <td className={tdCls}><button onClick={() => delRow("alimentacao", r.id)}><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" /></button></td>
                    </tr>
                  )
                })}
                <tr className="bg-slate-50"><td colSpan={5} className="py-2 px-2 font-bold text-sm">SUBTOTAL ALIMENTAÇÃO</td><td className="py-2 px-2 text-right font-bold text-blue-700">{fmt(totAlim)}</td><td /></tr>
              </tbody>
            </table>
            <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => addRow("alimentacao", { item: "", descricao: "", custoPorPessoa: 0, qtdPessoas: 0, qtdDias: 0 })}>
              <Plus className="w-3.5 h-3.5" /> Adicionar linha
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── ESTRUTURA ── */}
      {tab === "estrutura" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Despesas — Estrutura</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr>
                <th className={thCls}>Item</th>
                <th className={thCls}>Descrição</th>
                <th className={`${thCls} text-right`}>Vlr Unit.</th>
                <th className={`${thCls} text-right`}>Qtd</th>
                <th className={`${thCls} text-right`}>Dias</th>
                <th className={`${thCls} text-right`}>TOTAL</th>
                <th className={thCls} />
              </tr></thead>
              <tbody>
                {data.estrutura.map(r => {
                  const total = num(r.valorUnitario) * num(r.quantidade) * num(r.dias)
                  return (
                    <tr key={r.id}>
                      <td className={tdCls}><TI value={r.item} onChange={v => updRow("estrutura", r.id, { item: v })} /></td>
                      <td className={tdCls}><TI value={r.descricao} onChange={v => updRow("estrutura", r.id, { descricao: v })} /></td>
                      <td className={tdCls}><NI value={r.valorUnitario} onChange={v => updRow("estrutura", r.id, { valorUnitario: v })} /></td>
                      <td className={tdCls}><NI value={r.quantidade} onChange={v => updRow("estrutura", r.id, { quantidade: v })} /></td>
                      <td className={tdCls}><NI value={r.dias} onChange={v => updRow("estrutura", r.id, { dias: v })} /></td>
                      <td className={`${tdCls} ${totalCellCls}`}>{fmt(total)}</td>
                      <td className={tdCls}><button onClick={() => delRow("estrutura", r.id)}><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" /></button></td>
                    </tr>
                  )
                })}
                <tr className="bg-slate-50"><td colSpan={5} className="py-2 px-2 font-bold text-sm">SUBTOTAL ESTRUTURA</td><td className="py-2 px-2 text-right font-bold text-blue-700">{fmt(totEstr)}</td><td /></tr>
              </tbody>
            </table>
            <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => addRow("estrutura", { item: "", descricao: "", valorUnitario: 0, quantidade: 1, dias: 1 })}>
              <Plus className="w-3.5 h-3.5" /> Adicionar linha
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── PALESTRANTES ── */}
      {tab === "palestrantes" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Despesas — Palestrantes</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr>
                <th className={thCls}>Nome do Palestrante</th>
                <th className={thCls}>Tema</th>
                <th className={`${thCls} text-right`}>Cachê</th>
                <th className={`${thCls} text-right`}>Passagens</th>
                <th className={`${thCls} text-right`}>Hospedagem</th>
                <th className={`${thCls} text-right`}>TOTAL</th>
                <th className={thCls} />
              </tr></thead>
              <tbody>
                {data.palestrantes.map(r => {
                  const total = num(r.cache) + num(r.passagens) + num(r.hospedagem)
                  return (
                    <tr key={r.id}>
                      <td className={tdCls}><TI value={r.nome} onChange={v => updRow("palestrantes", r.id, { nome: v })} /></td>
                      <td className={tdCls}><TI value={r.tema} onChange={v => updRow("palestrantes", r.id, { tema: v })} /></td>
                      <td className={tdCls}><NI value={r.cache} onChange={v => updRow("palestrantes", r.id, { cache: v })} /></td>
                      <td className={tdCls}><NI value={r.passagens} onChange={v => updRow("palestrantes", r.id, { passagens: v })} /></td>
                      <td className={tdCls}><NI value={r.hospedagem} onChange={v => updRow("palestrantes", r.id, { hospedagem: v })} /></td>
                      <td className={`${tdCls} ${totalCellCls}`}>{fmt(total)}</td>
                      <td className={tdCls}><button onClick={() => delRow("palestrantes", r.id)}><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" /></button></td>
                    </tr>
                  )
                })}
                <tr className="bg-slate-50"><td colSpan={5} className="py-2 px-2 font-bold text-sm">SUBTOTAL PALESTRANTES</td><td className="py-2 px-2 text-right font-bold text-blue-700">{fmt(totPal)}</td><td /></tr>
              </tbody>
            </table>
            <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => addRow("palestrantes", { nome: "", tema: "", cache: 0, passagens: 0, hospedagem: 0 })}>
              <Plus className="w-3.5 h-3.5" /> Adicionar palestrante
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── CANTORES ── */}
      {tab === "cantores" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Despesas — Cantores / Artistas</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr>
                <th className={thCls}>Nome do Artista</th>
                <th className={thCls}>Tipo</th>
                <th className={`${thCls} text-right`}>Cachê</th>
                <th className={`${thCls} text-right`}>Passagens</th>
                <th className={`${thCls} text-right`}>Rider Técnico</th>
                <th className={`${thCls} text-right`}>TOTAL</th>
                <th className={thCls} />
              </tr></thead>
              <tbody>
                {data.cantores.map(r => {
                  const total = num(r.cache) + num(r.passagens) + num(r.rider)
                  return (
                    <tr key={r.id}>
                      <td className={tdCls}><TI value={r.nome} onChange={v => updRow("cantores", r.id, { nome: v })} /></td>
                      <td className={tdCls}><TI value={r.tipo} onChange={v => updRow("cantores", r.id, { tipo: v })} /></td>
                      <td className={tdCls}><NI value={r.cache} onChange={v => updRow("cantores", r.id, { cache: v })} /></td>
                      <td className={tdCls}><NI value={r.passagens} onChange={v => updRow("cantores", r.id, { passagens: v })} /></td>
                      <td className={tdCls}><NI value={r.rider} onChange={v => updRow("cantores", r.id, { rider: v })} /></td>
                      <td className={`${tdCls} ${totalCellCls}`}>{fmt(total)}</td>
                      <td className={tdCls}><button onClick={() => delRow("cantores", r.id)}><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" /></button></td>
                    </tr>
                  )
                })}
                <tr className="bg-slate-50"><td colSpan={5} className="py-2 px-2 font-bold text-sm">SUBTOTAL CANTORES</td><td className="py-2 px-2 text-right font-bold text-blue-700">{fmt(totCant)}</td><td /></tr>
              </tbody>
            </table>
            <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => addRow("cantores", { nome: "", tipo: "", cache: 0, passagens: 0, rider: 0 })}>
              <Plus className="w-3.5 h-3.5" /> Adicionar artista
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── OPERACIONAL ── */}
      {tab === "operacional" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Despesas — Operacionais</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr>
                <th className={thCls}>Item</th>
                <th className={thCls}>Descrição</th>
                <th className={`${thCls} text-right`}>Vlr Unit.</th>
                <th className={`${thCls} text-right`}>Qtd</th>
                <th className={`${thCls} text-right`}>TOTAL</th>
                <th className={thCls} />
              </tr></thead>
              <tbody>
                {data.operacionais.map(r => {
                  const total = num(r.valorUnitario) * num(r.quantidade)
                  return (
                    <tr key={r.id}>
                      <td className={tdCls}><TI value={r.item} onChange={v => updRow("operacionais", r.id, { item: v })} /></td>
                      <td className={tdCls}><TI value={r.descricao} onChange={v => updRow("operacionais", r.id, { descricao: v })} /></td>
                      <td className={tdCls}><NI value={r.valorUnitario} onChange={v => updRow("operacionais", r.id, { valorUnitario: v })} /></td>
                      <td className={tdCls}><NI value={r.quantidade} onChange={v => updRow("operacionais", r.id, { quantidade: v })} /></td>
                      <td className={`${tdCls} ${totalCellCls}`}>{fmt(total)}</td>
                      <td className={tdCls}><button onClick={() => delRow("operacionais", r.id)}><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" /></button></td>
                    </tr>
                  )
                })}
                <tr className="bg-slate-50"><td colSpan={4} className="py-2 px-2 font-bold text-sm">SUBTOTAL OPERACIONAIS</td><td className="py-2 px-2 text-right font-bold text-blue-700">{fmt(totOp)}</td><td /></tr>
              </tbody>
            </table>
            <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => addRow("operacionais", { item: "", descricao: "", valorUnitario: 0, quantidade: 0 })}>
              <Plus className="w-3.5 h-3.5" /> Adicionar linha
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── CRONOGRAMA ── */}
      {tab === "cronograma" && (() => {
        const subKey: keyof EventoData = cronoSub === "pre" ? "cronogramaPreEvento" : cronoSub === "dia" ? "cronogramaDiaEvento" : "cronogramaPosEvento"
        const rows = data[subKey] as CronoRow[]
        const label = cronoSub === "pre" ? "Pré-Evento" : cronoSub === "dia" ? "Dia do Evento" : "Pós-Evento"
        return (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">Cronograma</CardTitle>
                <div className="flex gap-1">
                  {(["pre","dia","pos"] as CronoSub[]).map(s => (
                    <button key={s} onClick={() => setCronoSub(s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${cronoSub === s ? "text-white border-transparent" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}
                      style={cronoSub === s ? { backgroundColor: "#006494" } : {}}>
                      {s === "pre" ? "Pré-Evento" : s === "dia" ? "Dia do Evento" : "Pós-Evento"}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr>
                  <th className={thCls}>Tarefa</th>
                  <th className={thCls}>Responsável</th>
                  <th className={thCls}>Início</th>
                  <th className={thCls}>Fim</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Observações</th>
                  <th className={thCls} />
                </tr></thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      <td className={tdCls}><TI value={r.tarefa} onChange={v => updRow(subKey, r.id, { tarefa: v })} /></td>
                      <td className={tdCls}><TI value={r.responsavel} onChange={v => updRow(subKey, r.id, { responsavel: v })} /></td>
                      <td className={tdCls}><input type="date" value={r.dataInicio} onChange={e => updRow(subKey, r.id, { dataInicio: e.target.value })} className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:border-blue-400 focus:outline-none" /></td>
                      <td className={tdCls}><input type="date" value={r.dataFim} onChange={e => updRow(subKey, r.id, { dataFim: e.target.value })} className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:border-blue-400 focus:outline-none" /></td>
                      <td className={tdCls} style={{ minWidth: 130 }}>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-full justify-center ${STATUS_COLORS[r.status]}`}>
                          {STATUS_ICON[r.status]}{r.status}
                        </span>
                        <SI value={r.status} onChange={v => updRow(subKey, r.id, { status: v })} />
                      </td>
                      <td className={tdCls}><TI value={r.observacoes} onChange={v => updRow(subKey, r.id, { observacoes: v })} /></td>
                      <td className={tdCls}><button onClick={() => delRow(subKey, r.id)}><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => addRow(subKey, { tarefa: "", responsavel: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" })}>
                <Plus className="w-3.5 h-3.5" /> Adicionar tarefa
              </Button>
            </CardContent>
          </Card>
        )
      })()}

      {/* ── RASTREAMENTO ── */}
      {tab === "rastreamento" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Rastreamento por Responsável</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr>
                <th className={thCls}>Responsável</th>
                <th className={thCls}>Tarefa</th>
                <th className={thCls}>Cronograma</th>
                <th className={thCls}>Início</th>
                <th className={thCls}>Fim</th>
                <th className={thCls}>Status</th>
                <th className={thCls} />
              </tr></thead>
              <tbody>
                {data.rastreamento.map(r => (
                  <tr key={r.id}>
                    <td className={tdCls}><TI value={r.responsavel} onChange={v => updRow("rastreamento", r.id, { responsavel: v })} /></td>
                    <td className={tdCls}><TI value={r.tarefa} onChange={v => updRow("rastreamento", r.id, { tarefa: v })} /></td>
                    <td className={tdCls}>
                      <select value={r.cronograma} onChange={e => updRow("rastreamento", r.id, { cronograma: e.target.value })} className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:outline-none">
                        <option>Pré-Evento</option><option>Dia Evento</option><option>Pós-Evento</option>
                      </select>
                    </td>
                    <td className={tdCls}><input type="date" value={r.dataInicio} onChange={e => updRow("rastreamento", r.id, { dataInicio: e.target.value })} className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:outline-none" /></td>
                    <td className={tdCls}><input type="date" value={r.dataFim} onChange={e => updRow("rastreamento", r.id, { dataFim: e.target.value })} className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:outline-none" /></td>
                    <td className={tdCls}><SI value={r.status} onChange={v => updRow("rastreamento", r.id, { status: v })} /></td>
                    <td className={tdCls}><button onClick={() => delRow("rastreamento", r.id)}><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => addRow("rastreamento", { responsavel: "", tarefa: "", cronograma: "Pré-Evento", dataInicio: "", dataFim: "", status: "Pendente" })}>
              <Plus className="w-3.5 h-3.5" /> Adicionar entrada
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── NOTAS ── */}
      {tab === "notas" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Notas</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr>
                <th className={thCls}>Responsável</th>
                <th className={thCls}>Item</th>
                <th className={thCls}>Observação</th>
                <th className={thCls}>Status</th>
                <th className={thCls} />
              </tr></thead>
              <tbody>
                {data.notas.map(r => (
                  <tr key={r.id}>
                    <td className={tdCls}><TI value={r.responsavel} onChange={v => updRow("notas", r.id, { responsavel: v })} /></td>
                    <td className={tdCls}><TI value={r.item} onChange={v => updRow("notas", r.id, { item: v })} /></td>
                    <td className={tdCls}><TI value={r.observacao} onChange={v => updRow("notas", r.id, { observacao: v })} /></td>
                    <td className={tdCls}><SI value={r.status} onChange={v => updRow("notas", r.id, { status: v })} /></td>
                    <td className={tdCls}><button onClick={() => delRow("notas", r.id)}><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => addRow("notas", { responsavel: "", item: "", observacao: "", status: "Pendente" })}>
              <Plus className="w-3.5 h-3.5" /> Adicionar nota
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
