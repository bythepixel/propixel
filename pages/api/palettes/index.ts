import type { NextApiRequest, NextApiResponse } from 'next'
import { paletteService } from '../../../lib/services/palette'
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
            const palettes = await paletteService.getAllPalettes()
            return res.status(200).json(palettes)
        }

        if (req.method === 'POST') {
            const palette = await paletteService.createPalette(req.body)
            return res.status(201).json(palette)
        }
    } catch (e: any) {
        return handleError(e, res)
    }
}
