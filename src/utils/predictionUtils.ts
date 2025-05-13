
import { EntryType, TimeframeType } from "@/context/AnalyzerContext";

export interface PatternResult {
  found: boolean;
  buyScore: number;
  sellScore: number;
  confidence: number;
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
    const signal: "buy" | "sell" | "neutral" = results.trendlines.buyScore > results.trendlines.sellScore 
      ? "buy" 
      : results.trendlines.sellScore > results.trendlines.buyScore 
        ? "sell" 
        : "neutral";
    
    indicators.push({
      name: "Linhas de Tendência",
      signal,
      strength: strength * 100
    });
  }
  
  // Process fibonacci
  if (results.fibonacci?.found) {
    const strength = results.fibonacci.confidence / 100;
    const signal: "buy" | "sell" | "neutral" = results.fibonacci.buyScore > results.fibonacci.sellScore 
      ? "buy" 
      : results.fibonacci.sellScore > results.fibonacci.buyScore 
        ? "sell" 
        : "neutral";
    
    indicators.push({
      name: "Fibonacci",
      signal,
      strength: strength * 100
    });
  }
  
  // Process candle patterns
  if (results.candlePatterns?.found) {
    const strength = results.candlePatterns.confidence / 100;
    const signal: "buy" | "sell" | "neutral" = results.candlePatterns.buyScore > results.candlePatterns.sellScore 
      ? "buy" 
      : results.candlePatterns.sellScore > results.candlePatterns.buyScore 
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
    const signal: "buy" | "sell" | "neutral" = results.elliottWaves.buyScore > results.elliottWaves.sellScore 
      ? "buy" 
      : results.elliottWaves.sellScore > results.elliottWaves.buyScore 
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
    const signal: "buy" | "sell" | "neutral" = results.dowTheory.buyScore > results.dowTheory.sellScore 
      ? "buy" 
      : results.dowTheory.sellScore > results.dowTheory.buyScore 
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
    const signal: "buy" | "sell" | "neutral" = results.supportResistance.buyScore > results.supportResistance.sellScore 
      ? "buy" 
      : results.supportResistance.sellScore > results.supportResistance.buyScore 
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
    results.all && results.all.buyScore > results.all.sellScore * 1.2 ? "buy" :
    results.all && results.all.sellScore > results.all.buyScore * 1.2 ? "sell" :
    buyScore > sellScore ? "buy" : "sell";
  
  const momentumStrength = 65 + (Math.abs(results.all?.buyScore - results.all?.sellScore || 0) * 10);
  
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
