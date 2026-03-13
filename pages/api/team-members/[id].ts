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
    const memberId = Number(id)

    if (isNaN(memberId)) {
        return res.status(400).json({ error: 'Invalid ID' })
    }

    if (!validateMethod(req, res, ['GET', 'PUT', 'DELETE'])) return

    try {
        if (req.method === 'GET') {
            const member = await prisma.teamMember.findUnique({
                where: { id: memberId },
            })
            if (!member) return res.status(404).json({ error: 'Member not found' })
            return res.status(200).json(member)
        }

        if (req.method === 'PUT') {
            const { name, title, experience, bio, skillTags } = req.body
            const member = await prisma.teamMember.update({
                where: { id: memberId },
                data: {
                    name,
                    title,
                    experience,
                    bio,
                    skillTags,
                },
            })
            return res.status(200).json(member)
        }

        if (req.method === 'DELETE') {
            await prisma.teamMember.delete({
                where: { id: memberId },
            })
            return res.status(204).end()
        }
    } catch (e: any) {
        return handleError(e, res)
    }
}
