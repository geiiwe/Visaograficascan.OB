
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import AnalysisLabels from "../AnalysisLabels";
import { FastAnalysisResult } from "./FastAnalysisIndicators";
import { PatternResult } from "@/utils/patternDetection";
import { TimeframeType } from "@/context/AnalyzerContext";

interface AnalysisPanelProps {
  detailedResults: Record<string, PatternResult>;
  compactMode: boolean;
  selectedTimeframe: TimeframeType;
  fastAnalysisResults: FastAnalysisResult[];
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  detailedResults,
  compactMode,
  selectedTimeframe,
  fastAnalysisResults
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className={`absolute ${isMobile ? "bottom-2 left-2 right-2" : "bottom-4 left-2 max-w-[90%] w-auto"} pointer-events-auto`}>
      <div className="bg-black/60 backdrop-blur-md border border-gray-700/50 p-2 rounded-lg shadow-lg">
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
