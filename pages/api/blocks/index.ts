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

    try {
        if (req.method === 'GET') {
            const blocks = await prisma.modularBlock.findMany({
                orderBy: { title: 'asc' },
            })
            return res.status(200).json(blocks)
        }

        if (req.method === 'POST') {
            const { title, content, industryTags, skillTags, complexity, embedConfig } = req.body
            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required' })
            }

            const block = await prisma.modularBlock.create({
                data: {
                    title,
                    content,
                    industryTags: industryTags || [],
                    skillTags: skillTags || [],
                    complexity: complexity || 'medium',
                    embedConfig: embedConfig || {},
                },
            })
            return res.status(201).json(block)
        }
    } catch (e: any) {
        return handleError(e, res)
    }
}
