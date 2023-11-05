// types.ts
import { NextApiRequest, NextApiResponse } from 'next'

export type NextApiMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (error?: any) => void
) => void

const noCacheMiddleware: NextApiMiddleware = (req, res, next) => {
  // Defina o cabeçalho Cache-Control para no-cache
  res.setHeader('Cache-Control', 'no-store')

  // Chame o próximo middleware ou manipulador (handler)
  next()
}

export default noCacheMiddleware
