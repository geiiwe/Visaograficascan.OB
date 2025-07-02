
import type { AnalysisType, PrecisionLevel } from '@/context/AnalyzerContext';

export interface PatternResult {
  found: boolean;
  confidence: number;
  buyScore: number;
  sellScore: number;
  details?: any;
}

export const detectPatterns = async (
  imageData: string,
  analysisTypes: AnalysisType[],
  precision: PrecisionLevel
): Promise<Record<string, PatternResult>> => {
  const results: Record<string, PatternResult> = {};
  
  // Simular análise para diferentes tipos de padrões
  for (const type of analysisTypes) {
    if (type === 'all') continue;
    
    // Simular delay baseado na precisão
    const delay = precision === 'alta' ? 800 : precision === 'normal' ? 500 : 200;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simular resultados baseados no tipo de análise
    results[type] = generateMockPatternResult(type, precision);
  }
  
  return results;
};

const generateMockPatternResult = (type: AnalysisType, precision: PrecisionLevel): PatternResult => {
  const baseConfidence = precision === 'alta' ? 85 : precision === 'normal' ? 75 : 65;
  const randomFactor = Math.random() * 20 - 10; // -10 to +10
  const confidence = Math.max(0, Math.min(100, baseConfidence + randomFactor));
  
  // Simular scores de compra/venda baseados no tipo
  let buyScore = 0;
  let sellScore = 0;
  let found = false;
  
  switch (type) {
    case 'trendlines':
      found = Math.random() > 0.3;
      if (found) {
        buyScore = Math.random() > 0.5 ? Math.random() * 30 + 20 : Math.random() * 10;
        sellScore = Math.random() > 0.5 ? Math.random() * 30 + 20 : Math.random() * 10;
      }
      break;
      
    case 'fibonacci':
      found = Math.random() > 0.4;
      if (found) {
        buyScore = Math.random() * 25 + 15;
        sellScore = Math.random() * 25 + 15;
      }
      break;
      
    case 'candlePatterns':
      found = Math.random() > 0.25;
      if (found) {
        buyScore = Math.random() * 35 + 25;
        sellScore = Math.random() * 35 + 25;
      }
      break;
      
    case 'elliottWaves':
      found = Math.random() > 0.6;
      if (found) {
        buyScore = Math.random() * 40 + 30;
        sellScore = Math.random() * 40 + 30;
      }
      break;
      
    case 'dowTheory':
      found = Math.random() > 0.5;
      if (found) {
        buyScore = Math.random() * 20 + 10;
        sellScore = Math.random() * 20 + 10;
      }
      break;
      
    default:
      found = false;
  }
  
  return {
    found,
    confidence: found ? confidence : 0,
    buyScore,
    sellScore,
    details: {
      type,
      precision,
      timestamp: new Date().toISOString()
    }
  };
};
