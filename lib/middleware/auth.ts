import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { Session } from 'next-auth'
import { authOptions } from '../config/auth'
import { ERROR_MESSAGES } from '../constants'

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<Session | null> {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED })
    return null
  }
  return session
}
