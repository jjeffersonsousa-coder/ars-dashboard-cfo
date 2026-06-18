"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Users, ChevronDown, ChevronRight, CheckSquare, Square } from "lucide-react"

// ─── Real data: Região → Distrito → Igreja ───
const REGIOES = [{"nome":"1ª Região - Zona Oeste (Central)","distritos":[{"nome":"Bangu","igrejas":[{"nome":"Bangu","tipo":"Igreja","membros":251},{"nome":"Jardim Agua Branca","tipo":"Igreja","membros":42},{"nome":"Jardim Bangu","tipo":"Igreja","membros":76},{"nome":"Nova Alianca","tipo":"Igreja","membros":30},{"nome":"Piquirobi","tipo":"Igreja","membros":78},{"nome":"Sarapuí","tipo":"Igreja","membros":89},{"nome":"Bel Clima","tipo":"Igreja","membros":136},{"nome":"Carapiá","tipo":"Igreja","membros":32}]},{"nome":"Bel Clima","igrejas":[{"nome":"Jardim Maravilha","tipo":"Igreja","membros":105},{"nome":"Magarça","tipo":"Igreja","membros":89},{"nome":"Maravilha II","tipo":"Grupo","membros":37},{"nome":"Novo Maravilha","tipo":"Grupo","membros":19},{"nome":"Santa Clara","tipo":"Igreja","membros":137}]},{"nome":"Campo Grande","igrejas":[{"nome":"Campo Grande","tipo":"Igreja","membros":573},{"nome":"Pina Rangel","tipo":"Grupo","membros":13},{"nome":"Conjunto Campinho","tipo":"Grupo","membros":34},{"nome":"Cosmos","tipo":"Igreja","membros":77}]},{"nome":"Inhoaiba","igrejas":[{"nome":"Inhoaiba","tipo":"Igreja","membros":158},{"nome":"Parque Canaã","tipo":"Igreja","membros":101},{"nome":"Santa Helena","tipo":"Igreja","membros":73},{"nome":"Santa Margarida","tipo":"Igreja","membros":114},{"nome":"Saquaçu","tipo":"Igreja","membros":82},{"nome":"Vilar Carioca","tipo":"Grupo","membros":26},{"nome":"Ipatinga","tipo":"Igreja","membros":64}]},{"nome":"Jardim Paulista","igrejas":[{"nome":"Jardim Letícia","tipo":"Grupo","membros":50},{"nome":"Jardim Paulista","tipo":"Igreja","membros":380},{"nome":"Mendanha","tipo":"Igreja","membros":64},{"nome":"Santa Rosa","tipo":"Grupo","membros":68},{"nome":"São Geraldo","tipo":"Igreja","membros":43},{"nome":"São Victor","tipo":"Igreja","membros":122},{"nome":"Augusto Vasconcelos","tipo":"Igreja","membros":88}]},{"nome":"Moinho","igrejas":[{"nome":"Moinho","tipo":"Igreja","membros":185},{"nome":"Rio da Prata","tipo":"Grupo","membros":96},{"nome":"Santa Rita","tipo":"Igreja","membros":82}]},{"nome":"Padre Miguel","igrejas":[{"nome":"Água Branca","tipo":"Igreja","membros":77},{"nome":"Jardim Belcaire","tipo":"Igreja","membros":76},{"nome":"Moça Bonita","tipo":"Igreja","membros":82},{"nome":"Padre Miguel","tipo":"Igreja","membros":277}]},{"nome":"Santíssimo","igrejas":[{"nome":"Santissimo","tipo":"Igreja","membros":298},{"nome":"Senador Camará","tipo":"Igreja","membros":148},{"nome":"Viegas","tipo":"Igreja","membros":57},{"nome":"Vila Kennedy","tipo":"Igreja","membros":99}]}]},{"nome":"2ª Região - Zona Oeste (Itaguaí)","distritos":[{"nome":"Itaguaí","igrejas":[{"nome":"Chaperó","tipo":"Igreja","membros":62},{"nome":"Itaguaí","tipo":"Igreja","membros":393},{"nome":"Jardim América","tipo":"Igreja","membros":105},{"nome":"Santa Cândida","tipo":"Grupo","membros":27},{"nome":"Teixeira","tipo":"Igreja","membros":59},{"nome":"Cesarão","tipo":"Igreja","membros":115}]},{"nome":"Paciência","igrejas":[{"nome":"Fazenda Nacional","tipo":"Igreja","membros":55},{"nome":"Jardim Sete de Abril","tipo":"Grupo","membros":41},{"nome":"Nova Jersey","tipo":"Igreja","membros":71},{"nome":"Paciência","tipo":"Igreja","membros":221},{"nome":"Paçuaré","tipo":"Igreja","membros":98},{"nome":"Três Pontes","tipo":"Igreja","membros":118},{"nome":"Arão","tipo":"Igreja","membros":60},{"nome":"Areia Branca","tipo":"Grupo","membros":62},{"nome":"Brisa","tipo":"Grupo","membros":64},{"nome":"Cinco Marias","tipo":"Grupo","membros":77}]},{"nome":"Pedra de Guaratiba","igrejas":[{"nome":"Jardim Guaratiba","tipo":"Grupo","membros":61},{"nome":"Nova Sepetiba","tipo":"Grupo","membros":28},{"nome":"Nova Vista","tipo":"Igreja","membros":49},{"nome":"Pedra de Guaratiba","tipo":"Igreja","membros":133},{"nome":"Sepetiba","tipo":"Igreja","membros":81},{"nome":"Vila Mar","tipo":"Igreja","membros":240},{"nome":"Vitória Regia","tipo":"Grupo","membros":53},{"nome":"Km. 39","tipo":"Grupo","membros":33},{"nome":"Limoeiro","tipo":"Igreja","membros":137}]},{"nome":"Prados Verdes","igrejas":[{"nome":"Parque São Carlos","tipo":"Igreja","membros":47},{"nome":"Parque São Francisco","tipo":"Igreja","membros":70},{"nome":"Prados Verdes","tipo":"Igreja","membros":101},{"nome":"Vila Belga","tipo":"Igreja","membros":38},{"nome":"Alvorada","tipo":"Igreja","membros":46},{"nome":"Cajueiro","tipo":"Igreja","membros":77},{"nome":"Império","tipo":"Igreja","membros":115},{"nome":"Jardim Palmares","tipo":"Grupo","membros":58}]},{"nome":"Santa Cruz","igrejas":[{"nome":"Jesuitas","tipo":"Grupo","membros":63},{"nome":"João XXIII","tipo":"Grupo","membros":98},{"nome":"Lote 14","tipo":"Igreja","membros":153},{"nome":"Macapá","tipo":"Grupo","membros":190},{"nome":"Manguariba","tipo":"Igreja","membros":53},{"nome":"Santa Cruz","tipo":"Igreja","membros":229},{"nome":"São Fernando","tipo":"Grupo","membros":28},{"nome":"Brisamar","tipo":"Igreja","membros":95},{"nome":"Conceição de Jacareí","tipo":"Grupo","membros":16},{"nome":"Costa Verde","tipo":"Grupo","membros":18},{"nome":"Fazenda Conceição","tipo":"Grupo","membros":47}]},{"nome":"Sase","igrejas":[{"nome":"Jardim Mar","tipo":"Igreja","membros":0},{"nome":"Mangaratiba","tipo":"Igreja","membros":85},{"nome":"Muriqui","tipo":"Grupo","membros":24},{"nome":"Raiz da Serra","tipo":"Igreja","membros":20},{"nome":"Sase","tipo":"Igreja","membros":150}]},{"nome":"Seropédica","igrejas":[{"nome":"Jardim das Acacias","tipo":"Igreja","membros":88},{"nome":"Jardim Maracanã","tipo":"Grupo","membros":18},{"nome":"Parque Jacimar","tipo":"Igreja","membros":79},{"nome":"Piranema","tipo":"Igreja","membros":50},{"nome":"São Miguel","tipo":"Igreja","membros":39},{"nome":"Seropédica","tipo":"Igreja","membros":188}]}]},{"nome":"3ª Região - Baixada Fluminense (Iguaçuana)","distritos":[{"nome":"Austin","igrejas":[{"nome":"Mariléia","tipo":"Igreja","membros":96},{"nome":"Parque Suécia","tipo":"Igreja","membros":71},{"nome":"Três Fontes","tipo":"Igreja","membros":67},{"nome":"Vila Zenith","tipo":"Igreja","membros":32},{"nome":"Comendador Soares","tipo":"Igreja","membros":122},{"nome":"Faculdade","tipo":"Igreja","membros":116},{"nome":"Jardim Alvorada","tipo":"Igreja","membros":115}]},{"nome":"Comendador Soares","igrejas":[{"nome":"Jardim Cabuçu","tipo":"Igreja","membros":128},{"nome":"Jardim Laranjeiras","tipo":"Grupo","membros":93},{"nome":"Mangueira","tipo":"Igreja","membros":111},{"nome":"Parque das Palmeiras","tipo":"Grupo","membros":45},{"nome":"Três Marias","tipo":"Igreja","membros":62},{"nome":"Citrópolis","tipo":"Igreja","membros":92},{"nome":"Engenheiro Pedreira","tipo":"Igreja","membros":125}]},{"nome":"Engenheiro Pedreira","igrejas":[{"nome":"Japeri (Nova Belém)","tipo":"Igreja","membros":162},{"nome":"Lage de Paracambi","tipo":"Igreja","membros":56},{"nome":"Parque Guandu","tipo":"Igreja","membros":45},{"nome":"Santa Inês","tipo":"Grupo","membros":38},{"nome":"São Jorge","tipo":"Grupo","membros":77},{"nome":"São Luiz Gonzaga","tipo":"Igreja","membros":122},{"nome":"Andrade Araujo","tipo":"Igreja","membros":242},{"nome":"Engenho Pequeno","tipo":"Igreja","membros":67}]},{"nome":"Jardim da Prata","igrejas":[{"nome":"Itaipú","tipo":"Igreja","membros":35},{"nome":"Jardim da Prata","tipo":"Igreja","membros":156},{"nome":"Palmerinha","tipo":"Grupo","membros":29},{"nome":"Santo Elias","tipo":"Igreja","membros":213},{"nome":"Shan-Gri-LÁ","tipo":"Igreja","membros":76},{"nome":"Ambaí","tipo":"Grupo","membros":40},{"nome":"Boa Esperanca","tipo":"Igreja","membros":112}]},{"nome":"Miguel Couto","igrejas":[{"nome":"Figueira","tipo":"Grupo","membros":32},{"nome":"Geneciano","tipo":"Grupo","membros":34},{"nome":"Miguel Couto","tipo":"Igreja","membros":275},{"nome":"Parque Estoril","tipo":"Igreja","membros":54},{"nome":"Vila de Cava","tipo":"Igreja","membros":186},{"nome":"Bairro Metropolitano","tipo":"Igreja","membros":99}]},{"nome":"Nova Iguaçu","igrejas":[{"nome":"Caiçara","tipo":"Grupo","membros":29},{"nome":"Califórnia","tipo":"Grupo","membros":51},{"nome":"Jardim Santa Eugenia","tipo":"Igreja","membros":171},{"nome":"Meu Lugar (COANIG)","tipo":"Grupo","membros":50},{"nome":"Nova Iguaçu","tipo":"Igreja","membros":545},{"nome":"Arcozelo","tipo":"Grupo","membros":31},{"nome":"Bairro Avelar","tipo":"Grupo","membros":49}]},{"nome":"Paty do Alferes","igrejas":[{"nome":"Barro Branco","tipo":"Igreja","membros":83},{"nome":"Miguel Pereira","tipo":"Igreja","membros":53},{"nome":"Morro Azul","tipo":"Grupo","membros":28},{"nome":"Paty do Alferes","tipo":"Igreja","membros":106},{"nome":"Bairro Santa Rita","tipo":"Igreja","membros":56},{"nome":"Carmari","tipo":"Igreja","membros":93}]},{"nome":"Ponto Chic","igrejas":[{"nome":"Cerâmica","tipo":"Igreja","membros":28},{"nome":"Cobrex","tipo":"Igreja","membros":75},{"nome":"Corumbá","tipo":"Igreja","membros":54},{"nome":"Ponto Chic","tipo":"Igreja","membros":144},{"nome":"Posse","tipo":"Grupo","membros":40},{"nome":"Delamares","tipo":"Grupo","membros":33}]},{"nome":"Queimados","igrejas":[{"nome":"Paraíso","tipo":"Grupo","membros":46},{"nome":"Queimados","tipo":"Igreja","membros":255},{"nome":"Rio D'ouro","tipo":"Grupo","membros":11},{"nome":"Vila Camorim","tipo":"Igreja","membros":83}]}]},{"nome":"4ª Região - Zona Norte (Pavunense)","distritos":[{"nome":"Belford Roxo","igrejas":[{"nome":"Nova Aurora","tipo":"Grupo","membros":93},{"nome":"Parque São Vicente","tipo":"Igreja","membros":60},{"nome":"Recantus","tipo":"Igreja","membros":72},{"nome":"Santa Marta","tipo":"Igreja","membros":64},{"nome":"São Bernardo","tipo":"Igreja","membros":56},{"nome":"Dique","tipo":"Igreja","membros":34},{"nome":"Jardim Metrópole","tipo":"Igreja","membros":138}]},{"nome":"Jardim Metropole","igrejas":[{"nome":"Jardim Paraíso","tipo":"Igreja","membros":152},{"nome":"Parque Araruama","tipo":"Igreja","membros":140},{"nome":"Venda Velha","tipo":"Igreja","membros":73},{"nome":"Vila São João","tipo":"Grupo","membros":40},{"nome":"Chatuba","tipo":"Igreja","membros":112}]},{"nome":"Mirandela","igrejas":[{"nome":"Juscelino","tipo":"Grupo","membros":17},{"nome":"K 11","tipo":"Igreja","membros":38},{"nome":"Mesquita","tipo":"Igreja","membros":68},{"nome":"Mirandela","tipo":"Igreja","membros":107},{"nome":"Olinda","tipo":"Igreja","membros":42},{"nome":"Bacia","tipo":"Igreja","membros":48},{"nome":"Banco de Areia","tipo":"Igreja","membros":65},{"nome":"Éden","tipo":"Igreja","membros":69}]},{"nome":"Nilópolis","igrejas":[{"nome":"Éden II","tipo":"Grupo","membros":78},{"nome":"Nilópolis","tipo":"Igreja","membros":218},{"nome":"Vila Emil","tipo":"Igreja","membros":66},{"nome":"Vila Norma","tipo":"Igreja","membros":63},{"nome":"Chico Mendes","tipo":"Grupo","membros":35}]},{"nome":"Pavuna","igrejas":[{"nome":"Pavuna","tipo":"Igreja","membros":493},{"nome":"Pavuna II","tipo":"Igreja","membros":154},{"nome":"São João do Meriti","tipo":"Igreja","membros":85},{"nome":"Village","tipo":"Igreja","membros":96},{"nome":"Anchieta","tipo":"Igreja","membros":60},{"nome":"Nova Anchieta","tipo":"Igreja","membros":47}]},{"nome":"Ricardo de Albuquerque","igrejas":[{"nome":"Paiol","tipo":"Igreja","membros":62},{"nome":"Parque Anchieta","tipo":"Igreja","membros":70},{"nome":"Ricardo de Albuquerque","tipo":"Igreja","membros":85},{"nome":"Tomazinho","tipo":"Igreja","membros":81},{"nome":"Coelho da Rocha","tipo":"Grupo","membros":63},{"nome":"Jardim Bom Pastor","tipo":"Grupo","membros":34}]},{"nome":"Vilar dos Teles","igrejas":[{"nome":"Jardim Redentor","tipo":"Igreja","membros":44},{"nome":"Parque São José","tipo":"Igreja","membros":53},{"nome":"Parque São Pedro","tipo":"Igreja","membros":120},{"nome":"Vale das Mangueiras","tipo":"Igreja","membros":28},{"nome":"Vilar dos Teles","tipo":"Igreja","membros":218}]}]},{"nome":"5ª Região - Zona Oeste (Jacarepaguá)","distritos":[{"nome":"Barra da Tijuca","igrejas":[{"nome":"Barra da Tijuca","tipo":"Igreja","membros":842},{"nome":"Jardim Oceânico","tipo":"Grupo","membros":65},{"nome":"Bandeirantes","tipo":"Grupo","membros":44}]},{"nome":"Curicica","igrejas":[{"nome":"Curicica","tipo":"Igreja","membros":268},{"nome":"Santa Luzia","tipo":"Igreja","membros":81},{"nome":"Vargem Grande","tipo":"Igreja","membros":149},{"nome":"Vargem Pequena","tipo":"Igreja","membros":78}]},{"nome":"Freguesia","igrejas":[{"nome":"Freguesia","tipo":"Igreja","membros":430},{"nome":"Gardênia Azul","tipo":"Igreja","membros":153},{"nome":"Pinheiro","tipo":"Grupo","membros":77},{"nome":"Rio das Pedras","tipo":"Igreja","membros":85},{"nome":"Tijuquinha","tipo":"Igreja","membros":118}]},{"nome":"Recreio","igrejas":[{"nome":"Ilha de Guaratiba","tipo":"Grupo","membros":80},{"nome":"Recreio","tipo":"Igreja","membros":131},{"nome":"Cidade de Deus","tipo":"Igreja","membros":156}]},{"nome":"Taquara","igrejas":[{"nome":"Guerenguê","tipo":"Igreja","membros":105},{"nome":"Rio Grande","tipo":"Igreja","membros":140},{"nome":"Taquara","tipo":"Igreja","membros":332}]}]},{"nome":"6ª Região - Zona Norte (Madureira)","distritos":[{"nome":"Colégio","igrejas":[{"nome":"Coelho Neto","tipo":"Igreja","membros":137},{"nome":"Colégio","tipo":"Igreja","membros":590},{"nome":"Rocha Miranda","tipo":"Grupo","membros":45},{"nome":"Costa Barros","tipo":"Grupo","membros":46}]},{"nome":"Guadalupe","igrejas":[{"nome":"Guadalupe","tipo":"Igreja","membros":336},{"nome":"Guadalupe II","tipo":"Igreja","membros":71},{"nome":"Jardim Guadalupe","tipo":"Igreja","membros":77},{"nome":"Nova Esperança","tipo":"Grupo","membros":30},{"nome":"Cohab","tipo":"Igreja","membros":85}]},{"nome":"Jardim Novo Realengo","igrejas":[{"nome":"Jardim Novo Realengo","tipo":"Igreja","membros":276},{"nome":"Mallet","tipo":"Igreja","membros":144},{"nome":"Realengo","tipo":"Igreja","membros":82},{"nome":"Vila Militar","tipo":"Grupo","membros":47}]},{"nome":"Madureira","igrejas":[{"nome":"Madureira","tipo":"Igreja","membros":269},{"nome":"Osvaldo Cruz","tipo":"Igreja","membros":54},{"nome":"Piedade","tipo":"Igreja","membros":112},{"nome":"Quintino","tipo":"Igreja","membros":68},{"nome":"Bento Ribeiro","tipo":"Igreja","membros":48}]},{"nome":"Marechal Hermes","igrejas":[{"nome":"Magalhães Bastos","tipo":"Igreja","membros":58},{"nome":"Marechal Hermes","tipo":"Igreja","membros":62},{"nome":"Praça Seca","tipo":"Igreja","membros":85},{"nome":"Vila Valqueire","tipo":"Igreja","membros":135},{"nome":"Iapc","tipo":"Igreja","membros":81}]},{"nome":"Vila Kosmos","igrejas":[{"nome":"Irajá","tipo":"Igreja","membros":55},{"nome":"Vaz Lobo","tipo":"Igreja","membros":60},{"nome":"Vila da Penha","tipo":"Igreja","membros":65},{"nome":"Vila Kosmos","tipo":"Igreja","membros":226}]}]},{"nome":"7ª Região - Região Sul Fluminense","distritos":[{"nome":"Barra do Piraí","igrejas":[{"nome":"Mendes","tipo":"Grupo","membros":57},{"nome":"Passa Três","tipo":"Grupo","membros":14},{"nome":"Rio das Flores","tipo":"Grupo","membros":33},{"nome":"Valença","tipo":"Igreja","membros":83},{"nome":"Vassouras","tipo":"Igreja","membros":51},{"nome":"Barra Mansa","tipo":"Igreja","membros":228},{"nome":"Boa Sorte","tipo":"Igreja","membros":168},{"nome":"Boa Vista","tipo":"Igreja","membros":59}]},{"nome":"Barra Mansa","igrejas":[{"nome":"Goiabal","tipo":"Grupo","membros":42},{"nome":"Roma I","tipo":"Grupo","membros":36},{"nome":"Sobrado","tipo":"Grupo","membros":31},{"nome":"Vila Nova","tipo":"Grupo","membros":24},{"nome":"Vista Alegre","tipo":"Igreja","membros":54}]},{"nome":"Penedo","igrejas":[{"nome":"Penedo","tipo":"Igreja","membros":145},{"nome":"Cidade Alegria","tipo":"Igreja","membros":88},{"nome":"Itatiaia","tipo":"Igreja","membros":62}]},{"nome":"Resende","igrejas":[{"nome":"Novo Tempo","tipo":"Grupo","membros":31},{"nome":"Porto Real","tipo":"Igreja","membros":61},{"nome":"Quatis","tipo":"Grupo","membros":10},{"nome":"Resende","tipo":"Igreja","membros":287},{"nome":"Água Limpa","tipo":"Grupo","membros":16},{"nome":"Aterrado","tipo":"Igreja","membros":83}]},{"nome":"Volta Redonda","igrejas":[{"nome":"Parque Maira","tipo":"Grupo","membros":47},{"nome":"Pinheiral","tipo":"Igreja","membros":40},{"nome":"Recanto do Sol","tipo":"Igreja","membros":38},{"nome":"Retiro","tipo":"Igreja","membros":76},{"nome":"Santa Cruz II","tipo":"Grupo","membros":56},{"nome":"Santo Agostinho","tipo":"Igreja","membros":38},{"nome":"Volta Redonda","tipo":"Igreja","membros":278}]}]},{"nome":"8ª Região - Região Sul (Litorânea)","distritos":[{"nome":"Angra dos Reis","igrejas":[{"nome":"Camorim Grande","tipo":"Igreja","membros":41},{"nome":"Frade","tipo":"Grupo","membros":19},{"nome":"Mambucaba","tipo":"Igreja","membros":223},{"nome":"Mambucaba II","tipo":"Grupo","membros":42},{"nome":"Nova Angra","tipo":"Igreja","membros":137},{"nome":"Campo do Corisco","tipo":"Grupo","membros":29},{"nome":"Colônia","tipo":"Grupo","membros":42}]},{"nome":"Paraty","igrejas":[{"nome":"Coriscão","tipo":"Igreja","membros":39},{"nome":"Paraty","tipo":"Igreja","membros":131},{"nome":"Parque Verde","tipo":"Grupo","membros":50},{"nome":"Patrimônio","tipo":"Igreja","membros":163},{"nome":"Ponta da Trindade","tipo":"Igreja","membros":55},{"nome":"Sertão do Taquari","tipo":"Grupo","membros":16}]}]}]

