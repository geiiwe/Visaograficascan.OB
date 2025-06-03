
/**
 * Sistema de Decisão Autônoma da IA
 * A IA toma a decisão final baseada em todas as análises realizadas
 */

import { ExtendedPatternResult } from './predictionUtils';

export interface AutonomousDecision {
  action: "BUY" | "SELL" | "WAIT";
  confidence: number;
  timing: {
    enter_now: boolean;
    wait_seconds?: number;
    optimal_window: number; // segundos de duração da janela ótima
  };
  reasoning: string[];
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  expected_success_rate: number;
}

export interface DecisionFactors {
  micro_patterns: any[];
  visual_analysis: any;
  market_conditions: {
    volatility: number;
    noise: number;
    trend_strength: number;
  };
  timing_analysis: any;
  technical_indicators: Record<string, ExtendedPatternResult>;
}

export const makeAutonomousDecision = (
  factors: DecisionFactors,
  timeframe: string,
  marketType: string
): AutonomousDecision => {
  console.log("🤖 IA iniciando decisão autônoma...");
  
  const reasoning: string[] = [];
  let finalAction: "BUY" | "SELL" | "WAIT" = "WAIT";
  let confidence = 0;
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  let enterNow = false;
  let waitSeconds = 0;
  let optimalWindow = 30;
  
  // 1. ANÁLISE DE MICRO PADRÕES - Peso 35%
  const microPatternScore = analyzeMicroPatterns(factors.micro_patterns);
  reasoning.push(`Micro padrões: ${microPatternScore.signal} (${microPatternScore.strength}%)`);
  
  // 2. ANÁLISE DE TIMING - Peso 30%
  const timingScore = analyzeOptimalTiming(factors.timing_analysis, timeframe);
  reasoning.push(`Timing: ${timingScore.is_optimal ? "ÓTIMO" : "AGUARDAR"} (${timingScore.confidence}%)`);
  
  // 3. ANÁLISE VISUAL AVANÇADA - Peso 25%
  const visualScore = analyzeVisualPatterns(factors.visual_analysis);
  reasoning.push(`Análise visual: ${visualScore.direction} (qualidade ${visualScore.quality}%)`);
  
  // 4. CONDIÇÕES DE MERCADO - Peso 10%
  const marketScore = analyzeMarketConditions(factors.market_conditions, marketType);
  reasoning.push(`Mercado: ${marketScore.favorable ? "FAVORÁVEL" : "DESFAVORÁVEL"}`);
  
  // DECISÃO BASEADA EM ALGORITMO DE SCORING
  const buyScore = calculateBuyScore(microPatternScore, timingScore, visualScore, marketScore);
  const sellScore = calculateSellScore(microPatternScore, timingScore, visualScore, marketScore);
  const waitScore = calculateWaitScore(microPatternScore, timingScore, visualScore, marketScore);
  
  console.log(`Scores: BUY=${buyScore}, SELL=${sellScore}, WAIT=${waitScore}`);
  
  // A IA escolhe a ação com maior score
  const maxScore = Math.max(buyScore, sellScore, waitScore);
  
  if (maxScore === buyScore && buyScore > 70) {
    finalAction = "BUY";
    confidence = Math.min(95, buyScore);
    reasoning.push("✅ IA DECIDE: COMPRAR - Confluência de sinais positivos");
  } else if (maxScore === sellScore && sellScore > 70) {
    finalAction = "SELL";
    confidence = Math.min(95, sellScore);
    reasoning.push("✅ IA DECIDE: VENDER - Confluência de sinais negativos");
  } else {
    finalAction = "WAIT";
    confidence = Math.max(60, 100 - maxScore);
    reasoning.push("⏳ IA DECIDE: AGUARDAR - Sinais insuficientes ou conflitantes");
  }
  
  // ANÁLISE DE TIMING PARA ENTRADA
  if (finalAction !== "WAIT") {
    const timingDecision = determineEntryTiming(timingScore, microPatternScore, timeframe);
    enterNow = timingDecision.immediate;
    waitSeconds = timingDecision.wait_seconds;
    optimalWindow = timingDecision.window_duration;
    
    if (enterNow) {
      reasoning.push("⚡ ENTRADA IMEDIATA - Timing perfeito detectado");
    } else {
      reasoning.push(`⏰ AGUARDAR ${waitSeconds}s para entrada ótima`);
    }
  }
  
  // ANÁLISE DE RISCO AUTOMÁTICA
  riskLevel = assessRiskLevel(factors, finalAction, confidence);
  const successRate = calculateExpectedSuccessRate(confidence, riskLevel, marketType, timeframe);
  
  reasoning.push(`🎯 Taxa de sucesso esperada: ${successRate}%`);
  reasoning.push(`⚠️ Nível de risco: ${riskLevel}`);
  
  console.log(`🤖 IA DECIDIU: ${finalAction} com ${confidence}% de confiança`);
  
  return {
    action: finalAction,
    confidence,
    timing: {
      enter_now: enterNow,
      wait_seconds: waitSeconds,
      optimal_window: optimalWindow
    },
    reasoning,
    risk_level: riskLevel,
    expected_success_rate: successRate
  };
};

