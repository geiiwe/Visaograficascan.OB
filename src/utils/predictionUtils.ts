
// Prediction utilities and helper functions
import { PatternResult } from "@/utils/patternDetection";
import { TimeframeType } from "@/context/AnalyzerContext";

// Re-export PatternResult type so other files can import it from here
export type { PatternResult };

export interface PredictionIndicator {
  name: string;
  signal: "buy" | "sell" | "neutral";
  strength: number;
}

export interface PredictionResult {
  entryPoint: "buy" | "sell" | "wait";
  confidence: number;
  timeframe: TimeframeType;
  expirationTime: string;
  indicators: PredictionIndicator[];
  analysisNarrative?: string; // Nova propriedade para explicação narrativa
}

export interface FibonacciLevel {
  level: number;
  price: number;
  type: "support" | "resistance";
  distance: number;
  touched: boolean;
  broken: boolean;
  strength?: number; // Optional strength property
}

// Extended PatternResult type with the additional properties we're using
export interface ExtendedPatternResult extends PatternResult {
  candleData?: {
    highLowRange?: number;
    wicksRatio?: number;
    bodyMovement?: number;
    consecutiveMoves?: number;
    reversalPatterns?: number;
  };
  wicksProportion?: number;
  reversalStrength?: number;
  noiseLevel?: number;
  fibonacciLevels?: FibonacciLevel[]; // Added missing property
}

/**
 * Generates trading indicators based on pattern analysis results.
 */
export function generateIndicators(
  results: Record<string, PatternResult>,
  marketType: string,
  noiseLevel: number,
  buyScore: number,
  sellScore: number
): PredictionIndicator[] {
  const indicators: PredictionIndicator[] = [];

  // Trendlines
  if (results.trendlines?.found) {
    const strength = results.trendlines.confidence;
    indicators.push({
      name: "Linhas de Tendência",
      signal:
        results.trendlines.buyScore > results.trendlines.sellScore
          ? "buy"
          : "sell",
      strength: strength,
    });
  }

  // Fibonacci
  if (results.fibonacci?.found) {
    const strength = results.fibonacci.confidence;
    indicators.push({
      name: "Retração de Fibonacci",
      signal:
        results.fibonacci.buyScore > results.fibonacci.sellScore ? "buy" : "sell",
      strength: strength,
    });
  }

  // Candle Patterns
  if (results.candlePatterns?.found) {
    const strength = results.candlePatterns.confidence;
    indicators.push({
      name: "Padrões de Velas",
      signal:
        results.candlePatterns.buyScore > results.candlePatterns.sellScore
          ? "buy"
          : "sell",
      strength: strength,
    });
  }

  // Elliott Waves
  if (results.elliottWaves?.found) {
    const strength = results.elliottWaves.confidence;
    indicators.push({
      name: "Ondas de Elliott",
      signal:
        results.elliottWaves.buyScore > results.elliottWaves.sellScore
          ? "buy"
          : "sell",
      strength: strength,
    });
  }

  // Dow Theory
  if (results.dowTheory?.found) {
    const strength = results.dowTheory.confidence;
    indicators.push({
      name: "Teoria de Dow",
      signal:
        results.dowTheory.buyScore > results.dowTheory.sellScore ? "buy" : "sell",
      strength: strength,
    });
  }

  // Support and Resistance
  if (results.supportResistance?.found) {
    const strength = results.supportResistance.confidence;
    indicators.push({
      name: "Suporte/Resistência",
      signal:
        results.supportResistance.buyScore > results.supportResistance.sellScore
          ? "buy"
          : "sell",
      strength: strength,
    });
  }

  // Market Condition
  const marketCondition =
    noiseLevel > 35 ? "Mercado Incerto" : "Mercado Estável";
  indicators.push({
    name: marketCondition,
    signal: "neutral",
    strength: 100 - noiseLevel,
  });

  // OTC-Specific Patterns
  if (marketType === "otc") {
    indicators.push({
      name: "Padrões OTC",
      signal: buyScore > sellScore ? "buy" : "sell",
      strength: 75,
    });
  }

  return indicators;
}

/**
 * Calculates the level of market noise based on analysis results.
 */
export function calculateMarketNoise(
  results: Record<string, PatternResult>,
  marketType: string
): number {
  let noiseLevel = 0;

  // Adjustments based on analysis types
  if (results.candlePatterns?.found) {
    noiseLevel += 15;
  }
  if (results.elliottWaves?.found) {
    noiseLevel += 10;
  }
  if (marketType === "otc") {
    noiseLevel += 20;
  }

  // Confidence adjustments
  if (results.trendlines?.found) {
    noiseLevel -= results.trendlines.confidence / 15;
  }
  if (results.fibonacci?.found) {
    noiseLevel -= results.fibonacci.confidence / 20;
  }

  // Ensure noise level is within bounds
  noiseLevel = Math.max(0, Math.min(100, noiseLevel));
  return noiseLevel;
}