type Igreja = { nome: string; tipo: string; membros: number }
type Distrito = { nome: string; igrejas: Igreja[] }
type Regiao = { nome: string; distritos: Distrito[] }

const mockSubvencoes = [
  { id: 1, regiao: "1ª Região - Zona Oeste (Central)", distrito: "Campo Grande", igreja: "Campo Grande", membros: 573, valor: 5730, data: "2026-06-10", status: "Recebido", obs: "" },
  { id: 2, regiao: "1ª Região - Zona Oeste (Central)", distrito: "Padre Miguel", igreja: "Padre Miguel", membros: 277, valor: 2770, data: "2026-06-10", status: "Pendente", obs: "Aguardando confirmação bancária" },
  { id: 3, regiao: "3ª Região - Baixada Fluminense (Iguaçuana)", distrito: "Nova Iguaçu", igreja: "Nova Iguaçu", membros: 545, valor: 5450, data: "2026-06-08", status: "Enviado", obs: "" },
  { id: 4, regiao: "4ª Região - Zona Norte (Pavunense)", distrito: "Pavuna", igreja: "Pavuna", membros: 493, valor: 4930, data: "2026-06-05", status: "Recebido", obs: "" },
  { id: 5, regiao: "5ª Região - Zona Oeste (Jacarepaguá)", distrito: "Barra da Tijuca", igreja: "Barra da Tijuca", membros: 842, valor: 8420, data: "2026-06-12", status: "Devolvido", obs: "Dados bancários incorretos" },
  { id: 6, regiao: "6ª Região - Zona Norte (Madureira)", distrito: "Colégio", igreja: "Colégio", membros: 590, valor: 5900, data: "2026-06-14", status: "Enviado", obs: "" },
]

