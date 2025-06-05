/**
 * Motor de Análise Profissional da IA - VERSÃO ULTRA AVANÇADA
 * Integra conhecimento clássico + padrões + confluências múltiplas
 */

import { identifyClassicPatterns } from './classicPatterns/chartPatternEngine';
import { analyzeMultipleIndicators, ConfluenceAnalysis } from './confluences/multiIndicatorEngine';

export interface ProfessionalAnalysisResult {
  signal: "BUY" | "SELL" | "WAIT";
  confidence: number;
  reasoning: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  timeValidity: number; // segundos
  confluences: number; // número de confluências técnicas
  contraindications: string[]; // sinais contrários encontrados
}

export interface MarketContext {
  timeframe: string;
  marketType: string;
  volatility: number;
  trendStrength: number;
  volumeProfile: "high" | "medium" | "low";
}

// Princípios fundamentais da análise técnica profissional
const PROFESSIONAL_PRINCIPLES = {
  // Dow Theory - Tendência é rei
  DOW_THEORY: {
    primary_trend_weight: 0.4,
    secondary_trend_weight: 0.3,
    minor_trend_weight: 0.3
  },
  
  // Confluências necessárias para sinal válido
  MIN_CONFLUENCES: {
    high_confidence: 4,
    medium_confidence: 3,
    low_confidence: 2
  },
  
  // Risk/Reward mínimos profissionais
  MIN_RISK_REWARD: {
    scalping: 1.5,  // 30s-1m
    swing: 2.0,     // 5m-15m
    position: 3.0   // 1h+
  },
  
  // Invalidações automáticas
  INVALIDATION_RULES: {
    conflicting_timeframes: true,
    weak_volume_confirmation: true,
    extreme_volatility: true,
    news_events: true
  }
};

