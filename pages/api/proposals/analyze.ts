import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/middleware/auth'
import { validateMethod } from '../../../lib/utils/methodValidator'
import { handleError } from '../../../lib/utils/errorHandler'
import { ingestionService } from '../../../lib/services/ingestion'
import { recommendationService } from '../../../lib/services/recommendation'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await requireAuth(req, res)
    if (!session) return

    if (!validateMethod(req, res, ['POST'])) return

    const { proposalId, filePath } = req.body

    if (!proposalId || !filePath) {
        return res.status(400).json({ error: 'Proposal ID and file path are required' })
    }

    try {
        const proposal = await prisma.proposal.findUnique({
            where: { id: Number(proposalId) },
            include: { company: true }
        })

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' })
        }

        // 1. Process File & AI Analysis
        const analysis = await ingestionService.processFile(filePath)

        // 2. Create/Update RFP Record
        const rfp = await prisma.rFP.create({
            data: {
                companyId: proposal.companyId!,
                originalFileUrl: filePath,
                aiSummary: analysis.summary,
                complexityScore: analysis.complexityScore,
                rules: analysis.rules,
                criteria: analysis.criteria,
                industry: analysis.industry,
                goals: analysis.goals,
                internalReasoning: analysis.reasoning,
            }
        })

        // 3. Update Proposal with RFP ID
        await prisma.proposal.update({
            where: { id: proposal.id },
            data: { rfpId: rfp.id }
        })

        // 4. Get Block Recommendations
        const suggestions = await recommendationService.suggestBlocksForRFP(rfp.id)

        return res.status(200).json({
            rfp,
            suggestions
        })
    } catch (e: any) {
        return handleError(e, res)
    }
}
