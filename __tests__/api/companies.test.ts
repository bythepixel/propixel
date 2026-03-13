import handler from '../../pages/api/companies/index'
import idHandler from '../../pages/api/companies/[id]'
import { createMockRes } from '../../tests/support/test_utils'
import { findOrCreateHubspotCompany } from '../../lib/services/hubspot'

const mockPrisma = {
  company: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

jest.mock('../../lib/prisma', () => ({
  prisma: {
    company: {
      findMany: jest.fn((...args) => mockPrisma.company.findMany(...args)),
      create: jest.fn((...args) => mockPrisma.company.create(...args)),
      update: jest.fn((...args) => mockPrisma.company.update(...args)),
      delete: jest.fn((...args) => mockPrisma.company.delete(...args)),
    }
  }
}))

jest.mock('../../lib/middleware/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: '1' } }),
}))

jest.mock('../../lib/utils/methodValidator', () => ({
  validateMethod: jest.fn().mockReturnValue(true),
}))

jest.mock('../../lib/services/hubspot', () => ({
  findOrCreateHubspotCompany: jest.fn().mockResolvedValue({ id: 'hs_company_123' }),
}))

describe('companies api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lists companies', async () => {
    mockPrisma.company.findMany.mockResolvedValue([{ id: 1, name: 'Acme', slug: 'acme' }])
    const req: any = { method: 'GET' }
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Acme', slug: 'acme' }])
  })

  it('creates a company and syncs with HubSpot', async () => {
    mockPrisma.company.create.mockResolvedValue({ id: 1, name: 'Acme', slug: 'acme' })
    const req: any = { method: 'POST', body: { name: 'Acme', slug: 'acme', website: 'acme.com' } }
    const res = createMockRes()

    await handler(req, res)

    expect(mockPrisma.company.create).toHaveBeenCalled()
    expect(findOrCreateHubspotCompany).toHaveBeenCalledWith('Acme', 'acme.com')
    expect(mockPrisma.company.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: { hubspotId: 'hs_company_123' }
    }))
    expect(res.status).toHaveBeenCalledWith(201)
  })
})
