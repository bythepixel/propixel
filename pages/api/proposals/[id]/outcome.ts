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
    const proposalId = Number(id)

    if (isNaN(proposalId)) {
        return res.status(400).json({ error: 'Invalid ID' })
    }

    if (!validateMethod(req, res, ['POST'])) return

    const { outcome, feedback } = req.body

    if (!['WON', 'LOST', 'PENDING'].includes(outcome)) {
        return res.status(400).json({ error: 'Invalid outcome' })
    }

    try {
        const proposal = await prisma.proposal.update({
            where: { id: proposalId },
            data: { outcome, feedback },
        })

        // In a real implementation, you might trigger a Slack notification or AI re-training here
        console.log(`[Outcome] Proposal ${proposalId} marked as ${outcome}. Feedback: ${feedback || 'None'}`)

        return res.status(200).json(proposal)
    } catch (e: any) {
        return handleError(e, res)
    }
}