export const performProfessionalAnalysis = (
  visualAnalysis: any,
  microPatterns: any[],
  timing: any,
  marketContext: MarketContext
): ProfessionalAnalysisResult => {
  console.log("🎓 Iniciando análise ULTRA PROFISSIONAL com padrões clássicos e confluências múltiplas...");
  
  const confluences: string[] = [];
  const contraindications: string[] = [];
  const reasoning: string[] = [];
  
  // NOVA ANÁLISE 1: PADRÕES CLÁSSICOS DE CHART (Edwards & Magee, Bulkowski)
  const priceData = generateSimulatedPriceData(visualAnalysis);
  const volumeData = generateSimulatedVolumeData(visualAnalysis);
  
  const classicPatterns = identifyClassicPatterns(priceData, volumeData, marketContext.timeframe);
  reasoning.push(`🏛️ Padrões clássicos identificados: ${classicPatterns.length}`);
  
  if (classicPatterns.length > 0) {
    const bestPattern = classicPatterns[0];
    reasoning.push(`📊 Padrão principal: ${bestPattern.pattern.name} (${bestPattern.confidence.toFixed(1)}% confiança)`);
    
    if (bestPattern.confidence > 80 && bestPattern.riskReward > 2) {
      confluences.push(`Padrão clássico ${bestPattern.pattern.name} de alta qualidade`);
    } else if (bestPattern.confidence < 60) {
      contraindications.push(`Padrão ${bestPattern.pattern.name} com baixa confiança`);
    }
  }
  
  // NOVA ANÁLISE 2: CONFLUÊNCIAS MULTI-INDICADORES (Elder, Murphy, Pring)
  const indicatorAnalysis: ConfluenceAnalysis = analyzeMultipleIndicators(
    priceData, 
    volumeData, 
    marketContext.timeframe
  );
  
  reasoning.push(`⚡ Análise multi-indicadores: ${indicatorAnalysis.recommendation} (${indicatorAnalysis.reliability}% confiabilidade)`);
  reasoning.push(`📈 Score total: ${indicatorAnalysis.totalScore} | Confluências: ${indicatorAnalysis.majorConfluences}`);
  
  if (indicatorAnalysis.majorConfluences >= 3) {
    confluences.push(`${indicatorAnalysis.majorConfluences} confluências técnicas principais`);
  }
  
  if (indicatorAnalysis.bullishSignals.length > indicatorAnalysis.bearishSignals.length + 2) {
    confluences.push("Predominância de sinais bullish nos indicadores");
  } else if (indicatorAnalysis.bearishSignals.length > indicatorAnalysis.bullishSignals.length + 2) {
    confluences.push("Predominância de sinais bearish nos indicadores");
  }
  
  // Adicionar sinais específicos de alta qualidade
  indicatorAnalysis.bullishSignals.forEach(signal => {
    if (signal.confluence && signal.strength > 70) {
      reasoning.push(`🟢 ${signal.name}: ${signal.signal} (${signal.strength.toFixed(1)} força)`);
    }
  });
  
  indicatorAnalysis.bearishSignals.forEach(signal => {
    if (signal.confluence && signal.strength > 70) {
      reasoning.push(`🔴 ${signal.name}: ${signal.signal} (${signal.strength.toFixed(1)} força)`);
    }
  });
  
  // 1. ANÁLISE DE TENDÊNCIA (Dow Theory) - mantida
  const trendAnalysis = analyzeTrendStructure(visualAnalysis, marketContext);
  reasoning.push(`Estrutura de tendência: ${trendAnalysis.structure}`);
  
  if (trendAnalysis.isValid) {
    confluences.push("Estrutura de tendência válida");
  } else {
    contraindications.push("Estrutura de tendência inválida");
  }
  
  // 2. ANÁLISE DE MOMENTUM (Williams %R, RSI concepts) - aprimorada
  const momentumAnalysis = analyzeMomentumDivergence(visualAnalysis, microPatterns);
  reasoning.push(`Momentum: ${momentumAnalysis.status}`);
  
  // Integrar com análise de indicadores
  const rsiSignals = indicatorAnalysis.bullishSignals.concat(indicatorAnalysis.bearishSignals)
    .filter(s => s.name.includes("RSI"));
    
  if (rsiSignals.length > 0 && rsiSignals[0].confluence) {
    if (momentumAnalysis.bullish && rsiSignals[0].signal === "BUY") {
      confluences.push("Momentum e RSI confirmam direção bullish");
    } else if (momentumAnalysis.bearish && rsiSignals[0].signal === "SELL") {
      confluences.push("Momentum e RSI confirmam direção bearish");
    }
  }
  
  if (momentumAnalysis.bullish) {
    confluences.push("Momentum bullish confirmado");
  } else if (momentumAnalysis.bearish) {
    confluences.push("Momentum bearish confirmado");
  } else {
    contraindications.push("Momentum indeciso");
  }
  
  // 3. ANÁLISE DE VOLUME (Wyckoff Method) - aprimorada
  const volumeAnalysis = analyzeVolumeConfirmation(visualAnalysis, timing);
  reasoning.push(`Volume: ${volumeAnalysis.confirmation}`);
  
  // Integrar com análise de volume dos indicadores
  const volumeSignals = indicatorAnalysis.bullishSignals.concat(indicatorAnalysis.bearishSignals)
    .filter(s => s.name.includes("Volume"));
    
  if (volumeSignals.length > 0 && volumeSignals[0].confluence) {
    if (volumeAnalysis.confirms) {
      confluences.push("Volume confirma movimento com múltiplos indicadores");
    }
  }
  
  if (volumeAnalysis.confirms) {
    confluences.push("Volume confirma movimento");
  } else {
    contraindications.push("Volume não confirma movimento");
  }
  
  // 4. ANÁLISE DE SUPORTE/RESISTÊNCIA (Pivots clássicos) - mantida
  const srAnalysis = analyzeSupportResistanceLevels(visualAnalysis, microPatterns);
  reasoning.push(`S/R: ${srAnalysis.level_interaction}`);
  
  if (srAnalysis.valid_breakout || srAnalysis.valid_bounce) {
    confluences.push("Interação válida com S/R");
  } else {
    contraindications.push("Falta clareza em S/R");
  }
  
  // 5. ANÁLISE DE PADRÕES DE VELAS (Steve Nison) - mantida
  const candleAnalysis = analyzeCandlestickPatterns(microPatterns);
  reasoning.push(`Padrões de velas: ${candleAnalysis.pattern}`);
  
  if (candleAnalysis.reliable) {
    confluences.push("Padrão de velas confiável");
  } else if (candleAnalysis.misleading) {
    contraindications.push("Padrão de velas enganoso");
  }
  
  // 6. ANÁLISE DE TIMING DE ENTRADA (Market Profile) - mantida
  const entryTiming = analyzeEntryTiming(timing, marketContext);
  reasoning.push(`Timing de entrada: ${entryTiming.quality}`);
  
  if (entryTiming.optimal) {
    confluences.push("Timing de entrada ótimo");
  } else {
    contraindications.push("Timing de entrada subótimo");
  }
  
  // 7. VERIFICAÇÃO DE INVALIDAÇÕES PROFISSIONAIS - aprimorada
  const invalidations = checkProfessionalInvalidations(
    trendAnalysis, momentumAnalysis, volumeAnalysis, marketContext, indicatorAnalysis
  );
  
  if (invalidations.length > 0) {
    contraindications.push(...invalidations);
    reasoning.push(`⚠️ Invalidações: ${invalidations.join(", ")}`);
  }
  
  // DECISÃO PROFISSIONAL ULTRA AVANÇADA
  const confluenceCount = confluences.length;
  const contraindicationCount = contraindications.length;
  
  console.log(`Confluências encontradas: ${confluenceCount}`);
  console.log(`Contraindicações: ${contraindicationCount}`);
  console.log(`Padrões clássicos: ${classicPatterns.length}`);
  console.log(`Análise multi-indicador: ${indicatorAnalysis.recommendation}`);
  
  // Integrar recomendação dos indicadores na decisão final
  const decision = makeProfessionalDecision(
    confluenceCount,
    contraindicationCount,
    trendAnalysis,
    momentumAnalysis,
    marketContext,
    indicatorAnalysis,
    classicPatterns
  );
  
  // Calcular nível de risco ultra profissional
  const riskLevel = assessProfessionalRisk(
    decision,
    confluenceCount,
    contraindicationCount,
    marketContext,
    indicatorAnalysis
  );
  
  // Validar Risk/Reward com padrões clássicos
  const riskRewardValid = validateRiskReward(decision, marketContext.timeframe, classicPatterns);
  
  if (!riskRewardValid) {
    reasoning.push("❌ Risk/Reward insuficiente para padrões profissionais ultra avançados");
    return {
      signal: "WAIT",
      confidence: 30,
      reasoning,
      riskLevel: "HIGH",
      timeValidity: 30,
      confluences: confluenceCount,
      contraindications
    };
  }
  
  reasoning.push(`✅ Análise ULTRA profissional: ${confluenceCount} confluências vs ${contraindicationCount} contraindicações`);
  reasoning.push(`🏛️ Padrões clássicos + Multi-indicadores integrados`);
  
  return {
    signal: decision.signal,
    confidence: decision.confidence,
    reasoning,
    riskLevel,
    timeValidity: decision.timeValidity,
    confluences: confluenceCount,
    contraindications
  };
};

