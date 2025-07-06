
import { detectPatterns } from '@/utils/patternDetection';
import type { AnalysisType, PrecisionLevel } from '@/context/AnalyzerContext';

export interface PatternDetectionResult {
  patterns: string[];
  confidence: number;
  buyScore: number;
  sellScore: number;
  signal: 'BUY' | 'SELL' | 'WAIT';
  reasoning: string;
  rawResults: any;
}

export interface DetectionOptions {
  precision: PrecisionLevel;
  analysisTypes: AnalysisType[];
  marketType: string;
  timeframe: string;
}

export class PatternDetectionService {
  static async analyzeImage(
    imageData: string,
    options: DetectionOptions
  ): Promise<PatternDetectionResult> {
    try {
      // Executar análise usando sistema existente
      const results = await detectPatterns(
        imageData,
        options.analysisTypes,
        options.precision,
        {
          timeframe: options.timeframe,
          marketType: options.marketType
        }
      );

      // Processar resultados de forma unificada
      const patterns = Object.keys(results).filter(key => results[key]?.found);
      
      // Calcular scores de compra/venda
      const buyScore = patterns.reduce((sum, pattern) => {
        return sum + (results[pattern]?.buyScore || 0);
      }, 0);
      
      const sellScore = patterns.reduce((sum, pattern) => {
        return sum + (results[pattern]?.sellScore || 0);
      }, 0);
      
      // Determinar sinal baseado nos scores
      const signal = this.calculateSignal(buyScore, sellScore);
      const confidence = this.calculateConfidence(buyScore, sellScore, patterns.length);
      const reasoning = this.generateReasoning(signal, patterns, buyScore, sellScore);

      return {
        patterns,
        confidence,
        buyScore,
        sellScore,
        signal,
        reasoning,
        rawResults: results
      };
    } catch (error) {
      console.error('Erro na análise de padrões:', error);
      throw error;
    }
  }

  private static calculateSignal(buyScore: number, sellScore: number): 'BUY' | 'SELL' | 'WAIT' {
    const totalScore = buyScore + sellScore;
    
    if (totalScore === 0) return 'WAIT';
    
    if (buyScore > sellScore * 1.3) {
      return 'BUY';
    } else if (sellScore > buyScore * 1.3) {
      return 'SELL';
    } else {
      return 'WAIT';
    }
  }

  private static calculateConfidence(buyScore: number, sellScore: number, patternCount: number): number {
    const totalScore = buyScore + sellScore;
    
    if (totalScore === 0) return 50;
    
    const dominantScore = Math.max(buyScore, sellScore);
    let confidence = Math.min(95, Math.round((dominantScore / totalScore) * 100));
    
    // Ajustar confiança por número de padrões
    if (patternCount >= 3) confidence += 10;
    if (patternCount >= 5) confidence += 5;
    
    return Math.min(98, confidence);
  }

  private static generateReasoning(
    signal: 'BUY' | 'SELL' | 'WAIT',
    patterns: string[],
    buyScore: number,
    sellScore: number
  ): string {
    if (patterns.length === 0) {
      return 'Nenhum padrão significativo identificado';
    }

    switch (signal) {
      case 'BUY':
        return `Confluência de padrões bullish: ${patterns.join(', ')}`;
      case 'SELL':
        return `Confluência de padrões bearish: ${patterns.join(', ')}`;
      case 'WAIT':
        return `Sinais conflitantes detectados: ${patterns.join(', ')}. Aguardar confirmação.`;
      default:
        return 'Análise inconclusiva';
    }
  }
}
