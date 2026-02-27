import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/middleware/auth'
import { validateMethod } from '../../../lib/utils/methodValidator'
import { handleError } from '../../../lib/utils/errorHandler'

const parseOptionalId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res)
  if (!session) return

  if (!validateMethod(req, res, ['GET', 'POST'])) return

  if (req.method === 'GET') {
    const proposals = await prisma.proposal.findMany({
      include: {
        company: { select: { id: true, name: true, slug: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { id: 'desc' },
    })
    return res.status(200).json(proposals)
  }

  if (req.method === 'POST') {
    const { title, slug, companyId, clientId } = req.body
    const parsedCompanyId = parseOptionalId(companyId)
    const parsedClientId = parseOptionalId(clientId)

    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' })
    }

    try {
      let resolvedCompanyId = parsedCompanyId
      if (parsedClientId) {
        const client = await prisma.client.findUnique({
          where: { id: parsedClientId },
          select: { companyId: true },
        })
        if (!client) {
          return res.status(400).json({ error: 'Client not found' })
        }
        if (resolvedCompanyId && resolvedCompanyId !== client.companyId) {
          return res.status(400).json({ error: 'Client does not belong to the company' })
        }
        resolvedCompanyId = resolvedCompanyId ?? client.companyId
      }

      const proposal = await prisma.proposal.create({
        data: {
          title,
          slug,
          companyId: resolvedCompanyId,
          clientId: parsedClientId,
        },
        include: {
          company: { select: { id: true, name: true, slug: true } },
          client: { select: { id: true, firstName: true, lastName: true } },
        },
      })
      return res.status(201).json(proposal)
    } catch (e: any) {
      return handleError(e, res)
    }
  }
}
