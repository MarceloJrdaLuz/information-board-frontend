import Link from "next/link"
import InformationBoardIcon from "../Icons/InformationBoardIcon"
import ThemeSwitcher from "../ThemeSwitcher"
import { themeAtom } from "@/atoms/themeAtoms"
import { useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { Download } from 'lucide-react'

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

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    )

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
    }
  }, [])

  const handleInstallApp = async () => {
    if (!installPrompt) return

    installPrompt.prompt()

    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }
  return (
    <footer
      className={`
      ${!isDark
          ? "bg-gradient-to-tl from-primary-200 to-primary-150"
          : "border-t border-typography-800 bg-gradient-to-b from-surface-100 to-surface-200"
        }
      text-surface-100
      px-4 py-6
      text-sm sm:text-base
    `}
    >
      {/* Ano + Congregação */}
      <div className="text-center font-medium">
        {ano} | {nomeCongregacao}
      </div>

      {/* Aviso */}
      <p className="mt-2 text-center font-semibold text-typography-300">
        {aviso}
      </p>

      {/* Ações */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-typography-200">

        {/* Instalar app */}
        {installPrompt && (
          <button
            onClick={handleInstallApp}
            className="
            inline-flex items-center gap-2
            rounded-lg px-3 py-2
            text-sm
            transition-all duration-200
            hover:bg-typography-100/10
            hover:underline
            hover:opacity-100
            opacity-80
          "
          >
            <Download className="h-4 w-4" />
            Instalar app
          </button>
        )}

        {/* Tema */}
        <div className="flex items-center">
          <ThemeSwitcher />
        </div>

        {/* Login */}
        <Link href="/login" className="flex items-center gap-1  transition text-primary-100">
          <InformationBoardIcon />
          <span className="text-xs hover:underline hover:opacity-80 sm:text-sm text-typography-200">Login</span>
        </Link>
        

        {/* Política de privacidade */}
        <Link
          href={`/${nCong}/politica-privacidade`}
          className="
          text-xs sm:text-sm
          text-typography-200
          transition
          hover:opacity-80
          hover:underline
        "
        >
          Política de privacidade
        </Link>

      </div>
    </footer>
  )
}
