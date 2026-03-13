import type { NextApiRequest, NextApiResponse } from 'next'
import { exportService } from '../../../../lib/services/export'
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

    if (!validateMethod(req, res, ['GET'])) return

    try {
        const pdfBuffer = await exportService.generateProposalPDF(proposalId)

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="proposal-${proposalId}.pdf"`)
        return res.status(200).send(pdfBuffer)
    } catch (e: any) {
        return handleError(e, res)
    }
}
