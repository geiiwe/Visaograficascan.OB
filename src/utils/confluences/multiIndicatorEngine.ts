
/**
 * Motor de Confluências Multi-Indicadores
 * Baseado em Alexander Elder, John Murphy, e Martin Pring
 */

export interface IndicatorSignal {
  name: string;
  value: number;
  signal: "BUY" | "SELL" | "NEUTRAL";
  strength: number; // 0-100
  timeframe: string;
  confluence: boolean;
}

export interface ConfluenceAnalysis {
  totalScore: number;
  bullishSignals: IndicatorSignal[];
  bearishSignals: IndicatorSignal[];
  neutralSignals: IndicatorSignal[];
  majorConfluences: number;
  recommendation: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  reliability: number;
}

// Sistema de múltiplos indicadores baseado em Elder e Murphy
export const analyzeMultipleIndicators = (
  priceData: number[],
  volumeData: number[],
  timeframe: string
): ConfluenceAnalysis => {
  const signals: IndicatorSignal[] = [];
  
  // 1. MOVING AVERAGES (Trend Following)
  signals.push(...analyzeMovingAverages(priceData, timeframe));
  
  // 2. MOMENTUM INDICATORS
  signals.push(...analyzeMomentumIndicators(priceData, timeframe));
  
  // 3. VOLUME INDICATORS
  signals.push(...analyzeVolumeIndicators(priceData, volumeData, timeframe));
  
  // 4. VOLATILITY INDICATORS
  signals.push(...analyzeVolatilityIndicators(priceData, timeframe));
  
  // 5. SUPPORT/RESISTANCE LEVELS
  signals.push(...analyzeSupportResistance(priceData, timeframe));
  
  // Calcular confluências
  const bullishSignals = signals.filter(s => s.signal === "BUY");
  const bearishSignals = signals.filter(s => s.signal === "SELL");
  const neutralSignals = signals.filter(s => s.signal === "NEUTRAL");
  
  const bullishScore = bullishSignals.reduce((sum, s) => sum + s.strength, 0);
  const bearishScore = bearishSignals.reduce((sum, s) => sum + s.strength, 0);
  
  const totalScore = bullishScore - bearishScore;
  const majorConfluences = signals.filter(s => s.confluence && s.strength > 70).length;
  
  let recommendation: ConfluenceAnalysis['recommendation'] = "NEUTRAL";
  if (totalScore > 200 && majorConfluences >= 3) recommendation = "STRONG_BUY";
  else if (totalScore > 100 && majorConfluences >= 2) recommendation = "BUY";
  else if (totalScore < -200 && majorConfluences >= 3) recommendation = "STRONG_SELL";
  else if (totalScore < -100 && majorConfluences >= 2) recommendation = "SELL";
  
  const reliability = Math.min(95, 50 + (majorConfluences * 10));
  
  return {
    totalScore,
    bullishSignals,
    bearishSignals,
    neutralSignals,
    majorConfluences,
    recommendation,
    reliability
  };
};

