import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') return res.status(405).end()

    const { proposalId, duration, maxScroll } = req.body

    // In a real implementation, we would save this to an EngagementLog table
    console.log(`[Engagement] Proposal ${proposalId}: Viewed for ${duration}s, Max Scroll: ${maxScroll}%`)

    return res.status(204).end()
}
