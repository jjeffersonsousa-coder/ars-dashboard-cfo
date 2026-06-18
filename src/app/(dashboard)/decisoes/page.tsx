"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CheckSquare, Clock, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

const mockData = [
  { id: 1, titulo: "Aprovação do Orçamento 2026", descricao: "Orçamento anual aprovado com total de R$ 1.2M", data: "2026-01-15", responsavel: "Diretoria", categoria: "Financeiro", implementado: true },
  { id: 2, titulo: "Revisão da Política de Subvenções", descricao: "Nova política entra em vigor a partir de março/2026", data: "2026-02-10", responsavel: "CFO", categoria: "Administrativo", implementado: true },
  { id: 3, titulo: "Contratação de Sistema ERP", descricao: "Aprovada contratação do fornecedor XYZ para implantação do ERP", data: "2026-03-05", responsavel: "Diretoria", categoria: "Tecnologia", implementado: false },
  { id: 4, titulo: "Criação do Comitê de Governança", descricao: "Estruturação do comitê com reuniões mensais", data: "2026-04-20", responsavel: "Presidente", categoria: "Governança", implementado: false },
  { id: 5, titulo: "Revisão dos POPs Financeiros", descricao: "Todos os POPs devem ser revisados até junho/2026", data: "2026-05-08", responsavel: "CFO", categoria: "Administrativo", implementado: false },
]

const categorias = ["Todas", "Financeiro", "Administrativo", "Tecnologia", "Governança"]

export default function DecisoesPage() {
  const [categoria, setCategoria] = useState("Todas")
  const [busca, setBusca] = useState("")

  const filtered = mockData.filter((d) => {
    if (categoria !== "Todas" && d.categoria !== categoria) return false
    if (busca && !d.titulo.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const pendentes = filtered.filter((d) => !d.implementado).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Decisões Tomadas</h2>
          <p className="text-slate-500 mt-1">Histórico de deliberações institucionais</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Registrar Decisão
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total de Decisões</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{mockData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Implementadas</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{mockData.filter((d) => d.implementado).length}</p>
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
                  categoria === c ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 hover:border-blue-300"
                }`}>
                {c}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs">
            <Input placeholder="Buscar decisão..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
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
                  <p className="text-sm text-slate-500 mt-1">{item.descricao}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(item.data).toLocaleDateString("pt-BR")} · Responsável: {item.responsavel}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
