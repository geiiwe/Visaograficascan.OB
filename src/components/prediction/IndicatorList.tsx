
import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Clock, AlertTriangle } from "lucide-react";
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
  );
};

export default IndicatorList;