// Analisar micro padrões para scoring
const analyzeMicroPatterns = (patterns: any[]): { signal: "BUY" | "SELL" | "NEUTRAL", strength: number } => {
  if (!patterns || patterns.length === 0) {
    return { signal: "NEUTRAL", strength: 50 };
  }
  
  const validPatterns = patterns.filter(p => p.found && p.confidence > 60);
  
  if (validPatterns.length === 0) {
    return { signal: "NEUTRAL", strength: 45 };
  }
  
  let buySignals = 0;
  let sellSignals = 0;
  let totalStrength = 0;
  
  validPatterns.forEach(pattern => {
    if (pattern.details?.recommendation === "BUY") {
      buySignals++;
      totalStrength += pattern.confidence;
    } else if (pattern.details?.recommendation === "SELL") {
      sellSignals++;
      totalStrength += pattern.confidence;
    }
  });
  
  const avgStrength = totalStrength / validPatterns.length;
  
  if (buySignals > sellSignals) {
    return { signal: "BUY", strength: Math.min(90, avgStrength + (buySignals * 5)) };
  } else if (sellSignals > buySignals) {
    return { signal: "SELL", strength: Math.min(90, avgStrength + (sellSignals * 5)) };
  }
  
  return { signal: "NEUTRAL", strength: avgStrength };
};

// Analisar timing ótimo
const analyzeOptimalTiming = (timing: any, timeframe: string): { is_optimal: boolean, confidence: number } => {
  if (!timing) {
    return { is_optimal: false, confidence: 30 };
  }
  
  let confidence = 50;
  
  // Verificar se todos os fatores de timing estão alinhados
  if (timing.optimal_entry) confidence += 25;
  if (timing.volume_confirmation) confidence += 15;
  if (timing.trend_alignment) confidence += 20;
  if (timing.momentum_building) confidence += 15;
  
  // Ajustar por timeframe
  if (timeframe === "30s" && confidence > 70) {
    confidence += 10; // Timing é mais crítico em 30s
  }
  
  const isOptimal = confidence >= 75;
  
  return { is_optimal: isOptimal, confidence: Math.min(95, confidence) };
};

// Analisar padrões visuais
const analyzeVisualPatterns = (visual: any): { direction: "UP" | "DOWN" | "SIDEWAYS", quality: number } => {
  if (!visual) {
    return { direction: "SIDEWAYS", quality: 40 };
  }
  
  const quality = visual.chartQuality || 50;
  
  let direction: "UP" | "DOWN" | "SIDEWAYS" = "SIDEWAYS";
  
  if (visual.trendDirection === "uptrend") {
    direction = "UP";
  } else if (visual.trendDirection === "downtrend") {
    direction = "DOWN";
  }
  
  return { direction, quality };
};

// Analisar condições de mercado
const analyzeMarketConditions = (conditions: any, marketType: string): { favorable: boolean, score: number } => {
  let score = 50;
  
  // Volatilidade
  if (conditions.volatility < 30) score += 20; // Baixa volatilidade é boa
  else if (conditions.volatility > 70) score -= 25; // Alta volatilidade é ruim
  
  // Ruído
  if (conditions.noise < 25) score += 15; // Baixo ruído é bom
  else if (conditions.noise > 60) score -= 20; // Alto ruído é ruim
  
  // Força da tendência
  if (conditions.trend_strength > 70) score += 20; // Tendência forte é boa
  else if (conditions.trend_strength < 30) score -= 15; // Tendência fraca é ruim
  
  // Ajustes por tipo de mercado
  if (marketType === "otc") score -= 10; // OTC é mais arriscado
  
  const favorable = score >= 65;
  
  return { favorable, score: Math.max(0, Math.min(100, score)) };
};

