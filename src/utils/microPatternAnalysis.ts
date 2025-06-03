
/**
 * Análise de Micro Padrões para Trading de Curto Prazo
 * Foca em consolidações, tamanho de velas, retrações, falsos rompimentos
 * e timing preciso para entrada em operações
 */

export interface MicroPatternResult {
  type: "micro_consolidation" | "candle_size" | "retracement" | "false_breakout" | 
        "candle_peak" | "support_rejection" | "resistance_rejection" | "timing_analysis";
  found: boolean;
  strength: number; // 0-100
  direction: "up" | "down" | "neutral";
  confidence: number; // 0-100
  timing: "immediate" | "wait" | "expired";
  details: {
    pattern: string;
    entry_point?: number;
    stop_loss?: number;
    take_profit?: number;
    timeframe_validity: string; // "30s", "1m", "5m" etc
    risk_level: "low" | "medium" | "high";
  };
}

export interface TimingAnalysis {
  optimal_entry: boolean;
  time_remaining: number; // segundos até expiração do sinal
  market_momentum: "accelerating" | "stable" | "decelerating";
  volume_confirmation: boolean;
  trend_alignment: boolean;
}

// Análise de Micro Consolidações
export const analyzeMicroConsolidations = (
  priceData: number[],
  timeframe: string
): MicroPatternResult => {
  console.log("Analisando micro consolidações...");
  
  if (priceData.length < 10) {
    return {
      type: "micro_consolidation",
      found: false,
      strength: 0,
      direction: "neutral",
      confidence: 0,
      timing: "expired",
      details: {
        pattern: "insufficient_data",
        timeframe_validity: timeframe,
        risk_level: "high"
      }
    };
  }
  
  // Detectar consolidação em janela pequena (últimas 5-8 velas)
  const recentData = priceData.slice(-8);
  const high = Math.max(...recentData);
  const low = Math.min(...recentData);
  const range = high - low;
  const avgPrice = recentData.reduce((a, b) => a + b, 0) / recentData.length;
  const volatility = range / avgPrice;
  
  // Micro consolidação detectada se volatilidade < 1%
  if (volatility < 0.01) {
    const direction = recentData[recentData.length - 1] > avgPrice ? "up" : "down";
    const strength = Math.min(90, 60 + (1 - volatility) * 3000);
    
    return {
      type: "micro_consolidation",
      found: true,
      strength,
      direction,
      confidence: 85,
      timing: timeframe === "30s" ? "immediate" : "wait",
      details: {
        pattern: "tight_consolidation",
        entry_point: direction === "up" ? high + (range * 0.1) : low - (range * 0.1),
        stop_loss: direction === "up" ? low - (range * 0.2) : high + (range * 0.2),
        take_profit: direction === "up" ? high + (range * 0.5) : low - (range * 0.5),
        timeframe_validity: timeframe,
        risk_level: "low"
      }
    };
  }
  
  return {
    type: "micro_consolidation",
    found: false,
    strength: 0,
    direction: "neutral",
    confidence: 0,
    timing: "expired",
    details: {
      pattern: "no_consolidation",
      timeframe_validity: timeframe,
      risk_level: "high"
    }
  };
};

// Análise de Tamanho de Velas
export const analyzeCandleSize = (
  priceData: number[],
  volumeData?: number[]
): MicroPatternResult => {
  console.log("Analisando tamanho de velas...");
  
  if (priceData.length < 5) {
    return {
      type: "candle_size",
      found: false,
      strength: 0,
      direction: "neutral",
      confidence: 0,
      timing: "expired",
      details: {
        pattern: "insufficient_data",
        timeframe_validity: "unknown",
        risk_level: "high"
      }
    };
  }
  
  // Analisar as últimas 3 velas
  const recent = priceData.slice(-3);
  const ranges = recent.slice(1).map((price, i) => Math.abs(price - recent[i]));
  const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
  const lastRange = ranges[ranges.length - 1];
  
  // Vela grande se for > 150% da média
  if (lastRange > avgRange * 1.5) {
    const direction = recent[recent.length - 1] > recent[recent.length - 2] ? "up" : "down";
    const strength = Math.min(95, 70 + (lastRange / avgRange - 1.5) * 50);
    
    return {
      type: "candle_size",
      found: true,
      strength,
      direction,
      confidence: 80,
      timing: "immediate",
      details: {
        pattern: "large_candle",
        timeframe_validity: "30s",
        risk_level: "medium"
      }
    };
  }
  
  return {
    type: "candle_size",
    found: false,
    strength: 0,
    direction: "neutral",
    confidence: 0,
    timing: "expired",
    details: {
      pattern: "normal_candle",
      timeframe_validity: "unknown",
      risk_level: "medium"
    }
  };
};

