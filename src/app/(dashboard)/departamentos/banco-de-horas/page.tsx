"use client"

export default function BancoDeHorasPage() {
  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <iframe
        src="/banco-de-horas.html"
        style={{ flex: 1, border: "none", width: "100%", height: "100%" }}
        title="Controle Banco de Horas"
      />
    </div>
  )
}