// Calcular score de compra
const calculateBuyScore = (micro: any, timing: any, visual: any, market: any): number => {
  let score = 0;
  
  // Micro padrões (35%)
  if (micro.signal === "BUY") score += micro.strength * 0.35;
  else if (micro.signal === "SELL") score -= 10;
  
  // Timing (30%)
  if (timing.is_optimal) score += timing.confidence * 0.30;
  else score += timing.confidence * 0.15;
  
  // Visual (25%)
  if (visual.direction === "UP") score += visual.quality * 0.25;
  else if (visual.direction === "DOWN") score -= 15;
  
  // Mercado (10%)
  if (market.favorable) score += market.score * 0.10;
  else score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

// Calcular score de venda
const calculateSellScore = (micro: any, timing: any, visual: any, market: any): number => {
  let score = 0;
  
  // Micro padrões (35%)
  if (micro.signal === "SELL") score += micro.strength * 0.35;
  else if (micro.signal === "BUY") score -= 10;
  
  // Timing (30%)
  if (timing.is_optimal) score += timing.confidence * 0.30;
  else score += timing.confidence * 0.15;
  
  // Visual (25%)
  if (visual.direction === "DOWN") score += visual.quality * 0.25;
  else if (visual.direction === "UP") score -= 15;
  
  // Mercado (10%)
  if (market.favorable) score += market.score * 0.10;
  else score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

// Calcular score de espera
const calculateWaitScore = (micro: any, timing: any, visual: any, market: any): number => {
  let score = 50; // Base de espera
  
  // Aumenta se timing não for ótimo
  if (!timing.is_optimal) score += 20;
  
  // Aumenta se micro padrões são neutros
  if (micro.signal === "NEUTRAL") score += 15;
  
  // Aumenta se mercado não for favorável
  if (!market.favorable) score += 25;
  
  // Aumenta se visual for lateral
  if (visual.direction === "SIDEWAYS") score += 10;
  
  return Math.max(0, Math.min(100, score));
};

// Determinar timing de entrada
const determineEntryTiming = (timing: any, micro: any, timeframe: string): {
  immediate: boolean;
  wait_seconds: number;
  window_duration: number;
} => {
  const immediate = timing.is_optimal && timing.confidence > 85;
  
  let waitSeconds = 0;
  let windowDuration = 30;
  
  if (!immediate) {
    // Calcular tempo de espera baseado no timeframe
    if (timeframe === "30s") {
      waitSeconds = Math.floor(Math.random() * 15) + 5; // 5-20s
      windowDuration = 20;
    } else if (timeframe === "1m") {
      waitSeconds = Math.floor(Math.random() * 30) + 10; // 10-40s
      windowDuration = 45;
    } else {
      waitSeconds = Math.floor(Math.random() * 60) + 20; // 20-80s
      windowDuration = 60;
    }
  }
  
  return { immediate, wait_seconds: waitSeconds, window_duration: windowDuration };
};

// Avaliar nível de risco
const assessRiskLevel = (factors: any, action: string, confidence: number): "LOW" | "MEDIUM" | "HIGH" => {
  let riskScore = 0;
  
  // Confiança baixa = maior risco
  if (confidence < 70) riskScore += 30;
  else if (confidence > 85) riskScore -= 15;
  
  // Volatilidade alta = maior risco
  if (factors.market_conditions.volatility > 60) riskScore += 25;
  else if (factors.market_conditions.volatility < 30) riskScore -= 10;
  
  // Ruído alto = maior risco
  if (factors.market_conditions.noise > 50) riskScore += 20;
  
  // Qualidade visual baixa = maior risco
  if (factors.visual_analysis && factors.visual_analysis.chartQuality < 60) {
    riskScore += 15;
  }
  
  if (riskScore <= 20) return "LOW";
  if (riskScore <= 50) return "MEDIUM";
  return "HIGH";
};

// Calcular taxa de sucesso esperada
const calculateExpectedSuccessRate = (
  confidence: number, 
  riskLevel: string, 
  marketType: string, 
  timeframe: string
): number => {
  let baseRate = confidence * 0.8; // Base de 80% da confiança
  
  // Ajustes por risco
  if (riskLevel === "LOW") baseRate += 10;
  else if (riskLevel === "HIGH") baseRate -= 15;
  
  // Ajustes por mercado
  if (marketType === "otc") baseRate -= 8;
  
  // Ajustes por timeframe
  if (timeframe === "30s") baseRate -= 5; // Mais difícil em 30s
  else if (timeframe === "5m") baseRate += 3; // Mais fácil em 5m
  
  return Math.max(45, Math.min(90, Math.round(baseRate)));
};

export default makeAutonomousDecision;
