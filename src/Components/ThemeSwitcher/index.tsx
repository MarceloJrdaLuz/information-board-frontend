'use client'

import { setThemeAtom, themeAtom, ThemeType } from '@/atoms/themeAtoms'
import { AnimatePresence, motion } from 'framer-motion'
import { useAtomValue, useSetAtom } from 'jotai'
import { Palette } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const themes: { name: string; class: ThemeType; color: string }[] = [
  { name: 'Padrão', class: '', color: '#178582' },
  { name: 'Escuro', class: 'theme-dark', color: '#18181B' },
  { name: 'Azul', class: 'theme-blue', color: '#3E6BA3' },
  { name: 'Roxo', class: 'theme-purple', color: '#7B63AD' },
  { name: 'Rosa', class: 'theme-pink', color: '#B6587D' },
]

interface ThemeSwitcherProps {
  className?: string
  showLabel?: boolean
}

export default function ThemeSwitcher({ className, showLabel = false }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentTheme = useAtomValue(themeAtom)
  const changeTheme = useSetAtom(setThemeAtom)

  const activeTheme = themes.find((t) => t.class === currentTheme) || themes[0]

  // Função para validar o valor do localStorage
  const isValidTheme = (value: string): value is ThemeType => {
    return ['', 'theme-dark', 'theme-blue', 'theme-purple', 'theme-pink'].includes(value)
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme') || ''
    const theme = isValidTheme(saved) ? saved : ''
    changeTheme(theme)
  }, [changeTheme])

  // Fecha o seletor ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
      const popupWidth = 164 // largura real compacta do popup
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
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={popupStyle}
            className="bg-surface-100 shadow-2xl border border-surface-300 rounded-full px-2 py-1.5 sm:px-2.5 sm:py-2 flex items-center justify-center gap-1.5 sm:gap-2 z-50 ring-1 ring-black/5"
          >
            {themes.map((t) => {
              const isSelected = (currentTheme || '') === t.class
              return (
                <motion.button
                  key={t.name}
                  onClick={() => handleSelectTheme(t.class)}
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border border-typography-300 transition-all relative flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'ring-2 ring-primary-200 ring-offset-2 ring-offset-surface-100 scale-105'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: t.color }}
                  title={t.name}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                />
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