// Definição do tipo para dados de volatilidade
export interface VolatilityData {
  volatilityLevel: number;       // 0-100%
  volatilityType: 'low' | 'normal' | 'high' | 'whipsaw';
  priceRange: number;            // Range de preço como % do preço médio
  wicksSize: number;             // Tamanho médio dos pavios como % do corpo
  bodyMovement: number;          // Variação dos corpos das velas em %
  consecutiveMoves: number;      // Movimentos consecutivos na mesma direção
}

/**
 * Detecta níveis e tipos de volatilidade com base nos padrões de velas
 */
export function detectCandleVolatility(results: Record<string, PatternResult>): VolatilityData {
  // Valores padrão para caso os dados não estejam disponíveis
  const defaultVolatilityData: VolatilityData = {
    volatilityLevel: 30,
    volatilityType: 'normal',
    priceRange: 0,
    wicksSize: 0,
    bodyMovement: 0,
    consecutiveMoves: 0
  };
  
  try {
    // Se não temos dados de candles ou padrões detectados, retorne volatilidade padrão
    if (!results.candlePatterns?.found) {
      return defaultVolatilityData;
    }
    
    // Extrair dados relevantes para análise de volatilidade
    let priceRange = 0;
    let wicksSize = 0;
    let bodyMovement = 0;
    let consecutiveMoves = 0;
    let whipsawDetected = false;
    
    // Analisar dados específicos de candles, se disponíveis
    const candleResult = results.candlePatterns as ExtendedPatternResult;
    if (candleResult.candleData) {
      const candles = candleResult.candleData;
      
      // Calcular range de preço (high-low)
      if (candles.highLowRange) {
        priceRange = candles.highLowRange;
      }
      
      // Analisar tamanho dos pavios (wicks)
      if (candles.wicksRatio) {
        wicksSize = candles.wicksRatio * 100; // Converter para percentual
      }
      
      // Analisar movimento dos corpos das velas
      if (candles.bodyMovement) {
        bodyMovement = candles.bodyMovement;
      }
      
      // Analisar movimentos consecutivos
      if (candles.consecutiveMoves) {
        consecutiveMoves = candles.consecutiveMoves;
      }
      
      // Detectar padrões de chicote (whipsaw)
      if (candles.reversalPatterns && candles.reversalPatterns > 1) {
        whipsawDetected = true;
      }
    }
    
    // Se não temos dados específicos, usar heurísticas baseadas em scores gerais
    if (priceRange === 0) {
      const allScore = results.all?.confidence || 0;
      // Alta confiança geralmente indica menos volatilidade
      priceRange = 100 - allScore * 0.7;
    }
    
    if (wicksSize === 0) {
      const candlePatternExtendedResult = results.candlePatterns as ExtendedPatternResult;
      if (candlePatternExtendedResult.wicksProportion) {
        wicksSize = candlePatternExtendedResult.wicksProportion * 100;
      }
    }
    
    // Calcular escore de volatilidade baseado em múltiplos fatores
    // 1. Range de preço: quanto maior, maior a volatilidade
    const priceRangeScore = Math.min(100, priceRange * 1.2);
    
    // 2. Tamanho dos pavios: pavios longos indicam volatilidade
    const wicksScore = Math.min(100, wicksSize * 1.5);
    
    // 3. Movimento dos corpos: mudanças rápidas indicam volatilidade
    const bodyScore = Math.min(100, bodyMovement * 2);
    
    // 4. Padrões de reversão frequentes são um forte indicador de volatilidade tipo chicote
    const candlePatternExtendedResult = results.candlePatterns as ExtendedPatternResult;
    const reversalScore = candlePatternExtendedResult.reversalStrength || 0;
    
    // 5. Ruído de mercado também está correlacionado com volatilidade
    const extendedAllResult = results.all as ExtendedPatternResult;
    const marketNoise = extendedAllResult?.noiseLevel || 0;
    
    // Combinar todos os fatores com pesos diferentes
    let volatilityLevel = 
      (priceRangeScore * 0.25) + 
      (wicksScore * 0.25) + 
      (bodyScore * 0.2) + 
      (reversalScore * 0.2) + 
      (marketNoise * 0.1);
    
    // Ajustar pela presença de padrões de reversão rápida (muito significativo)
    if (whipsawDetected) {
      volatilityLevel = Math.min(100, volatilityLevel * 1.3);
    }
    
    // Classificar tipo de volatilidade
    let volatilityType: 'low' | 'normal' | 'high' | 'whipsaw' = 'normal';
    if (volatilityLevel < 30) {
      volatilityType = 'low';
    } else if (volatilityLevel < 65) {
      volatilityType = 'normal';
    } else if (volatilityLevel >= 65) {
      if (whipsawDetected || reversalScore > 60 || wicksScore > 70) {
        volatilityType = 'whipsaw';
      } else {
        volatilityType = 'high';
      }
    }
    
    return {
      volatilityLevel,
      volatilityType,
      priceRange,
      wicksSize,
      bodyMovement,
      consecutiveMoves
    };
  } catch (error) {
    console.error("Erro ao analisar volatilidade:", error);
    return defaultVolatilityData;
  }
}