const statusColor: Record<string, string> = {
  Enviado: "bg-blue-100 text-blue-700",
  Recebido: "bg-emerald-100 text-emerald-700",
  Pendente: "bg-yellow-100 text-yellow-700",
  Devolvido: "bg-red-100 text-red-700",
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function regiaoLabel(nome: string) {
  const m = nome.match(/^(\d+ª Região)/)
  return m ? m[1] : nome.split(" ")[0]
}

// Tri-state checkbox helper
function triCheck(total: number, selected: number) {
  if (selected === 0) return "none"
  if (selected === total) return "all"
  return "partial"
}

export default function SubvencoesPage() {
  // Selection sets — keys: "rIdx:dIdx:iIdx"
  const [selectedIgrejas, setSelectedIgrejas] = useState<Set<string>>(new Set())
  // Expanded state for regions and districts
  const [expandedR, setExpandedR] = useState<Set<number>>(new Set())
  const [expandedD, setExpandedD] = useState<Set<string>>(new Set())
  const [showSelector, setShowSelector] = useState(false)
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("Todos")

  // ── Key builders ──
  function rKey(ri: number) { return `${ri}` }
  function dKey(ri: number, di: number) { return `${ri}:${di}` }
  function iKey(ri: number, di: number, ii: number) { return `${ri}:${di}:${ii}` }

  // ── Toggle expand ──
  function toggleR(ri: number) {
    setExpandedR(prev => { const n = new Set(prev); n.has(ri) ? n.delete(ri) : n.add(ri); return n })
  }
  function toggleD(ri: number, di: number) {
    const k = dKey(ri, di)
    setExpandedD(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
  }

  // ── Toggle selection ──
  function toggleIgreja(key: string) {
    setSelectedIgrejas(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  function toggleDistrito(ri: number, di: number) {
    const distrito = REGIOES[ri].distritos[di]
    const keys = distrito.igrejas.map((_, ii) => iKey(ri, di, ii))
    const allSel = keys.every(k => selectedIgrejas.has(k))
    setSelectedIgrejas(prev => {
      const n = new Set(prev)
      if (allSel) keys.forEach(k => n.delete(k))
      else keys.forEach(k => n.add(k))
      return n
    })
  }

  function toggleRegiao(ri: number) {
    const regiao = REGIOES[ri]
    const keys = regiao.distritos.flatMap((d, di) => d.igrejas.map((_, ii) => iKey(ri, di, ii)))
    const allSel = keys.every(k => selectedIgrejas.has(k))
    setSelectedIgrejas(prev => {
      const n = new Set(prev)
      if (allSel) keys.forEach(k => n.delete(k))
      else keys.forEach(k => n.add(k))
      return n
    })
    // Also expand the region
    setExpandedR(prev => { const n = new Set(prev); n.add(ri); return n })
  }

  function clearAll() {
    setSelectedIgrejas(new Set())
    setExpandedR(new Set())
    setExpandedD(new Set())
  }

  // ── Stats ──
  const totalSel = selectedIgrejas.size
  const membrosSel = useMemo(() => {
    let total = 0
    REGIOES.forEach((r, ri) =>
      r.distritos.forEach((d, di) =>
        d.igrejas.forEach((ig, ii) => {
          if (selectedIgrejas.has(iKey(ri, di, ii))) total += ig.membros
        })
      )
    )
    return total
  }, [selectedIgrejas])

  // ── Chart data: top recipients by region/district/church ──
  type ChartLevel = "regiao" | "distrito" | "igreja"
  const [chartLevel, setChartLevel] = useState<ChartLevel>("regiao")

  const chartData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of mockSubvencoes) {
      const key = chartLevel === "regiao" ? s.regiao.split(" – ")[0].split(" (")[0]
        : chartLevel === "distrito" ? s.distrito
        : s.igreja
      map[key] = (map[key] ?? 0) + s.valor
    }
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0, 10)
  }, [chartLevel])
  const chartMax = chartData[0]?.[1] ?? 1

  // ── Table filter ──
  const filteredRecs = mockSubvencoes.filter(d => {
    if (statusFiltro !== "Todos" && d.status !== statusFiltro) return false
    if (busca && !d.igreja.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })
  const totalEnviado = mockSubvencoes.reduce((s, d) => s + d.valor, 0)
  const pendentes = mockSubvencoes.filter(d => d.status === "Pendente").length
  const devolvidos = mockSubvencoes.filter(d => d.status === "Devolvido").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Subvenções</h2>
          <p className="text-slate-500 mt-1">Repasses por região, distrito e igreja</p>
        </div>
        <Button className="gap-2" style={{ backgroundColor: "#006494" }} onClick={() => setShowSelector(!showSelector)}>
          <Plus className="w-4 h-4" />
          Nova Subvenção
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="card-hover-glow">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total Enviado</p>
            <p className="text-2xl font-bold text-slate-800 mt-1 valor-glow">{fmt(totalEnviado)}</p>
          </CardContent>
        </Card>
        <Card className="card-hover-glow">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1 valor-glow">{pendentes}</p>
          </CardContent>
        </Card>
        <Card className="card-hover-glow">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Devolvidos</p>
            <p className="text-2xl font-bold text-red-600 mt-1 valor-glow">{devolvidos}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Gráfico de Subvenções ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Maiores Receptores de Subvenção</CardTitle>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              {(["regiao","distrito","igreja"] as ChartLevel[]).map(l => (
                <button key={l} onClick={() => setChartLevel(l)}
                  className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                  style={{ background: chartLevel === l ? "#006494" : "#fff", color: chartLevel === l ? "#fff" : "#6B7280" }}>
                  {l === "regiao" ? "Região" : l === "distrito" ? "Distrito" : "Igreja"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chartData.map(([label, val]) => (
              <div key={label} className="flex items-center gap-3">
                <div className="shrink-0 text-xs text-right font-medium text-slate-600" style={{ width: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={label}>
                  {label}
                </div>
                <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: "#F1F5F9" }}>
                  <div className="h-full rounded-lg flex items-center px-2 transition-all"
                    style={{ width: `${(val/chartMax)*100}%`, background: "linear-gradient(to right, #006494, #1B98E0)", minWidth: 4 }}>
                    <span className="text-white text-xs font-semibold whitespace-nowrap" style={{ fontSize: 10 }}>{fmt(val)}</span>
                  </div>
                </div>
              </div>
            ))}
            {chartData.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Nenhuma subvenção registrada ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Seletor Hierárquico ─── */}
      {showSelector && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Selecionar Igrejas / Grupos</CardTitle>
              <div className="flex items-center gap-3">
                {totalSel > 0 && (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <strong>{totalSel}</strong> selecionada(s) · <strong>{membrosSel.toLocaleString("pt-BR")}</strong> membros
                  </span>
                )}
                {totalSel > 0 && (
                  <button onClick={clearAll} className="text-xs text-red-500 hover:underline">Limpar tudo</button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(REGIOES as Regiao[]).map((regiao, ri) => {
              const rKeys = regiao.distritos.flatMap((d, di) => d.igrejas.map((_, ii) => iKey(ri, di, ii)))
              const rSelCount = rKeys.filter(k => selectedIgrejas.has(k)).length
              const rCheck = triCheck(rKeys.length, rSelCount)
              const rExpanded = expandedR.has(ri)

              return (
                <div key={ri} className="border border-slate-200 rounded-xl overflow-hidden">
                  {/* Região header */}
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                    style={{ backgroundColor: "rgba(0,100,148,0.05)" }}
                    onClick={() => toggleR(ri)}
                  >
                    {/* checkbox */}
                    <button onClick={e => { e.stopPropagation(); toggleRegiao(ri) }} className="shrink-0 flex items-center justify-center w-5 h-5">
                      {rCheck === "all"
                        ? <CheckSquare className="w-4 h-4" style={{ color: "#006494" }} />
                        : rCheck === "partial"
                        ? <div className="w-4 h-4 rounded border-2 border-blue-500 flex items-center justify-center bg-blue-50"><div className="w-2 h-0.5 bg-blue-500 rounded" /></div>
                        : <Square className="w-4 h-4 text-slate-300" />}
                    </button>
                    <span className="text-sm font-bold text-slate-700 flex-1">{regiao.nome}</span>
                    <span className="text-xs text-slate-400">{regiao.distritos.length} distritos · {rKeys.length} igrejas</span>
                    {rSelCount > 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#006494" }}>
                        {rSelCount}
                      </span>
                    )}
                    {rExpanded ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                  </div>

                  {/* Distritos */}
                  {rExpanded && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                      {regiao.distritos.map((distrito, di) => {
                        const dKeys = distrito.igrejas.map((_, ii) => iKey(ri, di, ii))
                        const dSelCount = dKeys.filter(k => selectedIgrejas.has(k)).length
                        const dCheck = triCheck(dKeys.length, dSelCount)
                        const dk = dKey(ri, di)
                        const dExpanded = expandedD.has(dk)

                        return (
                          <div key={di}>
                            {/* Distrito header */}
                            <div
                              className="flex items-center gap-2 pl-7 pr-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                              onClick={() => toggleD(ri, di)}
                            >
                              <button onClick={e => { e.stopPropagation(); toggleDistrito(ri, di) }} className="shrink-0 flex items-center justify-center w-4 h-4">
                                {dCheck === "all"
                                  ? <CheckSquare className="w-4 h-4" style={{ color: "#1B98E0" }} />
                                  : dCheck === "partial"
                                  ? <div className="w-4 h-4 rounded border-2 border-blue-400 flex items-center justify-center bg-blue-50"><div className="w-2 h-0.5 bg-blue-400 rounded" /></div>
                                  : <Square className="w-4 h-4 text-slate-300" />}
                              </button>
                              <span className="text-sm font-semibold text-slate-600 flex-1 ml-1">Distrito {distrito.nome}</span>
                              <span className="text-xs text-slate-400">{distrito.igrejas.length} igrejas</span>
                              {dSelCount > 0 && (
                                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "#1B98E0" }}>
                                  {dSelCount}
                                </span>
                              )}
                              {dExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                            </div>

                            {/* Igrejas */}
                            {dExpanded && (
                              <div className="bg-slate-50/60 border-t border-slate-100 max-h-56 overflow-y-auto">
                                {distrito.igrejas.map((ig, ii) => {
                                  const k = iKey(ri, di, ii)
                                  const checked = selectedIgrejas.has(k)
                                  return (
                                    <button
                                      key={ii}
                                      onClick={() => toggleIgreja(k)}
                                      className={`w-full flex items-center gap-3 pl-12 pr-3 py-1.5 text-left transition-colors hover:bg-blue-50/60 ${checked ? "bg-blue-50" : ""}`}
                                    >
                                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${checked ? "border-transparent" : "border-slate-300"}`}
                                        style={checked ? { backgroundColor: "#006494" } : {}}>
                                        {checked && <span className="text-white text-[9px] font-bold leading-none">✓</span>}
                                      </span>
                                      <span className={`flex-1 text-sm ${checked ? "font-medium text-slate-800" : "text-slate-600"}`}>{ig.nome}</span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ig.tipo === "Igreja" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}>
                                        {ig.tipo}
                                      </span>
                                      <span className="text-xs text-slate-400 flex items-center gap-1 w-16 justify-end">
                                        <Users className="w-3 h-3" />{ig.membros > 0 ? ig.membros.toLocaleString("pt-BR") : "—"}
                                      </span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Action bar */}
            {totalSel > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">{totalSel}</span> igrejas/grupos ·{" "}
                  <span className="font-semibold text-slate-800">{membrosSel.toLocaleString("pt-BR")}</span> membros selecionados
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearAll}>Cancelar</Button>
                  <Button size="sm" style={{ backgroundColor: "#006494" }}>
                    Registrar Subvenções ({totalSel})
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 pb-3 space-y-3">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</label>
              <div className="flex gap-1 flex-wrap">
                {["Todos", "Enviado", "Recebido", "Pendente", "Devolvido"].map(s => (
                  <button key={s} onClick={() => setStatusFiltro(s)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${statusFiltro === s ? "text-white border-transparent" : "border-slate-200 hover:border-blue-300"}`}
                    style={statusFiltro === s ? { backgroundColor: "#006494" } : {}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input placeholder="Buscar igreja..." value={busca} onChange={e => setBusca(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-400 transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="pt-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-semibold text-slate-600">Igreja / Grupo</th>
                <th className="text-left py-3 px-2 font-semibold text-slate-600">Distrito</th>
                <th className="text-left py-3 px-2 font-semibold text-slate-600">Região</th>
                <th className="text-center py-3 px-2 font-semibold text-slate-600">Membros</th>
                <th className="text-right py-3 px-2 font-semibold text-slate-600">Valor</th>
                <th className="text-center py-3 px-2 font-semibold text-slate-600">Data</th>
                <th className="text-center py-3 px-2 font-semibold text-slate-600">Status</th>
                <th className="text-left py-3 px-2 font-semibold text-slate-600">Obs.</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecs.map(row => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 font-medium text-slate-800">{row.igreja}</td>
                  <td className="py-3 px-2 text-xs text-slate-500">{row.distrito}</td>
                  <td className="py-3 px-2 text-xs text-slate-400">{regiaoLabel(row.regiao)}</td>
                  <td className="py-3 px-2 text-center text-xs text-slate-500">
                    <span className="flex items-center justify-center gap-1"><Users className="w-3 h-3" />{row.membros.toLocaleString("pt-BR")}</span>
                  </td>
                  <td className="py-3 px-2 text-right font-medium">{fmt(row.valor)}</td>
                  <td className="py-3 px-2 text-center text-slate-500">{new Date(row.data).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[row.status]}`}>{row.status}</span>
                  </td>
                  <td className="py-3 px-2 text-slate-400 text-xs">{row.obs || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecs.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-8">Nenhum registro encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
