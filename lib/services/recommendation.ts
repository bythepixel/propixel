import { prisma } from '../prisma';
import { aiService } from './ai';
import { DEFAULT_CASE_STUDY_RANKING_PROMPT } from './ai/prompts';

export class RecommendationService {
    /**
     * Suggests blocks based on RFP analysis results.
     */
    public async suggestBlocksForRFP(rfpId: number): Promise<any> {
        const rfp = await prisma.rFP.findUnique({
            where: { id: rfpId },
            include: { company: true },
        });

        if (!rfp) throw new Error('RFP not found');

        // Fetch custom prompt or use default
        const config = await prisma.systemConfig.findUnique({
            where: { key: 'CASE_STUDY_RANKING_PROMPT' }
        });
        const systemPrompt = config?.value || DEFAULT_CASE_STUDY_RANKING_PROMPT;

        // 1. Fetch all available blocks (potentially filtered by industry)
        const availableBlocks = await prisma.modularBlock.findMany();

        // 2. Use AI to rank/select the best matches
        const suggestions = await aiService.suggestBlocks(rfp.aiSummary || '', availableBlocks, systemPrompt);

        // 3. (Optional) Auto-attach or returning ranking
        return suggestions;
    }
}

export const recommendationService = new RecommendationService();
