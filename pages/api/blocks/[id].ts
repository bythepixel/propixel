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

    const { id } = req.query
    const blockId = Number(id)

    if (isNaN(blockId)) {
        return res.status(400).json({ error: 'Invalid ID' })
    }

    if (!validateMethod(req, res, ['GET', 'PUT', 'DELETE'])) return

    try {
        if (req.method === 'GET') {
            const block = await prisma.modularBlock.findUnique({
                where: { id: blockId },
            })
            if (!block) return res.status(404).json({ error: 'Block not found' })
            return res.status(200).json(block)
        }

        if (req.method === 'PUT') {
            const { title, content, industryTags, skillTags, complexity, embedConfig } = req.body
            const block = await prisma.modularBlock.update({
                where: { id: blockId },
                data: {
                    title,
                    content,
                    industryTags,
                    skillTags,
                    complexity,
                    embedConfig,
                },
            })
            return res.status(200).json(block)
        }

        if (req.method === 'DELETE') {
            await prisma.modularBlock.delete({
                where: { id: blockId },
            })
            return res.status(204).end()
        }
    } catch (e: any) {
        return handleError(e, res)
    }
}
