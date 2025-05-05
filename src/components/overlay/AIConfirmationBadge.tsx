
import React from "react";
import { Brain, CheckCheck, AlertCircle, TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIConfirmationBadgeProps {
  active: boolean;
  verified: boolean;
  direction: "buy" | "sell" | "neutral";
  confidence: number;
  majorityDirection?: boolean;
}

const AIConfirmationBadge: React.FC<AIConfirmationBadgeProps> = ({ 
  active, 
  verified, 
  direction, 
  confidence,
  majorityDirection = false
}) => {
  if (!active) return null;
  
  return (
    <div className="absolute top-2 right-2 z-30">
      <div className={cn(
        "flex items-center gap-1 rounded-full pr-3 pl-1.5 py-1 text-white shadow-lg backdrop-blur-sm border",
        verified ? (
          direction === "buy" 
            ? "bg-trader-green/80 border-trader-green/50" 
            : direction === "sell"
              ? "bg-trader-red/80 border-trader-red/50"
              : "bg-gray-600/80 border-gray-500/50"
        ) : "bg-gray-700/80 border-gray-500/50"
      )}>
        <div className={cn(
          "p-1 rounded-full mr-1",
          verified ? (
            direction === "buy" 
              ? "bg-trader-green text-white" 
              : direction === "sell"
                ? "bg-trader-red text-white"
                : "bg-gray-600 text-white"
          ) : "bg-gray-700 text-gray-300"
        )}>
          {verified ? (
            direction === "buy" ? (
              <TrendingUp className="h-3 w-3" />
            ) : direction === "sell" ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <HelpCircle className="h-3 w-3" />
            )
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-xs font-medium">IA {verified ? "Confirmou" : "Analisando"}</span>
            {majorityDirection && verified && (
              <div className="ml-1 bg-blue-500/80 rounded-full px-1.5 text-[10px]">
                Consenso
              </div>
            )}
          </div>
          
          {verified && confidence > 0 && (
            <div className="w-full bg-gray-200/30 rounded-full h-1 mt-0.5">
              <div 
                className={cn(
                  "h-1 rounded-full",
                  direction === "buy" ? "bg-white" : 
                  direction === "sell" ? "bg-white" : "bg-gray-400"
                )}
                style={{ width: `${Math.min(100, confidence)}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIConfirmationBadge;