// Modificar função calculateExpirationTime para considerar volatilidade
export function calculateExpirationTime(
  timeframe: TimeframeType,
  marketType: string,
  noiseLevel: number,
  confidence: number,
  indicators: PredictionIndicator[],
  volatilityData?: VolatilityData // Parâmetro opcional de volatilidade
): { expiryDate: Date, timeframeSeconds: number } {
  // Base timeframe in seconds
  let timeframeSeconds = timeframe === "30s" ? 30 : 60;
  
  // Market type affects expiration
  if (marketType === "otc") {
    // OTC markets need a bit more time due to potential manipulation
    timeframeSeconds = Math.ceil(timeframeSeconds * 1.15);
  }
  
  // Adjust for market noise
  if (noiseLevel > 30) {
    // More noise = need more time
    const noiseAdjustment = (noiseLevel - 30) / 100;
    timeframeSeconds = Math.ceil(timeframeSeconds * (1 + noiseAdjustment * 0.25));
  }

  // Adjust for confidence - higher confidence may mean quicker trades
  if (confidence > 85) {
    timeframeSeconds = Math.ceil(timeframeSeconds * 0.9);
  } else if (confidence < 65) {
    timeframeSeconds = Math.ceil(timeframeSeconds * 1.1);
  }
  
  // Check for Fibonacci indicators which might suggest precise timing
  const fibonacciIndicator = indicators.find(i => i.name.includes("Fibonacci"));
  if (fibonacciIndicator && fibonacciIndicator.strength > 80) {
    timeframeSeconds = Math.ceil(timeframeSeconds * 0.95);
  }
  
  // Adjust for volatility - crucial for timing decisions
  if (volatilityData && volatilityData.volatilityLevel > 0) {
    // High volatility requires extending time to avoid false signals
    if (volatilityData.volatilityLevel > 70) {
      const volatilityExtension = (volatilityData.volatilityLevel - 70) / 30 * 0.4; 
      timeframeSeconds = Math.ceil(timeframeSeconds * (1 + volatilityExtension));
      console.log(`Tempo estendido em ${(volatilityExtension*100).toFixed(0)}% devido à alta volatilidade`);
    }
    
    // Whipsaw volatility specifically requires more time
    if (volatilityData.volatilityType === 'whipsaw') {
      timeframeSeconds = Math.ceil(timeframeSeconds * 1.25); // +25% time for whipsaws
      console.log("Tempo significativamente estendido devido a padrões de chicote");
    }
  }
  
  // Create expiry date
  const now = new Date();
  const expiryDate = new Date(now.getTime() + (timeframeSeconds * 1000));
  
  return { expiryDate, timeframeSeconds };
}

/**
 * Analyzes the quality and reliability of Fibonacci levels.
 */
export function analyzeFibonacciQuality(
  levels: FibonacciLevel[]
): number {
  let qualityScore = 70; // Base score

  // Award points for confluence
  const supportLevels = levels.filter((l) => l.type === "support");
  const resistanceLevels = levels.filter((l) => l.type === "resistance");

  if (supportLevels.length > 2) {
    qualityScore += 10;
  }
  if (resistanceLevels.length > 2) {
    qualityScore += 10;
  }

  // Deduct points for excessive touching or breaking
  const supportTouched = levels.filter((l) => l.type === "support" && l.touched)
    .length;
  const resistanceTouched = levels.filter(
    (l) => l.type === "resistance" && l.touched
  ).length;
  const supportBroken = levels.filter((l) => l.type === "support" && l.broken)
    .length;
  const resistanceBroken = levels.filter(
    (l) => l.type === "resistance" && l.broken
  ).length;

  qualityScore -= supportTouched * 2;
  qualityScore -= resistanceTouched * 2;
  qualityScore -= supportBroken * 5;
  qualityScore -= resistanceBroken * 5;

  // Normalize score
  qualityScore = Math.max(10, Math.min(100, qualityScore));
  return qualityScore;
}
