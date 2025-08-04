/**
 * Análise Vela a Vela Detalhada - Máximas e Mínimas
 * Analisa cada vela individualmente para identificar padrões de preço
 */

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp?: number;
}

export interface CandleAnalysisResult {
  candleIndex: number;
  candleType: 'bullish' | 'bearish' | 'doji' | 'hammer' | 'shooting_star' | 'spinning_top';
  bodySize: 'large' | 'medium' | 'small';
  shadowRatio: {
    upperShadow: number;
    lowerShadow: number;
    ratio: string; // 'balanced' | 'upper_heavy' | 'lower_heavy'
  };
  priceAction: {
    isHigherHigh: boolean;
    isLowerLow: boolean;
    isHigherLow: boolean;
    isLowerHigh: boolean;
  };
  significance: number; // 0-100
  signals: string[];
}

export interface DetailedCandleAnalysisResult {
  timeframe: string;
  totalCandles: number;
  candleAnalysis: CandleAnalysisResult[];
  swingPoints: {
    highs: Array<{ index: number; price: number; strength: number }>;
    lows: Array<{ index: number; price: number; strength: number }>;
  };
  trendStructure: {
    overallTrend: 'uptrend' | 'downtrend' | 'sideways';
    trendStrength: number;
    breakOfStructure: boolean;
    changeOfCharacter: boolean;
  };
  volumeProfile: {
    highVolumeCandles: number[];
    lowVolumeCandles: number[];
    volumeTrendAlignment: boolean;
  };
  keyLevels: {
    resistance: number[];
    support: number[];
    pivotPoints: Array<{ price: number; type: 'resistance' | 'support'; strength: number }>;
  };
  recommendation: {
    signal: 'BUY' | 'SELL' | 'WAIT';
    confidence: number;
    reasoning: string[];
    entryZone: { min: number; max: number } | null;
    stopLoss: number | null;
    takeProfit: number | null;
  };
}

/**
 * Simula dados de velas a partir de imageData para análise
 */
function extractCandleDataFromImage(imageData: any, timeframe: string): CandleData[] {
  // Simula extração de dados de velas da imagem
  // Em implementação real, usaria CV para extrair dados reais
  
  const numCandles = timeframe.includes('1m') ? 20 : timeframe.includes('5m') ? 12 : 8;
  const basePrice = 100 + Math.random() * 50;
  
  const candles: CandleData[] = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < numCandles; i++) {
    const volatility = 0.02 + Math.random() * 0.03; // 2-5% volatilidade
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    const open = currentPrice;
    const change = open * volatility * direction;
    const close = open + change;
    
    const high = Math.max(open, close) + Math.abs(change) * (0.2 + Math.random() * 0.3);
    const low = Math.min(open, close) - Math.abs(change) * (0.2 + Math.random() * 0.3);
    
    const volume = 1000 + Math.random() * 2000;
    
    candles.push({
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      volume: Math.floor(volume),
      timestamp: Date.now() + (i * 60000)
    });
    
    currentPrice = close + (Math.random() - 0.5) * 0.01 * close;
  }
  
  return candles;
}

/**
 * Analisa um candle individual
 */
