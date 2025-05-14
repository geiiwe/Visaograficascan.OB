
import React from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { PatternResult } from "@/utils/patternDetection";
import { cn } from "@/lib/utils";
import { usePredictionEngine } from "@/hooks/usePredictionEngine";
import PredictionDisplay from "./prediction/PredictionDisplay";
import IndicatorList from "./prediction/IndicatorList";

interface EntryPointPredictorProps {
  results: Record<string, PatternResult>;
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
  
  // Filter indicators for display - limit to top 4 for cleaner UI
  const topIndicators = prediction.indicators
    .filter(ind => !ind.name.includes("Tempo Exato")) // Remove exact time indicator
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 4); // Limit to top 4 indicators

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30">
      <div className={cn(
        "flex flex-col items-center p-3 rounded-lg border shadow-lg backdrop-blur-md",
        prediction.entryPoint === "buy" ? 
          fibonacciInfluencing ? "bg-green-700/80 border-green-400/30" : "bg-green-600/80 border-green-400/30" : 
        prediction.entryPoint === "sell" ? 
          fibonacciInfluencing ? "bg-red-700/80 border-red-400/30" : "bg-red-600/80 border-red-400/30" : 
        "bg-gray-700/80 border-gray-500/30"
      )}>
        <PredictionDisplay
          entryPoint={prediction.entryPoint}
          confidence={prediction.confidence}
          expirationTime={prediction.expirationTime}
          timeframe={selectedTimeframe}
          marketType={marketType}
          fibonacciQuality={fibonacciQuality}
        />
        
        {/* Only show indicators in a cleaner way if we have any */}
        {topIndicators.length > 0 && (
          <div className="mt-2 w-full">
            <IndicatorList indicators={topIndicators} maxItems={4} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryPointPredictor;
