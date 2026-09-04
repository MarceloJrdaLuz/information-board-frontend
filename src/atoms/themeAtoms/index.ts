import { atom } from 'jotai'

export type ThemeType = '' | 'theme-dark' | 'theme-blue' | 'theme-purple'

export const themeColorsMap: Record<ThemeType, string> = {
  '': '#178582',
  'theme-dark': '#6F4EA1',
  'theme-blue': '#3E6BA3',
  'theme-purple': '#62468C',
}

export function updateThemeColorMeta(newTheme: ThemeType) {
  if (typeof document === 'undefined') return
  const color = themeColorsMap[newTheme] || '#178582'

  const configs = [
    null,
    '(prefers-color-scheme: light)',
    '(prefers-color-scheme: dark)',
  ]

  configs.forEach((media) => {
    const selector = media
      ? `meta[name="theme-color"][media="${media}"]`
      : 'meta[name="theme-color"]:not([media])'
    const meta = document.querySelector<HTMLMetaElement>(selector)
    if (meta) {
      meta.setAttribute('content', color)
    } else {
      const newMeta = document.createElement('meta')
      newMeta.name = 'theme-color'
      if (media) newMeta.media = media
      newMeta.content = color
      document.head.appendChild(newMeta)
    }
  })

  const msNavs = document.querySelectorAll<HTMLMetaElement>('meta[name="msapplication-navbutton-color"]')
  msNavs.forEach((m) => m.setAttribute('content', color))

  const tiles = document.querySelectorAll<HTMLMetaElement>('meta[name="msapplication-TileColor"]')
  tiles.forEach((m) => m.setAttribute('content', color))
}

/** Átomo com o tema atual */
export const themeAtom = atom<ThemeType>('')

/** Átomo que muda o tema e sincroniza com o DOM e localStorage */
export const setThemeAtom = atom(
  null,
  (_get, set, newTheme: ThemeType) => {
    // Aplica no DOM
    document.documentElement.className = newTheme
    // Salva no localStorage
    localStorage.setItem('theme', newTheme)

    // Atualiza as meta tags de tema imediatamente
    updateThemeColorMeta(newTheme)

    // Atualiza o estado global
    set(themeAtom, newTheme)
  }
)
