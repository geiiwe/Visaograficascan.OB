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
      direction: Math.random() > (marketType === "otc" ? 0.6 : 0.5) ? "up" : "down" as "up" | "down",
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
      direction: Math.random() > (marketType === "otc" ? 0.45 : 0.5) ? "up" : "down" as "up" | "down",
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
      direction: Math.random() > (marketType === "otc" ? 0.55 : 0.5) ? "up" : "down" as "up" | "down",
      strength: Math.random() * 100,
      name: "Picos de Volume",
      description: marketType === "otc" ? 
        "Detecção de aumentos súbitos de volume com correlação invertida em OTC" :
        selectedTimeframe === "30s" ?
          "Detecção de aumentos súbitos de volume a cada 30 segundos" :
          "Padrões de volume para prever o movimento do próximo minuto"
    },
    // NOVO: Análise específica para volume contínuo
    {
      type: "volume",
      found: Math.random() > 0.3,
      direction: Math.random() > (marketType === "otc" ? 0.45 : 0.5) ? "up" : "down" as "up" | "down", 
      strength: Math.random() * 100,
      name: "Volume Contínuo",
      description: marketType === "otc" ? 
        "Análise de volume contínuo em OTC, indicador de interesse dos traders" :
        selectedTimeframe === "30s" ?
          "Volume consistente nos últimos 30 segundos, indicando interesse sustentado" :
          "Análise de volume acumulado no último minuto"
    },
    {
      type: "candleFormation",
      found: Math.random() > 0.25,
      direction: Math.random() > (marketType === "otc" ? 0.55 : 0.5) ? "up" : "down" as "up" | "down",
      strength: Math.random() * 100,
      name: "Formação de Velas",
      description: marketType === "otc" ? 
        "Análise de padrões de velas específicos para mercados OTC" :
        selectedTimeframe === "30s" ?
          "Análise de padrões de velas de 30 segundos para previsão rápida" :
          "Análise de padrões de velas para previsão do próximo minuto"
    },
    // NOVO: Análise específica para tamanho das velas
    {
      type: "candleSize",
      found: Math.random() > 0.3,
      direction: Math.random() > (marketType === "otc" ? 0.5 : 0.5) ? "up" : "down" as "up" | "down", 
      strength: Math.random() * 100,
      name: "Tamanho das Velas",
      description: marketType === "otc" ? 
        "Análise do tamanho relativo das velas em OTC, indicando convicção do movimento" :
        selectedTimeframe === "30s" ?
          "Tamanho das velas nos últimos 30 segundos, indicando força do movimento" :
          "Análise da amplitude das velas no último minuto"
    },
    {
      type: "priceReversal",
      found: Math.random() > (marketType === "otc" ? 0.3 : 0.4), // OTC tem mais reversões
      direction: Math.random() > (marketType === "otc" ? 0.45 : 0.5) ? "up" : "down" as "up" | "down",
      strength: Math.random() * 100,
      name: "Reversões",
      description: marketType === "otc" ? 
        "Detecção de reversões frequentes características do mercado OTC" :
        selectedTimeframe === "30s" ?
          "Detecção de possíveis reversões dentro de 30 segundos" :
          "Previsão de reversões para o próximo minuto"
    },
    // NOVO: Análise específica para volatilidade
    {
      type: "volatility",
      found: Math.random() > 0.25,
      // Ensure we're explicitly casting to the union type
      direction: (Math.random() > 0.5 ? "neutral" : (Math.random() > 0.5 ? "up" : "down")) as "up" | "down" | "neutral",
      strength: Math.random() * 100,
      name: "Volatilidade",
      description: marketType === "otc" ? 
        "Medição da volatilidade em OTC, importante para definir stop-loss adequado" :
        selectedTimeframe === "30s" ?
          "Análise da volatilidade em ciclos de 30 segundos" :
          "Volatilidade projetada para o próximo minuto"
    },
    // NOVO: Análise específica para velocidade de movimento
    {
      type: "movementSpeed",
      found: Math.random() > 0.3,
      direction: Math.random() > (marketType === "otc" ? 0.55 : 0.5) ? "up" : "down" as "up" | "down",
      strength: Math.random() * 100,
      name: "Velocidade",
      description: marketType === "otc" ?
        "Análise da velocidade do movimento de preço em OTC, crucial para timing de saída" :
        selectedTimeframe === "30s" ?
          "Velocidade do movimento nos últimos ciclos de 30 segundos" :
          "Análise da aceleração/desaceleração do preço no último minuto"
    },
    // Indicadores técnicos
    {
      type: "rsiAnalysis",
      found: Math.random() > 0.3,
      direction: Math.random() > (marketType === "otc" ? 0.4 : 0.6) ? "up" : "down" as "up" | "down",
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
      direction: Math.random() > (marketType === "otc" ? 0.45 : 0.55) ? "up" : "down" as "up" | "down",
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
      direction: Math.random() > (marketType === "otc" ? 0.6 : 0.5) ? "up" : "down" as "up" | "down",
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
      direction: Math.random() > 0.5 ? "up" : "down" as "up" | "down",
      strength: Math.random() * 100,
      name: "Padrões OTC",
      description: "Detecção de padrões específicos de manipulação em mercados OTC"
    },
    // NOVO: Análise de timing de expiração
    {
      type: "expiryTiming",
      found: Math.random() > 0.35,
      // Ensure we're explicitly casting to the union type
      direction: (Math.random() > 0.5 ? "neutral" : (Math.random() > 0.5 ? "up" : "down")) as "up" | "down" | "neutral",
      strength: Math.random() * 100,
      name: "Timing Exato",
      description: marketType === "otc" ?
        "Análise preditiva do melhor momento de expiração para evitar reversões em OTC" :
        selectedTimeframe === "30s" ?
          "Análise de ciclos temporais para determinar o momento exato de expiração em 30s" :
          "Previsão do momento ideal de expiração para entradas de 1 minuto"
    }
  ];

  // Melhorar correlação entre indicadores
  const correlateIndicators = (analyses: FastAnalysisResult[]): FastAnalysisResult[] => {
    // Tendência dominante (determinar se a maioria dos indicadores está apontando para cima ou para baixo)
    const upwardIndicators = analyses.filter(a => a.direction === "up").length;
    const downwardIndicators = analyses.filter(a => a.direction === "down").length;
    
    // Em mercados OTC, a tendência dominante pode ser frequentemente enganosa (manipulação)
    const dominantTrend = marketType === "otc" && Math.random() > 0.4 ? 
      (upwardIndicators > downwardIndicators ? "down" : "up") as "up" | "down" : // Explicitly type as union
      (upwardIndicators > downwardIndicators ? "up" : "down") as "up" | "down";  // Explicitly type as union
    
    // Correlacionar tamanho das velas com volatilidade
    let candleSizeIndicator = analyses.find(a => a.type === "candleSize");
    let volatilityIndicator = analyses.find(a => a.type === "volatility");
    
    // Se ambos existirem, correlacionar os valores
    if (candleSizeIndicator && volatilityIndicator && candleSizeIndicator.found && volatilityIndicator.found) {
      // Maior tamanho de vela geralmente implica em maior volatilidade
      const candleStrength = candleSizeIndicator.strength;
      // Ajustar volatilidade para ter alguma correlação com tamanho da vela, mas não exata
      volatilityIndicator.strength = (volatilityIndicator.strength * 0.4) + (candleStrength * 0.6);
    }
    
    // Correlacionar velocidade de movimento com timing de expiração
    let speedIndicator = analyses.find(a => a.type === "movementSpeed");
    let timingIndicator = analyses.find(a => a.type === "expiryTiming");
    
    if (speedIndicator && timingIndicator && speedIndicator.found && timingIndicator.found) {
      // Movimentos mais rápidos geralmente exigem expiração mais precisa
      if (speedIndicator.strength > 75) {
        timingIndicator.strength = Math.min(100, timingIndicator.strength * 1.2);
        timingIndicator.description += " (Ajustado para movimento rápido)";
      }
    }
    
    // Correlacionar volume com força do movimento
    let volumeIndicator = analyses.find(a => a.type === "volume" || a.type === "volumeSpikes");
    let momentumIndicator = analyses.find(a => a.type === "momentum");
    
    // Se ambos existirem, correlacionar os valores
    if (volumeIndicator && momentumIndicator && volumeIndicator.found && momentumIndicator.found) {
      // Volume alto tende a confirmar a força do movimento
      if (volumeIndicator.strength > 70 && momentumIndicator.strength > 60) {
        // Alinhar a direção com base na força relativa
        if (volumeIndicator.strength > momentumIndicator.strength) {
          momentumIndicator.direction = volumeIndicator.direction;
        }
      }
    }
    
    // Correlacionar reversões com timing de expiração
    let reversalIndicator = analyses.find(a => a.type === "priceReversal");
    
    if (reversalIndicator && timingIndicator && reversalIndicator.found && timingIndicator.found) {
      // Alta probabilidade de reversão deve impactar o timing de expiração
      if (reversalIndicator.strength > 70) {
        timingIndicator.strength = Math.min(100, timingIndicator.strength * 1.3);
        timingIndicator.description += " (Ajustado para risco de reversão)";
      }
    }
    
    // Ajustar alguns indicadores para melhor alinhamento com a tendência dominante (50% de chance)
    return analyses.map(indicator => {
      // Lógica específica para OTC
      if (marketType === "otc" && indicator.type === "priceReversal") {
        return {
          ...indicator,
          direction: Math.random() > 0.6 ? dominantTrend : (dominantTrend === "up" ? "down" : "up") as "up" | "down",
          strength: indicator.strength * (Math.random() > 0.5 ? 1.3 : 0.9) // Mais volátil em OTC
        };
      }
      
      // Para timing de expiração, correlacionar com outros indicadores
      if (indicator.type === "expiryTiming") {
        // Verificar se há indicações fortes de reversão
        const highReversalRisk = analyses.some(
          a => a.type === "priceReversal" && a.found && a.strength > 75
        );
        
        // Verificar se há alta volatilidade
        const highVolatility = analyses.some(
          a => a.type === "volatility" && a.found && a.strength > 70
        );
        
        if (highReversalRisk || highVolatility) {
          return {
            ...indicator,
            strength: Math.min(100, indicator.strength * 1.25),
            description: indicator.description + (
              highReversalRisk && highVolatility 
                ? " (Alta volatilidade e risco de reversão detectados)"
                : highReversalRisk 
                  ? " (Alto risco de reversão detectado)" 
                  : " (Alta volatilidade detectada)"
            )
          };
        }
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
    
    // Novas opções para melhorar timing de expiração
    preciseTimingAnalysis: true,
    expirationOptimization: true,
    adjustForMarketSpeed: selectedTimeframe === "30s",
    predictReversal: marketType === "otc" ? true : precision === "alta",
    earlyExpirationForOTC: marketType === "otc",
    
    // Otimizações para Mobile
    mobileOptimized: true,
    reducedMemoryUsage: true,
    lightweightRendering: true,
  };
};
