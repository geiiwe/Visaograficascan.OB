/**
 * Análise Completa da Imagem
 * Sistema abrangente que inclui todos os elementos de análise técnica
 */

import { performComprehensiveScan } from './comprehensiveScanner';
import { performDetailedCandleAnalysis } from './candleByCandle/detailedCandleAnalysis';
import { performEnhancedVisualAnalysis } from './enhancedVisualAnalysis';

export interface CompleteImageAnalysisResult {
  // Análise de Tendência Completa
  trendAnalysis: {
    direction: "uptrend" | "downtrend" | "sideways" | "unknown";
    strength: number; // 0-100
    probability: number; // 0-100
    duration: "short" | "medium" | "long";
    momentum: number;
    volatility: number;
    reliability: number;
  };

  // Análise de Suporte e Resistência
  supportResistanceAnalysis: {
    supports: Array<{
      level: number;
      strength: number;
      tests: number;
      reliability: number;
      distance: number; // distância do preço atual
      type: "major" | "minor" | "dynamic";
    }>;
    resistances: Array<{
      level: number;
      strength: number;
      tests: number;
      reliability: number;
      distance: number;
      type: "major" | "minor" | "dynamic";
    }>;
    keyLevels: Array<{
      level: number;
      type: "pivot" | "fibonacci" | "psychological";
      importance: number;
    }>;
  };

  // Análise Detalhada de Velas
  candleAnalysis: {
    currentCandle: {
      type: string;
      significance: number;
      body: "large" | "medium" | "small" | "doji";
      shadows: {
        upper: "long" | "medium" | "short" | "none";
        lower: "long" | "medium" | "short" | "none";
      };
      interpretation: string;
    };
    recentCandles: Array<{
      index: number;
      type: string;
      pattern: string;
      significance: number;
    }>;
    patterns: Array<{
      name: string;
      candles: number;
      reliability: number;
      signal: "bullish" | "bearish" | "neutral";
    }>;
  };

  // Análise de Pavios (Sombras)
  shadowAnalysis: {
    upperShadows: {
      average: number;
      significance: "high" | "medium" | "low";
      interpretation: string;
    };
    lowerShadows: {
      average: number;
      significance: "high" | "medium" | "low";
      interpretation: string;
    };
    rejectionPoints: Array<{
      level: number;
      type: "upper" | "lower";
      strength: number;
    }>;
  };

  // Análise de Região
  regionAnalysis: {
    chartQuality: number;
    clarity: number;
    timeframe: string;
    marketType: string;
    liquidityLevel: "high" | "medium" | "low";
    volatilityZone: "consolidation" | "expansion" | "extreme";
    pricePosition: "top" | "middle" | "bottom" | "breakout";
  };

  // Figuras Gráficas Identificadas
  chartPatterns: {
    classic: Array<{
      name: string;
      type: "reversal" | "continuation" | "bilateral";
      completion: number; // 0-100
      reliability: number;
      target: number;
      timeframe: string;
      description: string;
    }>;
    harmonic: Array<{
      name: string;
      accuracy: number;
      completion: number;
      projectedTarget: number;
      invalidationLevel: number;
    }>;
    custom: Array<{
      description: string;
      significance: number;
      implications: string;
    }>;
  };

  // Probabilidades de Movimento
  movementProbabilities: {
    upward: {
      probability: number; // 0-100
      factors: string[];
      targets: number[];
      timeframe: string;
    };
    downward: {
      probability: number; // 0-100
      factors: string[];
      targets: number[];
      timeframe: string;
    };
    sideways: {
      probability: number; // 0-100
      range: { upper: number; lower: number };
      duration: string;
    };
  };

  // Confluências e Fatores
  confluenceAnalysis: {
    bullishFactors: Array<{
      factor: string;
      weight: number;
      description: string;
      timeframe: string;
    }>;
    bearishFactors: Array<{
      factor: string;
      weight: number;
      description: string;
      timeframe: string;
    }>;
    neutralFactors: Array<{
      factor: string;
      impact: string;
    }>;
    overallBias: "bullish" | "bearish" | "neutral";
    confidence: number;
  };

  // Recomendação Final Organizada
  finalRecommendation: {
    action: "BUY" | "SELL" | "WAIT";
    confidence: number;
    reasoning: string;
    entry: {
      price: number;
      conditions: string[];
    };
    exits: {
      stopLoss: number;
      takeProfit1: number;
      takeProfit2?: number;
      takeProfit3?: number;
    };
    riskManagement: {
      positionSize: number;
      riskReward: number;
      maxRisk: number;
    };
    timing: {
      immediate: boolean;
      optimal: boolean;
      validity: number; // minutos
    };
  };

