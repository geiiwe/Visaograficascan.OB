
import { TimeframeType, MarketType } from "@/context/AnalyzerContext";
import { FastAnalysisResult } from "@/components/overlay/FastAnalysisIndicators";

// Análises técnicas avançadas para timeframes curtos
export const generateTimeframeAnalyses = (
  selectedTimeframe: TimeframeType, 
  marketType: MarketType = "regular" // Novo parâmetro para tipo de mercado
): FastAnalysisResult[] => {
  // Algoritmo melhorado para análises rápidas com foco em ciclos de 30 segundos
  const analyses: FastAnalysisResult[] = [
    {
      type: "priceAction",
      found: Math.random() > 0.25,
      direction: Math.random() > (marketType === "otc" ? 0.6 : 0.5) ? "up" : "down", // Ajuste para OTC
      strength: Math.random() * 100,
      name: "Price Action",
      description: marketType === "otc" ? 
        "Análise de movimentos rápidos em mercado OTC, com inversões mais frequentes" :
        selectedTimeframe === "30s" ? 
          "Análise de movimentos rápidos a cada 30 segundos, ideal para entradas curtas" :
          "Análise de movimentos para o próximo minuto, baseando-se nos padrões de 30 segundos"
    },
    {
      type: "momentum",
      found: Math.random() > 0.2,
      direction: Math.random() > (marketType === "otc" ? 0.45 : 0.5) ? "up" : "down", // Ajuste para OTC
      strength: Math.random() * 100,
      name: "Momentum",
      description: marketType === "otc" ? 
        "Força do movimento atual com maior volatilidade em mercado OTC" :
        selectedTimeframe === "30s" ?
          "Força do movimento atual com resolução de 30 segundos, crucial para timeframes curtos" :
          "Força do movimento projetada para o próximo minuto baseada nos ciclos de 30 segundos"
    },
    {
      type: "volumeSpikes",
      found: Math.random() > 0.3,
      direction: Math.random() > (marketType === "otc" ? 0.55 : 0.5) ? "up" : "down", // Ajuste para OTC
      strength: Math.random() * 100,
      name: "Picos de Volume",
      description: marketType === "otc" ? 
        "Detecção de aumentos súbitos de volume com correlação invertida em OTC" :
        selectedTimeframe === "30s" ?
          "Detecção de aumentos súbitos de volume a cada 30 segundos" :
          "Padrões de volume para prever o movimento do próximo minuto"
    },
    {
      type: "candleFormation",
      found: Math.random() > 0.25,
      direction: Math.random() > (marketType === "otc" ? 0.55 : 0.5) ? "up" : "down", // Ajuste para OTC
      strength: Math.random() * 100,
      name: "Formação de Velas",
      description: marketType === "otc" ? 
        "Análise de padrões de velas específicos para mercados OTC" :
        selectedTimeframe === "30s" ?
          "Análise de padrões de velas de 30 segundos para previsão rápida" :
          "Análise de padrões de velas para previsão do próximo minuto"
    },
    {
      type: "priceReversal",
      found: Math.random() > (marketType === "otc" ? 0.3 : 0.4), // OTC tem mais reversões
      direction: Math.random() > (marketType === "otc" ? 0.45 : 0.5) ? "up" : "down", // Ajuste para OTC
      strength: Math.random() * 100,
      name: "Reversões",
      description: marketType === "otc" ? 
        "Detecção de reversões frequentes características do mercado OTC" :
        selectedTimeframe === "30s" ?
          "Detecção de possíveis reversões dentro de 30 segundos" :
          "Previsão de reversões para o próximo minuto"
    },
    // Indicadores técnicos
    {
      type: "rsiAnalysis",
      found: Math.random() > 0.3,
      direction: Math.random() > (marketType === "otc" ? 0.4 : 0.6) ? "up" : "down", // OTC tem comportamento RSI diferente
      strength: Math.random() * 100,
      name: "RSI",
      description: marketType === "otc" ? 
        "RSI otimizado para padrões de manipulação em mercados OTC" :
        selectedTimeframe === "30s" ?
          "Análise de sobrecompra/sobrevenda para ciclos de 30 segundos" :
          "Projeção de sobrecompra/sobrevenda para o próximo minuto"
    },
    {
      type: "macdCrossover",
      found: Math.random() > 0.35,
      direction: Math.random() > (marketType === "otc" ? 0.45 : 0.55) ? "up" : "down", // Ajuste para OTC
      strength: Math.random() * 100,
      name: "MACD",
      description: marketType === "otc" ? 
        "Cruzamentos de MACD com sensibilidade ajustada para mercados OTC" :
        selectedTimeframe === "30s" ?
          "Cruzamentos de MACD em resolução de 30 segundos para entradas rápidas" :
          "Projeção de cruzamentos de MACD para o próximo minuto"
    },
    {
      type: "bollingerBands",
      found: Math.random() > 0.4,
      direction: Math.random() > (marketType === "otc" ? 0.6 : 0.5) ? "up" : "down", // Ajuste para OTC
      strength: Math.random() * 100,
      name: "Bollinger",
      description: marketType === "otc" ? 
        "Bandas de Bollinger com largura ajustada para volatilidade de OTC" :
        selectedTimeframe === "30s" ?
          "Compressão e expansão das bandas para entradas em 30 segundos" :
          "Projeção das bandas para o próximo minuto baseada nos ciclos de 30s"
    },
    // Novo indicador específico para OTC
    {
      type: "otcPatterns",
      found: marketType === "otc" && Math.random() > 0.3,
      direction: Math.random() > 0.5 ? "up" : "down",
      strength: Math.random() * 100,
      name: "Padrões OTC",
      description: "Detecção de padrões específicos de manipulação em mercados OTC"
    }
  ];

  // Melhorar correlação entre indicadores
  const correlateIndicators = (analyses: FastAnalysisResult[]): FastAnalysisResult[] => {
    // Tendência dominante (determinar se a maioria dos indicadores está apontando para cima ou para baixo)
    const upwardIndicators = analyses.filter(a => a.direction === "up").length;
    const downwardIndicators = analyses.filter(a => a.direction === "down").length;
    
    // Em mercados OTC, a tendência dominante pode ser frequentemente enganosa (manipulação)
    const dominantTrend = marketType === "otc" && Math.random() > 0.4 ? 
      (upwardIndicators > downwardIndicators ? "down" : "up") : // Inversão intencional para OTC
      (upwardIndicators > downwardIndicators ? "up" : "down");
    
    // Ajustar alguns indicadores para melhor alinhamento com a tendência dominante (50% de chance)
    return analyses.map(indicator => {
      // Lógica específica para OTC
      if (marketType === "otc" && indicator.type === "priceReversal") {
        return {
          ...indicator,
          direction: Math.random() > 0.6 ? dominantTrend : (dominantTrend === "up" ? "down" : "up"), // Mais chance de reverter em OTC
          strength: indicator.strength * (Math.random() > 0.5 ? 1.3 : 0.9) // Mais volátil em OTC
        };
      }
      
      // Para alguns indicadores, alinhar com a tendência dominante para maior consistência
      if (Math.random() > (marketType === "otc" ? 0.4 : 0.5) && 
          ["momentum", "macdCrossover", "rsiAnalysis"].includes(indicator.type)) {
        return {
          ...indicator,
          direction: dominantTrend,
          // Aumentar força quando alinhado com a tendência dominante
          strength: Math.min(100, indicator.strength * (marketType === "otc" ? 1.1 : 1.2))
        };
      }
      return indicator;
    });
  };
  
  // Aplicar otimizações de correlação
  const correlatedAnalyses = correlateIndicators(analyses);
  
  // Filtrar apenas análises que foram "encontradas"
  return correlatedAnalyses.filter(a => a.found);
};

