import fs from 'fs';
const { PDFParse } = require('pdf-parse');
import mammoth from 'mammoth';
import { aiService } from './ai';
import { prisma } from '../prisma';
import { DEFAULT_RFP_ANALYSIS_PROMPT } from './ai/prompts';

// Assuming AnalysisResult is defined elsewhere, or will be defined.
// For now, let's assume it's `any` or a specific type if provided.
type AnalysisResult = any; // Placeholder for the actual type

export class IngestionService {
    /**
     * Processes an RFP file (PDF or DOCX) and returns an AI analysis.
     */
    public async processFile(filePath: string): Promise<AnalysisResult> {
        const fileExtension = filePath.split('.').pop()?.toLowerCase();
        let text = '';

        if (fileExtension === 'pdf') {
            text = await this.parsePDF(filePath);
        } else if (fileExtension === 'docx') {
            text = await this.parseDOCX(filePath);
        } else {
            throw new Error(`Unsupported file type: ${fileExtension}`);
        }

        console.log(`Extracted ${text.length} characters from ${filePath}`);

        if (!text || text.trim().length === 0) {
            throw new Error('File appears to be empty or unreadable.');
        }

        // Fetch modular blocks to provide context to the AI
        const blocks = await prisma.modularBlock.findMany({
            select: { id: true, title: true, complexity: true }
        });
        const blocksMetadata = JSON.stringify(blocks.map(b => ({
            id: b.id,
            title: b.title,
            complexity: b.complexity
        })));

        // Use the default prompt template but replace the metadata placeholder
        const promptWithContext = DEFAULT_RFP_ANALYSIS_PROMPT.replace('{blocks_metadata}', blocksMetadata);

        console.log("Using Strategic RFP Analysis Prompt with Block Metadata");
        return aiService.analyzeRFP(text, promptWithContext);
    }

    /**
     * Scrapes content from a provided URL. (Placeholder for future complexity)
     */
    public async processURL(url: string): Promise<any> {
        // In a real scenario, we'd use a headless browser or fetch/cheerio here.
        // For now, we'll mark this as a future feature or ask for the page content directly.
        throw new Error('Web scraping is currently in development. Please upload a document instead.');
    }

    private async parsePDF(filePath: string): Promise<string> {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        try {
            const result = await parser.getText();
            return result.text;
        } finally {
            if (parser.destroy) await parser.destroy();
        }
    }

    private async parseDOCX(filePath: string): Promise<string> {
        const dataBuffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        return result.value;
    }
}

export const ingestionService = new IngestionService();