function analyzeSingleCandle(candle: CandleData, previousCandles: CandleData[]): CandleAnalysisResult {
  const { open, high, low, close } = candle;
  const body = Math.abs(close - open);
  const totalRange = high - low;
  const upperShadow = high - Math.max(open, close);
  const lowerShadow = Math.min(open, close) - low;
  
  // Determinar tipo de candle
  let candleType: CandleAnalysisResult['candleType'] = 'bullish';
  
  if (Math.abs(close - open) / totalRange < 0.1) {
    candleType = 'doji';
  } else if (close > open) {
    candleType = 'bullish';
  } else {
    candleType = 'bearish';
  }
  
  // Padrões especiais
  if (lowerShadow > body * 2 && upperShadow < body * 0.5) {
    candleType = 'hammer';
  } else if (upperShadow > body * 2 && lowerShadow < body * 0.5) {
    candleType = 'shooting_star';
  } else if (upperShadow > body && lowerShadow > body) {
    candleType = 'spinning_top';
  }
  
  // Tamanho do corpo
  const bodySize = body / totalRange > 0.7 ? 'large' : 
                   body / totalRange > 0.4 ? 'medium' : 'small';
  
  // Análise de sombras
  const shadowRatio = {
    upperShadow: (upperShadow / totalRange) * 100,
    lowerShadow: (lowerShadow / totalRange) * 100,
    ratio: upperShadow > lowerShadow * 1.5 ? 'upper_heavy' :
           lowerShadow > upperShadow * 1.5 ? 'lower_heavy' : 'balanced'
  };
  
  // Price Action
  const priceAction = {
    isHigherHigh: previousCandles.length > 0 && high > Math.max(...previousCandles.map(c => c.high)),
    isLowerLow: previousCandles.length > 0 && low < Math.min(...previousCandles.map(c => c.low)),
    isHigherLow: previousCandles.length > 0 && low > Math.min(...previousCandles.slice(-3).map(c => c.low)),
    isLowerHigh: previousCandles.length > 0 && high < Math.max(...previousCandles.slice(-3).map(c => c.high))
  };
  
  // Calcular significância
  let significance = 50;
  if (candleType === 'hammer' || candleType === 'shooting_star') significance += 20;
  if (bodySize === 'large') significance += 15;
  if (priceAction.isHigherHigh || priceAction.isLowerLow) significance += 15;
  
  // Gerar sinais
  const signals: string[] = [];
  if (candleType === 'hammer' && priceAction.isHigherLow) signals.push('Possível reversão alta');
  if (candleType === 'shooting_star' && priceAction.isLowerHigh) signals.push('Possível reversão baixa');
  if (candleType === 'bullish' && bodySize === 'large') signals.push('Força compradora');
  if (candleType === 'bearish' && bodySize === 'large') signals.push('Força vendedora');
  
  return {
    candleIndex: previousCandles.length,
    candleType,
    bodySize,
    shadowRatio,
    priceAction,
    significance: Math.min(100, significance),
    signals
  };
}

/**
 * Identifica pontos de swing (máximas e mínimas)
 */
function identifySwingPoints(candles: CandleData[]): DetailedCandleAnalysisResult['swingPoints'] {
  const highs: Array<{ index: number; price: number; strength: number }> = [];
  const lows: Array<{ index: number; price: number; strength: number }> = [];
  
  for (let i = 2; i < candles.length - 2; i++) {
    const current = candles[i];
    const prev2 = candles[i - 2];
    const prev1 = candles[i - 1];
    const next1 = candles[i + 1];
    const next2 = candles[i + 2];
    
    // Swing High
    if (current.high > prev2.high && current.high > prev1.high && 
        current.high > next1.high && current.high > next2.high) {
      const strength = (current.high - Math.min(prev1.high, next1.high)) / current.high * 1000;
      highs.push({ index: i, price: current.high, strength });
    }
    
    // Swing Low
    if (current.low < prev2.low && current.low < prev1.low && 
        current.low < next1.low && current.low < next2.low) {
      const strength = (Math.max(prev1.low, next1.low) - current.low) / current.low * 1000;
      lows.push({ index: i, price: current.low, strength });
    }
  }
  
  return { highs, lows };
}

/**
 * Analisa estrutura de tendência
 */
function analyzeTrendStructure(candles: CandleData[], swingPoints: DetailedCandleAnalysisResult['swingPoints']): DetailedCandleAnalysisResult['trendStructure'] {
  const { highs, lows } = swingPoints;
  
  // Determinar tendência geral
  let overallTrend: 'uptrend' | 'downtrend' | 'sideways' = 'sideways';
  let trendStrength = 0;
  
  if (highs.length >= 2 && lows.length >= 2) {
    const recentHighs = highs.slice(-2);
    const recentLows = lows.slice(-2);
    
    const higherHighs = recentHighs[1].price > recentHighs[0].price;
    const higherLows = recentLows[1].price > recentLows[0].price;
    const lowerHighs = recentHighs[1].price < recentHighs[0].price;
    const lowerLows = recentLows[1].price < recentLows[0].price;
    
    if (higherHighs && higherLows) {
      overallTrend = 'uptrend';
      trendStrength = 80;
    } else if (lowerHighs && lowerLows) {
      overallTrend = 'downtrend';
      trendStrength = 80;
    } else {
      overallTrend = 'sideways';
      trendStrength = 40;
    }
  }
  
  // Detectar mudança de estrutura
  const breakOfStructure = highs.length >= 2 && lows.length >= 2 && 
    ((overallTrend === 'uptrend' && lows[lows.length - 1].price < lows[lows.length - 2].price) ||
     (overallTrend === 'downtrend' && highs[highs.length - 1].price > highs[highs.length - 2].price));
  
  const changeOfCharacter = breakOfStructure;
  
  return {
    overallTrend,
    trendStrength,
    breakOfStructure,
    changeOfCharacter
  };
}

/**
 * Função principal de análise vela a vela
 */
