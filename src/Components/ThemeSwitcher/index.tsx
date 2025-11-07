'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { themeAtom, ThemeType } from '@/atoms/themeAtoms'

const themes: { name: string; class: ThemeType; color: string }[] = [
  { name: 'Padrão', class: '', color: '#178582' },
  { name: 'Escuro', class: 'theme-dark', color: '#222' },
  { name: 'Azul', class: 'theme-blue', color: '#2878bb' },
]

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const setThemeAtom = useSetAtom(themeAtom)

  // função para validar o valor do localStorage
  const isValidTheme = (value: string): value is ThemeType => {
    return ['', 'theme-dark', 'theme-blue'].includes(value)
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme') || ''
    const theme = isValidTheme(saved) ? saved : ''
    document.documentElement.classList.remove('theme-dark', 'theme-blue')
    if (theme) document.documentElement.classList.add(theme)
    setThemeAtom(theme)
  }, [setThemeAtom])

  const setTheme = (themeClass: ThemeType) => {
    document.documentElement.classList.remove('theme-dark', 'theme-blue')
    if (themeClass) document.documentElement.classList.add(themeClass)
    localStorage.setItem('theme', themeClass)
    setThemeAtom(themeClass)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center bg-primary-200 text-typography-100 rounded-full shadow-md hover:brightness-95 transition-all"
        title="Mudar tema"
      >
        <Palette size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-surface-100 shadow-md rounded-full px-3 py-2 flex gap-2 z-50"
          >
            {themes.map((t) => (
              <motion.button
                key={t.name}
                onClick={() => setTheme(t.class)}
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
