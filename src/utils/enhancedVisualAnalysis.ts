
/**
 * Enhanced Visual Analysis with Micro Pattern Integration
 * Integra análise de micro padrões com a análise visual existente
 */

import { performAdvancedVisualAnalysis } from './visualAnalysis';
import { 
  performMicroPatternAnalysis, 
  MicroPatternResult, 
  TimingAnalysis 
} from './microPatternAnalysis';

interface EnhancedVisualResult {
  visualAnalysis: any;
  microPatterns: MicroPatternResult[];
  timing: TimingAnalysis;
  recommendation: {
    action: "BUY" | "SELL" | "WAIT";
    confidence: number;
    reasoning: string;
    entry_price?: number;
    stop_loss?: number;
    take_profit?: number;
    time_validity: number; // segundos
  };
  riskAssessment: {
    level: "LOW" | "MEDIUM" | "HIGH";
    factors: string[];
    recommendation: string;
  };
}

export const performEnhancedVisualAnalysis = async (
  imageData: string,
  options: {
    precision: "baixa" | "normal" | "alta";
    timeframe: string;
    marketType: string;
  }
): Promise<EnhancedVisualResult> => {
  console.log("Iniciando análise visual aprimorada com micro padrões...");
  
  // Step 1: Análise visual básica
  const visualAnalysis = await performAdvancedVisualAnalysis(imageData, options);
  
  // Step 2: Extrair dados de preço da análise visual
  const priceData = extractPriceDataFromVisualAnalysis(visualAnalysis);
  
  // Step 3: Preparar condições de mercado
  const marketConditions = {
    volatility: visualAnalysis.priceAction?.volatility || 0,
    momentum: Math.abs(visualAnalysis.priceAction?.momentum || 0) / 100,
    volume: visualAnalysis.volumeAnalysis?.significance || 50
  };
  
  // Step 4: Executar análise de micro padrões
  const microAnalysis = performMicroPatternAnalysis(
    priceData,
    visualAnalysis.supportResistanceLevels || [],
    options.timeframe,
    marketConditions
  );
  
  // Step 5: Combinar resultados e gerar recomendação final
  const enhancedRecommendation = combineAnalysisResults(
    visualAnalysis,
    microAnalysis,
    options.timeframe
  );
  
  // Step 6: Avaliar risco
  const riskAssessment = assessRisk(
    visualAnalysis,
    microAnalysis,
    options.timeframe,
    options.marketType
  );
  
  console.log("Análise visual aprimorada concluída");
  console.log("Recomendação:", enhancedRecommendation.action, "com", enhancedRecommendation.confidence, "% de confiança");
  
  return {
    visualAnalysis,
    microPatterns: microAnalysis.patterns,
    timing: microAnalysis.timing,
    recommendation: enhancedRecommendation,
    riskAssessment
  };
};

// Extrair dados de preço da análise visual
const extractPriceDataFromVisualAnalysis = (visualAnalysis: any): number[] => {
  // Simular extração de dados de preço baseado na análise visual
  const basePrice = 100;
  const volatility = visualAnalysis.priceAction?.volatility || 2;
  
  // Gerar série de preços simulada baseada na análise
  const priceData: number[] = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < 20; i++) {
    const change = (Math.random() - 0.5) * volatility;
    currentPrice += change;
    priceData.push(currentPrice);
  }
  
  // Ajustar baseado na tendência detectada
  if (visualAnalysis.trendDirection === "uptrend") {
    for (let i = 0; i < priceData.length; i++) {
      priceData[i] += i * 0.1; // Tendência de alta
    }
  } else if (visualAnalysis.trendDirection === "downtrend") {
    for (let i = 0; i < priceData.length; i++) {
      priceData[i] -= i * 0.1; // Tendência de baixa
    }
  }
  
  return priceData;
};

