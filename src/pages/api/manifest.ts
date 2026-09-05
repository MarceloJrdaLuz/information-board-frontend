import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { number, theme } = req.query

  if (typeof number !== 'string' || !number) {
    return res.status(400).json({
      error: 'Número da congregação não informado',
    })
  }

  const themeColors: Record<string, string> = {
    '': '#178582',
    'theme-dark': '#6F4EA1',
    'theme-blue': '#3E6BA3',
    'theme-purple': '#7B63AD',
    'theme-pink': '#B6587D',
    'theme-dark-teal': '#178582',
    'theme-dark-blue': '#3E6BA3',
    'theme-dark-purple': '#6F4EA1',
    'theme-dark-pink': '#B6587D',
  }

  // Mapeamento para os arquivos de ícones físicos existentes no /public/icons
  const themeIconMap: Record<string, string> = {
    '': '',
    'theme-dark': '-theme-dark',
    'theme-blue': '-theme-blue',
    'theme-purple': '-theme-purple',
    'theme-pink': '-theme-pink',
    'theme-dark-teal': '',
    'theme-dark-blue': '-theme-blue',
    'theme-dark-purple': '-theme-dark',
    'theme-dark-pink': '-theme-pink',
  }

  const selectedTheme = typeof theme === 'string' ? theme : ''
  const color = themeColors[selectedTheme] || '#178582'
  const iconSuffix = themeIconMap[selectedTheme] ?? (selectedTheme ? `-${selectedTheme}` : '')

  res.setHeader('Content-Type', 'application/manifest+json')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')

  return res.status(200).json({
    name: 'Quadro de Anúncios',
    short_name: 'Quadro de Anúncios',
    description: 'Quadro de Anúncios',
    id: `/${number}${selectedTheme ? `?theme=${selectedTheme}` : ''}`,
    start_url: `/${number}${selectedTheme ? `?theme=${selectedTheme}` : ''}`,
    scope: `/`,
    display: 'standalone',
    background_color: color,
    theme_color: color,
    icons: [
      {
        src: `/icons/pwa${iconSuffix}-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: `/icons/pwa${iconSuffix}-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
    ],
  })
}