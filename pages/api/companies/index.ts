import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/middleware/auth'
import { validateMethod } from '../../../lib/utils/methodValidator'
import { handleError } from '../../../lib/utils/errorHandler'
import { findOrCreateHubspotCompany } from '../../../lib/services/hubspot'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res)
  if (!session) return

  if (!validateMethod(req, res, ['GET', 'POST'])) return

  if (req.method === 'GET') {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(companies)
  }

  if (req.method === 'POST') {
    const {
      name,
      slug,
      website,
      industry,
      phone,
      email,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
    } = req.body

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' })
    }

    try {
      const company = await prisma.company.create({
        data: {
          name,
          slug,
          website,
          industry,
          phone,
          email,
          address1,
          address2,
          city,
          state,
          postalCode,
          country,
        },
      })

      // HubSpot Sync
      try {
        const domain = website ? new URL(website.startsWith('http') ? website : `https://${website}`).hostname : undefined
        const hubspotCompany = await findOrCreateHubspotCompany(name, domain)
        await prisma.company.update({
          where: { id: company.id },
          data: { hubspotId: hubspotCompany.id }
        })
        company.hubspotId = hubspotCompany.id
      } catch (hubspotError) {
        console.error('HubSpot Company Sync failed:', hubspotError)
      }

      return res.status(201).json(company)
    } catch (e: any) {
      return handleError(e, res)
    }
  }
}
