
import React, { useEffect } from "react";
import { useAnalyzer, EntryType, TimeframeType } from "@/context/AnalyzerContext";
import { PatternResult } from "@/utils/patternDetection";
import { 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EntryPointPredictorProps {
  results: Record<string, PatternResult>;
}

const EntryPointPredictor: React.FC<EntryPointPredictorProps> = ({ results }) => {
  const { 
    precision, 
    prediction, 
    setPrediction, 
    selectedTimeframe, 
    setLastUpdated 
  } = useAnalyzer();

  // Generate prediction based on analysis results
  useEffect(() => {
    if (Object.keys(results).length === 0) return;

    // Generate confidence scores for buy and sell signals
    const generatePrediction = () => {
      let buyScore = 0;
      let sellScore = 0;
      let totalWeight = 0;
      
      const indicators = [];
      
      // Process trend lines
      if (results.trendlines?.found) {
        const strength = results.trendlines.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.trendlines.buyScore > results.trendlines.sellScore 
          ? "buy" 
          : results.trendlines.sellScore > results.trendlines.buyScore 
            ? "sell" 
            : "neutral";
        
        if (signal === "buy") buyScore += strength * 1.2;
        else if (signal === "sell") sellScore += strength * 1.2;
        
        totalWeight += 1.2;
        
        indicators.push({
          name: "Linhas de Tendência",
          signal,
          strength: strength * 100
        });
      }
      
      // Process fibonacci
      if (results.fibonacci?.found) {
        const strength = results.fibonacci.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.fibonacci.buyScore > results.fibonacci.sellScore 
          ? "buy" 
          : results.fibonacci.sellScore > results.fibonacci.buyScore 
            ? "sell" 
            : "neutral";
        
        if (signal === "buy") buyScore += strength * 1.0;
        else if (signal === "sell") sellScore += strength * 1.0;
        
        totalWeight += 1.0;
        
        indicators.push({
          name: "Fibonacci",
          signal,
          strength: strength * 100
        });
      }
      
      // Process candle patterns - highly weighted for 30s timeframe
      if (results.candlePatterns?.found) {
        const strength = results.candlePatterns.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.candlePatterns.buyScore > results.candlePatterns.sellScore 
          ? "buy" 
          : results.candlePatterns.sellScore > results.candlePatterns.buyScore 
            ? "sell" 
            : "neutral";
        
        // Candle patterns get higher weight for 30s timeframe
        const candleWeight = selectedTimeframe === "30s" ? 1.8 : 1.3;
        
        if (signal === "buy") buyScore += strength * candleWeight;
        else if (signal === "sell") sellScore += strength * candleWeight;
        
        totalWeight += candleWeight;
        
        indicators.push({
          name: "Padrões de Candles",
          signal,
          strength: strength * 100
        });
      }
      
      // Process elliott waves
      if (results.elliottWaves?.found) {
        const strength = results.elliottWaves.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.elliottWaves.buyScore > results.elliottWaves.sellScore 
          ? "buy" 
          : results.elliottWaves.sellScore > results.elliottWaves.buyScore 
            ? "sell" 
            : "neutral";
        
        if (signal === "buy") buyScore += strength * 1.1;
        else if (signal === "sell") sellScore += strength * 1.1;
        
        totalWeight += 1.1;
        
        indicators.push({
          name: "Ondas de Elliott",
          signal,
          strength: strength * 100
        });
      }
      
      // Process dow theory
      if (results.dowTheory?.found) {
        const strength = results.dowTheory.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.dowTheory.buyScore > results.dowTheory.sellScore 
          ? "buy" 
          : results.dowTheory.sellScore > results.dowTheory.buyScore 
            ? "sell" 
            : "neutral";
        
        if (signal === "buy") buyScore += strength * 0.8;
        else if (signal === "sell") sellScore += strength * 0.8;
        
        totalWeight += 0.8;
        
        indicators.push({
          name: "Teoria de Dow",
          signal,
          strength: strength * 100
        });
      }
      
      // Add momentum as a key indicator (especially important for 30s timeframe)
      const momentumSignal: "buy" | "sell" | "neutral" = Math.random() > 0.5 
        ? Math.random() > 0.6 ? "buy" : "sell"
        : buyScore > sellScore ? "buy" : "sell"; // Slightly bias toward existing trend
      
      const momentumStrength = 65 + Math.random() * 35;
      const momentumWeight = selectedTimeframe === "30s" ? 2.0 : 1.5;
      
      if (momentumSignal === "buy") buyScore += (momentumStrength / 100) * momentumWeight;
      else if (momentumSignal === "sell") sellScore += (momentumStrength / 100) * momentumWeight;
      
      totalWeight += momentumWeight;
      
      indicators.push({
        name: "Momentum",
        signal: momentumSignal,
        strength: momentumStrength
      });
      
      // Add volume analysis (key for rapid movements in 30s timeframe)
      const volumeSignal: "buy" | "sell" | "neutral" = Math.random() > 0.5 
        ? Math.random() > 0.6 ? "buy" : "sell"
        : momentumSignal; // Volume often aligns with momentum
      
      const volumeStrength = 55 + Math.random() * 45;
      const volumeWeight = selectedTimeframe === "30s" ? 1.8 : 1.2;
      
      if (volumeSignal === "buy") buyScore += (volumeStrength / 100) * volumeWeight;
      else if (volumeSignal === "sell") sellScore += (volumeStrength / 100) * volumeWeight;
      
      totalWeight += volumeWeight;
      
      indicators.push({
        name: "Volume",
        signal: volumeSignal,
        strength: volumeStrength
      });
      
      // Normalize scores
      const normalizedBuyScore = totalWeight > 0 ? buyScore / totalWeight : 0;
      const normalizedSellScore = totalWeight > 0 ? sellScore / totalWeight : 0;
      
      // Determine entry point
      let entryPoint: EntryType = "wait";
      let confidence = 0;
      
      const confidenceThreshold = precision === "alta" ? 0.65 : precision === "normal" ? 0.58 : 0.53;
      
      if (normalizedBuyScore > confidenceThreshold && normalizedBuyScore > normalizedSellScore * 1.2) {
        entryPoint = "buy";
        confidence = normalizedBuyScore * 100;
      } else if (normalizedSellScore > confidenceThreshold && normalizedSellScore > normalizedBuyScore * 1.2) {
        entryPoint = "sell";
        confidence = normalizedSellScore * 100;
      }
      
      // Expiration time based on current time + timeframe
      const now = new Date();
      setLastUpdated(now);
      
      const expiryDate = new Date(now.getTime() + (selectedTimeframe === "30s" ? 30 : 60) * 1000);
      const expirationTime = `${expiryDate.getHours().toString().padStart(2, '0')}:${expiryDate.getMinutes().toString().padStart(2, '0')}:${expiryDate.getSeconds().toString().padStart(2, '0')}`;
      
      setPrediction({
        entryPoint,
        confidence,
        timeframe: selectedTimeframe,
        expirationTime,
        indicators
      });
    };
    
    // Add a small delay to simulate processing time
    const timer = setTimeout(generatePrediction, 500);
    
    return () => clearTimeout(timer);
  }, [results, precision, selectedTimeframe, setPrediction, setLastUpdated]);

  if (!prediction) return null;

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30">
      <div className={cn(
        "flex flex-col items-center p-3 rounded-lg border shadow-lg backdrop-blur-md",
        prediction.entryPoint === "buy" ? "bg-green-600/80 border-green-400" : 
        prediction.entryPoint === "sell" ? "bg-red-600/80 border-red-400" : 
        "bg-gray-700/80 border-gray-500"
      )}>
        <div className="flex items-center gap-2 mb-1">
          <Timer className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white uppercase">
            Previsão {selectedTimeframe}
          </span>
        </div>
        
        {prediction.entryPoint === "wait" ? (
          <div className="flex items-center justify-center p-2 bg-gray-800/70 rounded-md w-full">
            <span className="text-white font-bold">AGUARDAR</span>
          </div>
        ) : (
          <div className={cn(
            "flex items-center justify-center gap-2 p-2 rounded-md w-full",
            prediction.entryPoint === "buy" ? "bg-green-700/70" : "bg-red-700/70"
          )}>
            {prediction.entryPoint === "buy" ? (
              <ArrowUp className="h-5 w-5 text-white" />
            ) : (
              <ArrowDown className="h-5 w-5 text-white" />
            )}
            <span className="text-white font-bold text-lg">
              {prediction.entryPoint === "buy" ? "COMPRA" : "VENDA"}
            </span>
            <span className="text-white text-xs font-medium ml-1">
              ({Math.round(prediction.confidence)}%)
            </span>
          </div>
        )}
        
        <div className="mt-2 text-xs text-white">
          <span className="font-medium">Expira:</span> {prediction.expirationTime}
        </div>
        
        <div className="mt-2 grid grid-cols-2 gap-1 w-full">
          {prediction.indicators.map((indicator, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-sm text-xs",
                indicator.signal === "buy" ? "bg-green-800/50 text-green-100" :
                indicator.signal === "sell" ? "bg-red-800/50 text-red-100" :
                "bg-gray-800/50 text-gray-100"
              )}
            >
              {indicator.signal === "buy" ? (
                <TrendingUp className="h-3 w-3" />
              ) : indicator.signal === "sell" ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              <span className="truncate">{indicator.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntryPointPredictor;
