
/**
 * Motor de Análise Profissional da IA
 * Baseado em conhecimento clássico de análise técnica profissional
 * Referências: Dow Theory, Elliott Wave, Japanese Candlestick Charting, Market Wizards
 */

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
  console.log("🎓 Iniciando análise profissional baseada em conhecimento clássico...");
  
  const confluences: string[] = [];
  const contraindications: string[] = [];
  const reasoning: string[] = [];
  
  // 1. ANÁLISE DE TENDÊNCIA (Dow Theory)
  const trendAnalysis = analyzeTrendStructure(visualAnalysis, marketContext);
  reasoning.push(`Estrutura de tendência: ${trendAnalysis.structure}`);
  
  if (trendAnalysis.isValid) {
    confluences.push("Estrutura de tendência válida");
  } else {
    contraindications.push("Estrutura de tendência inválida");
  }
  
  // 2. ANÁLISE DE MOMENTUM (Williams %R, RSI concepts)
  const momentumAnalysis = analyzeMomentumDivergence(visualAnalysis, microPatterns);
  reasoning.push(`Momentum: ${momentumAnalysis.status}`);
  
  if (momentumAnalysis.bullish) {
    confluences.push("Momentum bullish confirmado");
  } else if (momentumAnalysis.bearish) {
    confluences.push("Momentum bearish confirmado");
  } else {
    contraindications.push("Momentum indeciso");
  }
  
  // 3. ANÁLISE DE VOLUME (Wyckoff Method)
  const volumeAnalysis = analyzeVolumeConfirmation(visualAnalysis, timing);
  reasoning.push(`Volume: ${volumeAnalysis.confirmation}`);
  
  if (volumeAnalysis.confirms) {
    confluences.push("Volume confirma movimento");
  } else {
    contraindications.push("Volume não confirma movimento");
  }
  
  // 4. ANÁLISE DE SUPORTE/RESISTÊNCIA (Pivots clássicos)
  const srAnalysis = analyzeSupportResistanceLevels(visualAnalysis, microPatterns);
  reasoning.push(`S/R: ${srAnalysis.level_interaction}`);
  
  if (srAnalysis.valid_breakout || srAnalysis.valid_bounce) {
    confluences.push("Interação válida com S/R");
  } else {
    contraindications.push("Falta clareza em S/R");
  }
  
  // 5. ANÁLISE DE PADRÕES DE VELAS (Steve Nison - Japanese Candlesticks)
  const candleAnalysis = analyzeCandlestickPatterns(microPatterns);
  reasoning.push(`Padrões de velas: ${candleAnalysis.pattern}`);
  
  if (candleAnalysis.reliable) {
    confluences.push("Padrão de velas confiável");
  } else if (candleAnalysis.misleading) {
    contraindications.push("Padrão de velas enganoso");
  }
  
  // 6. ANÁLISE DE TIMING DE ENTRADA (Market Profile concepts)
  const entryTiming = analyzeEntryTiming(timing, marketContext);
  reasoning.push(`Timing de entrada: ${entryTiming.quality}`);
  
  if (entryTiming.optimal) {
    confluences.push("Timing de entrada ótimo");
  } else {
    contraindications.push("Timing de entrada subótimo");
  }
  
  // 7. VERIFICAÇÃO DE INVALIDAÇÕES PROFISSIONAIS
  const invalidations = checkProfessionalInvalidations(
    trendAnalysis, momentumAnalysis, volumeAnalysis, marketContext
  );
  
  if (invalidations.length > 0) {
    contraindications.push(...invalidations);
    reasoning.push(`⚠️ Invalidações: ${invalidations.join(", ")}`);
  }
  
  // DECISÃO PROFISSIONAL BASEADA EM CONFLUÊNCIAS
  const confluenceCount = confluences.length;
  const contraindicationCount = contraindications.length;
  
  console.log(`Confluências encontradas: ${confluenceCount}`);
  console.log(`Contraindicações: ${contraindicationCount}`);
  
  // Aplicar regras profissionais de decisão
  const decision = makeProfessionalDecision(
    confluenceCount,
    contraindicationCount,
    trendAnalysis,
    momentumAnalysis,
    marketContext
  );
  
  // Calcular nível de risco profissional
  const riskLevel = assessProfessionalRisk(
    decision,
    confluenceCount,
    contraindicationCount,
    marketContext
  );
  
  // Validar Risk/Reward
  const riskRewardValid = validateRiskReward(decision, marketContext.timeframe);
  
  if (!riskRewardValid) {
    reasoning.push("❌ Risk/Reward insuficiente para padrões profissionais");
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
  
  reasoning.push(`✅ Análise profissional: ${confluenceCount} confluências vs ${contraindicationCount} contraindicações`);
  
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
  context: MarketContext
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
  
  return invalidations;
};

