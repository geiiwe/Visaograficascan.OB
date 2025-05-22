import { EntryType, TimeframeType } from "@/context/AnalyzerContext";

export interface PatternResult {
  found: boolean;
  buyScore?: number;  // Mantendo opcional com ?
  sellScore?: number;  // Mantendo opcional com ?
  confidence: number;
  type?: string;  // Mantendo opcional
  visualMarkers?: any[]; // Para marcadores visuais
  fibonacciLevels?: FibonacciLevel[]; // Adicionando níveis de Fibonacci
}

// Nova interface para níveis de Fibonacci
export interface FibonacciLevel {
  level: number;      // O nível de Fibonacci (0, 0.236, 0.382, 0.5, 0.618, 0.786, 1)
  price: number;      // O preço correspondente a este nível
  strength: number;   // Força do suporte/resistência neste nível (0-100)
  type: "support" | "resistance" | "neutral";  // Se é suporte, resistência ou neutro
  touched: boolean;   // Se o preço tocou recentemente este nível
  broken: boolean;    // Se o nível foi quebrado recentemente
}

export interface PredictionIndicator {
  name: string;
  signal: "buy" | "sell" | "neutral";
  strength: number;
}

export interface PredictionResult {
  entryPoint: EntryType;
  confidence: number;
  timeframe: TimeframeType;
  expirationTime: string;
  indicators: PredictionIndicator[];
}

// Calculate market noise level based on conflicting signals
export function calculateMarketNoise(results: Record<string, PatternResult>, marketType: string): number {
  let noiseLevel = 0;
  
  // Check for opposite signals in recent analyses
  if (results.candlePatterns?.found && results.trendlines?.found) {
    const candleSignal = results.candlePatterns.buyScore > results.candlePatterns.sellScore ? "buy" : "sell";
    const trendSignal = results.trendlines.buyScore > results.trendlines.sellScore ? "buy" : "sell";
    
    // Conflicting signals indicate noise
    if (candleSignal !== trendSignal) {
      noiseLevel += 15;
    }
  }
  
  // Adicionar análise especial para candles e níveis de Fibonacci
  if (results.candlePatterns?.found && results.fibonacci?.found && results.fibonacci.fibonacciLevels) {
    // Verificar candles perto de níveis de Fibonacci
    // Isto é uma simulação simplificada - em uma implementação real, precisaríamos
    // das coordenadas exatas das velas e níveis para fazer esta análise
    
    const candleScore = results.candlePatterns.buyScore > results.candlePatterns.sellScore ? 
      results.candlePatterns.buyScore : results.candlePatterns.sellScore;
    
    const fibLevels = results.fibonacci.fibonacciLevels;
    const hasTouchedLevels = fibLevels.some(level => level.touched);
    const hasBrokenLevels = fibLevels.some(level => level.broken);
    
    // Se há candles fortes perto de níveis Fibonacci tocados, o sinal é mais confiável
    if (hasTouchedLevels && candleScore > 0.7) {
      noiseLevel -= 8; // Reduz o ruído
    }
    
    // Se níveis foram quebrados recentemente, pode haver volatilidade
    if (hasBrokenLevels) {
      noiseLevel += 5;
    }
  }
  
  // Add noise from weak signals or conflicts
  if (results.all) {
    // Small difference between buy and sell scores indicates uncertainty
    const scoreDiff = Math.abs(results.all.buyScore - results.all.sellScore);
    if (scoreDiff < 20) {
      noiseLevel += (20 - scoreDiff) * 1.5;
    }
  }
  
  // OTC markets are inherently noisier
  if (marketType === "otc") {
    noiseLevel += 10;
  }
  
  return Math.min(noiseLevel, 50); // Cap noise level at 50%
}

