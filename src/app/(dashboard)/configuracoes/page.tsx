// @refresh reset
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Users, Building2, ShieldCheck, Lock, UserCog, Plus, Search,
  Edit2, Trash2, Eye, EyeOff, ImageIcon, Upload, X, KeyRound,
} from "lucide-react"
import { getAllUsuarios, USUARIOS_BASE, NIVEL_LABEL, type Usuario as UsuarioAuth, normalizeCpf } from "@/data/usuarios"
import { getSession } from "@/lib/auth"

const LOGO_KEY = "ars_logo_base64"
const EXTRA_USERS_KEY = "ars_usuarios_extra"
import { DEPT_RESPONSAVEIS, RESPONSAVEIS_UNICOS } from "@/data/responsaveis"
import { ORCAMENTO_2026 } from "@/data/orcamento-2026"

// ── Atribuições (responsáveis por departamento) ───────────────────────────────
const RESP_OVERRIDES_KEY = "ars_dept_responsaveis"

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

function saveRespMapLocal(m: Record<string, string[]>) {
  localStorage.setItem(RESP_OVERRIDES_KEY, JSON.stringify(m))
}

// ── Permissões (espelha sidebar.tsx) ─────────────────────────────────────────
const PERMS_KEY = "ars_permissions"

const ALL_NAV = [
  { href: "/dashboard",      label: "Dashboard" },
  { href: "/orcamento",      label: "Orçamento" },
  { href: "/subvencoes",     label: "Subvenções" },
  { href: "/implementacoes", label: "Implementações" },
  { href: "/reunioes",       label: "Reuniões" },
  { href: "/decisoes",       label: "Decisões" },
  { href: "/pop",            label: "POP" },
  { href: "/eventos",        label: "Eventos" },
  { href: "/help",           label: "Help / IA" },
]

function loadPerms(): Record<string, Record<string, boolean>> {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(PERMS_KEY) || "{}") } catch { return {} }
}

function savePerms(p: Record<string, Record<string, boolean>>) {
  localStorage.setItem(PERMS_KEY, JSON.stringify(p))
}

// ── Tipos ──────────────────────────────────────────────────────────────────
type NivelAcesso = 1 | 2 | 3 | 4 | 5 | 6

interface Usuario {
  id: number
  nome: string
  email: string
  cpf: string
  funcao: string
  departamento: string
  nivel: NivelAcesso
  ativo: boolean
}

interface Departamento {
  codigo: string | number
  nome: string
  responsavel: string
}

interface Funcao {
  id: number
  nome: string
  descricao: string
  modulos: string[]
  nivel: NivelAcesso
}

// ── Dados mock ──────────────────────────────────────────────────────────────
const nivelLabel: Record<NivelAcesso, string> = {
  1: "Administrador",
  2: "CFO / Tesoureiro",
  3: "Presidente",
  4: "Secretário Executivo",
  5: "Departamental",
  6: "Assistente",
}

const nivelColor: Record<NivelAcesso, string> = {
  1: "bg-red-100 text-red-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-purple-100 text-purple-700",
  4: "bg-teal-100 text-teal-700",
  5: "bg-orange-100 text-orange-700",
  6: "bg-slate-100 text-slate-600",
}

const mockUsuarios: Usuario[] = [
  { id: 1, nome: "Jefferson Santos", email: "jefferson@ars.org", cpf: "123.456.789-00", funcao: "CFO", departamento: "Tesouraria - Operacional", nivel: 1, ativo: true },
  { id: 2, nome: "Geovane Souza", email: "geovane@ars.org", cpf: "234.567.890-11", funcao: "Presidente", departamento: "Presidência - Operacional", nivel: 3, ativo: true },
  { id: 3, nome: "Lucas Rodrigues", email: "lucas@ars.org", cpf: "345.678.901-22", funcao: "Tesoureiro/CFO", departamento: "Tesouraria - Operacional", nivel: 2, ativo: true },
  { id: 4, nome: "Jonas Aguiar", email: "jonas@ars.org", cpf: "456.789.012-33", funcao: "Secretário Executivo", departamento: "Secretaria - Operacional", nivel: 4, ativo: true },
  { id: 5, nome: "Patrick Marlon", email: "patrick@ars.org", cpf: "567.890.123-44", funcao: "Departamental", departamento: "Evangelismo - Operacional", nivel: 5, ativo: true },
  { id: 6, nome: "Maicon Galantini", email: "maicon@ars.org", cpf: "678.901.234-55", funcao: "Departamental", departamento: "Jovens Adventistas - Operacional", nivel: 5, ativo: true },
  { id: 7, nome: "Raquel Gonçalves", email: "raquel@ars.org", cpf: "789.012.345-66", funcao: "Departamental", departamento: "Ministério da Mulher - Operacional", nivel: 5, ativo: true },
  { id: 8, nome: "Bruno Maia", email: "bruno@ars.org", cpf: "890.123.456-77", funcao: "Departamental", departamento: "Associação Ministerial - Operacional", nivel: 5, ativo: true },
  { id: 9, nome: "Francis Miller", email: "francis@ars.org", cpf: "901.234.567-88", funcao: "Departamental", departamento: "Publicações - Operacional", nivel: 5, ativo: true },
  { id: 10, nome: "Ricardo Trentino", email: "ricardo@ars.org", cpf: "012.345.678-99", funcao: "Departamental", departamento: "Desbravadores - Operacional", nivel: 5, ativo: false },
]

