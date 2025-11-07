import { atom } from 'jotai'

export type ThemeType = '' | 'theme-dark' | 'theme-blue' | 'theme-purple' 

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
    // Atualiza o estado global
    set(themeAtom, newTheme)
  }
)
