import handler from '../../pages/api/clients/index'
import idHandler from '../../pages/api/clients/[id]'
import { createMockRes } from '../testUtils'

const prismaMock = {
  client: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

jest.mock('../../lib/prisma', () => ({ prisma: prismaMock }))
jest.mock('../../lib/middleware/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: '1' } }),
}))
jest.mock('../../lib/utils/methodValidator', () => ({
  validateMethod: jest.fn().mockReturnValue(true),
}))

describe('clients api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lists clients', async () => {
    prismaMock.client.findMany.mockResolvedValue([{ id: 1, firstName: 'Jane', lastName: 'Doe' }])
    const req: any = { method: 'GET' }
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalled()
  })

  it('creates a client', async () => {
    prismaMock.client.create.mockResolvedValue({ id: 1 })
    const req: any = {
      method: 'POST',
      body: { companyId: 1, firstName: 'Jane', lastName: 'Doe' },
    }
    const res = createMockRes()

    await handler(req, res)

    expect(prismaMock.client.create).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('updates a client', async () => {
    prismaMock.client.update.mockResolvedValue({ id: 2 })
    const req: any = {
      method: 'PUT',
      query: { id: '2' },
      body: { companyId: 1, firstName: 'Jane', lastName: 'Doe' },
    }
    const res = createMockRes()

    await idHandler(req, res)

    expect(prismaMock.client.update).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('deletes a client', async () => {
    prismaMock.client.delete.mockResolvedValue({ id: 3 })
    const req: any = { method: 'DELETE', query: { id: '3' } }
    const res = createMockRes()

    await idHandler(req, res)

    expect(prismaMock.client.delete).toHaveBeenCalledWith({ where: { id: 3 } })
    expect(res.status).toHaveBeenCalledWith(204)
  })
})
