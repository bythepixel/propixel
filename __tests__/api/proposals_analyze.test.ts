import handler from '../../pages/api/proposals/analyze' // Level 3: __tests__/api/proposals_analyze.test.ts -> __tests__/api -> __tests__ -> root -> pages/api/proposals/analyze
import { createMockRes } from '../../tests/support/test_utils'
import { ingestionService } from '../../lib/services/ingestion'
import { recommendationService } from '../../lib/services/recommendation'

const mockPrisma = {
    proposal: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    rFP: {
        create: jest.fn(),
    },
}

jest.mock('../../lib/prisma', () => ({
    prisma: {
        proposal: {
            findUnique: jest.fn((...args) => mockPrisma.proposal.findUnique(...args)),
            update: jest.fn((...args) => mockPrisma.proposal.update(...args)),
        },
        rFP: {
            create: jest.fn((...args) => mockPrisma.rFP.create(...args)),
        }
    }
}))
jest.mock('../../lib/middleware/auth', () => ({
    requireAuth: jest.fn().mockResolvedValue({ user: { id: '1' } }),
}))
jest.mock('../../lib/utils/methodValidator', () => ({
    validateMethod: jest.fn().mockReturnValue(true),
}))
jest.mock('../../lib/services/ingestion', () => ({
    ingestionService: {
        processFile: jest.fn(),
    },
}))
jest.mock('../../lib/services/recommendation', () => ({
    recommendationService: {
        suggestBlocksForRFP: jest.fn(),
    },
}))

describe('proposals/analyze api', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('processes an RFP and returns analysis with suggestions', async () => {
        mockPrisma.proposal.findUnique.mockResolvedValue({ id: 1, companyId: 10 })
        mockPrisma.rFP.create.mockResolvedValue({ id: 50, aiSummary: 'Summary' })
            ; (ingestionService.processFile as jest.Mock).mockResolvedValue({
                summary: 'Summary',
                complexityScore: 5,
                rules: 'Rules',
                criteria: 'Criteria',
                industry: 'Tech',
                goals: 'Goals',
                reasoning: 'Reasoning'
            })
            ; (recommendationService.suggestBlocksForRFP as jest.Mock).mockResolvedValue([{ blockId: 1 }])

        const req: any = {
            method: 'POST',
            body: { proposalId: 1, filePath: 'test.pdf' },
        }
        const res = createMockRes()

        await handler(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
    })
})
