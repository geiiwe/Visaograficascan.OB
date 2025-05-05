
import React from "react";
import { BarChart2, Activity, LineChart } from "lucide-react";

export interface FastAnalysisResult {
  type: string;
  found: boolean;
  direction: "up" | "down" | "neutral";
  strength: number;
  name: string;
  description: string;
}

interface FastAnalysisIndicatorsProps {
  results: FastAnalysisResult[];
}

const FastAnalysisIndicators: React.FC<FastAnalysisIndicatorsProps> = ({ results }) => {
  if (results.length === 0) return null;
  
  // Organize indicators by direction
  const upwardIndicators = results.filter(result => result.direction === "up");
  const downwardIndicators = results.filter(result => result.direction === "down");
  const neutralIndicators = results.filter(result => result.direction === "neutral");
  
  // Calculate direction summary
  const directionSummary = 
    upwardIndicators.length > downwardIndicators.length ? "up" :
    downwardIndicators.length > upwardIndicators.length ? "down" : "neutral";
  
  return (
    <div className="absolute top-26 right-2 z-30">
      {/* Direction Summary Indicator */}
      {results.length > 1 && (
        <div className={`flex items-center rounded-full px-3 py-1.5 text-xs text-white font-medium shadow-lg backdrop-blur-sm mb-2
          ${directionSummary === "up" ? "bg-trader-green/80 border border-trader-green/50" : 
            directionSummary === "down" ? "bg-trader-red/80 border border-trader-red/50" : 
            "bg-gray-600/80 border border-gray-500/50"}`}
        >
          <span>
            {directionSummary === "up" ? "Tendência Compradora" : 
             directionSummary === "down" ? "Tendência Vendedora" : 
             "Mercado Neutro"}
          </span>
          <span className="ml-1 opacity-80">
            ({upwardIndicators.length}/{results.length})
          </span>
        </div>
      )}
      
      {/* Individual Indicators */}
      <div className="flex flex-col gap-2 mt-2">
        {results.map((result, index) => (
          <div 
            key={result.type}
            className={`flex items-center rounded-full px-3 py-1 text-xs text-white shadow-lg backdrop-blur-sm ${
              result.direction === "up" ? "bg-trader-green/70" : 
              result.direction === "down" ? "bg-trader-red/70" : 
              "bg-gray-500/70"
            }`}
            style={{ marginTop: index > 0 ? '0.5rem' : '0' }}
          >
            {result.type === "priceAction" ? <BarChart2 className="h-3.5 w-3.5 mr-1.5" /> :
             result.type === "momentum" ? <Activity className="h-3.5 w-3.5 mr-1.5" /> :
             <LineChart className="h-3.5 w-3.5 mr-1.5" />}
            <span>{result.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FastAnalysisIndicators;
