
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Timer } from "lucide-react";
import { EntryType, TimeframeType } from "@/context/AnalyzerContext";

interface PredictionDisplayProps {
  entryPoint: EntryType;
  confidence: number;
  expirationTime: string;
  timeframe: TimeframeType;
  marketType: string;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  entryPoint,
  confidence,
  expirationTime,
  timeframe,
  marketType
}) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <Timer className="h-4 w-4 text-white" />
        <span className="text-sm font-bold text-white uppercase">
          Sinal {timeframe} {marketType === "otc" && "(OTC)"}
        </span>
      </div>
      
      {entryPoint === "wait" ? (
        <div className="flex items-center justify-center p-2 bg-gray-800/70 rounded-md w-full">
          <span className="text-white font-bold">AGUARDAR</span>
        </div>
      ) : (
        <div className={cn(
          "flex items-center justify-center gap-2 p-2 rounded-md w-full",
          entryPoint === "buy" ? "bg-green-700/80" : "bg-red-700/80"
        )}>
          {entryPoint === "buy" ? (
            <ArrowUp className="h-5 w-5 text-white" />
          ) : (
            <ArrowDown className="h-5 w-5 text-white" />
          )}
          <span className="text-white font-bold text-lg">
            {entryPoint === "buy" ? "COMPRA" : "VENDA"}
          </span>
          <span className="text-white text-xs font-medium ml-1">
            ({Math.round(confidence)}%)
          </span>
        </div>
      )}
      
      <div className="mt-2 text-xs text-white">
        <span className="font-medium">Expira:</span> {expirationTime}
      </div>
    </>
  );
};

export default PredictionDisplay;
