import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { requireAuth } from '../../../../lib/middleware/auth'
import { validateMethod } from '../../../../lib/utils/methodValidator'
import { handleError } from '../../../../lib/utils/errorHandler'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res)
  if (!session) return

  const { id } = req.query
  const proposalId = Number(id)

  if (isNaN(proposalId)) {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (!validateMethod(req, res, ['GET', 'POST'])) return

  try {
    if (req.method === 'GET') {
      const blocks = await prisma.proposalBlock.findMany({
        where: { proposalId },
        orderBy: { order: 'asc' },
        include: { block: true }
      })
      return res.status(200).json(blocks)
    }

    if (req.method === 'POST') {
      const { blockId, content, order } = req.body
      
      const proposalBlock = await prisma.proposalBlock.create({
        data: {
          proposalId,
          blockId: Number(blockId),
          content,
          order: Number(order)
        },
        include: { block: true }
      })
      
      return res.status(201).json(proposalBlock)
    }
  } catch (e: any) {
    return handleError(e, res)
  }
}