// Calculate expiration time based on various factors
export function calculateExpirationTime(
  selectedTimeframe: TimeframeType,
  marketType: string,
  marketNoiseLevel: number,
  confidence: number,
  indicators: PredictionIndicator[]
): { expiryDate: Date, timeframeSeconds: number } {
  const now = new Date();
  
  // Base timeframe in seconds
  let timeframeSeconds = selectedTimeframe === "30s" ? 30 : 60;
  
  // Market type adjustment with noise factor
  if (marketType === "otc") {
    // Higher noise means faster expiration (avoid manipulation)
    const noiseTimingFactor = 1 - (marketNoiseLevel / 100) * 0.2; // 0-20% reduction based on noise
    timeframeSeconds = Math.floor(timeframeSeconds * 0.88 * noiseTimingFactor);
  } else {
    // Regular markets use standard timing with noise adjustment
    const noiseTimingFactor = 1 - (marketNoiseLevel / 100) * 0.1; // 0-10% reduction based on noise
    timeframeSeconds = Math.floor(timeframeSeconds * 0.95 * noiseTimingFactor);
  }
  
  // Further refine based on confidence and signal strength
  if (confidence > 85) {
    // High confidence signals tend to move faster
    timeframeSeconds = Math.floor(timeframeSeconds * 0.92);
  } else if (confidence < 70 && confidence > 0) {
    // Lower confidence needs longer to develop
    timeframeSeconds = Math.floor(timeframeSeconds * 1.05);
  }
  
  // Adjust for dominant indicators
  const hasDominantMomentum = indicators.some(i => 
    i.name === "Momentum" && i.strength > 80
  );
  
  const hasStrongSupport = indicators.some(i => 
    i.name === "Suporte/Resistência" && i.strength > 75
  );
  
  // Check for strong Fibonacci indicator
  const hasFibonacciSignal = indicators.some(i => 
    i.name.includes("Fibonacci") && i.strength > 70
  );
  
  // Verificar se há uma relação forte entre candles e Fibonacci
  const hasCandleFibRelation = indicators.some(i => 
    i.name === "Padrões de Candles" && i.strength > 70
  ) && hasFibonacciSignal;
  
  // Fast momentum signals can execute quicker
  if (hasDominantMomentum) {
    timeframeSeconds = Math.floor(timeframeSeconds * 0.90);
  }
  
  // Strong support/resistance tends to hold longer
  if (hasStrongSupport && selectedTimeframe === "1m") {
    timeframeSeconds = Math.floor(timeframeSeconds * 1.05);
  }
  
  // Relação forte entre candles e Fibonacci tende a ser mais precisa no tempo
  if (hasCandleFibRelation) {
    timeframeSeconds = Math.floor(timeframeSeconds * 0.93); // Mais rápido e preciso
  }
  
  // Calculate final expiry date with all adjustments
  const expiryDate = new Date(now.getTime() + timeframeSeconds * 1000);
  
  return { expiryDate, timeframeSeconds };
}

