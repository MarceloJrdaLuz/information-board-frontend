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

export function updateManifestLink(newTheme: ThemeType) {
  if (typeof document === 'undefined') return
  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  if (manifestLink) {
    const currentHref = manifestLink.getAttribute('href') || ''
    const url = new URL(currentHref, window.location.origin)
    if (newTheme) {
      url.searchParams.set('theme', newTheme)
    } else {
      url.searchParams.delete('theme')
    }
    // Adiciona timestamp para quebrar cache local do navegador/Chromium
    url.searchParams.set('v', Date.now().toString())
    
    // Substitui a tag no DOM para forçar o Chromium a registrar imediatamente a nova URL do manifesto
    const newLink = document.createElement('link')
    newLink.rel = 'manifest'
    newLink.href = url.pathname + url.search
    manifestLink.parentNode?.replaceChild(newLink, manifestLink)
    manifestLink.href = url.pathname + url.search
  }
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

    // Atualiza o link do manifest no DOM imediatamente para a próxima instalação
    updateManifestLink(newTheme)

    // Atualiza o estado global
    set(themeAtom, newTheme)
  }
)
