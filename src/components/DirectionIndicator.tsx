
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
  className?: string;
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
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
  accuracy,
  className,
  style,
  onMouseDown
}) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 rounded-md p-2 transition-all hover:shadow-lg border",
        direction === "buy" ? "bg-trader-green/80 hover:bg-trader-green/90 border-trader-green/70" : 
        direction === "sell" ? "bg-trader-red/80 hover:bg-trader-red/90 border-trader-red/70" :
        "bg-trader-yellow/80 hover:bg-trader-yellow/90 border-trader-yellow/70",
        compact ? "px-2 py-1" : "px-3 py-2",
        className
      )}
      style={style}
      onMouseDown={onMouseDown}
    >
      <div className={cn(
        "flex-shrink-0 p-1.5 rounded-full",
        direction === "buy" ? "bg-trader-green text-white" : 
        direction === "sell" ? "bg-trader-red text-white" :
        "bg-trader-yellow text-black"
      )}>
        {direction === "buy" && 
          <ArrowUp className="h-4 w-4" />
        }
        {direction === "sell" && 
          <ArrowDown className="h-4 w-4" />
        }
        {direction === "neutral" && 
          <AlertTriangle className="h-4 w-4" />
        }
      </div>
      
      <div className="flex flex-col">
        <span className={cn(
          "font-bold text-sm",
          direction === "buy" ? "text-white" : 
          direction === "sell" ? "text-white" :
          "text-black"
        )}>
          {getDirectionLabel(direction)}
        </span>
        {!compact && (
          <div className="flex flex-col">
            <span className="text-xs text-white flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              {getStrengthLabel(strength)}
            </span>
            
            {accuracy && (
              <span className="text-xs text-white flex items-center mt-0.5">
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
              <div className="w-1.5 h-6 bg-white rounded-sm"></div>
              <div className="w-1.5 h-6 bg-white rounded-sm"></div>
              <div className="w-1.5 h-6 bg-white rounded-sm"></div>
            </div>
          )}
          {strength === "moderate" && (
            <div className="flex space-x-0.5">
              <div className="w-1.5 h-4 bg-white rounded-sm"></div>
              <div className="w-1.5 h-4 bg-white rounded-sm"></div>
              <div className="w-1.5 h-4 bg-white/50 rounded-sm"></div>
            </div>
          )}
          {strength === "weak" && (
            <div className="flex space-x-0.5">
              <div className="w-1.5 h-2 bg-white rounded-sm"></div>
              <div className="w-1.5 h-2 bg-white/50 rounded-sm"></div>
              <div className="w-1.5 h-2 bg-white/50 rounded-sm"></div>
            </div>
          )}
          <BarChart2 className="h-4 w-4 ml-1 text-white/70" />
        </div>
      )}
    </div>
  );
};

export default DirectionIndicator;
