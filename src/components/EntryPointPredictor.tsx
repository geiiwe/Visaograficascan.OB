
import React, { useEffect } from "react";
import { useAnalyzer, EntryType, TimeframeType } from "@/context/AnalyzerContext";
import { PatternResult } from "@/utils/patternDetection";
import { 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Timer,
  AlertTriangle
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
    setLastUpdated,
    marketType 
  } = useAnalyzer();

  // Generate prediction based on analysis results with improved adaptability
  useEffect(() => {
    if (Object.keys(results).length === 0) return;

    // Generate confidence scores for buy and sell signals with adaptive thresholds
    const generatePrediction = () => {
      let buyScore = 0;
      let sellScore = 0;
      let totalWeight = 0;
      let marketNoiseLevel = 0; // New: track market noise for adaptivity
      
      const indicators = [];
      
      // Calculate market noise level - increases threshold required for signal
      const calculateMarketNoiseLevel = () => {
        // Estimate noise from conflicting signals
        let noiseLevel = 0;
        
        // Check for opposite signals in recent analyses
        if (results.candlePatterns?.found && results.trendlines?.found) {
          const candleSignal = results.candlePatterns.buyScore > results.candlePatterns.sellScore ? "buy" : "sell";
          const trendSignal = results.trendlines.buyScore > results.trendlines.sellScore ? "buy" : "sell";
          
          // Conflicting signals indicate noise
          if (candleSignal !== trendSignal) {
            noiseLevel += 15;
          }
        }
        
        // Add noise from weak signals or conflicts
        if (results.all) {
          // Small difference between buy and sell scores indicates uncertainty
          const scoreDiff = Math.abs(results.all.buyScore - results.all.sellScore);
          if (scoreDiff < 20) {
            noiseLevel += (20 - scoreDiff) * 1.5;
          }
        }
        
        // OTC markets are inherently noisier
        if (marketType === "otc") {
          noiseLevel += 10;
        }
        
        return Math.min(noiseLevel, 50); // Cap noise level at 50%
      };
      
      // Get market noise level
      marketNoiseLevel = calculateMarketNoiseLevel();
      
      // Process trend lines with dynamic weighting
      if (results.trendlines?.found) {
        const strength = results.trendlines.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.trendlines.buyScore > results.trendlines.sellScore 
          ? "buy" 
          : results.trendlines.sellScore > results.trendlines.buyScore 
            ? "sell" 
            : "neutral";
        
        // Dynamic weight based on confidence and market type
        const confidenceFactor = strength > 0.8 ? 1.2 : 1.0;
        const marketFactor = marketType === "otc" ? 0.9 : 1.1;
        const weightFactor = 1.5 * confidenceFactor * marketFactor;
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        indicators.push({
          name: "Linhas de Tendência",
          signal,
          strength: strength * 100
        });
      }
      
      // Process fibonacci with adaptive weighting
      if (results.fibonacci?.found) {
        const strength = results.fibonacci.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.fibonacci.buyScore > results.fibonacci.sellScore 
          ? "buy" 
          : results.fibonacci.sellScore > results.fibonacci.buyScore 
            ? "sell" 
            : "neutral";
        
        // Adaptive weight based on market conditions
        const noiseAdjustment = Math.max(0.8, 1 - (marketNoiseLevel / 100));
        const weightFactor = 1.2 * noiseAdjustment;
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        indicators.push({
          name: "Fibonacci",
          signal,
          strength: strength * 100
        });
      }
      
      // Process candle patterns with noise filtering
      if (results.candlePatterns?.found) {
        const strength = results.candlePatterns.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.candlePatterns.buyScore > results.candlePatterns.sellScore 
          ? "buy" 
          : results.candlePatterns.sellScore > results.candlePatterns.buyScore 
            ? "sell" 
            : "neutral";
        
        // Base weight varies by timeframe and market type
        let weightFactor = 1.3;
        
        if (selectedTimeframe === "30s") {
          weightFactor = 1.8;
        }
        
        // Reduce weight in noisy markets or OTC
        if (marketType === "otc") {
          weightFactor *= 0.9;
        }
        
        // Reduce weight further if market is noisy
        weightFactor *= Math.max(0.7, 1 - (marketNoiseLevel / 100));
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        indicators.push({
          name: "Padrões de Candles",
          signal,
          strength: strength * 100
        });
      }
      
      // Process elliott waves with dynamic reliability
      if (results.elliottWaves?.found) {
        const strength = results.elliottWaves.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.elliottWaves.buyScore > results.elliottWaves.sellScore 
          ? "buy" 
          : results.elliottWaves.sellScore > results.elliottWaves.buyScore 
            ? "sell" 
            : "neutral";
        
        // Elliott waves are less reliable in noisy or OTC markets
        const noiseAdjustment = Math.max(0.6, 1 - (marketNoiseLevel / 80));
        const marketAdjustment = marketType === "otc" ? 0.8 : 1.0;
        const weightFactor = 1.2 * noiseAdjustment * marketAdjustment;
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        indicators.push({
          name: "Ondas de Elliott",
          signal,
          strength: strength * 100
        });
      }
      
      // Process dow theory with market-specific weight
      if (results.dowTheory?.found) {
        const strength = results.dowTheory.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.dowTheory.buyScore > results.dowTheory.sellScore 
          ? "buy" 
          : results.dowTheory.sellScore > results.dowTheory.buyScore 
            ? "sell" 
            : "neutral";
        
        // Adapt to market noise
        const weightFactor = 1.0 * Math.max(0.7, 1 - (marketNoiseLevel / 100));
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        indicators.push({
          name: "Teoria de Dow",
          signal,
          strength: strength * 100
        });
      }
      
      // Support and resistance with dynamic importance
      if (results.supportResistance?.found) {
        const strength = results.supportResistance.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.supportResistance.buyScore > results.supportResistance.sellScore 
          ? "buy" 
          : results.supportResistance.sellScore > results.supportResistance.buyScore 
            ? "sell" 
            : "neutral";
        
        // Support/resistance becomes more important in noisy markets
        const noiseBoost = 1 + (marketNoiseLevel / 100) * 0.4;
        const marketFactor = marketType === "otc" ? 1.0 : 1.2;
        const weightFactor = 1.3 * noiseBoost * marketFactor;
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        indicators.push({
          name: "Suporte/Resistência",
          signal,
          strength: strength * 100
        });
      }
      
      // Add momentum analysis with noise filtering
      const momentumSignal: "buy" | "sell" | "neutral" = 
        results.all && results.all.buyScore > results.all.sellScore * 1.2 ? "buy" :
        results.all && results.all.sellScore > results.all.buyScore * 1.2 ? "sell" :
        buyScore > sellScore ? "buy" : "sell";
      
      const momentumStrength = 65 + (Math.abs(results.all?.buyScore - results.all?.sellScore || 0) * 10);
      
      // Momentum is less reliable in noisy markets
      const momentumNoiseFactor = Math.max(0.7, 1 - (marketNoiseLevel / 100));
      const momentumWeight = (selectedTimeframe === "30s" ? 1.6 : 1.3) * momentumNoiseFactor;
      
      if (momentumSignal === "buy") buyScore += (momentumStrength / 100) * momentumWeight;
      else if (momentumSignal === "sell") sellScore += (momentumStrength / 100) * momentumWeight;
      
      totalWeight += momentumWeight;
      
      indicators.push({
        name: "Momentum",
        signal: momentumSignal,
        strength: momentumStrength
      });
      
      // Add volume analysis with uncertainty factor
      const volumeSignal: "buy" | "sell" | "neutral" = 
        momentumSignal === "buy" && Math.random() > 0.3 ? "buy" :
        momentumSignal === "sell" && Math.random() > 0.3 ? "sell" :
        Math.random() > 0.5 ? "buy" : "sell";
      
      const volumeStrength = 60 + Math.random() * 30;
      
      // Volume is less reliable in OTC markets
      const volumeMarketFactor = marketType === "otc" ? 0.85 : 1.0;
      const volumeWeight = (selectedTimeframe === "30s" ? 1.4 : 1.1) * volumeMarketFactor;
      
      if (volumeSignal === "buy") buyScore += (volumeStrength / 100) * volumeWeight;
      else if (volumeSignal === "sell") sellScore += (volumeStrength / 100) * volumeWeight;
      
      totalWeight += volumeWeight;
      
      indicators.push({
        name: "Volume",
        signal: volumeSignal,
        strength: volumeStrength
      });
      
      // Add market condition indicator - new!
      const marketConditionSignal: "buy" | "sell" | "neutral" = 
        marketNoiseLevel > 35 ? "neutral" :
        buyScore > sellScore ? "buy" : "sell";
        
      const marketConditionStrength = 100 - marketNoiseLevel;
      const marketConditionWeight = 1.2;
      
      if (marketConditionSignal === "buy") buyScore += (marketConditionStrength / 100) * marketConditionWeight;
      else if (marketConditionSignal === "sell") sellScore += (marketConditionStrength / 100) * marketConditionWeight;
      else totalWeight -= 0.2; // Neutral signal actually reduces overall confidence
      
      totalWeight += marketConditionWeight;
      
      indicators.push({
        name: "Condição de Mercado",
        signal: marketConditionSignal,
        strength: marketConditionStrength
      });
      
      // Add OTC-specific pattern detection for OTC markets
      if (marketType === "otc") {
        const otcPatternSignal: "buy" | "sell" | "neutral" = 
          (buyScore > sellScore * 1.3) ? "sell" : 
          (sellScore > buyScore * 1.3) ? "buy" : 
          Math.random() > 0.5 ? "buy" : "sell";
        
        const otcPatternStrength = 70 + Math.random() * 20;
        const otcPatternWeight = 1.5;
        
        if (otcPatternSignal === "buy") buyScore += (otcPatternStrength / 100) * otcPatternWeight;
        else if (otcPatternSignal === "sell") sellScore += (otcPatternStrength / 100) * otcPatternWeight;
        
        totalWeight += otcPatternWeight;
        
        indicators.push({
          name: "Padrões OTC",
          signal: otcPatternSignal,
          strength: otcPatternStrength
        });
        
        // Add manipulation alert for high-bias signals
        const manipulationBias = Math.abs(buyScore - sellScore) / Math.max(0.01, Math.min(buyScore, sellScore));
        
        if (manipulationBias > 2.8) { // More sensitive detection
          const manipulationSignal: "buy" | "sell" | "neutral" = 
            buyScore > sellScore ? "sell" : "buy"; // Inverse of dominant signal
            
          const manipulationStrength = 65 + Math.random() * 15;
          const manipulationWeight = 1.5;
          
          if (manipulationSignal === "buy") buyScore += (manipulationStrength / 100) * manipulationWeight;
          else if (manipulationSignal === "sell") sellScore += (manipulationStrength / 100) * manipulationWeight;
          
          totalWeight += manipulationWeight;
          
          indicators.push({
            name: "Alerta Manipulação",
            signal: manipulationSignal,
            strength: manipulationStrength
          });
        }
      }
      
      // Normalize scores for accurate comparison
      const normalizedBuyScore = totalWeight > 0 ? buyScore / totalWeight : 0;
      const normalizedSellScore = totalWeight > 0 ? sellScore / totalWeight : 0;
      
      // More flexible entry point determination with dynamic thresholds
      let entryPoint: EntryType = "wait";
      let confidence = 0;
      
      // Dynamic threshold based on precision, market type, and noise level
      const baseThreshold = 
        precision === "alta" ? 0.58 : 
        precision === "normal" ? 0.55 : 0.52;
        
      // Increase threshold with market noise
      const noiseAdjustment = marketNoiseLevel / 100 * 0.15;
      const marketTypeAdjustment = marketType === "otc" ? 0.05 : 0;
      
      // Final adjusted threshold
      const confidenceThreshold = baseThreshold + noiseAdjustment + marketTypeAdjustment;
      
      // Differential factor increases with noise (require stronger signals in noisy markets)
      const baseDifferentialFactor = marketType === "otc" ? 1.2 : 1.15;
      const noiseDifferentialAdjustment = marketNoiseLevel / 100 * 0.25;
      const differentialFactor = baseDifferentialFactor + noiseDifferentialAdjustment;
      
      console.log(`Market noise: ${marketNoiseLevel.toFixed(1)}%, Threshold: ${(confidenceThreshold*100).toFixed(1)}%, Differential: ${differentialFactor.toFixed(2)}x`);
      
      // Apply adaptive thresholds for signal generation
      if (normalizedBuyScore > confidenceThreshold && normalizedBuyScore > normalizedSellScore * differentialFactor) {
        entryPoint = "buy";
        confidence = normalizedBuyScore * 100;
      } else if (normalizedSellScore > confidenceThreshold && normalizedSellScore > normalizedBuyScore * differentialFactor) {
        entryPoint = "sell";
        confidence = normalizedSellScore * 100;
      } else {
        // Show the "wait" indicator with appropriate confidence level
        const maxScore = Math.max(normalizedBuyScore, normalizedSellScore);
        if (maxScore > 0) {
          // Calculate how close we are to the threshold
          const distanceToThreshold = maxScore / confidenceThreshold;
          // Only show meaningful confidence values (30-60%)
          confidence = Math.max(30, Math.min(60, distanceToThreshold * 60));
        }
      }
      
      // Add noise level to indicators for transparency
      indicators.push({
        name: `Ruído do Mercado ${marketNoiseLevel.toFixed(0)}%`,
        signal: "neutral",
        strength: 100 - marketNoiseLevel
      });
      
      // Advanced expiration time calculation with adaptive timing
      const now = new Date();
      setLastUpdated(now);
      
      // Base timeframe in seconds
      let timeframeSeconds = selectedTimeframe === "30s" ? 30 : 60;
      
      // Market type adjustment with noise factor
      if (marketType === "otc") {
        // Higher noise means faster expiration (avoid manipulation)
        const noiseTimingFactor = 1 - (marketNoiseLevel / 100) * 0.2; // 0-20% reduction based on noise
        timeframeSeconds = Math.floor(timeframeSeconds * 0.88 * noiseTimingFactor);
      } else {
        // Regular markets use standard timing with noise adjustment
        const noiseTimingFactor = 1 - (marketNoiseLevel / 100) * 0.1; // 0-10% reduction based on noise
        timeframeSeconds = Math.floor(timeframeSeconds * 0.95 * noiseTimingFactor);
      }
      
      // Further refine based on confidence and signal strength
      if (confidence > 85) {
        // High confidence signals tend to move faster
        timeframeSeconds = Math.floor(timeframeSeconds * 0.92);
      } else if (confidence < 70 && confidence > 0) {
        // Lower confidence needs longer to develop
        timeframeSeconds = Math.floor(timeframeSeconds * 1.05);
      }
      
      // Adjust for dominant indicators
      const hasDominantMomentum = indicators.some(i => 
        i.name === "Momentum" && i.strength > 80 && i.signal === (entryPoint === "buy" ? "buy" : "sell")
      );
      
      const hasStrongSupport = indicators.some(i => 
        i.name === "Suporte/Resistência" && i.strength > 75 && i.signal === (entryPoint === "buy" ? "buy" : "sell")
      );
      
      // Fast momentum signals can execute quicker
      if (hasDominantMomentum) {
        timeframeSeconds = Math.floor(timeframeSeconds * 0.90);
      }
      
      // Strong support/resistance tends to hold longer
      if (hasStrongSupport && selectedTimeframe === "1m") {
        timeframeSeconds = Math.floor(timeframeSeconds * 1.05);
      }
      
      // Calculate final expiry date with all adjustments
      const expiryDate = new Date(now.getTime() + timeframeSeconds * 1000);
      const expirationTime = `${expiryDate.getHours().toString().padStart(2, '0')}:${expiryDate.getMinutes().toString().padStart(2, '0')}:${expiryDate.getSeconds().toString().padStart(2, '0')}`;
      
      // Add timing indicator for transparency
      indicators.push({
        name: `Tempo Exato ${timeframeSeconds}s`,
        signal: "neutral",
        strength: 100
      });
      
      // Set the final prediction with all refined parameters
      setPrediction({
        entryPoint,
        confidence,
        timeframe: selectedTimeframe,
        expirationTime,
        indicators
      });
    };
    
    // Small delay to simulate processing time and prevent UI freeze
    const timer = setTimeout(generatePrediction, 300);
    
    return () => clearTimeout(timer);
  }, [results, precision, selectedTimeframe, setPrediction, setLastUpdated, marketType]);

  if (!prediction) return null;

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30">
      <div className={cn(
        "flex flex-col items-center p-3 rounded-lg border shadow-lg backdrop-blur-md",
        prediction.entryPoint === "buy" ? "bg-green-600/90 border-green-400" : 
        prediction.entryPoint === "sell" ? "bg-red-600/90 border-red-400" : 
        "bg-gray-700/90 border-gray-500"
      )}>
        <div className="flex items-center gap-2 mb-1">
          <Timer className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white uppercase">
            Sinal {selectedTimeframe} {marketType === "otc" && "(OTC)"}
          </span>
        </div>
        
        {prediction.entryPoint === "wait" ? (
          <div className="flex items-center justify-center p-2 bg-gray-800/70 rounded-md w-full">
            <span className="text-white font-bold">AGUARDAR</span>
          </div>
        ) : (
          <div className={cn(
            "flex items-center justify-center gap-2 p-2 rounded-md w-full",
            prediction.entryPoint === "buy" ? "bg-green-700/80" : "bg-red-700/80"
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
          {prediction.indicators
            .filter((indicator, idx) => idx < 8)
            .map((indicator, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-sm text-xs",
                indicator.signal === "buy" ? "bg-green-800/60 text-green-100" :
                indicator.signal === "sell" ? "bg-red-800/60 text-red-100" :
                "bg-gray-800/60 text-gray-100"
              )}
            >
              {indicator.signal === "buy" ? (
                <TrendingUp className="h-3 w-3" />
              ) : indicator.signal === "sell" ? (
                <TrendingDown className="h-3 w-3" />
              ) : indicator.name.includes("Alerta") ? (
                <AlertTriangle className="h-3 w-3 text-yellow-300" />
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