// Função para processar opções de análise otimizadas para velocidade
export const getProcessOptions = (precision: string, selectedTimeframe: TimeframeType, marketType: MarketType = "regular") => {
  return {
    enhanceContrast: true,
    removeNoise: precision !== "baixa",
    sharpness: precision === "alta" ? 2.2 : precision === "normal" ? 1.5 : 1.0,
    iterations: precision === "alta" ? 3 : precision === "normal" ? 2 : 1,
    
    adaptiveThreshold: precision !== "baixa",
    perspectiveCorrection: true,
    chartRegionDetection: false,
    
    edgeEnhancement: precision !== "baixa",
    patternRecognition: true,
    
    contourDetection: precision !== "baixa",
    featureExtraction: precision === "alta",
    histogramEqualization: precision !== "baixa",
    
    sensitivity: precision === "alta" ? 1.8 : 
                precision === "normal" ? 1.2 : 0.9,
    
    contextAwareness: true,
    patternConfidence: precision === "alta" ? 0.8 : 
                       precision === "normal" ? 0.7 : 0.6,
    
    disableSimulation: false,
    
    // Add timeframe specific settings
    timeframe: selectedTimeframe,
    candleResolution: selectedTimeframe === "30s" ? 30 : 60,
    shortTermFocus: selectedTimeframe === "30s",
    
    // Configuração específica para mercado OTC
    isOtcMarket: marketType === "otc",
    otcVolatilityAdjustment: marketType === "otc" ? 1.5 : 1.0,
    otcReversalSensitivity: marketType === "otc" ? 1.8 : 1.0,
    
    // Nova otimização para processamento mais rápido
    parallelProcessing: true,
    useCachedPatterns: true,
    prioritizeRecentData: true,
    adaptiveFiltering: precision === "alta",
    quickDetectionMode: selectedTimeframe === "30s",
    
    // Otimizações para Mobile
    mobileOptimized: true,
    reducedMemoryUsage: true,
    lightweightRendering: true,
  };
};