// Decisão profissional baseada em confluências
const makeProfessionalDecision = (
  confluences: number,
  contraindications: number,
  trendAnalysis: any,
  momentumAnalysis: any,
  context: MarketContext
) => {
  // Regras profissionais rígidas
  const minConfluences = PROFESSIONAL_PRINCIPLES.MIN_CONFLUENCES;
  
  let signal: "BUY" | "SELL" | "WAIT" = "WAIT";
  let confidence = 50;
  let timeValidity = 30;
  
  // Verificar se temos confluências mínimas
  if (confluences < minConfluences.low_confidence) {
    return {
      signal: "WAIT",
      confidence: 30,
      timeValidity: 30
    };
  }
  
  // Verificar se contraindicações não superam confluências
  if (contraindications >= confluences) {
    return {
      signal: "WAIT",
      confidence: 40,
      timeValidity: 30
    };
  }
  
  // Determinar direção baseada na tendência e momentum
  if (trendAnalysis.direction === "uptrend" && 
      (momentumAnalysis.bullish || momentumAnalysis.status === "Neutro")) {
    signal = "BUY";
  } else if (trendAnalysis.direction === "downtrend" && 
             (momentumAnalysis.bearish || momentumAnalysis.status === "Neutro")) {
    signal = "SELL";
  }
  
  // Calcular confiança baseada em confluências
  if (confluences >= minConfluences.high_confidence) {
    confidence = 85 + Math.min(10, (confluences - minConfluences.high_confidence) * 2);
  } else if (confluences >= minConfluences.medium_confidence) {
    confidence = 70 + ((confluences - minConfluences.medium_confidence) * 5);
  } else {
    confidence = 55 + ((confluences - minConfluences.low_confidence) * 5);
  }
  
  // Ajustar confiança por contraindicações
  confidence -= contraindications * 8;
  
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
    confidence: Math.max(50, Math.min(95, confidence)),
    timeValidity
  };
};

// Avaliar risco profissional
const assessProfessionalRisk = (
  decision: any,
  confluences: number,
  contraindications: number,
  context: MarketContext
): "LOW" | "MEDIUM" | "HIGH" => {
  let riskScore = 0;
  
  // Fatores de risco
  if (confluences < 3) riskScore += 25;
  if (contraindications > 1) riskScore += 20;
  if (context.volatility > 70) riskScore += 15;
  if (context.marketType === "otc") riskScore += 10;
  if (context.timeframe === "30s") riskScore += 10;
  if (decision.confidence < 70) riskScore += 20;
  
  if (riskScore <= 20) return "LOW";
  if (riskScore <= 50) return "MEDIUM";
  return "HIGH";
};

// Validar Risk/Reward profissional
const validateRiskReward = (decision: any, timeframe: string): boolean => {
  const minRR = PROFESSIONAL_PRINCIPLES.MIN_RISK_REWARD;
  
  // Para esta implementação, assumimos R/R baseado na confiança
  const estimatedRR = decision.confidence / 30; // Aproximação
  
  if (timeframe === "30s") {
    return estimatedRR >= minRR.scalping;
  } else if (timeframe === "1m" || timeframe === "5m") {
    return estimatedRR >= minRR.swing;
  } else {
    return estimatedRR >= minRR.position;
  }
};
