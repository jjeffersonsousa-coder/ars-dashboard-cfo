// ── Tipos ─────────────────────────────────────────────────────────────────────
export type NivelAcesso = 1 | 2 | 3 | 4 | 5 | 6

export const NIVEL_LABEL: Record<NivelAcesso, string> = {
  1: "Administrador",
  2: "CFO / Tesoureiro",
  3: "Presidente",
  4: "Secretário Executivo",
  5: "Departamental",
  6: "Assistente",
}

// menus: array de hrefs permitidos. Vazio = acesso total (admin)
export interface Usuario {
  id: string
  nome: string
  email: string
  cpf: string          // somente dígitos: "12345678900"
  dataNascimento: string  // "DD/MM/AAAA"
  nivel: NivelAcesso
  ativo: boolean
  menus: string[]      // ex: ["/dashboard", "/orcamento"]. Vazio = todos
}

// ── Menus padrão por nível ────────────────────────────────────────────────────
// Nível 1: [] = acesso total (Super Admin)
// Nível 2: orçamento + budget + todos os módulos operacionais
// Nível 3: sem orçamento/budget (visão estratégica)
// Nível 4: foco em reuniões, decisões, POP, eventos
// Nível 5: dashboard + POP + reuniões (visão do departamento)
// Nível 6: ["__none__"] = nenhum acesso (cadastro apenas)
const M2 = ["/dashboard","/orcamento","/make-a-budget","/subvencoes","/implementacoes","/reunioes","/decisoes","/pop","/eventos","/help","/configuracoes"]
const M3 = ["/dashboard","/subvencoes","/implementacoes","/reunioes","/decisoes","/pop","/eventos","/help"]
const M4 = ["/dashboard","/reunioes","/decisoes","/pop","/eventos","/help"]
const M5 = ["/dashboard","/pop","/reunioes","/eventos"]
const M6 = ["/pop","/reunioes","/eventos"]

