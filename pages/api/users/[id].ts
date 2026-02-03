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

  if (!validateMethod(req, res, ['DELETE', 'PUT'])) return

  const { id } = req.query
  const userId = Number(id)

  if (req.method === 'DELETE') {
    if (Number(session.user.id) === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    await prisma.user.delete({
      where: { id: userId },
    })
    return res.status(204).end()
  }

  if (req.method === 'PUT') {
    const { email, password, firstName, lastName, isAdmin } = req.body

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' })
    }

    const data: {
      email?: string
      password?: string
      firstName: string
      lastName: string
      isAdmin: boolean
    } = {
      firstName,
      lastName,
      isAdmin: Boolean(isAdmin),
    }

    if (email) {
      data.email = email
    }
    if (password) {
      data.password = await hashPassword(password)
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
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
      return res.status(200).json(user)
    } catch (e: any) {
      return handleError(e, res)
    }
  }
}