export function performDetailedCandleAnalysis(imageData: any, timeframe: string): DetailedCandleAnalysisResult {
  console.log('🕯️ Iniciando análise vela a vela detalhada');
  
  // Extrair dados de velas da imagem
  const candles = extractCandleDataFromImage(imageData, timeframe);
  
  // Analisar cada vela
  const candleAnalysis: CandleAnalysisResult[] = [];
  for (let i = 0; i < candles.length; i++) {
    const previousCandles = candles.slice(0, i);
    const analysis = analyzeSingleCandle(candles[i], previousCandles);
    candleAnalysis.push(analysis);
  }
  
  // Identificar pontos de swing
  const swingPoints = identifySwingPoints(candles);
  
  // Analisar estrutura de tendência
  const trendStructure = analyzeTrendStructure(candles, swingPoints);
  
  // Análise de volume
  const volumeProfile = {
    highVolumeCandles: candleAnalysis
      .map((_, index) => index)
      .filter(index => candles[index].volume && candles[index].volume! > 1500),
    lowVolumeCandles: candleAnalysis
      .map((_, index) => index)
      .filter(index => candles[index].volume && candles[index].volume! < 1200),
    volumeTrendAlignment: trendStructure.overallTrend !== 'sideways'
  };
  
  // Identificar níveis-chave
  const keyLevels = {
    resistance: swingPoints.highs.slice(-3).map(h => h.price),
    support: swingPoints.lows.slice(-3).map(l => l.price),
    pivotPoints: [
      ...swingPoints.highs.slice(-2).map(h => ({ price: h.price, type: 'resistance' as const, strength: h.strength })),
      ...swingPoints.lows.slice(-2).map(l => ({ price: l.price, type: 'support' as const, strength: l.strength }))
    ]
  };
  
  // Gerar recomendação
  const lastCandle = candleAnalysis[candleAnalysis.length - 1];
  const lastPrice = candles[candles.length - 1].close;
  
  let signal: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
  let confidence = 50;
  const reasoning: string[] = [];
  
  // Lógica de decisão baseada na análise vela a vela
  if (trendStructure.overallTrend === 'uptrend' && !trendStructure.breakOfStructure) {
    if (lastCandle.candleType === 'hammer' || 
        (lastCandle.candleType === 'bullish' && lastCandle.bodySize === 'large')) {
      signal = 'BUY';
      confidence = 75;
      reasoning.push('Tendência de alta confirmada', 'Padrão de candle favorável');
    }
  } else if (trendStructure.overallTrend === 'downtrend' && !trendStructure.breakOfStructure) {
    if (lastCandle.candleType === 'shooting_star' || 
        (lastCandle.candleType === 'bearish' && lastCandle.bodySize === 'large')) {
      signal = 'SELL';
      confidence = 75;
      reasoning.push('Tendência de baixa confirmada', 'Padrão de candle favorável');
    }
  }
  
  // Ajustar confiança baseada em confluências
  if (volumeProfile.volumeTrendAlignment) {
    confidence += 10;
    reasoning.push('Volume confirma tendência');
  }
  
  if (trendStructure.breakOfStructure) {
    confidence -= 20;
    reasoning.push('Possível mudança de estrutura');
  }
  
  // Definir zonas de entrada e saída
  let entryZone = null;
  let stopLoss = null;
  let takeProfit = null;
  
  if (signal !== 'WAIT') {
    const nearestSupport = keyLevels.support[keyLevels.support.length - 1];
    const nearestResistance = keyLevels.resistance[keyLevels.resistance.length - 1];
    
    if (signal === 'BUY') {
      entryZone = { min: lastPrice * 0.998, max: lastPrice * 1.002 };
      stopLoss = nearestSupport * 0.995;
      takeProfit = nearestResistance * 1.005;
    } else {
      entryZone = { min: lastPrice * 0.998, max: lastPrice * 1.002 };
      stopLoss = nearestResistance * 1.005;
      takeProfit = nearestSupport * 0.995;
    }
  }
  
  const result: DetailedCandleAnalysisResult = {
    timeframe,
    totalCandles: candles.length,
    candleAnalysis,
    swingPoints,
    trendStructure,
    volumeProfile,
    keyLevels,
    recommendation: {
      signal,
      confidence: Math.min(95, confidence),
      reasoning,
      entryZone,
      stopLoss,
      takeProfit
    }
  };
  
  console.log('✅ Análise vela a vela concluída:', {
    candles: candles.length,
    signal,
    confidence,
    swingHighs: swingPoints.highs.length,
    swingLows: swingPoints.lows.length
  });
  
  return result;
}