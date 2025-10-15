import { z } from 'zod';

export enum LegalArea {
  CONTRACT_LAW = 'Contract Law',
  TAX_LAW = 'Tax Law',
  CONSTITUTIONAL_LAW = 'Constitutional Law',
  PROPERTY_LAW = 'Property Law',
  TORT_LAW = 'Tort Law',
  SECURITIES_LAW = 'Securities Law',
  CRIMINAL_LAW = 'Criminal Law',
  ADMINISTRATIVE_LAW = 'Administrative Law'
}

export const LegalDocumentSchema = z.object({
  content: z.string().min(1, 'Document content is required'),
  title: z.string().optional(),
  caseNumber: z.string().optional(),
  jurisdiction: z.string().optional(),
  date: z.string().optional()
});

export const SummarizationOptionsSchema = z.object({
  maxLength: z.number().min(50).max(2000).default(500),
  includeKeyFacts: z.boolean().default(true),
  includeHolding: z.boolean().default(true),
  includeReasoning: z.boolean().default(true),
  includeCitations: z.boolean().default(false)
});

export const ClassificationOptionsSchema = z.object({
  confidenceThreshold: z.number().min(0).max(1).default(0.7),
  includeSubcategories: z.boolean().default(false),
  multiLabel: z.boolean().default(false)
});

export interface LegalSummary {
  summary: string;
  keyFacts: string[];
  legalIssues: string[];
  holding: string;
  reasoning: string;
  precedents: string[];
  wordCount: number;
}

export interface LegalClassification {
  primaryArea: LegalArea;
  confidence: number;
  secondaryAreas: Array<{
    area: LegalArea;
    confidence: number;
  }>;
  subcategories: string[];
  reasoning: string;
}

export type LegalDocument = z.infer<typeof LegalDocumentSchema>;
export type SummarizationOptions = z.infer<typeof SummarizationOptionsSchema>;
export type ClassificationOptions = z.infer<typeof ClassificationOptionsSchema>;