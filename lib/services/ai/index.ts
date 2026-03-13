import { OpenAIProvider } from './openai-provider';
import { AIProvider } from './types';

// Factory to get the configured AI provider
class AIService {
    private static instance: AIProvider;

    public static getInstance(): AIProvider {
        if (!this.instance) {
            // Default to OpenAI, but can be switched based on ENV variables in the future
            this.instance = new OpenAIProvider();
        }
        return this.instance;
    }
}

export const aiService = AIService.getInstance();
