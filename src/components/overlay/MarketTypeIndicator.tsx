
import React from "react";
import { CircleArrowDown, CircleArrowUp, AlertTriangle, CircleCheck } from "lucide-react";
import { MarketType } from "@/context/AnalyzerContext";

interface MarketTypeIndicatorProps {
  marketType: MarketType;
}

const MarketTypeIndicator: React.FC<MarketTypeIndicatorProps> = ({ marketType }) => {
  return (
    <div className="absolute top-2 left-2 z-30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center shadow-lg border border-purple-500/50 gap-1.5"
         style={{
           background: marketType === "otc" ? 'rgba(168, 85, 247, 0.85)' : 'rgba(124, 58, 237, 0.85)'
         }}>
      {marketType === "otc" ? (
        <>
          <div className="flex items-center gap-0.5">
            <CircleArrowDown className="h-3.5 w-3.5" />
            <AlertTriangle className="h-3 w-3 text-yellow-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-medium text-xs">OTC</span>
              <CircleCheck className="h-2.5 w-2.5 text-yellow-200" />
            </div>
            <span className="text-[9px] leading-tight text-yellow-200">Análise automática para OTC</span>
          </div>
        </>
      ) : (
        <>
          <CircleArrowUp className="h-3.5 w-3.5" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-medium text-xs">Regular</span>
              <CircleCheck className="h-2.5 w-2.5 text-blue-200" />
            </div>
            <span className="text-[9px] leading-tight text-blue-100">Análise automática padrão</span>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketTypeIndicator;