  // Metadata da Análise
  analysisMetadata: {
    timestamp: string;
    duration: number; // ms
    elementsAnalyzed: number;
    confidenceLevel: number;
    analysisVersion: string;
  };
}

export const performCompleteImageAnalysis = async (
  imageData: string,
  options: {
    precision: "baixa" | "normal" | "alta";
    timeframe: string;
    marketType: string;
    region?: { x: number; y: number; width: number; height: number };
  }
): Promise<CompleteImageAnalysisResult> => {
  console.log("🚀 Iniciando Análise Completa da Imagem...");
  const startTime = Date.now();

  try {
    // 1. Executar todas as análises em paralelo para melhor performance
    const [comprehensiveScan, candleAnalysis, enhancedVisual] = await Promise.all([
      performComprehensiveScan(imageData, options.region || null, options),
      performDetailedCandleAnalysis(imageData, options.timeframe),
      performEnhancedVisualAnalysis(imageData, options)
    ]);

    // 2. Análise de Tendência Detalhada
    const trendAnalysis = analyzeTrendComplete(comprehensiveScan, enhancedVisual);

    // 3. Análise de Suporte e Resistência Detalhada
    const supportResistanceAnalysis = analyzeSupportResistanceComplete(comprehensiveScan);

    // 4. Análise Detalhada de Velas e Pavios
    const candleAnalysisComplete = processCandleAnalysisComplete(candleAnalysis, comprehensiveScan);
    const shadowAnalysis = analyzeShadowsComplete(candleAnalysis);

    // 5. Análise de Região Completa
    const regionAnalysis = analyzeRegionComplete(comprehensiveScan, options);

    // 6. Identificação de Figuras Gráficas
    const chartPatterns = identifyChartPatternsComplete(comprehensiveScan, enhancedVisual);

    // 7. Cálculo de Probabilidades
    const movementProbabilities = calculateMovementProbabilities(
      trendAnalysis,
      supportResistanceAnalysis,
      comprehensiveScan.confluences
    );

    // 8. Análise de Confluências Expandida
    const confluenceAnalysis = analyzeConfluencesComplete(comprehensiveScan, enhancedVisual);

    // 9. Recomendação Final Organizada
    const finalRecommendation = generateFinalRecommendationComplete(
      trendAnalysis,
      confluenceAnalysis,
      movementProbabilities,
      comprehensiveScan.recommendation,
      options
    );

    const duration = Date.now() - startTime;
    const elementsAnalyzed = 
      comprehensiveScan.identifiedElements.candles.length +
      comprehensiveScan.identifiedElements.patterns.length +
      comprehensiveScan.identifiedElements.levels.length +
      (candleAnalysis.candleAnalysis?.length || 0);

    console.log(`✅ Análise Completa Finalizada em ${duration}ms`);
    console.log(`📊 ${elementsAnalyzed} elementos analisados`);
    console.log(`🎯 Recomendação: ${finalRecommendation.action} (${finalRecommendation.confidence}%)`);

    return {
      trendAnalysis,
      supportResistanceAnalysis,
      candleAnalysis: candleAnalysisComplete,
      shadowAnalysis,
      regionAnalysis,
      chartPatterns,
      movementProbabilities,
      confluenceAnalysis,
      finalRecommendation,
      analysisMetadata: {
        timestamp: new Date().toISOString(),
        duration,
        elementsAnalyzed,
        confidenceLevel: finalRecommendation.confidence,
        analysisVersion: "2.0.0"
      }
    };

  } catch (error) {
    console.error("Erro na análise completa:", error);
    throw new Error("Falha ao executar análise completa da imagem");
  }
};

// Funções auxiliares para análises específicas

const analyzeTrendComplete = (scan: any, visual: any) => {
  const trendStrength = calculateTrendStrength(scan.regionAnalysis.marketStructure, scan.confluences);
  
  return {
    direction: visual.visualAnalysis.trendDirection || "unknown",
    strength: trendStrength,
    probability: calculateTrendProbability(scan.confluences, trendStrength),
    duration: determineTrendDuration(scan.regionAnalysis.timeframe),
    momentum: visual.visualAnalysis.priceAction?.momentum || 0,
    volatility: visual.visualAnalysis.priceAction?.volatility || 0,
    reliability: Math.min(95, trendStrength + visual.visualAnalysis.chartQuality / 4)
  };
};

