
import React from "react";
import { ExtendedPatternResult } from "@/utils/predictionUtils";
import { TimeframeType, MarketType } from "@/context/AnalyzerContext";
import { FastAnalysisResult } from "../overlay/FastAnalysisIndicators";
import AnalysisResultsPanel from "./AnalysisResultsPanel";
import FastAnalysisDisplay from "./FastAnalysisDisplay";

interface AnalysisContainerProps {
  detailedResults: Record<string, ExtendedPatternResult>;
  fastAnalysisResults: FastAnalysisResult[];
  timeframe: TimeframeType;
  marketType: MarketType;
  visualAnalysis?: any;
  position?: "right" | "left";
  aiDecision?: any;
}

const AnalysisContainer: React.FC<AnalysisContainerProps> = ({
  detailedResults,
  fastAnalysisResults,
  timeframe,
  marketType,
  visualAnalysis,
  position = "right",
  aiDecision
}) => {
  const hasDetailedResults = Object.keys(detailedResults).length > 0;
  const hasSignificantFast = fastAnalysisResults.filter(r => r.found && r.strength > 60).length > 0;

  if (!hasDetailedResults && !hasSignificantFast && !aiDecision) return null;

  return (
    <div className={`
      fixed ${position === "right" ? "right-4" : "left-4"} top-4 bottom-4
      z-30 pointer-events-auto flex flex-col gap-3 
      w-80 max-h-[calc(100vh-2rem)] overflow-y-auto
      bg-black/10 backdrop-blur-sm rounded-lg p-2
    `}>
      {/* Decisão Autônoma da IA */}
      {aiDecision && (
        <div className={`
          ${aiDecision.action === "BUY" ? "bg-green-900/90 border-green-500/50" :
            aiDecision.action === "SELL" ? "bg-red-900/90 border-red-500/50" :
            "bg-yellow-900/90 border-yellow-500/50"}
          backdrop-blur-md border rounded-lg p-3
        `}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
            <span className="text-white font-bold text-sm">DECISÃO AUTÔNOMA DA IA</span>
          </div>
          
          <div className="text-white">
            <div className="text-lg font-bold mb-1">
              {aiDecision.action === "BUY" ? "📈 COMPRAR" :
               aiDecision.action === "SELL" ? "📉 VENDER" : "⏳ AGUARDAR"}
            </div>
            
            <div className="text-sm opacity-90 mb-2">
              Confiança: {aiDecision.confidence}% | Sucesso: {aiDecision.expected_success_rate}%
            </div>
            
            {aiDecision.action !== "WAIT" && (
              <div className="text-sm">
                {aiDecision.timing.enter_now ? (
                  <span className="text-green-300 font-semibold">⚡ ENTRAR AGORA</span>
                ) : (
                  <span className="text-yellow-300">
                    ⏰ Aguardar {aiDecision.timing.wait_seconds}s
                  </span>
                )}
              </div>
            )}
            
            <div className={`mt-2 px-2 py-1 rounded text-xs ${
              aiDecision.risk_level === "LOW" ? "bg-green-700/50" :
              aiDecision.risk_level === "MEDIUM" ? "bg-yellow-700/50" :
              "bg-red-700/50"
            }`}>
              Risco: {aiDecision.risk_level}
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Results */}
      {hasDetailedResults && (
        <AnalysisResultsPanel
          results={detailedResults}
          timeframe={timeframe}
          marketType={marketType}
          visualAnalysis={visualAnalysis}
        />
      )}

      {/* Fast Analysis Results */}
      {hasSignificantFast && (
        <FastAnalysisDisplay
          results={fastAnalysisResults}
          timeframe={timeframe}
        />
      )}
    </div>
  );
};

export default AnalysisContainer;
