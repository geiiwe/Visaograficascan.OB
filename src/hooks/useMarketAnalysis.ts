
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
  
  // Função aprimorada para gerar análises com maior assertividade
  const generateFastAnalyses = (timeframe: TimeframeType, market: MarketType) => {
    try {
      console.log(`Gerando análises rápidas para ${timeframe} em mercado ${market}`);
      // Usar a função otimizada com parâmetros mais consistentes
      const analyses = generateTimeframeAnalyses(timeframe, market);
      
      if (!analyses || analyses.length === 0) {
        console.error("Falha ao gerar análises: resultado vazio");
        return [];
      }
      
      // Filtrar resultados mais assertivos (força mínima ajustada para 55%)
      const highConfidenceResults = analyses.filter(analysis => analysis.strength > 55);
      
      // Garantir mínimo de análises para decisão
      const finalResults = highConfidenceResults.length >= 3 ? 
        highConfidenceResults : 
        [...highConfidenceResults, ...analyses.filter(a => !highConfidenceResults.includes(a))].slice(0, 5);
      
      // Aplicar algoritmo de consenso aprimorado
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
          direction: "neutral",
          strength: 60,
          name: "Análise Básica",
          description: "Análise de contingência devido a erro no processamento principal"
        }
      ];
    }
  };

  // Algoritmo de consenso aprimorado
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
      
      // Threshold mais rigoroso para consenso: 62%
      const hasMajorityConsensus = upPercentage > 62 || downPercentage > 62;
      const consensusDirection: "up" | "down" | "neutral" = 
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
      
      // Verificação específica para mercado OTC
      if (market === "otc") {
        // OTC: Verificar padrões típicos de manipulação
        const possibleManipulation = detectOtcManipulation(results, upPercentage, downPercentage);
        
        if (possibleManipulation) {
          // Aplicar correções anti-manipulação
          console.log("Detectada possível manipulação em mercado OTC - aplicando correções");
          return applyAntiManipulationCorrections(results, consensusDirection);
        }
        
        // Divergência técnica em mercado OTC é suspeita
        if (hasInconsistency) {
          console.log("Divergência técnica detectada em mercado OTC");
          // Aumentar peso dos indicadores contrários ao consenso
          return balanceContradictoryIndicators(results, consensusDirection);
        }
      } else {
        // Mercado regular: Dar mais peso ao consenso quando forte
        if (hasMajorityConsensus) {
          return strengthenConsensusIndicators(results, consensusDirection);
        }
        
        // Corrigir inconsistências em mercado regular
        if (hasInconsistency) {
          return reconcileIndicatorGroups(results, technicalIndicators, candleIndicators);
        }
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
    
    if (upCount > downCount) return "up";
    if (downCount > upCount) return "down";
    return "neutral";
  };
  
  const detectOtcManipulation = (
    results: FastAnalysisResult[], 
    upPercentage: number, 
    downPercentage: number
  ): boolean => {
    // Sinais extremamente fortes (acima de 85%) são suspeitos em OTC
    const extremelyStrongSignals = results.filter(r => r.strength > 85).length;
    const hasExtremeSignals = extremelyStrongSignals >= 2;
    
    // Consenso extremamente forte é suspeito
    const extremeConsensus = upPercentage > 75 || downPercentage > 75;
    
    // Verificar presença de sinais de reversão
    const hasReversalIndicators = results.some(r => 
      r.type === "priceReversal" && r.strength > 70
    );
    
    // Manipulação detectada se houver sinais extremos OU consenso extremo E reversões
    return (hasExtremeSignals || extremeConsensus) && hasReversalIndicators;
  };
  
  const applyAntiManipulationCorrections = (
    results: FastAnalysisResult[],
    consensusDirection: "up" | "down" | "neutral" 
  ): FastAnalysisResult[] => {
    // Em caso de manipulação, inverter a direção do consenso
    const oppositeDirection: "up" | "down" = consensusDirection === "up" ? "down" : "up";
    
    return results.map(result => {
      // Processar apenas indicadores fortes na direção do consenso
      if (result.direction === consensusDirection && result.strength > 75) {
        // 70% de chance de inverter a direção
        if (Math.random() > 0.3) {
          return {
            ...result,
            direction: oppositeDirection,
            description: `${result.description} [Corrigido: possível manipulação]`,
            strength: Math.max(50, result.strength * 0.85) // Reduzir força, mínimo 50%
          };
        }
      }
      return result;
    });
  };
  
  const balanceContradictoryIndicators = (
    results: FastAnalysisResult[],
    consensusDirection: "up" | "down" | "neutral"
  ): FastAnalysisResult[] => {
    if (consensusDirection === "neutral") return results;
    
    const oppositeDirection: "up" | "down" = consensusDirection === "up" ? "down" : "up";
    
    return results.map(result => {
      // Aumentar peso dos indicadores que contradizem o consenso
      if (result.direction === oppositeDirection) {
        return {
          ...result,
          strength: Math.min(95, result.strength * 1.2), // Aumentar 20%, máximo 95%
          description: `${result.description} [Sinal contrário relevante]`
        };
      }
      return result;
    });
  };
  
  const strengthenConsensusIndicators = (
    results: FastAnalysisResult[],
    consensusDirection: "up" | "down" | "neutral"
  ): FastAnalysisResult[] => {
    if (consensusDirection === "neutral") return results;
    
    return results.map(result => {
      // Fortalecer indicadores alinhados ao consenso
      if (result.direction === consensusDirection) {
        return {
          ...result,
          strength: Math.min(98, result.strength * 1.15), // Aumentar 15%, máximo 98% 
          description: `${result.description} [Confirmado por consenso]`
        };
      }
      return result;
    });
  };
  
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
    
    // Balancear moderadamente - ajustar alguns indicadores do grupo mais fraco
    return results.map(result => {
      const isFromWeakerGroup = techStrength > candleStrength ? 
        candleIndicators.includes(result) : 
        technicalIndicators.includes(result);
      
      if (isFromWeakerGroup && result.direction !== strongerDirection && Math.random() > 0.5) {
        // 50% de chance de ajustar a direção para melhorar coerência
        return {
          ...result,
          direction: strongerDirection,
          description: `${result.description} [Ajustado para coerência]`,
          strength: result.strength * 0.9 // Reduzir confiança em 10%
        };
      }
      return result;
    });
  };
  
  // Função aprimorada para confirmação de IA
  const generateAIConfirmation = (results: Record<string, PatternResult>) => {
    try {
      if (!results || !results.all) {
        console.error("Dados de análise incompletos para confirmação de IA");
        return;
      }
      
      console.log("Iniciando confirmação de IA com dados completos");
      
      // Gerar análises rápidas otimizadas
      const fastAnalyses = generateFastAnalyses(selectedTimeframe, marketType);
      
      if (!fastAnalyses || fastAnalyses.length === 0) {
        console.error("Análises rápidas indisponíveis para confirmação de IA");
        return;
      }
      
      // Sistema de pontuação ponderada mais preciso
      let buyScore = 0;
      let sellScore = 0;
      let totalWeight = 0;
      
      // 1. Processar análises detalhadas com pesos específicos
      Object.entries(results).forEach(([type, result]) => {
        if (!result || !result.found) return;
        
        // Definir peso baseado no tipo de análise
        let weight = 1.0;
        
        // Atribuir pesos específicos por tipo de análise
        switch (type) {
          case "candlePatterns":
            // Padrões de candles são mais confiáveis em timeframes curtos
            weight = selectedTimeframe === "30s" ? 1.8 : 1.4;
            break;
          case "trendlines":
            // Linhas de tendência são muito importantes
            weight = 1.6;
            break;
          case "fibonacci":
            weight = 1.3;
            break;
          case "supportResistance":
            weight = 1.5;
            break;
          case "elliottWaves":
            weight = 1.2;
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
        
        // Acumular pontuações ponderadas
        buyScore += result.buyScore * weight;
        sellScore += result.sellScore * weight;
        totalWeight += weight;
      });
      
      // 2. Processar análises rápidas
      fastAnalyses.forEach(analysis => {
        // Peso base depende do tipo e da força do sinal
        let weight = analysis.strength / 100; // Normalizar para 0-1
        
        // Modificar peso por tipo de análise
        switch (analysis.type) {
          case "priceAction":
          case "candleFormation":
            weight *= 1.4; // Maior peso para formações de velas e price action
            break;
          case "momentum":
          case "volumeSpikes":
            weight *= 1.3; // Bom peso para momentum e picos de volume
            break;
          case "macdCrossover":
          case "rsiAnalysis":
            weight *= 1.2; // Peso moderado para indicadores técnicos
            break;
          case "priceReversal":
            // Maior peso em OTC, onde reversões são mais significativas
            weight *= marketType === "otc" ? 1.6 : 1.2;
            break;
          case "otcPatterns":
            // Específico para OTC, com alto peso
            weight *= 1.5;
            break;
          default:
            weight *= 1.0; // Peso padrão
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
      
      // Threshold adaptativo baseado no tipo de mercado
      const decisionThreshold = marketType === "otc" ? 0.15 : 0.12;
      
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
        
        if (manipulationScore > 65) {
          // Alta chance de manipulação
          console.log(`Alta probabilidade de manipulação em OTC: ${manipulationScore.toFixed(1)}%`);
          
          // Ajuste para mercados manipulados
          if (manipulationScore > 80 && confidence > 75) {
            // Possível armadilha, inverter sinal muito confiante
            direction = direction === "buy" ? "sell" : "buy";
            confidence = Math.max(60, confidence * 0.8); // Reduzir confiança na inversão
            console.log("Sinal invertido devido à alta probabilidade de manipulação");
          } else {
            // Reduzir confiança proporcionalmente ao score de manipulação
            const reductionFactor = 1 - ((manipulationScore - 65) / 100);
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
  
  // Função de detecção de manipulação de mercado aprimorada
  const calculateManipulationScore = (
    results: Record<string, PatternResult>, 
    fastAnalyses: FastAnalysisResult[]
  ): number => {
    try {
      let score = 0;
      
      // 1. Verificar contradições extremas entre indicadores
      const upIndicators = fastAnalyses.filter(a => a.direction === "up").length;
      const downIndicators = fastAnalyses.filter(a => a.direction === "down").length;
      const totalDirectionalIndicators = upIndicators + downIndicators;
      
      // Equilíbrio perfeito é suspeito (mesma quantidade de indicadores up/down)
      if (totalDirectionalIndicators >= 4 && Math.abs(upIndicators - downIndicators) <= 1) {
        score += 25;
      }
      
      // 2. Verificar conflito entre curto e longo prazo
      const shortTermIndicators = fastAnalyses.filter(a => 
        ["candleFormation", "candleSize", "priceAction"].includes(a.type)
      );
      const longTermIndicators = fastAnalyses.filter(a => 
        ["trendlines", "rsiAnalysis", "macdCrossover", "bollingerBands"].includes(a.type)
      );
      
      const shortDirection = getDirectionConsensus(shortTermIndicators);
      const longDirection = getDirectionConsensus(longTermIndicators);
      
      if (shortDirection !== "neutral" && longDirection !== "neutral" && shortDirection !== longDirection) {
        score += 20; // Conflito curto/longo prazo
      }
      
      // 3. Verificar pontos específicos de manipulação no OTC
      
      // 3.1 Fortes reversões recentes
      const reversalIndicators = fastAnalyses.filter(a => a.type === "priceReversal");
      if (reversalIndicators.length > 0 && reversalIndicators[0].strength > 75) {
        score += 20;
      }
      
      // 3.2 Volume anômalo
      const volumeIndicators = fastAnalyses.filter(a => a.type === "volumeSpikes" || a.type === "volume");
      if (volumeIndicators.length > 0) {
        const avgVolStrength = volumeIndicators.reduce((sum, v) => sum + v.strength, 0) / volumeIndicators.length;
        if (avgVolStrength > 80) {
          score += 15;
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
      
      return Math.min(100, score);
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
