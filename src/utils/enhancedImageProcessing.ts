
/**
 * Enhanced Image Processing with Advanced Visual Analysis
 * Integrates the visual analysis engine with the existing image processing pipeline
 */

import { performAdvancedVisualAnalysis } from './visualAnalysis';
import { prepareForAnalysis as originalPrepareForAnalysis } from './imageProcessing';

interface EnhancedProcessOptions {
  enhanceContrast?: boolean;
  removeNoise?: boolean;
  sharpness?: number;
  iterations?: number;
  adaptiveThreshold?: boolean;
  edgeEnhancement?: boolean;
  patternRecognition?: boolean;
  contourDetection?: boolean;
  featureExtraction?: boolean;
  histogramEqualization?: boolean;
  perspectiveCorrection?: boolean;
  chartRegionDetection?: boolean;
  sensitivity?: number;
  contextAwareness?: boolean;
  patternConfidence?: number;
  chartRegion?: { x: number; y: number; width: number; height: number } | null;
  disableSimulation?: boolean;
  enableCircularAnalysis?: boolean;
  candleDetectionPrecision?: number;
  detectDarkBackground?: boolean;
  // New advanced options
  useAdvancedVisualAnalysis?: boolean;
  precision: "baixa" | "normal" | "alta";
  timeframe: string;
  marketType: string;
}

type ProgressCallback = (stage: string) => void;

// Enhanced image processing that incorporates advanced visual analysis
export const enhancedPrepareForAnalysis = async (
  imageData: string,
  options: EnhancedProcessOptions,
  progressCallback?: ProgressCallback
): Promise<{
  processedImage: string;
  visualAnalysis: any;
}> => {
  console.log("Iniciando processamento de imagem aprimorado com análise visual avançada...");
  
  // Step 1: Perform advanced visual analysis FIRST
  progressCallback?.("Executando análise visual avançada baseada em conhecimento de livros técnicos");
  
  const visualAnalysis = await performAdvancedVisualAnalysis(imageData, {
    precision: options.precision,
    timeframe: options.timeframe,
    marketType: options.marketType
  });
  
  console.log("Análise visual concluída. Qualidade do gráfico:", visualAnalysis.chartQuality);
  console.log("Tendência identificada:", visualAnalysis.trendDirection);
  console.log("Padrões de candles encontrados:", visualAnalysis.candlePatterns.length);
  console.log("Níveis de suporte/resistência:", visualAnalysis.supportResistanceLevels.length);
  
  // Step 2: Adjust processing options based on visual analysis results
  const adjustedOptions = adjustProcessingOptions(options, visualAnalysis);
  
  progressCallback?.("Ajustando parâmetros de processamento baseado na análise visual");
  
  // Step 3: Apply enhanced image processing
  progressCallback?.("Aplicando processamento de imagem otimizado");
  
  const processedImage = await originalPrepareForAnalysis(
    imageData,
    adjustedOptions,
    progressCallback
  );
  
  console.log("Processamento de imagem aprimorado concluído com sucesso");
  
  return {
    processedImage,
    visualAnalysis
  };
};

// Adjust processing options based on visual analysis results
const adjustProcessingOptions = (
  originalOptions: EnhancedProcessOptions,
  visualAnalysis: any
): any => {
  const adjustedOptions = { ...originalOptions };
  
  // Adjust based on chart quality
  if (visualAnalysis.chartQuality < 60) {
    console.log("Baixa qualidade de gráfico detectada, aumentando processamento");
    adjustedOptions.enhanceContrast = true;
    adjustedOptions.removeNoise = true;
    adjustedOptions.sharpness = (adjustedOptions.sharpness || 1.0) * 1.5;
    adjustedOptions.histogramEqualization = true;
  }
  
  // Adjust based on trend direction
  if (visualAnalysis.trendDirection !== "unknown") {
    console.log(`Tendência ${visualAnalysis.trendDirection} detectada, otimizando para análise de tendência`);
    adjustedOptions.edgeEnhancement = true;
    adjustedOptions.patternRecognition = true;
  }
  
  // Adjust based on candlestick patterns found
  if (visualAnalysis.candlePatterns.length > 0) {
    console.log(`${visualAnalysis.candlePatterns.length} padrões de candles detectados, otimizando detecção`);
    adjustedOptions.candleDetectionPrecision = Math.min(100, 
      (adjustedOptions.candleDetectionPrecision || 75) * 1.2
    );
  }
  
  // Adjust based on support/resistance levels
  if (visualAnalysis.supportResistanceLevels.length > 3) {
    console.log("Múltiplos níveis de S/R detectados, aprimorando detecção de contornos");
    adjustedOptions.contourDetection = true;
    adjustedOptions.featureExtraction = true;
  }
  
  // Adjust based on market structure
  if (visualAnalysis.marketStructure.consolidation) {
    console.log("Consolidação detectada, otimizando para padrões laterais");
    adjustedOptions.sensitivity = Math.min(1.0, (adjustedOptions.sensitivity || 0.7) * 1.3);
  }
  
  // Adjust based on volatility
  if (visualAnalysis.priceAction.volatility > 5) {
    console.log("Alta volatilidade detectada, ajustando filtros");
    adjustedOptions.adaptiveThreshold = true;
    adjustedOptions.removeNoise = true;
  }
  
  return adjustedOptions;
};

// Get enhanced processing options with visual analysis integration
export const getEnhancedProcessOptions = (
  precision: string,
  timeframe: string,
  marketType: string,
  enableCircular: boolean = true,
  candlePrecision: number = 75
): EnhancedProcessOptions => {
  const baseOptions: EnhancedProcessOptions = {
    enhanceContrast: true,
    removeNoise: true,
    histogramEqualization: true,
    edgeEnhancement: true,
    patternRecognition: true,
    sensitivity: precision === "alta" ? 0.9 : precision === "normal" ? 0.7 : 0.5,
    iterations: precision === "alta" ? 2 : 1,
    sharpness: precision === "alta" ? 1.5 : precision === "normal" ? 1.2 : 1.0,
    disableSimulation: false,
    enableCircularAnalysis: enableCircular,
    candleDetectionPrecision: candlePrecision,
    useAdvancedVisualAnalysis: true,
    precision: precision as "baixa" | "normal" | "alta",
    timeframe,
    marketType
  };
  
  // Customize by market type with enhanced analysis
  if (marketType === "otc") {
    return {
      ...baseOptions,
      contourDetection: true,
      contextAwareness: true,
      patternConfidence: precision === "alta" ? 0.85 : 0.75,
      detectDarkBackground: true,
      candleDetectionPrecision: candlePrecision * 1.1,
      // Enhanced OTC-specific options
      featureExtraction: true,
      perspectiveCorrection: true
    };
  }
  
  // Customize by timeframe with enhanced analysis
  if (timeframe === "30s") {
    return {
      ...baseOptions,
      iterations: precision === "alta" ? 3 : 2,
      sharpness: precision === "alta" ? 1.8 : 1.5,
      candleDetectionPrecision: candlePrecision * 1.2,
      // Enhanced short-timeframe options
      adaptiveThreshold: true,
      sensitivity: Math.min(1.0, (baseOptions.sensitivity || 0.7) * 1.2)
    };
  }
  
  return baseOptions;
};
