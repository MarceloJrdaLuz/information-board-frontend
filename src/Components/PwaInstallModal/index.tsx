import { installPromptAtom } from "@/atoms/atom"
import { setThemeAtom, themeAtom, ThemeType } from "@/atoms/themeAtoms"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import {
  Check,
  Download,
  Laptop,
  Smartphone,
  Sparkles,
  Tablet,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"

interface PwaInstallModalProps {
  isOpen: boolean
  onClose: () => void
  onManualInstall: () => void
  nomeCongregacao?: string
}

export type DeviceType = "mobile" | "tablet" | "desktop"

export const themeOptions: { name: string; key: ThemeType; color: string; iconSrc: string }[] = [
  { name: "Padrão", key: "", color: "#178582", iconSrc: "/icons/pwa-192.png" },
  { name: "Escuro", key: "theme-dark", color: "#6F4EA1", iconSrc: "/icons/pwa-theme-dark-192.png" },
  { name: "Azul", key: "theme-blue", color: "#3E6BA3", iconSrc: "/icons/pwa-theme-blue-192.png" },
  { name: "Roxo", key: "theme-purple", color: "#7B63AD", iconSrc: "/icons/pwa-theme-purple-192.png" },
  { name: "Rosa", key: "theme-pink", color: "#B6587D", iconSrc: "/icons/pwa-theme-pink-192.png" },
]

export default function PwaInstallModal({
  isOpen,
  onClose,
  onManualInstall,
  nomeCongregacao,
}: PwaInstallModalProps) {
  const themeAtomValue = useAtomValue(themeAtom)
  const changeTheme = useSetAtom(setThemeAtom)
  const [installPrompt, setInstallPrompt] = useAtom(installPromptAtom)

  // Tema em pré-visualização
  const [previewTheme, setPreviewTheme] = useState<ThemeType>("")
  const [currentDevice, setCurrentDevice] = useState<DeviceType>("mobile")

  useEffect(() => {
    if (isOpen) {
      const current = (themeAtomValue || "") as ThemeType
      setPreviewTheme(current)

      // Detecta formato do dispositivo atual
      const width = window.innerWidth
      const ua = navigator.userAgent.toLowerCase()
      const isTabletUA = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)

      if (width < 640) {
        setCurrentDevice("mobile")
      } else if (width < 1024 || isTabletUA) {
        setCurrentDevice("tablet")
      } else {
        setCurrentDevice("desktop")
      }
    }
  }, [isOpen, themeAtomValue])

  if (!isOpen) return null

  const handleSelectPreviewTheme = (themeKey: ThemeType) => {
    setPreviewTheme(themeKey)
    changeTheme(themeKey) // Live preview em tempo real no fundo
  }

  const handleConfirmInstall = async () => {
    onClose()

    if (!installPrompt) {
      onManualInstall()
      return
    }

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice

      if (outcome === "accepted") {
        localStorage.setItem("pwa_installed_theme", previewTheme || "")
        setInstallPrompt(null)
      }
    } catch (err) {
      console.warn("Falha no prompt nativo de instalação:", err)
      onManualInstall()
    }
  }

  const selectedThemeObj =
    themeOptions.find((t) => t.key === previewTheme) || themeOptions[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-100 border border-surface-300 rounded-2xl max-w-lg w-full max-h-[92dvh] shadow-2xl text-typography-800 flex flex-col overflow-hidden animate-scaleIn">
        
        {/* Cabeçalho do Modal com Alternador de Dispositivo */}
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-5 sm:py-3.5 border-b border-surface-300/70 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-1">
            <span className="p-1 sm:p-1.5 rounded-lg bg-primary-200/10 text-primary-200 shrink-0">
              <Sparkles size={15} className="sm:w-[18px] sm:h-[18px]" />
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-typography-900 leading-tight truncate">
                Escolha o Tema
              </h3>
              <p className="text-[10px] sm:text-[11px] text-typography-500 truncate hidden xs:block">
                Pré-visualize no seu dispositivo
              </p>
            </div>
          </div>

          {/* Botões para alternar dispositivo no mockup */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-surface-200/80 p-0.5 sm:p-1 rounded-xl border border-surface-300/60 shrink-0">
            <button
              onClick={() => setCurrentDevice("mobile")}
              className={`p-1 sm:p-1.5 rounded-lg transition ${
                currentDevice === "mobile"
                  ? "bg-surface-100 text-primary-200 shadow-2xs font-bold"
                  : "text-typography-400 hover:text-typography-700"
              }`}
              title="Smartphone"
            >
              <Smartphone size={13} className="sm:w-[14px] sm:h-[14px]" />
            </button>
            <button
              onClick={() => setCurrentDevice("tablet")}
              className={`p-1 sm:p-1.5 rounded-lg transition ${
                currentDevice === "tablet"
                  ? "bg-surface-100 text-primary-200 shadow-2xs font-bold"
                  : "text-typography-400 hover:text-typography-700"
              }`}
              title="Tablet"
            >
              <Tablet size={13} className="sm:w-[14px] sm:h-[14px]" />
            </button>
            <button
              onClick={() => setCurrentDevice("desktop")}
              className={`p-1 sm:p-1.5 rounded-lg transition ${
                currentDevice === "desktop"
                  ? "bg-surface-100 text-primary-200 shadow-2xs font-bold"
                  : "text-typography-400 hover:text-typography-700"
              }`}
              title="Computador / Notebook"
            >
              <Laptop size={13} className="sm:w-[14px] sm:h-[14px]" />
            </button>
            <div className="w-px h-3 bg-surface-300 mx-0.5" />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-surface-200 text-typography-400 hover:text-typography-700 transition"
              title="Fechar"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Corpo: Mockup Adaptativo + Cores */}
        <div className="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 overflow-y-auto min-h-0 flex-1">
          
          {/* MOCKUPS ADAPTATIVOS */}
          <div className="flex justify-center items-center py-2">
            
            {/* 1. SMARTPHONE */}
            {currentDevice === "mobile" && (
              <div className="w-36 sm:w-44 bg-slate-950 rounded-[24px] sm:rounded-[32px] p-1 sm:p-1.5 shadow-xl sm:shadow-2xl ring-1 ring-white/10 transition-all duration-300 animate-fadeIn">
                <div className="bg-surface-200 rounded-[20px] sm:rounded-[26px] overflow-hidden flex flex-col h-56 sm:h-72 text-[9px] select-none relative">
                  {/* Status Bar com Notch integrado */}
                  <div
                    className="px-2 sm:px-3 pt-1 sm:pt-1.5 pb-0.5 sm:pb-1 flex items-center justify-between text-white font-bold transition-colors duration-300 relative"
                    style={{ backgroundColor: selectedThemeObj.color }}
                  >
                    <span className="text-[7px] sm:text-[8px] tracking-tight pl-0.5 sm:pl-1 font-semibold">09:41</span>
                    <div className="absolute left-1/2 -translate-x-1/2 top-1 sm:top-1.5 h-2.5 sm:h-3 px-1.5 sm:px-2 bg-black/80 rounded-full flex items-center gap-1 shadow-xs border border-white/5">
                      <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-slate-950 ring-1 ring-slate-800"></div>
                      <div className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 text-[6.5px] sm:text-[7px] pr-0.5 sm:pr-1 opacity-90">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Header */}
                  <div
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-white flex items-center justify-between shadow-sm transition-colors duration-300"
                    style={{ backgroundColor: selectedThemeObj.color }}
                  >
                    <div className="truncate font-bold text-[9px] sm:text-[10px] tracking-tight">
                      {nomeCongregacao || "Quadro de Anúncios"}
                    </div>
                    <img
                      src={selectedThemeObj.iconSrc}
                      alt="Ícone"
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md shadow-sm border border-white/20 shrink-0"
                    />
                  </div>

                  {/* Conteúdo */}
                  <div className="p-2 sm:p-2.5 flex-1 flex flex-col gap-1 sm:gap-1.5 overflow-hidden">
                    <div className="text-[7px] sm:text-[8px] font-bold text-typography-500 uppercase tracking-wider">
                      Visão Geral
                    </div>
                    <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                      <div className="bg-surface-100 p-1 sm:p-1.5 rounded-lg border border-surface-300/80 shadow-2xs flex flex-col gap-0.5">
                        <span className="font-bold text-[8px] sm:text-[9px]" style={{ color: selectedThemeObj.color }}>Relatório</span>
                        <span className="text-[6.5px] sm:text-[7px] text-typography-500">Envio mensal</span>
                      </div>
                      <div className="bg-surface-100 p-1 sm:p-1.5 rounded-lg border border-surface-300/80 shadow-2xs flex flex-col gap-0.5">
                        <span className="font-bold text-[8px] sm:text-[9px]" style={{ color: selectedThemeObj.color }}>Reuniões</span>
                        <span className="text-[6.5px] sm:text-[7px] text-typography-500">Programação</span>
                      </div>
                      <div className="bg-surface-100 p-1 sm:p-1.5 rounded-lg border border-surface-300/80 shadow-2xs flex flex-col gap-0.5">
                        <span className="font-bold text-[8px] sm:text-[9px]" style={{ color: selectedThemeObj.color }}>Limpeza</span>
                        <span className="text-[6.5px] sm:text-[7px] text-typography-500">Escala</span>
                      </div>
                      <div className="bg-surface-100 p-1 sm:p-1.5 rounded-lg border border-surface-300/80 shadow-2xs flex flex-col gap-0.5">
                        <span className="font-bold text-[8px] sm:text-[9px]" style={{ color: selectedThemeObj.color }}>Campo</span>
                        <span className="text-[6.5px] sm:text-[7px] text-typography-500">Saídas</span>
                      </div>
                    </div>

                    <div className="mt-auto bg-surface-100 p-1 sm:p-1.5 rounded-xl border border-surface-300/80 flex items-center gap-1.5 sm:gap-2 shadow-2xs">
                      <img
                        src={selectedThemeObj.iconSrc}
                        alt="Ícone na tela"
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg shadow-sm shrink-0"
                      />
                      <div className="flex flex-col truncate">
                        <span className="font-bold text-[7.5px] sm:text-[8px] text-typography-800 truncate">
                          Ícone do Aplicativo
                        </span>
                        <span className="text-[6.5px] sm:text-[7px] text-typography-500 truncate">
                          Na cor {selectedThemeObj.name.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pb-1 pt-0.5 flex justify-center bg-surface-200">
                    <div className="w-10 sm:w-12 h-1 bg-typography-400/40 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TABLET */}
            {currentDevice === "tablet" && (
              <div className="w-full max-w-[270px] sm:max-w-xs bg-slate-950 rounded-[20px] sm:rounded-[24px] p-1.5 sm:p-2 shadow-2xl ring-1 ring-white/10 transition-all duration-300 animate-fadeIn">
                <div className="bg-surface-200 rounded-[14px] sm:rounded-[18px] overflow-hidden flex flex-col h-52 sm:h-60 text-[9px] select-none relative">
                  <div
                    className="px-3 py-1.5 flex items-center justify-between text-white font-bold transition-colors duration-300"
                    style={{ backgroundColor: selectedThemeObj.color }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[8px] sm:text-[8.5px] font-semibold">09:41</span>
                      <span className="text-[7.5px] sm:text-[8px] opacity-80">Qua, 4 de Set</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-black/60 mx-auto"></div>
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[7.5px] sm:text-[8px] opacity-90">
                      <span>Wi-Fi</span>
                      <span>98%</span>
                    </div>
                  </div>

                  <div
                    className="px-3 py-1.5 sm:py-2 text-white flex items-center justify-between shadow-sm transition-colors duration-300"
                    style={{ backgroundColor: selectedThemeObj.color }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <img
                        src={selectedThemeObj.iconSrc}
                        alt="Ícone"
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-md shadow-sm border border-white/20 shrink-0"
                      />
                      <span className="font-bold text-[9px] sm:text-[10px] tracking-tight truncate">
                        {nomeCongregacao || "Quadro de Anúncios"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-[7.5px] sm:text-[8px] opacity-90 shrink-0">
                      <span className="px-1.5 py-0.5 rounded-md bg-white/20">Quadro</span>
                    </div>
                  </div>

                  <div className="p-2 sm:p-3 flex-1 flex flex-col gap-1.5 sm:gap-2 overflow-hidden">
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="bg-surface-100 p-1.5 sm:p-2 rounded-xl border border-surface-300/80 shadow-2xs flex flex-col gap-0.5 sm:gap-1">
                        <span className="font-bold text-[8px] sm:text-[9px]" style={{ color: selectedThemeObj.color }}>Relatórios</span>
                        <span className="text-[6.5px] sm:text-[7.5px] text-typography-500 truncate">Mensal</span>
                      </div>
                      <div className="bg-surface-100 p-1.5 sm:p-2 rounded-xl border border-surface-300/80 shadow-2xs flex flex-col gap-0.5 sm:gap-1">
                        <span className="font-bold text-[8px] sm:text-[9px]" style={{ color: selectedThemeObj.color }}>Reuniões</span>
                        <span className="text-[6.5px] sm:text-[7.5px] text-typography-500 truncate">Ordem</span>
                      </div>
                      <div className="bg-surface-100 p-1.5 sm:p-2 rounded-xl border border-surface-300/80 shadow-2xs flex flex-col gap-0.5 sm:gap-1">
                        <span className="font-bold text-[8px] sm:text-[9px]" style={{ color: selectedThemeObj.color }}>Limpeza</span>
                        <span className="text-[6.5px] sm:text-[7.5px] text-typography-500 truncate">Escalas</span>
                      </div>
                    </div>

                    <div className="mt-auto bg-surface-100/90 border border-surface-300/80 rounded-xl p-1 sm:p-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <img src={selectedThemeObj.iconSrc} alt="Ícone" className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg shadow-sm shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[7.5px] sm:text-[8.5px] text-typography-800 truncate">Quadro no Tablet</span>
                          <span className="text-[6.5px] sm:text-[7px] text-typography-500 truncate">Cor {selectedThemeObj.name}</span>
                        </div>
                      </div>
                      <span className="text-[7px] sm:text-[7.5px] font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-white shrink-0" style={{ backgroundColor: selectedThemeObj.color }}>
                        PWA Tablet
                      </span>
                    </div>
                  </div>

                  <div className="pb-1 flex justify-center bg-surface-200">
                    <div className="w-16 sm:w-20 h-1 bg-typography-400/40 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DESKTOP / NOTEBOOK */}
            {currentDevice === "desktop" && (
              <div className="w-full max-w-[280px] sm:max-w-sm flex flex-col items-center transition-all duration-300 animate-fadeIn">
                <div className="w-full bg-slate-900 rounded-t-xl p-1 sm:p-1.5 shadow-2xl ring-1 ring-white/10 border-t border-x border-slate-700">
                  <div className="w-full flex justify-center pb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950 ring-1 ring-slate-800 flex items-center justify-center">
                      <div className="w-0.5 h-0.5 rounded-full bg-emerald-500/90"></div>
                    </div>
                  </div>

                  <div className="bg-surface-200 rounded-lg overflow-hidden flex flex-col h-44 sm:h-52 text-[9px] select-none border border-slate-700/50">
                    <div
                      className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-white flex items-center justify-between shadow-sm transition-colors duration-300"
                      style={{ backgroundColor: selectedThemeObj.color }}
                    >
                      <div className="flex items-center gap-1 sm:gap-1.5 truncate">
                        <div className="flex items-center gap-1 pr-1 sm:pr-1.5 border-r border-white/20 shrink-0">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400 inline-block"></span>
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 inline-block"></span>
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 inline-block"></span>
                        </div>
                        <img src={selectedThemeObj.iconSrc} alt="Ícone" className="w-3.5 h-3.5 rounded shrink-0" />
                        <span className="font-bold text-[8px] sm:text-[8.5px] truncate tracking-tight">
                          {nomeCongregacao || "Quadro de Anúncios"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[7px] sm:text-[7.5px] opacity-90 shrink-0">
                        <span className="bg-white/20 px-1 py-0.5 rounded">Desktop</span>
                      </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                      <div className="w-16 sm:w-20 bg-surface-100 border-r border-surface-300/80 p-1 sm:p-1.5 flex flex-col gap-0.5 sm:gap-1 text-[7px] sm:text-[7.5px]">
                        <span className="font-bold px-1 py-0.5 rounded text-white" style={{ backgroundColor: selectedThemeObj.color }}>Início</span>
                        <span className="text-typography-500 px-1 py-0.5">Relatórios</span>
                        <span className="text-typography-500 px-1 py-0.5">Reuniões</span>
                        <span className="text-typography-500 px-1 py-0.5">Limpeza</span>
                        <span className="text-typography-500 px-1 py-0.5">Campo</span>
                      </div>

                      <div className="flex-1 p-1.5 sm:p-2 flex flex-col gap-1 sm:gap-1.5 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[7.5px] sm:text-[8px] text-typography-700">Painel</span>
                          <span className="text-[6.5px] sm:text-[7px] text-typography-400">Alt+Q</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                          <div className="bg-surface-100 p-1 sm:p-1.5 rounded-lg border border-surface-300/80 flex flex-col gap-0.5">
                            <span className="font-bold text-[7.5px] sm:text-[8px]" style={{ color: selectedThemeObj.color }}>Relatórios</span>
                            <span className="text-[6px] sm:text-[6.5px] text-typography-500">Regular</span>
                          </div>
                          <div className="bg-surface-100 p-1 sm:p-1.5 rounded-lg border border-surface-300/80 flex flex-col gap-0.5">
                            <span className="font-bold text-[7.5px] sm:text-[8px]" style={{ color: selectedThemeObj.color }}>Reunião</span>
                            <span className="text-[6px] sm:text-[6.5px] text-typography-500">Ativo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-[300px] sm:max-w-[360px] h-1.5 sm:h-2 bg-slate-700 rounded-b-md shadow-md flex items-center justify-center border-t border-slate-600">
                  <div className="w-12 sm:w-14 h-0.5 bg-slate-500 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          {/* Seletor de Paleta de Cores */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-typography-700">
              Selecione uma cor:
            </span>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {themeOptions.map((item) => {
                const isSelected = previewTheme === item.key
                return (
                  <button
                    key={item.name}
                    onClick={() => handleSelectPreviewTheme(item.key)}
                    className={`flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl border transition-all ${
                      isSelected
                        ? "border-primary-200 bg-primary-200/10 ring-2 ring-primary-200/30 scale-102"
                        : "border-surface-300 hover:bg-surface-200"
                    }`}
                  >
                    <div
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-inner flex items-center justify-center text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {isSelected && <Check size={12} className="stroke-[3] sm:w-[14px] sm:h-[14px]" />}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-medium text-typography-700 text-center leading-tight truncate w-full">
                      {item.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-surface-200/80 p-2 sm:p-2.5 rounded-xl text-[10px] sm:text-[11px] text-typography-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
            <span className="truncate">
              Tema e ícone:{" "}
              <strong className="text-typography-900 font-semibold">
                {selectedThemeObj.name}
              </strong>
            </span>
          </div>
        </div>

        {/* Rodapé de Ações do Modal */}
        <div className="p-3 sm:p-4 border-t border-surface-300/70 bg-surface-200/40 flex items-center gap-2 shrink-0">
          <button
            onClick={onClose}
            className="w-1/3 py-2 sm:py-2.5 px-2.5 rounded-xl border border-surface-300 hover:bg-surface-200 text-typography-700 text-xs font-medium transition text-center"
          >
            Voltar
          </button>
          <button
            onClick={handleConfirmInstall}
            className="w-2/3 py-2 sm:py-2.5 px-3 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-md active:scale-95"
            style={{ backgroundColor: selectedThemeObj.color }}
          >
            <Download size={14} className="shrink-0 sm:w-[15px] sm:h-[15px]" />
            <span className="truncate">Instalar com este tema</span>
          </button>
        </div>
      </div>
    </div>
  )
}