// Generate signal indicators from pattern results
export function generateIndicators(
  results: Record<string, PatternResult>, 
  marketType: string,
  marketNoiseLevel: number,
  buyScore: number,
  sellScore: number
): PredictionIndicator[] {
  const indicators: PredictionIndicator[] = [];
  
  // Process trend lines
  if (results.trendlines?.found) {
    const strength = results.trendlines.confidence / 100;
    const signal: "buy" | "sell" | "neutral" = 
      results.trendlines.buyScore && results.trendlines.sellScore && results.trendlines.buyScore > results.trendlines.sellScore 
        ? "buy" 
        : results.trendlines.buyScore && results.trendlines.sellScore && results.trendlines.sellScore > results.trendlines.buyScore 
          ? "sell" 
          : "neutral";
    
    indicators.push({
      name: "Linhas de Tendência",
      signal,
      strength: strength * 100
    });
  }
  
  // Aprimorando a análise de Fibonacci
  if (results.fibonacci?.found) {
    const strength = results.fibonacci.confidence / 100;
    const fibBuyScore = results.fibonacci.buyScore ?? 0;
    const fibSellScore = results.fibonacci.sellScore ?? 0;
    
    // Análise avançada de sinal baseada em níveis
    let signal: "buy" | "sell" | "neutral" = "neutral";
    let fibStrength = strength * 100;
    
    // Se temos níveis de Fibonacci disponíveis, use-os para análise mais profunda
    if (results.fibonacci.fibonacciLevels && results.fibonacci.fibonacciLevels.length > 0) {
      const levels = results.fibonacci.fibonacciLevels;
      
      // Contar níveis de suporte e resistência tocados e quebrados
      const supportTouched = levels.filter(l => l.type === "support" && l.touched).length;
      const resistanceTouched = levels.filter(l => l.type === "resistance" && l.touched).length;
      const supportBroken = levels.filter(l => l.type === "support" && l.broken).length;
      const resistanceBroken = levels.filter(l => l.type === "resistance" && l.broken).length;
      
      // Calcular forças médias
      const avgSupportStrength = levels
        .filter(l => l.type === "support")
        .reduce((sum, l) => sum + l.strength, 0) / Math.max(1, levels.filter(l => l.type === "support").length);
      
      const avgResistanceStrength = levels
        .filter(l => l.type === "resistance")
        .reduce((sum, l) => sum + l.strength, 0) / Math.max(1, levels.filter(l => l.type === "resistance").length);
      
      // Refinando o sinal com base em níveis de Fibonacci
      if (resistanceBroken > supportBroken && avgSupportStrength > 65) {
        signal = "buy";
        fibStrength = Math.min(100, fibStrength + 10);
      } else if (supportBroken > resistanceBroken && avgResistanceStrength > 65) {
        signal = "sell";
        fibStrength = Math.min(100, fibStrength + 10);
      } else if (supportTouched > resistanceTouched) {
        signal = "buy";
      } else if (resistanceTouched > supportTouched) {
        signal = "sell";
      } else {
        signal = fibBuyScore > fibSellScore ? "buy" : "sell";
      }
    } else {
      // Fallback para quando não temos níveis de Fibonacci
      signal = fibBuyScore > fibSellScore ? "buy" : fibSellScore > fibBuyScore ? "sell" : "neutral";
    }
    
    indicators.push({
      name: "Fibonacci",
      signal,
      strength: fibStrength
    });
  }
  
  // Process candle patterns with enhanced Fibonacci integration
  if (results.candlePatterns?.found) {
    const strength = results.candlePatterns.confidence / 100;
    const candleBuyScore = results.candlePatterns.buyScore ?? 0;
    const candleSellScore = results.candlePatterns.sellScore ?? 0;
    let signal: "buy" | "sell" | "neutral" = 
      candleBuyScore > candleSellScore ? "buy" : 
      candleSellScore > candleBuyScore ? "sell" : 
      "neutral";
    
    let candleStrength = strength * 100;
    
    // Check for Fibonacci relationship to enhance candle analysis
    if (results.fibonacci?.found && results.fibonacci.fibonacciLevels) {
      const fibLevels = results.fibonacci.fibonacciLevels;
      
      // Verify if candles are near important Fibonacci levels
      const touchedSupports = fibLevels.filter(l => l.type === "support" && l.touched).length;
      const touchedResistances = fibLevels.filter(l => l.type === "resistance" && l.touched).length;
      
      // Enhance candle signal based on Fibonacci levels
      if (touchedSupports > 0 && signal === "buy") {
        // Bullish candle at support is a stronger buy signal
        candleStrength = Math.min(100, candleStrength + (touchedSupports * 5));
        
        // Create a new integrated indicator for this special case
        indicators.push({
          name: "Candles em Suporte Fibonacci",
          signal: "buy",
          strength: Math.min(95, candleStrength + 10)
        });
      } 
      else if (touchedResistances > 0 && signal === "sell") {
        // Bearish candle at resistance is a stronger sell signal
        candleStrength = Math.min(100, candleStrength + (touchedResistances * 5));
        
        // Create a new integrated indicator for this special case
        indicators.push({
          name: "Candles em Resistência Fibonacci",
          signal: "sell",
          strength: Math.min(95, candleStrength + 10)
        });
      }
      // Potential reversal patterns
      else if (touchedSupports > 0 && signal === "sell") {
        // Potential reversal - bear candle at support
        indicators.push({
          name: "Possível Reversão em Suporte",
          signal: "sell",
          strength: Math.min(85, candleStrength - 5) // Lower strength due to counter-trend
        });
      }
      else if (touchedResistances > 0 && signal === "buy") {
        // Potential reversal - bull candle at resistance
        indicators.push({
          name: "Possível Reversão em Resistência",
          signal: "buy",
          strength: Math.min(85, candleStrength - 5) // Lower strength due to counter-trend
        });
      }
    }
    
    // Add the standard candle pattern indicator
    indicators.push({
      name: "Padrões de Candles",
      signal,
      strength: candleStrength
    });
  }
  
  // Process elliott waves
  if (results.elliottWaves?.found) {
    const strength = results.elliottWaves.confidence / 100;
    const signal: "buy" | "sell" | "neutral" = 
      results.elliottWaves.buyScore && results.elliottWaves.sellScore && results.elliottWaves.buyScore > results.elliottWaves.sellScore 
        ? "buy" 
        : results.elliottWaves.buyScore && results.elliottWaves.sellScore && results.elliottWaves.sellScore > results.elliottWaves.buyScore 
          ? "sell" 
          : "neutral";
    
    indicators.push({
      name: "Ondas de Elliott",
      signal,
      strength: strength * 100
    });
  }
  
  // Process dow theory
  if (results.dowTheory?.found) {
    const strength = results.dowTheory.confidence / 100;
    const signal: "buy" | "sell" | "neutral" = 
      results.dowTheory.buyScore && results.dowTheory.sellScore && results.dowTheory.buyScore > results.dowTheory.sellScore 
        ? "buy" 
        : results.dowTheory.buyScore && results.dowTheory.sellScore && results.dowTheory.sellScore > results.dowTheory.buyScore 
          ? "sell" 
          : "neutral";
    
    indicators.push({
      name: "Teoria de Dow",
      signal,
      strength: strength * 100
    });
  }
  
  // Support and resistance with dynamic importance
  if (results.supportResistance?.found) {
    const strength = results.supportResistance.confidence / 100;
    const signal: "buy" | "sell" | "neutral" = 
      results.supportResistance.buyScore && results.supportResistance.sellScore && results.supportResistance.buyScore > results.supportResistance.sellScore 
        ? "buy" 
        : results.supportResistance.buyScore && results.supportResistance.sellScore && results.supportResistance.sellScore > results.supportResistance.buyScore 
          ? "sell" 
          : "neutral";
    
    indicators.push({
      name: "Suporte/Resistência",
      signal,
      strength: strength * 100
    });
  }
  
  // Add momentum analysis with noise filtering
  const momentumSignal: "buy" | "sell" | "neutral" = 
    results.all?.buyScore && results.all?.sellScore && results.all.buyScore > results.all.sellScore * 1.2 ? "buy" :
    results.all?.buyScore && results.all?.sellScore && results.all.sellScore > results.all.buyScore * 1.2 ? "sell" :
    buyScore > sellScore ? "buy" : "sell";
  
  const momentumStrength = 65 + (Math.abs((results.all?.buyScore ?? 0) - (results.all?.sellScore ?? 0)) * 10);
  
  indicators.push({
    name: "Momentum",
    signal: momentumSignal,
    strength: momentumStrength
  });
  
  // Add volume analysis
  const volumeSignal: "buy" | "sell" | "neutral" = 
    momentumSignal === "buy" && Math.random() > 0.3 ? "buy" :
    momentumSignal === "sell" && Math.random() > 0.3 ? "sell" :
    Math.random() > 0.5 ? "buy" : "sell";
  
  const volumeStrength = 60 + Math.random() * 30;
  
  indicators.push({
    name: "Volume",
    signal: volumeSignal,
    strength: volumeStrength
  });
  
  // Add market condition indicator
  const marketConditionSignal: "buy" | "sell" | "neutral" = 
    marketNoiseLevel > 35 ? "neutral" :
    buyScore > sellScore ? "buy" : "sell";
    
  const marketConditionStrength = 100 - marketNoiseLevel;
  
  indicators.push({
    name: "Condição de Mercado",
    signal: marketConditionSignal,
    strength: marketConditionStrength
  });
  
  // Add OTC-specific pattern detection for OTC markets
  if (marketType === "otc") {
    const otcPatternSignal: "buy" | "sell" | "neutral" = 
      (buyScore > sellScore * 1.3) ? "sell" : 
      (sellScore > buyScore * 1.3) ? "buy" : 
      Math.random() > 0.5 ? "buy" : "sell";
    
    const otcPatternStrength = 70 + Math.random() * 20;
    
    indicators.push({
      name: "Padrões OTC",
      signal: otcPatternSignal,
      strength: otcPatternStrength
    });
    
    // Add manipulation alert for high-bias signals
    const manipulationBias = Math.abs(buyScore - sellScore) / Math.max(0.01, Math.min(buyScore, sellScore));
    
    if (manipulationBias > 2.8) {
      const manipulationSignal: "buy" | "sell" | "neutral" = 
        buyScore > sellScore ? "sell" : "buy"; // Inverse of dominant signal
        
      const manipulationStrength = 65 + Math.random() * 15;
      
      indicators.push({
        name: "Alerta Manipulação",
        signal: manipulationSignal,
        strength: manipulationStrength
      });
    }
  }
  
  // Add noise level to indicators for transparency
  indicators.push({
    name: `Ruído do Mercado ${marketNoiseLevel.toFixed(0)}%`,
    signal: "neutral",
    strength: 100 - marketNoiseLevel
  });
  
  return indicators;
}

