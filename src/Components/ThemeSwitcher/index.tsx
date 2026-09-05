'use client'

import { setThemeAtom, themeAtom, ThemeType } from '@/atoms/themeAtoms'
import { AnimatePresence, motion } from 'framer-motion'
import { useAtomValue, useSetAtom } from 'jotai'
import { Palette } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ThemeOption {
  name: string
  class: ThemeType
  color: string
  isDark: boolean
}

const lightThemes: ThemeOption[] = [
  { name: 'Teal Claro (Padrão)', class: '', color: '#178582', isDark: false },
  { name: 'Azul Claro', class: 'theme-blue', color: '#3E6BA3', isDark: false },
  { name: 'Roxo Claro', class: 'theme-purple', color: '#7B63AD', isDark: false },
  { name: 'Rosa Claro', class: 'theme-pink', color: '#B6587D', isDark: false },
]

const darkThemes: ThemeOption[] = [
  { name: 'Teal Escuro', class: 'theme-dark-teal', color: '#178582', isDark: true },
  { name: 'Azul Escuro', class: 'theme-dark-blue', color: '#3E6BA3', isDark: true },
  { name: 'Roxo Escuro', class: 'theme-dark', color: '#6F4EA1', isDark: true },
  { name: 'Rosa Escuro', class: 'theme-dark-pink', color: '#B6587D', isDark: true },
]

const allThemes = [...lightThemes, ...darkThemes]

interface ThemeSwitcherProps {
  className?: string
  showLabel?: boolean
}

export default function ThemeSwitcher({ className, showLabel = false }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const currentTheme = useAtomValue(themeAtom)
  const changeTheme = useSetAtom(setThemeAtom)

  const activeTheme = allThemes.find((t) => t.class === currentTheme) || allThemes[0]

  // Função para validar o valor do localStorage
  const isValidTheme = (value: string): value is ThemeType => {
    return allThemes.some((t) => t.class === value) || value === 'theme-dark-purple'
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme') || ''
    const theme = isValidTheme(saved) ? (saved as ThemeType) : ''
    changeTheme(theme)
  }, [changeTheme])

  // Fecha o seletor ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleSelectTheme = (themeClass: ThemeType) => {
    changeTheme(themeClass)
    setOpen(false)
  }

  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})

  // Calcula posição fixa do popup garantindo que NUNCA cause overflow horizontal (ex: Galaxy S5 320px)
  useEffect(() => {
    if (!open || !containerRef.current) return

    const updatePosition = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const popupWidth = Math.min(230, window.innerWidth - 16)
      const padding = 8 // margem de segurança da borda da tela

      let left = rect.left + rect.width / 2 - popupWidth / 2

      if (left < padding) {
        left = padding
      } else if (left + popupWidth > window.innerWidth - padding) {
        left = window.innerWidth - popupWidth - padding
      }

      setPopupStyle({
        position: 'fixed',
        left: `${Math.max(padding, left)}px`,
        bottom: `${window.innerHeight - rect.top + 8}px`,
        maxWidth: `calc(100vw - ${padding * 2}px)`,
        width: `${popupWidth}px`,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        onClick={() => setOpen(!open)}
        className={
          className ||
          (showLabel
            ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white font-medium text-xs transition-all shadow-sm"
            : "w-9 h-9 flex items-center justify-center text-typography-100 rounded-full shadow-md hover:brightness-95 transition-all bg-surface-100 border border-surface-300")
        }
        title={`Mudar tema (Atual: ${activeTheme.name})`}
      >
        <Palette size={15} />
        {showLabel && <span>Tema</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={popupStyle}
            className="bg-surface-100 shadow-2xl border border-surface-300 rounded-2xl p-2.5 flex flex-col gap-2 z-50 ring-1 ring-black/5"
          >
            {/* Seção Temas Claros */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-typography-500 uppercase tracking-wider px-1">
                Fundos Claros
              </span>
              <div className="flex items-center justify-between gap-1.5 px-1">
                {lightThemes.map((t) => {
                  const isSelected = (currentTheme || '') === t.class
                  return (
                    <button
                      key={t.name}
                      onClick={() => handleSelectTheme(t.class)}
                      className={`relative w-8 h-8 rounded-full border border-surface-300 transition-all flex items-center justify-center shrink-0 overflow-hidden shadow-xs ${
                        isSelected
                          ? 'ring-2 ring-primary-200 ring-offset-2 ring-offset-surface-100 scale-105'
                          : 'hover:scale-110 opacity-90 hover:opacity-100'
                      }`}
                      title={t.name}
                    >
                      {/* Metade cor do tema / Metade fundo branco indicando claro */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${t.color} 50%, #ffffff 50%)`,
                        }}
                      />
                      {/* Pontinho central da cor */}
                      <span
                        className="relative z-10 w-2 h-2 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: t.color }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="w-full h-px bg-surface-300/60" />

            {/* Seção Temas Escuros */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-typography-500 uppercase tracking-wider px-1">
                Fundos Escuros
              </span>
              <div className="flex items-center justify-between gap-1.5 px-1">
                {darkThemes.map((t) => {
                  const isSelected =
                    currentTheme === t.class ||
                    (t.class === 'theme-dark' && currentTheme === 'theme-dark-purple')
                  return (
                    <button
                      key={t.name}
                      onClick={() => handleSelectTheme(t.class)}
                      className={`relative w-8 h-8 rounded-full border border-surface-300 transition-all flex items-center justify-center shrink-0 overflow-hidden shadow-xs ${
                        isSelected
                          ? 'ring-2 ring-primary-200 ring-offset-2 ring-offset-surface-100 scale-105'
                          : 'hover:scale-110 opacity-90 hover:opacity-100'
                      }`}
                      title={t.name}
                    >
                      {/* Metade cor do tema / Metade fundo escuro indicando dark */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${t.color} 50%, #151020 50%)`,
                        }}
                      />
                      {/* Pontinho central da cor */}
                      <span
                        className="relative z-10 w-2 h-2 rounded-full border border-black/40 shadow-xs"
                        style={{ backgroundColor: t.color }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
