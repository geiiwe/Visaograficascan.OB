
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import AnalysisLabels from "../AnalysisLabels";
import { FastAnalysisResult } from "./FastAnalysisIndicators";
import { ExtendedPatternResult } from "@/utils/predictionUtils";
import { TimeframeType, MarketType } from "@/context/AnalyzerContext";

interface AnalysisPanelProps {
  detailedResults: Record<string, ExtendedPatternResult>;
  compactMode: boolean;
  selectedTimeframe: TimeframeType;
  fastAnalysisResults: FastAnalysisResult[];
  marketType?: MarketType;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  detailedResults,
  compactMode,
  selectedTimeframe,
  fastAnalysisResults,
  marketType = "regular"
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Count significant patterns to determine if we need to show anything
  const significantPatterns = Object.values(detailedResults).filter(
    r => r.found && (r.buyScore && r.buyScore > 0.5 || r.sellScore && r.sellScore > 0.5)
  ).length;
  
  // Count significant fast analyses
  const significantFastAnalyses = fastAnalysisResults.filter(
    r => r.found && r.strength > 65
  ).length;
  
  // If there's not much to show, display minimal UI
  if (significantPatterns === 0 && significantFastAnalyses <= 1) {
    return null;
  }
  
  // Extract key analysis insights for better summary display
  const dominantPatterns = Object.entries(detailedResults)
    .filter(([type, result]) => 
      result.found && 
      (type !== "all") && 
      (result.buyScore && result.buyScore > 0.7 || result.sellScore && result.sellScore > 0.7)
    )
    .sort(([, resultA], [, resultB]) => {
      const strengthA = Math.max(resultA.buyScore || 0, resultA.sellScore || 0);
      const strengthB = Math.max(resultB.buyScore || 0, resultB.sellScore || 0);
      return strengthB - strengthA;
    })
    .slice(0, 3);
  
  // Verifica se há padrão de Fibonacci
  const hasFibonacciPattern = detailedResults.fibonacci?.found && 
    detailedResults.fibonacci.confidence > 65;
    
  // Verifica se há padrão de Candles
  const hasCandlePattern = detailedResults.candlePatterns?.found && 
    detailedResults.candlePatterns.confidence > 65;
    
  // Check for confluence between patterns
  const hasFibCandleConfluence = hasFibonacciPattern && hasCandlePattern;
  
  // Encontrar sinais primários (compra ou venda)
  const primarySignal = Object.values(detailedResults)
    .filter(r => r.found)
    .some(r => (r.buyScore || 0) > (r.sellScore || 0) * 1.2) ? "buy" :
    Object.values(detailedResults)
    .filter(r => r.found)
    .some(r => (r.sellScore || 0) > (r.buyScore || 0) * 1.2) ? "sell" : null;
    
  // Contar número de indicadores que confirmam o sinal primário
  const confirmingIndicators = primarySignal ? 
    Object.values(detailedResults).filter(r => 
      r.found && (
        (primarySignal === "buy" && (r.buyScore || 0) > (r.sellScore || 0)) ||
        (primarySignal === "sell" && (r.sellScore || 0) > (r.buyScore || 0))
      )
    ).length : 0;
    
  // Determinar se há alta confluência (muitos indicadores confirmando o mesmo sinal)
  const hasHighConfluence = confirmingIndicators >= 3;
  
  return (
    <div className={`absolute ${isMobile ? "bottom-2 left-2 right-2" : "bottom-4 left-2 max-w-[90%] w-auto"} pointer-events-auto z-20`}>
      <div className={`
        ${marketType === "otc" ? "bg-black/50 border-purple-700/30" : "bg-black/40 border-blue-700/30"}
        backdrop-blur-md border rounded-lg shadow-lg transition-all duration-300 p-1.5
      `}>
        {hasFibCandleConfluence && (
          <div className="px-2 py-1 mb-1.5 bg-orange-700/40 rounded text-xs text-white">
            Confirmação: Fibonacci + Padrões de Candles
          </div>
        )}
        
        {hasHighConfluence && !hasFibCandleConfluence && primarySignal && (
          <div className="px-2 py-1 mb-1.5 bg-blue-700/40 rounded text-xs text-white">
            Alta Confluência: {confirmingIndicators} indicadores {primarySignal === "buy" ? "↑" : "↓"}
          </div>
        )}
        
        {dominantPatterns.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {dominantPatterns.map(([type, result], idx) => {
              const isBuy = (result.buyScore || 0) > (result.sellScore || 0);
              const strength = Math.max(result.buyScore || 0, result.sellScore || 0) * 100;
              
              return (
                <div 
                  key={`dominant-${idx}`}
                  className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1
                    ${isBuy 
                      ? "bg-green-700/40 text-green-100" 
                      : "bg-red-700/40 text-red-100"
                    }`}
                >
                  {isBuy ? '↑' : '↓'}
                  <span>
                    {type === "fibonacci" ? "Fibonacci" : 
                    type === "candlePatterns" ? "Padrões de Velas" :
                    type === "trendlines" ? "Tendência" :
                    type === "supportResistance" ? "Suporte/Resist." :
                    type === "elliottWaves" ? "Elliott" : 
                    type === "dowTheory" ? "Dow" : type}
                  </span>
                  <span className="text-[10px] opacity-80 ml-1">{Math.round(strength)}%</span>
                </div>
              )
            })}
          </div>
        )}
        
        <AnalysisLabels 
          results={detailedResults} 
          compact={true} // Always use compact mode for cleaner UI
          specificTimeframe={selectedTimeframe}
          m1Analyses={fastAnalysisResults.slice(0, 2)} // Limit to top 2 analyses for cleaner UI
          minimalMode={true} // New prop to enable minimal UI
        />
      </div>
    </div>
  );
};

export default AnalysisPanel;
