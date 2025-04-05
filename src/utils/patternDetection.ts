/**
 * Pattern detection and analysis for technical indicators
 */

import { Point, Line, findIntersections, calculateDistance } from "./geometry";
import { detectTrendline, TrendlineResult } from "./trendlines";
import { findSupportResistance } from "./supportResistance";
import { detectFibonacciLevels } from "./fibonacci";
import { analyzeCandlestickPatterns } from "./candlesticks";
import { detectChartPatterns } from "./chartPatterns";

export interface PatternResult {
  found: boolean;
  pattern?: string;
  confidence?: number;
  strength?: "forte" | "médio" | "fraco";
  direction?: "up" | "down" | "sideways";
  description?: string;
  visualMarkers?: Array<{
    type: string;
    points: [number, number][];
    color: string;
    label?: string;
    strength?: string;
  }>;
  supportLevels?: number[];
  resistanceLevels?: number[];
  trendlines?: Line[];
  intersections?: Point[];
}

export interface AnalysisResult {
  trendlines: PatternResult;
  supportResistance: PatternResult;
  fibonacci: PatternResult;
  candlePatterns: PatternResult;
  chartPatterns: PatternResult;
}

export const analyzePatterns = async (
  imageData: ImageData,
  options: {
    sensitivity?: number;
    patternTypes?: string[];
    region?: { x: number; y: number; width: number; height: number };
  } = {}
): Promise<AnalysisResult> => {
  const { sensitivity = 0.7, patternTypes = ["all"] } = options;
  
  // Initialize results
  const results: AnalysisResult = {
    trendlines: { found: false },
    supportResistance: { found: false },
    fibonacci: { found: false },
    candlePatterns: { found: false },
    chartPatterns: { found: false }
  };
  
  try {
    // Detect trendlines
    if (patternTypes.includes("all") || patternTypes.includes("trendlines")) {
      const trendlineResult = await detectTrendline(imageData, sensitivity);
      if (trendlineResult.found) {
        results.trendlines = trendlineResult;
      }
    }
    
    // Find support and resistance levels
    if (patternTypes.includes("all") || patternTypes.includes("support-resistance")) {
      const srResult = await findSupportResistance(imageData, sensitivity);
      if (srResult.found) {
        results.supportResistance = srResult;
      }
    }
    
    // Detect Fibonacci levels
    if (patternTypes.includes("all") || patternTypes.includes("fibonacci")) {
      const fibResult = await detectFibonacciLevels(imageData, sensitivity);
      if (fibResult.found) {
        results.fibonacci = fibResult;
      }
    }
    
    // Analyze candlestick patterns
    if (patternTypes.includes("all") || patternTypes.includes("candles")) {
      const candleResult = await analyzeCandlestickPatterns(imageData, sensitivity);
      if (candleResult.found) {
        results.candlePatterns = candleResult;
      }
    }
    
    // Detect chart patterns
    if (patternTypes.includes("all") || patternTypes.includes("patterns")) {
      const patternResult = await detectChartPatterns(imageData, sensitivity);
      if (patternResult.found) {
        results.chartPatterns = patternResult;
      }
    }
    
    // Find intersections between different patterns
    if (results.trendlines.found && results.supportResistance.found) {
      const intersections = findIntersections(
        results.trendlines.trendlines || [],
        results.supportResistance.trendlines || []
      );
      
      if (intersections.length > 0) {
        results.trendlines.intersections = intersections;
        results.supportResistance.intersections = intersections;
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error analyzing patterns:", error);
    return results;
  }
};

// Function to detect Martingale patterns
export const detectMartingalePattern = async (
  data: number[],
  options: {
    sensitivity?: number;
    minSequence?: number;
  } = {}
): Promise<PatternResult> => {
  const { sensitivity = 0.7, minSequence = 3 } = options;
  
  try {
    let sequence = 0;
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    let peak = data[0];
    let confidence = 0;
    
    const markers: Array<{
      type: string;
      points: [number, number][];
      color: string;
      label?: string;
    }> = [];
    
    // Analyze price movements for Martingale pattern
    for (let i = 1; i < data.length; i++) {
      if (data[i] > peak) {
        peak = data[i];
        currentDrawdown = 0;
        
        // Add marker for new peak
        markers.push({
          type: "peak",
          points: [[i, data[i]]],
          color: "#22c55e",
          label: "Peak"
        });
      } else {
        currentDrawdown = (peak - data[i]) / peak;
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown;
          sequence++;
          
          // Add marker for drawdown
          markers.push({
            type: "drawdown",
            points: [[i-1, data[i-1]], [i, data[i]]],
            color: "#ef4444",
            label: "Drawdown"
          });
        }
      }
    }
    
    // Calculate confidence based on sequence length and drawdown
    if (sequence >= minSequence) {
      confidence = Math.min(100, (sequence / minSequence) * 100 * sensitivity);
      
      const patternName = sequence >= 5 ? "Martingale Forte" : "Martingale";
      
      return {
        found: true,
        pattern: "Martingale",
        confidence: confidence,
        strength: "forte",
        direction: "up",
        description: `${patternName} identificado com ${confidence.toFixed(0)}% de confiança.`,
        visualMarkers: markers
      };
    }
    
    return { found: false };
  } catch (error) {
    console.error("Error detecting Martingale pattern:", error);
    return { found: false };
  }
};

// Function to detect Anti-Martingale patterns
export const detectAntiMartingalePattern = async (
  data: number[],
  options: {
    sensitivity?: number;
    minSequence?: number;
  } = {}
): Promise<PatternResult> => {
  const { sensitivity = 0.7, minSequence = 3 } = options;
  
  try {
    let sequence = 0;
    let maxRally = 0;
    let currentRally = 0;
    let trough = data[0];
    let confidence = 0;
    
    const markers: Array<{
      type: string;
      points: [number, number][];
      color: string;
      label?: string;
    }> = [];
    
    // Analyze price movements for Anti-Martingale pattern
    for (let i = 1; i < data.length; i++) {
      if (data[i] < trough) {
        trough = data[i];
        currentRally = 0;
        
        // Add marker for new trough
        markers.push({
          type: "trough",
          points: [[i, data[i]]],
          color: "#ef4444",
          label: "Trough"
        });
      } else {
        currentRally = (data[i] - trough) / trough;
        if (currentRally > maxRally) {
          maxRally = currentRally;
          sequence++;
          
          // Add marker for rally
          markers.push({
            type: "rally",
            points: [[i-1, data[i-1]], [i, data[i]]],
            color: "#22c55e",
            label: "Rally"
          });
        }
      }
    }
    
    // Calculate confidence based on sequence length and rally strength
    if (sequence >= minSequence) {
      confidence = Math.min(100, (sequence / minSequence) * 100 * sensitivity);
      
      const patternName = sequence >= 5 ? "Anti-Martingale Forte" : "Anti-Martingale";
      
      return {
        found: true,
        pattern: "Anti-Martingale",
        confidence: confidence,
        strength: "forte",
        direction: "down",
        description: `${patternName} identificado com ${confidence.toFixed(0)}% de confiança.`,
        visualMarkers: markers
      };
    }
    
    return { found: false };
  } catch (error) {
    console.error("Error detecting Anti-Martingale pattern:", error);
    return { found: false };
  }
};

export const calculatePatternStrength = (
  confidence: number,
  sequence: number,
  volatility: number
): "forte" | "médio" | "fraco" => {
  // Calculate weighted score based on multiple factors
  const confidenceWeight = 0.4;
  const sequenceWeight = 0.35;
  const volatilityWeight = 0.25;
  
  const confidenceScore = confidence / 100;
  const sequenceScore = Math.min(sequence / 10, 1);
  const volatilityScore = Math.min(volatility / 0.1, 1);
  
  const totalScore = 
    confidenceScore * confidenceWeight +
    sequenceScore * sequenceWeight +
    volatilityScore * volatilityWeight;
  
  // Determine strength based on total score
  if (totalScore >= 0.8) return "forte";
  if (totalScore >= 0.5) return "médio";
  return "fraco";
};
