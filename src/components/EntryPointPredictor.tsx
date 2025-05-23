
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

// Define PredictionDisplayProps to match what we pass to the component
interface PredictionDisplayProps {
  entryPoint: "buy" | "sell" | "wait";
  confidence: number;
  expirationTime: string;
  timeframe: "30s" | "1m";
  marketType: "regular" | "otc";
  fibonacciQuality: number;
  hasCandleFibRelation: boolean;
  hasHighVolatility: boolean;
  volatilityLevel: number;
  circularPatternLevel: number;
  hasCandlePattern: boolean;
  candlePatternLevel: number;
}

// Define IndicatorListProps to match what we pass to the component
interface IndicatorListProps {
  indicators: { 
    name: string; 
    signal: "buy" | "sell" | "neutral"; 
    strength: number; 
  }[];
  maxItems: number;
  highlightCircular: boolean;
}

const EntryPointPredictor: React.FC<EntryPointPredictorProps> = ({ results }) => {
  const { selectedTimeframe, marketType, enableCircularAnalysis } = useAnalyzer();
  const prediction = usePredictionEngine(results);

  if (!prediction) return null;
  
  // Get Fibonacci quality if available - fixed by using the correct property structure
  const fibonacciQuality = results.fibonacci?.found && 
    results.fibonacci.fibonacciLevels ? 
    prediction.indicators.find(i => i.name.includes("Fibonacci"))?.strength || 0 : 0;
  
  // Determine if Fibonacci is influencing the decision
  const fibonacciInfluencing = fibonacciQuality > 65;
  
  // Check for Fibonacci and Candle relationship indicators - crucial confluence
  const hasCandleFibRelation = prediction.indicators.some(i => 
    i.name.includes("Candles em") && i.name.includes("Fibonacci")
  );
  
  // Check for volatility - key factor in decision making process
  const volatilityIndicator = prediction.indicators.find(i => i.name.includes("Volatilidade"));
  const hasHighVolatility = volatilityIndicator && volatilityIndicator.strength > 65;
  const hasDangerousVolatility = volatilityIndicator && volatilityIndicator.strength > 75;

  // Check for circular patterns - new analysis dimension
  const circularPatternIndicator = prediction.indicators.find(i => 
    i.name.includes("Ciclo") || i.name.includes("Onda") || i.name.includes("Rotação")
  );
  const hasCircularPattern = enableCircularAnalysis && circularPatternIndicator && circularPatternIndicator.strength > 60;
  const circularPatternStrength = circularPatternIndicator?.strength || 0;

  // Check for candlestick patterns specifically
  const candlePatternIndicator = prediction.indicators.find(i => 
    i.name.includes("Velas") || i.name.includes("Candles") || i.name.includes("Doji") ||
    i.name.includes("Martelo") || i.name.includes("Hammer") || i.name.includes("Engolfamento")
  );
  const hasCandlePattern = candlePatternIndicator && candlePatternIndicator.strength > 70;
  const candlePatternStrength = candlePatternIndicator?.strength || 0;

  // Get the most significant indicators driving the decision
  const primaryIndicator = prediction.indicators
    .filter(ind => !ind.name.includes("Volatilidade") && !ind.name.includes("Tempo Exato"))
    .sort((a, b) => b.strength - a.strength)[0];
  
  const secondaryIndicator = prediction.indicators
    .filter(ind => 
      !ind.name.includes("Volatilidade") && 
      !ind.name.includes("Tempo Exato") &&
      ind.name !== primaryIndicator?.name
    )
    .sort((a, b) => b.strength - a.strength)[0];
  
  // Determine the confidence adjustment based on pattern confluence
  const patternConfluence = prediction.indicators
    .filter(i => i.signal === prediction.entryPoint && i.strength > 70)
    .length;
    
  // Get the analysis narrative from the prediction engine
  const analysisNarrative = prediction.analysisNarrative || "";
  
  // Enhanced indicator display with circular pattern priority
  const topIndicators = prediction.indicators
    .filter(ind => !ind.name.includes("Tempo Exato")) // Remove exact time indicator
    .sort((a, b) => {
      // First priority: Volatility warnings
      if (a.name.includes("Volatilidade") && a.strength > 65) return -1;
      if (b.name.includes("Volatilidade") && b.strength > 65) return 1;
      
      // Second priority: Circular patterns (if enabled)
      if (enableCircularAnalysis) {
        if ((a.name.includes("Ciclo") || a.name.includes("Onda") || a.name.includes("Rotação")) && a.strength > 60) return -1;
        if ((b.name.includes("Ciclo") || b.name.includes("Onda") || b.name.includes("Rotação")) && b.strength > 60) return 1;
      }
      
      // Third priority: Candlestick patterns
      if ((a.name.includes("Velas") || a.name.includes("Candle")) && a.strength > 70) return -1;
      if ((b.name.includes("Velas") || b.name.includes("Candle")) && b.strength > 70) return 1;
      
      // Fourth priority: Fibonacci-Candle relationships
      if (a.name.includes("Candles em") && a.name.includes("Fibonacci")) return -1;
      if (b.name.includes("Candles em") && b.name.includes("Fibonacci")) return 1;
      
      // Fifth priority: Primary indicator that formed the decision
      if (a.name === primaryIndicator?.name) return -1;
      if (b.name === primaryIndicator?.name) return 1;
      
      // Then sort by strength
      return b.strength - a.strength;
    })
    .slice(0, (hasDangerousVolatility || hasCircularPattern) ? 5 : 4);

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30">
      <div className={cn(
        "flex flex-col items-center p-3 rounded-lg border shadow-lg backdrop-blur-md",
        // Special styling for circular patterns
        hasCircularPattern && circularPatternStrength > 75 ? 
          prediction.entryPoint === "buy" ? "bg-purple-700/90 border-purple-400/40" : 
          prediction.entryPoint === "sell" ? "bg-pink-700/90 border-pink-400/40" : 
          "bg-indigo-700/90 border-indigo-400/40" :
        // Volatility styling
        hasHighVolatility ? 
          "bg-yellow-900/90 border-yellow-400/40" : 
        // Standard styling with candlestick influence
        hasCandlePattern && candlePatternStrength > 80 ?
          prediction.entryPoint === "buy" ? "bg-emerald-700/90 border-emerald-400/40" :
          prediction.entryPoint === "sell" ? "bg-rose-700/90 border-rose-400/40" :
          "bg-gray-700/80 border-gray-500/30" :
        // Standard styling with Fibonacci influence  
        prediction.entryPoint === "buy" ? 
          hasCandleFibRelation ? "bg-green-700/90 border-green-400/40" : 
          fibonacciInfluencing ? "bg-green-700/80 border-green-400/30" : 
          "bg-green-600/80 border-green-400/30" : 
        prediction.entryPoint === "sell" ? 
          hasCandleFibRelation ? "bg-red-700/90 border-red-400/40" : 
          fibonacciInfluencing ? "bg-red-700/80 border-red-400/30" : 
          "bg-red-600/80 border-red-400/30" : 
        "bg-gray-700/80 border-gray-500/30",
        hasDangerousVolatility && "border-2 border-red-500/70",
        hasCircularPattern && circularPatternStrength > 85 && "border-2 border-purple-400/70"
      )}>
        <PredictionDisplay
          entryPoint={hasDangerousVolatility ? "wait" : prediction.entryPoint}
          confidence={hasDangerousVolatility ? Math.min(60, prediction.confidence) : 
                      hasCircularPattern && circularPatternStrength > 80 ? Math.max(prediction.confidence, circularPatternStrength) :
                      hasCandlePattern && candlePatternStrength > 80 ? Math.max(prediction.confidence, candlePatternStrength - 5) :
                      prediction.confidence}
          expirationTime={prediction.expirationTime}
          timeframe={selectedTimeframe}
          marketType={marketType}
          fibonacciQuality={fibonacciQuality}
          hasCandleFibRelation={hasCandleFibRelation}
          hasHighVolatility={hasHighVolatility}
          volatilityLevel={volatilityIndicator?.strength || 0}
          circularPatternLevel={circularPatternStrength}
          hasCandlePattern={hasCandlePattern}
          candlePatternLevel={candlePatternStrength}
        />
        
        {/* Enhanced analysis narrative with circular pattern and candle emphasis */}
        {analysisNarrative && (
          <div className="mt-2 px-2 py-1 bg-black/30 rounded-md w-full text-center">
            <p className="text-xs text-white">
              {hasCircularPattern && circularPatternStrength > 75 ? 
                `${analysisNarrative} (Padrão Circular ${Math.round(circularPatternStrength)}%)` :
               hasCandlePattern && candlePatternStrength > 80 ?
                `${analysisNarrative} (Padrão de Velas ${Math.round(candlePatternStrength)}%)` :
               analysisNarrative}
            </p>
          </div>
        )}
        
        {/* Display circular pattern badge if highly confident */}
        {hasCircularPattern && circularPatternStrength > 80 && (
          <div className="mt-1 px-2 py-0.5 bg-purple-500/50 rounded-full">
            <p className="text-xs text-white font-medium">Padrão Circular Detectado</p>
          </div>
        )}
        
        {/* Only show indicators in a cleaner way if we have any */}
        {topIndicators.length > 0 && (
          <div className="mt-2 w-full">
            <IndicatorList 
              indicators={topIndicators} 
              maxItems={(hasDangerousVolatility || hasCircularPattern || hasCandlePattern) ? 5 : 4} 
              highlightCircular={enableCircularAnalysis}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryPointPredictor;