// Análise de Médias Móveis (Elder's Triple Screen)
const analyzeMovingAverages = (priceData: number[], timeframe: string): IndicatorSignal[] => {
  const signals: IndicatorSignal[] = [];
  
  if (priceData.length < 50) return signals;
  
  const currentPrice = priceData[priceData.length - 1];
  
  // EMA 13 (Elder's Force Index)
  const ema13 = calculateEMA(priceData, 13);
  const ema13Signal = currentPrice > ema13 ? "BUY" : currentPrice < ema13 ? "SELL" : "NEUTRAL";
  signals.push({
    name: "EMA 13",
    value: ema13,
    signal: ema13Signal,
    strength: Math.abs(((currentPrice - ema13) / ema13) * 1000),
    timeframe,
    confluence: Math.abs(currentPrice - ema13) / ema13 > 0.005
  });
  
  // EMA 26 (MACD Component)
  const ema26 = calculateEMA(priceData, 26);
  const ema26Signal = currentPrice > ema26 ? "BUY" : currentPrice < ema26 ? "SELL" : "NEUTRAL";
  signals.push({
    name: "EMA 26",
    value: ema26,
    signal: ema26Signal,
    strength: Math.abs(((currentPrice - ema26) / ema26) * 1000),
    timeframe,
    confluence: Math.abs(currentPrice - ema26) / ema26 > 0.01
  });
  
  // SMA 50 (Institutional Level)
  const sma50 = calculateSMA(priceData, 50);
  const sma50Signal = currentPrice > sma50 ? "BUY" : currentPrice < sma50 ? "SELL" : "NEUTRAL";
  signals.push({
    name: "SMA 50",
    value: sma50,
    signal: sma50Signal,
    strength: Math.abs(((currentPrice - sma50) / sma50) * 1200),
    timeframe,
    confluence: Math.abs(currentPrice - sma50) / sma50 > 0.015
  });
  
  return signals;
};

// Análise de Indicadores de Momentum
const analyzeMomentumIndicators = (priceData: number[], timeframe: string): IndicatorSignal[] => {
  const signals: IndicatorSignal[] = [];
  
  if (priceData.length < 20) return signals;
  
  // RSI (Elder's recommendation: 14 periods)
  const rsi = calculateRSI(priceData, 14);
  let rsiSignal: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  let rsiStrength = 50;
  
  if (rsi < 30) {
    rsiSignal = "BUY";
    rsiStrength = (30 - rsi) * 2;
  } else if (rsi > 70) {
    rsiSignal = "SELL";
    rsiStrength = (rsi - 70) * 2;
  }
  
  signals.push({
    name: "RSI 14",
    value: rsi,
    signal: rsiSignal,
    strength: rsiStrength,
    timeframe,
    confluence: rsi < 25 || rsi > 75
  });
  
  // MACD
  const macd = calculateMACD(priceData);
  const macdSignal = macd.histogram > 0 ? "BUY" : macd.histogram < 0 ? "SELL" : "NEUTRAL";
  signals.push({
    name: "MACD",
    value: macd.macdLine,
    signal: macdSignal,
    strength: Math.abs(macd.histogram) * 100,
    timeframe,
    confluence: Math.abs(macd.histogram) > 0.01
  });
  
  // Stochastic (Elder's Impulse System)
  const stoch = calculateStochastic(priceData, 14);
  let stochSignal: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  let stochStrength = 50;
  
  if (stoch.k < 20 && stoch.d < 20) {
    stochSignal = "BUY";
    stochStrength = (40 - stoch.k) * 1.5;
  } else if (stoch.k > 80 && stoch.d > 80) {
    stochSignal = "SELL";
    stochStrength = (stoch.k - 60) * 1.5;
  }
  
  signals.push({
    name: "Stochastic",
    value: stoch.k,
    signal: stochSignal,
    strength: stochStrength,
    timeframe,
    confluence: (stoch.k < 15 || stoch.k > 85) && Math.abs(stoch.k - stoch.d) < 5
  });
  
  return signals;
};

// Análise de Indicadores de Volume
const analyzeVolumeIndicators = (priceData: number[], volumeData: number[], timeframe: string): IndicatorSignal[] => {
  const signals: IndicatorSignal[] = [];
  
  if (volumeData.length < 10) return signals;
  
  // Volume Trend
  const recentVolume = volumeData.slice(-5).reduce((sum, vol) => sum + vol, 0) / 5;
  const pastVolume = volumeData.slice(-10, -5).reduce((sum, vol) => sum + vol, 0) / 5;
  
  const volumeChange = (recentVolume - pastVolume) / pastVolume;
  let volumeSignal: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  
  if (volumeChange > 0.2) {
    volumeSignal = "BUY"; // Volume crescente é bullish
  } else if (volumeChange < -0.2) {
    volumeSignal = "SELL"; // Volume decrescente é bearish
  }
  
  signals.push({
    name: "Volume Trend",
    value: volumeChange,
    signal: volumeSignal,
    strength: Math.abs(volumeChange) * 100,
    timeframe,
    confluence: Math.abs(volumeChange) > 0.3
  });
  
  return signals;
};

