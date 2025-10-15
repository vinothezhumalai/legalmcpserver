import { LLMClient } from './llm-client.js';
import { 
  LegalDocument, 
  LegalSummary, 
  LegalClassification, 
  LegalArea,
  SummarizationOptions,
  ClassificationOptions 
} from './types.js';

export class LegalAnalyzer {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  async summarizeDocument(document: LegalDocument, options: SummarizationOptions): Promise<LegalSummary> {
    const prompt = `You are a legal expert. Please analyze and summarize the following legal document:

Title: ${document.title || 'N/A'}
Case Number: ${document.caseNumber || 'N/A'}
Jurisdiction: ${document.jurisdiction || 'N/A'}
Date: ${document.date || 'N/A'}

Document Content:
${document.content}

Please provide a comprehensive legal analysis with the following components:
1. Executive Summary (${options.maxLength} words max)
2. Key Facts (bullet points)
3. Legal Issues Identified
4. Court's Holding/Decision
5. Legal Reasoning
6. Relevant Precedents/Citations

Format your response as JSON with the following structure:
{
  "summary": "string",
  "keyFacts": ["string"],
  "legalIssues": ["string"],
  "holding": "string",
  "reasoning": "string",
  "precedents": ["string"],
  "wordCount": number
}`;

    const schema = `{
      "summary": "Executive summary of the legal document",
      "keyFacts": ["Array of key factual points"],
      "legalIssues": ["Array of legal issues identified"],
      "holding": "The court's decision or holding",
      "reasoning": "The legal reasoning behind the decision",
      "precedents": ["Array of relevant precedents or citations"],
      "wordCount": "Number of words in the summary"
    }`;

    return await this.llmClient.generateStructuredCompletion<LegalSummary>(prompt, schema, 3000);
  }

  async classifyDocument(document: LegalDocument, options: ClassificationOptions): Promise<LegalClassification> {
    const legalAreasDescription = Object.values(LegalArea).map((area, index) => 
      `${index + 1}. ${area}: ${this.getLegalAreaDescription(area)}`
    ).join('\n');

    const prompt = `You are a legal classification expert. Please analyze and classify the following legal document into one or more of these legal areas:

${legalAreasDescription}

Document to classify:
Title: ${document.title || 'N/A'}
Content: ${document.content}

Please classify this document by:
1. Identifying the PRIMARY legal area (highest confidence)
2. Identifying any SECONDARY legal areas (if applicable)
3. Providing confidence scores (0.0 to 1.0)
4. Listing relevant subcategories within each area
5. Explaining your classification reasoning

Minimum confidence threshold: ${options.confidenceThreshold}`;

    const schema = `{
      "primaryArea": "One of: ${Object.values(LegalArea).join(', ')}",
      "confidence": "Number between 0.0 and 1.0",
      "secondaryAreas": [
        {
          "area": "Legal area name",
          "confidence": "Number between 0.0 and 1.0"
        }
      ],
      "subcategories": ["Array of specific subcategories"],
      "reasoning": "Explanation of classification decision"
    }`;

    return await this.llmClient.generateStructuredCompletion<LegalClassification>(prompt, schema, 2000);
  }

  async analyzeDocumentFull(document: LegalDocument): Promise<{
    summary: LegalSummary;
    classification: LegalClassification;
  }> {
    const [summary, classification] = await Promise.all([
      this.summarizeDocument(document, { maxLength: 500, includeKeyFacts: true, includeHolding: true, includeReasoning: true, includeCitations: true }),
      this.classifyDocument(document, { confidenceThreshold: 0.7, includeSubcategories: true, multiLabel: true })
    ]);

    return { summary, classification };
  }

  private getLegalAreaDescription(area: LegalArea): string {
    const descriptions: Record<LegalArea, string> = {
      [LegalArea.CONTRACT_LAW]: 'Agreements, breaches, performance, remedies, formation',
      [LegalArea.TAX_LAW]: 'Taxation, IRS matters, tax planning, compliance, disputes',
      [LegalArea.CONSTITUTIONAL_LAW]: 'Constitutional rights, government powers, judicial review',
      [LegalArea.PROPERTY_LAW]: 'Real estate, ownership, transfers, easements, zoning',
      [LegalArea.TORT_LAW]: 'Personal injury, negligence, intentional torts, damages',
      [LegalArea.SECURITIES_LAW]: 'Investment securities, SEC regulations, fraud, disclosure',
      [LegalArea.CRIMINAL_LAW]: 'Criminal charges, prosecution, defense, sentencing',
      [LegalArea.ADMINISTRATIVE_LAW]: 'Government agencies, regulations, administrative procedures'
    };
    return descriptions[area];
  }
}