
import React from "react";
import { ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type MarketDirection = "buy" | "sell" | "neutral";
export type SignalStrength = "strong" | "moderate" | "weak";

interface DirectionIndicatorProps {
  direction: MarketDirection;
  strength: SignalStrength;
  compact?: boolean;
}

const getDirectionLabel = (direction: MarketDirection): string => {
  switch (direction) {
    case "buy": return "COMPRA";
    case "sell": return "VENDA";
    case "neutral": return "AGUARDE";
  }
};

const getStrengthLabel = (strength: SignalStrength): string => {
  switch (strength) {
    case "strong": return "sinal forte";
    case "moderate": return "sinal moderado";
    case "weak": return "sinal fraco";
  }
};

const DirectionIndicator: React.FC<DirectionIndicatorProps> = ({ 
  direction, 
  strength,
  compact = false
}) => {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-md p-2",
      direction === "buy" ? "bg-trader-green/20" : 
      direction === "sell" ? "bg-trader-red/20" :
      "bg-trader-yellow/20",
      compact ? "px-2 py-1" : "px-3 py-2"
    )}>
      <div className={cn(
        "flex-shrink-0 p-1.5 rounded-full",
        direction === "buy" ? "bg-trader-green/30" : 
        direction === "sell" ? "bg-trader-red/30" :
        "bg-trader-yellow/30"
      )}>
        {direction === "buy" && 
          <ArrowUp className="h-4 w-4 text-trader-green" />
        }
        {direction === "sell" && 
          <ArrowDown className="h-4 w-4 text-trader-red" />
        }
        {direction === "neutral" && 
          <AlertTriangle className="h-4 w-4 text-trader-yellow" />
        }
      </div>
      
      <div className="flex flex-col">
        <span className={cn(
          "font-bold text-sm",
          direction === "buy" ? "text-trader-green" : 
          direction === "sell" ? "text-trader-red" :
          "text-trader-yellow"
        )}>
          {getDirectionLabel(direction)}
        </span>
        {!compact && (
          <span className="text-xs text-trader-gray">
            {getStrengthLabel(strength)}
          </span>
        )}
      </div>
    </div>
  );
};

export default DirectionIndicator;