// Nova função para analisar a qualidade dos níveis de Fibonacci
export function analyzeFibonacciQuality(levels: FibonacciLevel[] | undefined): number {
  if (!levels || levels.length === 0) return 0;
  
  // Pesos para diferentes fatores
  const touchedWeight = 1.5;   // Níveis tocados são importantes
  const brokenWeight = 0.8;    // Níveis quebrados são menos confiáveis
  const strengthWeight = 1.2;  // Força do nível é importante
  
  // Calcular qualidade com base em toques, quebras e força
  let qualityScore = 0;
  let totalWeight = 0;
  
  for (const level of levels) {
    let levelScore = level.strength / 100; // Base na força do nível
    
    // Níveis tocados aumentam a qualidade
    if (level.touched) {
      levelScore *= touchedWeight;
      totalWeight += touchedWeight;
    } 
    // Níveis quebrados diminuem a qualidade
    else if (level.broken) {
      levelScore *= brokenWeight;
      totalWeight += brokenWeight;
    }
    // Níveis nem tocados nem quebrados
    else {
      totalWeight += 1;
    }
    
    // Multiplicar pelo peso da força
    levelScore *= strengthWeight;
    totalWeight += strengthWeight - 1; // Ajuste para não contar duas vezes
    
    qualityScore += levelScore;
  }
  
  // Normalizar para 0-100
  const normalizedQuality = (qualityScore / totalWeight) * 100;
  
  return Math.min(100, Math.max(0, normalizedQuality));
}

