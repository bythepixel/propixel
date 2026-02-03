import type { NextApiResponse } from 'next'
import { ERROR_MESSAGES, PRISMA_ERROR_CODES } from '../constants'

export function handlePrismaError(error: any, res: NextApiResponse): boolean {
  if (error.code === PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT) {
    const target = error.meta?.target
    if (Array.isArray(target)) {
      if (target.includes('email')) {
        res.status(400).json({ error: 'Email already exists' })
        return true
      }
    }
    res.status(400).json({ error: ERROR_MESSAGES.DUPLICATE_ENTRY })
    return true
  }

  if (error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
    res.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND })
    return true
  }

  return false
}

export function handleError(error: any, res: NextApiResponse): void {
  if (handlePrismaError(error, res)) {
    return
  }

  if (error.message?.includes('updateMany') || error.message?.includes('undefined')) {
    res.status(500).json({
      error: 'Prisma client not updated. Please restart your dev server after running: npx prisma generate',
    })
    return
  }

  res.status(500).json({
    error: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  })
}