// Análise de Retrações
export const analyzeRetracements = (
  priceData: number[],
  timeframe: string
): MicroPatternResult => {
  console.log("Analisando retrações...");
  
  if (priceData.length < 15) {
    return {
      type: "retracement",
      found: false,
      strength: 0,
      direction: "neutral",
      confidence: 0,
      timing: "expired",
      details: {
        pattern: "insufficient_data",
        timeframe_validity: timeframe,
        risk_level: "high"
      }
    };
  }
  
  // Identificar tendência principal e retração
  const fullData = priceData;
  const recentData = priceData.slice(-8);
  
  const mainTrendStart = fullData[0];
  const mainTrendEnd = fullData[Math.floor(fullData.length * 0.7)];
  const currentPrice = recentData[recentData.length - 1];
  
  const mainDirection = mainTrendEnd > mainTrendStart ? "up" : "down";
  const retracePercent = mainDirection === "up" ? 
    (mainTrendEnd - currentPrice) / (mainTrendEnd - mainTrendStart) :
    (currentPrice - mainTrendEnd) / (mainTrendStart - mainTrendEnd);
  
  // Retração ideal entre 38.2% e 61.8% (Fibonacci)
  if (retracePercent >= 0.382 && retracePercent <= 0.618) {
    const strength = 85 - Math.abs(retracePercent - 0.5) * 100;
    
    return {
      type: "retracement",
      found: true,
      strength,
      direction: mainDirection,
      confidence: 88,
      timing: retracePercent > 0.55 ? "immediate" : "wait",
      details: {
        pattern: `fibonacci_retracement_${Math.round(retracePercent * 100)}%`,
        entry_point: currentPrice,
        stop_loss: mainDirection === "up" ? 
          currentPrice - (mainTrendEnd - mainTrendStart) * 0.1 :
          currentPrice + (mainTrendStart - mainTrendEnd) * 0.1,
        timeframe_validity: timeframe,
        risk_level: "low"
      }
    };
  }
  
  return {
    type: "retracement",
    found: false,
    strength: 0,
    direction: "neutral",
    confidence: 0,
    timing: "expired",
    details: {
      pattern: "no_valid_retracement",
      timeframe_validity: timeframe,
      risk_level: "high"
    }
  };
};

// Análise de Falsos Rompimentos
export const analyzeFalseBreakouts = (
  priceData: number[],
  supportResistanceLevels: Array<{level: number, type: "support" | "resistance"}>
): MicroPatternResult => {
  console.log("Analisando falsos rompimentos...");
  
  if (priceData.length < 10 || supportResistanceLevels.length === 0) {
    return {
      type: "false_breakout",
      found: false,
      strength: 0,
      direction: "neutral",
      confidence: 0,
      timing: "expired",
      details: {
        pattern: "insufficient_data",
        timeframe_validity: "unknown",
        risk_level: "high"
      }
    };
  }
  
  const recentData = priceData.slice(-5);
  const currentPrice = recentData[recentData.length - 1];
  const previousPrice = recentData[recentData.length - 2];
  
  // Verificar se houve rompimento seguido de retorno
  for (const level of supportResistanceLevels) {
    const tolerance = Math.abs(level.level) * 0.001; // 0.1% tolerance
    
    if (level.type === "resistance") {
      // Falso rompimento de resistência
      if (previousPrice > level.level + tolerance && currentPrice < level.level) {
        return {
          type: "false_breakout",
          found: true,
          strength: 82,
          direction: "down",
          confidence: 85,
          timing: "immediate",
          details: {
            pattern: "false_resistance_breakout",
            entry_point: currentPrice,
            stop_loss: level.level + tolerance * 2,
            take_profit: level.level - (level.level - Math.min(...recentData)) * 0.5,
            timeframe_validity: "30s",
            risk_level: "medium"
          }
        };
      }
    } else {
      // Falso rompimento de suporte
      if (previousPrice < level.level - tolerance && currentPrice > level.level) {
        return {
          type: "false_breakout",
          found: true,
          strength: 82,
          direction: "up",
          confidence: 85,
          timing: "immediate",
          details: {
            pattern: "false_support_breakout",
            entry_point: currentPrice,
            stop_loss: level.level - tolerance * 2,
            take_profit: level.level + (Math.max(...recentData) - level.level) * 0.5,
            timeframe_validity: "30s",
            risk_level: "medium"
          }
        };
      }
    }
  }
  
  return {
    type: "false_breakout",
    found: false,
    strength: 0,
    direction: "neutral",
    confidence: 0,
    timing: "expired",
    details: {
      pattern: "no_false_breakout",
      timeframe_validity: "unknown",
      risk_level: "low"
    }
  };
};

