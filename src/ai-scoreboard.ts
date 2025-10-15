import { LLMClient } from './llm-client.js';
import { LegalDocument, LegalSummary, LegalClassification, LegalArea } from './types.js';
import {
  LegalAnalysisScoreboard,
  MetricScore,
  ScoreCategory,
  ScoreLevel,
  SummarizationScores,
  ClassificationScores,
  ScoringConfig,
  ScoreboardInput,
  BenchmarkData,
  PerformanceHistory
} from './scoreboard-types.js';

export class AIScoreboardEvaluator {
  private llmClient: LLMClient;
  private benchmarkData: Map<string, BenchmarkData>;
  private performanceHistory: PerformanceHistory[];

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
    this.benchmarkData = new Map();
    this.performanceHistory = [];
    this.initializeBenchmarks();
  }

  async evaluateAnalysis(input: ScoreboardInput): Promise<LegalAnalysisScoreboard> {
    const config = input.config || {
      enableDetailedScoring: true,
      includeComparativeBenchmarks: true,
      strictAccuracyMode: false,
      minimumConfidenceThreshold: 0.6,
      requirePrecedentAnalysis: true
    };

    // Evaluate summarization quality
    const summarizationScores = await this.evaluateSummarization(
      input.originalDocument,
      input.analysisResults.summary,
      config
    );

    // Evaluate classification accuracy
    const classificationScores = await this.evaluateClassification(
      input.originalDocument,
      input.analysisResults.classification,
      config
    );

    // Calculate overall scores
    const overallScore = this.calculateOverallScore(summarizationScores, classificationScores);
    const overallGrade = this.getScoreLevel(overallScore);

    // Generate analysis insights
    const insights = await this.generateAnalysisInsights(
      input.originalDocument,
      input.analysisResults,
      summarizationScores,
      classificationScores
    );

    // Create comprehensive scoreboard
    const scoreboard: LegalAnalysisScoreboard = {
      documentId: this.generateDocumentId(input.originalDocument),
      analysisTimestamp: new Date().toISOString(),
      overallScore,
      overallGrade,
      summarizationScores,
      classificationScores,
      aggregateMetrics: this.calculateAggregateMetrics(summarizationScores, classificationScores),
      strengths: insights.strengths,
      weaknesses: insights.weaknesses,
      recommendations: insights.recommendations,
      benchmarkComparison: await this.generateBenchmarkComparison(
        input.originalDocument,
        overallScore,
        config
      ),
      qualityFlags: await this.identifyQualityFlags(
        input.originalDocument,
        input.analysisResults,
        config
      )
    };

    // Update performance history
    this.updatePerformanceHistory(scoreboard);

    return scoreboard;
  }

  private async evaluateSummarization(
    document: any,
    summary: LegalSummary,
    config: ScoringConfig
  ): Promise<SummarizationScores> {
    const evaluationPrompt = `Evaluate the quality of this legal document summarization:

Original Document:
${document.content}

Generated Summary:
${JSON.stringify(summary, null, 2)}

Please evaluate on these criteria (score 0-10 for each):
1. Factual Accuracy - Are all facts correctly represented?
2. Completeness - Does it capture all essential elements?
3. Clarity - Is the summary clear and well-structured?
4. Legal Reasoning - Is the legal analysis sound?
5. Key Facts Extraction - Are the most important facts identified?
6. Holding Identification - Is the court's decision accurately captured?
7. Precedent Relevance - Are cited precedents relevant and accurate?
8. Length Appropriate - Is the summary appropriately concise?

Format response as JSON with detailed scores and feedback.`;

    const evaluationSchema = `{
      "factualAccuracy": {"score": number, "feedback": "string", "evidence": ["string"]},
      "completeness": {"score": number, "feedback": "string", "evidence": ["string"]},
      "clarity": {"score": number, "feedback": "string", "evidence": ["string"]},
      "legalReasoning": {"score": number, "feedback": "string", "evidence": ["string"]},
      "keyFactsExtraction": {"score": number, "feedback": "string", "evidence": ["string"]},
      "holdingIdentification": {"score": number, "feedback": "string", "evidence": ["string"]},
      "precedentRelevance": {"score": number, "feedback": "string", "evidence": ["string"]},
      "lengthAppropriate": {"score": number, "feedback": "string", "evidence": ["string"]}
    }`;

    const rawScores = await this.llmClient.generateStructuredCompletion<any>(
      evaluationPrompt,
      evaluationSchema,
      2000
    );

    // Convert raw scores to MetricScore objects
    return {
      factualAccuracy: this.createMetricScore(ScoreCategory.ACCURACY, rawScores.factualAccuracy, 0.2),
      completeness: this.createMetricScore(ScoreCategory.COMPLETENESS, rawScores.completeness, 0.15),
      clarity: this.createMetricScore(ScoreCategory.CLARITY, rawScores.clarity, 0.1),
      legalReasoning: this.createMetricScore(ScoreCategory.LEGAL_REASONING, rawScores.legalReasoning, 0.2),
      keyFactsExtraction: this.createMetricScore(ScoreCategory.FACTUAL_EXTRACTION, rawScores.keyFactsExtraction, 0.15),
      holdingIdentification: this.createMetricScore(ScoreCategory.LEGAL_REASONING, rawScores.holdingIdentification, 0.1),
      precedentRelevance: this.createMetricScore(ScoreCategory.CITATION_QUALITY, rawScores.precedentRelevance, 0.05),
      lengthAppropriate: this.createMetricScore(ScoreCategory.RELEVANCE, rawScores.lengthAppropriate, 0.05)
    };
  }

  private async evaluateClassification(
    document: any,
    classification: LegalClassification,
    config: ScoringConfig
  ): Promise<ClassificationScores> {
    const evaluationPrompt = `Evaluate the accuracy of this legal document classification:

Document Content:
${document.content}
Expected Legal Area: ${document.expectedLegalArea || 'Not specified'}

Classification Result:
${JSON.stringify(classification, null, 2)}

Evaluate on these criteria (score 0-10):
1. Primary Area Accuracy - Is the primary legal area correct?
2. Confidence Reliability - Are confidence scores realistic?
3. Secondary Area Relevance - Are secondary areas genuinely relevant?
4. Subcategory Precision - Are subcategories accurate and specific?
5. Reasoning Quality - Is the classification reasoning sound?
6. Legal Area Coverage - Are all applicable areas identified?

Consider the 8 legal areas: Contract, Tax, Constitutional, Property, Tort, Securities, Criminal, Administrative Law.`;

    const evaluationSchema = `{
      "primaryAreaAccuracy": {"score": number, "feedback": "string", "evidence": ["string"]},
      "confidenceReliability": {"score": number, "feedback": "string", "evidence": ["string"]},
      "secondaryAreaRelevance": {"score": number, "feedback": "string", "evidence": ["string"]},
      "subcategoryPrecision": {"score": number, "feedback": "string", "evidence": ["string"]},
      "reasoningQuality": {"score": number, "feedback": "string", "evidence": ["string"]},
      "legalAreaCoverage": {"score": number, "feedback": "string", "evidence": ["string"]}
    }`;

    const rawScores = await this.llmClient.generateStructuredCompletion<any>(
      evaluationPrompt,
      evaluationSchema,
      1500
    );

    return {
      primaryAreaAccuracy: this.createMetricScore(ScoreCategory.CLASSIFICATION_PRECISION, rawScores.primaryAreaAccuracy, 0.3),
      confidenceReliability: this.createMetricScore(ScoreCategory.ACCURACY, rawScores.confidenceReliability, 0.2),
      secondaryAreaRelevance: this.createMetricScore(ScoreCategory.RELEVANCE, rawScores.secondaryAreaRelevance, 0.15),
      subcategoryPrecision: this.createMetricScore(ScoreCategory.CLASSIFICATION_PRECISION, rawScores.subcategoryPrecision, 0.15),
      reasoningQuality: this.createMetricScore(ScoreCategory.LEGAL_REASONING, rawScores.reasoningQuality, 0.15),
      legalAreaCoverage: this.createMetricScore(ScoreCategory.COMPLETENESS, rawScores.legalAreaCoverage, 0.05)
    };
  }

  private createMetricScore(category: ScoreCategory, rawScore: any, weight: number): MetricScore {
    const score = Math.max(0, Math.min(10, rawScore.score));
    return {
      category,
      score,
      level: this.getScoreLevel(score),
      weight,
      feedback: rawScore.feedback || '',
      evidence: rawScore.evidence || []
    };
  }

  private getScoreLevel(score: number): ScoreLevel {
    if (score >= 9.0) return ScoreLevel.EXCELLENT;
    if (score >= 7.5) return ScoreLevel.GOOD;
    if (score >= 6.0) return ScoreLevel.SATISFACTORY;
    if (score >= 4.0) return ScoreLevel.NEEDS_IMPROVEMENT;
    return ScoreLevel.POOR;
  }

  private calculateOverallScore(
    summarizationScores: SummarizationScores,
    classificationScores: ClassificationScores
  ): number {
    const allScores = [
      ...Object.values(summarizationScores),
      ...Object.values(classificationScores)
    ];

    const weightedSum = allScores.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
    const totalWeight = allScores.reduce((sum, metric) => sum + metric.weight, 0);

    return Math.round((weightedSum / totalWeight) * 100) / 100;
  }

  private calculateAggregateMetrics(
    summarizationScores: SummarizationScores,
    classificationScores: ClassificationScores
  ) {
    const allScores = [
      ...Object.values(summarizationScores),
      ...Object.values(classificationScores)
    ];

    const levelCounts = allScores.reduce((acc, metric) => {
      acc[metric.level] = (acc[metric.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMetrics: allScores.length,
      excellentCount: levelCounts[ScoreLevel.EXCELLENT] || 0,
      goodCount: levelCounts[ScoreLevel.GOOD] || 0,
      satisfactoryCount: levelCounts[ScoreLevel.SATISFACTORY] || 0,
      needsImprovementCount: levelCounts[ScoreLevel.NEEDS_IMPROVEMENT] || 0,
      poorCount: levelCounts[ScoreLevel.POOR] || 0
    };
  }

  private async generateAnalysisInsights(
    document: any,
    results: any,
    summarizationScores: SummarizationScores,
    classificationScores: ClassificationScores
  ) {
    const allScores = [...Object.values(summarizationScores), ...Object.values(classificationScores)];
    const strengths = allScores.filter(s => s.level === ScoreLevel.EXCELLENT || s.level === ScoreLevel.GOOD)
      .map(s => `${s.category}: ${s.feedback}`);
    
    const weaknesses = allScores.filter(s => s.level === ScoreLevel.NEEDS_IMPROVEMENT || s.level === ScoreLevel.POOR)
      .map(s => `${s.category}: ${s.feedback}`);

    const recommendations = [
      ...weaknesses.map(w => `Improve ${w.split(':')[0].toLowerCase()}`),
      'Consider additional legal precedent research',
      'Review factual accuracy against source document'
    ];

    return { strengths, weaknesses, recommendations };
  }

  private async generateBenchmarkComparison(document: any, overallScore: number, config: ScoringConfig) {
    // Simplified benchmark comparison
    const industryAverage = 7.2; // Mock industry average
    const aboveAverage = ((overallScore - industryAverage) / industryAverage) * 100;
    
    return {
      aboveAverage: Math.round(aboveAverage * 100) / 100,
      industryPercentile: Math.min(99, Math.max(1, Math.round((overallScore / 10) * 100))),
      similarCasesComparison: overallScore > industryAverage ? 'Above average performance' : 'Below average performance'
    };
  }

  private async identifyQualityFlags(document: any, results: any, config: ScoringConfig) {
    return {
      potentialErrors: [],
      inconsistencies: [],
      missingElements: [],
      confidenceIssues: results.classification.confidence < config.minimumConfidenceThreshold ? 
        ['Low classification confidence'] : []
    };
  }

  private generateDocumentId(document: any): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updatePerformanceHistory(scoreboard: LegalAnalysisScoreboard): void {
    // Implementation for tracking performance over time
    // This would typically persist to a database
  }

  private initializeBenchmarks(): void {
    // Initialize benchmark data for different legal areas
    // This would typically load from a database or configuration
  }
}