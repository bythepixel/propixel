import handler from '../../pages/api/proposals/index'
import { createMockRes } from '../../tests/support/test_utils'
import { createHubspotDeal } from '../../lib/services/hubspot'

const mockPrisma = {
  proposal: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  client: {
    findUnique: jest.fn(),
  },
}

jest.mock('../../lib/prisma', () => ({
  prisma: {
    proposal: {
      findMany: jest.fn((...args) => mockPrisma.proposal.findMany(...args)),
      create: jest.fn((...args) => mockPrisma.proposal.create(...args)),
      update: jest.fn((...args) => mockPrisma.proposal.update(...args)),
    },
    client: {
      findUnique: jest.fn((...args) => mockPrisma.client.findUnique(...args)),
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
  createHubspotDeal: jest.fn().mockResolvedValue({ id: 'hs_deal_123' }),
}))

describe('proposals api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates proposal and syncs with HubSpot', async () => {
    mockPrisma.client.findUnique.mockResolvedValue({ companyId: 9, company: { hubspotId: 'hs_comp_9' } })
    mockPrisma.proposal.create.mockResolvedValue({
      id: 1,
      title: 'Scope',
      company: { hubspotId: 'hs_comp_9' }
    })

    const req: any = {
      method: 'POST',
      body: { title: 'Scope', slug: 'scope', clientId: 3 },
    }
    const res = createMockRes()

    await handler(req, res)

    expect(mockPrisma.proposal.create).toHaveBeenCalled()
    expect(createHubspotDeal).toHaveBeenCalledWith('Scope', 0, 'hs_comp_9')
  })
})
