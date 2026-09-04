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
  { name: 'Roxo', class: 'theme-purple', color: '#62468C' },
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
    return ['', 'theme-dark', 'theme-blue', 'theme-purple'].includes(value)
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
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-surface-100 shadow-xl border border-surface-300 rounded-full px-3 py-2 flex items-center gap-2.5 z-50"
          >
            {themes.map((t) => {
              const isSelected = (currentTheme || '') === t.class
              return (
                <motion.button
                  key={t.name}
                  onClick={() => handleSelectTheme(t.class)}
                  className={`w-5 h-5 rounded-full border border-typography-300 transition-all relative flex items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-primary-200 ring-offset-2 ring-offset-surface-100 scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: t.color }}
                  title={t.name}
                  whileHover={{ scale: 1.2 }}
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
