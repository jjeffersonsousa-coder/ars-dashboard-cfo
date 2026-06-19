"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Upload, Send, FileText, X, Loader2, MessageSquare,
  Clock, Plus, Trash2, BookOpen, ChevronRight, Search,
  AlertCircle,
} from "lucide-react"
import { BASE_CONHECIMENTO, type BaseDoc } from "@/data/base-conhecimento"

// ── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  docId: string
  docTitle: string
  docCategory: string
  pageRef: string
  excerpt: string
  score: number
}

interface Msg {
  role: "user" | "assistant" | "system"
  text: string
  result?: SearchResult | null   // rich result for assistant responses
  notFound?: boolean
}

interface Consulta {
  id: string
  titulo: string
  data: string
  messages: Msg[]
  docIds: string[]
}

// ── Storage ───────────────────────────────────────────────────────────────────

const HISTORY_KEY = "ars_help_historico"

function loadHistory(): Consulta[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") } catch { return [] }
}
function saveHistory(h: Consulta[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
}
function newId() { return `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }
function dateFmt(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
}
function firstUserMsg(c: Consulta) {
  const m = c.messages.find(m => m.role === "user")
  return m ? m.text.slice(0, 70) + (m.text.length > 70 ? "…" : "") : "Consulta sem texto"
}

// ── Search ─────────────────────────────────────────────────────────────────────

function searchDocs(docs: BaseDoc[], question: string): SearchResult | null {
  const q = question.toLowerCase()
  const words = q.split(/\s+/).filter(w => w.length > 3)
  if (words.length === 0) return null

  let best: SearchResult | null = null

  for (const doc of docs) {
    const content = doc.conteudo.toLowerCase()
    let score = 0
    for (const w of words) {
      score += (content.match(new RegExp(w, 'gi')) || []).length
    }
    if (score === 0) continue

    const mainWord = [...words].sort((a, b) =>
      (content.match(new RegExp(b, 'gi')) || []).length -
      (content.match(new RegExp(a, 'gi')) || []).length
    )[0]
    const idx = content.indexOf(mainWord)
    const pageMatch = doc.conteudo.slice(Math.max(0, idx - 400), idx).match(/\[Página (\d+)\]/)
    const pageRef = pageMatch ? `Página ${pageMatch[1]}` : ""
    const start = Math.max(0, idx - 80)
    const end = Math.min(doc.conteudo.length, idx + 700)
    const excerpt = doc.conteudo.slice(start, end)
      .replace(/\[Página \d+\]\n?/g, '')
      .replace(/\s{3,}/g, ' ')
      .trim()

    if (!best || score > best.score) {
      best = { docId: doc.id, docTitle: doc.titulo, docCategory: doc.categoria, pageRef, excerpt, score }
    }
  }
  return best
}

// ── Rich message renderer ──────────────────────────────────────────────────────

function HighlightText({ text, query }: { text: string; query: string }) {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  if (words.length === 0) return <span>{text}</span>

  const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{ backgroundColor: "#DBEAFE", color: "#1E40AF", borderRadius: "2px", padding: "0 2px" }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

function RichResultCard({ result, query }: { result: SearchResult; query: string }) {
  return (
    <div style={{ maxWidth: "600px" }}>
      {/* Source header */}
      <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: "1px solid #BFDBFE" }}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: "linear-gradient(135deg, #1B98E0, #006494)" }}>
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold" style={{ color: "#1E3A5F" }}>{result.docTitle}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: "#DBEAFE", color: "#1D4ED8", fontSize: "10px" }}>
              {result.docCategory}
            </span>
            {result.pageRef && (
              <span className="text-xs" style={{ color: "#6B7280" }}>· {result.pageRef}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main label */}
      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#006494" }}>
        Trecho encontrado:
      </p>

      {/* Excerpt */}
      <div className="rounded-lg p-3 text-sm leading-relaxed" style={{ backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD", color: "#1E293B" }}>
        <HighlightText text={result.excerpt} query={query} />
        <span style={{ color: "#94A3B8" }}>…</span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5 mt-2">
        <Search className="w-3 h-3" style={{ color: "#006494" }} />
        <p className="text-xs" style={{ color: "#64748B" }}>
          Correspondência em <strong style={{ color: "#006494" }}>{result.docTitle}</strong>
          {result.pageRef && <> · <em>{result.pageRef}</em></>}
          {" · "}<span style={{ color: "#94A3B8" }}>configure API Claude para respostas completas</span>
        </p>
      </div>
    </div>
  )
}

function NotFoundCard({ question }: { question: string }) {
  return (
    <div style={{ maxWidth: "480px" }}>
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4" style={{ color: "#F59E0B" }} />
        <p className="text-sm font-semibold" style={{ color: "#92400E" }}>Não encontrado nos documentos</p>
      </div>
      <p className="text-sm" style={{ color: "#78716C" }}>
        Não localizei informações sobre <em>"{question}"</em> nos documentos ativos.
        Tente reformular a pergunta ou ative outros documentos na base.
      </p>
    </div>
  )
}

function MsgBubble({ msg, prevUserMsg }: { msg: Msg; prevUserMsg?: string }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-none px-4 py-2.5 text-sm text-white"
          style={{ backgroundColor: "#006494" }}>
          {msg.text}
        </div>
      </div>
    )
  }

  // System / simple assistant message
  if (!msg.result && !msg.notFound) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-slate-700 bg-slate-100">
          {msg.text}
        </div>
      </div>
    )
  }

  // Rich result card
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-none p-4 text-sm shadow-sm"
        style={{ backgroundColor: "#F8FBFF", border: "1px solid #BFDBFE", maxWidth: "640px" }}>
        {msg.result
          ? <RichResultCard result={msg.result} query={prevUserMsg || ""} />
          : <NotFoundCard question={prevUserMsg || ""} />
        }
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const CLAUDE_API_KEY = "ars_claude_api_key"

async function askGroq(apiKey: string, question: string, context: string): Promise<string> {
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: "Você é o assistente financeiro da ARS (Associação Rio Sul da IASD). Responda APENAS com base nos documentos fornecidos. Dê respostas diretas, objetivas e em português brasileiro. Se a informação não estiver nos documentos, diga claramente.",
        },
        {
          role: "user",
          content: `Documentos disponíveis:\n\n${context}\n\n---\nPergunta: ${question}`,
        },
      ],
    }),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    const msg = (err as { error?: { message?: string } }).error?.message
    throw new Error(msg || `Erro ${resp.status}`)
  }
  const data = await resp.json() as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content ?? "Sem resposta."
}

export default function HelpPage() {
  const [history, setHistory] = useState<Consulta[]>([])
  const [activaId, setActivaId] = useState<string | null>(null)
  const [extraDocs, setExtraDocs] = useState<BaseDoc[]>([])
  const [apiKey, setApiKey] = useState("")
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Olá! Sou seu assistente de consultas da ARS. Tenho acesso ao Manual de Orientações Financeiras e à Agenda da Comissão de Orçamento. Faça sua pergunta!",
    },
  ])
  const [docIds, setDocIds] = useState<string[]>(BASE_CONHECIMENTO.map(d => d.id))
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"chat" | "history">("chat")
  const fileRef = useRef<HTMLInputElement>(null)
  const msgEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHistory(loadHistory())
    const k = localStorage.getItem(CLAUDE_API_KEY) ?? ""
    setApiKey(k)
  }, [])
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

  const allDocs: BaseDoc[] = [...BASE_CONHECIMENTO, ...extraDocs]
  const activeDocs = allDocs.filter(d => docIds.includes(d.id))

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newDocs: BaseDoc[] = Array.from(files).map(f => ({
      id: `upload_${Date.now()}_${f.name}`,
      titulo: f.name.replace(/\.[^.]+$/, ""),
      arquivo: f.name,
      categoria: "Upload",
      conteudo: "",
    }))
    setExtraDocs(prev => [...prev, ...newDocs])
    setDocIds(prev => [...prev, ...newDocs.map(d => d.id)])
    setMessages(prev => [...prev, {
      role: "assistant",
      text: `${newDocs.map(d => `"${d.arquivo}"`).join(", ")} adicionado(s) à base. Pode perguntar!`,
    }])
  }

  async function handleSend() {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput("")
    const userMsg: Msg = { role: "user", text: question }
    const newMsgs: Msg[] = [...messages, userMsg]
    setMessages(newMsgs)
    setLoading(true)

    let assistantMsg: Msg
    if (activeDocs.length === 0) {
      assistantMsg = { role: "assistant", text: "Nenhum documento ativo. Ative documentos na base de conhecimento." }
    } else if (apiKey) {
      // Call Claude API with document context
      try {
        const context = activeDocs.map(d => `[${d.titulo}]\n${d.conteudo}`).join("\n\n---\n\n")
        const answer = await askGroq(apiKey, question, context.slice(0, 80000))
        assistantMsg = { role: "assistant", text: answer }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido"
        assistantMsg = { role: "assistant", text: `❌ Erro ao consultar Groq: ${msg}` }
      }
    } else {
      // Fallback: keyword search + excerpt
      const result = searchDocs(activeDocs, question)
      if (result) {
        assistantMsg = { role: "assistant", text: "", result }
      } else {
        assistantMsg = { role: "assistant", text: "", result: null, notFound: true }
      }
    }

    const finalMsgs: Msg[] = [...newMsgs, assistantMsg]
    setMessages(finalMsgs)
    setLoading(false)

    // Save
    const now = new Date().toISOString()
    if (activaId) {
      const updated = history.map(c => c.id === activaId ? { ...c, messages: finalMsgs, data: now } : c)
      setHistory(updated); saveHistory(updated)
    } else {
      const nova: Consulta = { id: newId(), titulo: question.slice(0, 50), data: now, messages: finalMsgs, docIds }
      const updated = [nova, ...history]
      setHistory(updated); saveHistory(updated); setActivaId(nova.id)
    }
  }

  function novaConsulta() {
    setActivaId(null)
    setMessages([{ role: "assistant", text: "Nova consulta iniciada. Como posso ajudar?" }])
    setView("chat")
  }

  function abrirConsulta(c: Consulta) {
    setActivaId(c.id); setMessages(c.messages); setDocIds(c.docIds); setView("chat")
  }

  function excluirConsulta(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const updated = history.filter(c => c.id !== id)
    setHistory(updated); saveHistory(updated)
    if (activaId === id) { setActivaId(null); setMessages([{ role: "assistant", text: "Consulta excluída." }]) }
  }

  const consultaAtiva = activaId ? history.find(c => c.id === activaId) : null

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Help / Base IA</h2>
          <p className="text-slate-500 text-sm mt-0.5">Consulte regulamentos e documentos com inteligência artificial</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setView("history")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${view === "history" ? "text-white border-transparent" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}
            style={view === "history" ? { backgroundColor: "#006494" } : {}}>
            <Clock className="w-3.5 h-3.5" /> Histórico ({history.length})
          </button>
          <button onClick={novaConsulta}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:border-blue-300 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Nova Consulta
          </button>
        </div>
      </div>

      {view === "history" ? (
        /* ── Histórico ── */
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Consultas Salvas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Nenhuma consulta salva ainda.</p>
                <button onClick={novaConsulta} className="mt-3 text-sm underline" style={{ color: "#006494" }}>
                  Iniciar primeira consulta
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map(c => (
                  <div key={c.id} onClick={() => abrirConsulta(c)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors group">
                    <MessageSquare className="w-4 h-4 shrink-0" style={{ color: "#1B98E0" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{firstUserMsg(c)}</p>
                      <p className="text-xs text-slate-400">{dateFmt(c.data)} · {c.messages.length} msgs</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                    <button onClick={(e) => excluirConsulta(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ── Chat ── */
        <div className="grid lg:grid-cols-3 gap-4" style={{ height: "calc(100vh - 230px)" }}>
          {/* Base de Conhecimento */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: "#006494" }} /> Base de Conhecimento
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden pt-0">
              <div style={{ overflowY: "auto", maxHeight: "220px" }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Documentos ARS</p>
                {allDocs.map(doc => {
                  const active = docIds.includes(doc.id)
                  return (
                    <div key={doc.id} onClick={() => setDocIds(prev => active ? prev.filter(id => id !== doc.id) : [...prev, doc.id])}
                      className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer mb-1.5 transition-all border ${active ? "border-blue-200 bg-blue-50" : "border-slate-100 hover:border-slate-200 opacity-60"}`}>
                      <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${active ? "text-blue-500" : "text-slate-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 leading-snug">{doc.titulo}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded mt-1 inline-block font-medium"
                          style={{ backgroundColor: active ? "#DBEAFE" : "#F1F5F9", color: active ? "#1D4ED8" : "#64748B", fontSize: "10px" }}>
                          {doc.categoria}
                        </span>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${active ? "bg-blue-500" : "bg-slate-200"}`} />
                    </div>
                  )
                })}
              </div>

              <div
                className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors shrink-0"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}>
                <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 font-medium">Adicionar documento</p>
                <p className="text-xs text-slate-400">PDF, DOCX, TXT</p>
              </div>
              <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt" className="hidden"
                onChange={e => handleFiles(e.target.files)} />

              {consultaAtiva && (
                <div className="text-xs text-slate-400 mt-auto pt-2 border-t border-slate-100 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Salvo: {dateFmt(consultaAtiva.data)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            <CardHeader className="pb-2 border-b shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #1B98E0, #006494)" }}>
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {consultaAtiva ? consultaAtiva.titulo.slice(0, 55) : "Nova Consulta"}
                  </p>
                  {consultaAtiva && (
                    <p className="text-xs text-slate-400">#{consultaAtiva.id.slice(-5)} · {dateFmt(consultaAtiva.data)}</p>
                  )}
                </div>
                {consultaAtiva && (
                  <button onClick={() => { setActivaId(null); setMessages([{ role: "assistant", text: "Consulta fechada. Inicie uma nova consulta." }]) }}
                    className="ml-auto p-1 text-slate-300 hover:text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-3 gap-0 overflow-hidden">
              <div className="flex-1 overflow-auto space-y-3 pb-3 pr-1">
                {messages.map((msg, i) => {
                  const prevUser = i > 0 ? messages.slice(0, i).reverse().find(m => m.role === "user")?.text : undefined
                  return <MsgBubble key={i} msg={msg} prevUserMsg={prevUser} />
                })}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-none p-3" style={{ backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD" }}>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#006494" }} />
                        <span className="text-xs" style={{ color: "#006494" }}>Pesquisando nos documentos…</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>

              <div className="flex gap-2 pt-2 border-t shrink-0">
                <Input
                  placeholder="Ex: Qual o valor do auxílio moradia?"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  disabled={loading}
                  className="text-sm"
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()} className="shrink-0 gap-1.5"
                  style={{ backgroundColor: "#006494" }}>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
