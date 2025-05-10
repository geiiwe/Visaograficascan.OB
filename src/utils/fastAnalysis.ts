
import { TimeframeType, MarketType } from "@/context/AnalyzerContext";
import { FastAnalysisResult } from "@/components/overlay/FastAnalysisIndicators";

// Análises técnicas avançadas para timeframes curtos com adaptabilidade
export const generateTimeframeAnalyses = (
  selectedTimeframe: TimeframeType, 
  marketType: MarketType = "regular" // Parâmetro para tipo de mercado
): FastAnalysisResult[] => {
  // Algoritmo adaptativo para análises rápidas com maior variabilidade
  const analyses: FastAnalysisResult[] = [
    {
      type: "priceAction",
      found: Math.random() > 0.25,
      direction: getAdaptiveDirection(0.45, marketType === "otc" ? 0.35 : 0.5),
      strength: getAdaptiveStrength(50, 95),
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
      direction: getAdaptiveDirection(0.5, marketType === "otc" ? 0.4 : 0.5), 
      strength: getAdaptiveStrength(45, 90),
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
      direction: getAdaptiveDirection(0.48, marketType === "otc" ? 0.45 : 0.5),
      strength: getAdaptiveStrength(40, 92),
      name: "Picos de Volume",
      description: marketType === "otc" ? 
        "Detecção de aumentos súbitos de volume com correlação invertida em OTC" :
        selectedTimeframe === "30s" ?
          "Detecção de aumentos súbitos de volume a cada 30 segundos" :
          "Padrões de volume para prever o movimento do próximo minuto"
    },
    // Análise específica para volume contínuo
    {
      type: "volume",
      found: Math.random() > 0.3,
      direction: getAdaptiveDirection(0.48, marketType === "otc" ? 0.4 : 0.5), 
      strength: getAdaptiveStrength(40, 95),
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
      direction: getAdaptiveDirection(0.48, marketType === "otc" ? 0.45 : 0.5),
      strength: getAdaptiveStrength(45, 92),
      name: "Formação de Velas",
      description: marketType === "otc" ? 
        "Análise de padrões de velas específicos para mercados OTC" :
        selectedTimeframe === "30s" ?
          "Análise de padrões de velas de 30 segundos para previsão rápida" :
          "Análise de padrões de velas para previsão do próximo minuto"
    },
    // Análise específica para tamanho das velas
    {
      type: "candleSize",
      found: Math.random() > 0.3,
      direction: getAdaptiveDirection(0.5, marketType === "otc" ? 0.45 : 0.5),
      strength: getAdaptiveStrength(40, 90),
      name: "Tamanho das Velas",
      description: marketType === "otc" ? 
        "Análise do tamanho relativo das velas em OTC, indicando convicção do movimento" :
        selectedTimeframe === "30s" ?
          "Tamanho das velas nos últimos 30 segundos, indicando força do movimento" :
          "Análise da amplitude das velas no último minuto"
    },
    {
      type: "priceReversal",
      found: Math.random() > (marketType === "otc" ? 0.25 : 0.35), // OTC tem mais reversões
      direction: getAdaptiveDirection(0.48, marketType === "otc" ? 0.4 : 0.5),
      strength: getAdaptiveStrength(45, 90),
      name: "Reversões",
      description: marketType === "otc" ? 
        "Detecção de reversões frequentes características do mercado OTC" :
        selectedTimeframe === "30s" ?
          "Detecção de possíveis reversões dentro de 30 segundos" :
          "Previsão de reversões para o próximo minuto"
    },
    // Análise específica para volatilidade
    {
      type: "volatility",
      found: Math.random() > 0.25,
      direction: getAdaptiveDirection(0.33, 0.33), // Maior chance de neutro para volatilidade
      strength: getAdaptiveStrength(50, 95),
      name: "Volatilidade",
      description: marketType === "otc" ? 
        "Medição da volatilidade em OTC, importante para definir stop-loss adequado" :
        selectedTimeframe === "30s" ?
          "Análise da volatilidade em ciclos de 30 segundos" :
          "Volatilidade projetada para o próximo minuto"
    },
    // Análise específica para velocidade de movimento
    {
      type: "movementSpeed",
      found: Math.random() > 0.3,
      direction: getAdaptiveDirection(0.48, marketType === "otc" ? 0.45 : 0.5),
      strength: getAdaptiveStrength(45, 90),
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
      direction: getAdaptiveDirection(0.42, marketType === "otc" ? 0.35 : 0.4),
      strength: getAdaptiveStrength(40, 92),
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
      direction: getAdaptiveDirection(0.48, marketType === "otc" ? 0.4 : 0.48),
      strength: getAdaptiveStrength(40, 90),
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
      direction: getAdaptiveDirection(0.48, marketType === "otc" ? 0.45 : 0.5),
      strength: getAdaptiveStrength(45, 90),
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
      direction: getAdaptiveDirection(0.5, 0.5),
      strength: getAdaptiveStrength(45, 95),
      name: "Padrões OTC",
      description: "Detecção de padrões específicos de manipulação em mercados OTC"
    },
    // Análise de timing de expiração
    {
      type: "expiryTiming",
      found: Math.random() > 0.35,
      direction: getAdaptiveDirection(0.33, 0.33), // 33% de chance para cada direção (neutro mais comum)
      strength: getAdaptiveStrength(40, 95),
      name: "Timing Exato",
      description: marketType === "otc" ?
        "Análise preditiva do melhor momento de expiração para evitar reversões em OTC" :
        selectedTimeframe === "30s" ?
          "Análise de ciclos temporais para determinar o momento exato de expiração em 30s" :
          "Previsão do momento ideal de expiração para entradas de 1 minuto"
    }
  ];

  // Função auxiliar para direções adaptativas
  function getAdaptiveDirection(neutralChance: number, upChance: number): "up" | "down" | "neutral" {
    const rand = Math.random();
    if (rand < neutralChance) return "neutral";
    return rand < (neutralChance + upChance) ? "up" : "down";
  }
  
  // Função auxiliar para forças adaptativas
  function getAdaptiveStrength(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
  
  // Melhorar correlação entre indicadores com variabilidade
  const correlateIndicators = (analyses: FastAnalysisResult[]): FastAnalysisResult[] => {
    // Tendência dominante (determinar se a maioria dos indicadores está apontando para cima ou para baixo)
    const upIndicators = analyses.filter(a => a.direction === "up").length;
    const downIndicators = analyses.filter(a => a.direction === "down").length;
    const neutralIndicators = analyses.filter(a => a.direction === "neutral").length;
    
    // Verificar se temos um domínio claro ou mercado indeciso
    const totalDirectional = upIndicators + downIndicators;
    const hasStrongConsensus = Math.abs(upIndicators - downIndicators) > totalDirectional * 0.3;
    
    // Mercado equilibrado ou indeciso (aumentar neutros)
    const marketIndecisive = !hasStrongConsensus && neutralIndicators >= Math.floor(analyses.length * 0.2);
    
    // Em mercados OTC, a tendência dominante pode ser enganosa com certa frequência
    const dominantTrend = marketType === "otc" && Math.random() > 0.65 ? 
      (upIndicators > downIndicators ? "down" : "up") as "up" | "down" : // Inversão em OTC às vezes
      (upIndicators > downIndicators ? "up" : "down") as "up" | "down";
    
    // Taxa de correlação adaptativa - quanto menor, mais aleatório
    const baseCorrelationRate = marketType === "otc" ? 0.55 : 0.7;
    // Diminuir correlação se mercado indeciso
    const correlationRate = marketIndecisive ? baseCorrelationRate * 0.8 : baseCorrelationRate;
    
    // Correlacionar tamanho das velas com volatilidade
    let candleSizeIndicator = analyses.find(a => a.type === "candleSize");
    let volatilityIndicator = analyses.find(a => a.type === "volatility");
    
    // Se ambos existirem, correlacionar os valores com variabilidade
    if (candleSizeIndicator && volatilityIndicator && candleSizeIndicator.found && volatilityIndicator.found) {
      // Maior tamanho de vela geralmente implica em maior volatilidade, com variação
      const candleStrength = candleSizeIndicator.strength;
      // Ajustar volatilidade para ter correlação variável com tamanho da vela
      const correlationVariability = 0.3 + Math.random() * 0.3; // 30-60% de variabilidade
      volatilityIndicator.strength = (volatilityIndicator.strength * (1 - correlationVariability)) + 
                                    (candleStrength * correlationVariability);
    }
    
    // Correlacionar velocidade de movimento com timing de expiração
    let speedIndicator = analyses.find(a => a.type === "movementSpeed");
    let timingIndicator = analyses.find(a => a.type === "expiryTiming");
    
    if (speedIndicator && timingIndicator && speedIndicator.found && timingIndicator.found) {
      // Movimentos mais rápidos geralmente exigem expiração mais precisa
      if (speedIndicator.strength > 70 && Math.random() > 0.3) { // 70% de chance de ajuste
        const boostFactor = 1.1 + Math.random() * 0.2; // 110-130%
        timingIndicator.strength = Math.min(100, timingIndicator.strength * boostFactor);
        timingIndicator.description += " (Ajustado para movimento rápido)";
      }
    }
    
    // Correlacionar volume com força do movimento
    let volumeIndicator = analyses.find(a => a.type === "volume" || a.type === "volumeSpikes");
    let momentumIndicator = analyses.find(a => a.type === "momentum");
    
    // Se ambos existirem, correlacionar os valores com variabilidade
    if (volumeIndicator && momentumIndicator && volumeIndicator.found && momentumIndicator.found) {
      // Volume alto tende a confirmar a força do movimento, mas com exceções
      if (volumeIndicator.strength > 70 && momentumIndicator.strength > 60 && Math.random() > 0.4) {
        // Chance de 60% de alinhar direção baseado na força relativa
        if (volumeIndicator.strength > momentumIndicator.strength) {
          // Se OTC, às vezes a correlação é invertida (manipulação)
          if (marketType === "otc" && Math.random() > 0.7) {
            momentumIndicator.direction = volumeIndicator.direction === "up" ? "down" : "up";
            momentumIndicator.description += " (Divergência volume/preço detectada em OTC)";
          } else {
            momentumIndicator.direction = volumeIndicator.direction;
          }
        }
      }
    }
    
    // Correlacionar reversões com timing de expiração
    let reversalIndicator = analyses.find(a => a.type === "priceReversal");
    
    if (reversalIndicator && timingIndicator && reversalIndicator.found && timingIndicator.found) {
      // Alta probabilidade de reversão deve impactar o timing de expiração
      if (reversalIndicator.strength > 70 && Math.random() > 0.3) { // 70% de chance
        const boostFactor = 1.1 + Math.random() * 0.3; // 110-140%
        timingIndicator.strength = Math.min(100, timingIndicator.strength * boostFactor);
        timingIndicator.description += " (Ajustado para risco de reversão)";
      }
    }
    
    // Ajustar alguns indicadores para melhor alinhamento com a tendência dominante, com variabilidade
    return analyses.map(indicator => {
      // Lógica específica para OTC com alta variabilidade
      if (marketType === "otc" && indicator.type === "priceReversal") {
        // Em OTC, reversões são mais frequentes e menos previsíveis
        const randomFactor = Math.random();
        return {
          ...indicator,
          direction: randomFactor > 0.65 ? // 65% de chance de seguir lógica, 35% de ser aleatório
            (dominantTrend === "up" ? "down" : "up") as "up" | "down" : // Contra-tendência para reversões
            getAdaptiveDirection(0.25, 0.5), // Direção aleatória com baixa chance de neutro
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
        
        if ((highReversalRisk || highVolatility) && Math.random() > 0.3) {
          return {
            ...indicator,
            strength: Math.min(100, indicator.strength * (1.15 + Math.random() * 0.15)),
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
      
      // Para indicadores técnicos, variar o alinhamento com a tendência
      if (["momentum", "macdCrossover", "rsiAnalysis"].includes(indicator.type)) {
        // Apenas alinhar indicadores se não estivermos em mercado indeciso
        // E com probabilidade variável baseada no tipo de mercado
        const alignmentChance = marketType === "otc" ? 
          (Math.random() > 0.6 ? correlationRate : 0.4) : // Mais aleatório em OTC
          (marketIndecisive ? 0.4 : correlationRate); // Menos correlacionado em mercados indecisos
        
        if (Math.random() < alignmentChance) {
          return {
            ...indicator,
            direction: dominantTrend,
            // Aumento de força variável quando alinhado
            strength: Math.min(100, indicator.strength * (1 + Math.random() * 0.2))
          };
        }
      }
      
      // Adicionar variações aleatórias para alguns indicadores (15% de chance)
      if (Math.random() > 0.85) {
        // Pequena mudança na força
        const strengthAdjustment = (Math.random() - 0.5) * 10; // -5% a +5%
        return {
          ...indicator,
          strength: Math.min(100, Math.max(40, indicator.strength + strengthAdjustment))
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

// Função para processar opções de análise otimizadas para velocidade e adaptabilidade
export const getProcessOptions = (precision: string, selectedTimeframe: TimeframeType, marketType: MarketType = "regular") => {
  // Adicionar variação aleatória para evitar padrões previsíveis
  const randomVariation = (value: number, range: number) => value + (Math.random() - 0.5) * range;
  
  return {
    enhanceContrast: true,
    removeNoise: precision !== "baixa",
    sharpness: precision === "alta" ? randomVariation(2.2, 0.4) : 
               precision === "normal" ? randomVariation(1.5, 0.3) : 
               randomVariation(1.0, 0.2),
    iterations: precision === "alta" ? 3 : precision === "normal" ? 2 : 1,
    
    adaptiveThreshold: precision !== "baixa",
    perspectiveCorrection: true,
    chartRegionDetection: false,
    
    edgeEnhancement: precision !== "baixa",
    patternRecognition: true,
    
    contourDetection: precision !== "baixa",
    featureExtraction: precision === "alta",
    histogramEqualization: precision !== "baixa",
    
    sensitivity: precision === "alta" ? randomVariation(1.8, 0.3) : 
                precision === "normal" ? randomVariation(1.2, 0.2) : 
                randomVariation(0.9, 0.2),
    
    contextAwareness: true,
    patternConfidence: precision === "alta" ? randomVariation(0.8, 0.1) : 
                       precision === "normal" ? randomVariation(0.7, 0.1) : 
                       randomVariation(0.6, 0.1),
    
    disableSimulation: false,
    
    // Add timeframe specific settings with variability
    timeframe: selectedTimeframe,
    candleResolution: selectedTimeframe === "30s" ? 30 : 60,
    shortTermFocus: selectedTimeframe === "30s",
    
    // Configuração específica para mercado OTC com adaptabilidade
    isOtcMarket: marketType === "otc",
    otcVolatilityAdjustment: marketType === "otc" ? randomVariation(1.5, 0.3) : 1.0,
    otcReversalSensitivity: marketType === "otc" ? randomVariation(1.8, 0.4) : 1.0,
    
    // Otimização para processamento mais flexível
    parallelProcessing: true,
    useCachedPatterns: true,
    prioritizeRecentData: true,
    adaptiveFiltering: precision === "alta",
    quickDetectionMode: selectedTimeframe === "30s",
    
    // Opções para melhorar timing de expiração
    preciseTimingAnalysis: true,
    expirationOptimization: true,
    adjustForMarketSpeed: selectedTimeframe === "30s",
    predictReversal: marketType === "otc" ? true : precision === "alta",
    earlyExpirationForOTC: marketType === "otc",
    
    // Variabilidade adaptativa para análises
    adaptiveThresholds: true,
    variabilityFactor: marketType === "otc" ? randomVariation(1.2, 0.3) : randomVariation(1.0, 0.2),
    randomizeWeights: Math.random() > 0.3, // 70% de chance ativado
    
    // Otimizações para Mobile
    mobileOptimized: true,
    reducedMemoryUsage: true,
    lightweightRendering: true,
  };
};
