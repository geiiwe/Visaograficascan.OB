
import React from "react";
import { Clock } from "lucide-react";
import { TimeframeType } from "@/context/AnalyzerContext";

interface TimeframeIndicatorProps {
  selectedTimeframe: TimeframeType;
}

const TimeframeIndicator: React.FC<TimeframeIndicatorProps> = ({ selectedTimeframe }) => {
  return (
    <div className="absolute top-2 right-2 z-30 bg-blue-600/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center shadow-lg">
      <Clock className="h-4 w-4 mr-2" />
      <span className="font-medium text-sm">
        {selectedTimeframe === "30s" ? "Ciclos de 30 segundos" : "M1 com ciclos de 30s"}
      </span>
    </div>
  );
};

export default TimeframeIndicator;
