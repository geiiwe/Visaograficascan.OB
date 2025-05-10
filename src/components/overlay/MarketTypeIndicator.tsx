
import React from "react";
import { CircleArrowDown, CircleArrowUp, AlertTriangle, Shield } from "lucide-react";
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
            <span className="font-medium text-xs">OTC</span>
            <span className="text-[9px] leading-tight text-yellow-200">Alto risco</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-0.5">
            <CircleArrowUp className="h-3.5 w-3.5" />
            <Shield className="h-3 w-3 text-blue-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-xs">Regular</span>
            <span className="text-[9px] leading-tight text-blue-100">Padrões confiáveis</span>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketTypeIndicator;