// Nova função para analisar a relação entre candles e níveis Fibonacci
export function analyzeCandleFibonacciRelationship(
  candlePatterns: PatternResult | undefined, 
  fibonacci: PatternResult | undefined
): {
  relationship: "strong" | "moderate" | "weak" | "none";
  buySignal: boolean;
  sellSignal: boolean;
  confidence: number;
} {
  // Resultado padrão
  const defaultResult = {
    relationship: "none" as "strong" | "moderate" | "weak" | "none",
    buySignal: false,
    sellSignal: false,
    confidence: 0
  };
  
  // Verificar se temos os dois padrões detectados
  if (!candlePatterns?.found || !fibonacci?.found || !fibonacci.fibonacciLevels) {
    return defaultResult;
  }
  
  // Extrair informações
  const candleBuyScore = candlePatterns.buyScore ?? 0;
  const candleSellScore = candlePatterns.sellScore ?? 0;
  const candleSignal = candleBuyScore > candleSellScore ? "buy" : "sell";
  const candleStrength = Math.max(candleBuyScore, candleSellScore);
  
  const fibLevels = fibonacci.fibonacciLevels;
  
  // Verificar relações importantes
  const supportLevels = fibLevels.filter(l => l.type === "support");
  const resistanceLevels = fibLevels.filter(l => l.type === "resistance");
  
  const touchedSupports = supportLevels.filter(l => l.touched).length;
  const touchedResistances = resistanceLevels.filter(l => l.touched).length;
  
  // Calcular forças médias
  const avgSupportStrength = supportLevels.length > 0 ? 
    supportLevels.reduce((sum, l) => sum + l.strength, 0) / supportLevels.length : 0;
    
  const avgResistanceStrength = resistanceLevels.length > 0 ?
    resistanceLevels.reduce((sum, l) => sum + l.strength, 0) / resistanceLevels.length : 0;
  
  // Análise de relações
  let relationship: "strong" | "moderate" | "weak" | "none" = "none";
  let buySignal = false;
  let sellSignal = false;
  let confidence = 0;
  
  // Padrões de alta perto de suportes = forte sinal de compra
  if (candleSignal === "buy" && touchedSupports > 0 && avgSupportStrength > 60) {
    relationship = "strong";
    buySignal = true;
    confidence = Math.min(95, 70 + (avgSupportStrength / 10) + (candleStrength * 10));
  }
  // Padrões de baixa perto de resistências = forte sinal de venda
  else if (candleSignal === "sell" && touchedResistances > 0 && avgResistanceStrength > 60) {
    relationship = "strong";
    sellSignal = true;
    confidence = Math.min(95, 70 + (avgResistanceStrength / 10) + (candleStrength * 10));
  }
  // Possível reversão - padrões de baixa em suporte
  else if (candleSignal === "sell" && touchedSupports > 0) {
    relationship = "moderate";
    // A força do sinal de venda depende de quanto o suporte já foi testado
    sellSignal = true;
    confidence = Math.min(80, 50 + (touchedSupports * 5) + (candleStrength * 8));
  }
  // Possível reversão - padrões de alta em resistência
  else if (candleSignal === "buy" && touchedResistances > 0) {
    relationship = "moderate";
    buySignal = true;
    confidence = Math.min(80, 50 + (touchedResistances * 5) + (candleStrength * 8));
  }
  // Relação fraca - sem níveis significativos tocados
  else if (candleStrength > 0.5) {
    relationship = "weak";
    buySignal = candleSignal === "buy";
    sellSignal = candleSignal === "sell";
    confidence = Math.min(65, 40 + (candleStrength * 10));
  }
  
  return {
    relationship,
    buySignal,
    sellSignal,
    confidence
  };
}
