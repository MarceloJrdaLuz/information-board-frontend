'use client'

import { useAuthContext } from "@/context/AuthContext"
import { Hash, Shield } from "lucide-react"
import Link from "next/link"
import ThemeSwitcher from "../ThemeSwitcher"

export default function FooterDashboard() {
  const { user } = useAuthContext()

  return (
    <footer className="w-full bg-gradient-to-r from-primary-200 via-primary-200 to-primary-150 text-white shadow-md border-t border-white/10 py-3 sm:py-3.5 px-4 sm:px-6">
      <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Lado Esquerdo: Seletor de Tema */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher showLabel />
        </div>

        {/* Centro: Código do Usuário em Chip Moderno */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 border border-white/20 text-white font-mono text-xs font-semibold shadow-2xs backdrop-blur-xs">
            <Hash size={13} className="text-white/70" />
            <span>Código: {user?.code ?? "—"}</span>
          </span>
        </div>

        {/* Lado Direito: Links de Privacidade e Termos */}
        <div className="flex items-center gap-4">
          <Link
            href="/termos-de-uso"
            className="inline-flex items-center gap-1.5 text-white/85 hover:text-white hover:underline transition-colors font-medium"
          >
            <Shield size={13} />
            <span>Termos e Privacidade</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}