import { z } from 'zod';
import { LegalArea, LegalSummary, LegalClassification } from './types.js';

// Scoring Metrics Enums
export enum ScoreCategory {
  ACCURACY = 'accuracy',
  COMPLETENESS = 'completeness',
  RELEVANCE = 'relevance',
  CLARITY = 'clarity',
  LEGAL_REASONING = 'legal_reasoning',
  FACTUAL_EXTRACTION = 'factual_extraction',
  CLASSIFICATION_PRECISION = 'classification_precision',
  CITATION_QUALITY = 'citation_quality'
}

export enum ScoreLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  SATISFACTORY = 'satisfactory',
  NEEDS_IMPROVEMENT = 'needs_improvement',
  POOR = 'poor'
}

// Individual Metric Scores
export interface MetricScore {
  category: ScoreCategory;
  score: number; // 0.0 to 10.0
  level: ScoreLevel;
  weight: number; // Weight in overall calculation
  feedback: string;
  evidence: string[];
}

// Summarization Quality Metrics
export interface SummarizationScores {
  factualAccuracy: MetricScore;
  completeness: MetricScore;
  clarity: MetricScore;
  legalReasoning: MetricScore;
  keyFactsExtraction: MetricScore;
  holdingIdentification: MetricScore;
  precedentRelevance: MetricScore;
  lengthAppropriate: MetricScore;
}

// Classification Quality Metrics
export interface ClassificationScores {
  primaryAreaAccuracy: MetricScore;
  confidenceReliability: MetricScore;
  secondaryAreaRelevance: MetricScore;
  subcategoryPrecision: MetricScore;
  reasoningQuality: MetricScore;
  legalAreaCoverage: MetricScore;
}

// Overall Analysis Scoreboard
export interface LegalAnalysisScoreboard {
  documentId: string;
  analysisTimestamp: string;
  overallScore: number; // 0.0 to 10.0
  overallGrade: ScoreLevel;
  
  // Component Scores
  summarizationScores: SummarizationScores;
  classificationScores: ClassificationScores;
  
  // Aggregate Metrics
  aggregateMetrics: {
    totalMetrics: number;
    excellentCount: number;
    goodCount: number;
    satisfactoryCount: number;
    needsImprovementCount: number;
    poorCount: number;
  };
  
  // Detailed Analysis
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  
  // Comparative Analysis
  benchmarkComparison: {
    aboveAverage: number; // % of metrics above average
    industryPercentile: number; // 0-100
    similarCasesComparison: string;
  };
  
  // Quality Assurance Flags
  qualityFlags: {
    potentialErrors: string[];
    inconsistencies: string[];
    missingElements: string[];
    confidenceIssues: string[];
  };
}

// Scoring Configuration
export const ScoringConfigSchema = z.object({
  enableDetailedScoring: z.boolean().default(true),
  includeComparativeBenchmarks: z.boolean().default(true),
  strictAccuracyMode: z.boolean().default(false),
  customWeights: z.record(z.number()).optional(),
  minimumConfidenceThreshold: z.number().min(0).max(1).default(0.6),
  requirePrecedentAnalysis: z.boolean().default(true)
});

export type ScoringConfig = z.infer<typeof ScoringConfigSchema>;

// Benchmark Data for Comparison
export interface BenchmarkData {
  legalArea: LegalArea;
  averageScores: {
    [key in ScoreCategory]: number;
  };
  caseComplexity: 'simple' | 'moderate' | 'complex';
  documentLength: 'short' | 'medium' | 'long';
  sampleSize: number;
  lastUpdated: string;
}

// Historical Performance Tracking
export interface PerformanceHistory {
  sessionId: string;
  analysisCount: number;
  averageScore: number;
  scoreDistribution: {
    [key in ScoreLevel]: number;
  };
  improvementTrend: number; // Positive = improving, negative = declining
  problemAreas: ScoreCategory[];
  bestPerformingAreas: ScoreCategory[];
}

// Validation Schema for Scoreboard Input
export const ScoreboardInputSchema = z.object({
  originalDocument: z.object({
    content: z.string(),
    title: z.string().optional(),
    expectedLegalArea: z.nativeEnum(LegalArea).optional(),
    complexity: z.enum(['simple', 'moderate', 'complex']).optional()
  }),
  analysisResults: z.object({
    summary: z.any(), // LegalSummary type
    classification: z.any() // LegalClassification type
  }),
  config: ScoringConfigSchema.optional()
});

export type ScoreboardInput = z.infer<typeof ScoreboardInputSchema>;