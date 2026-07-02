"use client"

import { useState, useEffect } from "react"
import { getSession } from "@/lib/auth"
import {
  Palmtree, AlertTriangle, Clock, CheckCircle2, Calendar,
  Search, X, Edit2, Save, AlertCircle, Stethoscope, Pencil,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PeriodoAgendado {
  dias: number
  inicio: string | null
  abono: boolean
  inicioGozo: string | null
}

interface Colaborador {
  id: string
  cod: string
  empresa: "3311" | "3321" | "3313"
  nome: string
  proximoPeriodoAberto: string
  periodoAquisitivo: string
  diasDobro: number
  diasVenc: number
  diasVencidos: number
  limDiasVenc: string
  periodos: PeriodoAgendado[]
  idade: number
  historicoImportado?: string
}

interface NegociacaoFerias {
  colaboradorId: string
  inicio: string
  fim: string
  abono: boolean
  diasAbono: number
  inicioGozo: string
  dias: number
  observacao: string
  criadoEm: string
}

interface LicencaMedica {
  colaboradorId: string
  nota: string
  desde: string
}

interface OverrideColaborador {
  colaboradorId: string
  periodoAquisitivo?: string
  limDiasVenc?: string
  diasVenc?: number
  diasVencidos?: number
  nota?: string
  atualizadoEm: string
}

// ─── Dados iniciais dos PDFs ───────────────────────────────────────────────────

const DADOS_INICIAIS: Colaborador[] = [
  // === 3311 ===
  { id:"3311-1644", cod:"1644", empresa:"3311", nome:"Daniel Mariano da Silva",         proximoPeriodoAberto:"02/07/2020", periodoAquisitivo:"01/07/2021", diasDobro:0,  diasVenc:30, diasVencidos:30, limDiasVenc:"01/06/2022", periodos:[], idade:55, historicoImportado:"08/06/2026" },
  { id:"3311-163",  cod:"163",  empresa:"3311", nome:"Daniely Ferreira Mello",           proximoPeriodoAberto:"15/02/2023", periodoAquisitivo:"14/02/2024", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"14/01/2025", periodos:[], idade:38, historicoImportado:"08/06/2026" },
  { id:"3311-1775", cod:"1775", empresa:"3311", nome:"Cleber Tavares Silva Eler",        proximoPeriodoAberto:"07/06/2023", periodoAquisitivo:"06/06/2024", diasDobro:60, diasVenc:30, diasVencidos:0,  limDiasVenc:"06/05/2025", periodos:[], idade:49, historicoImportado:"08/06/2026" },
  { id:"3311-1100", cod:"1100", empresa:"3311", nome:"Silvio Denante Spinola",           proximoPeriodoAberto:"11/06/2023", periodoAquisitivo:"10/06/2024", diasDobro:60, diasVenc:30, diasVencidos:0,  limDiasVenc:"10/05/2025", periodos:[], idade:64, historicoImportado:"08/06/2026" },
  { id:"3311-1865", cod:"1865", empresa:"3311", nome:"Levi Jose Silveira da Silva",      proximoPeriodoAberto:"16/08/2024", periodoAquisitivo:"15/08/2025", diasDobro:0,  diasVenc:15, diasVencidos:0,  limDiasVenc:"15/07/2026", periodos:[], idade:20, historicoImportado:"08/06/2026" },
  { id:"3311-1595", cod:"1595", empresa:"3311", nome:"Maria José da Silva Ferreira",     proximoPeriodoAberto:"15/09/2024", periodoAquisitivo:"14/09/2025", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"14/08/2026", periodos:[{ dias:30, inicio:"01/07/2026", abono:false, inicioGozo:null }], idade:57, historicoImportado:"08/06/2026" },
  { id:"3311-13163",cod:"13163",empresa:"3311", nome:"Admilson Donizete de Paula",       proximoPeriodoAberto:"18/09/2024", periodoAquisitivo:"17/09/2025", diasDobro:0,  diasVenc:15, diasVencidos:0,  limDiasVenc:"17/08/2026", periodos:[], idade:33, historicoImportado:"08/06/2026" },
  { id:"3311-1720", cod:"1720", empresa:"3311", nome:"Francisco Alberto Barros",         proximoPeriodoAberto:"23/09/2024", periodoAquisitivo:"22/09/2025", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"22/08/2026", periodos:[{ dias:20, inicio:"13/07/2026", abono:false, inicioGozo:null },{ dias:10, inicio:"02/07/2026", abono:true, inicioGozo:null }], idade:51, historicoImportado:"08/06/2026" },
  { id:"3311-1774", cod:"1774", empresa:"3311", nome:"Odilon Augusto Ricardo",           proximoPeriodoAberto:"19/11/2024", periodoAquisitivo:"18/11/2025", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"18/10/2026", periodos:[{ dias:15, inicio:"17/08/2026", abono:false, inicioGozo:null },{ dias:15, inicio:"13/10/2026", abono:false, inicioGozo:null }], idade:46, historicoImportado:"08/06/2026" },
  { id:"3311-1862", cod:"1862", empresa:"3311", nome:"Lucas de Godoy da Silva",          proximoPeriodoAberto:"01/12/2024", periodoAquisitivo:"30/11/2025", diasDobro:0,  diasVenc:15, diasVencidos:0,  limDiasVenc:"30/10/2026", periodos:[], idade:23, historicoImportado:"08/06/2026" },
  { id:"3311-1198", cod:"1198", empresa:"3311", nome:"Marcelo de Carvalho da Silva",     proximoPeriodoAberto:"01/01/2025", periodoAquisitivo:"31/12/2025", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"30/11/2026", periodos:[{ dias:20, inicio:"14/09/2026", abono:false, inicioGozo:null },{ dias:10, inicio:"04/09/2026", abono:true, inicioGozo:null }], idade:52, historicoImportado:"08/06/2026" },
  { id:"3311-13156",cod:"13156",empresa:"3311", nome:"Matheus Fernando da Silva",        proximoPeriodoAberto:"02/01/2025", periodoAquisitivo:"01/01/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"01/12/2026", periodos:[{ dias:15, inicio:"16/07/2026", abono:false, inicioGozo:null },{ dias:15, inicio:"14/12/2026", abono:false, inicioGozo:null }], idade:31, historicoImportado:"08/06/2026" },
  { id:"3311-1717", cod:"1717", empresa:"3311", nome:"Edjania Alves de Melo",            proximoPeriodoAberto:"03/01/2025", periodoAquisitivo:"02/01/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"02/12/2026", periodos:[], idade:52, historicoImportado:"08/06/2026" },
  { id:"3311-1850", cod:"1850", empresa:"3311", nome:"Djones Costa Teixeira",            proximoPeriodoAberto:"18/01/2025", periodoAquisitivo:"17/01/2026", diasDobro:0,  diasVenc:20, diasVencidos:0,  limDiasVenc:"17/12/2026", periodos:[{ dias:10, inicio:"18/05/2026", abono:false, inicioGozo:null },{ dias:20, inicio:"19/10/2026", abono:false, inicioGozo:null }], idade:34, historicoImportado:"08/06/2026" },
  { id:"3311-1847", cod:"1847", empresa:"3311", nome:"Danylo Wesley Duarte",             proximoPeriodoAberto:"19/01/2025", periodoAquisitivo:"18/01/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"18/12/2026", periodos:[], idade:24, historicoImportado:"08/06/2026" },
  { id:"3311-1848", cod:"1848", empresa:"3311", nome:"Luana de Souza Duarte",            proximoPeriodoAberto:"19/01/2025", periodoAquisitivo:"18/01/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"18/12/2026", periodos:[], idade:32, historicoImportado:"08/06/2026" },
  { id:"3311-1773", cod:"1773", empresa:"3311", nome:"Mariana Soares dos Santos",        proximoPeriodoAberto:"21/01/2025", periodoAquisitivo:"20/01/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"20/12/2026", periodos:[{ dias:30, inicio:"01/12/2026", abono:false, inicioGozo:null }], idade:42, historicoImportado:"08/06/2026" },
  { id:"3311-13125",cod:"13125",empresa:"3311", nome:"Ceandreson Dias Amaro",            proximoPeriodoAberto:"01/02/2025", periodoAquisitivo:"31/01/2026", diasDobro:0,  diasVenc:20, diasVencidos:0,  limDiasVenc:"31/12/2026", periodos:[], idade:36, historicoImportado:"08/06/2026" },
  { id:"3311-1829", cod:"1829", empresa:"3311", nome:"Yago Jose da Silveira Silva",      proximoPeriodoAberto:"01/02/2025", periodoAquisitivo:"31/01/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"31/12/2026", periodos:[{ dias:20, inicio:"22/06/2026", abono:false, inicioGozo:null },{ dias:10, inicio:"13/07/2026", abono:true, inicioGozo:null }], idade:21, historicoImportado:"08/06/2026" },
  { id:"3311-1849", cod:"1849", empresa:"3311", nome:"Matheus Rodrigues da Silva",       proximoPeriodoAberto:"05/02/2025", periodoAquisitivo:"04/02/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"04/01/2027", periodos:[], idade:35, historicoImportado:"08/06/2026" },
  { id:"3311-1846", cod:"1846", empresa:"3311", nome:"Brayan Sabino da Silva",           proximoPeriodoAberto:"12/02/2025", periodoAquisitivo:"11/02/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"11/01/2027", periodos:[], idade:28, historicoImportado:"08/06/2026" },
  { id:"3311-1855", cod:"1855", empresa:"3311", nome:"Jefferson de Sousa Santos",        proximoPeriodoAberto:"24/02/2025", periodoAquisitivo:"23/02/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"23/01/2027", periodos:[], idade:37, historicoImportado:"08/06/2026" },
  { id:"3311-1789", cod:"1789", empresa:"3311", nome:"Raquel Gonçalves Leite de Souza", proximoPeriodoAberto:"01/03/2025", periodoAquisitivo:"28/02/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"28/01/2027", periodos:[{ dias:30, inicio:"01/12/2026", abono:false, inicioGozo:null }], idade:54, historicoImportado:"08/06/2026" },
  { id:"3311-1726", cod:"1726", empresa:"3311", nome:"Raimundo Francisco da Silva",      proximoPeriodoAberto:"09/03/2025", periodoAquisitivo:"08/03/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"08/02/2027", periodos:[], idade:51, historicoImportado:"08/06/2026" },
  { id:"3311-13162",cod:"13162",empresa:"3311", nome:"Gabrielle Silva Pereira",          proximoPeriodoAberto:"17/03/2025", periodoAquisitivo:"16/03/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"16/02/2027", periodos:[], idade:29, historicoImportado:"08/06/2026" },
  { id:"3311-13143",cod:"13143",empresa:"3311", nome:"Esli Victorio Garcia",             proximoPeriodoAberto:"06/04/2025", periodoAquisitivo:"05/04/2026", diasDobro:0,  diasVenc:15, diasVencidos:0,  limDiasVenc:"05/03/2027", periodos:[{ dias:15, inicio:"14/01/2027", abono:false, inicioGozo:null }], idade:46, historicoImportado:"08/06/2026" },
  { id:"3311-1276", cod:"1276", empresa:"3311", nome:"Noemi Conceição Lino da Silva",    proximoPeriodoAberto:"19/04/2025", periodoAquisitivo:"18/04/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"18/03/2027", periodos:[{ dias:30, inicio:"22/06/2026", abono:false, inicioGozo:null }], idade:38, historicoImportado:"08/06/2026" },
  { id:"3311-13123",cod:"13123",empresa:"3311", nome:"Marcelo de Paiva Silva",           proximoPeriodoAberto:"24/04/2025", periodoAquisitivo:"23/04/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"23/03/2027", periodos:[], idade:55, historicoImportado:"08/06/2026" },
  { id:"3311-1842", cod:"1842", empresa:"3311", nome:"Suzana Silva dos Santos",          proximoPeriodoAberto:"24/04/2025", periodoAquisitivo:"23/04/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"23/03/2027", periodos:[], idade:35, historicoImportado:"08/06/2026" },
  { id:"3311-1864", cod:"1864", empresa:"3311", nome:"Gustavo Schulz de Oliveira",       proximoPeriodoAberto:"05/05/2025", periodoAquisitivo:"04/05/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"04/04/2027", periodos:[], idade:25, historicoImportado:"08/06/2026" },
  { id:"3311-1676", cod:"1676", empresa:"3311", nome:"Anete de Freitas Cruz",            proximoPeriodoAberto:"03/06/2025", periodoAquisitivo:"02/06/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"02/05/2027", periodos:[], idade:63, historicoImportado:"08/06/2026" },
  { id:"3311-1677", cod:"1677", empresa:"3311", nome:"Perola Eduarda de Carvalho",       proximoPeriodoAberto:"03/06/2025", periodoAquisitivo:"02/06/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"02/05/2027", periodos:[], idade:26, historicoImportado:"08/06/2026" },
  { id:"3311-13148",cod:"13148",empresa:"3311", nome:"Marinaldo Santana do Nascimento",  proximoPeriodoAberto:"01/07/2025", periodoAquisitivo:"30/06/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"30/05/2027", periodos:[], idade:38, historicoImportado:"08/06/2026" },
  { id:"3311-1702", cod:"1702", empresa:"3311", nome:"Mateus Lourenço Fernandes",        proximoPeriodoAberto:"01/07/2025", periodoAquisitivo:"30/06/2026", diasDobro:30, diasVenc:30, diasVencidos:0,  limDiasVenc:"30/05/2027", periodos:[], idade:27, historicoImportado:"08/06/2026" },
  { id:"3311-1827", cod:"1827", empresa:"3311", nome:"Luiz Fernando Ferreira",           proximoPeriodoAberto:"04/07/2025", periodoAquisitivo:"03/07/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"03/06/2027", periodos:[{ dias:30, inicio:"01/07/2026", abono:false, inicioGozo:null }], idade:54, historicoImportado:"08/06/2026" },
  { id:"3311-1752", cod:"1752", empresa:"3311", nome:"Bruna da Silva Pereira Costa",     proximoPeriodoAberto:"01/08/2025", periodoAquisitivo:"31/07/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"30/06/2027", periodos:[], idade:36, historicoImportado:"08/06/2026" },
  { id:"3311-1324", cod:"1324", empresa:"3311", nome:"Cleuza Ferraz Gomes",              proximoPeriodoAberto:"01/08/2025", periodoAquisitivo:"31/07/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"30/06/2027", periodos:[], idade:47, historicoImportado:"08/06/2026" },
  { id:"3311-13153",cod:"13153",empresa:"3311", nome:"Ellen White Machado",              proximoPeriodoAberto:"04/08/2025", periodoAquisitivo:"03/08/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"03/07/2027", periodos:[], idade:20, historicoImportado:"08/06/2026" },
  { id:"3311-13154",cod:"13154",empresa:"3311", nome:"Sofia Cruz Silva",                 proximoPeriodoAberto:"04/08/2025", periodoAquisitivo:"03/08/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"03/07/2027", periodos:[], idade:18, historicoImportado:"08/06/2026" },
  { id:"3311-13152",cod:"13152",empresa:"3311", nome:"Vitoria Lais Mendes Dantas",       proximoPeriodoAberto:"04/08/2025", periodoAquisitivo:"03/08/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"03/07/2027", periodos:[], idade:20, historicoImportado:"08/06/2026" },
  { id:"3311-13157",cod:"13157",empresa:"3311", nome:"Jonatas dos Santos Moises",        proximoPeriodoAberto:"18/08/2025", periodoAquisitivo:"17/08/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"17/07/2027", periodos:[], idade:19, historicoImportado:"08/06/2026" },
  { id:"3311-13160",cod:"13160",empresa:"3311", nome:"Adla Ribeiro Sousa Santos",        proximoPeriodoAberto:"26/08/2025", periodoAquisitivo:"25/08/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"25/07/2027", periodos:[], idade:35, historicoImportado:"08/06/2026" },
  { id:"3311-1689", cod:"1689", empresa:"3311", nome:"Calpa Rodrigues de Castro",        proximoPeriodoAberto:"03/09/2025", periodoAquisitivo:"02/09/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"02/08/2027", periodos:[], idade:58, historicoImportado:"08/06/2026" },
  { id:"3311-1851", cod:"1851", empresa:"3311", nome:"Isabelle da Motta Sampaio",        proximoPeriodoAberto:"03/09/2025", periodoAquisitivo:"02/09/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"02/08/2027", periodos:[], idade:36, historicoImportado:"08/06/2026" },
  { id:"3311-1230", cod:"1230", empresa:"3311", nome:"Jose Custodio da Silva",           proximoPeriodoAberto:"03/09/2025", periodoAquisitivo:"02/09/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"02/08/2027", periodos:[{ dias:30, inicio:"30/12/2026", abono:false, inicioGozo:null }], idade:61, historicoImportado:"08/06/2026" },
  { id:"3311-1805", cod:"1805", empresa:"3311", nome:"Maria Aparecida Mendes",           proximoPeriodoAberto:"16/09/2025", periodoAquisitivo:"15/09/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"15/08/2027", periodos:[], idade:56, historicoImportado:"08/06/2026" },
  { id:"3311-1863", cod:"1863", empresa:"3311", nome:"Heloisa Gomes de Paula",           proximoPeriodoAberto:"01/10/2025", periodoAquisitivo:"30/09/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"30/08/2027", periodos:[], idade:31, historicoImportado:"08/06/2026" },
  { id:"3311-1649", cod:"1649", empresa:"3311", nome:"Deividy Marcilio Toledo",          proximoPeriodoAberto:"08/10/2025", periodoAquisitivo:"07/10/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"07/09/2027", periodos:[], idade:30, historicoImportado:"08/06/2026" },
  { id:"3311-1650", cod:"1650", empresa:"3311", nome:"Alex Damião Moraes Oliveira",      proximoPeriodoAberto:"16/10/2025", periodoAquisitivo:"15/10/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"15/09/2027", periodos:[], idade:44, historicoImportado:"08/06/2026" },
  { id:"3311-1853", cod:"1853", empresa:"3311", nome:"Rosangela de Almeida",             proximoPeriodoAberto:"20/10/2025", periodoAquisitivo:"19/10/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"19/09/2027", periodos:[], idade:54, historicoImportado:"08/06/2026" },
  { id:"3311-1749", cod:"1749", empresa:"3311", nome:"Joao Marcos da Silva",             proximoPeriodoAberto:"04/11/2025", periodoAquisitivo:"03/11/2026", diasDobro:0,  diasVenc:20, diasVencidos:0,  limDiasVenc:"03/10/2027", periodos:[{ dias:30, inicio:"30/12/2026", abono:true, inicioGozo:null }], idade:58, historicoImportado:"08/06/2026" },
  { id:"3311-13122",cod:"13122",empresa:"3311", nome:"Breno da Silva Maravilha",         proximoPeriodoAberto:"11/11/2025", periodoAquisitivo:"10/11/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"10/10/2027", periodos:[], idade:22, historicoImportado:"08/06/2026" },
  { id:"3311-1856", cod:"1856", empresa:"3311", nome:"Maria das Dores Pereira",          proximoPeriodoAberto:"19/11/2025", periodoAquisitivo:"18/11/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"18/10/2027", periodos:[], idade:50, historicoImportado:"08/06/2026" },
  { id:"3311-1541", cod:"1541", empresa:"3311", nome:"Sirlene Maria de Souza",           proximoPeriodoAberto:"01/12/2025", periodoAquisitivo:"30/11/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"30/10/2027", periodos:[], idade:63, historicoImportado:"08/06/2026" },
  { id:"3311-1640", cod:"1640", empresa:"3311", nome:"Anderson Demetrio",                proximoPeriodoAberto:"05/01/2026", periodoAquisitivo:"04/01/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"04/12/2027", periodos:[], idade:49, historicoImportado:"08/06/2026" },
  { id:"3311-1758", cod:"1758", empresa:"3311", nome:"Iale Clitias Azevedo Oliveira",    proximoPeriodoAberto:"12/01/2026", periodoAquisitivo:"11/01/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"11/12/2027", periodos:[], idade:45, historicoImportado:"08/06/2026" },
  { id:"3311-1845", cod:"1845", empresa:"3311", nome:"Leandro Ramon Pereira de Lima",    proximoPeriodoAberto:"15/01/2026", periodoAquisitivo:"14/01/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"14/12/2027", periodos:[{ dias:30, inicio:"01/06/2026", abono:false, inicioGozo:null }], idade:35, historicoImportado:"08/06/2026" },
  { id:"3311-1859", cod:"1859", empresa:"3311", nome:"Lucas da Mata Barbosa",            proximoPeriodoAberto:"19/01/2026", periodoAquisitivo:"18/01/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"18/12/2027", periodos:[], idade:28, historicoImportado:"08/06/2026" },
  { id:"3311-1610", cod:"1610", empresa:"3311", nome:"Andreza da Silva Mendonça",        proximoPeriodoAberto:"24/01/2026", periodoAquisitivo:"23/01/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"23/12/2027", periodos:[], idade:38, historicoImportado:"08/06/2026" },
  { id:"3311-1860", cod:"1860", empresa:"3311", nome:"Nathaly Cristina de Oliveira",     proximoPeriodoAberto:"23/02/2026", periodoAquisitivo:"22/02/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"22/01/2028", periodos:[], idade:20, historicoImportado:"08/06/2026" },
  { id:"3311-1861", cod:"1861", empresa:"3311", nome:"Pedro Rafael Thomé Lopes",         proximoPeriodoAberto:"23/02/2026", periodoAquisitivo:"22/02/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"22/01/2028", periodos:[], idade:17, historicoImportado:"08/06/2026" },
  { id:"3311-162",  cod:"162",  empresa:"3311", nome:"Bruna Paim de Oliveira",           proximoPeriodoAberto:"18/03/2026", periodoAquisitivo:"17/03/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"17/02/2028", periodos:[], idade:29, historicoImportado:"08/06/2026" },
  { id:"3311-1147", cod:"1147", empresa:"3311", nome:"Jaqueline Gusmão Braun",           proximoPeriodoAberto:"02/04/2026", periodoAquisitivo:"01/04/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"01/03/2028", periodos:[], idade:52, historicoImportado:"08/06/2026" },
  { id:"3311-1144", cod:"1144", empresa:"3311", nome:"Daniel da Silva Santos",           proximoPeriodoAberto:"03/04/2026", periodoAquisitivo:"02/04/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"02/03/2028", periodos:[], idade:53, historicoImportado:"08/06/2026" },
  { id:"3311-164",  cod:"164",  empresa:"3311", nome:"Francisco de Assis",               proximoPeriodoAberto:"27/04/2026", periodoAquisitivo:"26/04/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"26/03/2028", periodos:[], idade:56, historicoImportado:"08/06/2026" },
  { id:"3311-1364", cod:"1364", empresa:"3311", nome:"Marcos Antonio Dantas",            proximoPeriodoAberto:"30/04/2026", periodoAquisitivo:"29/04/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"29/03/2028", periodos:[{ dias:30, inicio:"01/06/2026", abono:false, inicioGozo:null }], idade:51, historicoImportado:"08/06/2026" },
  { id:"3311-165",  cod:"165",  empresa:"3311", nome:"Silvia Letice Duarte Souza",       proximoPeriodoAberto:"25/05/2026", periodoAquisitivo:"24/05/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"24/04/2028", periodos:[], idade:52, historicoImportado:"08/06/2026" },
  // === 3321 ===
  { id:"3321-1010", cod:"1010", empresa:"3321", nome:"José Carolino Cardoso",            proximoPeriodoAberto:"03/03/2006", periodoAquisitivo:"02/03/2007", diasDobro:570,diasVenc:30, diasVencidos:10, limDiasVenc:"02/02/2008", periodos:[], idade:63, historicoImportado:"08/06/2026" },
  { id:"3321-8795", cod:"8795", empresa:"3321", nome:"Luiz Felipe de Almeida",           proximoPeriodoAberto:"23/03/2021", periodoAquisitivo:"22/03/2022", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"22/02/2023", periodos:[], idade:25, historicoImportado:"08/06/2026" },
  { id:"3321-1589", cod:"1589", empresa:"3321", nome:"Maria Luiza Conceicao de Souza",   proximoPeriodoAberto:"02/05/2023", periodoAquisitivo:"01/05/2024", diasDobro:60, diasVenc:30, diasVencidos:5,  limDiasVenc:"01/04/2025", periodos:[], idade:52, historicoImportado:"08/06/2026" },
  { id:"3321-1703", cod:"1703", empresa:"3321", nome:"Jackeline Fernandes de Freitas",   proximoPeriodoAberto:"23/08/2024", periodoAquisitivo:"22/08/2025", diasDobro:0,  diasVenc:10, diasVencidos:0,  limDiasVenc:"22/07/2026", periodos:[], idade:50, historicoImportado:"08/06/2026" },
  { id:"3321-1718", cod:"1718", empresa:"3321", nome:"Lorrany Gomes Veloso",             proximoPeriodoAberto:"08/01/2025", periodoAquisitivo:"07/01/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"07/12/2026", periodos:[{ dias:10, inicio:"17/08/2026", abono:true, inicioGozo:null },{ dias:20, inicio:"21/09/2026", abono:false, inicioGozo:null }], idade:25, historicoImportado:"08/06/2026" },
  { id:"3321-8251", cod:"8251", empresa:"3321", nome:"José Carlos dos Reis",             proximoPeriodoAberto:"12/01/2025", periodoAquisitivo:"11/01/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"11/12/2026", periodos:[], idade:68, historicoImportado:"08/06/2026" },
  { id:"3321-8593", cod:"8593", empresa:"3321", nome:"Yuri Teodoro Sampaio",             proximoPeriodoAberto:"21/01/2025", periodoAquisitivo:"20/01/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"20/12/2026", periodos:[], idade:37, historicoImportado:"08/06/2026" },
  { id:"3321-8468", cod:"8468", empresa:"3321", nome:"Elisa Viaro de Lima",              proximoPeriodoAberto:"29/01/2025", periodoAquisitivo:"28/01/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"28/12/2026", periodos:[], idade:22, historicoImportado:"08/06/2026" },
  { id:"3321-8082", cod:"8082", empresa:"3321", nome:"Zilanda Machado de Almeida",       proximoPeriodoAberto:"01/02/2025", periodoAquisitivo:"31/01/2026", diasDobro:0,  diasVenc:15, diasVencidos:0,  limDiasVenc:"31/12/2026", periodos:[], idade:43, historicoImportado:"08/06/2026" },
  { id:"3321-8447", cod:"8447", empresa:"3321", nome:"Lisiane Jacques Moraes",           proximoPeriodoAberto:"21/02/2025", periodoAquisitivo:"20/02/2026", diasDobro:0,  diasVenc:25, diasVencidos:0,  limDiasVenc:"20/01/2027", periodos:[], idade:51, historicoImportado:"08/06/2026" },
  { id:"3321-8377", cod:"8377", empresa:"3321", nome:"Atina da Silva Costa",             proximoPeriodoAberto:"16/03/2025", periodoAquisitivo:"15/03/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"15/02/2027", periodos:[], idade:45, historicoImportado:"08/06/2026" },
  { id:"3321-8649", cod:"8649", empresa:"3321", nome:"Gustavo Rochethi de Oliveira",     proximoPeriodoAberto:"02/04/2025", periodoAquisitivo:"01/04/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"01/03/2027", periodos:[], idade:23, historicoImportado:"08/06/2026" },
  { id:"3321-8652", cod:"8652", empresa:"3321", nome:"Roger Borges Batista",             proximoPeriodoAberto:"02/04/2025", periodoAquisitivo:"01/04/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"01/03/2027", periodos:[], idade:49, historicoImportado:"08/06/2026" },
  { id:"3321-8381", cod:"8381", empresa:"3321", nome:"Jonathas Rochethi de Oliveira",    proximoPeriodoAberto:"06/04/2025", periodoAquisitivo:"05/04/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"05/03/2027", periodos:[], idade:31, historicoImportado:"08/06/2026" },
  { id:"3321-8490", cod:"8490", empresa:"3321", nome:"Alex Ferreira Rodrigues",          proximoPeriodoAberto:"08/05/2025", periodoAquisitivo:"07/05/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"07/04/2027", periodos:[], idade:42, historicoImportado:"08/06/2026" },
  { id:"3321-8129", cod:"8129", empresa:"3321", nome:"Joel Couto de Oliveira",           proximoPeriodoAberto:"25/05/2025", periodoAquisitivo:"24/05/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"24/04/2027", periodos:[], idade:56, historicoImportado:"08/06/2026" },
  { id:"3321-1720", cod:"1720", empresa:"3321", nome:"Davison Alex Ferreira de Souza",   proximoPeriodoAberto:"02/06/2025", periodoAquisitivo:"01/06/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"01/05/2027", periodos:[], idade:46, historicoImportado:"08/06/2026" },
  { id:"3321-8395", cod:"8395", empresa:"3321", nome:"Tiago Moura Goncalves",            proximoPeriodoAberto:"07/06/2025", periodoAquisitivo:"06/06/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"06/05/2027", periodos:[], idade:37, historicoImportado:"08/06/2026" },
  { id:"3321-8675", cod:"8675", empresa:"3321", nome:"Alex Damiao Moraes Oliveira",      proximoPeriodoAberto:"17/06/2025", periodoAquisitivo:"16/06/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"16/05/2027", periodos:[], idade:44, historicoImportado:"08/06/2026" },
  { id:"3321-3227", cod:"3227", empresa:"3321", nome:"Jessica Marques de Lima",          proximoPeriodoAberto:"01/07/2025", periodoAquisitivo:"30/06/2026", diasDobro:0,  diasVenc:30, diasVencidos:0,  limDiasVenc:"30/05/2027", periodos:[], idade:30, historicoImportado:"08/06/2026" },
  { id:"3321-8681", cod:"8681", empresa:"3321", nome:"Marinaldo Santana do Nascimento",  proximoPeriodoAberto:"01/07/2025", periodoAquisitivo:"30/06/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"30/05/2027", periodos:[], idade:38, historicoImportado:"08/06/2026" },
  { id:"3321-1701", cod:"1701", empresa:"3321", nome:"Mateus Lourenço Fernandes",        proximoPeriodoAberto:"01/07/2025", periodoAquisitivo:"30/06/2026", diasDobro:30, diasVenc:30, diasVencidos:0,  limDiasVenc:"30/05/2027", periodos:[], idade:27, historicoImportado:"08/06/2026" },
  { id:"3321-1696", cod:"1696", empresa:"3321", nome:"Perola Eduarda de Carvalho",       proximoPeriodoAberto:"03/09/2025", periodoAquisitivo:"02/09/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"02/08/2027", periodos:[], idade:26, historicoImportado:"08/06/2026" },
  { id:"3321-2507", cod:"2507", empresa:"3321", nome:"Luciano dos Santos Silva",         proximoPeriodoAberto:"01/10/2025", periodoAquisitivo:"30/09/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"30/08/2027", periodos:[], idade:48, historicoImportado:"08/06/2026" },
  { id:"3321-8460", cod:"8460", empresa:"3321", nome:"Brunna Kelly Rego Lisboa",         proximoPeriodoAberto:"02/10/2025", periodoAquisitivo:"01/10/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"01/09/2027", periodos:[], idade:27, historicoImportado:"08/06/2026" },
  { id:"3321-8575", cod:"8575", empresa:"3321", nome:"Beatriz da Silva Maravilha",       proximoPeriodoAberto:"07/10/2025", periodoAquisitivo:"06/10/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"06/09/2027", periodos:[], idade:22, historicoImportado:"08/06/2026" },
  { id:"3321-8267", cod:"8267", empresa:"3321", nome:"Angelica Vieira da Silva",         proximoPeriodoAberto:"22/10/2025", periodoAquisitivo:"21/10/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"21/09/2027", periodos:[], idade:57, historicoImportado:"08/06/2026" },
  { id:"3321-8736", cod:"8736", empresa:"3321", nome:"Rosangela de Almeida",             proximoPeriodoAberto:"27/10/2025", periodoAquisitivo:"26/10/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"26/09/2027", periodos:[], idade:54, historicoImportado:"08/06/2026" },
  { id:"3321-8590", cod:"8590", empresa:"3321", nome:"Breno da Silva Maravilha",         proximoPeriodoAberto:"13/11/2025", periodoAquisitivo:"12/11/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"12/10/2027", periodos:[], idade:22, historicoImportado:"08/06/2026" },
  { id:"3321-8566", cod:"8566", empresa:"3321", nome:"Matheus Leandro da Silva",         proximoPeriodoAberto:"17/12/2025", periodoAquisitivo:"16/12/2026", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"16/11/2027", periodos:[], idade:27, historicoImportado:"08/06/2026" },
  { id:"3321-1717", cod:"1717", empresa:"3321", nome:"Jesse de Aguiar Castro",           proximoPeriodoAberto:"02/01/2026", periodoAquisitivo:"01/01/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"01/12/2027", periodos:[], idade:35, historicoImportado:"08/06/2026" },
  { id:"3321-8642", cod:"8642", empresa:"3321", nome:"Cosme Motta",                      proximoPeriodoAberto:"03/01/2026", periodoAquisitivo:"02/01/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"02/12/2027", periodos:[], idade:56, historicoImportado:"08/06/2026" },
  { id:"3321-8462", cod:"8462", empresa:"3321", nome:"Evandro William Souto Viana",      proximoPeriodoAberto:"07/02/2026", periodoAquisitivo:"06/02/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"06/01/2028", periodos:[], idade:28, historicoImportado:"08/06/2026" },
  { id:"3321-8803", cod:"8803", empresa:"3321", nome:"Millena de Souza Magalhaes",       proximoPeriodoAberto:"23/02/2026", periodoAquisitivo:"22/02/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"22/01/2028", periodos:[], idade:22, historicoImportado:"08/06/2026" },
  { id:"3321-8793", cod:"8793", empresa:"3321", nome:"Nathan Lincon Batista Paiva",      proximoPeriodoAberto:"23/02/2026", periodoAquisitivo:"22/02/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"22/01/2028", periodos:[], idade:19, historicoImportado:"08/06/2026" },
  { id:"3321-1709", cod:"1709", empresa:"3321", nome:"Marcely Seixas da Rocha",          proximoPeriodoAberto:"20/04/2026", periodoAquisitivo:"19/04/2027", diasDobro:0,  diasVenc:0,  diasVencidos:0,  limDiasVenc:"19/03/2028", periodos:[], idade:51, historicoImportado:"08/06/2026" },
  // === 3313 - Loja ARS ===
  { id:"3313-95",  cod:"95",  empresa:"3313", nome:"Amanda da Silva Almeida",       proximoPeriodoAberto:"04/06/2025", periodoAquisitivo:"03/06/2026", diasDobro:0, diasVenc:30, diasVencidos:5,   limDiasVenc:"03/05/2027", periodos:[{ dias:30, inicio:"13/07/2026", abono:false, inicioGozo:null }], idade:0, historicoImportado:"02/07/2026" },
  { id:"3313-84",  cod:"84",  empresa:"3313", nome:"Bruno Theodorio Rodrigues",     proximoPeriodoAberto:"02/04/2025", periodoAquisitivo:"01/04/2026", diasDobro:0, diasVenc:30, diasVencidos:10,  limDiasVenc:"01/03/2027", periodos:[], idade:0, historicoImportado:"02/07/2026" },
  { id:"3313-23",  cod:"23",  empresa:"3313", nome:"Célia Valentina Mattos da Silva",proximoPeriodoAberto:"08/03/2026", periodoAquisitivo:"07/03/2027", diasDobro:0, diasVenc:0,  diasVencidos:0,   limDiasVenc:"07/02/2028", periodos:[{ dias:30, inicio:"08/06/2026", abono:false, inicioGozo:null }], idade:0, historicoImportado:"02/07/2026" },
  { id:"3313-83",  cod:"83",  empresa:"3313", nome:"Eduina Melanie da Silva",        proximoPeriodoAberto:"24/02/2025", periodoAquisitivo:"23/02/2026", diasDobro:0, diasVenc:30, diasVencidos:0,   limDiasVenc:"23/01/2027", periodos:[], idade:0, historicoImportado:"02/07/2026" },
  { id:"3313-81",  cod:"81",  empresa:"3313", nome:"Evandro Branco de Oliveira",     proximoPeriodoAberto:"02/12/2024", periodoAquisitivo:"01/12/2025", diasDobro:0, diasVenc:30, diasVencidos:0,   limDiasVenc:"01/11/2026", periodos:[], idade:0, historicoImportado:"02/07/2026" },
  { id:"3313-82",  cod:"82",  empresa:"3313", nome:"Hosana Medeiros Tavares",        proximoPeriodoAberto:"29/09/2025", periodoAquisitivo:"28/09/2026", diasDobro:0, diasVenc:0,  diasVencidos:0,   limDiasVenc:"28/08/2027", periodos:[], idade:0, historicoImportado:"02/07/2026" },
  { id:"3313-104", cod:"104", empresa:"3313", nome:"Pedro Rafael Thomé Lopes",       proximoPeriodoAberto:"23/02/2026", periodoAquisitivo:"22/02/2027", diasDobro:0, diasVenc:0,  diasVencidos:0,   limDiasVenc:"22/01/2028", periodos:[], idade:0, historicoImportado:"02/07/2026" },
  { id:"3313-85",  cod:"85",  empresa:"3313", nome:"Raphael Castro Alexandre",       proximoPeriodoAberto:"17/12/2025", periodoAquisitivo:"16/12/2026", diasDobro:0, diasVenc:0,  diasVencidos:0,   limDiasVenc:"16/11/2027", periodos:[], idade:0, historicoImportado:"02/07/2026" },
]

const LS_KEY = "ars_ferias_colaboradores"
const LS_NEG = "ars_ferias_negociacoes"
const LS_LIC = "ars_ferias_licencas"
const LS_OVR = "ars_ferias_overrides"

function parseBR(d: string): Date | null {
  if (!d || d.includes("_")) return null
  const [dd, mm, yyyy] = d.split("/")
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
}

function diffDias(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000)
}

function status(c: Colaborador, hoje: Date): "vencido" | "critico" | "atencao" | "ok" | "sem-periodo" {
  const lim = parseBR(c.limDiasVenc)
  if (!lim) return "sem-periodo"
  if (lim < hoje) return "vencido"
  const dias = diffDias(hoje, lim)
  if (dias <= 30) return "critico"
  if (dias <= 90) return "atencao"
  return "ok"
}

function diasParaVencer(c: Colaborador, hoje: Date): number | null {
  const lim = parseBR(c.limDiasVenc)
  if (!lim) return null
  return diffDias(hoje, lim)
}

// Verifica se uma data cai em qui/sex (inválido por lei)
function validaInicioFerias(dateStr: string): string | null {
  const d = new Date(dateStr)
  const dow = d.getDay() // 0=Dom, 4=Qui, 5=Sex
  if (dow === 4) return "Férias não podem iniciar na quinta-feira (CLT Art. 134)"
  if (dow === 5) return "Férias não podem iniciar na sexta-feira (CLT Art. 134)"
  return null
}

function addDias(dateStr: string, dias: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeriasPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [negociacoes, setNegociacoes] = useState<NegociacaoFerias[]>([])
  const [licencas, setLicencas] = useState<LicencaMedica[]>([])
  const [overrides, setOverrides] = useState<OverrideColaborador[]>([])
  const [hoje] = useState(new Date())
  const [filtroEmpresa, setFiltroEmpresa] = useState<"todas" | "3311" | "3321" | "3313">("todas")
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "vencido" | "critico" | "atencao" | "ok" | "licenca">("todos")
  const [busca, setBusca] = useState("")
  const [detalhe, setDetalhe] = useState<Colaborador | null>(null)
  const [showNeg, setShowNeg] = useState(false)
  const [neg, setNeg] = useState({ inicio: "", fim: "", abono: false, diasAbono: 10, observacao: "" })
  const [erroNeg, setErroNeg] = useState("")
  const [canEdit, setCanEdit] = useState(false)
  // Licença médica
  const [showLicenca, setShowLicenca] = useState(false)
  const [licencaNota, setLicencaNota] = useState("")
  // Override/correção de dados
  const [showOverride, setShowOverride] = useState(false)
  const [ovr, setOvr] = useState({ periodoAquisitivo: "", limDiasVenc: "", diasVenc: "", diasVencidos: "", nota: "" })

  useEffect(() => {
    const s = getSession()
    const vo = JSON.parse(localStorage.getItem("ars_view_only") || "{}")
    const viewOnly = (vo[s?.userId ?? ""] ?? []).includes("/ferias")
    setCanEdit((s?.nivel ?? 99) <= 2 && !viewOnly)

    const saved = localStorage.getItem(LS_KEY)
    if (saved) setColaboradores(JSON.parse(saved))
    else { localStorage.setItem(LS_KEY, JSON.stringify(DADOS_INICIAIS)); setColaboradores(DADOS_INICIAIS) }

    const neg = localStorage.getItem(LS_NEG)
    if (neg) setNegociacoes(JSON.parse(neg))

    const lic = localStorage.getItem(LS_LIC)
    if (lic) setLicencas(JSON.parse(lic))

    const ovr = localStorage.getItem(LS_OVR)
    if (ovr) setOverrides(JSON.parse(ovr))
  }, [])

  function saveLicencas(list: LicencaMedica[]) { setLicencas(list); localStorage.setItem(LS_LIC, JSON.stringify(list)) }
  function saveOverrides(list: OverrideColaborador[]) { setOverrides(list); localStorage.setItem(LS_OVR, JSON.stringify(list)) }
  function saveNegs(list: NegociacaoFerias[]) { setNegociacoes(list); localStorage.setItem(LS_NEG, JSON.stringify(list)) }

  // Resolve dados efetivos de um colaborador (override sobrepõe importação)
  function resolve(c: Colaborador): Colaborador {
    const o = overrides.find(x => x.colaboradorId === c.id)
    if (!o) return c
    return {
      ...c,
      periodoAquisitivo: o.periodoAquisitivo || c.periodoAquisitivo,
      limDiasVenc: o.limDiasVenc || c.limDiasVenc,
      diasVenc: o.diasVenc !== undefined ? o.diasVenc : c.diasVenc,
      diasVencidos: o.diasVencidos !== undefined ? o.diasVencidos : c.diasVencidos,
    }
  }

  function getLicenca(id: string) { return licencas.find(l => l.colaboradorId === id) }

  const counts = {
    vencido: colaboradores.filter(c => !getLicenca(c.id) && status(resolve(c), hoje) === "vencido").length,
    critico: colaboradores.filter(c => !getLicenca(c.id) && status(resolve(c), hoje) === "critico").length,
    atencao: colaboradores.filter(c => !getLicenca(c.id) && status(resolve(c), hoje) === "atencao").length,
    ok:      colaboradores.filter(c => !getLicenca(c.id) && status(resolve(c), hoje) === "ok").length,
    licenca: licencas.length,
  }

  const total3311 = colaboradores.filter(c => c.empresa === "3311").length
  const total3321 = colaboradores.filter(c => c.empresa === "3321").length
  const total3313 = colaboradores.filter(c => c.empresa === "3313").length

  const lista = colaboradores.filter(c => {
    if (filtroEmpresa !== "todas" && c.empresa !== filtroEmpresa) return false
    const lic = getLicenca(c.id)
    if (filtroStatus === "licenca") return !!lic
    if (lic) return filtroStatus === "todos"  // licença só aparece em "todos"
    const st = status(resolve(c), hoje)
    if (filtroStatus !== "todos" && st !== filtroStatus) return false
    if (busca && !c.nome.toLowerCase().includes(busca.toLowerCase()) && !c.cod.includes(busca)) return false
    return true
  }).filter(c => {
    if (busca && !c.nome.toLowerCase().includes(busca.toLowerCase()) && !c.cod.includes(busca)) return false
    return true
  })

  function handleNegociar() {
    setErroNeg("")
    if (!neg.inicio || !neg.fim) { setErroNeg("Preencha as datas de início e fim."); return }
    const errI = validaInicioFerias(neg.inicio)
    if (errI) { setErroNeg(errI); return }
    if (new Date(neg.fim) <= new Date(neg.inicio)) { setErroNeg("Data de fim deve ser após o início."); return }
    const inicioGozo = neg.abono ? addDias(neg.inicio, neg.diasAbono) : neg.inicio
    const nova: NegociacaoFerias = {
      colaboradorId: detalhe!.id, inicio: neg.inicio, fim: neg.fim, abono: neg.abono,
      diasAbono: neg.abono ? neg.diasAbono : 0, inicioGozo,
      dias: diffDias(new Date(neg.inicio), new Date(neg.fim)),
      observacao: neg.observacao, criadoEm: new Date().toISOString(),
    }
    saveNegs([...negociacoes, nova])
    setShowNeg(false)
    setNeg({ inicio: "", fim: "", abono: false, diasAbono: 10, observacao: "" })
  }

  function handleLicenca() {
    if (!detalhe) return
    const existing = licencas.filter(l => l.colaboradorId !== detalhe.id)
    saveLicencas([...existing, { colaboradorId: detalhe.id, nota: licencaNota, desde: new Date().toISOString().slice(0, 10) }])
    setShowLicenca(false)
    setLicencaNota("")
  }

  function removeLicenca() {
    if (!detalhe) return
    saveLicencas(licencas.filter(l => l.colaboradorId !== detalhe.id))
  }

  function handleOverride() {
    if (!detalhe) return
    const existing = overrides.filter(o => o.colaboradorId !== detalhe.id)
    const novo: OverrideColaborador = {
      colaboradorId: detalhe.id,
      periodoAquisitivo: ovr.periodoAquisitivo || undefined,
      limDiasVenc: ovr.limDiasVenc || undefined,
      diasVenc: ovr.diasVenc !== "" ? Number(ovr.diasVenc) : undefined,
      diasVencidos: ovr.diasVencidos !== "" ? Number(ovr.diasVencidos) : undefined,
      nota: ovr.nota || undefined,
      atualizadoEm: new Date().toISOString(),
    }
    saveOverrides([...existing, novo])
    setShowOverride(false)
  }

  function removeOverride() {
    if (!detalhe) return
    saveOverrides(overrides.filter(o => o.colaboradorId !== detalhe.id))
  }

  function openOverride(c: Colaborador) {
    const o = overrides.find(x => x.colaboradorId === c.id)
    const r = resolve(c)
    setOvr({
      periodoAquisitivo: o?.periodoAquisitivo || r.periodoAquisitivo,
      limDiasVenc: o?.limDiasVenc || r.limDiasVenc,
      diasVenc: String(r.diasVenc),
      diasVencidos: String(r.diasVencidos),
      nota: o?.nota || "",
    })
    setShowOverride(true)
  }

  const negDetalhe = detalhe ? negociacoes.filter(n => n.colaboradorId === detalhe.id) : []

  const statusColor: Record<string, string> = {
    vencido: "#E74C3C", critico: "#E67E22", atencao: "#F1C40F", ok: "#27AE60", "sem-periodo": "#95A5A6",
  }
  const statusLabel: Record<string, string> = {
    vencido: "Vencido", critico: "Crítico (≤30 dias)", atencao: "Atenção (≤90 dias)", ok: "OK", "sem-periodo": "Sem período",
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 36, padding: "0 10px", borderRadius: 7,
    border: "1px solid var(--border)", background: "var(--input-bg)",
    color: "var(--text-primary)", fontSize: 13, boxSizing: "border-box",
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
    {/* ── Coluna esquerda (conteúdo principal) ── */}
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: 32, transition: "all .25s" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Palmtree size={28} style={{ color: "#27AE60" }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Controle de Férias</h1>
      </div>
      <p style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: 14 }}>
        {total3311} colaboradores na 3311 · {total3321} na 3321 · {total3313} na 3313
      </p>

      {/* Cards resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Férias Vencidas", val: counts.vencido, color: "#E74C3C", icon: <AlertCircle size={20} />, filter: "vencido" },
          { label: "Crítico (≤30d)", val: counts.critico, color: "#E67E22", icon: <AlertTriangle size={20} />, filter: "critico" },
          { label: "Atenção (≤90d)", val: counts.atencao, color: "#F1C40F", icon: <Clock size={20} />, filter: "atencao" },
          { label: "Em dia", val: counts.ok, color: "#27AE60", icon: <CheckCircle2 size={20} />, filter: "ok" },
          { label: "Licença Médica", val: counts.licenca, color: "#8E44AD", icon: <Stethoscope size={20} />, filter: "licenca" },
        ].map(card => (
          <div
            key={card.filter}
            onClick={() => setFiltroStatus(filtroStatus === card.filter ? "todos" : card.filter as typeof filtroStatus)}
            style={{
              background: "var(--card-bg)", border: `2px solid ${filtroStatus === card.filter ? card.color : "var(--border)"}`,
              borderRadius: 12, padding: "20px 24px", cursor: "pointer", transition: "all .2s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ color: card.color }}>{card.icon}</span>
              <span style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.val}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input
            value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar colaborador ou código..."
            style={{ width: "100%", paddingLeft: 36, paddingRight: 12, height: 40, borderRadius: 8, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }}
          />
        </div>
        <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value as typeof filtroEmpresa)}
          style={{ height: 40, paddingInline: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: 14 }}>
          <option value="todas">Todas as empresas</option>
          <option value="3311">3311 – Assoc. Rio Sul</option>
          <option value="3321">3321 – IAEASEB Educação</option>
          <option value="3313">3313 – Loja ARS</option>
        </select>
        {(filtroStatus !== "todos" || filtroEmpresa !== "todas" || busca) && (
          <button onClick={() => { setFiltroStatus("todos"); setFiltroEmpresa("todas"); setBusca("") }}
            style={{ height: 40, paddingInline: 16, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <X size={14} /> Limpar filtros
          </button>
        )}
        <span style={{ height: 40, display: "flex", alignItems: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          {lista.length} colaborador{lista.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Tabela */}
      <div style={{ background: "var(--card-bg)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--table-header-bg, rgba(0,0,0,.04))" }}>
              {["Cód.", "Nome", "Empresa", "Período Aquisitivo", "Limite", "Dias Restantes", "Status", "Agendamento"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: 12, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((c, i) => {
              const rc = resolve(c)
              const lic = getLicenca(c.id)
              const st = lic ? "licenca" : status(rc, hoje)
              const diasRestantes = diasParaVencer(rc, hoje)
              const hasNeg = negociacoes.some(n => n.colaboradorId === c.id)
              const hasOverride = overrides.some(o => o.colaboradorId === c.id)
              const rowColor = lic ? "#8E44AD" : statusColor[st] ?? "#95A5A6"
              return (
                <tr
                  key={c.id}
                  onClick={() => { setDetalhe(c); setShowNeg(false); setShowLicenca(false); setShowOverride(false) }}
                  style={{ cursor: "pointer", background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,.02)", borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(39,174,96,.06)")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(0,0,0,.02)")}
                >
                  <td style={{ padding: "10px 14px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{c.cod}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {c.nome}
                    {hasOverride && <span title="Dados corrigidos manualmente" style={{ marginLeft: 6, fontSize: 10, color: "#E67E22", fontWeight: 700 }}>✎</span>}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600, background: c.empresa === "3311" ? "#1B98E020" : c.empresa === "3321" ? "#9B59B620" : "#27AE6020", color: c.empresa === "3311" ? "#1B98E0" : c.empresa === "3321" ? "#9B59B6" : "#27AE60" }}>
                      {c.empresa}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>{rc.periodoAquisitivo}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: (!lic && st === "vencido") ? "#E74C3C" : "var(--text-primary)", fontWeight: (!lic && st === "vencido") ? 700 : 400 }}>{rc.limDiasVenc}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: lic ? "#8E44AD" : (statusColor[st] ?? "#95A5A6") }}>
                    {lic ? "Em licença" : diasRestantes === null ? "—" : diasRestantes < 0 ? `${Math.abs(diasRestantes)}d atraso` : `${diasRestantes}d`}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {lic ? (
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: "#8E44AD22", color: "#8E44AD", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Stethoscope size={10} /> Licença Médica
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: rowColor + "22", color: rowColor }}>
                        {statusLabel[st] ?? "—"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {hasNeg ? (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#27AE6020", color: "#27AE60", fontWeight: 600 }}>
                        <Calendar size={10} style={{ display: "inline", marginRight: 4 }} />Agendado
                      </span>
                    ) : c.periodos.length > 0 ? (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#1B98E020", color: "#1B98E0", fontWeight: 600 }}>
                        No mapa
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)" }}>
            Nenhum colaborador encontrado para os filtros selecionados.
          </div>
        )}
      </div>

    </div>{/* fim coluna esquerda */}

      {/* ── Painel de Detalhe (coluna direita) ── */}
      {detalhe && (() => {
        const rc = resolve(detalhe)
        const lic = getLicenca(detalhe.id)
        const st = lic ? "licenca" : status(rc, hoje)
        const diasRestantes = diasParaVencer(rc, hoje)
        const hasOverride = overrides.some(o => o.colaboradorId === detalhe.id)
        const stColor = lic ? "#8E44AD" : (statusColor[st] ?? "#95A5A6")
        const stLabel = lic ? "Licença Médica" : (statusLabel[st] ?? "—")
        return (
          <div style={{ width: 480, flexShrink: 0, borderLeft: "1px solid var(--border)", background: "var(--card-bg, #fff)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600 }}>
                    {detalhe.empresa === "3311" ? "Assoc. Rio Sul da IASD – 3311" : detalhe.empresa === "3321" ? "IAEASEB Educação ARS – 3321" : "Loja ARS – 3313"} · Cód. {detalhe.cod}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{detalhe.nome}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>Idade: {detalhe.idade} anos</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {canEdit && (
                    <>
                      <button onClick={() => openOverride(detalhe)} title="Corrigir dados"
                        style={{ background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "#E67E22", padding: "5px 8px", borderRadius: 7, display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                        <Pencil size={13} /> Corrigir
                      </button>
                      <button onClick={() => { setShowLicenca(!showLicenca); setShowNeg(false); setShowOverride(false) }} title="Licença médica"
                        style={{ background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "#8E44AD", padding: "5px 8px", borderRadius: 7, display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                        <Stethoscope size={13} /> {lic ? "Ver licença" : "Licença"}
                      </button>
                    </>
                  )}
                  <button onClick={() => { setDetalhe(null); setShowNeg(false); setShowLicenca(false); setShowOverride(false) }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Licença médica ativa */}
              {lic && (
                <div style={{ background: "#8E44AD15", border: "1px solid #8E44AD40", borderRadius: 10, padding: "14px 18px", borderLeft: "4px solid #8E44AD" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#8E44AD", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                        <Stethoscope size={14} /> Em Licença Médica
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>Desde: {lic.desde}</div>
                      {lic.nota && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>"{lic.nota}"</div>}
                    </div>
                    {canEdit && (
                      <button onClick={removeLicenca}
                        style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "#E74C3C15", color: "#E74C3C", border: "1px solid #E74C3C40", cursor: "pointer", fontWeight: 600 }}>
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Form: Marcar licença médica */}
              {showLicenca && canEdit && (
                <div style={{ background: "#8E44AD0D", border: "1px solid #8E44AD30", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#8E44AD", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <Stethoscope size={14} /> {lic ? "Editar Licença Médica" : "Marcar como Licença Médica"}
                  </div>
                  <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 4 }}>Observação / CID</label>
                  <textarea value={licencaNota} onChange={e => setLicencaNota(e.target.value)}
                    placeholder="Ex: Licença médica por CID M54 — lombalgia. Prazo: 90 dias."
                    rows={3}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: 13, resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleLicenca}
                      style={{ flex: 1, padding: 10, borderRadius: 8, background: "#8E44AD", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Save size={14} /> Salvar
                    </button>
                    <button onClick={() => setShowLicenca(false)}
                      style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--card-bg)", color: "var(--text-secondary)", border: "1px solid var(--border)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Form: Correção de dados */}
              {showOverride && canEdit && (
                <div style={{ background: "#E67E2210", border: "1px solid #E67E2240", borderRadius: 10, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#E67E22", display: "flex", alignItems: "center", gap: 6 }}>
                      <Pencil size={14} /> Correção de Dados
                    </div>
                    {hasOverride && (
                      <button onClick={() => { removeOverride(); setShowOverride(false) }}
                        style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#E74C3C15", color: "#E74C3C", border: "1px solid #E74C3C40", cursor: "pointer" }}>
                        Remover correção
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 12 }}>
                    Estes dados sobrepõem a importação do PDF para este colaborador.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 4 }}>Fim Período Aquisitivo</label>
                      <input value={ovr.periodoAquisitivo} onChange={e => setOvr(p => ({ ...p, periodoAquisitivo: e.target.value }))}
                        placeholder="DD/MM/AAAA" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 4 }}>Limite para Gozo</label>
                      <input value={ovr.limDiasVenc} onChange={e => setOvr(p => ({ ...p, limDiasVenc: e.target.value }))}
                        placeholder="DD/MM/AAAA" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 4 }}>Dias Acumulados</label>
                      <input type="number" value={ovr.diasVenc} onChange={e => setOvr(p => ({ ...p, diasVenc: e.target.value }))}
                        placeholder="30" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 4 }}>Dias Vencidos</label>
                      <input type="number" value={ovr.diasVencidos} onChange={e => setOvr(p => ({ ...p, diasVencidos: e.target.value }))}
                        placeholder="0" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 4 }}>Observação da correção</label>
                    <input value={ovr.nota} onChange={e => setOvr(p => ({ ...p, nota: e.target.value }))}
                      placeholder="Ex: Dados corrigidos conforme DP em 02/07/2026" style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleOverride}
                      style={{ flex: 1, padding: 10, borderRadius: 8, background: "#E67E22", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Save size={14} /> Salvar Correção
                    </button>
                    <button onClick={() => setShowOverride(false)}
                      style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--card-bg)", color: "var(--text-secondary)", border: "1px solid var(--border)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Status badge */}
              <div style={{ background: stColor + "18", borderRadius: 10, padding: "14px 18px", borderLeft: `4px solid ${stColor}` }}>
                <div style={{ fontWeight: 700, color: stColor, fontSize: 15 }}>{stLabel}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                  {lic ? "Não contabilizado como pendência enquanto em licença médica." :
                    diasRestantes === null ? "Sem período aquisitivo definido" :
                    diasRestantes < 0
                      ? `Férias vencidas há ${Math.abs(diasRestantes)} dias — ação imediata necessária!`
                      : `${diasRestantes} dias até o limite legal de gozo`}
                </div>
                {hasOverride && <div style={{ fontSize: 11, color: "#E67E22", marginTop: 6, fontWeight: 600 }}>✎ Dados corrigidos manualmente — sobrepõe importação</div>}
              </div>

              {/* Datas */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Período Aquisitivo</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Abertura do período", val: rc.proximoPeriodoAberto },
                    { label: "Fim do período aquisitivo", val: rc.periodoAquisitivo },
                    { label: "Limite legal para gozo", val: rc.limDiasVenc },
                    { label: "Dias acumulados", val: rc.diasVenc > 0 ? `${rc.diasVenc} dias` : "—" },
                  ].map(row => (
                    <div key={row.label} style={{ background: "var(--bg-secondary, rgba(0,0,0,.04))", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>{row.label}</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "monospace" }}>{row.val}</div>
                    </div>
                  ))}
                </div>
                {rc.diasDobro > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#E67E22", fontWeight: 600 }}>⚠ Dobro acumulado: {rc.diasDobro} dias</div>
                )}
              </div>

              {/* Períodos do mapa */}
              {detalhe.periodos.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Agendamento no Mapa</div>
                  {detalhe.periodos.map((p, i) => (
                    <div key={i} style={{ background: "var(--bg-secondary, rgba(0,0,0,.04))", borderRadius: 8, padding: "10px 14px", marginBottom: 8, display: "flex", gap: 16, alignItems: "center" }}>
                      <span style={{ fontSize: 11, background: "#1B98E020", color: "#1B98E0", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{p.dias}d</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Início: {p.inicio || "—"}</div>
                        {p.abono && <div style={{ fontSize: 11, color: "#E67E22", marginTop: 2 }}>Abono pecuniário (10 dias)</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Negociações registradas */}
              {negDetalhe.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Negociações Registradas</div>
                  {negDetalhe.map((n, i) => (
                    <div key={i} style={{ background: "#27AE6010", border: "1px solid #27AE6040", borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                            {n.inicio} → {n.fim} <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>({n.dias}d)</span>
                          </div>
                          {n.abono && <div style={{ fontSize: 12, color: "#E67E22", marginTop: 4 }}>Abono: {n.diasAbono}d · Gozo inicia em {n.inicioGozo}</div>}
                          {n.observacao && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>"{n.observacao}"</div>}
                        </div>
                        {canEdit && (
                          <button onClick={() => saveNegs(negociacoes.filter((_, j) => j !== negociacoes.indexOf(n)))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#E74C3C", padding: 4 }}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário de negociação */}
              {canEdit && (
                <>
                  {!showNeg ? (
                    <button onClick={() => { setShowNeg(true); setShowLicenca(false); setShowOverride(false) }}
                      style={{ padding: "12px 20px", borderRadius: 8, background: "#27AE60", color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={16} /> Registrar Negociação de Férias
                    </button>
                  ) : (
                    <div style={{ background: "var(--bg-secondary, rgba(0,0,0,.04))", borderRadius: 10, padding: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Nova Negociação</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 4 }}>Data Início *</label>
                          <input type="date" value={neg.inicio} onChange={e => setNeg(p => ({ ...p, inicio: e.target.value }))} style={inputStyle} />
                          {neg.inicio && validaInicioFerias(neg.inicio) && (
                            <div style={{ fontSize: 11, color: "#E74C3C", marginTop: 4 }}>{validaInicioFerias(neg.inicio)}</div>
                          )}
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 4 }}>Data Fim *</label>
                          <input type="date" value={neg.fim} onChange={e => setNeg(p => ({ ...p, fim: e.target.value }))} style={inputStyle} />
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-primary)" }}>
                          <input type="checkbox" checked={neg.abono} onChange={e => setNeg(p => ({ ...p, abono: e.target.checked }))} />
                          Abono pecuniário (vender dias)
                        </label>
                        {neg.abono && (
                          <div style={{ marginTop: 10, background: "#E67E2215", borderRadius: 8, padding: "10px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
                              <span>Dias de abono:</span>
                              <input type="number" min={1} max={10} value={neg.diasAbono}
                                onChange={e => setNeg(p => ({ ...p, diasAbono: Number(e.target.value) }))}
                                style={{ width: 60, height: 30, borderRadius: 6, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--text-primary)", textAlign: "center", fontSize: 13 }} />
                            </div>
                            {neg.inicio && (
                              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                Início do gozo: <strong style={{ color: "var(--text-primary)" }}>{addDias(neg.inicio, neg.diasAbono)}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 4 }}>Observação</label>
                        <textarea value={neg.observacao} onChange={e => setNeg(p => ({ ...p, observacao: e.target.value }))}
                          placeholder="Ex: Acordado em reunião de 01/07/2026" rows={2}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
                      </div>
                      {erroNeg && <div style={{ fontSize: 12, color: "#E74C3C", marginBottom: 10, fontWeight: 600 }}>{erroNeg}</div>}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={handleNegociar}
                          style={{ flex: 1, padding: 10, borderRadius: 8, background: "#27AE60", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <Save size={14} /> Salvar
                        </button>
                        <button onClick={() => { setShowNeg(false); setErroNeg("") }}
                          style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--card-bg)", color: "var(--text-secondary)", border: "1px solid var(--border)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div style={{ fontSize: 11, color: "var(--text-secondary)", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                Importado em: {detalhe.historicoImportado}
                {overrides.find(o => o.colaboradorId === detalhe.id)?.nota && (
                  <div style={{ color: "#E67E22", marginTop: 4 }}>
                    Correção: {overrides.find(o => o.colaboradorId === detalhe.id)?.nota}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

