
import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Fingerprint, LineChart, AlertTriangle, Activity } from "lucide-react";
import { PredictionIndicator } from "@/utils/predictionUtils";

interface IndicatorListProps {
  indicators: PredictionIndicator[];
  maxItems?: number;
  compact?: boolean;
}

const IndicatorList: React.FC<IndicatorListProps> = ({ 
  indicators, 
  maxItems = 8,
  compact = false
}) => {
  const visibleIndicators = indicators.filter((_, idx) => idx < maxItems);
  
  // Group indicators by category
  const chartIndicators = visibleIndicators.filter(i => 
    !i.name.includes("Fibonacci") && 
    !i.name.includes("Candle") && 
    !i.name.includes("Volatilidade"));
  const fibonacciIndicators = visibleIndicators.filter(i => 
    i.name.includes("Fibonacci") && 
    !i.name.includes("Candle"));
  const candleFibIndicators = visibleIndicators.filter(i => 
    i.name.includes("Candle") && 
    i.name.includes("Fibonacci"));
  const volatilityIndicators = visibleIndicators.filter(i => 
    i.name.includes("Volatilidade"));
  
  return (
    <div className="space-y-1 w-full">
      {/* Volatility Indicators (High Priority) */}
      {volatilityIndicators.length > 0 && (
        <div className="grid grid-cols-1 gap-1 w-full">
          {volatilityIndicators.map((indicator, idx) => (
            <div 
              key={`volatility-${idx}`} 
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-sm text-xs",
                indicator.strength > 70 ? "bg-red-800/60 text-white border-l-2 border-red-400 animate-pulse" :
                indicator.strength > 50 ? "bg-yellow-800/60 text-white border-l-2 border-yellow-400" :
                "bg-blue-800/60 text-white border-l-2 border-blue-400"
              )}
            >
              {indicator.strength > 70 ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <Activity className="h-3 w-3" />
              )}
              <span className="truncate font-semibold">
                {indicator.name}
                {indicator.strength > 70 && !compact && " - Perigo"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Standard Chart Indicators */}
      <div className="grid grid-cols-2 gap-1 w-full">
        {chartIndicators.map((indicator, idx) => (
          <div 
            key={`chart-${idx}`} 
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-sm text-xs",
              indicator.signal === "buy" ? "bg-green-800/40 text-green-100" :
              indicator.signal === "sell" ? "bg-red-800/40 text-red-100" :
              "bg-gray-800/40 text-gray-100"
            )}
          >
            {indicator.signal === "buy" ? (
              <TrendingUp className="h-3 w-3" />
            ) : indicator.signal === "sell" ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <LineChart className="h-3 w-3" />
            )}
            <span className="truncate">{indicator.name}</span>
          </div>
        ))}
      </div>
      
      {/* Fibonacci Indicators */}
      {fibonacciIndicators.length > 0 && (
        <div className="grid grid-cols-2 gap-1 w-full">
          {fibonacciIndicators.map((indicator, idx) => (
            <div 
              key={`fib-${idx}`} 
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-sm text-xs",
                indicator.signal === "buy" ? "bg-[#f97316]/40 text-white border-l-2 border-[#f97316]" : 
                indicator.signal === "sell" ? "bg-[#f97316]/40 text-white border-l-2 border-[#f97316]" : 
                "bg-[#f97316]/30 text-white border-l-2 border-[#f97316]"
              )}
            >
              <Fingerprint className="h-3 w-3" />
              <span className="truncate">{indicator.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Fibonacci-Candle Relation Indicators */}
      {candleFibIndicators.length > 0 && (
        <div className="grid grid-cols-2 gap-1 w-full">
          {candleFibIndicators.map((indicator, idx) => (
            <div 
              key={`fibcandle-${idx}`} 
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-sm text-xs",
                "bg-[#f97316]/60 text-white border-l-2 border-[#f97316]"
              )}
            >
              <Fingerprint className="h-3 w-3" />
              <span className="truncate">{compact ? "Fib+Candle" : indicator.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndicatorList;
