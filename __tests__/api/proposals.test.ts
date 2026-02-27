import handler from '../../pages/api/proposals/index'
import idHandler from '../../pages/api/proposals/[id]'
import { createMockRes } from '../testUtils'

const prismaMock = {
  proposal: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  client: {
    findUnique: jest.fn(),
  },
}

jest.mock('../../lib/prisma', () => ({ prisma: prismaMock }))
jest.mock('../../lib/middleware/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: '1' } }),
}))
jest.mock('../../lib/utils/methodValidator', () => ({
  validateMethod: jest.fn().mockReturnValue(true),
}))

describe('proposals api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lists proposals', async () => {
    prismaMock.proposal.findMany.mockResolvedValue([{ id: 1, title: 'Scope', slug: 'scope' }])
    const req: any = { method: 'GET' }
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalled()
  })

  it('creates a proposal and infers company from client', async () => {
    prismaMock.client.findUnique.mockResolvedValue({ companyId: 9 })
    prismaMock.proposal.create.mockResolvedValue({ id: 1 })
    const req: any = {
      method: 'POST',
      body: { title: 'Scope', slug: 'scope', clientId: 3 },
    }
    const res = createMockRes()

    await handler(req, res)

    expect(prismaMock.proposal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ companyId: 9, clientId: 3 }),
      })
    )
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('rejects company mismatch for client', async () => {
    prismaMock.client.findUnique.mockResolvedValue({ companyId: 2 })
    const req: any = {
      method: 'POST',
      body: { title: 'Scope', slug: 'scope', clientId: 3, companyId: 1 },
    }
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Client does not belong to the company' })
  })

  it('updates a proposal', async () => {
    prismaMock.proposal.update.mockResolvedValue({ id: 2 })
    const req: any = {
      method: 'PUT',
      query: { id: '2' },
      body: { title: 'Updated', slug: 'updated' },
    }
    const res = createMockRes()

    await idHandler(req, res)

    expect(prismaMock.proposal.update).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('deletes a proposal', async () => {
    prismaMock.proposal.delete.mockResolvedValue({ id: 3 })
    const req: any = { method: 'DELETE', query: { id: '3' } }
    const res = createMockRes()

    await idHandler(req, res)

    expect(prismaMock.proposal.delete).toHaveBeenCalledWith({ where: { id: 3 } })
    expect(res.status).toHaveBeenCalledWith(204)
  })
})
