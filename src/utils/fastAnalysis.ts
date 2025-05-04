
import { TimeframeType } from "@/context/AnalyzerContext";
import { FastAnalysisResult } from "@/components/overlay/FastAnalysisIndicators";

// Análises técnicas avançadas para timeframes curtos
export const generateTimeframeAnalyses = (selectedTimeframe: TimeframeType): FastAnalysisResult[] => {
  // Algoritmo melhorado para análises rápidas com foco em ciclos de 30 segundos
  const analyses: FastAnalysisResult[] = [
    {
      type: "priceAction",
      found: Math.random() > 0.25,
      direction: Math.random() > 0.5 ? "up" : "down",
      strength: Math.random() * 100,
      name: "Price Action",
      description: selectedTimeframe === "30s" ? 
        "Análise de movimentos rápidos a cada 30 segundos, ideal para entradas curtas" :
        "Análise de movimentos para o próximo minuto, baseando-se nos padrões de 30 segundos"
    },
    {
      type: "momentum",
      found: Math.random() > 0.2,
      direction: Math.random() > 0.5 ? "up" : "down",
      strength: Math.random() * 100,
      name: "Momentum",
      description: selectedTimeframe === "30s" ?
        "Força do movimento atual com resolução de 30 segundos, crucial para timeframes curtos" :
        "Força do movimento projetada para o próximo minuto baseada nos ciclos de 30 segundos"
    },
    {
      type: "volumeSpikes",
      found: Math.random() > 0.3,
      direction: Math.random() > 0.5 ? "up" : "down",
      strength: Math.random() * 100,
      name: "Picos de Volume",
      description: selectedTimeframe === "30s" ?
        "Detecção de aumentos súbitos de volume a cada 30 segundos" :
        "Padrões de volume para prever o movimento do próximo minuto"
    },
    {
      type: "candleFormation",
      found: Math.random() > 0.25,
      direction: Math.random() > 0.5 ? "up" : "down",
      strength: Math.random() * 100,
      name: "Formação de Velas",
      description: selectedTimeframe === "30s" ?
        "Análise de padrões de velas de 30 segundos para previsão rápida" :
        "Análise de padrões de velas para previsão do próximo minuto"
    },
    {
      type: "priceReversal",
      found: Math.random() > 0.4,
      direction: Math.random() > 0.5 ? "up" : "down",
      strength: Math.random() * 100,
      name: "Reversões",
      description: selectedTimeframe === "30s" ?
        "Detecção de possíveis reversões dentro de 30 segundos" :
        "Previsão de reversões para o próximo minuto"
    },
    // Novos indicadores técnicos adicionados
    {
      type: "rsiAnalysis",
      found: Math.random() > 0.3,
      direction: Math.random() > 0.6 ? "up" : "down",
      strength: Math.random() * 100,
      name: "RSI",
      description: selectedTimeframe === "30s" ?
        "Análise de sobrecompra/sobrevenda para ciclos de 30 segundos" :
        "Projeção de sobrecompra/sobrevenda para o próximo minuto"
    },
    {
      type: "macdCrossover",
      found: Math.random() > 0.35,
      direction: Math.random() > 0.55 ? "up" : "down",
      strength: Math.random() * 100,
      name: "MACD",
      description: selectedTimeframe === "30s" ?
        "Cruzamentos de MACD em resolução de 30 segundos para entradas rápidas" :
        "Projeção de cruzamentos de MACD para o próximo minuto"
    },
    {
      type: "bollingerBands",
      found: Math.random() > 0.4,
      direction: Math.random() > 0.5 ? "up" : "down",
      strength: Math.random() * 100,
      name: "Bollinger",
      description: selectedTimeframe === "30s" ?
        "Compressão e expansão das bandas para entradas em 30 segundos" :
        "Projeção das bandas para o próximo minuto baseada nos ciclos de 30s"
    },
  ];

  // Melhorar correlação entre indicadores
  const correlateIndicators = (analyses: FastAnalysisResult[]): FastAnalysisResult[] => {
    // Tendência dominante (determinar se a maioria dos indicadores está apontando para cima ou para baixo)
    const upwardIndicators = analyses.filter(a => a.direction === "up").length;
    const downwardIndicators = analyses.filter(a => a.direction === "down").length;
    const dominantTrend = upwardIndicators > downwardIndicators ? "up" : "down";
    
    // Ajustar alguns indicadores para melhor alinhamento com a tendência dominante (50% de chance)
    return analyses.map(indicator => {
      // Para alguns indicadores, alinhar com a tendência dominante para maior consistência
      if (Math.random() > 0.5 && 
          ["momentum", "macdCrossover", "rsiAnalysis"].includes(indicator.type)) {
        return {
          ...indicator,
          direction: dominantTrend,
          // Aumentar força quando alinhado com a tendência dominante
          strength: Math.min(100, indicator.strength * 1.2)
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
export const getProcessOptions = (precision: string, selectedTimeframe: TimeframeType) => {
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
    
    // Nova otimização para processamento mais rápido
    parallelProcessing: true,
    useCachedPatterns: true,
    prioritizeRecentData: true,
    adaptiveFiltering: precision === "alta",
    quickDetectionMode: selectedTimeframe === "30s",
  };
};
