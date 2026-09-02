'use client'

import { setThemeAtom, themeColorsMap, ThemeType } from '@/atoms/themeAtoms'
import { AnimatePresence, motion } from 'framer-motion'
import { useSetAtom } from 'jotai'
import { Palette } from 'lucide-react'
import { useEffect, useState } from 'react'

const themes: { name: string; class: ThemeType; color: string }[] = [
  { name: 'Padrão', class: '', color: themeColorsMap[''] },
  { name: 'Escuro', class: 'theme-dark', color: themeColorsMap['theme-dark'] },
  { name: 'Azul', class: 'theme-blue', color: themeColorsMap['theme-blue'] },
  { name: 'Roxo', class: 'theme-purple', color: themeColorsMap['theme-purple'] },
]

interface ThemeSwitcherProps {
  className?: string
  showLabel?: boolean
}

export default function ThemeSwitcher({ className, showLabel = false }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false)
  const changeTheme = useSetAtom(setThemeAtom)

  // função para validar o valor do localStorage
  const isValidTheme = (value: string): value is ThemeType => {
    return ['', 'theme-dark', 'theme-blue', 'theme-purple'].includes(value)
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme') || ''
    const theme = isValidTheme(saved) ? saved : ''
    changeTheme(theme)
  }, [changeTheme])

  const handleSelectTheme = (themeClass: ThemeType) => {
    changeTheme(themeClass)
    setOpen(false)
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={() => setOpen(!open)}
        className={
          className ||
          (showLabel
            ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white font-medium text-xs transition-all shadow-sm"
            : "w-9 h-9 flex items-center justify-center text-typography-100 rounded-full shadow-md hover:brightness-95 transition-all")
        }
        title="Mudar tema"
      >
        <Palette size={15} />
        {showLabel && <span>Tema</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-surface-100 shadow-xl border border-surface-300 rounded-full px-3 py-2 flex gap-2 z-50"
          >
            {themes.map((t) => (
              <motion.button
                key={t.name}
                onClick={() => handleSelectTheme(t.class)}
                className="w-5 h-5 rounded-full border border-typography-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: t.color }}
                title={t.name}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
