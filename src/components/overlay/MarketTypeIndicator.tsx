
import React from "react";
import { CircleArrowDown, CircleArrowUp, AlertTriangle, Shield, TrendingDown, TrendingUp, LineChart, BarChart } from "lucide-react";
import { MarketType } from "@/context/AnalyzerContext";
import { cn } from "@/lib/utils";

interface MarketTypeIndicatorProps {
  marketType: MarketType;
}

const MarketTypeIndicator: React.FC<MarketTypeIndicatorProps> = ({ marketType }) => {
  return (
    <div className={cn(
      "absolute top-2 left-2 z-30 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center shadow-lg border gap-2.5 transition-all duration-300",
      marketType === "otc" 
        ? "border-red-400/50" 
        : "border-blue-400/50"
    )}
      style={{
        background: marketType === "otc" 
          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.85), rgba(138, 45, 217, 0.9))' 
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.85), rgba(37, 99, 235, 0.9))'
      }}>
      {marketType === "otc" ? (
        <>
          <div className="flex flex-col items-center justify-center bg-purple-900/60 p-1.5 rounded-full">
            <CircleArrowDown className="h-4 w-4 text-purple-300" />
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-300 -mt-1" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm">OTC Market</span>
              <TrendingDown className="h-3.5 w-3.5 text-red-300" />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] leading-tight text-yellow-200 font-medium">
                Alto risco / Manipulável / Menor precisão
              </span>
              <BarChart className="h-3 w-3 text-yellow-200" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center bg-blue-900/60 p-1.5 rounded-full">
            <CircleArrowUp className="h-4 w-4 text-blue-300" />
            <Shield className="h-3.5 w-3.5 text-green-300 -mt-1" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm">Regular Market</span>
              <TrendingUp className="h-3.5 w-3.5 text-green-300" />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] leading-tight text-blue-100 font-medium">
                Padrões confiáveis / Maior precisão
              </span>
              <LineChart className="h-3 w-3 text-blue-100" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketTypeIndicator;