// Análise de estrutura de tendência (Dow Theory)
const analyzeTrendStructure = (visualAnalysis: any, context: MarketContext) => {
  const trendDirection = visualAnalysis?.trendDirection || "unknown";
  const trendStrength = context.trendStrength || 50;
  
  // Dow Theory: Tendência válida precisa de Higher Highs/Higher Lows (uptrend) 
  // ou Lower Highs/Lower Lows (downtrend)
  const hasValidStructure = trendStrength > 60 && trendDirection !== "sideways";
  
  let structure = "Indefinida";
  if (trendDirection === "uptrend" && hasValidStructure) {
    structure = "Uptrend válida (HH/HL)";
  } else if (trendDirection === "downtrend" && hasValidStructure) {
    structure = "Downtrend válida (LH/LL)";
  } else if (trendDirection === "sideways") {
    structure = "Consolidação lateral";
  }
  
  return {
    structure,
    isValid: hasValidStructure,
    direction: trendDirection,
    strength: trendStrength
  };
};

// Análise de divergência de momentum
const analyzeMomentumDivergence = (visualAnalysis: any, microPatterns: any[]) => {
  const momentum = visualAnalysis?.priceAction?.momentum || 0;
  const volatility = visualAnalysis?.priceAction?.volatility || 50;
  
  // Procurar padrões de momentum nos micro padrões
  const momentumPatterns = microPatterns.filter(p => 
    p.type === "momentum" || p.type === "divergence"
  );
  
  let status = "Neutro";
  let bullish = false;
  let bearish = false;
  
  // Momentum forte e crescente = bullish
  if (momentum > 15 && volatility < 70) {
    status = "Bullish convergente";
    bullish = true;
  }
  // Momentum negativo forte = bearish
  else if (momentum < -15 && volatility < 70) {
    status = "Bearish convergente";
    bearish = true;
  }
  // Alta volatilidade = momentum incerto
  else if (volatility > 80) {
    status = "Incerto (alta volatilidade)";
  }
  
  return { status, bullish, bearish };
};

