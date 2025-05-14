
import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FastAnalysisResult {
  type: string;
  found: boolean;
  direction: "up" | "down" | "neutral";  // Strict union type
  strength: number;
  name: string;
  description: string;
}

interface FastAnalysisIndicatorsProps {
  results: FastAnalysisResult[];
}

const FastAnalysisIndicators: React.FC<FastAnalysisIndicatorsProps> = ({ results }) => {
  // Early return if no results or only weak results
  if (results.length === 0) return null;
  
  const significantResults = results.filter(r => r.strength > 70);
  if (significantResults.length === 0) return null;
  
  // Organize indicators by direction
  const upwardIndicators = results.filter(result => result.direction === "up");
  const downwardIndicators = results.filter(result => result.direction === "down");
  
  // Calculate direction summary with strength
  const directionSummary = 
    upwardIndicators.length > downwardIndicators.length ? "up" :
    downwardIndicators.length > upwardIndicators.length ? "down" : "neutral";
  
  // Determine if there's manipulation risk (conflicting strong indicators)
  const hasManipulationRisk = results.some(r => r.description.includes("manipulação")) ||
    (upwardIndicators.length > 0 && downwardIndicators.length > 0 &&
     upwardIndicators[0].strength > 75 && downwardIndicators[0].strength > 75);
  
  return (
    <div className="absolute top-26 right-2 z-30">
      {/* Direction Summary Indicator - simplified */}
      <div className={cn(
        "flex items-center rounded-lg px-3 py-1.5 text-xs text-white font-medium shadow-lg backdrop-blur-sm mb-2 border",
        directionSummary === "up" 
          ? "bg-trader-green/60 border-trader-green/30" 
          : directionSummary === "down" 
            ? "bg-trader-red/60 border-trader-red/30" 
            : "bg-gray-600/60 border-gray-500/30"
      )}>
        {directionSummary === "up" ? (
          <TrendingUp className="h-4 w-4 mr-2" />
        ) : directionSummary === "down" ? (
          <TrendingDown className="h-4 w-4 mr-2" />
        ) : null}
        
        <span>
          {directionSummary === "up" ? "Tendência Alta" : 
          directionSummary === "down" ? "Tendência Baixa" : 
          "Neutro"}
        </span>
        
        {/* Manipulation warning badge - only if needed */}
        {hasManipulationRisk && (
          <div className="ml-2 bg-yellow-500/60 text-[10px] px-1.5 py-0.5 rounded-full flex items-center">
            <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
            Atenção
          </div>
        )}
      </div>
      
      {/* Individual Indicators - limit to top 2 strongest only */}
      <div className="flex flex-col gap-1.5">
        {results
          .sort((a, b) => b.strength - a.strength)
          .slice(0, 2) // Only show top 2
          .map((result, index) => (
            <div 
              key={`${result.type}-${index}`}
              className={cn(
                "flex items-center justify-between rounded-full px-3 py-1 text-xs text-white shadow-lg backdrop-blur-sm", 
                result.direction === "up" ? "bg-trader-green/60" : 
                result.direction === "down" ? "bg-trader-red/60" : 
                "bg-gray-500/60"
              )}
            >
              <span>{result.name}</span>
              <div className="w-8 bg-black/30 rounded-full h-1.5 ml-2">
                <div 
                  className="h-1.5 rounded-full bg-white"
                  style={{ width: `${Math.min(100, result.strength)}%` }}
                />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default FastAnalysisIndicators;
