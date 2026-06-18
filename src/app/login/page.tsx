"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { findUsuario } from "@/data/usuarios"
import { setSession, initials } from "@/lib/auth"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"

function maskCpf(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function maskData(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8)
  return d
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
}

export default function LoginPage() {
  const router = useRouter()
  const [cpf, setCpf] = useState("")
  const [dataNasc, setDataNasc] = useState("")
  const [showData, setShowData] = useState(false)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  function handleCpf(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(maskCpf(e.target.value))
    setErro("")
  }

  function handleData(e: React.ChangeEvent<HTMLInputElement>) {
    setDataNasc(maskData(e.target.value))
    setErro("")
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (cpf.replace(/\D/g, "").length < 11) { setErro("CPF inválido."); return }
    if (dataNasc.length < 10) { setErro("Data de nascimento incompleta."); return }

    setLoading(true)
    // Small delay for UX
    setTimeout(() => {
      const user = findUsuario(cpf, dataNasc)
      if (!user) {
        setErro("CPF ou data de nascimento incorretos, ou usuário não autorizado.")
        setLoading(false)
        return
      }
      setSession({
        userId: user.id,
        nome: user.nome,
        nivel: user.nivel,
        menus: user.menus,
        initials: initials(user.nome),
      })
      router.push("/dashboard")
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0A1929 0%, #13293D 50%, #0A1929 100%)" }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #1B98E0, transparent)" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #006494, transparent)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.97)" }}>
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ background: "#13293D" }}>
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 font-bold text-white text-xl"
              style={{ background: "linear-gradient(135deg, #1B98E0, #006494)" }}>
              AR
            </div>
            <h1 className="text-xl font-bold text-white leading-tight">ARS Dashboard CFO</h1>
            <p className="text-sm mt-1" style={{ color: "#1B98E0" }}>Associação Rio Sul da IASD</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-7 space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-700 text-center mb-5">Acesse com seu CPF e data de nascimento</p>
            </div>

            {/* CPF */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">CPF</label>
              <input
                type="text"
                inputMode="numeric"
                value={cpf}
                onChange={handleCpf}
                placeholder="000.000.000-00"
                autoComplete="off"
                required
                className="w-full px-4 py-3 rounded-xl border-2 text-sm font-mono outline-none transition-all"
                style={{
                  borderColor: erro ? "#DC2626" : cpf.replace(/\D/g,"").length === 11 ? "#059669" : "#E2E8F0",
                  color: "#1E293B",
                }}
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Data de Nascimento</label>
              <div className="relative">
                <input
                  type={showData ? "text" : "password"}
                  inputMode="numeric"
                  value={dataNasc}
                  onChange={handleData}
                  placeholder="DD/MM/AAAA"
                  autoComplete="off"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl border-2 text-sm font-mono outline-none transition-all"
                  style={{
                    borderColor: erro ? "#DC2626" : dataNasc.length === 10 ? "#059669" : "#E2E8F0",
                    color: "#1E293B",
                    letterSpacing: showData ? "normal" : dataNasc ? "0.3em" : "normal",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowData(!showData)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100"
                  tabIndex={-1}
                >
                  {showData
                    ? <EyeOff className="w-4 h-4 text-slate-400" />
                    : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-1">Formato: DD/MM/AAAA</p>
            </div>

            {/* Erro */}
            {erro && (
              <div className="rounded-xl px-4 py-3 text-xs font-medium" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                {erro}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
              style={{
                background: loading ? "#94A3B8" : "linear-gradient(135deg, #006494, #1B98E0)",
                boxShadow: loading ? "none" : "0 4px 14px rgba(0,100,148,0.4)",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Entrar
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 pt-1">
              Acesso restrito a colaboradores autorizados.<br />Em caso de dúvidas, contate o administrador.
            </p>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
          © {new Date().getFullYear()} Associação Rio Sul · v2.0
        </p>
      </div>
    </div>
  )
}
