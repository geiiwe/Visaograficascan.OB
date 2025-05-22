
import React from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { ExtendedPatternResult } from "@/utils/predictionUtils";
import { cn } from "@/lib/utils";
import { usePredictionEngine } from "@/hooks/usePredictionEngine";
import PredictionDisplay from "./prediction/PredictionDisplay";
import IndicatorList from "./prediction/IndicatorList";

interface EntryPointPredictorProps {
  results: Record<string, ExtendedPatternResult>;
}

const EntryPointPredictor: React.FC<EntryPointPredictorProps> = ({ results }) => {
  const { selectedTimeframe, marketType } = useAnalyzer();
  const prediction = usePredictionEngine(results);

  if (!prediction) return null;
  
  // Get Fibonacci quality if available - fixed by using the correct property structure
  const fibonacciQuality = results.fibonacci?.found ? 
    prediction.indicators.find(i => i.name.includes("Fibonacci"))?.strength || 0 : 0;
  
  // Determine if Fibonacci is influencing the decision
  const fibonacciInfluencing = fibonacciQuality > 65;
  
  // Check for Fibonacci and Candle relationship indicators
  const hasCandleFibRelation = prediction.indicators.some(i => 
    i.name.includes("Candles em") && i.name.includes("Fibonacci")
  );
  
  // Check for high volatility
  const volatilityIndicator = prediction.indicators.find(i => i.name.includes("Volatilidade"));
  const hasHighVolatility = volatilityIndicator && volatilityIndicator.strength > 65;
  const hasDangerousVolatility = volatilityIndicator && volatilityIndicator.strength > 75;
  
  // Filter indicators for display - limit to top 4 for cleaner UI
  // Prioritize Volatility and Fibonacci+Candle relationships if they exist
  const topIndicators = prediction.indicators
    .filter(ind => !ind.name.includes("Tempo Exato")) // Remove exact time indicator
    .sort((a, b) => {
      // First priority: Volatility warnings
      if (a.name.includes("Volatilidade") && a.strength > 65) return -1;
      if (b.name.includes("Volatilidade") && b.strength > 65) return 1;
      // Second priority: Fibonacci-Candle relationships
      if (a.name.includes("Candles em") && a.name.includes("Fibonacci")) return -1;
      if (b.name.includes("Candles em") && b.name.includes("Fibonacci")) return 1;
      // Then sort by strength
      return b.strength - a.strength;
    })
    .slice(0, hasDangerousVolatility ? 5 : 4); // Show more indicators with high volatility

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30">
      <div className={cn(
        "flex flex-col items-center p-3 rounded-lg border shadow-lg backdrop-blur-md",
        hasHighVolatility ? 
          "bg-yellow-900/90 border-yellow-400/40" : 
          prediction.entryPoint === "buy" ? 
            hasCandleFibRelation ? "bg-green-700/90 border-green-400/40" : 
            fibonacciInfluencing ? "bg-green-700/80 border-green-400/30" : 
            "bg-green-600/80 border-green-400/30" : 
          prediction.entryPoint === "sell" ? 
            hasCandleFibRelation ? "bg-red-700/90 border-red-400/40" : 
            fibonacciInfluencing ? "bg-red-700/80 border-red-400/30" : 
            "bg-red-600/80 border-red-400/30" : 
          "bg-gray-700/80 border-gray-500/30",
        hasDangerousVolatility && "border-2 border-red-500/70"
      )}>
        <PredictionDisplay
          entryPoint={hasDangerousVolatility ? "wait" : prediction.entryPoint}
          confidence={hasDangerousVolatility ? Math.min(60, prediction.confidence) : prediction.confidence}
          expirationTime={prediction.expirationTime}
          timeframe={selectedTimeframe}
          marketType={marketType}
          fibonacciQuality={fibonacciQuality}
          hasCandleFibRelation={hasCandleFibRelation}
          hasHighVolatility={hasHighVolatility}
          volatilityLevel={volatilityIndicator?.strength || 0}
        />
        
        {/* Only show indicators in a cleaner way if we have any */}
        {topIndicators.length > 0 && (
          <div className="mt-2 w-full">
            <IndicatorList indicators={topIndicators} maxItems={hasDangerousVolatility ? 5 : 4} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryPointPredictor;
