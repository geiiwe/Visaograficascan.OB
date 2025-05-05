
import { useState, useEffect } from "react";
import { PatternResult } from "@/utils/patternDetection";
import { FastAnalysisResult } from "@/components/overlay/FastAnalysisIndicators";
import { AnalysisType, PrecisionLevel, TimeframeType, MarketType } from "@/context/AnalyzerContext";
import { generateTimeframeAnalyses } from "@/utils/fastAnalysis";

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
  majorityDirection: boolean; // Indica se a direção está alinhada com a maioria dos indicadores
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
  
  // Esta função vai gerar análises baseadas em timeframes específicos muito mais rapidamente
  const generateFastAnalyses = (timeframe: TimeframeType, market: MarketType) => {
    // Usar a função otimizada para gerar análises com consideração do tipo de mercado
    const analyses = generateTimeframeAnalyses(timeframe, market);
    setFastAnalysisResults(analyses);
    return analyses;
  };

  // Nova função para confirmar a análise com IA, melhorada para detectar tendências majoritárias
  const generateAIConfirmation = (results: Record<string, PatternResult>) => {
    if (!results.all) return;
    
    // Gerar análises rápidas para obter uma base maior de indicadores
    const fastAnalyses = generateFastAnalyses(selectedTimeframe, marketType);
    
    // Contagem das direções dos indicadores para identificar tendência majoritária
    let buyIndicators = 0;
    let sellIndicators = 0;
    
    // Contar indicadores das análises detalhadas
    Object.values(results).forEach(result => {
      if (result.buyScore > result.sellScore) buyIndicators++;
      else if (result.sellScore > result.buyScore) sellIndicators++;
    });
    
    // Contar indicadores das análises rápidas
    fastAnalyses.forEach(analysis => {
      if (analysis.direction === "up") buyIndicators++;
      else if (analysis.direction === "down") sellIndicators++;
    });
    
    // Determinar a direção majoritária
    const majorityDirection = buyIndicators > sellIndicators ? "buy" : 
                             sellIndicators > buyIndicators ? "sell" : "neutral";
    
    // Ajustes de pontuação baseados no tipo de mercado
    let buyScoreAdjustment = 1.0;
    let sellScoreAdjustment = 1.0;
    
    // Em mercados OTC, ajustar as pontuações com base nas características desse mercado
    if (marketType === "otc") {
      // Em OTC, os sinais de compra/venda podem ter características específicas
      if (buyIndicators > sellIndicators * 1.5) {
        // Fortes indicações de compra - possível manipulação em OTC
        buyScoreAdjustment = 0.85; // Reduzir confiança
        sellScoreAdjustment = 1.15; // Aumentar possibilidade contrária
      } else if (sellIndicators > buyIndicators * 1.5) {
        // Fortes indicações de venda - possível manipulação em OTC
        sellScoreAdjustment = 0.85; // Reduzir confiança
        buyScoreAdjustment = 1.15; // Aumentar possibilidade contrária
      }
    }
    
    // Obter pontuações gerais de compra/venda com ajustes
    const totalBuyScore = (results.all?.buyScore || 0) * buyScoreAdjustment;
    const totalSellScore = (results.all?.sellScore || 0) * sellScoreAdjustment;
    
    // Indicador mais forte (análise técnica pura)
    const technicalDirection = totalBuyScore > totalSellScore ? "buy" : 
                              totalSellScore > totalBuyScore ? "sell" : "neutral";
    
    // Calcular confiança baseada na corroboração entre análise técnica e maioria dos indicadores
    const baseConfidence = results.all?.confidence || 0;
    let adjustedConfidence = baseConfidence;
    
    // Ajustar confiança baseado no alinhamento entre análise técnica e maioria dos indicadores
    if (technicalDirection === majorityDirection) {
      adjustedConfidence = Math.min(100, baseConfidence * 1.2); // Maior confiança quando há corroboração
    } else {
      adjustedConfidence = baseConfidence * 0.8; // Menor confiança quando há conflito
    }
    
    // Direção final baseada na maioria dos indicadores, com ajuste para OTC
    const finalDirection = marketType === "otc" ? 
      // Em OTC podemos inverter a direção em alguns casos devido à manipulação
      (Math.random() > 0.7 && majorityDirection !== "neutral" ? 
        (majorityDirection === "buy" ? "sell" : "buy") : majorityDirection) : 
      majorityDirection;
    
    // Definir a confirmação de IA
    setAiConfirmation({
      active: true,
      verified: true,
      direction: finalDirection,
      confidence: marketType === "otc" ? adjustedConfidence * 0.9 : adjustedConfidence, // Reduzir confiança em OTC
      majorityDirection: technicalDirection === majorityDirection
    });
  };

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
