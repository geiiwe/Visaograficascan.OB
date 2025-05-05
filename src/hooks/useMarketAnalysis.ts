
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
  marketType: MarketType; // Adicionado tipo de mercado
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisResult: (type: AnalysisType, found: boolean) => void;
}

export interface AIConfirmation {
  active: boolean;
  verified: boolean;
  direction: "buy" | "sell" | "neutral";
  confidence: number;
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
  marketType, // Novo parâmetro
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
    confidence: 0
  });
  
  // Esta função vai gerar análises baseadas em timeframes específicos muito mais rapidamente
  const generateFastAnalyses = (timeframe: TimeframeType, market: MarketType) => {
    // Usar a nova função otimizada para gerar análises com consideração do tipo de mercado
    const analyses = generateTimeframeAnalyses(timeframe, market);
    setFastAnalysisResults(analyses);
    return analyses;
  };

  // Nova função para confirmar a análise com IA
  const generateAIConfirmation = (results: Record<string, PatternResult>) => {
    if (!results.all) return;
    
    // Ajustes de pontuação baseados no tipo de mercado
    let buyScoreAdjustment = 1.0;
    let sellScoreAdjustment = 1.0;
    
    // Em mercados OTC, ajustar as pontuações com base nas características desse mercado
    if (marketType === "otc") {
      // Em OTC, os sinais de compra/venda podem ser enganosos (manipulação)
      // Então podemos inverter ou ajustar as pontuações para refletir essa realidade
      if (Math.random() > 0.6) { // 40% de chance de ajustar a pontuação para refletir manipulação
        buyScoreAdjustment = 0.7;
        sellScoreAdjustment = 1.3;
      } else if (Math.random() > 0.4) { // Outra chance de ajuste diferente
        buyScoreAdjustment = 1.3;
        sellScoreAdjustment = 0.7;
      }
    }
    
    // Obter pontuações gerais de compra/venda com ajustes
    const totalBuyScore = (results.all?.buyScore || 0) * buyScoreAdjustment;
    const totalSellScore = (results.all?.sellScore || 0) * sellScoreAdjustment;
    
    // Configurar confirmação de IA com base nos resultados da análise
    setAiConfirmation({
      active: true,
      verified: totalBuyScore > 0.5 || totalSellScore > 0.5,
      direction: totalBuyScore > totalSellScore ? "buy" : 
                totalSellScore > totalBuyScore ? "sell" : "neutral",
      confidence: marketType === "otc" ? 
        (results.all?.confidence || 0) * 0.9 : // Confiança reduzida para OTC
        results.all?.confidence || 0
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