// Análise de Indicadores de Volatilidade
const analyzeVolatilityIndicators = (priceData: number[], timeframe: string): IndicatorSignal[] => {
  const signals: IndicatorSignal[] = [];
  
  if (priceData.length < 20) return signals;
  
  // Bollinger Bands
  const bb = calculateBollingerBands(priceData, 20, 2);
  const currentPrice = priceData[priceData.length - 1];
  
  let bbSignal: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  let bbStrength = 50;
  
  if (currentPrice < bb.lower) {
    bbSignal = "BUY";
    bbStrength = ((bb.lower - currentPrice) / bb.lower) * 500;
  } else if (currentPrice > bb.upper) {
    bbSignal = "SELL";
    bbStrength = ((currentPrice - bb.upper) / bb.upper) * 500;
  }
  
  signals.push({
    name: "Bollinger Bands",
    value: currentPrice,
    signal: bbSignal,
    strength: bbStrength,
    timeframe,
    confluence: currentPrice < bb.lower * 0.99 || currentPrice > bb.upper * 1.01
  });
  
  return signals;
};

// Análise de Suporte e Resistência
const analyzeSupportResistance = (priceData: number[], timeframe: string): IndicatorSignal[] => {
  const signals: IndicatorSignal[] = [];
  
  if (priceData.length < 20) return signals;
  
  const currentPrice = priceData[priceData.length - 1];
  const support = Math.min(...priceData.slice(-10));
  const resistance = Math.max(...priceData.slice(-10));
  
  let srSignal: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  let srStrength = 50;
  
  const supportDistance = (currentPrice - support) / support;
  const resistanceDistance = (resistance - currentPrice) / currentPrice;
  
  if (supportDistance < 0.02) {
    srSignal = "BUY";
    srStrength = (0.02 - supportDistance) * 2000;
  } else if (resistanceDistance < 0.02) {
    srSignal = "SELL";
    srStrength = (0.02 - resistanceDistance) * 2000;
  }
  
  signals.push({
    name: "Support/Resistance",
    value: currentPrice,
    signal: srSignal,
    strength: srStrength,
    timeframe,
    confluence: supportDistance < 0.01 || resistanceDistance < 0.01
  });
  
  return signals;
};

// Funções auxiliares para cálculos técnicos
const calculateEMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
};

const calculateSMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1];
  
  const recent = prices.slice(-period);
  return recent.reduce((sum, price) => sum + price, 0) / period;
};

const calculateRSI = (prices: number[], period: number): number => {
  if (prices.length < period + 1) return 50;
  
  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? -change : 0);
  
  const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
  const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

const calculateMACD = (prices: number[]) => {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  const signalLine = calculateEMA([macdLine], 9);
  const histogram = macdLine - signalLine;
  
  return { macdLine, signalLine, histogram };
};

const calculateStochastic = (prices: number[], period: number) => {
  if (prices.length < period) return { k: 50, d: 50 };
  
  const recent = prices.slice(-period);
  const low = Math.min(...recent);
  const high = Math.max(...recent);
  const current = prices[prices.length - 1];
  
  const k = ((current - low) / (high - low)) * 100;
  const d = k; // Simplificado
  
  return { k, d };
};

const calculateBollingerBands = (prices: number[], period: number, stdDev: number) => {
  const sma = calculateSMA(prices, period);
  const recent = prices.slice(-period);
  
  const variance = recent.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: sma + (standardDeviation * stdDev),
    middle: sma,
    lower: sma - (standardDeviation * stdDev)
  };
};
