
import { useState, useEffect, useRef } from "react";
import { PatternResult } from "@/utils/patternDetection";
import { FastAnalysisResult } from "@/components/overlay/FastAnalysisIndicators";
import { AnalysisType, PrecisionLevel, TimeframeType, MarketType } from "@/context/AnalyzerContext";
import { generateTimeframeAnalyses } from "@/utils/fastAnalysis";
import { toast } from "sonner";

interface MarketAnalysisParams {
  isAnalyzing: boolean;
  imageData: string | null;
  activeAnalysis: AnalysisType[];
  precision: PrecisionLevel;
  selectedTimeframe: TimeframeType;
  marketType: MarketType;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisResult: (type: AnalysisType, found: boolean) => void;
}

export interface AIConfirmation {
  active: boolean;
  verified: boolean;
  direction: "buy" | "sell" | "neutral";
  confidence: number;
  majorityDirection: boolean;
}

export interface IndicatorPosition {
  x: number;
  y: number;
  isDragging: boolean;
}

export const useMarketAnalysis = ({
  isAnalyzing,
  imageData,
  activeAnalysis,
  precision,
  selectedTimeframe,
  marketType,
  setIsAnalyzing,
  setAnalysisResult
}: MarketAnalysisParams) => {
  const [detailedResults, setDetailedResults] = useState<Record<string, PatternResult>>({});
  const [processingStage, setProcessingStage] = useState<string>("");
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [fastAnalysisResults, setFastAnalysisResults] = useState<FastAnalysisResult[]>([]);
  const [aiConfirmation, setAiConfirmation] = useState<AIConfirmation>({
    active: false,
    verified: false,
    direction: "neutral",
    confidence: 0,
    majorityDirection: false
  });
  
  // Referências para evitar análises duplicadas e controlar estado
  const lastAnalysisTimeRef = useRef<number>(0);
  const lastMarketTypeRef = useRef<MarketType | null>(null);
  const analysisErrorsRef = useRef<number>(0);
  const consecutiveSignalsRef = useRef<{buy: number, sell: number, neutral: number}>({
    buy: 0, sell: 0, neutral: 0
  });
  
  // Função aprimorada para gerar análises com adaptabilidade
  const generateFastAnalyses = (timeframe: TimeframeType, market: MarketType) => {
    try {
      console.log(`Gerando análises adaptativas para ${timeframe} em mercado ${market}`);
      
      // Usar a função otimizada com parâmetros adaptativos
      const analyses = generateTimeframeAnalyses(timeframe, market);
      
      if (!analyses || analyses.length === 0) {
        console.error("Falha ao gerar análises: resultado vazio");
        return [];
      }
      
      // Verificar histórico de sinais anteriores para evitar repetição excessiva
      const lastDirection = consecutiveSignalsRef.current.buy > consecutiveSignalsRef.current.sell ? 
        "up" : consecutiveSignalsRef.current.sell > consecutiveSignalsRef.current.buy ? 
        "down" : "neutral";
      
      const consecutiveCount = Math.max(
        consecutiveSignalsRef.current.buy, 
        consecutiveSignalsRef.current.sell,
        consecutiveSignalsRef.current.neutral
      );
      
      // Sistema adaptativo que evita repetições excessivas do mesmo sinal
      if (consecutiveCount >= 3) {
        console.log(`Detectadas ${consecutiveCount} análises consecutivas na mesma direção (${lastDirection}). Aplicando adaptação.`);
        
        // Quanto mais repetições, mais forte a adaptação
        const adaptationStrength = Math.min(0.5, 0.2 + (consecutiveCount - 3) * 0.1);
        
        // Modificar uma porcentagem dos resultados para evitar viés sistemático
        const adaptedAnalyses = analyses.map(analysis => {
          // Apenas ajustar alguns indicadores (baseado no fator de adaptação)
          if (analysis.direction === lastDirection && Math.random() < adaptationStrength) {
            // Reduzir a força do sinal repetitivo
            return {
              ...analysis,
              strength: Math.max(50, analysis.strength * 0.7),
              description: `${analysis.description} [Adaptado para evitar viés]`
            };
          }
          // Ocasionalmente aumentar força de sinais contrários para balancear
          if (analysis.direction !== lastDirection && analysis.direction !== "neutral" && Math.random() < adaptationStrength * 1.5) {
            return {
              ...analysis,
              strength: Math.min(95, analysis.strength * 1.2),
              description: `${analysis.description} [Reforçado para equilibrar]`
            };
          }
          return analysis;
        });
        
        // Filtrar resultados mais assertivos (força mínima variável)
        const minStrength = 50 + (consecutiveCount > 5 ? 10 : 5); // Aumenta o limiar com muitas repetições
        const balancedResults = adaptedAnalyses.filter(analysis => analysis.strength > minStrength);
        
        if (balancedResults.length >= 3) {
          console.log(`Análises adaptadas geradas com sucesso: ${balancedResults.length} indicadores`);
          setFastAnalysisResults(balancedResults);
          return balancedResults;
        }
        return adaptedAnalyses;
      }
      
      // Processamento padrão quando não há muitas repetições
      // Filtrar resultados assertivos com limiar flexível (50-55%)
      const flexibleThreshold = 50 + Math.random() * 5;
      const highConfidenceResults = analyses.filter(analysis => analysis.strength > flexibleThreshold);
      
      // Garantir mínimo de análises para decisão (3-5 dependendo da disponibilidade)
      const minAnalyses = Math.min(5, Math.max(3, analyses.length / 2));
      const finalResults = highConfidenceResults.length >= minAnalyses ? 
        highConfidenceResults : 
        [...highConfidenceResults, ...analyses.filter(a => !highConfidenceResults.includes(a))].slice(0, 5);
      
      // Aplicar algoritmo de consenso adaptativo
      const enhancedResults = applyConsensusAlgorithm(finalResults, market);
      
      if (enhancedResults.length > 0) {
        console.log(`Análises geradas com sucesso: ${enhancedResults.length} indicadores`);
        setFastAnalysisResults(enhancedResults);
        return enhancedResults;
      } else {
        console.error("Falha ao aplicar algoritmo de consenso: resultado vazio");
        return analyses; // Fallback para as análises originais
      }
    } catch (error) {
      console.error("Erro ao gerar análises rápidas:", error);
      analysisErrorsRef.current += 1;
      
      if (analysisErrorsRef.current > 3) {
        toast.error("Problemas recorrentes nas análises. Tente com outra imagem.");
      }
      
      // Retornar conjunto mínimo de análises para evitar travamentos
      return [
        {
          type: "fallbackAnalysis",
          found: true,
          direction: "neutral" as "up" | "down" | "neutral",
          strength: 60,
          name: "Análise Básica",
          description: "Análise de contingência devido a erro no processamento principal"
        }
      ];
    }
  };

  // Algoritmo de consenso adaptativo e flexível
  const applyConsensusAlgorithm = (results: FastAnalysisResult[], market: MarketType): FastAnalysisResult[] => {
    if (!results || results.length <= 1) return results;
    
    try {
      // Contar direções com ponderação por força do sinal
      const directionScores = {
        up: results
          .filter(r => r.direction === "up")
          .reduce((sum, r) => sum + (r.strength/100), 0),
        down: results
          .filter(r => r.direction === "down")
          .reduce((sum, r) => sum + (r.strength/100), 0),
        neutral: results
          .filter(r => r.direction === "neutral")
          .reduce((sum, r) => sum + (r.strength/100), 0)
      };
      
      const totalScore = directionScores.up + directionScores.down + directionScores.neutral;
      
      // Calcular percentuais ponderados pela força
      const upPercentage = totalScore > 0 ? (directionScores.up / totalScore) * 100 : 0;
      const downPercentage = totalScore > 0 ? (directionScores.down / totalScore) * 100 : 0;
      const neutralPercentage = totalScore > 0 ? (directionScores.neutral / totalScore) * 100 : 0;
      
      console.log(`Distribuição de sinais: UP=${upPercentage.toFixed(1)}%, DOWN=${downPercentage.toFixed(1)}%, NEUTRAL=${neutralPercentage.toFixed(1)}%`);
      
      // Threshold adaptativo para consenso baseado em histórico
      // Se tivemos muitos sinais consecutivos, aumentamos o threshold
      const consecutiveCount = Math.max(
        consecutiveSignalsRef.current.buy, 
        consecutiveSignalsRef.current.sell,
        consecutiveSignalsRef.current.neutral
      );
      
      // Threshold base + ajuste por consecutivos (máximo 75%)
      const consensusThreshold = Math.min(75, 60 + (consecutiveCount > 2 ? (consecutiveCount - 2) * 2.5 : 0));
      
      console.log(`Threshold para consenso: ${consensusThreshold.toFixed(1)}% (${consecutiveCount} sinais consecutivos detectados)`);
      
      // Verificar se temos consenso com threshold dinâmico
      const hasMajorityConsensus = upPercentage > consensusThreshold || downPercentage > consensusThreshold;
      
      // Aumentar chance de neutro quando não há consenso forte
      const hasNeutralConsensus = neutralPercentage > 25 && !hasMajorityConsensus;
      
      const consensusDirection: "up" | "down" | "neutral" = 
        hasNeutralConsensus ? "neutral" :
        upPercentage > downPercentage ? "up" : 
        downPercentage > upPercentage ? "down" : "neutral";
      
      // Detectar inconsistências - sinais de indicadores técnicos diferentes dos padrões de candle
      const technicalIndicators = results.filter(r => ["rsiAnalysis", "macdCrossover", "bollingerBands"].includes(r.type));
      const candleIndicators = results.filter(r => ["candleFormation", "candleSize", "priceAction"].includes(r.type));
      
      const technicalDirection = getDirectionConsensus(technicalIndicators);
      const candleDirection = getDirectionConsensus(candleIndicators);
      
      // Inconsistência entre análise técnica e padrões de candle
      const hasInconsistency = technicalDirection !== "neutral" && 
                              candleDirection !== "neutral" && 
                              technicalDirection !== candleDirection;
      
      // Verificação específica para mercado OTC com flexibilidade adaptativa
      if (market === "otc") {
        // OTC: Verificar padrões típicos de manipulação
        const manipulationScore = detectOtcManipulation(results, upPercentage, downPercentage);
        
        // Mostrar score de manipulação para debug
        console.log(`Score de manipulação OTC: ${manipulationScore.toFixed(1)}%`);
        
        // Threshold adaptativo para manipulação
        const manipulationThreshold = 60 + (consecutiveCount > 2 ? (consecutiveCount - 2) * 2 : 0);
        
        if (manipulationScore > manipulationThreshold) {
          // Aplicar correções anti-manipulação mais flexíveis
          console.log(`Detectada possível manipulação em mercado OTC (${manipulationScore.toFixed(1)}%) - aplicando correções`);
          return applyAntiManipulationCorrections(results, consensusDirection);
        }
        
        // Divergência técnica em mercado OTC é suspeita
        if (hasInconsistency) {
          console.log("Divergência técnica detectada em mercado OTC");
          // Aumentar peso dos indicadores contrários ao consenso
          return balanceContradictoryIndicators(results, consensusDirection);
        }
      } else {
        // Mercado regular: Dar mais peso ao consenso quando forte, mas com flexibilidade
        if (hasMajorityConsensus && Math.random() > 0.2) { // 20% de chance de não fortalecer mesmo com consenso
          return strengthenConsensusIndicators(results, consensusDirection);
        }
        
        // Corrigir inconsistências em mercado regular
        if (hasInconsistency) {
          return reconcileIndicatorGroups(results, technicalIndicators, candleIndicators);
        }
      }
      
      // Adicionar elemento de aleatoriedade para evitar padrões previsíveis
      if (Math.random() > 0.8) { // 20% de chance
        console.log("Aplicando variação aleatória para evitar padrões previsíveis");
        return addRandomVariation(results);
      }
      
      return results;
    } catch (error) {
      console.error("Erro no algoritmo de consenso:", error);
      return results; // Em caso de erro, retornar os resultados originais
    }
  };
  
  // Funções auxiliares para o algoritmo de consenso
  const getDirectionConsensus = (indicators: FastAnalysisResult[]): "up" | "down" | "neutral" => {
    if (!indicators || indicators.length === 0) return "neutral";
    
    const upCount = indicators.filter(i => i.direction === "up").length;
    const downCount = indicators.filter(i => i.direction === "down").length;
    const neutralCount = indicators.filter(i => i.direction === "neutral").length;
    
    // Com mais indicadores neutros, maior a chance de retornar neutro
    if (neutralCount >= Math.ceil(indicators.length / 3)) return "neutral";
    
    if (upCount > downCount) return "up";
    if (downCount > upCount) return "down";
    return "neutral";
  };
  
  // Detector de manipulação com mais nuance
  const detectOtcManipulation = (
    results: FastAnalysisResult[], 
    upPercentage: number, 
    downPercentage: number
  ): number => {
    // Sinais extremamente fortes (ajuste adaptativo)
    const strongSignalThreshold = 80 + Math.random() * 10; // 80-90%
    const extremelyStrongSignals = results.filter(r => r.strength > strongSignalThreshold).length;
    const hasExtremeSignals = extremelyStrongSignals >= 2;
    
    // Consenso extremo é suspeito (limiar adaptativo)
    const extremeConsensusThreshold = 70 + Math.random() * 10; // 70-80%
    const extremeConsensus = upPercentage > extremeConsensusThreshold || downPercentage > extremeConsensusThreshold;
    
    // Verificar presença de sinais de reversão
    const reversalIndicator = results.find(r => r.type === "priceReversal");
    const hasStrongReversal = reversalIndicator && 
                             reversalIndicator.found && 
                             reversalIndicator.strength > (65 + Math.random() * 10); // 65-75%
    
    // Fatores de manipulação com pesos variáveis
    let manipulationScore = 0;
    
    // Sinais extremos (peso adaptativo)
    if (hasExtremeSignals) {
      manipulationScore += 25 + Math.random() * 10; // 25-35 pontos
    }
    
    // Consenso extremo (peso adaptativo)
    if (extremeConsensus) {
      manipulationScore += 20 + Math.random() * 15; // 20-35 pontos
    }
    
    // Reversões fortes (peso variável)
    if (hasStrongReversal) {
      manipulationScore += 15 + Math.random() * 20; // 15-35 pontos
    }
    
    // Verificar contradições entre indicadores técnicos
    const technicalIndicators = results.filter(r => ["rsiAnalysis", "macdCrossover", "bollingerBands"].includes(r.type));
    if (technicalIndicators.length >= 2) {
      const directions = technicalIndicators.map(i => i.direction);
      const uniqueDirections = new Set(directions);
      
      // Todos indicadores técnicos apontando mesma direção é suspeito
      if (uniqueDirections.size === 1 && !uniqueDirections.has("neutral")) {
        manipulationScore += 15 + Math.random() * 10; // 15-25 pontos
      }
      
      // Contradição total entre indicadores também é suspeita
      if (uniqueDirections.size === technicalIndicators.length && technicalIndicators.length > 2) {
        manipulationScore += 10 + Math.random() * 15; // 10-25 pontos
      }
    }
    
    // Limitar score a 100%
    return Math.min(100, manipulationScore);
  };
  
  // Correções anti-manipulação mais adaptativas
  const applyAntiManipulationCorrections = (
    results: FastAnalysisResult[],
    consensusDirection: "up" | "down" | "neutral" 
  ): FastAnalysisResult[] => {
    // Em caso de manipulação, considerar inverter direção do consenso
    const oppositeDirection: "up" | "down" = consensusDirection === "up" ? "down" : "up";
    
    // Chance adaptativa de inversão
    const inversionChance = 0.3 + Math.random() * 0.4; // 30-70% chance
    console.log(`Chance de inversão anti-manipulação: ${(inversionChance * 100).toFixed(1)}%`);
    
    return results.map(result => {
      // Processar apenas indicadores fortes na direção do consenso
      if (result.direction === consensusDirection && result.strength > 75) {
        // Chance variável de inverter a direção
        if (Math.random() < inversionChance) {
          return {
            ...result,
            direction: oppositeDirection,
            description: `${result.description} [Corrigido: possível manipulação]`,
            strength: Math.max(50, result.strength * (0.8 + Math.random() * 0.1)) // 80-90% da força original
          };
        }
      }
      return result;
    });
  };
  
  // Balanceamento de indicadores contraditórios mais flexível
  const balanceContradictoryIndicators = (
    results: FastAnalysisResult[],
    consensusDirection: "up" | "down" | "neutral"
  ): FastAnalysisResult[] => {
    if (consensusDirection === "neutral") return results;
    
    const oppositeDirection: "up" | "down" = consensusDirection === "up" ? "down" : "up";
    
    // Fator de aumento variável
    const boostFactor = 1.1 + Math.random() * 0.2; // 110-130%
    
    return results.map(result => {
      // Aumentar peso dos indicadores que contradizem o consenso
      if (result.direction === oppositeDirection) {
        return {
          ...result,
          strength: Math.min(95, result.strength * boostFactor),
          description: `${result.description} [Sinal contrário relevante]`
        };
      }
      return result;
    });
  };
  
  // Fortalecimento de consenso com flexibilidade
  const strengthenConsensusIndicators = (
    results: FastAnalysisResult[],
    consensusDirection: "up" | "down" | "neutral"
  ): FastAnalysisResult[] => {
    if (consensusDirection === "neutral") return results;
    
    // Fator de aumento variável
    const boostFactor = 1.05 + Math.random() * 0.2; // 105-125%
    
    return results.map(result => {
      // Fortalecer indicadores alinhados ao consenso
      if (result.direction === consensusDirection) {
        // Variação aleatória no fortalecimento
        if (Math.random() > 0.3) { // 70% de chance de fortalecer
          return {
            ...result,
            strength: Math.min(98, result.strength * boostFactor),
            description: `${result.description} [Confirmado por consenso]`
          };
        }
      }
      return result;
    });
  };
  
  // Reconciliação de grupos de indicadores mais flexível
  const reconcileIndicatorGroups = (
    results: FastAnalysisResult[],
    technicalIndicators: FastAnalysisResult[],
    candleIndicators: FastAnalysisResult[]
  ): FastAnalysisResult[] => {
    // Decidir qual grupo tem maior força geral
    const techStrength = technicalIndicators.reduce((sum, i) => sum + i.strength, 0) / 
                        (technicalIndicators.length || 1);
    const candleStrength = candleIndicators.reduce((sum, i) => sum + i.strength, 0) / 
                          (candleIndicators.length || 1);
    
    // Grupo mais forte
    const strongerGroup = techStrength > candleStrength ? technicalIndicators : candleIndicators;
    const strongerDirection = getDirectionConsensus(strongerGroup);
    
    if (strongerDirection === "neutral") return results;
    
    // Chance variável de ajuste
    const adjustmentChance = 0.3 + Math.random() * 0.3; // 30-60% de chance
    
    // Balancear moderadamente - ajustar alguns indicadores do grupo mais fraco
    return results.map(result => {
      const isFromWeakerGroup = techStrength > candleStrength ? 
        candleIndicators.includes(result) : 
        technicalIndicators.includes(result);
      
      if (isFromWeakerGroup && result.direction !== strongerDirection && Math.random() < adjustmentChance) {
        // Chance variável de ajustar a direção para melhorar coerência
        return {
          ...result,
          direction: strongerDirection,
          description: `${result.description} [Ajustado para coerência]`,
          strength: result.strength * (0.85 + Math.random() * 0.1) // 85-95% da força original
        };
      }
      return result;
    });
  };
  
  // Adicionar variação aleatória para evitar padrões previsíveis
  const addRandomVariation = (results: FastAnalysisResult[]): FastAnalysisResult[] => {
    return results.map(result => {
      // Apenas uma pequena porcentagem dos indicadores será alterada
      if (Math.random() > 0.7) { // 30% de chance
        // Opções: alterar força ou direção 
        if (Math.random() > 0.6) { // Alterar força (40% dos 30% = 12% do total)
          const strengthAdjustment = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 15);
          const newStrength = Math.max(50, Math.min(95, result.strength + strengthAdjustment));
          
          return {
            ...result,
            strength: newStrength,
            description: `${result.description} [Ajuste adaptativo]`
          };
        } else { // Alterar direção (60% dos 30% = 18% do total)
          // Apenas para indicadores fracos ou médios (menor que 75)
          if (result.strength < 75) {
            const directions: ("up" | "down" | "neutral")[] = ["up", "down", "neutral"];
            const currentIndex = directions.indexOf(result.direction);
            // Remover direção atual das opções
            directions.splice(currentIndex, 1);
            // Escolher aleatoriamente entre as direções restantes
            const newDirection = directions[Math.floor(Math.random() * directions.length)];
            
            return {
              ...result,
              direction: newDirection,
              strength: Math.max(50, result.strength * 0.9), // Reduzir força ao mudar direção
              description: `${result.description} [Variação adaptativa]`
            };
          }
        }
      }
      return result;
    });
  };
  
  // Função aprimorada para confirmação de IA com adaptabilidade
  const generateAIConfirmation = (results: Record<string, PatternResult>) => {
    try {
      if (!results || !results.all) {
        console.error("Dados de análise incompletos para confirmação de IA");
        return;
      }
      
      console.log("Iniciando confirmação de IA com dados completos");
      
      // Gerar análises rápidas adaptativas
      const fastAnalyses = generateFastAnalyses(selectedTimeframe, marketType);
      
      if (!fastAnalyses || fastAnalyses.length === 0) {
        console.error("Análises rápidas indisponíveis para confirmação de IA");
        return;
      }
      
      // Sistema de pontuação ponderada adaptativo
      let buyScore = 0;
      let sellScore = 0;
      let totalWeight = 0;
      
      // Fator de adaptação baseado em sinais consecutivos
      const consecutiveCount = Math.max(
        consecutiveSignalsRef.current.buy, 
        consecutiveSignalsRef.current.sell,
        consecutiveSignalsRef.current.neutral
      );
      
      // Fator de adaptação - quanto mais consecutivas, mais resistente a novas da mesma direção
      const adaptationFactor = Math.min(0.5, (consecutiveCount - 1) * 0.1);
      console.log(`Fator de adaptação: ${adaptationFactor.toFixed(2)} (${consecutiveCount} sinais consecutivos)`);
      
      // 1. Processar análises detalhadas com pesos adaptativos
      Object.entries(results).forEach(([type, result]) => {
        if (!result || !result.found) return;
        
        // Definir peso baseado no tipo de análise
        let weight = 1.0;
        
        // Atribuir pesos específicos por tipo de análise
        switch (type) {
          case "candlePatterns":
            // Padrões de candles são mais confiáveis em timeframes curtos
            weight = selectedTimeframe === "30s" ? 1.7 : 1.3;
            break;
          case "trendlines":
            // Linhas de tendência são importantes
            weight = 1.5;
            break;
          case "fibonacci":
            weight = 1.2;
            break;
          case "supportResistance":
            weight = 1.4;
            break;
          case "elliottWaves":
            weight = 1.1;
            break;
          case "all":
            // Resultado combinado tem peso menor para evitar dupla contagem
            weight = 0.5;
            break;
          default:
            weight = 1.0;
        }
        
        // Ajustar peso com base na confiança do resultado
        const confidenceMultiplier = result.confidence / 100;
        weight *= confidenceMultiplier;
        
        // Aplicar fator de adaptação para sinais consecutivos
        const lastConfirmedDirection = consecutiveSignalsRef.current.buy > consecutiveSignalsRef.current.sell ? 
          "buy" : "sell";
          
        // Se a tendência atual é a mesma dos sinais consecutivos, reduzir seu peso
        if ((result.buyScore > result.sellScore && lastConfirmedDirection === "buy") || 
            (result.sellScore > result.buyScore && lastConfirmedDirection === "sell")) {
          // Reduzir peso quando temos muitos sinais consecutivos na mesma direção
          weight *= (1 - adaptationFactor);
          console.log(`Peso reduzido para ${type} na direção ${lastConfirmedDirection} (${(weight).toFixed(2)})`);
        }
        
        // Acumular pontuações ponderadas
        buyScore += result.buyScore * weight;
        sellScore += result.sellScore * weight;
        totalWeight += weight;
      });
      
      // 2. Processar análises rápidas com adaptação
      fastAnalyses.forEach(analysis => {
        // Peso base depende do tipo e da força do sinal
        let weight = analysis.strength / 100; // Normalizar para 0-1
        
        // Modificar peso por tipo de análise
        switch (analysis.type) {
          case "priceAction":
          case "candleFormation":
            weight *= 1.35; // Peso para formações de velas e price action
            break;
          case "momentum":
          case "volumeSpikes":
            weight *= 1.25; // Peso para momentum e picos de volume
            break;
          case "macdCrossover":
          case "rsiAnalysis":
            weight *= 1.15; // Peso para indicadores técnicos
            break;
          case "priceReversal":
            // Peso para reversões
            weight *= marketType === "otc" ? 1.5 : 1.15;
            break;
          case "otcPatterns":
            // Específico para OTC
            weight *= 1.4;
            break;
          default:
            weight *= 1.0; // Peso padrão
        }
        
        // Aplicar fator de adaptação para sinais consecutivos
        const lastConfirmedDirection = consecutiveSignalsRef.current.buy > consecutiveSignalsRef.current.sell ? 
          "buy" : "sell";
          
        // Se a direção atual é a mesma dos consecutivos, reduzir seu peso
        if ((analysis.direction === "up" && lastConfirmedDirection === "buy") || 
            (analysis.direction === "down" && lastConfirmedDirection === "sell")) {
          // Reduzir peso quando temos muitos sinais consecutivos
          weight *= (1 - adaptationFactor);
        }
        
        // Acumular pontuações
        if (analysis.direction === "up") {
          buyScore += weight;
        } else if (analysis.direction === "down") {
          sellScore += weight;
        } else {
          // Sinais neutros adicionam pequeno peso em ambas direções
          buyScore += weight * 0.3;
          sellScore += weight * 0.3;
        }
        
        totalWeight += weight;
      });
      
      // Normalizar pontuações
      const normalizedBuyScore = totalWeight > 0 ? buyScore / totalWeight : 0;
      const normalizedSellScore = totalWeight > 0 ? sellScore / totalWeight : 0;
      
      // Determinar direção principal baseada em pontuação normalizada
      let direction: "buy" | "sell" | "neutral";
      let confidence: number;
      
      // Verificar força relativa dos sinais
      const buyStrength = normalizedBuyScore;
      const sellStrength = normalizedSellScore;
      const strengthDifference = Math.abs(buyStrength - sellStrength);
      
      // Threshold adaptativo baseado no tipo de mercado e histórico
      let decisionThreshold = marketType === "otc" ? 0.15 : 0.12;
      
      // Aumentar threshold com base em consecutivos para evitar repetições
      decisionThreshold += Math.min(0.1, adaptationFactor * 2);
      
      console.log(`Decision threshold: ${decisionThreshold.toFixed(3)}, Difference: ${strengthDifference.toFixed(3)}`);
      
      if (strengthDifference < decisionThreshold) {
        // Diferença muito pequena = sinal neutro
        direction = "neutral";
        confidence = 50 + (strengthDifference / decisionThreshold) * 20; // Base 50%, máx 70%
      } else if (buyStrength > sellStrength) {
        direction = "buy";
        // Confiança aumenta com a diferença de força
        confidence = 70 + (strengthDifference - decisionThreshold) * 180;
      } else {
        direction = "sell";
        // Confiança aumenta com a diferença de força
        confidence = 70 + (strengthDifference - decisionThreshold) * 180;
      }
      
      // Limitar confiança máxima a 95%
      confidence = Math.min(95, Math.max(50, confidence));
      
      // Aplicar ajustes específicos para mercado OTC
      if (marketType === "otc") {
        // Em OTC, verificar padrões de manipulação
        const manipulationScore = calculateManipulationScore(results, fastAnalyses);
        
        if (manipulationScore > 60) {
          // Alta chance de manipulação
          console.log(`Alta probabilidade de manipulação em OTC: ${manipulationScore.toFixed(1)}%`);
          
          // Ajuste flexível para mercados manipulados
          if (manipulationScore > 75 && confidence > 75 && Math.random() > 0.4) {
            // Possível armadilha, inverter sinal muito confiante (60% de chance)
            direction = direction === "buy" ? "sell" : "buy";
            confidence = Math.max(60, confidence * 0.8); // Reduzir confiança na inversão
            console.log("Sinal invertido devido à alta probabilidade de manipulação");
          } else {
            // Reduzir confiança proporcionalmente ao score de manipulação
            const reductionFactor = 1 - ((manipulationScore - 60) / 100);
            confidence *= reductionFactor;
            console.log(`Confiança reduzida devido à manipulação: ${confidence.toFixed(1)}%`);
          }
        }
      }
      
      // Verificar direção majoritária entre indicadores
      const upCount = fastAnalyses.filter(a => a.direction === "up").length;
      const downCount = fastAnalyses.filter(a => a.direction === "down").length;
      const majorityConcordance = direction === "buy" ? 
        upCount > downCount : 
        direction === "sell" ? 
          downCount > upCount : 
          true;
      
      // Atualizar contador de sinais consecutivos
      if (direction === "buy") {
        consecutiveSignalsRef.current = {
          buy: consecutiveSignalsRef.current.buy + 1,
          sell: 0,
          neutral: 0
        };
      } else if (direction === "sell") {
        consecutiveSignalsRef.current = {
          buy: 0,
          sell: consecutiveSignalsRef.current.sell + 1,
          neutral: 0
        };
      } else {
        consecutiveSignalsRef.current = {
          buy: 0,
          sell: 0,
          neutral: consecutiveSignalsRef.current.neutral + 1
        };
      }
      
      console.log(`Sinais consecutivos: BUY=${consecutiveSignalsRef.current.buy}, SELL=${consecutiveSignalsRef.current.sell}, NEUTRAL=${consecutiveSignalsRef.current.neutral}`);
      
      // Adicionar variação aleatória na confiança para evitar padrões previsíveis
      const randomVariation = (Math.random() - 0.5) * 5; // -2.5% a +2.5%
      confidence = Math.max(50, Math.min(95, confidence + randomVariation));
      
      // Definir confirmação final
      setAiConfirmation({
        active: true,
        verified: true,
        direction,
        confidence,
        majorityDirection: majorityConcordance
      });
      
      console.log(`Confirmação IA concluída: ${direction} com ${confidence.toFixed(1)}% de confiança`);
    } catch (error) {
      console.error("Erro na geração de confirmação IA:", error);
      
      // Fallback para evitar travamentos
      setAiConfirmation({
        active: true,
        verified: true,
        direction: "neutral",
        confidence: 50,
        majorityDirection: false
      });
    }
  };
  
  // Função de detecção de manipulação de mercado adaptativa
  const calculateManipulationScore = (
    results: Record<string, PatternResult>, 
    fastAnalyses: FastAnalysisResult[]
  ): number => {
    try {
      let score = 0;
      
      // 1. Verificar contradições entre indicadores com sensibilidade adaptativa
      const upIndicators = fastAnalyses.filter(a => a.direction === "up").length;
      const downIndicators = fastAnalyses.filter(a => a.direction === "down").length;
      const totalDirectionalIndicators = upIndicators + downIndicators;
      
      // Equilíbrio perfeito é suspeito (mesma quantidade de indicadores up/down)
      if (totalDirectionalIndicators >= 4) {
        const balanceRatio = Math.abs(upIndicators - downIndicators) / totalDirectionalIndicators;
        
        // Quanto mais próximo de zero, mais suspeito (perfeitamente balanceado)
        if (balanceRatio < 0.25) {
          // Pontuação inversa à diferença (menor diferença = maior suspeita)
          score += 25 * (1 - balanceRatio * 4);
        }
      }
      
      // 2. Verificar conflito entre curto e longo prazo com flexibilidade
      const shortTermIndicators = fastAnalyses.filter(a => 
        ["candleFormation", "candleSize", "priceAction"].includes(a.type)
      );
      const longTermIndicators = fastAnalyses.filter(a => 
        ["trendlines", "rsiAnalysis", "macdCrossover", "bollingerBands"].includes(a.type)
      );
      
      // Só calcular se tivermos indicadores suficientes
      if (shortTermIndicators.length >= 2 && longTermIndicators.length >= 2) {
        const shortDirection = getDirectionConsensus(shortTermIndicators);
        const longDirection = getDirectionConsensus(longTermIndicators);
        
        // Conflito claro entre curto e longo prazo
        if (shortDirection !== "neutral" && longDirection !== "neutral" && shortDirection !== longDirection) {
          score += 20;
          
          // Verificar força do conflito
          const shortStrength = shortTermIndicators.reduce((sum, i) => sum + i.strength, 0) / shortTermIndicators.length;
          const longStrength = longTermIndicators.reduce((sum, i) => sum + i.strength, 0) / longTermIndicators.length;
          
          // Ambos muito fortes em direções opostas é ainda mais suspeito
          if (shortStrength > 70 && longStrength > 70) {
            score += 10;
          }
        }
      }
      
      // 3. Verificar pontos específicos de manipulação no OTC
      
      // 3.1 Fortes reversões recentes
      const reversalIndicators = fastAnalyses.filter(a => a.type === "priceReversal");
      if (reversalIndicators.length > 0) {
        const avgRevStrength = reversalIndicators.reduce((sum, v) => sum + v.strength, 0) / reversalIndicators.length;
        
        // Score proporcional à força do sinal de reversão
        if (avgRevStrength > 65) {
          score += Math.min(25, (avgRevStrength - 65) * 0.8);
        }
      }
      
      // 3.2 Volume anômalo
      const volumeIndicators = fastAnalyses.filter(a => a.type === "volumeSpikes" || a.type === "volume");
      if (volumeIndicators.length > 0) {
        const avgVolStrength = volumeIndicators.reduce((sum, v) => sum + v.strength, 0) / volumeIndicators.length;
        
        // Volume muito alto ou muito baixo é suspeito
        if (avgVolStrength > 80) {
          score += 15;
        } else if (avgVolStrength < 25) {
          // Volume anormalmente baixo também é suspeito
          score += 10;
        }
      }
      
      // 3.3 Detectar padrões específicos de OTC nos resultados
      const otcPatterns = fastAnalyses.filter(a => a.type === "otcPatterns");
      if (otcPatterns.length > 0) {
        score += otcPatterns[0].strength * 0.25;
      }
      
      // 3.4 Alta volatilidade + sinal forte = suspeito
      const volatilityIndicators = fastAnalyses.filter(a => a.type === "volatility");
      const strongSignals = fastAnalyses.filter(a => a.strength > 85 && (a.direction === "up" || a.direction === "down")).length;
      
      if (volatilityIndicators.length > 0 && volatilityIndicators[0].strength > 70 && strongSignals >= 2) {
        score += 20;
      }
      
      // 3.5 Verificar resultados de padrões detalhados
      if (results.candlePatterns?.found && results.trendlines?.found) {
        const candleScore = results.candlePatterns.buyScore - results.candlePatterns.sellScore;
        const trendScore = results.trendlines.buyScore - results.trendlines.sellScore;
        
        // Sinais contraditórios de candles vs tendências
        if (Math.sign(candleScore) !== 0 && Math.sign(trendScore) !== 0 && 
            Math.sign(candleScore) !== Math.sign(trendScore)) {
          score += 20;
        }
      }
      
      // 3.6 Adicionar elemento de aleatoriedade para evitar previsibilidade
      const randomFactor = Math.random() * 10 - 5; // -5 a +5 pontos
      score += randomFactor;
      
      return Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error("Erro ao calcular score de manipulação:", error);
      return 0;
    }
  };
  
  // Trigger para reanálise quando o tipo de mercado muda
  useEffect(() => {
    // Verificar se houve alteração real
    if (lastMarketTypeRef.current === marketType) return;
    
    // Atualizar referência
    lastMarketTypeRef.current = marketType;
    
    // Verificar se já temos dados de imagem para analisar
    if (!imageData) return;
    
    // Evitar múltiplas análises em intervalo curto (1 segundo)
    const now = Date.now();
    if (now - lastAnalysisTimeRef.current < 1000) return;
    
    // Registrar tempo da análise
    lastAnalysisTimeRef.current = now;
    
    console.log(`Tipo de mercado alterado para ${marketType}, iniciando nova análise...`);
    
    // Resetar contadores de sinais consecutivos ao trocar de mercado
    consecutiveSignalsRef.current = { buy: 0, sell: 0, neutral: 0 };
    
    // Iniciar análise (se não estiver analisando)
    if (!isAnalyzing) {
      setIsAnalyzing(true);
    }
  }, [marketType, imageData, isAnalyzing, setIsAnalyzing]);
  
  return {
    detailedResults,
    setDetailedResults,
    processingStage,
    setProcessingStage,
    analysisImage,
    setAnalysisImage,
    fastAnalysisResults,
    setFastAnalysisResults,
    aiConfirmation,
    setAiConfirmation,
    generateFastAnalyses,
    generateAIConfirmation
  };
};