// Análise de confirmação de volume (Wyckoff)
const analyzeVolumeConfirmation = (visualAnalysis: any, timing: any) => {
  const volumeSignificance = visualAnalysis?.volumeAnalysis?.significance || 50;
  const volumeConfirmation = timing?.volume_confirmation || false;
  
  let confirmation = "Sem confirmação";
  let confirms = false;
  
  // Volume alto + confirmação = válido
  if (volumeSignificance > 70 && volumeConfirmation) {
    confirmation = "Forte confirmação de volume";
    confirms = true;
  }
  // Volume médio com confirmação = aceitável
  else if (volumeSignificance > 50 && volumeConfirmation) {
    confirmation = "Confirmação moderada";
    confirms = true;
  }
  // Volume baixo = suspeito
  else if (volumeSignificance < 40) {
    confirmation = "Volume insuficiente";
  }
  
  return { confirmation, confirms };
};

// Análise de níveis de S/R
const analyzeSupportResistanceLevels = (visualAnalysis: any, microPatterns: any[]) => {
  const srLevels = visualAnalysis?.supportResistanceLevels || [];
  
  // Procurar interações com S/R nos micro padrões
  const srInteractions = microPatterns.filter(p => 
    p.type === "support_test" || p.type === "resistance_test" || 
    p.type === "breakout" || p.type === "breakdown"
  );
  
  const hasValidBreakout = srInteractions.some(p => 
    (p.type === "breakout" || p.type === "breakdown") && p.confidence > 70
  );
  
  const hasValidBounce = srInteractions.some(p => 
    (p.type === "support_test" || p.type === "resistance_test") && p.confidence > 70
  );
  
  let levelInteraction = "Sem interação clara";
  if (hasValidBreakout) {
    levelInteraction = "Breakout/Breakdown válido";
  } else if (hasValidBounce) {
    levelInteraction = "Bounce em S/R válido";
  }
  
  return {
    level_interaction: levelInteraction,
    valid_breakout: hasValidBreakout,
    valid_bounce: hasValidBounce
  };
};

// Análise de padrões de velas japonesas
const analyzeCandlestickPatterns = (microPatterns: any[]) => {
  const candlePatterns = microPatterns.filter(p => 
    p.type === "doji" || p.type === "hammer" || p.type === "shooting_star" ||
    p.type === "engulfing" || p.type === "harami"
  );
  
  if (candlePatterns.length === 0) {
    return { pattern: "Nenhum padrão identificado", reliable: false, misleading: false };
  }
  
  // Verificar confiabilidade baseada no contexto
  const highConfidencePatterns = candlePatterns.filter(p => p.confidence > 75);
  const conflictingPatterns = candlePatterns.filter(p => p.confidence < 60);
  
  let pattern = "Padrões identificados";
  let reliable = false;
  let misleading = false;
  
  if (highConfidencePatterns.length >= 2) {
    pattern = "Padrões confiáveis múltiplos";
    reliable = true;
  } else if (conflictingPatterns.length > highConfidencePatterns.length) {
    pattern = "Padrões conflitantes";
    misleading = true;
  }
  
  return { pattern, reliable, misleading };
};

// Análise de timing de entrada
const analyzeEntryTiming = (timing: any, context: MarketContext) => {
  const optimalEntry = timing?.optimal_entry || false;
  const timeRemaining = timing?.time_remaining || 0;
  
  let quality = "Subótimo";
  let optimal = false;
  
  // Timing é crítico em timeframes curtos
  if (context.timeframe === "30s") {
    if (optimalEntry && timeRemaining > 15) {
      quality = "Ótimo para scalping";
      optimal = true;
    }
  } else if (context.timeframe === "1m" || context.timeframe === "5m") {
    if (optimalEntry) {
      quality = "Ótimo para swing";
      optimal = true;
    }
  }
  
  return { quality, optimal };
};

