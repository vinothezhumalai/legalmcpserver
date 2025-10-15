#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LLMClient } from './llm-client.js';
import { LegalAnalyzer } from './legal-analyzer.js';
import { AIScoreboardEvaluator } from './ai-scoreboard.js';
import { LegalAnalysisEvaluationFramework } from './evaluation-framework.js';
import { 
  LegalDocumentSchema, 
  SummarizationOptionsSchema, 
  ClassificationOptionsSchema 
} from './types.js';
import { ScoringConfigSchema } from './scoreboard-types.js';

class LegalMCPServer {
  private server: Server;
  private legalAnalyzer: LegalAnalyzer;
  private scoreboardEvaluator: AIScoreboardEvaluator;
  private evaluationFramework: LegalAnalysisEvaluationFramework;

  constructor() {
    this.server = new Server(
      {
        name: 'legal-mcp-server',
        version: '1.0.0',
      }
    );

    // Initialize LLM client with Thomson Reuters configuration
    const llmClient = new LLMClient({
      baseURL: 'https://litellm.int.thomsonreuters.com',
      apiKey: 'sk-dxq6AQ9t7Qxen_Th4lwGGA',
      model: 'anthropic/claude-sonnet-4-20250514'
    });

    this.legalAnalyzer = new LegalAnalyzer(llmClient);
    this.scoreboardEvaluator = new AIScoreboardEvaluator(llmClient);
    this.evaluationFramework = new LegalAnalysisEvaluationFramework(llmClient);
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'summarize_legal_document',
          description: 'Summarize a legal document with key facts, holdings, and reasoning',
          inputSchema: {
            type: 'object',
            properties: {
              document: {
                type: 'object',
                properties: {
                  content: { type: 'string', description: 'The legal document content' },
                  title: { type: 'string', description: 'Document title (optional)' },
                  caseNumber: { type: 'string', description: 'Case number (optional)' },
                  jurisdiction: { type: 'string', description: 'Jurisdiction (optional)' },
                  date: { type: 'string', description: 'Document date (optional)' }
                },
                required: ['content']
              },
              options: {
                type: 'object',
                properties: {
                  maxLength: { type: 'number', default: 500, description: 'Maximum summary length' },
                  includeKeyFacts: { type: 'boolean', default: true, description: 'Include key facts' },
                  includeHolding: { type: 'boolean', default: true, description: 'Include court holding' },
                  includeReasoning: { type: 'boolean', default: true, description: 'Include legal reasoning' },
                  includeCitations: { type: 'boolean', default: false, description: 'Include citations' }
                }
              }
            },
            required: ['document']
          }
        },
        {
          name: 'classify_legal_document',
          description: 'Classify a legal document into legal areas (Contract, Tax, Constitutional, Property, Tort, Securities, Criminal, Administrative)',
          inputSchema: {
            type: 'object',
            properties: {
              document: {
                type: 'object',
                properties: {
                  content: { type: 'string', description: 'The legal document content' },
                  title: { type: 'string', description: 'Document title (optional)' },
                  caseNumber: { type: 'string', description: 'Case number (optional)' },
                  jurisdiction: { type: 'string', description: 'Jurisdiction (optional)' },
                  date: { type: 'string', description: 'Document date (optional)' }
                },
                required: ['content']
              },
              options: {
                type: 'object',
                properties: {
                  confidenceThreshold: { type: 'number', default: 0.7, description: 'Minimum confidence threshold' },
                  includeSubcategories: { type: 'boolean', default: false, description: 'Include subcategories' },
                  multiLabel: { type: 'boolean', default: false, description: 'Allow multiple labels' }
                }
              }
            },
            required: ['document']
          }
        },
        {
          name: 'analyze_legal_document_full',
          description: 'Perform both summarization and classification of a legal document',
          inputSchema: {
            type: 'object',
            properties: {
              document: {
                type: 'object',
                properties: {
                  content: { type: 'string', description: 'The legal document content' },
                  title: { type: 'string', description: 'Document title (optional)' },
                  caseNumber: { type: 'string', description: 'Case number (optional)' },
                  jurisdiction: { type: 'string', description: 'Jurisdiction (optional)' },
                  date: { type: 'string', description: 'Document date (optional)' }
                },
                required: ['content']
              }
            },
            required: ['document']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'summarize_legal_document': {
          const { document, options = {} } = request.params.arguments as any;
          const validatedDocument = LegalDocumentSchema.parse(document);
          const validatedOptions = SummarizationOptionsSchema.parse(options);
          
          const result = await this.legalAnalyzer.summarizeDocument(validatedDocument, validatedOptions);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        }

        case 'classify_legal_document': {
          const { document, options = {} } = request.params.arguments as any;
          const validatedDocument = LegalDocumentSchema.parse(document);
          const validatedOptions = ClassificationOptionsSchema.parse(options);
          
          const result = await this.legalAnalyzer.classifyDocument(validatedDocument, validatedOptions);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        }

        case 'analyze_legal_document_full': {
          const { document } = request.params.arguments as any;
          const validatedDocument = LegalDocumentSchema.parse(document);
          
          const result = await this.legalAnalyzer.analyzeDocumentFull(validatedDocument);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        }

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'legal://sample-scenarios',
          name: 'Sample Legal Scenarios',
          description: 'Collection of diverse legal scenarios for testing',
          mimeType: 'application/json'
        }
      ]
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      if (request.params.uri === 'legal://sample-scenarios') {
        const sampleScenarios = await import('./sample-scenarios.js');
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: JSON.stringify(sampleScenarios.SAMPLE_LEGAL_SCENARIOS, null, 2)
            }
          ]
        };
      }
      throw new Error(`Unknown resource: ${request.params.uri}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Legal MCP Server running on stdio');
  }
}

const server = new LegalMCPServer();
server.run().catch(console.error);