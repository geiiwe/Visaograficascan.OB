
import React from "react";
import { cn } from "@/lib/utils";
import { ExtendedPatternResult } from "@/utils/predictionUtils";
import { TimeframeType, MarketType } from "@/context/AnalyzerContext";
import { TrendingUp, TrendingDown, Activity, Target, Zap } from "lucide-react";

interface AnalysisResultsPanelProps {
  results: Record<string, ExtendedPatternResult>;
  timeframe: TimeframeType;
  marketType: MarketType;
  visualAnalysis?: any;
}

const AnalysisResultsPanel: React.FC<AnalysisResultsPanelProps> = ({
  results,
  timeframe,
  marketType,
  visualAnalysis
}) => {
  // Organize results by type and strength
  const organizedResults = Object.entries(results)
    .filter(([type, result]) => type !== "all" && result.found)
    .map(([type, result]) => ({
      type,
      result,
      strength: Math.max(result.buyScore || 0, result.sellScore || 0),
      direction: (result.buyScore || 0) > (result.sellScore || 0) ? "buy" : "sell"
    }))
    .sort((a, b) => b.strength - a.strength);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "fibonacci": return "Fibonacci";
      case "candlePatterns": return "Padrões de Velas";
      case "trendlines": return "Linhas de Tendência";
      case "supportResistance": return "Suporte/Resistência";
      case "elliottWaves": return "Ondas de Elliott";
      case "dowTheory": return "Teoria Dow";
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fibonacci": return <Target className="h-4 w-4" />;
      case "candlePatterns": return <Activity className="h-4 w-4" />;
      case "trendlines": return <TrendingUp className="h-4 w-4" />;
      case "supportResistance": return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Get overall market direction
  const overallResult = results.all;
  const overallDirection = overallResult && overallResult.found ? 
    (overallResult.buyScore || 0) > (overallResult.sellScore || 0) ? "buy" : "sell" : null;

  return (
    <div className="bg-black/90 backdrop-blur-md border border-gray-700/50 rounded-lg p-4 shadow-xl min-w-[300px] max-w-[350px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm">Análises Detectadas</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-300">{timeframe}</span>
          {marketType === "otc" && (
            <span className="text-xs bg-purple-600/50 px-1 rounded">OTC</span>
          )}
        </div>
      </div>

      {/* Visual Analysis Quality */}
      {visualAnalysis && (
        <div className="mb-3 p-2 bg-gray-800/50 rounded">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Qualidade Visual IA</span>
            <span className={cn(
              "text-xs font-medium",
              visualAnalysis.chartQuality > 80 ? "text-green-400" :
              visualAnalysis.chartQuality > 60 ? "text-yellow-400" : "text-red-400"
            )}>
              {visualAnalysis.chartQuality}%
            </span>
          </div>
          {visualAnalysis.trendDirection !== "unknown" && (
            <div className="text-xs text-gray-400 mt-1">
              Tendência: {visualAnalysis.trendDirection}
            </div>
          )}
        </div>
      )}

      {/* Overall Direction */}
      {overallDirection && (
        <div className={cn(
          "mb-3 p-2 rounded flex items-center justify-between",
          overallDirection === "buy" ? "bg-green-700/30 border border-green-600/30" : 
          "bg-red-700/30 border border-red-600/30"
        )}>
          <div className="flex items-center gap-2">
            {overallDirection === "buy" ? 
              <TrendingUp className="h-4 w-4 text-green-400" /> : 
              <TrendingDown className="h-4 w-4 text-red-400" />
            }
            <span className="text-white font-medium text-sm">
              {overallDirection === "buy" ? "COMPRA" : "VENDA"}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-300">
              Score: {overallDirection === "buy" ? 
                (overallResult.buyScore || 0).toFixed(1) : 
                (overallResult.sellScore || 0).toFixed(1)
              }
            </div>
          </div>
        </div>
      )}

      {/* Individual Results */}
      <div className="space-y-2">
        {organizedResults.length > 0 ? (
          organizedResults.map(({ type, result, strength, direction }, idx) => (
            <div 
              key={`${type}-${idx}`}
              className={cn(
                "p-2 rounded border",
                direction === "buy" ? 
                  "bg-green-800/20 border-green-600/20" : 
                  "bg-red-800/20 border-red-600/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(type)}
                  <span className="text-white text-xs font-medium">
                    {getTypeLabel(type)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {direction === "buy" ? 
                    <TrendingUp className="h-3 w-3 text-green-400" /> : 
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  }
                  <span className="text-xs text-gray-300">
                    {Math.round(strength * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Additional details if available */}
              {result.confidence && result.confidence > 70 && (
                <div className="mt-1 text-xs text-gray-400">
                  Confiança: {result.confidence}%
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-400 text-sm">
            Nenhum padrão detectado
          </div>
        )}
      </div>

      {/* Analysis Summary */}
      {organizedResults.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-600/30">
          <div className="text-xs text-gray-300 text-center">
            {organizedResults.length} padrão{organizedResults.length > 1 ? "ões" : ""} detectado{organizedResults.length > 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResultsPanel;
