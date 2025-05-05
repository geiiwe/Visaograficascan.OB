
import React from "react";
import { Brain, CheckCheck, AlertCircle, TrendingUp, TrendingDown, HelpCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIConfirmationBadgeProps {
  active: boolean;
  verified: boolean;
  direction: "buy" | "sell" | "neutral";
  confidence: number;
  majorityDirection: boolean;
}

const AIConfirmationBadge: React.FC<AIConfirmationBadgeProps> = ({ 
  active, 
  verified, 
  direction, 
  confidence,
  majorityDirection
}) => {
  if (!active) return null;
  
  // Determine if confidence is high enough for a reliable signal
  const isHighConfidence = confidence >= 75;
  const isMediumConfidence = confidence >= 60 && confidence < 75;
  const isLowConfidence = confidence < 60;
  
  return (
    <div className="absolute top-2 right-2 z-30">
      <div className={cn(
        "flex items-center gap-2 rounded-full pr-4 pl-2 py-1.5 text-white shadow-lg backdrop-blur-sm border",
        verified ? (
          direction === "buy" 
            ? isHighConfidence ? "bg-trader-green/90 border-trader-green/50" : "bg-trader-green/80 border-trader-green/50"
            : direction === "sell"
              ? isHighConfidence ? "bg-trader-red/90 border-trader-red/50" : "bg-trader-red/80 border-trader-red/50"
              : "bg-gray-600/80 border-gray-500/50"
        ) : "bg-gray-700/80 border-gray-500/50"
      )}>
        <div className={cn(
          "p-1.5 rounded-full mr-1",
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
              <TrendingUp className="h-4 w-4" />
            ) : direction === "sell" ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <HelpCircle className="h-4 w-4" />
            )
          ) : (
            <Brain className="h-4 w-4 animate-pulse" />
          )}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">
              {verified ? 
                direction === "buy" ? "Entrada de Compra" :
                direction === "sell" ? "Entrada de Venda" : 
                "Aguardar Sinal" : 
                "IA Analisando"
              }
            </span>
            
            {/* Confidence level badge */}
            {verified && (
              <div className={cn(
                "rounded-full px-1.5 text-[10px] font-medium",
                isHighConfidence ? "bg-green-500/70" :
                isMediumConfidence ? "bg-yellow-500/70" : 
                "bg-gray-500/70"
              )}>
                {isHighConfidence ? "Alta" : isMediumConfidence ? "Média" : "Baixa"}
              </div>
            )}
            
            {/* Consensus badge */}
            {majorityDirection && verified && (
              <div className="bg-blue-500/70 rounded-full px-1.5 text-[10px] font-medium flex items-center gap-0.5">
                <CheckCheck className="h-2.5 w-2.5" />
                <span>Consenso</span>
              </div>
            )}
            
            {/* Manipulation warning */}
            {!majorityDirection && verified && direction !== "neutral" && (
              <div className="bg-yellow-500/70 rounded-full px-1.5 text-[10px] font-medium flex items-center gap-0.5">
                <AlertTriangle className="h-2.5 w-2.5" />
                <span>Cuidado</span>
              </div>
            )}
          </div>
          
          {verified && confidence > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-full bg-gray-200/30 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full",
                    direction === "buy" ? 
                      isHighConfidence ? "bg-green-300" : "bg-white" : 
                    direction === "sell" ? 
                      isHighConfidence ? "bg-red-300" : "bg-white" : 
                    "bg-gray-400"
                  )}
                  style={{ width: `${Math.min(100, confidence)}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-mono">{Math.round(confidence)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIConfirmationBadge;
