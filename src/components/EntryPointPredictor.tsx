
import React from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { PatternResult } from "@/utils/predictionUtils";
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

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30">
      <div className={cn(
        "flex flex-col items-center p-3 rounded-lg border shadow-lg backdrop-blur-md",
        prediction.entryPoint === "buy" ? "bg-green-600/90 border-green-400" : 
        prediction.entryPoint === "sell" ? "bg-red-600/90 border-red-400" : 
        "bg-gray-700/90 border-gray-500"
      )}>
        <PredictionDisplay
          entryPoint={prediction.entryPoint}
          confidence={prediction.confidence}
          expirationTime={prediction.expirationTime}
          timeframe={selectedTimeframe}
          marketType={marketType}
        />
        
        <IndicatorList indicators={prediction.indicators} />
      </div>
    </div>
  );
};

export default EntryPointPredictor;
