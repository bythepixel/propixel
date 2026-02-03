import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/middleware/auth'
import { validateMethod } from '../../../lib/utils/methodValidator'
import { handleError } from '../../../lib/utils/errorHandler'
import { hashPassword } from '../../../lib/utils/password'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res)
  if (!session) return

  if (!validateMethod(req, res, ['GET', 'POST'])) return

  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, isAdmin: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(users)
  }

  if (req.method === 'POST') {
    const { email, password, firstName, lastName, isAdmin } = req.body

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' })
    }

    const hashedPassword = await hashPassword(password)
    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          isAdmin: Boolean(isAdmin),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      return res.status(201).json(user)
    } catch (e: any) {
      return handleError(e, res)
    }
  }
}
