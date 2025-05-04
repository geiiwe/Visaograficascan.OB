
import { useState, useEffect } from "react";
import { PatternResult } from "@/utils/patternDetection";
import { FastAnalysisResult } from "@/components/overlay/FastAnalysisIndicators";
import { AnalysisType, PrecisionLevel, TimeframeType } from "@/context/AnalyzerContext";
import { generateTimeframeAnalyses } from "@/utils/fastAnalysis";

interface MarketAnalysisParams {
  isAnalyzing: boolean;
  imageData: string | null;
  activeAnalysis: AnalysisType[];
  precision: PrecisionLevel;
  selectedTimeframe: TimeframeType;
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
  const generateFastAnalyses = (timeframe: TimeframeType) => {
    // Usar a nova função otimizada para gerar análises
    const analyses = generateTimeframeAnalyses(timeframe);
    setFastAnalysisResults(analyses);
    return analyses;
  };

  // Nova função para confirmar a análise com IA
  const generateAIConfirmation = (results: Record<string, PatternResult>) => {
    if (!results.all) return;
    
    // Obter pontuações gerais de compra/venda
    const totalBuyScore = results.all?.buyScore || 0;
    const totalSellScore = results.all?.sellScore || 0;
    
    // Configurar confirmação de IA com base nos resultados da análise
    setAiConfirmation({
      active: true,
      verified: totalBuyScore > 0.5 || totalSellScore > 0.5,
      direction: totalBuyScore > totalSellScore ? "buy" : 
                totalSellScore > totalBuyScore ? "sell" : "neutral",
      confidence: results.all?.confidence || 0
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
