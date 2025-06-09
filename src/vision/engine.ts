// engine.ts
// Centralize aqui a lógica de visão computacional

import {
  analyzeVolume,
  detectDivergences,
  detectHarmonicPatterns,
  analyzeMovingAverages,
  detectDynamicSupportResistance,
  detectContinuationPatterns,
  detectGaps,
  analyzeVolatility
} from '@/utils/advancedAnalysis';

export function analyzeImage(imageData: any, timeframe: string = '1m') {
  // Chame os módulos de patternDetection, enhancedImageProcessing, etc.
  // E agora também as análises avançadas
  const volume = analyzeVolume(imageData, timeframe);
  const divergences = detectDivergences(imageData, timeframe);
  const harmonics = detectHarmonicPatterns(imageData, timeframe);
  const movingAverages = analyzeMovingAverages(imageData, timeframe);
  const dynamicSR = detectDynamicSupportResistance(imageData, timeframe);
  const continuation = detectContinuationPatterns(imageData, timeframe);
  const gaps = detectGaps(imageData, timeframe);
  const volatility = analyzeVolatility(imageData, timeframe);

  return {
    volume,
    divergences,
    harmonics,
    movingAverages,
    dynamicSR,
    continuation,
    gaps,
    volatility,
    // ...outros resultados de análise já existentes
  };
} 