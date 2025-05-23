
import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Fingerprint, LineChart, AlertTriangle, Activity, BarChart, Circle } from "lucide-react";
import { PredictionIndicator } from "@/utils/predictionUtils";

interface IndicatorListProps {
  indicators: PredictionIndicator[];
  maxItems?: number;
  compact?: boolean;
  highlightCircular?: boolean;
}

const IndicatorList: React.FC<IndicatorListProps> = ({ 
  indicators, 
  maxItems = 8,
  compact = false,
  highlightCircular = false
}) => {
  // Sort indicators by strength to show strongest ones first
  const sortedIndicators = [...indicators].sort((a, b) => b.strength - a.strength);
  const visibleIndicators = sortedIndicators.filter((_, idx) => idx < maxItems);
  
  // Group indicators by category for better organization and logical flow
  const chartIndicators = visibleIndicators.filter(i => 
    !i.name.includes("Fibonacci") && 
    !i.name.includes("Candle") && 
    !i.name.includes("Volatilidade") &&
    !i.name.includes("Ciclo") &&
    !i.name.includes("Circular"));
    
  const fibonacciIndicators = visibleIndicators.filter(i => 
    i.name.includes("Fibonacci") && 
    !i.name.includes("Candle"));
    
  const candleFibIndicators = visibleIndicators.filter(i => 
    i.name.includes("Candle") && 
    i.name.includes("Fibonacci"));
    
  const candleIndicators = visibleIndicators.filter(i => 
    i.name.includes("Candle") && 
    !i.name.includes("Fibonacci"));
    
  const circularIndicators = visibleIndicators.filter(i => 
    i.name.includes("Ciclo") || 
    i.name.includes("Circular") ||
    i.name.includes("Onda"));
    
  const volatilityIndicators = visibleIndicators.filter(i => 
    i.name.includes("Volatilidade"));
  
  // Get icon for indicator based on type
  const getIndicatorIcon = (indicator: PredictionIndicator) => {
    if (indicator.name.includes("Volatilidade")) {
      return indicator.strength > 70 ? 
        <AlertTriangle className="h-3 w-3" /> : 
        <Activity className="h-3 w-3" />;
    }
    
    if (indicator.name.includes("Fibonacci")) {
      return <Fingerprint className="h-3 w-3" />;
    }
    
    if (indicator.name.includes("Ciclo") || 
        indicator.name.includes("Circular") ||
        indicator.name.includes("Onda")) {
      return <Circle className="h-3 w-3" />;
    }
    
    if (indicator.name.includes("Candle")) {
      return <LineChart className="h-3 w-3" />;
    }
    
    if (indicator.signal === "buy") {
      return <TrendingUp className="h-3 w-3" />;
    }
    
    if (indicator.signal === "sell") {
      return <TrendingDown className="h-3 w-3" />;
    }
    
    return <BarChart className="h-3 w-3" />;
  };
  
  // Render an indicator group
  const renderIndicatorGroup = (group: PredictionIndicator[], title: string, colorClass: string, columns: number = 2) => {
    if (group.length === 0) return null;
    
    return (
      <div className="w-full">
        {title && (
          <div className="text-xs text-gray-400 mb-0.5 px-1">{title}</div>
        )}
        <div className={`grid grid-cols-${columns} gap-1 w-full`}>
          {group.map((indicator, idx) => (
            <div 
              key={`${title}-${idx}`} 
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-sm text-xs",
                colorClass,
                indicator.strength > 80 && "border-l-2 border-white/50"
              )}
            >
              {getIndicatorIcon(indicator)}
              <span className="truncate font-medium">{compact ? indicator.name.split(' ')[0] : indicator.name}</span>
              <span className="ml-auto text-xs opacity-80">{Math.round(indicator.strength)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-black/80 backdrop-blur-md p-3 rounded-lg border border-gray-700/50 shadow-xl w-full max-w-[320px] space-y-2">
      {/* Volatility Indicators (High Priority) */}
      {renderIndicatorGroup(
        volatilityIndicators, 
        volatilityIndicators.length > 0 ? "Volatilidade" : "", 
        "bg-red-800/60 text-white", 
        1
      )}

      {/* Fibonacci-Candle Relation Indicators */}
      {renderIndicatorGroup(
        candleFibIndicators, 
        candleFibIndicators.length > 0 ? "Fibonacci + Candles" : "", 
        "bg-[#f97316]/60 text-white", 
        1
      )}
      
      {/* Circular Pattern Indicators */}
      {renderIndicatorGroup(
        circularIndicators, 
        circularIndicators.length > 0 ? "Padrões Circulares" : "", 
        highlightCircular ? "bg-purple-700/60 text-white" : "bg-purple-700/40 text-white",
        circularIndicators.length > 2 ? 2 : 1
      )}
      
      {/* Candle Pattern Indicators */}
      {renderIndicatorGroup(
        candleIndicators, 
        candleIndicators.length > 0 ? "Padrões de Candles" : "", 
        "bg-blue-700/50 text-white",
        candleIndicators.length > 2 ? 2 : 1
      )}
      
      {/* Fibonacci Indicators */}
      {renderIndicatorGroup(
        fibonacciIndicators, 
        fibonacciIndicators.length > 0 ? "Níveis de Fibonacci" : "", 
        "bg-[#f97316]/40 text-white"
      )}

      {/* Standard Chart Indicators */}
      {renderIndicatorGroup(
        chartIndicators, 
        chartIndicators.length > 0 ? "Indicadores Técnicos" : "", 
        "bg-gray-800/60 text-gray-100"
      )}
      
      {/* Empty state message */}
      {visibleIndicators.length === 0 && (
        <div className="flex items-center justify-center p-2 bg-gray-800/40 rounded-md">
          <span className="text-xs text-gray-400">Nenhum indicador disponível</span>
        </div>
      )}
    </div>
  );
};

export default IndicatorList;
