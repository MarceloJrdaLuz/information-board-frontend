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

  // Remove tags antigas para forçar o Chromium/WebAPK a registrar a inserção da nova cor
  const existingMetas = document.querySelectorAll('meta[name="theme-color"]')
  existingMetas.forEach(m => m.remove())

  const meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.id = 'theme-color-meta'
  meta.content = color
  document.head.appendChild(meta)

  const msNavs = document.querySelectorAll('meta[name="msapplication-navbutton-color"]')
  msNavs.forEach(m => m.setAttribute('content', color))

  const tiles = document.querySelectorAll('meta[name="msapplication-TileColor"]')
  tiles.forEach(m => m.setAttribute('content', color))
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
