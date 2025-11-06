'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette } from 'lucide-react'

const themes = [
  { name: 'Padrão', class: '', color: '#178582' },
  { name: 'Escuro', class: 'theme-dark', color: '#222' },
]

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || ''
    document.documentElement.className = savedTheme
  }, [])

  const setTheme = (themeClass: string) => {
    document.documentElement.className = themeClass
    localStorage.setItem('theme', themeClass)
    setOpen(false)
  }

  return (
    <div className="relative">
      {/* Botão principal */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center bg-primary-200 text-typography-100 rounded-full shadow-md hover:brightness-95 transition-all"
        title="Mudar tema"
      >
        <Palette size={18} />
      </button>

      {/* Menu flutuante compacto */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-surface-100 dark:bg-typography-800 shadow-md rounded-full px-3 py-2 flex gap-2 z-50"
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