// Combinar resultados das análises
const combineAnalysisResults = (
  visualAnalysis: any,
  microAnalysis: any,
  timeframe: string
): {
  action: "BUY" | "SELL" | "WAIT";
  confidence: number;
  reasoning: string;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  time_validity: number;
} => {
  const microRecommendation = microAnalysis.recommendation;
  const timing = microAnalysis.timing;
  
  // Verificar alinhamento entre análise visual e micro padrões
  let visualDirection: "up" | "down" | "neutral" = "neutral";
  
  if (visualAnalysis.trendDirection === "uptrend") {
    visualDirection = "up";
  } else if (visualAnalysis.trendDirection === "downtrend") {
    visualDirection = "down";
  }
  
  const microDirection = microRecommendation.action === "BUY" ? "up" : 
                        microRecommendation.action === "SELL" ? "down" : "neutral";
  
  const alignment = visualDirection === microDirection;
  
  // Ajustar confiança baseado no alinhamento
  let finalConfidence = microRecommendation.confidence;
  if (alignment && visualDirection !== "neutral") {
    finalConfidence = Math.min(95, finalConfidence + 10);
  } else if (!alignment && visualDirection !== "neutral") {
    finalConfidence = Math.max(30, finalConfidence - 20);
  }
  
  // Ajustar baseado no timing
  if (!timing.optimal_entry) {
    finalConfidence = Math.max(20, finalConfidence - 30);
  }
  
  // Determinar validade temporal baseada no timeframe
  const timeValidity = timeframe === "30s" ? 30 : 
                      timeframe === "1m" ? 60 : 
                      timeframe === "5m" ? 300 : 180;
  
  // Buscar pontos de entrada dos micro padrões
  const validPatterns = microAnalysis.patterns.filter((p: MicroPatternResult) => 
    p.found && p.confidence > 70
  );
  
  const entryPattern = validPatterns.find((p: MicroPatternResult) => 
    p.details.entry_point !== undefined
  );
  
  return {
    action: finalConfidence > 70 ? microRecommendation.action : "WAIT",
    confidence: Math.round(finalConfidence),
    reasoning: `${microRecommendation.reasoning}. Alinhamento visual: ${alignment ? "SIM" : "NÃO"}. Timing: ${timing.optimal_entry ? "ÓTIMO" : "AGUARDAR"}`,
    entry_price: entryPattern?.details.entry_point,
    stop_loss: entryPattern?.details.stop_loss,
    take_profit: entryPattern?.details.take_profit,
    time_validity: Math.round(timing.time_remaining || timeValidity)
  };
};

// Avaliar risco da operação
const assessRisk = (
  visualAnalysis: any,
  microAnalysis: any,
  timeframe: string,
  marketType: string
): {
  level: "LOW" | "MEDIUM" | "HIGH";
  factors: string[];
  recommendation: string;
} => {
  const riskFactors: string[] = [];
  let riskScore = 0;
  
  // Fatores de risco baseados na análise visual
  if (visualAnalysis.chartQuality < 70) {
    riskFactors.push("Qualidade do gráfico baixa");
    riskScore += 20;
  }
  
  if (visualAnalysis.priceAction?.volatility > 5) {
    riskFactors.push("Alta volatilidade detectada");
    riskScore += 15;
  }
  
  if (visualAnalysis.trendDirection === "sideways") {
    riskFactors.push("Mercado lateral (sem tendência clara)");
    riskScore += 10;
  }
  
  // Fatores de risco baseados nos micro padrões
  if (!microAnalysis.timing.optimal_entry) {
    riskFactors.push("Timing não favorável");
    riskScore += 25;
  }
  
  if (!microAnalysis.timing.volume_confirmation) {
    riskFactors.push("Falta confirmação de volume");
    riskScore += 10;
  }
  
  if (!microAnalysis.timing.trend_alignment) {
    riskFactors.push("Padrões não alinhados");
    riskScore += 15;
  }
  
  // Fatores de risco por timeframe
  if (timeframe === "30s") {
    riskFactors.push("Timeframe muito curto (30s)");
    riskScore += 10;
  }
  
  // Fatores de risco por tipo de mercado
  if (marketType === "otc") {
    riskFactors.push("Mercado OTC (maior spread)");
    riskScore += 5;
  }
  
  // Determinar nível de risco
  let riskLevel: "LOW" | "MEDIUM" | "HIGH";
  let recommendation: string;
  
  if (riskScore <= 20) {
    riskLevel = "LOW";
    recommendation = "Operação com risco baixo. Recomendado prosseguir.";
  } else if (riskScore <= 50) {
    riskLevel = "MEDIUM";
    recommendation = "Risco moderado. Considere reduzir o valor da operação.";
  } else {
    riskLevel = "HIGH";
    recommendation = "Alto risco. Recomendado aguardar melhores condições.";
  }
  
  return {
    level: riskLevel,
    factors: riskFactors,
    recommendation
  };
};
