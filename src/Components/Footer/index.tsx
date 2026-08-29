import { themeAtom } from "@/atoms/themeAtoms"
import { useAtomValue } from "jotai"
import { Download, Info, Shield } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import ThemeSwitcher from "../ThemeSwitcher"

interface FooterProps {
  ano: number | string
  nomeCongregacao: string
  aviso: string
  nCong?: string
}

export default function Footer({ ano, nomeCongregacao, aviso, nCong }: FooterProps) {
  const themeAtomValue = useAtomValue(themeAtom)
  const isDark = themeAtomValue === "theme-dark"
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!installPrompt) return

    installPrompt.prompt()

    const { outcome } = await installPrompt.userChoice

    if (outcome === "accepted") {
      setInstallPrompt(null)
    }
  }

  return (
    <footer
      className={`
        w-full transition-colors duration-300
        ${
          !isDark
            ? "bg-gradient-to-t from-primary-200 via-primary-200 to-primary-150 text-white"
            : "border-t border-surface-300/40 bg-surface-100 text-typography-300"
        }
        px-4 sm:px-6 py-6 sm:py-7
      `}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-5">
        {/* Bloco Superior: Nome da Congregação e Ano */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base tracking-wide text-white drop-shadow-sm">
              {nomeCongregacao}
            </span>
          </div>

          <span className="text-xs text-white/80 font-medium">
            © {ano} • Quadro de Anúncios
          </span>
        </div>

        {/* Card do Aviso Oficial de Privacidade / Uso */}
        {aviso && (
          <div
            className={`
              flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs text-center
              ${
                !isDark
                  ? "bg-black/15 text-white/95 border border-white/10"
                  : "bg-surface-200/80 text-typography-400 border border-surface-300/50"
              }
            `}
          >
            <Info size={14} className="shrink-0 text-white/80 opacity-90" />
            <span className="leading-snug">{aviso}</span>
          </div>
        )}

        {/* Linha Divisória Suave */}
        <div
          className={`w-full h-px ${
            !isDark ? "bg-white/15" : "bg-surface-300/40"
          }`}
        />

        {/* Barra de Ações (Chips / Links) */}
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 text-xs">
          {/* Lado Esquerdo: Ações Interativas (Instalar App & Mudar Tema com Label) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Instalar App */}
            {installPrompt && (
              <button
                onClick={handleInstallApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white font-medium transition-all shadow-sm"
              >
                <Download size={14} />
                <span>Instalar App</span>
              </button>
            )}

            {/* Mudar Tema em formato pill */}
            <ThemeSwitcher showLabel />
          </div>

          {/* Lado Direito: Link de Política de Privacidade */}
          <div className="flex items-center justify-center">
            <Link
              href={nCong ? `/${nCong}/politica-privacidade` : "/politica-privacidade"}
              className="flex items-center gap-1.5 text-white/85 hover:text-white hover:underline transition font-medium text-xs"
            >
              <Shield size={13} />
              <span>Política de Privacidade</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
