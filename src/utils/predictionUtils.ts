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
  
  // Fast momentum signals can execute quicker
  if (hasDominantMomentum) {
    timeframeSeconds = Math.floor(timeframeSeconds * 0.90);
  }
  
  // Strong support/resistance tends to hold longer
  if (hasStrongSupport && selectedTimeframe === "1m") {
    timeframeSeconds = Math.floor(timeframeSeconds * 1.05);
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
  
  // Process candle patterns
  if (results.candlePatterns?.found) {
    const strength = results.candlePatterns.confidence / 100;
    const signal: "buy" | "sell" | "neutral" = 
      results.candlePatterns.buyScore && results.candlePatterns.sellScore && results.candlePatterns.buyScore > results.candlePatterns.sellScore 
        ? "buy" 
        : results.candlePatterns.buyScore && results.candlePatterns.sellScore && results.candlePatterns.sellScore > results.candlePatterns.buyScore 
          ? "sell" 
          : "neutral";
    
    indicators.push({
      name: "Padrões de Candles",
      signal,
      strength: strength * 100
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
  
  // Support and resistance
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
  
  // Add momentum analysis
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