// Análise de Timing Preciso
export const analyzeOptimalTiming = (
  patterns: MicroPatternResult[],
  marketConditions: {
    volatility: number;
    momentum: number;
    volume: number;
  }
): TimingAnalysis => {
  console.log("Analisando timing ótimo para entrada...");
  
  const validPatterns = patterns.filter(p => p.found && p.confidence > 70);
  
  if (validPatterns.length === 0) {
    return {
      optimal_entry: false,
      time_remaining: 0,
      market_momentum: "stable",
      volume_confirmation: false,
      trend_alignment: false
    };
  }
  
  // Verificar alinhamento de padrões
  const directions = validPatterns.map(p => p.direction);
  const mainDirection = directions.filter(d => d === "up").length > directions.filter(d => d === "down").length ? "up" : "down";
  const alignment = directions.filter(d => d === mainDirection).length / directions.length;
  
  // Calcular momentum
  const momentum = marketConditions.momentum > 0.7 ? "accelerating" : 
                   marketConditions.momentum > 0.3 ? "stable" : "decelerating";
  
  // Timing ótimo se:
  // 1. Alinhamento > 70%
  // 2. Pelo menos um padrão com timing "immediate"
  // 3. Momentum favorável
  const immediatePatterns = validPatterns.filter(p => p.timing === "immediate");
  const optimalEntry = alignment > 0.7 && immediatePatterns.length > 0 && momentum !== "decelerating";
  
  // Calcular tempo restante baseado no padrão mais urgente
  const timeRemaining = optimalEntry ? 30 : 0; // 30 segundos para entrada
  
  return {
    optimal_entry: optimalEntry,
    time_remaining: timeRemaining,
    market_momentum: momentum,
    volume_confirmation: marketConditions.volume > 0.6,
    trend_alignment: alignment > 0.7
  };
};

// Função principal de análise micro
export const performMicroPatternAnalysis = (
  priceData: number[],
  supportResistanceLevels: Array<{level: number, type: "support" | "resistance"}>,
  timeframe: string,
  marketConditions: {
    volatility: number;
    momentum: number;
    volume: number;
  }
): {
  patterns: MicroPatternResult[];
  timing: TimingAnalysis;
  recommendation: {
    action: "BUY" | "SELL" | "WAIT";
    confidence: number;
    reasoning: string;
  };
} => {
  console.log("Executando análise completa de micro padrões...");
  
  const patterns: MicroPatternResult[] = [
    analyzeMicroConsolidations(priceData, timeframe),
    analyzeCandleSize(priceData),
    analyzeRetracements(priceData, timeframe),
    analyzeFalseBreakouts(priceData, supportResistanceLevels)
  ];
  
  const timing = analyzeOptimalTiming(patterns, marketConditions);
  
  // Gerar recomendação final
  const validPatterns = patterns.filter(p => p.found && p.confidence > 70);
  
  let recommendation: {
    action: "BUY" | "SELL" | "WAIT";
    confidence: number;
    reasoning: string;
  };
  
  if (timing.optimal_entry && validPatterns.length > 0) {
    const directions = validPatterns.map(p => p.direction);
    const buySignals = directions.filter(d => d === "up").length;
    const sellSignals = directions.filter(d => d === "down").length;
    
    if (buySignals > sellSignals) {
      const avgConfidence = validPatterns.reduce((sum, p) => sum + p.confidence, 0) / validPatterns.length;
      recommendation = {
        action: "BUY",
        confidence: Math.round(avgConfidence),
        reasoning: `${validPatterns.length} padrões bullish detectados com timing ótimo`
      };
    } else if (sellSignals > buySignals) {
      const avgConfidence = validPatterns.reduce((sum, p) => sum + p.confidence, 0) / validPatterns.length;
      recommendation = {
        action: "SELL",
        confidence: Math.round(avgConfidence),
        reasoning: `${validPatterns.length} padrões bearish detectados com timing ótimo`
      };
    } else {
      recommendation = {
        action: "WAIT",
        confidence: 50,
        reasoning: "Sinais conflitantes detectados"
      };
    }
  } else {
    recommendation = {
      action: "WAIT",
      confidence: 30,
      reasoning: timing.optimal_entry ? "Padrões insuficientes" : "Timing não favorável"
    };
  }
  
  return {
    patterns,
    timing,
    recommendation
  };
};
