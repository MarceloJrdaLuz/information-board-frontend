import { installPromptAtom } from "@/atoms/atom"
import { setThemeAtom, themeAtom, themeColorsMap, ThemeType } from "@/atoms/themeAtoms"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Check, Download, Info, RefreshCw, Shield, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import ThemeSwitcher from "../ThemeSwitcher"

interface FooterProps {
  ano: number | string
  nomeCongregacao: string
  aviso: string
  nCong?: string
}

const themeOptions: { name: string; key: ThemeType; color: string; iconSrc: string }[] = [
  { name: "Verde (Padrão)", key: "", color: "#178582", iconSrc: "/icons/pwa-192.png" },
  { name: "Roxo Escuro", key: "theme-dark", color: "#6F4EA1", iconSrc: "/icons/pwa-theme-dark-192.png" },
  { name: "Azul", key: "theme-blue", color: "#3E6BA3", iconSrc: "/icons/pwa-theme-blue-192.png" },
  { name: "Roxo", key: "theme-purple", color: "#7B63AD", iconSrc: "/icons/pwa-theme-purple-192.png" },
  { name: "Rosa", key: "theme-pink", color: "#B6587D", iconSrc: "/icons/pwa-theme-pink-192.png" },
]

export default function Footer({ ano, nomeCongregacao, aviso, nCong }: FooterProps) {
  const themeAtomValue = useAtomValue(themeAtom)
  const changeTheme = useSetAtom(setThemeAtom)
  const isDark = themeAtomValue === "theme-dark"

  const [installPrompt, setInstallPrompt] = useAtom(installPromptAtom)
  const [isStandalone, setIsStandalone] = useState(false)
  const [installedTheme, setInstalledTheme] = useState<string | null>(null)

  // Modais
  const [showThemeInstallModal, setShowThemeInstallModal] = useState(false)
  const [showReinstallModal, setShowReinstallModal] = useState(false)
  const [showManualInstallModal, setShowManualInstallModal] = useState(false)

  // Tema original guardado caso o usuário cancele
  const [initialTheme, setInitialTheme] = useState<ThemeType>("")
  const [previewTheme, setPreviewTheme] = useState<ThemeType>("")

  useEffect(() => {
    // Detecta se está rodando instalado como PWA (standalone)
    const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isNavigatorStandalone = (navigator as any).standalone === true
    setIsStandalone(Boolean(isDisplayStandalone || isNavigatorStandalone))

    const savedInstalledTheme = localStorage.getItem("pwa_installed_theme")
    if (savedInstalledTheme !== null) {
      setInstalledTheme(savedInstalledTheme)
    }
  }, [])

  // Ao clicar em "Instalar App", abre o modal com o tema atual selecionado
  const handleOpenInstallModal = () => {
    const current = (themeAtomValue || "") as ThemeType
    setInitialTheme(current)
    setPreviewTheme(current)
    setShowThemeInstallModal(true)
  }

  // Ao selecionar uma cor dentro do modal
  const handleSelectPreviewTheme = (themeKey: ThemeType) => {
    setPreviewTheme(themeKey)
    // Aplica o tema na página em tempo real (Live Preview no fundo!)
    changeTheme(themeKey)
  }

  // Se o usuário cancelar/fechar o modal sem instalar
  const handleCancelModal = () => {
    setShowThemeInstallModal(false)
    // Se mudou de cor durante o preview mas desistiu, você pode manter ou restaurar.
    // Aqui mantemos suavemente o que ele estava ou permitimos manter a nova cor escolhida.
  }

  // Confirmar e disparar a instalação
  const handleConfirmInstall = async () => {
    setShowThemeInstallModal(false)

    // Se o navegador não suportar prompt nativo (iOS / Safari ou Chrome em cooldown)
    if (!installPrompt) {
      setShowManualInstallModal(true)
      return
    }

    try {
      // Disparo direto no clique do usuário para manter o User Gesture
      await installPrompt.prompt()

      const { outcome } = await installPrompt.userChoice

      if (outcome === "accepted") {
        localStorage.setItem("pwa_installed_theme", previewTheme || "")
        setInstalledTheme(previewTheme || "")
        setInstallPrompt(null)
      }
    } catch (err) {
      console.warn("Falha no prompt nativo de instalação:", err)
      setShowManualInstallModal(true)
    }
  }

  const selectedThemeObj =
    themeOptions.find((t) => t.key === previewTheme) || themeOptions[0]

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
            {isStandalone && installedTheme !== null && installedTheme !== (themeAtomValue || "") ? (
              <button
                onClick={() => setShowReinstallModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-all shadow-sm animate-pulse"
                title="Novo tema selecionado! Toque para atualizar o app instalado"
              >
                <RefreshCw size={13} />
                <span>Atualizar App</span>
              </button>
            ) : !isStandalone ? (
              /* Se não está instalado, botão abre o modal de escolha e preview */
              <button
                onClick={handleOpenInstallModal}
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

      {/* MODAL DE ESCOLHA DE TEMA E PRÉ-VISUALIZAÇÃO ANTES DE INSTALAR */}
      {showThemeInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
          <div className="bg-surface-100 border border-surface-300 rounded-2xl max-w-md w-full shadow-2xl text-typography-800 flex flex-col overflow-hidden animate-scaleIn">
            
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-300/70">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary-200/10 text-primary-200">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-typography-900 leading-tight">
                    Escolha o Tema do App
                  </h3>
                  <p className="text-[11px] text-typography-500">
                    Veja como ficará antes de instalar no seu celular
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelModal}
                className="p-1 rounded-lg hover:bg-surface-200 text-typography-400 hover:text-typography-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Corpo: Mockup do Smartphone + Cores */}
            <div className="p-4 sm:p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              
              {/* Mockup Interativo de Celular com Live Preview */}
              <div className="flex justify-center items-center py-1">
                <div className="w-56 bg-slate-900 rounded-[28px] p-2.5 shadow-xl border-4 border-slate-700/80 transition-transform duration-200">
                  {/* Speaker & Sensor Notch */}
                  <div className="w-20 h-3 bg-slate-800 rounded-full mx-auto mb-1.5 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                  </div>

                  {/* Tela do Celular */}
                  <div className="bg-surface-200 rounded-[20px] overflow-hidden flex flex-col h-60 text-[9px] select-none border border-slate-700/30">
                    
                    {/* Barra de Status do Mockup */}
                    <div
                      className="px-3 py-1 flex items-center justify-between text-white font-bold transition-colors duration-300"
                      style={{ backgroundColor: selectedThemeObj.color }}
                    >
                      <span className="text-[8px]">09:41</span>
                      <div className="flex items-center gap-1 text-[7px]">
                        <span>5G</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Top Header do Quadro no Mockup */}
                    <div
                      className="px-2.5 py-2 text-white flex items-center justify-between shadow-sm transition-colors duration-300"
                      style={{ backgroundColor: selectedThemeObj.color }}
                    >
                      <div className="truncate font-semibold text-[10px]">
                        {nomeCongregacao || "Quadro de Anúncios"}
                      </div>
                      <img
                        src={selectedThemeObj.iconSrc}
                        alt="Ícone"
                        className="w-5 h-5 rounded-md shadow-sm border border-white/20 shrink-0"
                      />
                    </div>

                    {/* Conteúdo Simulado (Cards do Quadro) */}
                    <div className="p-2 flex-1 flex flex-col gap-1.5 overflow-hidden">
                      <div className="text-[8px] font-bold text-typography-500 uppercase tracking-wider">
                        Visão Geral
                      </div>

                      {/* Mini Cards */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-surface-100 p-1.5 rounded-lg border border-surface-300 shadow-2xs flex flex-col gap-0.5">
                          <span
                            className="font-bold text-[9px] transition-colors"
                            style={{ color: selectedThemeObj.color }}
                          >
                            Relatório
                          </span>
                          <span className="text-[7px] text-typography-500">Envio mensal</span>
                        </div>
                        <div className="bg-surface-100 p-1.5 rounded-lg border border-surface-300 shadow-2xs flex flex-col gap-0.5">
                          <span
                            className="font-bold text-[9px] transition-colors"
                            style={{ color: selectedThemeObj.color }}
                          >
                            Reuniões
                          </span>
                          <span className="text-[7px] text-typography-500">Programação</span>
                        </div>
                        <div className="bg-surface-100 p-1.5 rounded-lg border border-surface-300 shadow-2xs flex flex-col gap-0.5">
                          <span
                            className="font-bold text-[9px] transition-colors"
                            style={{ color: selectedThemeObj.color }}
                          >
                            Limpeza
                          </span>
                          <span className="text-[7px] text-typography-500">Escala</span>
                        </div>
                        <div className="bg-surface-100 p-1.5 rounded-lg border border-surface-300 shadow-2xs flex flex-col gap-0.5">
                          <span
                            className="font-bold text-[9px] transition-colors"
                            style={{ color: selectedThemeObj.color }}
                          >
                            Campo
                          </span>
                          <span className="text-[7px] text-typography-500">Saídas</span>
                        </div>
                      </div>

                      {/* Mini Ícone do App que vai pra tela inicial */}
                      <div className="mt-auto bg-surface-100/90 p-1.5 rounded-lg border border-surface-300 flex items-center gap-2">
                        <img
                          src={selectedThemeObj.iconSrc}
                          alt="Ícone na tela"
                          className="w-6 h-6 rounded-lg shadow-sm shrink-0"
                        />
                        <div className="flex flex-col truncate">
                          <span className="font-bold text-[8px] text-typography-800 truncate">
                            Ícone do Aplicativo
                          </span>
                          <span className="text-[7px] text-typography-500">
                            Na cor {selectedThemeObj.name.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seletor de Paleta de Cores */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-typography-700">
                  Selecione uma cor:
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {themeOptions.map((item) => {
                    const isSelected = previewTheme === item.key
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleSelectPreviewTheme(item.key)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                          isSelected
                            ? "border-primary-200 bg-primary-200/10 ring-2 ring-primary-200/30 scale-102"
                            : "border-surface-300 hover:bg-surface-200"
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full shadow-inner flex items-center justify-center text-white"
                          style={{ backgroundColor: item.color }}
                        >
                          {isSelected && <Check size={14} className="stroke-[3]" />}
                        </div>
                        <span className="text-[10px] font-medium text-typography-700 text-center leading-tight truncate w-full">
                          {item.name.split(" ")[0]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-surface-200/80 p-2.5 rounded-xl text-[11px] text-typography-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
                <span>
                  O site e o ícone serão configurados exatamente com a cor{" "}
                  <strong className="text-typography-900 font-semibold">
                    {selectedThemeObj.name}
                  </strong>
                  .
                </span>
              </div>
            </div>

            {/* Rodapé de Ações do Modal */}
            <div className="p-4 border-t border-surface-300/70 bg-surface-200/40 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCancelModal}
                className="w-full sm:w-1/3 py-2.5 px-3 rounded-xl border border-surface-300 hover:bg-surface-200 text-typography-700 text-xs font-medium transition"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmInstall}
                className="w-full sm:w-2/3 py-2.5 px-4 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md active:scale-95"
                style={{ backgroundColor: selectedThemeObj.color }}
              >
                <Download size={15} />
                <span>Instalar com este tema</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Educativo de Instalação Manual (para iOS Safari ou caso o navegador retenha o prompt) */}
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
              O tema escolhido já foi ativado! Para adicionar o ícone à sua tela inicial:
            </p>

            <div className="bg-surface-200 p-3.5 rounded-xl flex flex-col gap-3 text-xs text-typography-700">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-primary-200">No Android (Google Chrome):</span>
                <span>
                  Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior do navegador e selecione{" "}
                  <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                </span>
              </div>

              <div className="h-px bg-surface-300/60" />

              <div className="flex flex-col gap-1">
                <span className="font-semibold text-primary-200">No iPhone / iPad (Safari):</span>
                <span>
                  Toque no botão de <strong>Compartilhar</strong> (quadrado com seta para cima) e selecione{" "}
                  <strong>"Adicionar à Tela de Início"</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowManualInstallModal(false)}
              className="w-full py-2.5 px-4 bg-primary-200 hover:bg-primary-150 text-white font-medium rounded-xl text-xs transition active:scale-95 shadow-sm text-center"
            >
              Entendido
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
              Você alterou o tema do quadro! Para que a{" "}
              <strong>tela inicial e o ícone do seu celular</strong> exibam essa nova cor:
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
                <span>
                  Toque em <strong>"Instalar App"</strong> no rodapé.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem("pwa_installed_theme", themeAtomValue || "")
                setInstalledTheme(themeAtomValue || "")
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
