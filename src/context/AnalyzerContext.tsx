
import React, { createContext, useContext, useState, ReactNode } from "react";

export type AnalysisType = "trendlines" | "movingAverages" | "rsi" | "macd" | "fibonacci" | "candlePatterns" | "elliottWaves" | "dowTheory" | "all";
export type PrecisionLevel = "baixa" | "normal" | "alta";

interface AnalyzerContextType {
  imageData: string | null;
  setImageData: (data: string | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  activeAnalysis: AnalysisType[];
  toggleAnalysis: (type: AnalysisType) => void;
  analysisResults: Record<AnalysisType, boolean>;
  setAnalysisResult: (type: AnalysisType, found: boolean) => void;
  captureMode: boolean;
  setCaptureMode: (mode: boolean) => void;
  resetAnalysis: () => void;
  showVisualMarkers: boolean;
  toggleVisualMarkers: () => void;
  precision: PrecisionLevel;
  setPrecision: (level: PrecisionLevel) => void;
  compactMode: boolean;
  toggleCompactMode: () => void;
}

const AnalyzerContext = createContext<AnalyzerContextType | undefined>(undefined);

export const AnalyzerProvider = ({ children }: { children: ReactNode }) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType[]>(["trendlines"]);
  const [analysisResults, setAnalysisResults] = useState<Record<AnalysisType, boolean>>({
    trendlines: false,
    movingAverages: false,
    rsi: false,
    macd: false,
    fibonacci: false,
    candlePatterns: false,
    elliottWaves: false,
    dowTheory: false,
    all: false,
  });
  const [captureMode, setCaptureMode] = useState(true);
  const [showVisualMarkers, setShowVisualMarkers] = useState(true);
  const [precision, setPrecision] = useState<PrecisionLevel>("normal");
  const [compactMode, setCompactMode] = useState(true);

  const toggleAnalysis = (type: AnalysisType) => {
    if (type === "all") {
      if (activeAnalysis.includes("all")) {
        setActiveAnalysis([]);
      } else {
        setActiveAnalysis(["trendlines", "movingAverages", "rsi", "macd", "fibonacci", "candlePatterns", "elliottWaves", "dowTheory", "all"]);
      }
      return;
    }

    setActiveAnalysis((prev) => {
      if (prev.includes(type)) {
        const filtered = prev.filter((t) => t !== type);
        
        // Check if we need to remove 'all' as well
        if (prev.includes("all")) {
          return filtered.filter((t) => t !== "all");
        }
        
        return filtered;
      } else {
        const newAnalysis = [...prev, type];
        
        // Check if we need to add 'all'
        const hasAllTypes = ["trendlines", "movingAverages", "rsi", "macd", "fibonacci", "candlePatterns", "elliottWaves", "dowTheory"].every(
          (t) => newAnalysis.includes(t as AnalysisType) || t === type
        );
        
        if (hasAllTypes && !newAnalysis.includes("all")) {
          return [...newAnalysis, "all"];
        }
        
        return newAnalysis;
      }
    });
  };

  const setAnalysisResult = (type: AnalysisType, found: boolean) => {
    setAnalysisResults(prev => ({
      ...prev,
      [type]: found
    }));
  };

  const resetAnalysis = () => {
    setIsAnalyzing(false);
    setAnalysisResults({
      trendlines: false,
      movingAverages: false,
      rsi: false,
      macd: false,
      fibonacci: false,
      candlePatterns: false,
      elliottWaves: false,
      dowTheory: false,
      all: false,
    });
  };

  const toggleVisualMarkers = () => {
    setShowVisualMarkers(prev => !prev);
  };

  const toggleCompactMode = () => {
    setCompactMode(prev => !prev);
  };

  return (
    <AnalyzerContext.Provider
      value={{
        imageData,
        setImageData,
        isAnalyzing,
        setIsAnalyzing,
        activeAnalysis,
        toggleAnalysis,
        analysisResults,
        setAnalysisResult,
        captureMode,
        setCaptureMode,
        resetAnalysis,
        showVisualMarkers,
        toggleVisualMarkers,
        precision,
        setPrecision,
        compactMode,
        toggleCompactMode,
      }}
    >
      {children}
    </AnalyzerContext.Provider>
  );
};

export const useAnalyzer = (): AnalyzerContextType => {
  const context = useContext(AnalyzerContext);
  if (context === undefined) {
    throw new Error("useAnalyzer must be used within an AnalyzerProvider");
  }
  return context;
};
