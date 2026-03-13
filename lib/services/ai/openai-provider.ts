import OpenAI from 'openai';
import { AnalysisResult, AIProvider } from './types';
import { DEFAULT_RFP_ANALYSIS_PROMPT } from './prompts';

export class OpenAIProvider implements AIProvider {
    private client: OpenAI;
    private model: string;

    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.model = process.env.AI_MODEL || 'gpt-4o';
    }

    async analyzeRFP(text: string, systemPrompt?: string): Promise<AnalysisResult> {
        const promptTemplate = systemPrompt || DEFAULT_RFP_ANALYSIS_PROMPT;
        
        // The ingestion service will pass block metadata if available
        // If not, we'll use a placeholder or empty string
        const finalPrompt = promptTemplate.replace('{blocks_metadata}', '[]'); 

        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: finalPrompt,
                },
                {
                    role: 'user',
                    content: `Analyze the following RFP text and return ONLY a JSON object: \n\n${text}`,
                },
            ],
            response_format: { type: 'json_object' },
        });

        const rawContent = response.choices[0].message.content || '{}';
        console.log("RAW AI CONTENT:", rawContent);
        const content = JSON.parse(rawContent);

        const flatten = (val: any) => Array.isArray(val) ? val.join('\n') : val;

        return {
            summary: flatten(content.summary || content.aiSummary || ''),
            strategicAnalysis: flatten(content.strategicAnalysis || ''),
            complexityScore: content.complexityScore || 5,
            rules: flatten(content.rules || ''),
            criteria: flatten(content.criteria || ''),
            industry: flatten(content.industry || ''),
            goals: flatten(content.goals || ''),
            recommendedValue: Number(content.recommendedValue) || 0,
            recommendedCost: Number(content.recommendedCost) || 0,
            pricingExplanation: flatten(content.pricingExplanation || ''),
            suggestedBlockIds: Array.isArray(content.suggestedBlocks) ? content.suggestedBlocks : [],
            missingContent: flatten(content.missingContent || ''),
            internalReasoning: flatten(content.internalReasoning || content.reasoning || 'Extracted from RFP content automatically.'),
        };
    }

    async suggestBlocks(rfpSummary: string, availableBlocks: any[], systemPrompt?: string): Promise<{ blockId: number; reason: string }[]> {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt || `Given an RFP summary and a list of available modular content blocks, suggest the most relevant blocks to include in the proposal. 
          Provide a reasoning for each choice. Return a JSON array of objects: { blockId, reason }.`,
                },
                {
                    role: 'user',
                    content: JSON.stringify({ rfpSummary, availableBlocks }),
                },
            ],
            response_format: { type: 'json_object' },
        });

        const content = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
        return content.suggestions || [];
    }
}
