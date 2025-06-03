
import React from "react";
import { ExtendedPatternResult } from "@/utils/predictionUtils";
import { TimeframeType, MarketType } from "@/context/AnalyzerContext";
import { FastAnalysisResult } from "../overlay/FastAnalysisIndicators";
import AnalysisResultsPanel from "./AnalysisResultsPanel";
import FastAnalysisDisplay from "./FastAnalysisDisplay";

interface AnalysisContainerProps {
  detailedResults: Record<string, ExtendedPatternResult>;
  fastAnalysisResults: FastAnalysisResult[];
  timeframe: TimeframeType;
  marketType: MarketType;
  visualAnalysis?: any;
  position?: "right" | "left";
}

const AnalysisContainer: React.FC<AnalysisContainerProps> = ({
  detailedResults,
  fastAnalysisResults,
  timeframe,
  marketType,
  visualAnalysis,
  position = "right"
}) => {
  const hasDetailedResults = Object.keys(detailedResults).length > 0;
  const hasSignificantFast = fastAnalysisResults.filter(r => r.found && r.strength > 60).length > 0;

  if (!hasDetailedResults && !hasSignificantFast) return null;

  return (
    <div className={`
      absolute top-4 ${position === "right" ? "right-4" : "left-4"} 
      z-30 pointer-events-auto flex flex-col gap-3 max-h-[calc(100vh-8rem)] overflow-y-auto
    `}>
      {/* Main Analysis Results */}
      {hasDetailedResults && (
        <AnalysisResultsPanel
          results={detailedResults}
          timeframe={timeframe}
          marketType={marketType}
          visualAnalysis={visualAnalysis}
        />
      )}

      {/* Fast Analysis Results */}
      {hasSignificantFast && (
        <FastAnalysisDisplay
          results={fastAnalysisResults}
          timeframe={timeframe}
        />
      )}
    </div>
  );
};

export default AnalysisContainer;
