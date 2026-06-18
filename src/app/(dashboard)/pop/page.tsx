"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Edit2, Clock, CheckCircle2, AlertTriangle, Building2 } from "lucide-react"

interface Pop {
  id: number
  codigo: string
  titulo: string
  categoria: string
  versao: string
  vigencia: string
  revisao: string
  status: "Vigente" | "Para Revisar" | "Rascunho" | "Obsoleto"
  responsavel: string
  descricao: string
  conteudo: string
  origem: "Interno" | "USeB"
}

const mockData: Pop[] = [
  // USeB POPs — importados dos PDFs
  {
    id: 1,
    codigo: "POP-001/2026",
    titulo: "Diretrizes Para Utilização do Cartão de Benefícios (Swile e Outros)",
    categoria: "Tesouraria",
    versao: "2026",
    vigencia: "2026-01-01",
    revisao: "2026-12-31",
    status: "Vigente",
    responsavel: "Tesouraria USeB",
    origem: "USeB",
    descricao: "Padroniza a utilização do cartão de benefícios (Swile e similares) nos campos e instituições da USeB, definindo critérios de uso e limitações para evitar tributação indevida (INSS, FGTS, IR).",
    conteudo: `ABRANGÊNCIA: Todas as entidades da USeB (Campos e Instituições) e suas respectivas áreas (religiosa, educacional e assistencial).

UTILIZAÇÃO APROPRIADA:
• Vale Transporte/mobilidade
• Vale Alimentação/Refeição
• Presente pelo dia da profissão/servidor/pastor
• Presente de fim de ano / despedida
• Reuniões e eventos oficiais da entidade (restrito aos colaboradores)
• Atividades do grêmio de servidores

UTILIZAÇÃO INADEQUADA (vedado):
• Bonificações e gratificações (metas, incentivos, premiações)
• Presentes a terceiros (palestrantes, membros, alunos)
• Pagamento de serviços de qualquer natureza
• Ajuda de custo para voluntários (OYIM e SVA)
• Auxílio manutenção a obreiros bíblicos

PROCEDIMENTO NO DRACMA:
• Ao criar o documento, a nota fiscal deve estar acompanhada da relação oficial emitida pela plataforma da empresa
• A finalidade do benefício deve estar claramente indicada no campo específico do DRACMA
• Ex.: mobilidade, alimentação, aniversário, presente de despedida, dia da profissão, dia do servidor`,
  },
  {
    id: 2,
    codigo: "POP-002/2026",
    titulo: "Práticas Financeiras — Definições",
    categoria: "Tesouraria",
    versao: "2026",
    vigencia: "2026-06-01",
    revisao: "2026-12-31",
    status: "Vigente",
    responsavel: "Tesouraria USeB",
    origem: "USeB",
    descricao: "Padroniza procedimentos financeiros da USeB — pagamentos, aluguéis, aprovações, autorização de bancos e registro de créditos de cartão de benefícios — garantindo transparência, rastreabilidade e conformidade.",
    conteudo: `VIGÊNCIA: A partir de 1º de junho de 2026.

SISTEMA OFICIAL DE PAGAMENTOS:
• Todos os pagamentos devem ser realizados exclusivamente pelo sistema DRACMA
• Vedada a realização de pagamentos por outros meios, salvo exceções autorizadas
• Pagamentos devem ocorrer diretamente da entidade para o fornecedor (sem intermediários)

PAGAMENTOS DE ALUGUÉIS:
• Somente após análise fiscal do documento
• Pagamento direto pela entidade; vedado pagamento a pessoas diferentes do locador no contrato
• Irregularidades são notificadas pela equipe fiscal antes do pagamento

APROVAÇÃO DE PAGAMENTOS:
• Seguem hierarquia definida em normativo interno
• Aplicável a pagamentos no DRACMA e plataformas bancárias

AUTORIZAÇÃO DE BANCOS:
• A Comissão Diretiva deve autorizar anualmente as instituições financeiras, contas e agências
• Toda conta deve ser cadastrada no AASI imediatamente após abertura

REGISTRO DE CRÉDITOS/PONTOS DE CARTÃO:
• Créditos de programas de benefícios devem ser integralmente registrados na contabilidade
• Aplica-se também ao uso de milhas para passagens, produtos e serviços
• Lançamentos: D-1161020 / C-2151025 (recebimento); D-Despesa / C-1161020 e D-2151025 / C-3182090 (utilização)`,
  },
  {
    id: 3,
    codigo: "POP-003/2026",
    titulo: "Exames Médicos Periódicos — Especiais",
    categoria: "Tesouraria",
    versao: "2026.05.27",
    vigencia: "2026-05-27",
    revisao: "2027-05-27",
    status: "Vigente",
    responsavel: "Tesouraria USeB",
    origem: "USeB",
    descricao: "Estabelece diretrizes para realização de exames médicos periódicos especiais pelos pastores e obreiros dos campos e instituições da USeB, incluindo locais de atendimento e critérios de reembolso.",
    conteudo: `OBJETIVO: Apoiar e incentivar a realização de exames médicos periódicos pelos pastores e obreiros da USeB, cumprindo o Regulamento Eclesiástico Administrativo.

LOCAIS DE ATENDIMENTO:
• Rede credenciada pelo PROASA dentro do território da USeB
• Hospitais denominacionais (Hospital Adventista Silvestre — RJ; Hospital Adventista de Belém — PA), mediante autorização da comissão interna do campo

PROCEDIMENTO:
• Exames podem ser solicitados diretamente ao PROASA ou via hospital/clínica parceira
• Autorizações solicitadas diretamente pelo local de atendimento

REEMBOLSO DE DESPESAS COM VIAGEM:
• Até 75% do valor da passagem do obreiro e cônjuge
• Até 50% do valor da passagem do filho dependente
• Hospedagem em hotel: limitado a 4 diárias e 1 quarto (single, duplo etc.)
• Até 4 diárias para custeio de alimentação de toda a família

PRESTAÇÃO DE CONTAS:
• Reembolso mediante apresentação de notas fiscais com CPF do obreiro, cônjuge e filho dependente
• Relatar no relatório mensal na verba "Viagem Especiais – Assistência Médica"`,
  },
  // POPs internos
  {
    id: 4,
    codigo: "POP-FIN-001",
    titulo: "Processo de Liberação de Pagamentos",
    categoria: "Financeiro",
    versao: "2.1",
    vigencia: "2026-01-01",
    revisao: "2026-12-31",
    status: "Vigente",
    responsavel: "CFO",
    origem: "Interno",
    descricao: "Define o fluxo de aprovação e liberação de pagamentos acima de R$ 1.000,00.",
    conteudo: "",
  },
  {
    id: 5,
    codigo: "POP-FIN-002",
    titulo: "Conciliação Bancária Mensal",
    categoria: "Financeiro",
    versao: "1.3",
    vigencia: "2025-07-01",
    revisao: "2026-06-30",
    status: "Para Revisar",
    responsavel: "Contador",
    origem: "Interno",
    descricao: "Procedimento de conciliação das contas bancárias ao final de cada mês.",
    conteudo: "",
  },
  {
    id: 6,
    codigo: "POP-ADM-001",
    titulo: "Controle de Documentos Oficiais",
    categoria: "Administrativo",
    versao: "1.0",
    vigencia: "2026-03-01",
    revisao: "2027-03-01",
    status: "Vigente",
    responsavel: "Secretário",
    origem: "Interno",
    descricao: "Define como documentos oficiais devem ser recebidos, protocolados e arquivados.",
    conteudo: "",
  },
  {
    id: 7,
    codigo: "POP-SUB-001",
    titulo: "Envio de Subvenções às Igrejas",
    categoria: "Subvenções",
    versao: "1.1",
    vigencia: "2026-02-01",
    revisao: "2026-06-30",
    status: "Para Revisar",
    responsavel: "CFO",
    origem: "Interno",
    descricao: "Fluxo completo para solicitação, aprovação e envio de subvenções.",
    conteudo: "",
  },
]

