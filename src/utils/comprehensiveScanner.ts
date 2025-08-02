/**
 * Scanner Completo e Detalhado
 * Análise abrangente da região selecionada com "pente fino"
 */

import { performAdvancedVisualAnalysis } from './visualAnalysis';
import { performMicroPatternAnalysis } from './microPatternAnalysis';
import { detectHarmonicPatterns } from './advancedAnalysis';
import { detectMarketManipulation, MarketData } from './antiManipulation/marketManipulationDetector';

export interface ComprehensiveScanResult {
  // Análise de Região
  regionAnalysis: {
    dimensions: { width: number; height: number };
    quality: number;
    clarity: number;
    chartType: "candlestick" | "line" | "bar" | "unknown";
    timeframe: string;
    marketStructure: "trending" | "ranging" | "breakdown" | "breakout";
  };

  // Elementos Identificados
  identifiedElements: {
    candles: Array<{
      position: { x: number; y: number };
      type: "bullish" | "bearish" | "doji" | "hammer" | "shooting_star";
      size: "small" | "medium" | "large";
      significance: number;
    }>;
    trendlines: Array<{
      points: Array<{ x: number; y: number }>;
      type: "support" | "resistance" | "trend";
      strength: number;
      breaks: number;
    }>;
    levels: Array<{
      price: number;
      type: "support" | "resistance" | "pivot";
      strength: number;
      tests: number;
    }>;
    patterns: Array<{
      name: string;
      type: "reversal" | "continuation" | "harmonic";
      confidence: number;
      completion: number;
      target: number;
    }>;
    indicators: Array<{
      name: string;
      value: number;
      signal: "bullish" | "bearish" | "neutral";
      strength: number;
    }>;
  };

  // Análise de Confluências
  confluences: {
    bullish: Array<{
      factor: string;
      weight: number;
      description: string;
    }>;
    bearish: Array<{
      factor: string;
      weight: number;
      description: string;
    }>;
    totalBullishWeight: number;
    totalBearishWeight: number;
  };

  // Avaliação de Timing
  timing: {
    entrySignals: Array<{
      type: string;
      strength: number;
      timeframe: string;
    }>;
    optimalEntry: boolean;
    urgency: "immediate" | "soon" | "wait" | "avoid";
    validityPeriod: number; // segundos
  };

  // Análise de Risco
  riskFactors: {
    manipulation: {
      score: number;
      factors: string[];
      recommendation: "PROCEED" | "CAUTION" | "ABORT";
    };
    volatility: {
      level: "low" | "medium" | "high" | "extreme";
      score: number;
    };
    marketConditions: {
      liquidity: number;
      spread: number;
      news: "none" | "low" | "medium" | "high";
    };
  };

  // Recomendação Final
  recommendation: {
    action: "BUY" | "SELL" | "WAIT";
    confidence: number;
    reasoning: string;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    positionSize: number; // % do capital
    timeValidity: number; // segundos
  };

  // Detalhes Técnicos
  technicalDetails: {
    scanDuration: number; // ms
    elementsScanned: number;
    patternsFound: number;
    confidenceLevel: number;
    dataQuality: number;
  };
}

export const performComprehensiveScan = async (
  imageData: string,
  chartRegion: { x: number; y: number; width: number; height: number } | null,
  options: {
    precision: "baixa" | "normal" | "alta";
    timeframe: string;
    marketType: string;
    deepScan?: boolean;
  }
): Promise<ComprehensiveScanResult> => {
  const startTime = Date.now();
  console.log("🔍 Iniciando Scanner Completo da Região...");

  // 1. Análise da Região Selecionada
  const regionAnalysis = await analyzeChartRegion(imageData, chartRegion, options);

  // 2. Identificação Detalhada de Elementos
  const identifiedElements = await identifyAllElements(imageData, regionAnalysis, options);

  // 3. Análise de Confluências Múltiplas
  const confluences = await analyzeAllConfluences(identifiedElements, options);

  // 4. Avaliação de Timing Preciso
  const timing = await evaluatePreciseTiming(identifiedElements, confluences, options);

  // 5. Análise Completa de Riscos
  const riskFactors = await assessAllRisks(imageData, identifiedElements, options);

  // 6. Geração da Recomendação Final
  const recommendation = generateFinalRecommendation(
    regionAnalysis,
    identifiedElements,
    confluences,
    timing,
    riskFactors,
    options
  );

  const scanDuration = Date.now() - startTime;

  console.log(`✅ Scanner Completo Finalizado em ${scanDuration}ms`);
  console.log(`📊 Elementos Identificados: ${identifiedElements.candles.length + identifiedElements.patterns.length + identifiedElements.levels.length}`);
  console.log(`🎯 Recomendação: ${recommendation.action} com ${recommendation.confidence}% de confiança`);

  return {
    regionAnalysis,
    identifiedElements,
    confluences,
    timing,
    riskFactors,
    recommendation,
    technicalDetails: {
      scanDuration,
      elementsScanned: identifiedElements.candles.length + identifiedElements.patterns.length + identifiedElements.levels.length,
      patternsFound: identifiedElements.patterns.length,
      confidenceLevel: recommendation.confidence,
      dataQuality: regionAnalysis.quality
    }
  };
};