// ── Usuários base ─────────────────────────────────────────────────────────────
export const USUARIOS_BASE: Usuario[] = [
  { id: "u02911242599", nome: "Jefferson de Sousa Santos", email: "jefferson@ars.org", cpf: "02911242599", dataNascimento: "13/05/1989", nivel: 1, ativo: true, menus: [] },
  { id: "u83098984791", nome: "Geovane Felix de Souza", email: "geovane@ars.org", cpf: "83098984791", dataNascimento: "08/03/1966", nivel: 3, ativo: true, menus: M3 },
  { id: "u09776921671", nome: "Lucas Junio Rodrigues", email: "lucas@ars.org", cpf: "09776921671", dataNascimento: "11/10/1989", nivel: 2, ativo: true, menus: M2 },
  { id: "u09895500793", nome: "Jonas José Aguiar de Souza", email: "jonas@ars.org", cpf: "09895500793", dataNascimento: "22/07/1983", nivel: 4, ativo: true, menus: M4 },
  { id: "u03256171630", nome: "Patrick Marlon Chaves Ferreira", email: "patrick@ars.org", cpf: "03256171630", dataNascimento: "13/10/1977", nivel: 5, ativo: true, menus: M5 },
  { id: "u29075189842", nome: "Francis Miller de Andrade Silva", email: "francis@ars.org", cpf: "29075189842", dataNascimento: "20/10/1980", nivel: 5, ativo: true, menus: M5 },
  { id: "u06894013616", nome: "Maicon da Silva Galantini", email: "maicon@ars.org", cpf: "06894013616", dataNascimento: "09/10/1990", nivel: 5, ativo: true, menus: M5 },
  { id: "u05275936729", nome: "Bruno Augusto Maia", email: "bruno@ars.org", cpf: "05275936729", dataNascimento: "11/04/1981", nivel: 5, ativo: true, menus: M5 },
  { id: "u08308043747", nome: "Raquel Gonçalves Leite de Souza", email: "raquel@ars.org", cpf: "08308043747", dataNascimento: "22/07/1971", nivel: 5, ativo: true, menus: M5 },
  { id: "u11781936757", nome: "Ricardo Trentino Cordeiro", email: "ricardo@ars.org", cpf: "11781936757", dataNascimento: "10/01/1987", nivel: 5, ativo: true, menus: M5 },
  { id: "u57866856087", nome: "Robledo Moraes", email: "robledo@ars.org", cpf: "57866856087", dataNascimento: "11/05/1970", nivel: 5, ativo: true, menus: M5 },
  { id: "u12671481799", nome: "Ygor Almeida de Carvalho Silva", email: "ygor@ars.org", cpf: "12671481799", dataNascimento: "21/03/1986", nivel: 5, ativo: true, menus: M5 },
  { id: "u06005220675", nome: "Giuseppe Alves Borges e Silva", email: "giuseppe@ars.org", cpf: "06005220675", dataNascimento: "07/06/1982", nivel: 5, ativo: true, menus: M5 },
  { id: "u10149811748", nome: "Mariana Soares dos Santos de Souza", email: "mariana@ars.org", cpf: "10149811748", dataNascimento: "16/11/1983", nivel: 5, ativo: true, menus: M5 },
  { id: "u07164922454", nome: "Adla Ribeiro Sousa Santos", email: "", cpf: "07164922454", dataNascimento: "19/08/1990", nivel: 6, ativo: true, menus: M6 },
  { id: "u09727633684", nome: "Admilson Donizete de Paula Junior", email: "", cpf: "09727633684", dataNascimento: "15/01/1993", nivel: 6, ativo: true, menus: M6 },
  { id: "u06017025732", nome: "Alex Damião Moraes Oliveira", email: "", cpf: "06017025732", dataNascimento: "27/09/1981", nivel: 6, ativo: true, menus: M6 },
  { id: "u12308446781", nome: "Andreza da Silva Mendonça do Nascimento", email: "", cpf: "12308446781", dataNascimento: "05/02/1988", nivel: 6, ativo: true, menus: M6 },
  { id: "u31356508472", nome: "Anete de Freitas Cruz", email: "", cpf: "31356508472", dataNascimento: "15/03/1963", nivel: 6, ativo: true, menus: M6 },
  { id: "u17599421700", nome: "Brayan Sabino da Silva", email: "", cpf: "17599421700", dataNascimento: "12/02/1998", nivel: 6, ativo: true, menus: M6 },
  { id: "u19311157708", nome: "Breno da Silva Maravilha", email: "", cpf: "19311157708", dataNascimento: "10/11/2003", nivel: 6, ativo: true, menus: M6 },
  { id: "u12151775771", nome: "Bruna da Silva Pereira Costa", email: "", cpf: "12151775771", dataNascimento: "23/06/1989", nivel: 6, ativo: true, menus: M6 },
  { id: "u17022408785", nome: "Bruna Paim de Oliveira", email: "", cpf: "17022408785", dataNascimento: "29/10/1996", nivel: 6, ativo: true, menus: M6 },
  { id: "u01140008757", nome: "Calpa Rodrigues de Castro Belarmino da Mota", email: "", cpf: "01140008757", dataNascimento: "03/02/1968", nivel: 6, ativo: true, menus: M6 },
  { id: "u03793381307", nome: "Ceandreson Dias Amaro", email: "", cpf: "03793381307", dataNascimento: "26/03/1990", nivel: 6, ativo: true, menus: M6 },
  { id: "u07545484738", nome: "Cleber Tavares Silva Eler", email: "", cpf: "07545484738", dataNascimento: "05/03/1977", nivel: 6, ativo: true, menus: M6 },
  { id: "u08170276705", nome: "Cleuza Ferraz Gomes", email: "", cpf: "08170276705", dataNascimento: "31/01/1979", nivel: 6, ativo: true, menus: M6 },
  { id: "u01127753738", nome: "Cosme Gabriel da Silva", email: "", cpf: "01127753738", dataNascimento: "27/08/1971", nivel: 6, ativo: true, menus: M6 },
  { id: "u88069192534", nome: "Daniel da Silva Santos", email: "", cpf: "88069192534", dataNascimento: "21/10/1972", nivel: 6, ativo: true, menus: M6 },
  { id: "u00825175763", nome: "Daniel Mariano da Silva", email: "", cpf: "00825175763", dataNascimento: "24/03/1971", nivel: 6, ativo: true, menus: M6 },
  { id: "u08955141688", nome: "Daniely Ferreira Mello Rodrigues", email: "", cpf: "08955141688", dataNascimento: "30/05/1988", nivel: 6, ativo: true, menus: M6 },
  { id: "u06066764144", nome: "Danylo Wesley Duarte Bringel", email: "", cpf: "06066764144", dataNascimento: "19/10/2001", nivel: 6, ativo: true, menus: M6 },
  { id: "u16820537760", nome: "Deividy Marcilio Toledo", email: "", cpf: "16820537760", dataNascimento: "18/03/1996", nivel: 6, ativo: true, menus: M6 },
  { id: "u08971320508", nome: "Denisson Conceicao da Silva", email: "", cpf: "08971320508", dataNascimento: "26/04/1999", nivel: 6, ativo: true, menus: M6 },
  { id: "u10850778611", nome: "Djones Costa Teixeira", email: "", cpf: "10850778611", dataNascimento: "18/03/1992", nivel: 6, ativo: true, menus: M6 },
  { id: "u82354472234", nome: "Edjania Alves de Melo Oliveira", email: "", cpf: "82354472234", dataNascimento: "22/07/1973", nivel: 6, ativo: true, menus: M6 },
  { id: "u84945907153", nome: "Esli Victorio Garcia", email: "", cpf: "84945907153", dataNascimento: "01/11/1979", nivel: 6, ativo: true, menus: M6 },
  { id: "u50683632353", nome: "Francisco Alberto Barros Moreira", email: "", cpf: "50683632353", dataNascimento: "03/08/1974", nivel: 6, ativo: true, menus: M6 },
  { id: "u80727883453", nome: "Francisco de Assis de Oliveira", email: "", cpf: "80727883453", dataNascimento: "03/11/1969", nivel: 6, ativo: true, menus: M6 },
  { id: "u13921844797", nome: "Gabriel Rocha Alves Domiciano", email: "", cpf: "13921844797", dataNascimento: "01/07/2002", nivel: 6, ativo: true, menus: M6 },
  { id: "u14486861728", nome: "Gabrielle Silva Pereira", email: "", cpf: "14486861728", dataNascimento: "26/08/1996", nivel: 6, ativo: true, menus: M6 },
  { id: "u91822890772", nome: "Gilvane Nunes Ludgero", email: "", cpf: "91822890772", dataNascimento: "01/12/1964", nivel: 6, ativo: true, menus: M6 },
  { id: "u03836830256", nome: "Gustavo Schulz de Oliveira", email: "", cpf: "03836830256", dataNascimento: "09/08/2000", nivel: 6, ativo: true, menus: M6 },
  { id: "u03231107032", nome: "Heloisa Gomes de Paula", email: "", cpf: "03231107032", dataNascimento: "01/09/1994", nivel: 6, ativo: true, menus: M6 },
  { id: "u05735605607", nome: "Iale Clitias Azevedo Oliveira Mariano da Silva", email: "", cpf: "05735605607", dataNascimento: "04/06/1981", nivel: 6, ativo: true, menus: M6 },
  { id: "u05855061752", nome: "Isabelle da Motta Sampaio", email: "", cpf: "05855061752", dataNascimento: "30/07/1989", nivel: 6, ativo: true, menus: M6 },
  { id: "u94496722615", nome: "Jaqueline Gusmão Braun", email: "", cpf: "94496722615", dataNascimento: "08/09/1973", nivel: 6, ativo: true, menus: M6 },
  { id: "u95438661715", nome: "Joao Marcos da Silva Chaves", email: "", cpf: "95438661715", dataNascimento: "08/09/1967", nivel: 6, ativo: true, menus: M6 },
  { id: "u61019887672", nome: "Jose Custodio da Silva", email: "", cpf: "61019887672", dataNascimento: "29/10/1964", nivel: 6, ativo: true, menus: M6 },
  { id: "u14294936746", nome: "Leandro Ramon Pereira de Oliveira", email: "", cpf: "14294936746", dataNascimento: "01/10/1990", nivel: 6, ativo: true, menus: M6 },
  { id: "u21598075756", nome: "Levi Jose Silveira da Silva", email: "", cpf: "21598075756", dataNascimento: "16/12/2005", nivel: 6, ativo: true, menus: M6 },
  { id: "u14267254770", nome: "Luana de Souza Duarte", email: "", cpf: "14267254770", dataNascimento: "25/04/1994", nivel: 6, ativo: true, menus: M6 },
  { id: "u21287866735", nome: "Lucas de Godoy da Silva Bernardo", email: "", cpf: "21287866735", dataNascimento: "20/06/2002", nivel: 6, ativo: true, menus: M6 },
  { id: "u39247015200", nome: "Luiz Fernando Ferreira", email: "", cpf: "39247015200", dataNascimento: "15/10/1971", nivel: 6, ativo: true, menus: M6 },
  { id: "u03441607775", nome: "Marcelo de Carvalho da Silva", email: "", cpf: "03441607775", dataNascimento: "10/07/1973", nivel: 6, ativo: true, menus: M6 },
  { id: "u01449047726", nome: "Marcelo de Paiva Silva", email: "", cpf: "01449047726", dataNascimento: "26/11/1970", nivel: 6, ativo: true, menus: M6 },
  { id: "u97154881453", nome: "Marcos Antonio Dantas Gueiros", email: "", cpf: "97154881453", dataNascimento: "23/02/1975", nivel: 6, ativo: true, menus: M6 },
  { id: "u50959077553", nome: "Maria Aparecida Mendes dos Santos Faria", email: "", cpf: "50959077553", dataNascimento: "22/02/1970", nivel: 6, ativo: true, menus: M6 },
  { id: "u70951756320", nome: "Maria das Dores Pereira Barros", email: "", cpf: "70951756320", dataNascimento: "30/03/1976", nivel: 6, ativo: true, menus: M6 },
  { id: "u42779847204", nome: "Maria José da Silva Ferreira", email: "", cpf: "42779847204", dataNascimento: "19/12/1968", nivel: 6, ativo: true, menus: M6 },
  { id: "u11753879752", nome: "Marinaldo Santana do Nascimento", email: "", cpf: "11753879752", dataNascimento: "22/11/1987", nivel: 6, ativo: true, menus: M6 },
  { id: "u17747691742", nome: "Mateus Lourenço Fernandes", email: "", cpf: "17747691742", dataNascimento: "24/08/1998", nivel: 6, ativo: true, menus: M6 },
  { id: "u16513108748", nome: "Matheus Fernando da Silva Cardoso", email: "", cpf: "16513108748", dataNascimento: "23/01/1995", nivel: 6, ativo: true, menus: M6 },
  { id: "u14548748725", nome: "Matheus Rodrigues da Silva Santos", email: "", cpf: "14548748725", dataNascimento: "03/11/1990", nivel: 6, ativo: true, menus: M6 },
  { id: "u18369768792", nome: "Nathaly Cristina de Oliveira da Silva", email: "", cpf: "18369768792", dataNascimento: "06/11/2005", nivel: 6, ativo: true, menus: M6 },
  { id: "u13386529747", nome: "Noemi Conceição Lino da Silva", email: "", cpf: "13386529747", dataNascimento: "30/05/1988", nivel: 6, ativo: true, menus: M6 },
  { id: "u04630421661", nome: "Odilon Augusto Ricardo", email: "", cpf: "04630421661", dataNascimento: "01/07/1979", nivel: 6, ativo: true, menus: M6 },
  { id: "u15277729771", nome: "Pedro Rafael Thomé Lopes Machado", email: "", cpf: "15277729771", dataNascimento: "23/06/2008", nivel: 6, ativo: true, menus: M6 },
  { id: "u01826622411", nome: "Perola Eduarda de Carvalho", email: "", cpf: "01826622411", dataNascimento: "01/08/1999", nivel: 6, ativo: true, menus: M6 },
  { id: "u07118577766", nome: "Raimundo Francisco da Silva", email: "", cpf: "07118577766", dataNascimento: "10/07/1974", nivel: 6, ativo: true, menus: M6 },
  { id: "u61668532549", nome: "Rosangela de Almeida Souza Lima", email: "", cpf: "61668532549", dataNascimento: "17/05/1972", nivel: 6, ativo: true, menus: M6 },
  { id: "u07557161750", nome: "Silvia Letice Duarte Souza Pituba Santos", email: "", cpf: "07557161750", dataNascimento: "21/03/1974", nivel: 6, ativo: true, menus: M6 },
  { id: "u79882781772", nome: "Silvio Denante Spinola", email: "", cpf: "79882781772", dataNascimento: "11/10/1961", nivel: 6, ativo: true, menus: M6 },
  { id: "u87304333715", nome: "Sirlene Maria de Souza", email: "", cpf: "87304333715", dataNascimento: "27/04/1963", nivel: 6, ativo: true, menus: M6 },
  { id: "u05078282327", nome: "Suzana Silva dos Santos", email: "", cpf: "05078282327", dataNascimento: "07/02/1991", nivel: 6, ativo: true, menus: M6 },
  { id: "u16392210776", nome: "Vinicius Batista Reis da Silva", email: "", cpf: "16392210776", dataNascimento: "13/01/2005", nivel: 6, ativo: true, menus: M6 },
  { id: "u21625627742", nome: "Yago Jose da Silveira Silva", email: "", cpf: "21625627742", dataNascimento: "25/09/2004", nivel: 6, ativo: true, menus: M6 },
  { id: "u15646910714", nome: "Amanda da Silva Almeida Ferreira", email: "", cpf: "15646910714", dataNascimento: "07/05/1992", nivel: 6, ativo: true, menus: M6 },
  { id: "u10036787779", nome: "Bruno Theodorio Rodrigues", email: "", cpf: "10036787779", dataNascimento: "22/03/1984", nivel: 6, ativo: true, menus: M6 },
  { id: "u01111335729", nome: "Célia Valentina Mattos da Silva", email: "", cpf: "01111335729", dataNascimento: "14/02/1969", nivel: 6, ativo: true, menus: M6 },
  { id: "u36321837830", nome: "Eduina Melanie da Silva Rangel Demetrio Gonçalves", email: "", cpf: "36321837830", dataNascimento: "16/02/1988", nivel: 6, ativo: true, menus: M6 },
  { id: "u01175909750", nome: "Evandro Branco de Oliveira", email: "", cpf: "01175909750", dataNascimento: "15/08/1969", nivel: 6, ativo: true, menus: M6 },
  { id: "u02614542776", nome: "Hosana Medeiros Tavares Ferreira", email: "", cpf: "02614542776", dataNascimento: "11/09/1972", nivel: 6, ativo: true, menus: M6 },
  { id: "u14540406701", nome: "Raphael Castro Alexandre", email: "", cpf: "14540406701", dataNascimento: "20/04/1994", nivel: 6, ativo: true, menus: M6 },
  { id: "u00061200751", nome: "Angelica Vieira da Silva Chaves", email: "", cpf: "00061200751", dataNascimento: "12/10/1968", nivel: 6, ativo: true, menus: M6 },
  { id: "u19311136700", nome: "Beatriz da Silva Maravilha", email: "", cpf: "19311136700", dataNascimento: "10/11/2003", nivel: 6, ativo: true, menus: M6 },
  { id: "u02130539696", nome: "Brunna Kelly Rego Lisboa", email: "", cpf: "02130539696", dataNascimento: "03/09/1998", nivel: 6, ativo: true, menus: M6 },
  { id: "u01235417786", nome: "Cosme Motta", email: "", cpf: "01235417786", dataNascimento: "26/09/1969", nivel: 6, ativo: true, menus: M6 },
  { id: "u09278335738", nome: "Davison Alex Ferreira de Sousa", email: "", cpf: "09278335738", dataNascimento: "13/12/1979", nivel: 6, ativo: true, menus: M6 },
  { id: "u47896301881", nome: "Elisa Viaro de Lima", email: "", cpf: "47896301881", dataNascimento: "10/03/2004", nivel: 6, ativo: true, menus: M6 },
  { id: "u07137140343", nome: "Evandro William Souto Viana", email: "", cpf: "07137140343", dataNascimento: "03/02/1998", nivel: 6, ativo: true, menus: M6 },
  { id: "u05358791728", nome: "Jackeline Fernandes de França", email: "", cpf: "05358791728", dataNascimento: "09/11/1975", nivel: 6, ativo: true, menus: M6 },
  { id: "u04287013379", nome: "Jesse de Aguiar Castro", email: "", cpf: "04287013379", dataNascimento: "03/01/1991", nivel: 6, ativo: true, menus: M6 },
  { id: "u17012394773", nome: "Jessica Marques de Lima", email: "", cpf: "17012394773", dataNascimento: "09/10/1995", nivel: 6, ativo: true, menus: M6 },
  { id: "u93322100715", nome: "José Carolino Cardoso", email: "", cpf: "93322100715", dataNascimento: "15/09/1962", nivel: 6, ativo: true, menus: M6 },
  { id: "u59480084015", nome: "Lisiane Jacques Moraes", email: "", cpf: "59480084015", dataNascimento: "03/08/1974", nivel: 6, ativo: true, menus: M6 },
  { id: "u14942596645", nome: "Lorrany Gomes Veloso", email: "", cpf: "14942596645", dataNascimento: "13/06/2000", nivel: 6, ativo: true, menus: M6 },
  { id: "u14632603694", nome: "Luiz Felipe de Almeida Andrade", email: "", cpf: "14632603694", dataNascimento: "07/08/2000", nivel: 6, ativo: true, menus: M6 },
  { id: "u06998064705", nome: "Marcely Seixas da Rocha", email: "", cpf: "06998064705", dataNascimento: "14/10/1974", nivel: 6, ativo: true, menus: M6 },
  { id: "u06969599760", nome: "Maria Luiza Conceicao de Souza de Abreu", email: "", cpf: "06969599760", dataNascimento: "08/02/1974", nivel: 6, ativo: true, menus: M6 },
  { id: "u18520275761", nome: "Matheus Leandro da Silva Rosa", email: "", cpf: "18520275761", dataNascimento: "01/08/1998", nivel: 6, ativo: true, menus: M6 },
  { id: "u22127557751", nome: "Millena de Souza Magalhaes", email: "", cpf: "22127557751", dataNascimento: "09/03/2004", nivel: 6, ativo: true, menus: M6 },
  { id: "u16588722745", nome: "Nathan Lincon Batista Paiva", email: "", cpf: "16588722745", dataNascimento: "08/03/2007", nivel: 6, ativo: true, menus: M6 },
  { id: "u16974591705", nome: "Vanessa Pereira dos Santos", email: "", cpf: "16974591705", dataNascimento: "10/04/1997", nivel: 6, ativo: true, menus: M6 },
  { id: "u12529088730", nome: "Yuri Teodoro Sampaio", email: "", cpf: "12529088730", dataNascimento: "27/10/1988", nivel: 6, ativo: true, menus: M6 },
  { id: "u09088461775", nome: "Zilanda Machado de Almeida", email: "", cpf: "09088461775", dataNascimento: "12/08/1982", nivel: 6, ativo: true, menus: M6 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "")
}

export function findUsuario(cpf: string, dataNascimento: string): Usuario | null {
  const cpfNorm = normalizeCpf(cpf)
  const allUsers = getAllUsuarios()
  return allUsers.find(u =>
    u.ativo &&
    normalizeCpf(u.cpf) === cpfNorm &&
    u.dataNascimento === dataNascimento
  ) ?? null
}

export function getAllUsuarios(): Usuario[] {
  if (typeof window === "undefined") return USUARIOS_BASE
  try {
    const extra = localStorage.getItem("ars_usuarios_extra")
    const extraList: Usuario[] = extra ? JSON.parse(extra) : []
    // Merge: extra overrides base by id
    const baseFiltered = USUARIOS_BASE.filter(u => !extraList.find(e => e.id === u.id))
    return [...baseFiltered, ...extraList]
  } catch {
    return USUARIOS_BASE
  }
}
