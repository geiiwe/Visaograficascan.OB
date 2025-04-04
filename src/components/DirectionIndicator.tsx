
import React from "react";
import { ArrowUp, ArrowDown, AlertTriangle, Zap, BarChart2, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

export type MarketDirection = "buy" | "sell" | "neutral";
export type SignalStrength = "strong" | "moderate" | "weak";

interface DirectionIndicatorProps {
  direction: MarketDirection;
  strength: SignalStrength;
  compact?: boolean;
  accuracy?: number;
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

const getAccuracyLabel = (accuracy?: number): string => {
  if (!accuracy) return "";
  return `${accuracy}% de acerto`;
};

const DirectionIndicator: React.FC<DirectionIndicatorProps> = ({ 
  direction, 
  strength,
  compact = false,
  accuracy
}) => {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-md p-2 transition-all hover:shadow-lg",
      direction === "buy" ? "bg-trader-green/20 hover:bg-trader-green/30" : 
      direction === "sell" ? "bg-trader-red/20 hover:bg-trader-red/30" :
      "bg-trader-yellow/20 hover:bg-trader-yellow/30",
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
          <div className="flex flex-col">
            <span className="text-xs text-trader-gray flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              {getStrengthLabel(strength)}
            </span>
            
            {accuracy && (
              <span className="text-xs text-trader-blue flex items-center mt-0.5">
                <Percent className="h-3 w-3 mr-1" />
                {getAccuracyLabel(accuracy)}
              </span>
            )}
          </div>
        )}
      </div>
      
      {!compact && (
        <div className="ml-auto flex items-center">
          {strength === "strong" && (
            <div className="flex space-x-0.5">
              <div className="w-1.5 h-6 bg-trader-green/80 rounded-sm"></div>
              <div className="w-1.5 h-6 bg-trader-green/80 rounded-sm"></div>
              <div className="w-1.5 h-6 bg-trader-green/80 rounded-sm"></div>
            </div>
          )}
          {strength === "moderate" && (
            <div className="flex space-x-0.5">
              <div className="w-1.5 h-4 bg-trader-blue/80 rounded-sm"></div>
              <div className="w-1.5 h-4 bg-trader-blue/80 rounded-sm"></div>
              <div className="w-1.5 h-4 bg-trader-gray/30 rounded-sm"></div>
            </div>
          )}
          {strength === "weak" && (
            <div className="flex space-x-0.5">
              <div className="w-1.5 h-2 bg-trader-yellow/80 rounded-sm"></div>
              <div className="w-1.5 h-2 bg-trader-gray/30 rounded-sm"></div>
              <div className="w-1.5 h-2 bg-trader-gray/30 rounded-sm"></div>
            </div>
          )}
          <BarChart2 className="h-4 w-4 ml-1 text-trader-gray/50" />
        </div>
      )}
    </div>
  );
};

export default DirectionIndicator;
