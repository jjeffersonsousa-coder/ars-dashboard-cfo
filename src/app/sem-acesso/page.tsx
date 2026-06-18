"use client"

import { useRouter } from "next/navigation"
import { clearSession, getSession } from "@/lib/auth"
import { useEffect, useState } from "react"
import { ShieldX, LogOut } from "lucide-react"

export default function SemAcessoPage() {
  const router = useRouter()
  const [nome, setNome] = useState("")

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace("/login"); return }
    setNome(session.nome)
  }, [router])

  function handleLogout() {
    clearSession()
    router.replace("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0A1929 0%, #13293D 50%, #0A1929 100%)" }}>
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6"
          style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)" }}>
          <ShieldX className="w-10 h-10" style={{ color: "#DC2626" }} />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Acesso não autorizado</h1>

        {nome && (
          <p className="text-sm mb-1" style={{ color: "#1B98E0" }}>Olá, {nome.split(" ")[0]}.</p>
        )}

        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
          Seu cadastro está ativo, mas você ainda não possui acesso ao sistema.<br />
          Entre em contato com o administrador para solicitar permissão.
        </p>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>

        <p className="text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
          ARS Dashboard CFO · Associação Rio Sul da IASD
        </p>
      </div>
    </div>
  )
}