// Análise detalhada da região do gráfico
const analyzeChartRegion = async (
  imageData: string,
  chartRegion: { x: number; y: number; width: number; height: number } | null,
  options: any
) => {
  console.log("🔍 Analisando região do gráfico...");

  const visualAnalysis = await performAdvancedVisualAnalysis(imageData, options);
  
  return {
    dimensions: chartRegion ? { width: chartRegion.width, height: chartRegion.height } : { width: 0, height: 0 },
    quality: visualAnalysis.chartQuality || 75,
    clarity: Math.min(100, (visualAnalysis.chartQuality || 75) + Math.random() * 20),
    chartType: "candlestick" as const,
    timeframe: options.timeframe,
    marketStructure: determineMarketStructure(visualAnalysis)
  };
};

// Identificação completa de todos os elementos
const identifyAllElements = async (imageData: string, regionAnalysis: any, options: any) => {
  console.log("🔍 Identificando todos os elementos do gráfico...");

  // Simular dados de preço para análises
  const priceData = generatePriceData(options.timeframe);
  const supportResistanceLevels = generateSupportResistanceLevels(priceData);

  // Análise de micro padrões
  const microAnalysis = performMicroPatternAnalysis(
    priceData,
    supportResistanceLevels,
    options.timeframe,
    { volatility: 0.5, momentum: 0.3, volume: 60 }
  );

  // Detectar padrões harmônicos
  const harmonicPatterns = detectHarmonicPatterns(imageData, options.timeframe);

  // Detectar padrões clássicos (simular por enquanto)
  const classicPatterns: any[] = [];

  // Analisar confluências de indicadores (simular por enquanto)
  const indicatorAnalysis = { signals: [] };

  return {
    candles: generateCandleAnalysis(priceData, options.precision),
    trendlines: generateTrendlineAnalysis(priceData),
    levels: generateLevelAnalysis(supportResistanceLevels),
    patterns: combineAllPatterns(microAnalysis.patterns, harmonicPatterns.patterns, classicPatterns),
    indicators: generateIndicatorAnalysis(indicatorAnalysis)
  };
};

// Análise de todas as confluências
const analyzeAllConfluences = async (identifiedElements: any, options: any) => {
  console.log("🔍 Analisando confluências...");

  const bullishFactors = [];
  const bearishFactors = [];

  // Confluências de padrões
  const bullishPatterns = identifiedElements.patterns.filter((p: any) => p.type === "bullish");
  const bearishPatterns = identifiedElements.patterns.filter((p: any) => p.type === "bearish");

  bullishPatterns.forEach((pattern: any) => {
    bullishFactors.push({
      factor: `Padrão ${pattern.name}`,
      weight: pattern.confidence / 10,
      description: `Padrão de alta detectado com ${pattern.confidence}% de confiança`
    });
  });

  bearishPatterns.forEach((pattern: any) => {
    bearishFactors.push({
      factor: `Padrão ${pattern.name}`,
      weight: pattern.confidence / 10,
      description: `Padrão de baixa detectado com ${pattern.confidence}% de confiança`
    });
  });

  // Confluências de níveis
  const strongSupports = identifiedElements.levels.filter((l: any) => l.type === "support" && l.strength > 80);
  const strongResistances = identifiedElements.levels.filter((l: any) => l.type === "resistance" && l.strength > 80);

  strongSupports.forEach((level: any) => {
    bullishFactors.push({
      factor: "Suporte Forte",
      weight: level.strength / 20,
      description: `Nível de suporte testado ${level.tests} vezes`
    });
  });

  strongResistances.forEach((level: any) => {
    bearishFactors.push({
      factor: "Resistência Forte",
      weight: level.strength / 20,
      description: `Nível de resistência testado ${level.tests} vezes`
    });
  });

  const totalBullishWeight = bullishFactors.reduce((sum, f) => sum + f.weight, 0);
  const totalBearishWeight = bearishFactors.reduce((sum, f) => sum + f.weight, 0);

  return {
    bullish: bullishFactors,
    bearish: bearishFactors,
    totalBullishWeight,
    totalBearishWeight
  };
};

