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

export function analyzeImage(imageData: any) {
  // Chame os módulos de patternDetection, enhancedImageProcessing, etc.
  // E agora também as análises avançadas
  const volume = analyzeVolume(imageData);
  const divergences = detectDivergences(imageData);
  const harmonics = detectHarmonicPatterns(imageData);
  const movingAverages = analyzeMovingAverages(imageData);
  const dynamicSR = detectDynamicSupportResistance(imageData);
  const continuation = detectContinuationPatterns(imageData);
  const gaps = detectGaps(imageData);
  const volatility = analyzeVolatility(imageData);

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