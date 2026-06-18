"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CalendarDays, Users, FileText } from "lucide-react"

const mockData = [
  {
    id: 1, titulo: "Reunião de Diretoria — Junho", data: "2026-06-17", hora: "14:00",
    participantes: ["CFO", "Presidente", "Secretário"], status: "Hoje",
    pauta: ["Aprovação do orçamento 2° semestre", "Revisão das subvenções pendentes", "Atualização dos POPs"],
    ata: "",
  },
  {
    id: 2, titulo: "Reunião Financeira — Maio", data: "2026-05-28", hora: "10:00",
    participantes: ["CFO", "Contador", "Tesoureiro"], status: "Concluída",
    pauta: ["Fechamento de maio", "Análise de desvios"],
    ata: "Aprovado o fechamento de maio. Identificado desvio de 8% no departamento de eventos.",
  },
  {
    id: 3, titulo: "Planejamento 2° Semestre", data: "2026-07-05", hora: "09:00",
    participantes: ["CFO", "Diretores"], status: "Agendada",
    pauta: ["Metas do 2° semestre", "Revisão orçamentária"],
    ata: "",
  },
]

const statusColor: Record<string, string> = {
  Hoje: "bg-blue-100 text-blue-700",
  Concluída: "bg-emerald-100 text-emerald-700",
  Agendada: "bg-slate-100 text-slate-600",
  Cancelada: "bg-red-100 text-red-700",
}

export default function ReunioesPage() {
  const [selected, setSelected] = useState<number | null>(null)

  const reuniao = mockData.find((r) => r.id === selected)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reuniões</h2>
          <p className="text-slate-500 mt-1">Pautas, atas e deliberações</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Reunião
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {mockData.map((r) => (
            <Card
              key={r.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selected === r.id ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setSelected(r.id === selected ? null : r.id)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <CalendarDays className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{r.titulo}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {new Date(r.data).toLocaleDateString("pt-BR")} às {r.hora}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{r.participantes.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
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
                <p className="text-sm text-slate-500">{new Date(reuniao.data).toLocaleDateString("pt-BR")} às {reuniao.hora}</p>
              </div>

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

              {reuniao.ata && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Ata / Deliberações</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{reuniao.ata}</p>
                </div>
              )}

              {!reuniao.ata && reuniao.status !== "Concluída" && (
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="w-4 h-4" />
                  Registrar Ata
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
    </div>
  )
}