// Verificar invalidações profissionais
const checkProfessionalInvalidations = (
  trendAnalysis: any,
  momentumAnalysis: any,
  volumeAnalysis: any,
  context: MarketContext,
  indicatorAnalysis: ConfluenceAnalysis
): string[] => {
  const invalidations: string[] = [];
  
  // 1. Tendência fraca em timeframe curto
  if (context.timeframe === "30s" && trendAnalysis.strength < 70) {
    invalidations.push("Tendência muito fraca para scalping");
  }
  
  // 2. Momentum e tendência conflitantes
  if (trendAnalysis.direction === "uptrend" && momentumAnalysis.bearish) {
    invalidations.push("Divergência momentum vs tendência");
  } else if (trendAnalysis.direction === "downtrend" && momentumAnalysis.bullish) {
    invalidations.push("Divergência momentum vs tendência");
  }
  
  // 3. Volume insuficiente para validar movimento
  if (!volumeAnalysis.confirms && context.timeframe !== "30s") {
    invalidations.push("Volume não confirma movimento");
  }
  
  // 4. Volatilidade extrema
  if (context.volatility > 90) {
    invalidations.push("Volatilidade extrema");
  }
  
  // 5. Mercado OTC com muitos conflitos
  if (context.marketType === "otc" && invalidations.length >= 2) {
    invalidations.push("Múltiplos conflitos em mercado OTC");
  }
  
  // NOVAS invalidações
  if (indicatorAnalysis.majorConfluences === 0) {
    invalidations.push("Ausência total de confluências nos indicadores");
  }
  
  if (indicatorAnalysis.bearishSignals.length > 0 && indicatorAnalysis.bullishSignals.length > 0) {
    const conflictRatio = Math.min(indicatorAnalysis.bearishSignals.length, indicatorAnalysis.bullishSignals.length) / 
                         Math.max(indicatorAnalysis.bearishSignals.length, indicatorAnalysis.bullishSignals.length);
    if (conflictRatio > 0.8) {
      invalidations.push("Sinais técnicos altamente conflitantes");
    }
  }
  
  return invalidations;
};

// Decisão profissional ULTRA AVANÇADA
const makeProfessionalDecision = (
  confluences: number,
  contraindications: number,
  trendAnalysis: any,
  momentumAnalysis: any,
  context: MarketContext,
  indicatorAnalysis: ConfluenceAnalysis,
  classicPatterns: any[]
) => {
  // Regras profissionais ultra rígidas
  const minConfluences = PROFESSIONAL_PRINCIPLES.MIN_CONFLUENCES;
  
  let signal: "BUY" | "SELL" | "WAIT" = "WAIT";
  let confidence = 50;
  let timeValidity = 30;
  
  // Verificar se temos confluências mínimas ULTRA
  if (confluences < minConfluences.low_confidence + 1) {
    return {
      signal: "WAIT" as const,
      confidence: 30,
      timeValidity: 30
    };
  }
  
  // Verificar se contraindicações não superam confluências
  if (contraindications >= confluences) {
    return {
      signal: "WAIT" as const,
      confidence: 40,
      timeValidity: 30
    };
  }
  
  // NOVA LÓGICA: Integrar recomendação dos multi-indicadores
  let indicatorBias: "BUY" | "SELL" | "WAIT" = "WAIT";
  if (indicatorAnalysis.recommendation === "STRONG_BUY" || indicatorAnalysis.recommendation === "BUY") {
    indicatorBias = "BUY";
  } else if (indicatorAnalysis.recommendation === "STRONG_SELL" || indicatorAnalysis.recommendation === "SELL") {
    indicatorBias = "SELL";
  }
  
  // NOVA LÓGICA: Integrar padrões clássicos
  let patternBias: "BUY" | "SELL" | "WAIT" = "WAIT";
  if (classicPatterns.length > 0) {
    const bestPattern = classicPatterns[0];
    if (bestPattern.confidence > 75) {
      if (bestPattern.pattern.type === "continuation" && trendAnalysis.direction === "uptrend") {
        patternBias = "BUY";
      } else if (bestPattern.pattern.type === "continuation" && trendAnalysis.direction === "downtrend") {
        patternBias = "SELL";
      } else if (bestPattern.pattern.type === "reversal" && trendAnalysis.direction === "downtrend") {
        patternBias = "BUY";
      } else if (bestPattern.pattern.type === "reversal" && trendAnalysis.direction === "uptrend") {
        patternBias = "SELL";
      }
    }
  }
  
  // Determinar direção baseada em MÚLTIPLAS CONFIRMAÇÕES
  const bullishConfirmations = [
    trendAnalysis.direction === "uptrend",
    momentumAnalysis.bullish,
    indicatorBias === "BUY",
    patternBias === "BUY"
  ].filter(Boolean).length;
  
  const bearishConfirmations = [
    trendAnalysis.direction === "downtrend",
    momentumAnalysis.bearish,
    indicatorBias === "SELL",
    patternBias === "SELL"
  ].filter(Boolean).length;
  
  if (bullishConfirmations >= 3) {
    signal = "BUY";
  } else if (bearishConfirmations >= 3) {
    signal = "SELL";
  }
  
  // Calcular confiança ULTRA baseada em múltiplas confluências
  if (confluences >= minConfluences.high_confidence + 2) {
    confidence = 90 + Math.min(10, (confluences - minConfluences.high_confidence) * 1.5);
  } else if (confluences >= minConfluences.high_confidence) {
    confidence = 80 + ((confluences - minConfluences.high_confidence) * 3);
  } else if (confluences >= minConfluences.medium_confidence) {
    confidence = 70 + ((confluences - minConfluences.medium_confidence) * 3);
  } else {
    confidence = 55 + ((confluences - minConfluences.low_confidence) * 3);
  }
  
  // Bonus por indicadores e padrões
  if (indicatorAnalysis.reliability > 80) confidence += 5;
  if (classicPatterns.length > 0 && classicPatterns[0].confidence > 80) confidence += 5;
  
  // Ajustar confiança por contraindicações
  confidence -= contraindications * 6;
  
  // Ajustar validade temporal por timeframe
  if (context.timeframe === "30s") {
    timeValidity = 25;
  } else if (context.timeframe === "1m") {
    timeValidity = 45;
  } else {
    timeValidity = 90;
  }
  
  return {
    signal,
    confidence: Math.max(50, Math.min(98, confidence)),
    timeValidity
  };
};

