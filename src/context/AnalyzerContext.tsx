
import React, { createContext, useContext, useState, ReactNode } from "react";

export type AnalysisType = "trendlines" | "movingAverages" | "rsi" | "macd" | "all";

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
    all: false,
  });
  const [captureMode, setCaptureMode] = useState(true);

  const toggleAnalysis = (type: AnalysisType) => {
    if (type === "all") {
      if (activeAnalysis.includes("all")) {
        setActiveAnalysis([]);
      } else {
        setActiveAnalysis(["trendlines", "movingAverages", "rsi", "macd", "all"]);
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
        const hasAllTypes = ["trendlines", "movingAverages", "rsi", "macd"].every(
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
      all: false,
    });
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
