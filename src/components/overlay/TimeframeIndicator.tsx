
import React from "react";
import { Clock } from "lucide-react";
import { TimeframeType, MarketType } from "@/context/AnalyzerContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimeframeIndicatorProps {
  selectedTimeframe: TimeframeType;
  marketType: MarketType;
}

const TimeframeIndicator: React.FC<TimeframeIndicatorProps> = ({ 
  selectedTimeframe,
  marketType
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`absolute top-2 right-2 z-30 bg-blue-600/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center shadow-lg`}>
      <Clock className="h-4 w-4 mr-2" />
      <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
        {selectedTimeframe === "30s" ? 
          `${marketType === "otc" ? "OTC: " : ""}Ciclos de 30s` : 
          `${marketType === "otc" ? "OTC: " : ""}M1 com ciclos de 30s`}
      </span>
    </div>
  );
};

export default TimeframeIndicator;
