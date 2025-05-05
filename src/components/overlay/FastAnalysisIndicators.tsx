
import React from "react";
import { BarChart2, Activity, LineChart, TrendingUp, TrendingDown, BarChart, Zap, Waves, Target, ArrowUpDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FastAnalysisResult {
  type: string;
  found: boolean;
  direction: "up" | "down" | "neutral";
  strength: number;
  name: string;
  description: string;
}

interface FastAnalysisIndicatorsProps {
  results: FastAnalysisResult[];
}

const FastAnalysisIndicators: React.FC<FastAnalysisIndicatorsProps> = ({ results }) => {
  if (results.length === 0) return null;
  
  // Organize indicators by direction
  const upwardIndicators = results.filter(result => result.direction === "up");
  const downwardIndicators = results.filter(result => result.direction === "down");
  const neutralIndicators = results.filter(result => result.direction === "neutral");
  
  // Calculate direction summary with strength
  const directionSummary = 
    upwardIndicators.length > downwardIndicators.length ? "up" :
    downwardIndicators.length > upwardIndicators.length ? "down" : "neutral";
  
  // Calculate average strength for each direction
  const upStrength = upwardIndicators.length > 0 
    ? upwardIndicators.reduce((sum, item) => sum + item.strength, 0) / upwardIndicators.length 
    : 0;
  
  const downStrength = downwardIndicators.length > 0
    ? downwardIndicators.reduce((sum, item) => sum + item.strength, 0) / downwardIndicators.length
    : 0;
  
  // Calculate consensus level
  const totalIndicators = results.length;
  const consensusPercentage = totalIndicators > 0
    ? (directionSummary === "up" 
        ? (upwardIndicators.length / totalIndicators) * 100
        : (downwardIndicators.length / totalIndicators) * 100)
    : 0;
  
  // Determine if there's strong consensus (>=70%)
  const hasStrongConsensus = consensusPercentage >= 70;
  
  // Determine if there's manipulation risk (conflicting strong indicators)
  const hasManipulationRisk = results.some(r => r.description.includes("manipulação")) ||
    (upwardIndicators.length > 0 && downwardIndicators.length > 0 &&
     upStrength > 75 && downStrength > 75);
  
  // Choose appropriate icon for indicator type
  const getIndicatorIcon = (type: string) => {
    switch (type) {
      case "priceAction": return <BarChart2 className="h-3.5 w-3.5 mr-1.5" />;
      case "momentum": return <Activity className="h-3.5 w-3.5 mr-1.5" />;
      case "volumeSpikes": return <BarChart className="h-3.5 w-3.5 mr-1.5" />;
      case "candleFormation": return <Zap className="h-3.5 w-3.5 mr-1.5" />;
      case "priceReversal": return <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />;
      case "rsiAnalysis": return <Waves className="h-3.5 w-3.5 mr-1.5" />;
      case "macdCrossover": return <Activity className="h-3.5 w-3.5 mr-1.5" />;
      case "bollingerBands": return <Target className="h-3.5 w-3.5 mr-1.5" />;
      case "otcPatterns": return <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />;
      default: return <LineChart className="h-3.5 w-3.5 mr-1.5" />;
    }
  };
  
  return (
    <div className="absolute top-26 right-2 z-30">
      {/* Direction Summary Indicator with enhanced visualization */}
      {results.length > 1 && (
        <div className={cn(
          "flex items-center justify-between rounded-full px-3 py-2 text-xs text-white font-medium shadow-lg backdrop-blur-sm mb-2 border",
          directionSummary === "up" 
            ? "bg-trader-green/80 border-trader-green/50" 
            : directionSummary === "down" 
              ? "bg-trader-red/80 border-trader-red/50" 
              : "bg-gray-600/80 border-gray-500/50"
        )}>
          <div className="flex items-center gap-2">
            {directionSummary === "up" ? (
              <TrendingUp className="h-4 w-4" />
            ) : directionSummary === "down" ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4" />
            )}
            <div className="flex flex-col">
              <span>
                {directionSummary === "up" ? "Tendência Compradora" : 
                 directionSummary === "down" ? "Tendência Vendedora" : 
                 "Mercado Neutro"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div 
                    className={cn(
                      "h-1.5 rounded-full",
                      directionSummary === "up" ? "bg-green-300" : 
                      directionSummary === "down" ? "bg-red-300" : "bg-gray-300"
                    )}
                    style={{ 
                      width: `${Math.min(100, consensusPercentage)}%` 
                    }}
                  ></div>
                </div>
                <span className="opacity-90 text-[10px]">
                  {Math.round(consensusPercentage)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Manipulation warning badge */}
          {hasManipulationRisk && (
            <div className="bg-yellow-500/80 text-[10px] px-1.5 py-0.5 rounded-full ml-2 flex items-center">
              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
              Risco
            </div>
          )}
          
          {/* Consensus badge */}
          {hasStrongConsensus && !hasManipulationRisk && (
            <div className="bg-blue-500/80 text-[10px] px-1.5 py-0.5 rounded-full ml-2">
              Consenso
            </div>
          )}
        </div>
      )}
      
      {/* Individual Indicators sorted by strength */}
      <div className="flex flex-col gap-2 mt-2">
        {results
          .sort((a, b) => b.strength - a.strength)
          .map((result, index) => (
            <div 
              key={result.type}
              className={cn(
                "flex items-center justify-between rounded-full px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm", 
                result.direction === "up" ? "bg-trader-green/70" : 
                result.direction === "down" ? "bg-trader-red/70" : 
                "bg-gray-500/70",
                result.strength > 85 ? "border border-white/50" : ""
              )}
              style={{ marginTop: index > 0 ? '0.5rem' : '0' }}
            >
              <div className="flex items-center">
                {getIndicatorIcon(result.type)}
                <span>{result.name}</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {/* Strength indicator */}
                <div className="w-12 bg-black/30 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-white"
                    style={{ width: `${Math.min(100, result.strength)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] opacity-90">{Math.round(result.strength)}%</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FastAnalysisIndicators;
