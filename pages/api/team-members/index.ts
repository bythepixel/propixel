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
            const members = await prisma.teamMember.findMany({
                orderBy: { name: 'asc' },
            })
            return res.status(200).json(members)
        }

        if (req.method === 'POST') {
            const { name, title, experience, bio, skillTags } = req.body
            if (!name || !title) {
                return res.status(400).json({ error: 'Name and title are required' })
            }

            const member = await prisma.teamMember.create({
                data: {
                    name,
                    title,
                    experience: experience || '',
                    bio: bio || '',
                    skillTags: skillTags || [],
                },
            })
            return res.status(201).json(member)
        }
    } catch (e: any) {
        return handleError(e, res)
    }
}
