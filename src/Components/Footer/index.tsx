import { installPromptAtom } from "@/atoms/atom"
import { themeAtom } from "@/atoms/themeAtoms"
import { useAtom, useAtomValue } from "jotai"
import { Download, Info, RefreshCw, Shield, X } from "lucide-react"
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
  const [installPrompt, setInstallPrompt] = useAtom(installPromptAtom)
  const [isStandalone, setIsStandalone] = useState(false)
  const [installedTheme, setInstalledTheme] = useState<string | null>(null)
  const [showReinstallModal, setShowReinstallModal] = useState(false)
  const [showManualInstallModal, setShowManualInstallModal] = useState(false)

  useEffect(() => {
    // Detecta se está rodando instalado como PWA (standalone)
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isNavigatorStandalone = (navigator as any).standalone === true
    setIsStandalone(Boolean(isDisplayStandalone || isNavigatorStandalone))

    const savedInstalledTheme = localStorage.getItem('pwa_installed_theme')
    if (savedInstalledTheme !== null) {
      setInstalledTheme(savedInstalledTheme)
    }
  }, [])

  const handleInstallApp = async () => {
    // Se não tiver o evento nativo capturado (ex: iOS ou cooldown do Chrome),
    // abre o modal explicativo com instruções passo a passo
    if (!installPrompt) {
      setShowManualInstallModal(true)
      return
    }

    try {
      // IMPORTANTE: Disparo direto e imediato para não perder o User Gesture do navegador
      await installPrompt.prompt()

      const { outcome } = await installPrompt.userChoice

      if (outcome === "accepted") {
        localStorage.setItem('pwa_installed_theme', themeAtomValue || '')
        setInstalledTheme(themeAtomValue || '')
        setInstallPrompt(null)
      }
    } catch (err) {
      console.warn("Falha ao invocar prompt nativo de instalação:", err)
      setShowManualInstallModal(true)
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
            {/* Se estiver no app já instalado e mudou o tema, sugere atualizar */}
            {isStandalone && installedTheme !== null && installedTheme !== (themeAtomValue || '') ? (
              <button
                onClick={() => setShowReinstallModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-all shadow-sm animate-pulse"
                title="Novo tema selecionado! Toque para atualizar o app instalado"
              >
                <RefreshCw size={13} />
                <span>Atualizar App</span>
              </button>
            ) : !isStandalone ? (
              /* Se não está instalado, exibe sempre o botão de Instalar App */
              <button
                onClick={handleInstallApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white font-medium transition-all shadow-sm"
              >
                <Download size={14} />
                <span>Instalar App</span>
              </button>
            ) : null}

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

      {/* Modal Educativo de Instalação Manual (para iOS ou caso o navegador retenha o prompt nativo) */}
      {showManualInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-100 border border-surface-300 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-typography-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-200 font-bold text-sm">
                <Download size={16} />
                <span>Como Instalar o App</span>
              </div>
              <button
                onClick={() => setShowManualInstallModal(false)}
                className="p-1 rounded-lg hover:bg-surface-200 text-typography-400 transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-typography-600 leading-relaxed">
              Você pode instalar este quadro como aplicativo direto no seu celular ou computador:
            </p>

            <div className="bg-surface-200 p-3.5 rounded-xl flex flex-col gap-3 text-xs text-typography-700">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-primary-200">No Android (Google Chrome):</span>
                <span>Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior do navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
              </div>

              <div className="h-px bg-surface-300/60" />

              <div className="flex flex-col gap-1">
                <span className="font-semibold text-primary-200">No iPhone / iPad (Safari):</span>
                <span>Toque no botão de <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) e selecione <strong>"Adicionar à Tela de Início"</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setShowManualInstallModal(false)}
              className="w-full py-2.5 px-4 bg-primary-200 hover:bg-primary-150 text-white font-medium rounded-xl text-xs transition active:scale-95 shadow-sm text-center"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Educativo de Atualização de Tema no App Instalado */}
      {showReinstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-100 border border-surface-300 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-typography-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-200 font-bold text-sm">
                <RefreshCw size={16} />
                <span>Atualizar App Instalado</span>
              </div>
              <button
                onClick={() => setShowReinstallModal(false)}
                className="p-1 rounded-lg hover:bg-surface-200 text-typography-400 transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-typography-600 leading-relaxed">
              Você alterou o tema do quadro! Para que a <strong>tela inicial e o ícone do seu celular</strong> exibam essa nova cor:
            </p>

            <div className="bg-surface-200 p-3 rounded-xl flex flex-col gap-2 text-xs text-typography-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary-200">1.</span>
                <span>Abra o site no navegador do celular (Chrome).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary-200">2.</span>
                <span>Escolha o tema desejado.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary-200">3.</span>
                <span>Toque em <strong>"Instalar App"</strong> no rodapé.</span>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem('pwa_installed_theme', themeAtomValue || '')
                setInstalledTheme(themeAtomValue || '')
                setShowReinstallModal(false)
              }}
              className="w-full py-2.5 px-4 bg-primary-200 hover:bg-primary-150 text-white font-medium rounded-xl text-xs transition active:scale-95 shadow-sm text-center"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </footer>
  )
}
