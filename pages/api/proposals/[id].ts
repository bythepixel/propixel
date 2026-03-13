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

  if (!validateMethod(req, res, ['GET', 'DELETE', 'PUT'])) return

  const { id } = req.query
  const proposalId = Number(id)

  if (Number.isNaN(proposalId)) {
    return res.status(400).json({ error: 'Invalid proposal id' })
  }

  if (req.method === 'GET') {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
      })
      
      if (!proposal) return res.status(404).json({ error: 'Proposal not found' })

      // Manual fetch of relations using a robust approach
      // Using 'as any' here because Prisma's types are out of sync in the IDE while the client regenerates
      const [blocks, company, client, rfp] = await Promise.all([
        ((prisma as any).proposalBlock || (prisma as any).proposalBlocks).findMany({
          where: { proposalId },
          orderBy: { order: 'asc' },
        }),
        proposal.companyId ? (prisma as any).company.findUnique({ where: { id: proposal.companyId } }) : Promise.resolve(null),
        proposal.clientId ? (prisma as any).client.findUnique({ where: { id: proposal.clientId } }) : Promise.resolve(null),
        proposal.rfpId ? ((prisma as any).rfp || (prisma as any).rFP).findUnique({ where: { id: proposal.rfpId } }) : Promise.resolve(null),
      ])

      return res.status(200).json({
        ...proposal,
        blocks,
        company,
        client,
        rfp,
      })
    } catch (e: any) {
      console.error("Fetch error:", e);
      return handleError(e, res)
    }
  }

  if (req.method === 'DELETE') {
    await prisma.proposal.delete({ where: { id: proposalId } })
    return res.status(204).end()
  }

  if (req.method === 'PUT') {
    const { title, slug, companyId, clientId, blocks } = req.body
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

      // Handle blocks if provided
      if (blocks && Array.isArray(blocks)) {
        await (prisma as any).proposalBlock.deleteMany({ where: { proposalId } })
        await (prisma as any).proposalBlock.createMany({
          data: blocks.map((b: any, index: number) => ({
            proposalId,
            blockId: b.blockId,
            content: b.content,
            order: index,
          }))
        })
      }

      const proposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          title,
          slug,
          companyId: resolvedCompanyId,
          clientId: parsedClientId,
        },
      })

      // Fetch updated relations manually
      const [updatedBlocks, company, client] = await Promise.all([
        (prisma as any).proposalBlock.findMany({
          where: { proposalId },
          orderBy: { order: 'asc' },
        }),
        proposal.companyId ? (prisma as any).company.findUnique({ where: { id: proposal.companyId } }) : Promise.resolve(null),
        proposal.clientId ? (prisma as any).client.findUnique({ where: { id: proposal.clientId } }) : Promise.resolve(null),
      ])

      return res.status(200).json({
        ...proposal,
        blocks: updatedBlocks,
        company,
        client,
      })
    } catch (e: any) {
      console.error("Update error:", e);
      return handleError(e, res)
    }
  }
}