const mockDepartamentos: Departamento[] = [
  { codigo: 0, nome: "Contas Patrimoniais", responsavel: "Jefferson Santos" },
  { codigo: 1, nome: "Não Alocado - Dízimo", responsavel: "Receita" },
  { codigo: 2, nome: "Não Alocado - Não Dízimo", responsavel: "Receita" },
  { codigo: 4, nome: "Não Alocado - Outros", responsavel: "Receita" },
  { codigo: 111111, nome: "Distritais - Folha", responsavel: "Jefferson Santos" },
  { codigo: 111112, nome: "Aspirantes ao Ministério - Folha", responsavel: "Jefferson Santos" },
  { codigo: 111119, nome: "Instrutores Bíblicos - Folha", responsavel: "Jefferson Santos" },
  { codigo: 111411, nome: "Religiosos - Escolas", responsavel: "Jefferson Santos" },
  { codigo: 1114311, nome: "Clínica Rituali", responsavel: "Jefferson Santos" },
  { codigo: 1131111, nome: "Evangelismo Geral", responsavel: "Geovane Souza" },
  { codigo: 11316101, nome: "Evangelismo Grande Escala", responsavel: "Patrick Marlon" },
  { codigo: 11316102, nome: "Novos Clubes", responsavel: "Ricardo Trentino" },
  { codigo: 11316109, nome: "Ministério das Prisões", responsavel: "Patrick Marlon" },
  { codigo: 11316110, nome: "Evangelismo Escola", responsavel: "Patrick Marlon" },
  { codigo: 113162002, nome: "Em Cada Cidade Uma Igreja (MG)", responsavel: "Patrick Marlon" },
  { codigo: 113162003, nome: "Em Cada Cidade Uma Igreja (RJ)", responsavel: "Patrick Marlon" },
  { codigo: 113611, nome: "Evangelismo Rádio, TV e Satélite", responsavel: "Jefferson Santos" },
  { codigo: 1138131, nome: "Centro de Influência - Geral", responsavel: "Giuseppe Alves" },
  { codigo: 114011, nome: "Ação Solidária Adventista - Operacional", responsavel: "Giuseppe Alves" },
  { codigo: 1140121, nome: "ASA - Materiais", responsavel: "Giuseppe Alves" },
  { codigo: 114014, nome: "Ação Solidária Adventista - Mutirão", responsavel: "Giuseppe Alves" },
  { codigo: 114021, nome: "AFAM - Operacional", responsavel: "Raquel Gonçalves" },
  { codigo: 1140231, nome: "AFAM - Concílios e Reuniões Diversas", responsavel: "Raquel Gonçalves" },
  { codigo: 114031, nome: "Associação Ministerial - Operacional", responsavel: "Bruno Maia" },
  { codigo: 1140321, nome: "Associação Ministerial - Materiais", responsavel: "Bruno Maia" },
  { codigo: 1140331, nome: "Associação Ministerial - Concílios", responsavel: "Bruno Maia" },
  { codigo: 114041, nome: "Aventureiros - Operacional", responsavel: "Ricardo Trentino" },
  { codigo: 1140421, nome: "Aventureiros - Materiais", responsavel: "Ricardo Trentino" },
  { codigo: 1140431, nome: "Aventureiros - Concílios e Reuniões", responsavel: "Ricardo Trentino" },
  { codigo: 1140432, nome: "Aventureiros - Convenção", responsavel: "Ricardo Trentino" },
  { codigo: 1140438, nome: "Avt/Escola de Líderes-CTBD-Curso", responsavel: "Ricardo Trentino" },
  { codigo: 114051, nome: "Comunicação - Operacional", responsavel: "Jonas Aguiar" },
  { codigo: 114061, nome: "Desbravadores - Operacional", responsavel: "Ricardo Trentino" },
  { codigo: 1140621, nome: "Desbravadores - Materiais", responsavel: "Ricardo Trentino" },
  { codigo: 1140631, nome: "Desbravadores - Cursos, Concílios", responsavel: "Ricardo Trentino" },
  { codigo: 1140633, nome: "Desbravadores - Convenção", responsavel: "Ricardo Trentino" },
  { codigo: 1140634, nome: "Desbravadores - Escola de Líderes", responsavel: "Ricardo Trentino" },
  { codigo: 1140637, nome: "Desbravadores - Curso", responsavel: "Ricardo Trentino" },
  { codigo: 1140640, nome: "Dbv/Escola de Líderes-CTBD-Curso", responsavel: "Ricardo Trentino" },
  { codigo: 1140642, nome: "Clubão", responsavel: "Ricardo Trentino" },
  { codigo: 1140643, nome: "Ordem Unida", responsavel: "Ricardo Trentino" },
  { codigo: 114071, nome: "Educação - Operacional", responsavel: "Robledo Moraes" },
  { codigo: 1140721, nome: "Educação - Materiais", responsavel: "Robledo Moraes" },
  { codigo: 114081, nome: "Escola Sabatina - Operacional", responsavel: "Giuseppe Alves" },
  { codigo: 1140821, nome: "Escola Sabatina - Materiais", responsavel: "Giuseppe Alves" },
  { codigo: 114091, nome: "Evangelismo - Operacional", responsavel: "Patrick Marlon" },
  { codigo: 1140921, nome: "Evangelismo - Materiais", responsavel: "Patrick Marlon" },
  { codigo: 114101, nome: "Jovens Adventistas - Operacional", responsavel: "Maicon Galantini" },
  { codigo: 1141021, nome: "Jovens Adventistas - Materiais", responsavel: "Maicon Galantini" },
  { codigo: 1141035, nome: "Congresso Jovem", responsavel: "Maicon Galantini" },
  { codigo: 1141036, nome: "Retiro Espiritual", responsavel: "Maicon Galantini" },
  { codigo: 1141071, nome: "Universitários", responsavel: "Maicon Galantini" },
  { codigo: 114111, nome: "Liberdade Religiosa - Operacional", responsavel: "Maicon Galantini" },
  { codigo: 114121, nome: "Ministério do Adolescente - Operacional", responsavel: "Mariana Soares" },
  { codigo: 114131, nome: "Ministério da Criança - Operacional", responsavel: "Mariana Soares" },
  { codigo: 1141321, nome: "Ministério da Criança - Materiais", responsavel: "Mariana Soares" },
  { codigo: 114141, nome: "Ministério da Família - Operacional", responsavel: "Bruno Maia" },
  { codigo: 1141421, nome: "Ministério da Família - Materiais", responsavel: "Bruno Maia" },
  { codigo: 114151, nome: "Ministério da Mulher - Operacional", responsavel: "Raquel Gonçalves" },
  { codigo: 1141521, nome: "Ministério da Mulher - Materiais", responsavel: "Raquel Gonçalves" },
  { codigo: 1141522, nome: "Recepção - Materiais", responsavel: "Raquel Gonçalves" },
  { codigo: 1141551, nome: "Quebrando o Silêncio - Materiais", responsavel: "Raquel Gonçalves" },
  { codigo: 1141571, nome: "Ministério da Recepção", responsavel: "Raquel Gonçalves" },
  { codigo: 114161, nome: "Ministério da Música - Operacional", responsavel: "Maicon Galantini" },
  { codigo: 114171, nome: "Ministério da Saúde - Operacional", responsavel: "Ygor Carvalho" },
  { codigo: 1141721, nome: "Ministério da Saúde - Materiais", responsavel: "Ygor Carvalho" },
  { codigo: 114181, nome: "Ministério Pessoal - Operacional", responsavel: "Giuseppe Alves" },
  { codigo: 1141821, nome: "Ministério Pessoal - Materiais", responsavel: "Giuseppe Alves" },
  { codigo: 1141831, nome: "Ministério Pessoal - Concílios", responsavel: "Giuseppe Alves" },
  { codigo: 114191, nome: "Missão Global - Operacional", responsavel: "Patrick Marlon" },
  { codigo: 114201, nome: "Mordomia Cristã - Operacional", responsavel: "Ygor Carvalho" },
  { codigo: 1142021, nome: "Mordomia Cristã - Materiais", responsavel: "Ygor Carvalho" },
  { codigo: 1142031, nome: "Mordomia Cristã - Concílios e Reuniões", responsavel: "Ygor Carvalho" },
  { codigo: 114211, nome: "Pequenos Grupos - Operacional", responsavel: "Jefferson Santos" },
  { codigo: 114221, nome: "Publicações - Operacional", responsavel: "Francis Miller" },
  { codigo: 1142221, nome: "Publicações - Materiais", responsavel: "Francis Miller" },
  { codigo: 114251, nome: "Espírito de Profecia - Operacional", responsavel: "Francis Miller" },
  { codigo: 114261, nome: "Ministério das Possibilidades", responsavel: "Bruno Maia" },
  { codigo: 114811, nome: "Serviço Voluntário Adventista", responsavel: "Jonas Aguiar" },
  { codigo: 115811, nome: "Projeto Missão Calebe", responsavel: "Maicon Galantini" },
  { codigo: 115891, nome: "Projeto 1 Ano em Missão - OYIM", responsavel: "Maicon Galantini" },
  { codigo: 116211, nome: "Concílio de Pastores", responsavel: "Jefferson Santos" },
  { codigo: 116511, nome: "Treinamento de Pastores", responsavel: "Jefferson Santos" },
  { codigo: 116521, nome: "Treinamento Tesouraria de Igrejas", responsavel: "Lucas Rodrigues" },
  { codigo: 116522, nome: "Treinamento Secretaria de Igrejas", responsavel: "Jonas Aguiar" },
  { codigo: 116523, nome: "Treinamento Ancionato de Igrejas", responsavel: "Bruno Maia" },
  { codigo: 117211, nome: "Igreja Nova Para Todos", responsavel: "Jefferson Santos" },
  { codigo: 117212, nome: "Igreja Nova de Novo", responsavel: "Jefferson Santos" },
  { codigo: 118221, nome: "Auxílio Igrejas e Grupos", responsavel: "Jefferson Santos" },
  { codigo: 11829301, nome: "Projetos Especiais Instituições - Dízimo", responsavel: "Lucas Rodrigues" },
  { codigo: 11829310, nome: "Projetos Operacionais Instituições", responsavel: "Lucas Rodrigues" },
  { codigo: 133121, nome: "Diretor Associado Publicações", responsavel: "Francis Miller" },
  { codigo: 133132, nome: "Assistente 1 - Plano Especial CPB/DSA", responsavel: "Francis Miller" },
  { codigo: 133133, nome: "Assistente 2 - Plano Especial CPB/DSA", responsavel: "Francis Miller" },
  { codigo: 133161, nome: "Faturista - Custo Sels USeB", responsavel: "Francis Miller" },
  { codigo: 1881906, nome: "Fundo Capital Operativo - Dízimo", responsavel: "Lucas Rodrigues" },
  { codigo: 1881913, nome: "Reserva Projetos Especiais - Dízimo", responsavel: "Lucas Rodrigues" },
  { codigo: 1881914, nome: "Fundo Consórcio Financeiro Campos", responsavel: "Jefferson Santos" },
  { codigo: 1881915, nome: "Fundo Formação Novos Ministros", responsavel: "Jefferson Santos" },
  { codigo: 1881916, nome: "Projeto Especial DNA", responsavel: "Jefferson Santos" },
  { codigo: 1881920, nome: "Projeto + Professores Adventistas", responsavel: "Jefferson Santos" },
  { codigo: 1881921, nome: "Projeto + Alunos", responsavel: "Jefferson Santos" },
  { codigo: 1885501, nome: "Mission Trip - Orçamento Institucional", responsavel: "Jonas Aguiar" },
  { codigo: 188691, nome: "MPM - Contribuição Fundo Missionários", responsavel: "Jefferson Santos" },
  { codigo: 325411, nome: "Assembléia de Associação/Missão", responsavel: "Jefferson Santos" },
  { codigo: 325732, nome: "Encontro de Líderes e Oficiais", responsavel: "Jefferson Santos" },
  { codigo: 325821, nome: "Comissões Diretivas - Plenária", responsavel: "Jefferson Santos" },
  { codigo: 32583101, nome: "Grêmio", responsavel: "Jefferson Santos" },
  { codigo: 3258321, nome: "Concílio de Famílias", responsavel: "Bruno Maia" },
  { codigo: 393213, nome: "Arquitetura", responsavel: "Jefferson Santos" },
  { codigo: 393251, nome: "Portaria e Segurança - Folha", responsavel: "Jefferson Santos" },
  { codigo: 3933112, nome: "Rateio Custo Veículos", responsavel: "Jefferson Santos" },
  { codigo: 396011, nome: "Gerenciamento de Igrejas - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396022, nome: "Administração Geral - Operacional", responsavel: "Jefferson Santos" },
  { codigo: 39602910, nome: "Geral", responsavel: "Jefferson Santos" },
  { codigo: 39602912, nome: "Imprevistos e Eventuais", responsavel: "Jefferson Santos" },
  { codigo: 39602916, nome: "Nova Estrutura Técnica - NET", responsavel: "Jefferson Santos" },
  { codigo: 39602917, nome: "CEUSEB", responsavel: "Jefferson Santos" },
  { codigo: 39602918, nome: "Escritório", responsavel: "Jefferson Santos" },
  { codigo: 396061, nome: "Contabilidade - Folha", responsavel: "Jefferson Santos" },
  { codigo: 3960692, nome: "Controladoria - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396081, nome: "Remuneração - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396111, nome: "Recursos Humanos - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396112, nome: "Recursos Humanos - Operacional", responsavel: "Jefferson Santos" },
  { codigo: 396121, nome: "Refeitório Institucional - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396122, nome: "Refeitório Institucional - Operacional", responsavel: "Jefferson Santos" },
  { codigo: 396131, nome: "Secretárias e Assistentes Executivas", responsavel: "Jefferson Santos" },
  { codigo: 396141, nome: "Serviço Manutenção e Limpeza - Folha", responsavel: "Jefferson Santos" },
  { codigo: 3961492, nome: "Zeladoria Igrejas", responsavel: "Jefferson Santos" },
  { codigo: 396161, nome: "TI - Tecnologia da Informação - Folha", responsavel: "Jefferson Santos" },
  { codigo: 3961691, nome: "Desenvolvimento Software/BI", responsavel: "Jefferson Santos" },
  { codigo: 396181, nome: "CATRE - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396182, nome: "CATRE - Operacional", responsavel: "Jefferson Santos" },
  { codigo: 396191, nome: "Jurídico - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396221, nome: "Recepção Institucional - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396242, nome: "Estratégia de RH - Operacional", responsavel: "Jefferson Santos" },
  { codigo: 396261, nome: "Serviços Diversos de Apoio - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396801, nome: "Administração - Folha", responsavel: "Jefferson Santos" },
  { codigo: 39680104, nome: "ADRA - Rio de Janeiro", responsavel: "Jefferson Santos" },
  { codigo: 396804, nome: "Departamentais - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396806, nome: "Assistentes de Tesouraria - Folha", responsavel: "Jefferson Santos" },
  { codigo: 396901, nome: "Auditoria Interna - Folha", responsavel: "Jefferson Santos" },
  { codigo: 397171, nome: "Centro de Mídia - Folha", responsavel: "Jefferson Santos" },
  { codigo: 399111, nome: "Presidência - Operacional", responsavel: "Geovane Souza" },
  { codigo: 3991141, nome: "Presidência - Especial", responsavel: "Geovane Souza" },
  { codigo: 3991142, nome: "Presidência - Materiais", responsavel: "Geovane Souza" },
  { codigo: 399311, nome: "Secretaria - Operacional", responsavel: "Jonas Aguiar" },
  { codigo: 3993142, nome: "Secretaria - Materiais", responsavel: "Jonas Aguiar" },
  { codigo: 399511, nome: "Tesouraria - Operacional", responsavel: "Lucas Rodrigues" },
  { codigo: 3995141, nome: "Tesouraria - Especial", responsavel: "Lucas Rodrigues" },
  { codigo: 3995142, nome: "Tesouraria - Materiais", responsavel: "Lucas Rodrigues" },
  { codigo: 720211, nome: "Contingências - Dízimo", responsavel: "Lucas Rodrigues" },
  { codigo: 909111, nome: "Depreciação/Amortização", responsavel: "Jefferson Santos" },
  { codigo: 910111, nome: "Reserva para Aquisição Ativo", responsavel: "Jefferson Santos" },
  { codigo: 992992, nome: "Fundo Colportagem Assistencial", responsavel: "Francis Miller" },
  { codigo: 900111, nome: "Investido no Ativo Permanente", responsavel: "Jefferson Santos" },
  { codigo: 983001, nome: "Fundo Promoção Colportagem", responsavel: "Francis Miller" },
]

const mockFuncoes: Funcao[] = [
  {
    id: 1,
    nome: "Administrador",
    descricao: "Acesso total ao sistema, incluindo configurações e gerenciamento de usuários.",
    nivel: 1,
    modulos: ["Dashboard", "Orçamento", "Subvenções", "Implementações", "Reuniões", "Decisões", "POP", "Eventos", "Help/IA", "Configurações"],
  },
  {
    id: 2,
    nome: "CFO / Tesoureiro",
    descricao: "Acesso completo aos módulos financeiros e operacionais. Não acessa Configurações.",
    nivel: 2,
    modulos: ["Dashboard", "Orçamento", "Subvenções", "Implementações", "Reuniões", "Decisões", "POP", "Eventos", "Help/IA"],
  },
  {
    id: 3,
    nome: "Presidente",
    descricao: "Visibilidade estratégica de todos os módulos. Acesso de leitura em Configurações.",
    nivel: 3,
    modulos: ["Dashboard", "Orçamento (leitura)", "Subvenções (leitura)", "Implementações", "Reuniões", "Decisões", "POP", "Eventos"],
  },
  {
    id: 4,
    nome: "Secretário Executivo",
    descricao: "Foco em reuniões, atas, decisões e POPs. Leitura restrita nos demais módulos.",
    nivel: 4,
    modulos: ["Dashboard", "Reuniões", "Decisões", "POP", "Eventos (leitura)"],
  },
  {
    id: 5,
    nome: "Departamental",
    descricao: "Visualiza somente o dashboard do próprio departamento e POPs de sua área.",
    nivel: 5,
    modulos: ["Dashboard (depto)", "POP (depto)", "Reuniões (convocadas)"],
  },
  {
    id: 6,
    nome: "Assistente",
    descricao: "Acesso de leitura aos módulos atribuídos pelo Administrador.",
    nivel: 6,
    modulos: ["Dashboard (leitura)", "POP (leitura)"],
  },
]

// ── Utilitários ─────────────────────────────────────────────────────────────
function cpfMask(v: string) {
  return v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function initials(nome: string) {
  return nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()
}

const AVATAR_COLORS = ["#006494", "#1ABC9C", "#9B59B6", "#E67E22", "#E74C3C", "#2ECC71", "#247BA0", "#1B98E0"]
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length] }

// ── Componente principal ────────────────────────────────────────────────────
type Tab = "usuarios" | "acesso" | "departamentos" | "funcoes" | "permissoes" | "atribuicoes" | "marca"

export default function ConfiguracoesPage() {
  const [tab, setTab] = useState<Tab>("acesso")
  const [busca, setBusca] = useState("")
  const [showCpf, setShowCpf] = useState<number | null>(null)
  const [perms, setPerms] = useState<Record<string, Record<string, boolean>>>({})
  const [respMap, setRespMap] = useState<Record<string, string[]>>({})
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [newResp, setNewResp] = useState("")
  const [allResps, setAllResps] = useState<string[]>([])
  const [buscaDepto, setBuscaDepto] = useState("")
  const [logoBase64, setLogoBase64] = useState<string>("")
  const [logoDragOver, setLogoDragOver] = useState(false)
  const [usuarios, setUsuarios] = useState<UsuarioAuth[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editUser, setEditUser] = useState<UsuarioAuth | null>(null)
  const [novoUser, setNovoUser] = useState<Partial<UsuarioAuth>>({ nivel: 5, ativo: true, menus: [] })

  useEffect(() => {
    setPerms(loadPerms())
    const rm = loadRespMap()
    setRespMap(rm)
    const set = new Set([...RESPONSAVEIS_UNICOS, ...Object.values(rm).flat()])
    setAllResps([...set].sort())
    const logo = localStorage.getItem(LOGO_KEY) || ""
    setLogoBase64(logo)
    setUsuarios(getAllUsuarios())
    const sess = getSession()
    setIsAdmin(sess?.nivel === 1)
  }, [])

  function saveExtraUsers(list: UsuarioAuth[]) {
    // Only save non-base users (or overrides) to localStorage
    const baseIds = new Set(USUARIOS_BASE.map(u => u.id))
    const extras = list.filter(u => !baseIds.has(u.id))
    const overrides = list.filter(u => baseIds.has(u.id) && JSON.stringify(u) !== JSON.stringify(USUARIOS_BASE.find(b => b.id === u.id)))
    localStorage.setItem(EXTRA_USERS_KEY, JSON.stringify([...extras, ...overrides]))
    setUsuarios(getAllUsuarios())
  }

  function maskCpf(v: string) {
    const d = v.replace(/\D/g,"").slice(0,11)
    return d.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2")
  }

  function maskData(v: string) {
    const d = v.replace(/\D/g,"").slice(0,8)
    return d.replace(/(\d{2})(\d)/,"$1/$2").replace(/(\d{2})(\d)/,"$1/$2")
  }

  function handleSaveUser() {
    const u = editUser ?? novoUser as UsuarioAuth
    if (!u.nome || !u.cpf || !u.dataNascimento) return
    const newId = u.id ?? `user_${Date.now()}`
    const saved: UsuarioAuth = {
      id: newId, nome: u.nome, email: u.email ?? "", cpf: normalizeCpf(u.cpf),
      dataNascimento: u.dataNascimento ?? "", nivel: u.nivel ?? 5,
      ativo: u.ativo !== false, menus: u.menus ?? [],
    }
    const updated = [...usuarios.filter(x => x.id !== saved.id), saved]
    saveExtraUsers(updated)
    setShowAddUser(false); setEditUser(null); setNovoUser({ nivel: 5, ativo: true, menus: [] })
  }

  function handleDeleteUser(id: string) {
    const updated = usuarios.filter(u => u.id !== id)
    saveExtraUsers(updated)
  }

  function toggleMenu(u: Partial<UsuarioAuth>, href: string) {
    const cur = u.menus ?? []
    return cur.includes(href) ? cur.filter(m => m !== href) : [...cur, href]
  }

  function handleLogoFile(file: File) {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = e => {
      const b64 = e.target?.result as string
      setLogoBase64(b64)
      localStorage.setItem(LOGO_KEY, b64)
    }
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setLogoBase64("")
    localStorage.removeItem(LOGO_KEY)
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "acesso", label: "Usuários / Acesso", icon: Users },
    { id: "departamentos", label: "Departamentos", icon: Building2 },
    { id: "funcoes", label: "Funções e Níveis", icon: ShieldCheck },
    { id: "permissoes", label: "Permissões", icon: Lock },
    { id: "atribuicoes", label: "Atribuições", icon: UserCog },
    { id: "marca", label: "Marca / Logo", icon: ImageIcon },
  ]

  function toggleResp(code: string, resp: string) {
    const cur = respMap[code] || []
    const next = cur.includes(resp) ? cur.filter(r => r !== resp) : [...cur, resp]
    const nm = { ...respMap, [code]: next }
    setRespMap(nm)
    saveRespMapLocal(nm)
  }

  function addNewResp() {
    const r = newResp.trim()
    if (!r || !editingCode) return
    const cur = respMap[editingCode] || []
    if (!cur.includes(r)) {
      const nm = { ...respMap, [editingCode]: [...cur, r] }
      setRespMap(nm)
      saveRespMapLocal(nm)
    }
    if (!allResps.includes(r)) setAllResps(prev => [...prev, r].sort())
    setNewResp("")
  }

  function togglePerm(userId: string, route: string) {
    const p = { ...perms }
    if (!p[userId]) p[userId] = {}
    const current = p[userId][route] !== false
    p[userId] = { ...p[userId], [route]: !current }
    setPerms(p)
    savePerms(p)
  }

  function hasPerm(userId: string, route: string): boolean {
    const up = perms[userId]
    if (!up) return true
    return up[route] !== false
  }

  function grantAll(userId: string) {
    const p = { ...perms, [userId]: Object.fromEntries(ALL_NAV.map(n => [n.href, true])) }
    setPerms(p); savePerms(p)
  }

  function revokeAll(userId: string) {
    const p = { ...perms, [userId]: Object.fromEntries(ALL_NAV.map(n => [n.href, false])) }
    setPerms(p); savePerms(p)
  }

  const filteredUsuarios = mockUsuarios.filter(
    (u) => !busca || u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase())
  )

  const filteredDeptos = mockDepartamentos.filter(
    (d) => !busca || d.nome.toLowerCase().includes(busca.toLowerCase()) || d.responsavel.toLowerCase().includes(busca.toLowerCase()) || String(d.codigo).includes(busca)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
          <p className="text-slate-500 mt-1">Gerenciamento de usuários, departamentos e níveis de acesso</p>
        </div>
        {(tab === "acesso" && isAdmin) && (
          <Button className="gap-2" style={{ backgroundColor: "#006494" }}
            onClick={() => { setShowAddUser(true); setEditUser(null); setNovoUser({ nivel: 5, ativo: true, menus: [] }) }}>
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setBusca("") }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Busca */}
      {tab !== "funcoes" && tab !== "permissoes" && tab !== "atribuicoes" && tab !== "marca" && tab !== "acesso" && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder={tab === "usuarios" ? "Buscar por nome ou e-mail..." : "Buscar por código, nome ou responsável..."}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      )}

      {/* ── Tab: Usuários ──────────────────────────────────────────────────── */}
      {tab === "usuarios" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #D4E8F0" }}>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Usuário</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">CPF (login)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Função</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Nível de Acesso</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-600">Status</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f0f4f6" }}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: avatarColor(u.id) }}
                        >
                          {initials(u.nome)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.nome}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span>{showCpf === u.id ? u.cpf : "•••.•••.•••-••"}</span>
                        <button onClick={() => setShowCpf(showCpf === u.id ? null : u.id)}>
                          {showCpf === u.id
                            ? <EyeOff className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                            : <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                          }
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.funcao}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${nivelColor[u.nivel]}`}>
                        {u.nivel} — {nivelLabel[u.nivel]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.ativo ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {u.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-end">
                        <button className="p-1.5 rounded hover:bg-slate-100">
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 text-xs text-slate-400" style={{ borderTop: "1px solid #D4E8F0" }}>
              {filteredUsuarios.length} usuário(s) encontrado(s)
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tab: Departamentos ─────────────────────────────────────────────── */}
      {tab === "departamentos" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[calc(100vh-340px)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr style={{ borderBottom: "1px solid #D4E8F0" }}>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">Código</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Nome do Departamento</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Responsável</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {filteredDeptos.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f0f4f6" }}>
                      <td className="py-2.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">{d.codigo}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{d.nome}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: avatarColor(d.responsavel.charCodeAt(0)) }}
                          >
                            {d.responsavel.split(" ")[0][0]}
                          </div>
                          <span className="text-slate-600 text-sm">{d.responsavel}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex gap-1 justify-end">
                          <button className="p-1.5 rounded hover:bg-slate-100">
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 text-xs text-slate-400" style={{ borderTop: "1px solid #D4E8F0" }}>
              {filteredDeptos.length} departamento(s) de {mockDepartamentos.length} total
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tab: Funções ───────────────────────────────────────────────────── */}
      {tab === "funcoes" && (
        <div className="space-y-4">
          {/* Info box */}
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#E8F1F2", border: "1px solid #D4E8F0" }}>
            <p className="font-semibold text-slate-700 mb-1">Como funciona o login</p>
            <p className="text-slate-600">O usuário acessa o sistema com seu <strong>e-mail</strong> e <strong>CPF</strong> (sem pontuação). O nível de acesso é definido pela função atribuída.</p>
          </div>

          <div className="grid gap-4">
            {mockFuncoes.map((f) => (
              <Card key={f.id} className="overflow-hidden">
                <div className="h-1 w-full" style={{ backgroundColor: Object.values({ 1: "#E74C3C", 2: "#006494", 3: "#9B59B6", 4: "#1ABC9C", 5: "#E67E22", 6: "#95A5A6" })[f.id - 1] }} />
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${nivelColor[f.nivel]}`}>
                          Nível {f.nivel}
                        </span>
                        <h3 className="font-bold text-slate-800">{f.nome}</h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{f.descricao}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.modulos.map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: "#E8F1F2", color: "#006494" }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button className="p-1.5 rounded hover:bg-slate-100">
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center pt-2">
            Os módulos marcados como "(leitura)" permitem visualização mas não criação ou edição de registros.
          </p>
        </div>
      )}

      {/* ── Tab: Permissões ────────────────────────────────────────────────── */}
      {tab === "permissoes" && (
        <div className="space-y-4">
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#E8F1F2", border: "1px solid #D4E8F0" }}>
            <p className="font-semibold text-slate-700 mb-1">Controle de acesso por menu</p>
            <p className="text-slate-600">Defina quais módulos do menu lateral cada usuário pode acessar. O administrador (Jefferson Santos) sempre tem acesso completo e não pode ser alterado.</p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #D4E8F0" }}>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 whitespace-nowrap sticky left-0 bg-white z-10 min-w-48">Usuário</th>
                      {ALL_NAV.map(n => (
                        <th key={n.href} className="py-3 px-3 font-semibold text-slate-600 text-center whitespace-nowrap">
                          <span className="text-xs">{n.label}</span>
                        </th>
                      ))}
                      <th className="py-3 px-4 text-center font-semibold text-slate-600 whitespace-nowrap text-xs">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsuarios.map(u => {
                      const isAdmin = u.nome.toLowerCase().includes("jefferson")
                      const userId = u.email.split("@")[0]
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f0f4f6" }}>
                          <td className="py-3 px-4 sticky left-0 bg-white">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                style={{ backgroundColor: avatarColor(u.id) }}>
                                {initials(u.nome)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 text-xs leading-tight">{u.nome}</p>
                                {isAdmin && <span className="text-xs text-amber-600 font-medium">Admin</span>}
                              </div>
                            </div>
                          </td>
                          {ALL_NAV.map(n => (
                            <td key={n.href} className="py-3 px-3 text-center">
                              {isAdmin ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: "#1B98E0" }}>
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                              ) : (
                                <button
                                  onClick={() => togglePerm(userId, n.href)}
                                  className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${hasPerm(userId, n.href) ? "" : "bg-slate-200"}`}
                                  style={hasPerm(userId, n.href) ? { backgroundColor: "#1B98E0" } : {}}
                                  title={hasPerm(userId, n.href) ? "Remover acesso" : "Conceder acesso"}
                                >
                                  <span
                                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${hasPerm(userId, n.href) ? "left-5" : "left-0.5"}`}
                                  />
                                </button>
                              )}
                            </td>
                          ))}
                          <td className="py-3 px-4 text-center">
                            {!isAdmin && (
                              <div className="flex gap-1 justify-center">
                                <button onClick={() => grantAll(userId)}
                                  className="px-2 py-1 text-xs rounded font-medium text-white transition-colors"
                                  style={{ backgroundColor: "#006494" }}>
                                  Todos
                                </button>
                                <button onClick={() => revokeAll(userId)}
                                  className="px-2 py-1 text-xs rounded font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                  Nenhum
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 text-xs text-slate-400" style={{ borderTop: "1px solid #D4E8F0" }}>
                Alterações são salvas automaticamente no navegador. Usuários afetados precisam recarregar a página.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Acesso / Login ────────────────────────────────────────────── */}
      {tab === "acesso" && (
        <div className="space-y-4">
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#E8F1F2", border: "1px solid #D4E8F0" }}>
            <p className="font-semibold text-slate-700 mb-1">Gerenciamento de acesso ao sistema</p>
            <p className="text-slate-600">Cadastre usuários com CPF e data de nascimento. O login é feito com essas credenciais. Defina quais menus cada usuário pode acessar.</p>
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={() => { setShowAddUser(true); setEditUser(null); setNovoUser({ nivel: 5, ativo: true, menus: [] }) }}
                className="gap-2" style={{ backgroundColor: "#006494" }}>
                <Plus className="w-4 h-4" />Novo Usuário
              </Button>
            </div>
          )}

          {/* Modal add/edit */}
          {(showAddUser || editUser) && (() => {
            const u = editUser ?? novoUser
            function updateU(updates: Partial<UsuarioAuth>) {
              if (editUser) {
                setEditUser(prev => prev ? { ...prev, ...updates } : null)
              } else {
                setNovoUser(prev => ({ ...prev, ...updates }))
              }
            }
            const ALL_MENUS = [
              { href: "/dashboard", label: "Dashboard" },
              { href: "/orcamento", label: "Orçamento" },
              { href: "/make-a-budget", label: "Make a Budget" },
              { href: "/subvencoes", label: "Subvenções" },
              { href: "/implementacoes", label: "Implementações" },
              { href: "/reunioes", label: "Reuniões" },
              { href: "/decisoes", label: "Decisões" },
              { href: "/pop", label: "POP" },
              { href: "/eventos", label: "Eventos" },
              { href: "/help", label: "Help / Base IA" },
              { href: "/configuracoes", label: "Configurações" },
            ]
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h3 className="text-sm font-bold mb-4" style={{ color: "#13293D" }}>
                    {editUser ? "Editar Usuário" : "Novo Usuário"}
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-slate-600 block mb-1">Nome completo *</label>
                        <input value={u.nome ?? ""} onChange={e => updateU({ nome: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="Nome completo" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">CPF *</label>
                        <input value={u.cpf ?? ""} onChange={e => updateU({ cpf: maskCpf(e.target.value) })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" placeholder="000.000.000-00" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">Data de Nascimento *</label>
                        <input value={u.dataNascimento ?? ""} onChange={e => updateU({ dataNascimento: maskData(e.target.value) })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" placeholder="DD/MM/AAAA" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">E-mail</label>
                        <input value={u.email ?? ""} onChange={e => updateU({ email: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="email@ars.org" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">Nível de acesso</label>
                        <select value={u.nivel ?? 5} onChange={e => updateU({ nivel: Number(e.target.value) as NivelAcesso })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400">
                          {Object.entries(NIVEL_LABEL).map(([n, l]) => (
                            <option key={n} value={n}>{n} — {l}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-2">Menus permitidos</label>
                      <p className="text-xs text-slate-400 mb-2">Se nenhum for selecionado, o usuário terá acesso a todos (somente nível 1).</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {ALL_MENUS.map(m => {
                          const active = (u.menus ?? []).includes(m.href)
                          return (
                            <button key={m.href} type="button"
                              onClick={() => updateU({ menus: toggleMenu(u, m.href) })}
                              className="text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 border transition-all"
                              style={{ borderColor: active ? "#006494" : "#E2E8F0", background: active ? "#E8F1F2" : "#F8FAFC", color: active ? "#006494" : "#64748B", fontWeight: active ? 600 : 400 }}>
                              <span className="w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center"
                                style={{ borderColor: active ? "#006494" : "#CBD5E1", background: active ? "#006494" : "transparent" }}>
                                {active && <span className="text-white text-xs leading-none">✓</span>}
                              </span>
                              {m.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input type="checkbox" id="ativo" checked={u.ativo !== false}
                        onChange={e => updateU({ ativo: e.target.checked })} />
                      <label htmlFor="ativo" className="text-sm text-slate-600">Usuário ativo</label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5">
                    <button onClick={() => { setShowAddUser(false); setEditUser(null) }}
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancelar</button>
                    <button onClick={handleSaveUser}
                      className="flex-1 px-3 py-2 text-sm rounded-lg text-white font-medium"
                      style={{ background: "#006494" }}>Salvar</button>
                  </div>
                </div>
              </div>
            )
          })()}

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #D4E8F0" }}>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Usuário</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">CPF</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Nasc.</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Nível</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Menus</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">Status</th>
                    {isAdmin && <th className="py-3 px-4" />}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f0f4f6" }}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: `linear-gradient(135deg, #1B98E0, #006494)` }}>
                            {u.nome.split(" ").slice(0,2).map(p=>p[0]).join("")}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm leading-none">{u.nome}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">
                        {u.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4")}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{u.dataNascimento}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {u.nivel} — {NIVEL_LABEL[u.nivel]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {u.menus.length === 0 ? <span className="text-amber-600 font-medium">Todos (admin)</span>
                          : `${u.menus.length} menu(s)`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.ativo ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                          {u.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => setEditUser({ ...u })} className="p-1.5 rounded hover:bg-slate-100">
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                            {!USUARIOS_BASE.find(b => b.id === u.id) && (
                              <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 rounded hover:bg-red-50">
                                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 text-xs text-slate-400" style={{ borderTop: "1px solid #D4E8F0" }}>
                {usuarios.length} usuário(s) cadastrado(s) · Login via CPF + Data de Nascimento
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Marca / Logo ──────────────────────────────────────────────── */}
      {tab === "marca" && (
        <div className="space-y-4 max-w-lg">
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#E8F1F2", border: "1px solid #D4E8F0" }}>
            <p className="font-semibold text-slate-700 mb-1">Identidade Visual</p>
            <p className="text-slate-600">Faça upload da logo da Associação para que ela apareça nos cabeçalhos dos relatórios PDF exportados.</p>
          </div>

          {/* Drop zone */}
          <div
            className="rounded-xl border-2 border-dashed transition-colors"
            style={{ borderColor: logoDragOver ? "#006494" : "#CBD5E1", background: logoDragOver ? "#E8F1F2" : "#F8FAFC" }}
            onDragOver={e => { e.preventDefault(); setLogoDragOver(true) }}
            onDragLeave={() => setLogoDragOver(false)}
            onDrop={e => { e.preventDefault(); setLogoDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleLogoFile(f) }}
          >
            {logoBase64 ? (
              <div className="p-6 flex flex-col items-center gap-4">
                <div className="relative">
                  <img src={logoBase64} alt="Logo" className="max-h-32 max-w-xs object-contain rounded-lg" style={{ border: "1px solid #E2E8F0" }} />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "#DC2626" }}
                    title="Remover logo"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <p className="text-xs text-slate-500">Logo carregada com sucesso. Arraste uma nova imagem ou clique em "Trocar Logo" para substituir.</p>
                <label className="cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ background: "#006494" }}>
                  <Upload className="w-4 h-4 inline mr-1.5" />
                  Trocar Logo
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }} />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer p-8 flex flex-col items-center gap-3 w-full">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "#E8F1F2" }}>
                  <Upload className="w-7 h-7" style={{ color: "#006494" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">Arraste a logo aqui ou clique para selecionar</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG — recomendado fundo transparente ou branco</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }} />
              </label>
            )}
          </div>

          {logoBase64 && (
            <div className="rounded-xl p-4" style={{ background: "#13293D" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "#1B98E0" }}>Preview — como aparecerá nos relatórios PDF</p>
              <div className="flex items-center gap-3 pb-3" style={{ borderBottom: "3px solid #006494" }}>
                <img src={logoBase64} alt="Logo" className="h-12 object-contain" />
                <div>
                  <p className="text-xs text-white font-bold">Associação Rio Sul da IASD</p>
                  <p className="text-xs" style={{ color: "#1B98E0" }}>Relatório Financeiro · 2026</p>
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: "#64748B" }}>A logo é armazenada localmente no navegador.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Atribuições ───────────────────────────────────────────────── */}
      {tab === "atribuicoes" && (() => {
        const allDepts = ORCAMENTO_2026.map(d => ({ codigo: d.codigo, nome: d.nome }))
        const filteredDepts = allDepts.filter(d =>
          !buscaDepto || d.nome.toLowerCase().includes(buscaDepto.toLowerCase()) || d.codigo.includes(buscaDepto)
        )
        const editingDept = editingCode ? allDepts.find(d => d.codigo === editingCode) : null
        const curResps = editingCode ? (respMap[editingCode] || []) : []

        return (
          <div className="space-y-3">
            <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#E8F1F2", border: "1px solid #D4E8F0" }}>
              <p className="font-semibold text-slate-700 mb-1">Responsáveis por departamento</p>
              <p className="text-slate-600">Selecione um departamento na lista para editar seus responsáveis. Um departamento pode ter um ou mais responsáveis.</p>
            </div>

            <div className="grid grid-cols-2 gap-4" style={{ height: "calc(100vh - 320px)", minHeight: "480px" }}>
              {/* Left — dept list */}
              <Card className="flex flex-col overflow-hidden">
                <div className="p-3 border-b shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                      placeholder="Buscar departamento ou código…"
                      value={buscaDepto}
                      onChange={e => setBuscaDepto(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{filteredDepts.length} departamento(s)</p>
                </div>
                <div className="overflow-y-auto flex-1" style={{ minHeight: 0 }}>
                  {filteredDepts.map(d => {
                    const resps = respMap[d.codigo] || []
                    const isSelected = editingCode === d.codigo
                    return (
                      <button
                        key={d.codigo}
                        onClick={() => setEditingCode(isSelected ? null : d.codigo)}
                        className="w-full text-left px-4 py-3 border-b border-slate-50 transition-colors hover:bg-slate-50"
                        style={isSelected ? { backgroundColor: "#E8F1F2" } : {}}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-mono text-slate-400">{d.codigo}</p>
                            <p className="text-sm font-medium text-slate-800 truncate">{d.nome}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            {resps.length === 0
                              ? <span className="text-xs text-slate-300">—</span>
                              : resps.map(r => (
                                <span key={r} className="block text-xs font-medium" style={{ color: "#006494" }}>
                                  {r.split(" ")[0]}
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>

              {/* Right — edit panel */}
              <Card className="flex flex-col overflow-hidden">
                {editingDept ? (
                  <>
                    <div className="px-4 py-3 border-b shrink-0" style={{ backgroundColor: "#F8FAFB" }}>
                      <p className="text-xs font-mono text-slate-400">{editingDept.codigo}</p>
                      <p className="text-sm font-bold text-slate-800">{editingDept.nome}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {curResps.length === 0 ? "Nenhum responsável atribuído" : `${curResps.length} responsável(is)`}
                      </p>
                    </div>

                    <div className="overflow-y-auto flex-1 p-4 space-y-1" style={{ minHeight: 0 }}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Selecionar responsável(is)</p>
                      {allResps.map(r => {
                        const active = curResps.includes(r)
                        return (
                          <button
                            key={r}
                            onClick={() => toggleResp(editingCode!, r)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-colors hover:bg-slate-50"
                            style={active ? { backgroundColor: "#E8F1F2" } : {}}
                          >
                            <span
                              className="w-4 h-4 rounded border shrink-0 flex items-center justify-center"
                              style={active ? { backgroundColor: "#006494", borderColor: "#006494" } : { borderColor: "#CBD5E1" }}
                            >
                              {active && <span className="text-white text-xs font-bold leading-none">✓</span>}
                            </span>
                            <span style={active ? { color: "#006494", fontWeight: 600 } : {}}>{r}</span>
                          </button>
                        )
                      })}

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Cadastrar novo responsável</p>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                            placeholder="Nome completo…"
                            value={newResp}
                            onChange={e => setNewResp(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && addNewResp()}
                          />
                          <button
                            onClick={addNewResp}
                            className="px-4 py-1.5 text-sm text-white rounded-lg font-medium"
                            style={{ backgroundColor: "#006494" }}
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center">
                    <div>
                      <UserCog className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-500">Selecione um departamento</p>
                      <p className="text-xs text-slate-400 mt-1">para editar seus responsáveis</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
