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

  if (!validateMethod(req, res, ['GET', 'POST'])) return

  if (req.method === 'GET') {
    const clients = await prisma.client.findMany({
      include: {
        company: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(clients)
  }

  if (req.method === 'POST') {
    const { companyId, firstName, lastName, email, phone, title } = req.body
    const parsedCompanyId = Number(companyId)

    if (!parsedCompanyId || Number.isNaN(parsedCompanyId)) {
      return res.status(400).json({ error: 'Company is required' })
    }
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' })
    }

    try {
      const client = await prisma.client.create({
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
      return res.status(201).json(client)
    } catch (e: any) {
      return handleError(e, res)
    }
  }
}
