/**
 * Detector de Manipulação de Mercado
 * Analisa padrões suspeitos que podem indicar manipulação antes de autorizar entrada
 */

export interface ManipulationAnalysis {
  isManipulated: boolean;
  manipulationScore: number; // 0-100
  suspiciousPatterns: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: 'PROCEED' | 'CAUTION' | 'ABORT';
  reasoning: string[];
}

export interface MarketData {
  priceAction: {
    sudden_moves: boolean;
    unusual_volume: boolean;
    price_gaps: boolean;
    reversal_speed: number;
  };
  timeframe: string;
  marketType: string;
  patterns: string[];
  confidence: number;
  visualAnalysis?: any;
}

export const detectMarketManipulation = (
  marketData: MarketData,
  technicalSignal: "BUY" | "SELL" | "WAIT"
): ManipulationAnalysis => {
  console.log("🛡️ Iniciando análise anti-manipulação...");
  
  let manipulationScore = 0;
  const suspiciousPatterns: string[] = [];
  const reasoning: string[] = [];

  // 1. ANÁLISE DE MOVIMENTO SÚBITO DE PREÇOS
  if (marketData.priceAction.sudden_moves) {
    manipulationScore += 25;
    suspiciousPatterns.push("Movimento súbito de preços");
    reasoning.push("⚠️ Detectado movimento abrupto que pode indicar manipulação");
  }

  // 2. ANÁLISE DE VOLUME ANÔMALO
  if (marketData.priceAction.unusual_volume) {
    manipulationScore += 20;
    suspiciousPatterns.push("Volume anômalo");
    reasoning.push("📊 Volume desproporcional detectado - possível whale activity");
  }

  // 3. ANÁLISE DE GAPS DE PREÇO
  if (marketData.priceAction.price_gaps) {
    manipulationScore += 15;
    suspiciousPatterns.push("Gaps de preço");
    reasoning.push("⛔ Gaps de preço podem indicar manipulação ou notícias");
  }

  // 4. VELOCIDADE DE REVERSÃO SUSPEITA
  if (marketData.priceAction.reversal_speed > 80) {
    manipulationScore += 30;
    suspiciousPatterns.push("Reversão ultra-rápida");
    reasoning.push("🚨 Reversão extremamente rápida - alta probabilidade de manipulação");
  }

  // 5. ANÁLISE ESPECÍFICA POR TIMEFRAME
  const timeframeRisk = analyzeTimeframeRisk(marketData.timeframe, manipulationScore);
  manipulationScore += timeframeRisk.score;
  if (timeframeRisk.warning) {
    suspiciousPatterns.push(timeframeRisk.pattern);
    reasoning.push(timeframeRisk.reason);
  }

  // 6. ANÁLISE ESPECÍFICA POR TIPO DE MERCADO
  const marketTypeRisk = analyzeMarketTypeRisk(marketData.marketType, manipulationScore);
  manipulationScore += marketTypeRisk.score;
  if (marketTypeRisk.warning) {
    suspiciousPatterns.push(marketTypeRisk.pattern);
    reasoning.push(marketTypeRisk.reason);
  }

  // 7. ANÁLISE DE PADRÕES CONFLITANTES
  const conflictAnalysis = analyzePatternConflicts(marketData.patterns, technicalSignal);
  manipulationScore += conflictAnalysis.score;
  if (conflictAnalysis.warning) {
    suspiciousPatterns.push(conflictAnalysis.pattern);
    reasoning.push(conflictAnalysis.reason);
  }

  // 8. ANÁLISE DE CONFIANÇA VS PADRÕES
  const confidenceAnalysis = analyzeConfidenceAnomalies(marketData.confidence, marketData.patterns.length);
  manipulationScore += confidenceAnalysis.score;
  if (confidenceAnalysis.warning) {
    suspiciousPatterns.push(confidenceAnalysis.pattern);
    reasoning.push(confidenceAnalysis.reason);
  }

  // DETERMINAR NÍVEL DE RISCO E RECOMENDAÇÃO
  const riskLevel = determineRiskLevel(manipulationScore);
  const recommendation = determineRecommendation(manipulationScore, technicalSignal);
  const isManipulated = manipulationScore >= 50;

  // LOG FINAL
  console.log(`🛡️ Análise anti-manipulação: Score ${manipulationScore}/100 | Risco: ${riskLevel} | Recomendação: ${recommendation}`);

  return {
    isManipulated,
    manipulationScore,
    suspiciousPatterns,
    riskLevel,
    recommendation,
    reasoning: isManipulated ? 
      [`🚨 ALERTA DE MANIPULAÇÃO (Score: ${manipulationScore}/100)`, ...reasoning] :
      [`✅ Mercado aparenta normalidade (Score: ${manipulationScore}/100)`, ...reasoning]
  };
};

