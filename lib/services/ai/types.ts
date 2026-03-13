export interface AnalysisResult {
    summary: string;
    strategicAnalysis: string;
    complexityScore: number;
    rules: string;
    criteria: string;
    industry: string;
    goals: string;
    recommendedValue: number;
    recommendedCost: number;
    pricingExplanation: string;
    suggestedBlockIds: number[];
    missingContent: string;
    internalReasoning: string;
}

export interface AIProvider {
    analyzeRFP(text: string, systemPrompt?: string): Promise<AnalysisResult>;
    suggestBlocks(rfpSummary: string, availableBlocks: any[], systemPrompt?: string): Promise<{ blockId: number; reason: string }[]>;
}