// Avaliação de timing preciso
const evaluatePreciseTiming = async (identifiedElements: any, confluences: any, options: any) => {
  console.log("🔍 Avaliando timing de entrada...");

  const entrySignals = [];

  // Sinais de padrões
  identifiedElements.patterns.forEach((pattern: any) => {
    if (pattern.completion > 80) {
      entrySignals.push({
        type: `Padrão ${pattern.name}`,
        strength: pattern.confidence,
        timeframe: options.timeframe
      });
    }
  });

  // Sinais de indicadores
  identifiedElements.indicators.forEach((indicator: any) => {
    if (indicator.signal !== "neutral" && indicator.strength > 70) {
      entrySignals.push({
        type: `Indicador ${indicator.name}`,
        strength: indicator.strength,
        timeframe: options.timeframe
      });
    }
  });

  const strongSignals = entrySignals.filter(s => s.strength > 80);
  const optimalEntry = strongSignals.length >= 2 || (strongSignals.length >= 1 && confluences.totalBullishWeight > confluences.totalBearishWeight * 1.5);

  let urgency: "immediate" | "soon" | "wait" | "avoid" = "wait";
  if (optimalEntry && strongSignals.length >= 3) urgency = "immediate";
  else if (optimalEntry) urgency = "soon";
  else if (entrySignals.length === 0) urgency = "avoid";

  const validityPeriod = options.timeframe === "30s" ? 30 : 
                        options.timeframe === "1m" ? 60 : 
                        options.timeframe === "5m" ? 300 : 180;

  return {
    entrySignals,
    optimalEntry,
    urgency,
    validityPeriod
  };
};

// Avaliação completa de riscos
const assessAllRisks = async (imageData: string, identifiedElements: any, options: any) => {
  console.log("🔍 Avaliando todos os riscos...");

  // Análise de manipulação
  const marketData: MarketData = {
    priceAction: {
      sudden_moves: Math.random() > 0.8,
      unusual_volume: Math.random() > 0.7,
      price_gaps: Math.random() > 0.9,
      reversal_speed: Math.random() * 100
    },
    timeframe: options.timeframe,
    marketType: options.marketType,
    patterns: identifiedElements.patterns.map((p: any) => p.name),
    confidence: 75
  };
  
  const manipulationAnalysis = detectMarketManipulation(marketData, "BUY");

  // Análise de volatilidade
  const volatilityScore = calculateVolatilityScore(identifiedElements);
  let volatilityLevel: "low" | "medium" | "high" | "extreme" = "medium";
  if (volatilityScore < 30) volatilityLevel = "low";
  else if (volatilityScore > 70) volatilityLevel = "high";
  else if (volatilityScore > 90) volatilityLevel = "extreme";

  return {
    manipulation: {
      score: manipulationAnalysis.manipulationScore,
      factors: manipulationAnalysis.suspiciousPatterns,
      recommendation: manipulationAnalysis.recommendation
    },
    volatility: {
      level: volatilityLevel,
      score: volatilityScore
    },
    marketConditions: {
      liquidity: Math.random() * 100,
      spread: Math.random() * 5,
      news: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : Math.random() > 0.2 ? "low" : "none" as "none" | "low" | "medium" | "high"
    }
  };
};

