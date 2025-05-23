
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Timer, Fingerprint, ChevronDown, ChevronUp, AlertTriangle, Activity, TrendingUp } from "lucide-react";
import { EntryType, TimeframeType, MarketType } from "@/context/AnalyzerContext";

interface PredictionDisplayProps {
  entryPoint: EntryType;
  confidence: number;
  expirationTime: string;
  timeframe: TimeframeType;
  marketType: MarketType;
  fibonacciQuality?: number;
  hasCandleFibRelation?: boolean;
  hasHighVolatility?: boolean;
  volatilityLevel?: number;
  precisionLevel?: "low" | "medium" | "high";
  circularPatternLevel?: number;
  hasCandlePattern?: boolean;
  candlePatternLevel?: number;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  entryPoint,
  confidence,
  expirationTime,
  timeframe,
  marketType,
  fibonacciQuality = 0,
  hasCandleFibRelation = false,
  hasHighVolatility = false,
  volatilityLevel = 0,
  precisionLevel = "medium",
  circularPatternLevel = 0,
  hasCandlePattern = false,
  candlePatternLevel = 0
}) => {
  // Check if prediction is Fibonacci based
  const isFibonacciBased = fibonacciQuality > 65;
  // Check if circular pattern is significant
  const hasCircularPattern = circularPatternLevel > 60;
  
  // Quality indicator based on precision and fibonacci
  const getQualityIndicator = () => {
    if (hasHighVolatility) return "Volatilidade alta";
    if (precisionLevel === "high" && hasCandleFibRelation) return "Alta precisão";
    if (hasCandleFibRelation) return "Boa precisão";
    if (isFibonacciBased && hasCandlePattern) return "Confirmação dupla";
    if (isFibonacciBased) return "Média precisão";
    if (hasCircularPattern) return "Ciclo detectado";
    if (precisionLevel === "low") return "Análise rápida";
    return "Precisão normal";
  };
  
  return (
    <div className="bg-black/80 backdrop-blur-md p-3 rounded-lg border border-gray-700/50 shadow-xl w-full max-w-[320px]">
      <div className="flex items-center justify-between gap-2 mb-1 w-full">
        <div className="flex items-center">
          <Timer className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white uppercase ml-1">
            {timeframe} {marketType === "otc" && "(OTC)"}
          </span>
        </div>
        
        {/* Show badges for analysis patterns */}
        <div className="flex flex-wrap gap-1 justify-end">
          {/* Fibonacci badge */}
          {isFibonacciBased && (
            <div className={cn(
              "flex items-center px-1.5 py-0.5 rounded-full",
              hasCandleFibRelation ? "bg-[#f97316]/60" : "bg-[#f97316]/30"
            )}>
              <Fingerprint className="h-3.5 w-3.5 text-[#f97316]" />
              <span className="text-xs ml-1 text-white">
                {hasCandleFibRelation ? "Fib+Candle" : "Fibonacci"}
              </span>
            </div>
          )}
          
          {/* Circular pattern badge */}
          {hasCircularPattern && (
            <div className={cn(
              "flex items-center px-1.5 py-0.5 rounded-full",
              circularPatternLevel > 75 ? "bg-purple-600/60" : "bg-purple-600/30"
            )}>
              <Activity className="h-3.5 w-3.5 text-purple-300" />
              <span className="text-xs ml-1 text-white">
                Ciclo {Math.round(circularPatternLevel)}%
              </span>
            </div>
          )}
          
          {/* Candle pattern badge */}
          {hasCandlePattern && !hasCandleFibRelation && (
            <div className={cn(
              "flex items-center px-1.5 py-0.5 rounded-full",
              candlePatternLevel > 75 ? "bg-blue-600/60" : "bg-blue-600/30"
            )}>
              <TrendingUp className="h-3.5 w-3.5 text-blue-300" />
              <span className="text-xs ml-1 text-white">
                Candle {Math.round(candlePatternLevel)}%
              </span>
            </div>
          )}
          
          {/* Volatility warning when relevant */}
          {hasHighVolatility && volatilityLevel > 65 && (
            <div className={cn(
              "flex items-center px-1.5 py-0.5 rounded-full",
              volatilityLevel > 75 ? "bg-red-600/60" : "bg-yellow-600/60"
            )}>
              {volatilityLevel > 75 && <AlertTriangle className="h-3 w-3 text-white mr-1" />}
              <span className="text-xs text-white font-medium">
                Vol. {volatilityLevel.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>
      
      {entryPoint === "wait" ? (
        <div className="flex items-center justify-center p-2 bg-gray-800/70 rounded-md w-full">
          <span className="text-white font-bold">AGUARDAR</span>
        </div>
      ) : (
        <div className={cn(
          "flex items-center justify-between p-2 rounded-md w-full",
          entryPoint === "buy" ? 
            hasCandleFibRelation ? "bg-green-700/90" : "bg-green-700/80" : 
            hasCandleFibRelation ? "bg-red-700/90" : "bg-red-700/80"
        )}>
          <div className="flex items-center">
            {entryPoint === "buy" ? (
              <ArrowUp className="h-5 w-5 text-white" />
            ) : (
              <ArrowDown className="h-5 w-5 text-white" />
            )}
            <span className="text-white font-bold text-lg ml-1">
              {entryPoint === "buy" ? "COMPRA" : "VENDA"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white text-sm font-medium px-2 py-0.5 bg-black/20 rounded-full">
              {Math.round(confidence)}%
            </span>
            {confidence >= 70 && (
              <span className="text-xs text-green-100/80 mt-0.5">
                {entryPoint === "buy" ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />}
                {getQualityIndicator()}
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-2 flex justify-between items-center w-full text-xs text-gray-300">
        <span>Expira: {expirationTime}</span>
        
        {/* Show quality percentage based on best available pattern */}
        {(fibonacciQuality > 50 || hasCandlePattern || hasCircularPattern) && (
          <span className={cn(
            "text-[#f97316]",
            hasCandleFibRelation && "font-bold"
          )}>
            {hasCandleFibRelation 
              ? "Confirmado" 
              : hasCircularPattern && fibonacciQuality > 50 
                ? "Multi-padrão" 
                : hasCandlePattern && fibonacciQuality > 50 
                  ? "Multi-padrão"
                  : "Qualidade"}: {Math.round(
                    Math.max(
                      fibonacciQuality, 
                      candlePatternLevel, 
                      circularPatternLevel * 0.9
                    )
                  )}%
          </span>
        )}
      </div>
    </div>
  );
};

export default PredictionDisplay;
