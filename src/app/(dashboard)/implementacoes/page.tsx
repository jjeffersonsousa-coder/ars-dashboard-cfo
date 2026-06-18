"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Rocket, Clock, CheckCircle2, XCircle } from "lucide-react"

const mockData = [
  { id: 1, titulo: "Sistema de Gestão Financeira", responsavel: "João Silva", inicio: "2026-01-10", previsao: "2026-08-30", status: "Em andamento", progresso: 60, prioridade: "Alta" },
  { id: 2, titulo: "Implantação ERP", responsavel: "Maria Costa", inicio: "2026-03-01", previsao: "2026-12-31", status: "Em andamento", progresso: 25, prioridade: "Alta" },
  { id: 3, titulo: "Treinamento de Líderes", responsavel: "Carlos Melo", inicio: "2026-02-15", previsao: "2026-07-15", status: "Concluído", progresso: 100, prioridade: "Média" },
  { id: 4, titulo: "Revisão dos POPs", responsavel: "Ana Lima", inicio: "2026-05-01", previsao: "2026-06-30", status: "Atrasado", progresso: 40, prioridade: "Alta" },
  { id: 5, titulo: "Integração de Distritos", responsavel: "Pedro Souza", inicio: "2026-06-01", previsao: "2026-09-30", status: "Planejado", progresso: 0, prioridade: "Baixa" },
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

export default function ImplementacoesPage() {
  const [filtro, setFiltro] = useState("Todos")
  const statuses = ["Todos", "Em andamento", "Concluído", "Atrasado", "Planejado"]

  const filtered = filtro === "Todos" ? mockData : mockData.filter((d) => d.status === filtro)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Implementações</h2>
          <p className="text-slate-500 mt-1">Projetos e iniciativas em acompanhamento</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Implementação
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFiltro(s)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              filtro === s ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 hover:border-blue-300"
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                    Responsável: {item.responsavel} · Início: {new Date(item.inicio).toLocaleDateString("pt-BR")} · Previsão: {new Date(item.previsao).toLocaleDateString("pt-BR")}
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
      </div>
    </div>
  )
}
