import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { number } = req.query

  if (typeof number !== 'string' || !number) {
    return res.status(400).json({
      error: 'Número da congregação não informado',
    })
  }

  res.setHeader('Content-Type', 'application/manifest+json')

  return res.status(200).json({
    name: 'Quadro de Anúncios',
    short_name: 'Quadro de Anúncios',
    description: 'Quadro de Anúncios',
    start_url: `/${number}`,
    scope: `/${number}`,
    display: 'standalone',
    background_color: '#178582',
    theme_color: '#178582',
    icons: [
      {
        src: '/icons/pwa-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/pwa-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  })
}