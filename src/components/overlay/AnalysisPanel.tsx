
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
  
  // Count significant patterns to determine if we need to show anything
  const significantPatterns = Object.values(detailedResults).filter(
    r => r.found && (r.buyScore && r.buyScore > 0.5 || r.sellScore && r.sellScore > 0.5)
  ).length;
  
  // Count significant fast analyses
  const significantFastAnalyses = fastAnalysisResults.filter(
    r => r.found && r.strength > 65
  ).length;
  
  // If there's not much to show, display minimal UI
  if (significantPatterns === 0 && significantFastAnalyses <= 1) {
    return null;
  }
  
  return (
    <div className={`absolute ${isMobile ? "bottom-2 left-2 right-2" : "bottom-4 left-2 max-w-[90%] w-auto"} pointer-events-auto z-20`}>
      <div className={`
        ${marketType === "otc" ? "bg-black/50 border-purple-700/30" : "bg-black/40 border-blue-700/30"}
        backdrop-blur-md border rounded-lg shadow-lg transition-all duration-300 p-1.5
      `}>
        <AnalysisLabels 
          results={detailedResults} 
          compact={true} // Always use compact mode for cleaner UI
          specificTimeframe={selectedTimeframe}
          m1Analyses={fastAnalysisResults.slice(0, 2)} // Limit to top 2 analyses for cleaner UI
          minimalMode={true} // New prop to enable minimal UI
        />
      </div>
    </div>
  );
};

export default AnalysisPanel;