// Análise de risco por timeframe
const analyzeTimeframeRisk = (timeframe: string, currentScore: number) => {
  switch (timeframe) {
    case "30s":
      return {
        score: 15,
        warning: true,
        pattern: "Timeframe ultra-baixo",
        reason: "⏱️ Timeframes de 30s são mais suscetíveis à manipulação"
      };
    case "1m":
      return {
        score: 10,
        warning: currentScore > 30,
        pattern: "Timeframe baixo com outros riscos",
        reason: "⏱️ Timeframe de 1m com outros indicadores de risco"
      };
    case "5m":
      return {
        score: 5,
        warning: false,
        pattern: "",
        reason: ""
      };
    default:
      return {
        score: 0,
        warning: false,
        pattern: "",
        reason: ""
      };
  }
};

// Análise de risco por tipo de mercado
const analyzeMarketTypeRisk = (marketType: string, currentScore: number) => {
  switch (marketType.toLowerCase()) {
    case "otc":
      return {
        score: 20,
        warning: true,
        pattern: "Mercado OTC",
        reason: "🏪 Mercados OTC têm maior risco de manipulação"
      };
    case "crypto":
      return {
        score: 15,
        warning: currentScore > 25,
        pattern: "Volatilidade cripto",
        reason: "₿ Mercado cripto com alta volatilidade pode mascarar manipulação"
      };
    case "forex":
      return {
        score: 5,
        warning: false,
        pattern: "",
        reason: ""
      };
    default:
      return {
        score: 0,
        warning: false,
        pattern: "",
        reason: ""
      };
  }
};

// Análise de conflitos entre padrões
const analyzePatternConflicts = (patterns: string[], signal: "BUY" | "SELL" | "WAIT") => {
  if (patterns.length === 0) {
    return {
      score: 0,
      warning: false,
      pattern: "",
      reason: ""
    };
  }

  // Verificar se há muitos padrões conflitantes
  if (patterns.length > 5 && signal !== "WAIT") {
    return {
      score: 25,
      warning: true,
      pattern: "Excesso de padrões",
      reason: "🎯 Muitos padrões simultâneos podem indicar ruído ou manipulação"
    };
  }

  // Verificar padrões específicos suspeitos
  const suspiciousPatterns = ['fake_breakout', 'bull_trap', 'bear_trap', 'pump_dump'];
  const hasSuspicious = patterns.some(p => 
    suspiciousPatterns.some(sp => p.toLowerCase().includes(sp))
  );

  if (hasSuspicious) {
    return {
      score: 35,
      warning: true,
      pattern: "Padrões de manipulação",
      reason: "🎭 Detectados padrões típicos de manipulação (traps, fake breakouts)"
    };
  }

  return {
    score: 0,
    warning: false,
    pattern: "",
    reason: ""
  };
};

// Análise de anomalias na confiança
const analyzeConfidenceAnomalies = (confidence: number, patternCount: number) => {
  // Confiança muito alta com poucos padrões
  if (confidence > 90 && patternCount < 2) {
    return {
      score: 30,
      warning: true,
      pattern: "Confiança anômala",
      reason: "🎲 Confiança muito alta com poucos padrões pode ser falso positivo"
    };
  }

  // Confiança perfeita (suspeita)
  if (confidence >= 98) {
    return {
      score: 20,
      warning: true,
      pattern: "Confiança perfeita",
      reason: "🎯 Confiança de 98%+ é estatisticamente suspeita"
    };
  }

  // Muitos padrões mas confiança baixa
  if (patternCount >= 4 && confidence < 60) {
    return {
      score: 15,
      warning: true,
      pattern: "Padrões inconsistentes",
      reason: "⚖️ Muitos padrões com baixa confiança indicam inconsistência"
    };
  }

  return {
    score: 0,
    warning: false,
    pattern: "",
    reason: ""
  };
};

// Determinar nível de risco
const determineRiskLevel = (score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
};

// Determinar recomendação final
const determineRecommendation = (score: number, signal: "BUY" | "SELL" | "WAIT"): 'PROCEED' | 'CAUTION' | 'ABORT' => {
  if (signal === "WAIT") return 'PROCEED'; // WAIT sempre é seguro
  
  if (score >= 70) return 'ABORT';   // Alto risco - abortar
  if (score >= 40) return 'CAUTION'; // Médio risco - cautela
  return 'PROCEED';                  // Baixo risco - prosseguir
};

export default detectMarketManipulation;