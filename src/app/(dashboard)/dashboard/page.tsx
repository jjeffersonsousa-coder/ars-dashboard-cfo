import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  HandCoins,
  Rocket,
  CalendarDays,
  CheckSquare,
  BookOpen,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

const modules = [
  {
    href: "/orcamento",
    icon: DollarSign,
    title: "Orçamento",
    description: "Orçado vs. Realizado por departamento",
    color: "bg-blue-500",
    badge: "Atualizado",
    badgeVariant: "default" as const,
  },
  {
    href: "/subvencoes",
    icon: HandCoins,
    title: "Subvenções",
    description: "Repasses por distrito e igreja",
    color: "bg-emerald-500",
    badge: "3 pendentes",
    badgeVariant: "destructive" as const,
  },
  {
    href: "/implementacoes",
    icon: Rocket,
    title: "Implementações",
    description: "Projetos e iniciativas em andamento",
    color: "bg-violet-500",
    badge: "5 ativos",
    badgeVariant: "secondary" as const,
  },
  {
    href: "/reunioes",
    icon: CalendarDays,
    title: "Reuniões",
    description: "Pautas, atas e deliberações",
    color: "bg-orange-500",
    badge: "Próxima hoje",
    badgeVariant: "outline" as const,
  },
  {
    href: "/decisoes",
    icon: CheckSquare,
    title: "Decisões",
    description: "Histórico de decisões institucionais",
    color: "bg-teal-500",
    badge: "12 registros",
    badgeVariant: "secondary" as const,
  },
  {
    href: "/pop",
    icon: BookOpen,
    title: "POP",
    description: "Procedimentos Operacionais Padrão",
    color: "bg-pink-500",
    badge: "2 para revisar",
    badgeVariant: "destructive" as const,
  },
]

const kpis = [
  { label: "Execução Orçamentária", value: "78%", icon: TrendingUp, trend: "+3% vs mês anterior", color: "text-blue-600" },
  { label: "Subvenções Enviadas", value: "R$ 0", icon: HandCoins, trend: "Aguardando dados", color: "text-emerald-600" },
  { label: "Implementações Ativas", value: "0", icon: Rocket, trend: "Cadastre projetos", color: "text-violet-600" },
  { label: "Pendências", value: "0", icon: AlertTriangle, trend: "Nenhuma pendência", color: "text-orange-600" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <p className="text-slate-500 mt-1">Painel de controle — decisões baseadas em dados</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{kpi.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{kpi.trend}</p>
                </div>
                <kpi.icon className={`w-8 h-8 ${kpi.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Módulos */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Módulos do Sistema</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <Link key={mod.href} href={mod.href}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: `var(--${mod.color.replace("bg-", "")})` }}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${mod.color}`}>
                      <mod.icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant={mod.badgeVariant}>{mod.badge}</Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{mod.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500">{mod.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
