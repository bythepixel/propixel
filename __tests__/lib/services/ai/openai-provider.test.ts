import { OpenAIProvider } from '../../../../lib/services/ai/openai-provider';
import OpenAI from 'openai';

const mockCreateChatCompletion = jest.fn();

jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: mockCreateChatCompletion,
            },
        },
    }));
});

describe('OpenAIProvider', () => {
    let provider: OpenAIProvider;

    beforeEach(() => {
        jest.clearAllMocks();
        provider = new OpenAIProvider();
    });

    describe('analyzeRFP', () => {
        it('should correctly parse strategic details from OpenAI response', async () => {
            mockCreateChatCompletion.mockResolvedValue({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            summary: 'Test summary',
                            complexityScore: 8,
                            rules: 'Must be blue',
                            criteria: 'Lowest price',
                            industry: 'Tech',
                            goals: 'Scale',
                            internalReasoning: 'Looks like a good fit.'
                        })
                    }
                }]
            });

            const result = await provider.analyzeRFP('RFP Content');

            expect(result.summary).toBe('Test summary');
            expect(result.complexityScore).toBe(8);
            expect(result.rules).toBe('Must be blue');
        });

        it('should provide fallbacks for missing JSON fields', async () => {
            mockCreateChatCompletion.mockResolvedValue({
                choices: [{
                    message: { content: '{}' }
                }]
            });

            const result = await provider.analyzeRFP('empty');
            expect(result.complexityScore).toBe(5);
            expect(result.summary).toBe('');
        });
    });

    describe('suggestBlocks', () => {
        it('should return suggested blocks from AI', async () => {
            mockCreateChatCompletion.mockResolvedValue({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            suggestions: [
                                { blockId: 1, reason: 'Matches industry' },
                                { blockId: 2, reason: 'Strong case study' }
                            ]
                        })
                    }
                }]
            });

            const result = await provider.suggestBlocks('summary', []);
            expect(result).toHaveLength(2);
            expect(result[0].blockId).toBe(1);
        });
    });
});
