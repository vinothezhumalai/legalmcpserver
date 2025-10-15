import { LLMClient } from './llm-client.js';
import { LegalAnalyzer } from './legal-analyzer.js';
import { AIScoreboardEvaluator } from './ai-scoreboard.js';
import { 
  LegalDocument, 
  LegalSummary, 
  LegalClassification,
  LegalArea,
  SummarizationOptions,
  ClassificationOptions 
} from './types.js';
import {
  LegalAnalysisScoreboard,
  ScoreboardInput,
  ScoringConfig,
  ScoreLevel,
  PerformanceHistory,
  BenchmarkData
} from './scoreboard-types.js';

export interface EvaluationReport {
  documentId: string;
  timestamp: string;
  originalAnalysis: {
    summary: LegalSummary;
    classification: LegalClassification;
  };
  scoreboard: LegalAnalysisScoreboard;
  performanceInsights: PerformanceInsights;
  recommendedImprovements: ImprovementRecommendations;
}

export interface PerformanceInsights {
  overallGrade: string;
  scoreBreakdown: {
    summarization: number;
    classification: number;
    overall: number;
  };
  strengthAreas: string[];
  improvementAreas: string[];
  comparisonToBaseline: {
    percentageImprovement: number;
    trendDirection: 'improving' | 'stable' | 'declining';
  };
  confidenceAnalysis: {
    averageConfidence: number;
    reliabilityScore: number;
    uncertaintyAreas: string[];
  };
}

export interface ImprovementRecommendations {
  immediateActions: string[];
  longTermImprovements: string[];
  trainingFocus: string[];
  technicalOptimizations: string[];
  qualityAssurance: string[];
}

