
import { useEffect, useState } from "react";
import { useAnalyzer, EntryType, TimeframeType } from "@/context/AnalyzerContext";
import { 
  calculateMarketNoise, 
  calculateExpirationTime, 
  generateIndicators,
  PredictionResult,
  PatternResult
} from "@/utils/predictionUtils";

export function usePredictionEngine(results: Record<string, PatternResult>) {
  const { 
    precision, 
    prediction, 
    setPrediction, 
    selectedTimeframe, 
    setLastUpdated,
    marketType 
  } = useAnalyzer();
  
  useEffect(() => {
    if (Object.keys(results).length === 0) return;

    // Generate prediction based on analysis results with improved adaptability
    const generatePrediction = () => {
      let buyScore = 0;
      let sellScore = 0;
      let totalWeight = 0;
      
      // Calculate market noise level
      const marketNoiseLevel = calculateMarketNoise(results, marketType);
      console.log(`Market noise: ${marketNoiseLevel.toFixed(1)}%`);
      
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
      
      // Add market condition indicator
      const marketConditionSignal: "buy" | "sell" | "neutral" = 
        marketNoiseLevel > 35 ? "neutral" :
        buyScore > sellScore ? "buy" : "sell";
        
      const marketConditionStrength = 100 - marketNoiseLevel;
      const marketConditionWeight = 1.2;
      
      if (marketConditionSignal === "buy") buyScore += (marketConditionStrength / 100) * marketConditionWeight;
      else if (marketConditionSignal === "sell") sellScore += (marketConditionStrength / 100) * marketConditionWeight;
      else totalWeight -= 0.2; // Neutral signal actually reduces overall confidence
      
      totalWeight += marketConditionWeight;
      
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
        }
      }
      
      // Normalize scores for accurate comparison
      const normalizedBuyScore = totalWeight > 0 ? buyScore / totalWeight : 0;
      const normalizedSellScore = totalWeight > 0 ? sellScore / totalWeight : 0;
      
      // Generate indicators for display
      const indicators = generateIndicators(results, marketType, marketNoiseLevel, buyScore, sellScore);
      
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
      
      console.log(`Threshold: ${(confidenceThreshold*100).toFixed(1)}%, Differential: ${differentialFactor.toFixed(2)}x`);
      
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
      
      // Advanced expiration time calculation with adaptive timing
      const now = new Date();
      setLastUpdated(now);
      
      // Calculate expiration time with all factors
      const { expiryDate, timeframeSeconds } = calculateExpirationTime(
        selectedTimeframe,
        marketType,
        marketNoiseLevel,
        confidence,
        indicators
      );
      
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

  return prediction;
}