const analyzeSupportResistanceComplete = (scan: any) => {
  const supports = scan.identifiedElements.levels
    .filter((l: any) => l.type === "support")
    .map((l: any) => ({
      level: l.price,
      strength: l.strength,
      tests: l.tests,
      reliability: calculateLevelReliability(l),
      distance: Math.abs(100 - l.price), // Simulated current price
      type: l.strength > 80 ? "major" : l.strength > 60 ? "minor" : "dynamic"
    }));

  const resistances = scan.identifiedElements.levels
    .filter((l: any) => l.type === "resistance")
    .map((l: any) => ({
      level: l.price,
      strength: l.strength,
      tests: l.tests,
      reliability: calculateLevelReliability(l),
      distance: Math.abs(100 - l.price),
      type: l.strength > 80 ? "major" : l.strength > 60 ? "minor" : "dynamic"
    }));

  const keyLevels = scan.identifiedElements.levels
    .filter((l: any) => l.type === "pivot")
    .map((l: any) => ({
      level: l.price,
      type: "pivot" as const,
      importance: l.strength
    }));

  return {
    supports,
    resistances,
    keyLevels
  };
};

const processCandleAnalysisComplete = (candleAnalysis: any, scan: any) => {
  // Assumindo que temos dados de velas da análise
  const currentCandle = candleAnalysis.candleAnalysis?.[0] || {};
  
  return {
    currentCandle: {
      type: currentCandle.candleType || "unknown",
      significance: currentCandle.significance || 50,
      body: currentCandle.bodySize || "medium",
      shadows: {
        upper: determineShadowSizeFromRatio(currentCandle.shadowRatio?.upperShadow),
        lower: determineShadowSizeFromRatio(currentCandle.shadowRatio?.lowerShadow)
      },
      interpretation: generateCandleInterpretation(currentCandle)
    },
    recentCandles: (candleAnalysis.candleAnalysis || []).slice(0, 5).map((c: any, i: number) => ({
      index: i,
      type: c.candleType || "unknown",
      pattern: c.candleType || "unknown",
      significance: c.significance || 50
    })),
    patterns: (candleAnalysis.candleAnalysis || []).map((p: any) => ({
      name: p.candleType || "unknown",
      candles: 1,
      reliability: p.significance || 50,
      signal: p.priceAction?.isHigherHigh ? "bullish" : p.priceAction?.isLowerLow ? "bearish" : "neutral"
    }))
  };
};

const analyzeShadowsComplete = (candleAnalysis: any) => {
  // Análise simulada de pavios
  return {
    upperShadows: {
      average: 15,
      significance: "medium" as const,
      interpretation: "Pressão vendedora moderada nos topos"
    },
    lowerShadows: {
      average: 12,
      significance: "medium" as const,
      interpretation: "Suporte presente nos fundos"
    },
    rejectionPoints: [
      { level: 102, type: "upper" as const, strength: 75 },
      { level: 98, type: "lower" as const, strength: 80 }
    ]
  };
};

const analyzeRegionComplete = (scan: any, options: any) => {
  return {
    chartQuality: scan.regionAnalysis.quality,
    clarity: scan.regionAnalysis.clarity,
    timeframe: options.timeframe,
    marketType: options.marketType,
    liquidityLevel: "medium" as const,
    volatilityZone: "consolidation" as const,
    pricePosition: "middle" as const
  };
};

const identifyChartPatternsComplete = (scan: any, visual: any) => {
  return {
    classic: scan.identifiedElements.patterns.map((p: any) => ({
      name: p.name,
      type: p.type,
      completion: p.completion,
      reliability: p.confidence,
      target: p.target,
      timeframe: "current",
      description: `Padrão ${p.name} identificado com ${p.confidence}% de confiança`
    })),
    harmonic: [],
    custom: []
  };
};

const calculateMovementProbabilities = (trend: any, sr: any, confluences: any) => {
  const bullishWeight = confluences.totalBullishWeight || 0;
  const bearishWeight = confluences.totalBearishWeight || 0;
  const total = bullishWeight + bearishWeight || 1;

  return {
    upward: {
      probability: Math.round((bullishWeight / total) * 100),
      factors: ["Suporte forte", "Padrões de alta", "Momentum positivo"],
      targets: [102, 105, 108],
      timeframe: "1-3 horas"
    },
    downward: {
      probability: Math.round((bearishWeight / total) * 100),
      factors: ["Resistência forte", "Padrões de baixa", "Pressão vendedora"],
      targets: [98, 95, 92],
      timeframe: "1-3 horas"
    },
    sideways: {
      probability: Math.max(10, 100 - Math.round((bullishWeight / total) * 100) - Math.round((bearishWeight / total) * 100)),
      range: { upper: 102, lower: 98 },
      duration: "2-4 horas"
    }
  };
};