const statusIcon: Record<string, React.ReactNode> = {
  "Vigente": <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  "Para Revisar": <AlertTriangle className="w-4 h-4 text-orange-500" />,
  "Rascunho": <Clock className="w-4 h-4 text-slate-400" />,
  "Obsoleto": <Clock className="w-4 h-4 text-red-400" />,
}

const statusColor: Record<string, string> = {
  "Vigente": "bg-emerald-100 text-emerald-700",
  "Para Revisar": "bg-orange-100 text-orange-700",
  "Rascunho": "bg-slate-100 text-slate-600",
  "Obsoleto": "bg-red-100 text-red-600",
}

const categorias = ["Todas", "Financeiro", "Administrativo", "Subvenções", "Tesouraria"]
const origens = ["Todas", "Interno", "USeB"]

function diasParaRevisao(revisao: string) {
  const hoje = new Date()
  const rev = new Date(revisao)
  return Math.ceil((rev.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export default function PopPage() {
  const [categoria, setCategoria] = useState("Todas")
  const [origem, setOrigem] = useState("Todas")
  const [selected, setSelected] = useState<number | null>(null)

  const filtered = mockData.filter((d) => {
    if (categoria !== "Todas" && d.categoria !== categoria) return false
    if (origem !== "Todas" && d.origem !== origem) return false
    return true
  })
  const pop = mockData.find((p) => p.id === selected)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Procedimentos Operacionais Padrão</h2>
          <p className="text-slate-500 mt-1">Criação e gestão de POPs institucionais</p>
        </div>
        <Button className="gap-2" style={{ backgroundColor: "#006494" }}>
          <Plus className="w-4 h-4" /> Novo POP
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoria</label>
          <div className="flex gap-1 flex-wrap">
            {categorias.map((c) => (
              <button key={c} onClick={() => setCategoria(c)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${categoria === c ? "text-white border-transparent" : "border-slate-200 hover:border-blue-300"}`}
                style={categoria === c ? { backgroundColor: "#006494" } : {}}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Origem</label>
          <div className="flex gap-1">
            {origens.map((o) => (
              <button key={o} onClick={() => setOrigem(o)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${origem === o ? "text-white border-transparent" : "border-slate-200 hover:border-blue-300"}`}
                style={origem === o ? { backgroundColor: "#006494" } : {}}>
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="space-y-2">
          {filtered.map((item) => {
            const dias = diasParaRevisao(item.revisao)
            const alertaRevisao = dias <= 60 && item.status === "Vigente"
            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md card-hover-glow ${selected === item.id ? "ring-2" : ""}`}
                style={selected === item.id ? { outline: "2px solid #006494" } : {}}
                onClick={() => setSelected(item.id === selected ? null : item.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: item.origem === "USeB" ? "#E8F1F2" : "#fdf4ff" }}>
                      {item.origem === "USeB"
                        ? <Building2 className="w-5 h-5" style={{ color: "#006494" }} />
                        : <BookOpen className="w-5 h-5 text-pink-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-xs font-mono text-slate-400">{item.codigo}</span>
                            {item.origem === "USeB" && (
                              <span className="px-1.5 py-0 rounded text-xs font-bold" style={{ backgroundColor: "#006494", color: "white" }}>USeB</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-800 text-sm leading-tight">{item.titulo}</h3>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColor[item.status]}`}>
                            {item.status}
                          </span>
                          {alertaRevisao && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-orange-50 text-orange-600 flex items-center gap-1 whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3" /> {dias}d p/ revisão
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
                        <span>v{item.versao}</span>·<span>{item.categoria}</span>·<span>Rev: {new Date(item.revisao).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Detalhe */}
        {pop ? (
          <Card className="h-fit sticky top-4">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">{pop.codigo} · v{pop.versao}</span>
                    {pop.origem === "USeB" && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: "#006494", color: "white" }}>USeB</span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base leading-snug">{pop.titulo}</h3>
                </div>
                <Button size="sm" variant="outline" className="gap-1 shrink-0">
                  <Edit2 className="w-3 h-3" /> Editar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Categoria", value: pop.categoria },
                  { label: "Responsável", value: pop.responsavel },
                  { label: "Vigência desde", value: new Date(pop.vigencia).toLocaleDateString("pt-BR") },
                  { label: "Próxima revisão", value: new Date(pop.revisao).toLocaleDateString("pt-BR") },
                ].map((f) => (
                  <div key={f.label} className="rounded-lg p-2.5" style={{ backgroundColor: "#E8F1F2" }}>
                    <p className="text-xs text-slate-400">{f.label}</p>
                    <p className="font-semibold text-slate-700 mt-0.5 text-sm">{f.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Descrição</h4>
                <p className="text-sm text-slate-600 rounded-lg p-3" style={{ backgroundColor: "#E8F1F2" }}>{pop.descricao}</p>
              </div>

              {pop.conteudo && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Conteúdo do Procedimento</h4>
                  <pre className="text-xs text-slate-600 rounded-lg p-3 whitespace-pre-wrap leading-relaxed font-sans max-h-72 overflow-y-auto" style={{ backgroundColor: "#f8fafc" }}>
                    {pop.conteudo}
                  </pre>
                </div>
              )}

              {!pop.conteudo && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-slate-400 italic">Clique em "Editar" para adicionar os passos detalhados do procedimento.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="hidden lg:flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
            Selecione um POP para ver os detalhes
          </div>
        )}
      </div>
    </div>
  )
}
