
/**
 * Enhanced Image Processing with Advanced Visual Analysis
 * Integrates the visual analysis engine with the existing image processing pipeline
 */

import { performEnhancedVisualAnalysis } from './enhancedVisualAnalysis';
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
  // New enhanced options
  useEnhancedAnalysis?: boolean;
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
  enhancedAnalysis: any;
}> => {
  console.log("Iniciando processamento de imagem aprimorado com análise de micro padrões...");
  
  // Step 1: Perform enhanced visual analysis FIRST
  progressCallback?.("Executando análise visual aprimorada com micro padrões e timing");
  
  const enhancedAnalysis = await performEnhancedVisualAnalysis(imageData, {
    precision: options.precision,
    timeframe: options.timeframe,
    marketType: options.marketType
  });
  
  console.log("Análise visual aprimorada concluída:");
  console.log("- Qualidade do gráfico:", enhancedAnalysis.visualAnalysis.chartQuality);
  console.log("- Micro padrões detectados:", enhancedAnalysis.microPatterns.filter(p => p.found).length);
  console.log("- Timing ótimo:", enhancedAnalysis.timing.optimal_entry);
  console.log("- Recomendação:", enhancedAnalysis.recommendation.action);
  console.log("- Nível de risco:", enhancedAnalysis.riskAssessment.level);
  
  // Step 2: Adjust processing options based on enhanced analysis results
  const adjustedOptions = adjustProcessingOptionsEnhanced(options, enhancedAnalysis);
  
  progressCallback?.("Ajustando parâmetros de processamento baseado na análise aprimorada");
  
  // Step 3: Apply enhanced image processing
  progressCallback?.("Aplicando processamento de imagem otimizado com foco em micro padrões");
  
  const processedImage = await originalPrepareForAnalysis(
    imageData,
    adjustedOptions,
    progressCallback
  );
  
  console.log("Processamento de imagem aprimorado concluído com sucesso");
  
  return {
    processedImage,
    enhancedAnalysis
  };
};

// Adjust processing options based on enhanced analysis results
const adjustProcessingOptionsEnhanced = (
  originalOptions: EnhancedProcessOptions,
  enhancedAnalysis: any
): any => {
  const adjustedOptions = { ...originalOptions };
  
  // Adjust based on chart quality
  if (enhancedAnalysis.visualAnalysis.chartQuality < 60) {
    console.log("Baixa qualidade de gráfico detectada, aumentando processamento");
    adjustedOptions.enhanceContrast = true;
    adjustedOptions.removeNoise = true;
    adjustedOptions.sharpness = (adjustedOptions.sharpness || 1.0) * 1.5;
    adjustedOptions.histogramEqualization = true;
  }
  
  // Adjust based on micro patterns found
  const foundPatterns = enhancedAnalysis.microPatterns.filter((p: any) => p.found);
  if (foundPatterns.length > 0) {
    console.log(`${foundPatterns.length} micro padrões detectados, otimizando para análise detalhada`);
    adjustedOptions.edgeEnhancement = true;
    adjustedOptions.patternRecognition = true;
    adjustedOptions.candleDetectionPrecision = Math.min(100, 
      (adjustedOptions.candleDetectionPrecision || 75) * 1.3
    );
  }
  
  // Adjust based on timing analysis
  if (enhancedAnalysis.timing.optimal_entry) {
    console.log("Timing ótimo detectado, maximizando precisão");
    adjustedOptions.iterations = Math.max(2, adjustedOptions.iterations || 1);
    adjustedOptions.sensitivity = Math.min(1.0, (adjustedOptions.sensitivity || 0.7) * 1.2);
  }
  
  // Adjust based on risk assessment
  if (enhancedAnalysis.riskAssessment.level === "HIGH") {
    console.log("Alto risco detectado, aplicando processamento conservador");
    adjustedOptions.removeNoise = true;
    adjustedOptions.adaptiveThreshold = true;
  } else if (enhancedAnalysis.riskAssessment.level === "LOW") {
    console.log("Baixo risco detectado, aplicando processamento agressivo");
    adjustedOptions.sharpness = (adjustedOptions.sharpness || 1.0) * 1.2;
    adjustedOptions.sensitivity = Math.min(1.0, (adjustedOptions.sensitivity || 0.7) * 1.1);
  }
  
  // Adjust based on recommendation confidence
  if (enhancedAnalysis.recommendation.confidence > 80) {
    console.log("Alta confiança na recomendação, otimizando detecção");
    adjustedOptions.featureExtraction = true;
    adjustedOptions.contourDetection = true;
  }
  
  return adjustedOptions;
};

// Get enhanced processing options with micro pattern analysis integration
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
    useEnhancedAnalysis: true,
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
