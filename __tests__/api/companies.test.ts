import handler from '../../pages/api/companies/index'
import idHandler from '../../pages/api/companies/[id]'
import { createMockRes } from '../testUtils'

const prismaMock = {
  company: {
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

describe('companies api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lists companies', async () => {
    prismaMock.company.findMany.mockResolvedValue([{ id: 1, name: 'Acme', slug: 'acme' }])
    const req: any = { method: 'GET' }
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Acme', slug: 'acme' }])
  })

  it('creates a company', async () => {
    prismaMock.company.create.mockResolvedValue({ id: 1, name: 'Acme', slug: 'acme' })
    const req: any = { method: 'POST', body: { name: 'Acme', slug: 'acme' } }
    const res = createMockRes()

    await handler(req, res)

    expect(prismaMock.company.create).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('updates a company', async () => {
    prismaMock.company.update.mockResolvedValue({ id: 2, name: 'Beta', slug: 'beta' })
    const req: any = { method: 'PUT', query: { id: '2' }, body: { name: 'Beta', slug: 'beta' } }
    const res = createMockRes()

    await idHandler(req, res)

    expect(prismaMock.company.update).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('deletes a company', async () => {
    prismaMock.company.delete.mockResolvedValue({ id: 3 })
    const req: any = { method: 'DELETE', query: { id: '3' } }
    const res = createMockRes()

    await idHandler(req, res)

    expect(prismaMock.company.delete).toHaveBeenCalledWith({ where: { id: 3 } })
    expect(res.status).toHaveBeenCalledWith(204)
  })
})
