
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import AnalysisLabels from "../AnalysisLabels";
import { FastAnalysisResult } from "./FastAnalysisIndicators";
import { PatternResult } from "@/utils/patternDetection";
import { TimeframeType, MarketType } from "@/context/AnalyzerContext";

interface AnalysisPanelProps {
  detailedResults: Record<string, PatternResult>;
  compactMode: boolean;
  selectedTimeframe: TimeframeType;
  fastAnalysisResults: FastAnalysisResult[];
  marketType?: MarketType;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  detailedResults,
  compactMode,
  selectedTimeframe,
  fastAnalysisResults,
  marketType = "regular"
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className={`absolute ${isMobile ? "bottom-2 left-2 right-2" : "bottom-4 left-2 max-w-[90%] w-auto"} pointer-events-auto z-20`}>
      <div className={`
        ${marketType === "otc" ? "bg-black/70 border-purple-700/50" : "bg-black/60 border-blue-700/50"}
        backdrop-blur-md border p-2 rounded-lg shadow-lg transition-all duration-300
      `}>
        <AnalysisLabels 
          results={detailedResults} 
          compact={compactMode}
          specificTimeframe={selectedTimeframe}
          m1Analyses={fastAnalysisResults}
        />
      </div>
    </div>
  );
};

export default AnalysisPanel;
