
import React from "react";
import { CircleArrowDown, CircleArrowUp, AlertTriangle, Shield, TrendingDown, TrendingUp } from "lucide-react";
import { MarketType } from "@/context/AnalyzerContext";

interface MarketTypeIndicatorProps {
  marketType: MarketType;
}

const MarketTypeIndicator: React.FC<MarketTypeIndicatorProps> = ({ marketType }) => {
  return (
    <div className="absolute top-2 left-2 z-30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center shadow-lg border border-purple-500/50 gap-2"
         style={{
           background: marketType === "otc" 
             ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.85), rgba(138, 45, 217, 0.9))' 
             : 'linear-gradient(135deg, rgba(124, 58, 237, 0.85), rgba(94, 28, 207, 0.9))'
         }}>
      {marketType === "otc" ? (
        <>
          <div className="flex flex-col items-center justify-center bg-purple-900/60 p-1 rounded-full">
            <CircleArrowDown className="h-4 w-4 text-purple-300" />
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-300 -mt-1" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs">OTC</span>
              <TrendingDown className="h-3 w-3 text-red-300" />
            </div>
            <span className="text-[9px] leading-tight text-yellow-200 font-medium">Alto risco / Manipulável</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center bg-indigo-900/60 p-1 rounded-full">
            <CircleArrowUp className="h-4 w-4 text-indigo-300" />
            <Shield className="h-3.5 w-3.5 text-blue-300 -mt-1" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs">Regular</span>
              <TrendingUp className="h-3 w-3 text-green-300" />
            </div>
            <span className="text-[9px] leading-tight text-blue-100 font-medium">Padrões confiáveis</span>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketTypeIndicator;
