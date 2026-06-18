"use client"

export const SESSION_KEY = "ars_auth_session"

export interface Session {
  userId: string
  nome: string
  nivel: number
  menus: string[]   // hrefs permitidos; vazio = tudo (admin)
  initials: string
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const s = localStorage.getItem(SESSION_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function setSession(s: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function canAccessRoute(session: Session | null, href: string): boolean {
  if (!session) return false
  if (session.nivel === 1 || session.menus.length === 0) return true
  return session.menus.includes(href)
}

export function initials(nome: string): string {
  return nome.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase()
}
