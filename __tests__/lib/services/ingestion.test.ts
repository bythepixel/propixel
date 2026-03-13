// Mock pdf-parse and mammoth BEFORE importing IngestionService to avoid ESM errors
jest.mock('pdf-parse', () => jest.fn());
jest.mock('mammoth', () => ({
    extractRawText: jest.fn()
}));
jest.mock('fs', () => ({
    readFileSync: jest.fn()
}));
jest.mock('../../../lib/services/ai', () => ({
    aiService: {
        analyzeRFP: jest.fn().mockResolvedValue({ summary: 'analyzed' }),
    },
}));
jest.mock('../../../lib/prisma', () => ({
    prisma: {
        systemConfig: {
            findUnique: jest.fn().mockResolvedValue({ value: 'mocked prompt' })
        }
    }
}));

import { IngestionService } from '../../../lib/services/ingestion';
import fs from 'fs';
import pdf from 'pdf-parse';

describe('IngestionService', () => {
    let service: IngestionService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new IngestionService();
    });

    it('should process PDF and call AI analysis', async () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('pdf data'));
        (pdf as unknown as jest.Mock).mockResolvedValue({ text: 'extracted pdf text' });

        const result = await service.processFile('test.pdf');

        expect(result.summary).toBe('analyzed');
    });
});
