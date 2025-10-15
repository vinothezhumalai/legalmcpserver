import axios, { AxiosInstance } from 'axios';

export interface LLMConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

export class LLMClient {
  private client: AxiosInstance;
  private model: string;

  constructor(config: LLMConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });
    this.model = config.model;
  }

  async generateCompletion(prompt: string, maxTokens: number = 2000): Promise<string> {
    try {
      const response = await this.client.post('/v1/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
        top_p: 0.9
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`LLM API Error: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
      }
      throw new Error(`Unexpected error: ${error}`);
    }
  }

  async generateStructuredCompletion<T>(prompt: string, schema: string, maxTokens: number = 2000): Promise<T> {
    const structuredPrompt = `${prompt}

Please respond with valid JSON that follows this schema:
${schema}

Response:`;

    const response = await this.generateCompletion(structuredPrompt, maxTokens);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`Failed to parse LLM response as JSON: ${error}`);
    }
  }
}