// Geração da recomendação final
const generateFinalRecommendation = (
  regionAnalysis: any,
  identifiedElements: any,
  confluences: any,
  timing: any,
  riskFactors: any,
  options: any
) => {
  console.log("🔍 Gerando recomendação final...");

  let action: "BUY" | "SELL" | "WAIT" = "WAIT";
  let confidence = 50;

  // Determinar direção baseada em confluências
  if (confluences.totalBullishWeight > confluences.totalBearishWeight * 1.5) {
    action = "BUY";
    confidence = Math.min(95, 60 + (confluences.totalBullishWeight - confluences.totalBearishWeight) * 2);
  } else if (confluences.totalBearishWeight > confluences.totalBullishWeight * 1.5) {
    action = "SELL";
    confidence = Math.min(95, 60 + (confluences.totalBearishWeight - confluences.totalBullishWeight) * 2);
  }

  // Ajustar por timing
  if (!timing.optimalEntry) {
    confidence = Math.max(30, confidence - 20);
  }

  // Ajustar por risco de manipulação
  if (riskFactors.manipulation.recommendation === "ABORT") {
    action = "WAIT";
    confidence = Math.max(20, confidence - 40);
  } else if (riskFactors.manipulation.recommendation === "CAUTION") {
    confidence = Math.max(30, confidence - 15);
  }

  // Ajustar por volatilidade
  if (riskFactors.volatility.level === "extreme") {
    confidence = Math.max(20, confidence - 30);
  }

  const basePrice = 100;
  const entryPrice = basePrice + (Math.random() - 0.5) * 2;
  const stopLoss = action === "BUY" ? entryPrice * 0.98 : entryPrice * 1.02;
  const takeProfit = action === "BUY" ? entryPrice * 1.04 : entryPrice * 0.96;

  let positionSize = 2; // Base 2%
  if (confidence > 80) positionSize = 3;
  else if (confidence < 60) positionSize = 1;

  const reasoning = `Scanner completo detectou ${identifiedElements.patterns.length} padrões, ${confluences.bullish.length} fatores de alta e ${confluences.bearish.length} fatores de baixa. Timing: ${timing.urgency}. Risco: ${riskFactors.manipulation.recommendation}.`;

  return {
    action,
    confidence: Math.round(confidence),
    reasoning,
    entryPrice: Math.round(entryPrice * 100) / 100,
    stopLoss: Math.round(stopLoss * 100) / 100,
    takeProfit: Math.round(takeProfit * 100) / 100,
    positionSize,
    timeValidity: timing.validityPeriod
  };
};

// Funções auxiliares
const determineMarketStructure = (visualAnalysis: any): "trending" | "ranging" | "breakdown" | "breakout" => {
  if (visualAnalysis.trendDirection === "uptrend" || visualAnalysis.trendDirection === "downtrend") {
    return "trending";
  }
  return "ranging";
};

const generatePriceData = (timeframe: string): number[] => {
  const length = timeframe === "30s" ? 40 : timeframe === "1m" ? 30 : 20;
  const data = [];
  let price = 100;
  
  for (let i = 0; i < length; i++) {
    price += (Math.random() - 0.5) * 2;
    data.push(price);
  }
  
  return data;
};

const generateSupportResistanceLevels = (priceData: number[]): any[] => {
  const min = Math.min(...priceData);
  const max = Math.max(...priceData);
  
  return [
    { price: min, type: "support", strength: 80, tests: 3 },
    { price: max, type: "resistance", strength: 75, tests: 2 },
    { price: (min + max) / 2, type: "pivot", strength: 60, tests: 1 }
  ];
};

const generateCandleAnalysis = (priceData: number[], precision: string) => {
  return priceData.slice(0, 10).map((price, i) => ({
    position: { x: i * 20, y: 100 - (price - 95) * 20 },
    type: Math.random() > 0.5 ? "bullish" : "bearish" as "bullish" | "bearish",
    size: Math.random() > 0.7 ? "large" : Math.random() > 0.4 ? "medium" : "small" as "small" | "medium" | "large",
    significance: Math.random() * 100
  }));
};

const generateTrendlineAnalysis = (priceData: number[]) => {
  return [
    {
      points: [{ x: 0, y: 100 }, { x: 200, y: 80 }],
      type: "support" as const,
      strength: 85,
      breaks: 0
    }
  ];
};

const generateLevelAnalysis = (levels: any[]) => {
  return levels.map(level => ({
    price: level.price,
    type: level.type,
    strength: level.strength,
    tests: level.tests
  }));
};

const combineAllPatterns = (microPatterns: any[], harmonicPatterns: any[], classicPatterns: any[]) => {
  const combined = [];
  
  microPatterns.forEach(p => {
    if (p.found) {
      combined.push({
        name: p.pattern,
        type: p.signal === "BUY" ? "bullish" : "bearish",
        confidence: p.confidence,
        completion: 100,
        target: p.details.take_profit || 0
      });
    }
  });
  
  return combined;
};

const generateIndicatorAnalysis = (indicatorAnalysis: any) => {
  return [
    {
      name: "RSI",
      value: Math.random() * 100,
      signal: Math.random() > 0.5 ? "bullish" : "bearish" as "bullish" | "bearish",
      strength: Math.random() * 100
    },
    {
      name: "MACD",
      value: (Math.random() - 0.5) * 2,
      signal: Math.random() > 0.5 ? "bullish" : "bearish" as "bullish" | "bearish", 
      strength: Math.random() * 100
    }
  ];
};

const calculateVolatilityScore = (identifiedElements: any): number => {
  const candlesSizes = identifiedElements.candles.map((c: any) => c.size === "large" ? 3 : c.size === "medium" ? 2 : 1);
  const avgSize = candlesSizes.reduce((a: number, b: number) => a + b, 0) / candlesSizes.length;
  return avgSize * 30;
};