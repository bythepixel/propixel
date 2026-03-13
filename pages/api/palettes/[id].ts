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

    const { id } = req.query
    const paletteId = Number(id)

    if (isNaN(paletteId)) {
        return res.status(400).json({ error: 'Invalid ID' })
    }

    if (!validateMethod(req, res, ['GET', 'PUT', 'DELETE'])) return

    try {
        if (req.method === 'GET') {
            const palette = await paletteService.getPaletteById(paletteId)
            if (!palette) return res.status(404).json({ error: 'Palette not found' })
            return res.status(200).json(palette)
        }

        if (req.method === 'PUT') {
            const palette = await paletteService.updatePalette(paletteId, req.body)
            return res.status(200).json(palette)
        }

        if (req.method === 'DELETE') {
            await paletteService.deletePalette(paletteId)
            return res.status(204).end()
        }
    } catch (e: any) {
        return handleError(e, res)
    }
}
