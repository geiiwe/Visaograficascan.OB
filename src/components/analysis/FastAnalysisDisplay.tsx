
import React from "react";
import { cn } from "@/lib/utils";
import { Zap, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { FastAnalysisResult } from "../overlay/FastAnalysisIndicators";

interface FastAnalysisDisplayProps {
  results: FastAnalysisResult[];
  timeframe: string;
}

const FastAnalysisDisplay: React.FC<FastAnalysisDisplayProps> = ({
  results,
  timeframe
}) => {
  const significantResults = results.filter(r => r.found && r.strength > 60);

  if (significantResults.length === 0) return null;

  // Helper function to map direction to signal
  const getSignalFromDirection = (direction: "up" | "down" | "neutral") => {
    switch (direction) {
      case "up": return "buy";
      case "down": return "sell";
      default: return "neutral";
    }
  };

  return (
    <div className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 rounded-lg p-3 shadow-lg min-w-[280px]">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-blue-400" />
        <h4 className="text-white font-medium text-sm">Análise Rápida</h4>
        <div className="flex items-center gap-1 ml-auto">
          <Clock className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-300">{timeframe}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {significantResults.slice(0, 4).map((result, idx) => {
          const signal = getSignalFromDirection(result.direction);
          
          return (
            <div 
              key={`fast-${idx}`}
              className={cn(
                "flex items-center justify-between p-1.5 rounded text-xs",
                signal === "buy" ? "bg-green-700/20" : 
                signal === "sell" ? "bg-red-700/20" : "bg-gray-700/20"
              )}
            >
              <div className="flex items-center gap-1.5">
                {signal === "buy" ? 
                  <TrendingUp className="h-3 w-3 text-green-400" /> : 
                  signal === "sell" ?
                  <TrendingDown className="h-3 w-3 text-red-400" /> :
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                }
                <span className="text-white">{result.name}</span>
              </div>
              <span className={cn(
                "font-medium",
                signal === "buy" ? "text-green-400" : 
                signal === "sell" ? "text-red-400" : "text-gray-400"
              )}>
                {Math.round(result.strength)}%
              </span>
            </div>
          );
        })}
      </div>

      {significantResults.length > 4 && (
        <div className="mt-2 text-center text-xs text-gray-400">
          +{significantResults.length - 4} outros sinais
        </div>
      )}
    </div>
  );
};

export default FastAnalysisDisplay;
