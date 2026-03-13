import handler from '../../pages/api/clients/index'
import idHandler from '../../pages/api/clients/[id]'
import { createMockRes } from '../../tests/support/test_utils'
import { findOrCreateHubspotContact } from '../../lib/services/hubspot'

const mockPrisma = {
  client: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

jest.mock('../../lib/prisma', () => ({
  prisma: {
    client: {
      findMany: jest.fn((...args) => mockPrisma.client.findMany(...args)),
      create: jest.fn((...args) => mockPrisma.client.create(...args)),
      update: jest.fn((...args) => mockPrisma.client.update(...args)),
      delete: jest.fn((...args) => mockPrisma.client.delete(...args)),
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
  findOrCreateHubspotContact: jest.fn().mockResolvedValue({ id: 'hs_contact_123' }),
}))

describe('clients api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lists clients', async () => {
    mockPrisma.client.findMany.mockResolvedValue([{ id: 1, firstName: 'Jane', lastName: 'Doe' }])
    const req: any = { method: 'GET' }
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalled()
  })

  it('creates a client and syncs with HubSpot', async () => {
    mockPrisma.client.create.mockResolvedValue({
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      company: { hubspotId: 'hs_comp_123' }
    })

    const req: any = {
      method: 'POST',
      body: { companyId: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@doe.com' },
    }
    const res = createMockRes()

    await handler(req, res)

    expect(mockPrisma.client.create).toHaveBeenCalled()
    expect(findOrCreateHubspotContact).toHaveBeenCalledWith('Jane', 'Doe', 'jane@doe.com', 'hs_comp_123')
    expect(mockPrisma.client.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: { hubspotId: 'hs_contact_123' }
    }))
    expect(res.status).toHaveBeenCalledWith(201)
  })
})
