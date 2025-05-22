
import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Fingerprint } from "lucide-react";
import { PredictionIndicator } from "@/utils/predictionUtils";

interface IndicatorListProps {
  indicators: PredictionIndicator[];
  maxItems?: number;
}

const IndicatorList: React.FC<IndicatorListProps> = ({ indicators, maxItems = 8 }) => {
  return (
    <div className="grid grid-cols-2 gap-1 w-full">
      {indicators
        .filter((_, idx) => idx < maxItems)
        .map((indicator, idx) => {
          // Check if this is a Fibonacci indicator
          const isFibonacci = indicator.name.includes("Fibonacci");
          // Check if this is a combined Fib-Candle indicator
          const isFibCandle = indicator.name.includes("Candles") && indicator.name.includes("Fib");
          
          return (
            <div 
              key={idx} 
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-sm text-xs",
                isFibCandle ?
                  indicator.signal === "buy" ? "bg-[#f97316]/60 text-white border-l-2 border-[#f97316]" : 
                  indicator.signal === "sell" ? "bg-[#f97316]/60 text-white border-l-2 border-[#f97316]" : 
                  "bg-[#f97316]/50 text-white border-l-2 border-[#f97316]"
                :
                isFibonacci ? 
                  indicator.signal === "buy" ? "bg-[#f97316]/40 text-white border-l-2 border-[#f97316]" : 
                  indicator.signal === "sell" ? "bg-[#f97316]/40 text-white border-l-2 border-[#f97316]" : 
                  "bg-[#f97316]/30 text-white border-l-2 border-[#f97316]"
                :
                indicator.signal === "buy" ? "bg-green-800/40 text-green-100" :
                indicator.signal === "sell" ? "bg-red-800/40 text-red-100" :
                "bg-gray-800/40 text-gray-100"
              )}
            >
              {isFibonacci || isFibCandle ? (
                <Fingerprint className="h-3 w-3" />
              ) : indicator.signal === "buy" ? (
                <TrendingUp className="h-3 w-3" />
              ) : indicator.signal === "sell" ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              <span className="truncate">{indicator.name}</span>
            </div>
          );
        })}
    </div>
  );
};

export default IndicatorList;