const analyzeConfluencesComplete = (scan: any, visual: any) => {
  const overallBias = scan.confluences.totalBullishWeight > scan.confluences.totalBearishWeight ? "bullish" : 
                    scan.confluences.totalBearishWeight > scan.confluences.totalBullishWeight ? "bearish" : "neutral";
  
  return {
    bullishFactors: scan.confluences.bullish.map((factor: any) => ({
      ...factor,
      timeframe: "current"
    })),
    bearishFactors: scan.confluences.bearish.map((factor: any) => ({
      ...factor,
      timeframe: "current"
    })),
    neutralFactors: [
      { factor: "Volume médio", impact: "Sem impacto significativo no momento" }
    ],
    overallBias: overallBias as "bullish" | "bearish" | "neutral",
    confidence: visual.recommendation.confidence
  };
};

const generateFinalRecommendationComplete = (
  trend: any,
  confluence: any,
  probabilities: any,
  scanRec: any,
  options: any
) => {
  return {
    action: scanRec.action,
    confidence: scanRec.confidence,
    reasoning: scanRec.reasoning,
    entry: {
      price: scanRec.entryPrice,
      conditions: ["Confirmação de volume", "Break acima de resistência"]
    },
    exits: {
      stopLoss: scanRec.stopLoss,
      takeProfit1: scanRec.takeProfit,
      takeProfit2: scanRec.takeProfit * 1.02,
      takeProfit3: scanRec.takeProfit * 1.04
    },
    riskManagement: {
      positionSize: scanRec.positionSize,
      riskReward: Math.abs((scanRec.takeProfit - scanRec.entryPrice) / (scanRec.entryPrice - scanRec.stopLoss)),
      maxRisk: 2
    },
    timing: {
      immediate: scanRec.confidence > 80,
      optimal: scanRec.confidence > 70,
      validity: scanRec.timeValidity / 60 // converter para minutos
    }
  };
};

// Funções utilitárias
const calculateTrendStrength = (marketStructure: string, confluences: any): number => {
  const base = marketStructure === "trending" ? 70 : 40;
  const confluenceBonus = Math.abs(confluences.totalBullishWeight - confluences.totalBearishWeight) * 2;
  return Math.min(95, base + confluenceBonus);
};

const calculateTrendProbability = (confluences: any, strength: number): number => {
  return Math.min(95, strength + (confluences.totalBullishWeight + confluences.totalBearishWeight));
};

const determineTrendDuration = (timeframe: string): "short" | "medium" | "long" => {
  if (timeframe === "30s" || timeframe === "1m") return "short";
  if (timeframe === "5m" || timeframe === "15m") return "medium";
  return "long";
};

const calculateLevelReliability = (level: any): number => {
  return Math.min(95, level.strength + (level.tests * 5));
};

const determineCandleBodySize = (candle: any): "large" | "medium" | "small" | "doji" => {
  if (!candle.bodySize) return "medium";
  if (candle.bodySize < 0.1) return "doji";
  if (candle.bodySize < 0.3) return "small";
  if (candle.bodySize < 0.7) return "medium";
  return "large";
};

const determineShadowSize = (candle: any, type: "upper" | "lower"): "long" | "medium" | "short" | "none" => {
  const shadowSize = type === "upper" ? candle.upperShadow : candle.lowerShadow;
  if (!shadowSize || shadowSize < 0.1) return "none";
  if (shadowSize < 0.3) return "short";
  if (shadowSize < 0.6) return "medium";
  return "long";
};

const determineShadowSizeFromRatio = (ratio: number | undefined): "long" | "medium" | "short" | "none" => {
  if (!ratio || ratio < 0.1) return "none";
  if (ratio < 0.3) return "short";
  if (ratio < 0.6) return "medium";
  return "long";
};

const generateCandleInterpretation = (candle: any): string => {
  if (!candle.candleType) return "Vela neutra sem padrão específico";
  return `Padrão ${candle.candleType} detectado`;
};