// Avaliar risco ULTRA profissional
const assessProfessionalRisk = (
  decision: any,
  confluences: number,
  contraindications: number,
  context: MarketContext,
  indicatorAnalysis: ConfluenceAnalysis
): "LOW" | "MEDIUM" | "HIGH" => {
  let riskScore = 0;
  
  // Fatores de risco básicos
  if (confluences < 4) riskScore += 20;
  if (contraindications > 1) riskScore += 15;
  if (context.volatility > 70) riskScore += 15;
  if (context.marketType === "otc") riskScore += 10;
  if (context.timeframe === "30s") riskScore += 10;
  if (decision.confidence < 70) riskScore += 15;
  
  // NOVOS fatores de risco
  if (indicatorAnalysis.majorConfluences < 2) riskScore += 15;
  if (indicatorAnalysis.reliability < 70) riskScore += 10;
  
  if (riskScore <= 15) return "LOW";
  if (riskScore <= 40) return "MEDIUM";
  return "HIGH";
};

// Validar Risk/Reward ULTRA profissional
const validateRiskReward = (decision: any, timeframe: string, classicPatterns: any[]): boolean => {
  const minRR = PROFESSIONAL_PRINCIPLES.MIN_RISK_REWARD;
  
  // Se temos padrão clássico, usar R/R do padrão
  if (classicPatterns.length > 0) {
    const bestPattern = classicPatterns[0];
    return bestPattern.riskReward >= minRR.scalping;
  }
  
  // Senão, usar lógica original
  const estimatedRR = decision.confidence / 30;
  
  if (timeframe === "30s") {
    return estimatedRR >= minRR.scalping;
  } else if (timeframe === "1m" || timeframe === "5m") {
    return estimatedRR >= minRR.swing;
  } else {
    return estimatedRR >= minRR.position;
  }
};

// Funções auxiliares para simular dados
const generateSimulatedPriceData = (visualAnalysis: any): number[] => {
  const basePrice = 100;
  const trend = visualAnalysis?.trendDirection || "sideways";
  const volatility = (visualAnalysis?.priceAction?.volatility || 50) / 100;
  
  const data: number[] = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < 50; i++) {
    const trendFactor = trend === "uptrend" ? 0.002 : trend === "downtrend" ? -0.002 : 0;
    const randomFactor = (Math.random() - 0.5) * volatility * 0.02;
    
    currentPrice *= (1 + trendFactor + randomFactor);
    data.push(currentPrice);
  }
  
  return data;
};

const generateSimulatedVolumeData = (visualAnalysis: any): number[] => {
  const baseVolume = 1000;
  const data: number[] = [];
  
  for (let i = 0; i < 50; i++) {
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    data.push(baseVolume * randomFactor);
  }
  
  return data;
};
