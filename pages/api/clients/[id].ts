import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/middleware/auth'
import { validateMethod } from '../../../lib/utils/methodValidator'
import { handleError } from '../../../lib/utils/errorHandler'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res)
  if (!session) return

  if (!validateMethod(req, res, ['DELETE', 'PUT'])) return

  const { id } = req.query
  const clientId = Number(id)

  if (Number.isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client id' })
  }

  if (req.method === 'DELETE') {
    await prisma.client.delete({ where: { id: clientId } })
    return res.status(204).end()
  }

  if (req.method === 'PUT') {
    const { companyId, firstName, lastName, email, phone, title } = req.body
    const parsedCompanyId = Number(companyId)

    if (!parsedCompanyId || Number.isNaN(parsedCompanyId)) {
      return res.status(400).json({ error: 'Company is required' })
    }
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' })
    }

    try {
      const client = await prisma.client.update({
        where: { id: clientId },
        data: {
          companyId: parsedCompanyId,
          firstName,
          lastName,
          email,
          phone,
          title,
        },
        include: {
          company: {
            select: { id: true, name: true, slug: true },
          },
        },
      })
      return res.status(200).json(client)
    } catch (e: any) {
      return handleError(e, res)
    }
  }
}