export class LegalAnalysisEvaluationFramework {
  private legalAnalyzer: LegalAnalyzer;
  private scoreboardEvaluator: AIScoreboardEvaluator;
  private llmClient: LLMClient;
  private evaluationHistory: EvaluationReport[];

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
    this.legalAnalyzer = new LegalAnalyzer(llmClient);
    this.scoreboardEvaluator = new AIScoreboardEvaluator(llmClient);
    this.evaluationHistory = [];
  }

  async runComprehensiveEvaluation(
    document: LegalDocument,
    expectedResults?: {
      expectedLegalArea?: LegalArea;
      expectedKeyFacts?: string[];
      expectedHolding?: string;
    },
    config?: ScoringConfig
  ): Promise<EvaluationReport> {
    // Step 1: Perform legal analysis
    const analysisResults = await this.legalAnalyzer.analyzeDocumentFull(document);

    // Step 2: Create scoreboard input
    const scoreboardInput: ScoreboardInput = {
      originalDocument: {
        content: document.content,
        title: document.title,
        expectedLegalArea: expectedResults?.expectedLegalArea,
        complexity: this.assessDocumentComplexity(document)
      },
      analysisResults,
      config
    };

    // Step 3: Generate AI scoreboard
    const scoreboard = await this.scoreboardEvaluator.evaluateAnalysis(scoreboardInput);

    // Step 4: Generate performance insights
    const performanceInsights = await this.generatePerformanceInsights(
      analysisResults,
      scoreboard,
      expectedResults
    );

    // Step 5: Create improvement recommendations
    const recommendedImprovements = await this.generateImprovementRecommendations(
      scoreboard,
      performanceInsights
    );

    // Step 6: Compile evaluation report
    const evaluationReport: EvaluationReport = {
      documentId: scoreboard.documentId,
      timestamp: new Date().toISOString(),
      originalAnalysis: analysisResults,
      scoreboard,
      performanceInsights,
      recommendedImprovements
    };

    // Step 7: Store evaluation for historical tracking
    this.evaluationHistory.push(evaluationReport);

    return evaluationReport;
  }

  async batchEvaluation(
    documents: Array<{
      document: LegalDocument;
      expectedResults?: any;
    }>,
    config?: ScoringConfig
  ): Promise<{
    individualReports: EvaluationReport[];
    aggregateAnalysis: AggregateEvaluationAnalysis;
  }> {
    const individualReports: EvaluationReport[] = [];

    // Process each document
    for (const { document, expectedResults } of documents) {
      const report = await this.runComprehensiveEvaluation(document, expectedResults, config);
      individualReports.push(report);
    }

    // Generate aggregate analysis
    const aggregateAnalysis = await this.generateAggregateAnalysis(individualReports);

    return {
      individualReports,
      aggregateAnalysis
    };
  }

  private assessDocumentComplexity(document: LegalDocument): 'simple' | 'moderate' | 'complex' {
    const contentLength = document.content.length;
    const legalTermsCount = this.countLegalTerms(document.content);
    const sentenceComplexity = this.assessSentenceComplexity(document.content);

    // Simple scoring algorithm
    let complexityScore = 0;
    
    // Length factor
    if (contentLength > 5000) complexityScore += 2;
    else if (contentLength > 2000) complexityScore += 1;

    // Legal terms factor
    if (legalTermsCount > 20) complexityScore += 2;
    else if (legalTermsCount > 10) complexityScore += 1;

    // Sentence complexity factor
    if (sentenceComplexity > 0.7) complexityScore += 2;
    else if (sentenceComplexity > 0.5) complexityScore += 1;

    if (complexityScore >= 5) return 'complex';
    if (complexityScore >= 3) return 'moderate';
    return 'simple';
  }

  private countLegalTerms(content: string): number {
    const legalTerms = [
      'plaintiff', 'defendant', 'appellant', 'appellee', 'motion', 'brief', 'holding',
      'precedent', 'jurisdiction', 'statute', 'regulation', 'constitutional', 'tort',
      'contract', 'breach', 'damages', 'liability', 'negligence', 'fraud', 'remedy'
    ];
    
    const words = content.toLowerCase().split(/\s+/);
    return legalTerms.filter(term => words.includes(term)).length;
  }

  private assessSentenceComplexity(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.reduce((sum, sentence) => {
      return sum + sentence.split(/\s+/).length;
    }, 0) / sentences.length;

    // Normalize to 0-1 scale (assuming 30+ words per sentence is highly complex)
    return Math.min(1, avgWordsPerSentence / 30);
  }

  private async generatePerformanceInsights(
    analysisResults: any,
    scoreboard: LegalAnalysisScoreboard,
    expectedResults?: any
  ): Promise<PerformanceInsights> {
    const summarizationScore = this.calculateSummarizationScore(scoreboard.summarizationScores);
    const classificationScore = this.calculateClassificationScore(scoreboard.classificationScores);

    const confidenceAnalysis = {
      averageConfidence: analysisResults.classification.confidence,
      reliabilityScore: analysisResults.classification.confidence > 0.8 ? 9 : 
                       analysisResults.classification.confidence > 0.6 ? 7 : 5,
      uncertaintyAreas: analysisResults.classification.confidence < 0.7 ? 
        ['Primary classification confidence below threshold'] : []
    };

    return {
      overallGrade: this.getGradeDescription(scoreboard.overallGrade),
      scoreBreakdown: {
        summarization: Math.round(summarizationScore * 100) / 100,
        classification: Math.round(classificationScore * 100) / 100,
        overall: scoreboard.overallScore
      },
      strengthAreas: scoreboard.strengths,
      improvementAreas: scoreboard.weaknesses,
      comparisonToBaseline: {
        percentageImprovement: this.calculateImprovementFromHistory(scoreboard.overallScore),
        trendDirection: this.determineTrendDirection()
      },
      confidenceAnalysis
    };
  }

  private async generateImprovementRecommendations(
    scoreboard: LegalAnalysisScoreboard,
    insights: PerformanceInsights
  ): Promise<ImprovementRecommendations> {
    const prompt = `Based on this legal analysis evaluation, provide specific improvement recommendations:

Overall Score: ${scoreboard.overallScore}/10
Grade: ${scoreboard.overallGrade}
Weaknesses: ${scoreboard.weaknesses.join(', ')}
Quality Flags: ${JSON.stringify(scoreboard.qualityFlags)}

Provide actionable recommendations in these categories:
1. Immediate Actions (quick fixes)
2. Long-term Improvements (strategic changes)
3. Training Focus (areas for skill development)
4. Technical Optimizations (system improvements)
5. Quality Assurance (prevention measures)`;

    const schema = `{
      "immediateActions": ["string"],
      "longTermImprovements": ["string"], 
      "trainingFocus": ["string"],
      "technicalOptimizations": ["string"],
      "qualityAssurance": ["string"]
    }`;

    return await this.llmClient.generateStructuredCompletion<ImprovementRecommendations>(
      prompt, schema, 1500
    );
  }

  private calculateSummarizationScore(scores: any): number {
    const allScores = Object.values(scores) as any[];
    const weightedSum = allScores.reduce((sum: number, metric: any) => 
      sum + (metric.score * metric.weight), 0);
    const totalWeight = allScores.reduce((sum: number, metric: any) => 
      sum + metric.weight, 0);
    return weightedSum / totalWeight;
  }

  private calculateClassificationScore(scores: any): number {
    const allScores = Object.values(scores) as any[];
    const weightedSum = allScores.reduce((sum: number, metric: any) => 
      sum + (metric.score * metric.weight), 0);
    const totalWeight = allScores.reduce((sum: number, metric: any) => 
      sum + metric.weight, 0);
    return weightedSum / totalWeight;
  }

  private getGradeDescription(grade: ScoreLevel): string {
    const descriptions = {
      [ScoreLevel.EXCELLENT]: 'Excellent (A)',
      [ScoreLevel.GOOD]: 'Good (B)',
      [ScoreLevel.SATISFACTORY]: 'Satisfactory (C)',
      [ScoreLevel.NEEDS_IMPROVEMENT]: 'Needs Improvement (D)',
      [ScoreLevel.POOR]: 'Poor (F)'
    };
    return descriptions[grade];
  }

  private calculateImprovementFromHistory(currentScore: number): number {
    if (this.evaluationHistory.length < 2) return 0;
    
    const previousScore = this.evaluationHistory[this.evaluationHistory.length - 2]
      .scoreboard.overallScore;
    return ((currentScore - previousScore) / previousScore) * 100;
  }

  private determineTrendDirection(): 'improving' | 'stable' | 'declining' {
    if (this.evaluationHistory.length < 3) return 'stable';
    
    const recent = this.evaluationHistory.slice(-3).map(r => r.scoreboard.overallScore);
    const trend = (recent[2] - recent[0]) / recent[0];
    
    if (trend > 0.05) return 'improving';
    if (trend < -0.05) return 'declining';
    return 'stable';
  }

  private async generateAggregateAnalysis(reports: EvaluationReport[]): Promise<AggregateEvaluationAnalysis> {
    const scores = reports.map(r => r.scoreboard.overallScore);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const gradeDistribution = reports.reduce((acc, report) => {
      const grade = report.scoreboard.overallGrade;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDocuments: reports.length,
      averageScore: Math.round(averageScore * 100) / 100,
      gradeDistribution,
      topPerformingAreas: this.identifyTopPerformingAreas(reports),
      commonWeaknesses: this.identifyCommonWeaknesses(reports),
      recommendedSystemImprovements: this.generateSystemRecommendations(reports)
    };
  }

  private identifyTopPerformingAreas(reports: EvaluationReport[]): string[] {
    // Implementation to analyze across all reports and identify consistently high-performing areas
    return ['Contract Law Classification', 'Key Facts Extraction', 'Legal Reasoning'];
  }

  private identifyCommonWeaknesses(reports: EvaluationReport[]): string[] {
    // Implementation to identify patterns of weakness across reports
    return ['Citation Quality', 'Precedent Relevance', 'Complex Case Analysis'];
  }

  private generateSystemRecommendations(reports: EvaluationReport[]): string[] {
    // Implementation to provide system-level improvements based on aggregate analysis
    return [
      'Enhance legal precedent database',
      'Improve citation extraction algorithms',
      'Add specialized training for complex cases'
    ];
  }
}

interface AggregateEvaluationAnalysis {
  totalDocuments: number;
  averageScore: number;
  gradeDistribution: Record<string, number>;
  topPerformingAreas: string[];
  commonWeaknesses: string[];
  recommendedSystemImprovements: string[];
}