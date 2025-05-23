import React, { createContext, useContext, useState, ReactNode } from "react";

export type AnalysisType = "trendlines" | "fibonacci" | "candlePatterns" | "elliottWaves" | "dowTheory" | "all";
export type PrecisionLevel = "baixa" | "normal" | "alta";
export type EntryType = "buy" | "sell" | "wait";
export type TimeframeType = "30s" | "1m";
export type MarketType = "regular" | "otc"; // Adicionado tipo de mercado
export type CandleFormationType = "doji" | "hammer" | "engulfing" | "harami" | "piercing" | "darkCloud" | "morningstar" | "eveningstar";
export type CircularPatternType = "cycle" | "wave" | "rotation" | "divergence" | "convergence";

interface PredictionData {
  entryPoint: EntryType;
  confidence: number;
  timeframe: TimeframeType;
  expirationTime: string;
  indicators: {
    name: string;
    signal: "buy" | "sell" | "neutral";
    strength: number;
  }[];
  analysisNarrative?: string; // Added missing property for narrative explanation
  candleFormations?: CandleFormationType[];
  circularPatterns?: CircularPatternType[];
  keyLevels?: {
    price: number;
    type: "support" | "resistance" | "pivot";
    strength: number;
  }[];
}

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
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  chartRegion: { x: number; y: number; width: number; height: number } | null;
  setChartRegion: (region: { x: number; y: number; width: number; height: number } | null) => void;
  hasCustomRegion: boolean;
  indicatorPosition: { x: number; y: number; };
  setIndicatorPosition: (position: { x: number; y: number }) => void;
  prediction: PredictionData | null;
  setPrediction: (data: PredictionData | null) => void;
  selectedTimeframe: TimeframeType;
  setSelectedTimeframe: (timeframe: TimeframeType) => void;
  marketType: MarketType; // Novo estado para tipo de mercado
  setMarketType: (type: MarketType) => void; // Setter para tipo de mercado
  lastUpdated: Date | null;
  setLastUpdated: (date: Date | null) => void;
  enableCircularAnalysis: boolean;
  toggleCircularAnalysis: () => void;
  candelPatternSensitivity: number;
  setCandelPatternSensitivity: (sensitivity: number) => void;
}

const AnalyzerContext = createContext<AnalyzerContextType | undefined>(undefined);

export const AnalyzerProvider = ({ children }: { children: ReactNode }) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType[]>(["trendlines"]);
  const [analysisResults, setAnalysisResults] = useState<Record<AnalysisType, boolean>>({
    trendlines: false,
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [chartRegion, setChartRegion] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [indicatorPosition, setIndicatorPosition] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>("30s");
  const [marketType, setMarketType] = useState<MarketType>("regular"); // Estado inicial como mercado regular
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [enableCircularAnalysis, setEnableCircularAnalysis] = useState(true);
  const [candelPatternSensitivity, setCandelPatternSensitivity] = useState(75); // 0-100, where higher means more sensitive

  // Computed property to check if a custom region is set
  const hasCustomRegion = chartRegion !== null;

  const toggleAnalysis = (type: AnalysisType) => {
    if (type === "all") {
      if (activeAnalysis.includes("all")) {
        setActiveAnalysis([]);
      } else {
        setActiveAnalysis(["trendlines", "fibonacci", "candlePatterns", "elliottWaves", "dowTheory", "all"]);
      }
      return;
    }

    setActiveAnalysis((prev) => {
      if (prev.includes(type)) {
        const filtered = prev.filter((t) => t !== type);
        
        if (prev.includes("all")) {
          return filtered.filter((t) => t !== "all");
        }
        
        return filtered;
      } else {
        const newAnalysis = [...prev, type];
        
        const hasAllTypes = ["trendlines", "fibonacci", "candlePatterns", "elliottWaves", "dowTheory"].every(
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
      fibonacci: false,
      candlePatterns: false,
      elliottWaves: false,
      dowTheory: false,
      all: false,
    });
    // Don't reset chartRegion here anymore - keep the user's selection
  };

  const toggleVisualMarkers = () => {
    setShowVisualMarkers(prev => !prev);
  };

  const toggleCompactMode = () => {
    setCompactMode(prev => !prev);
  };

  const toggleCircularAnalysis = () => {
    setEnableCircularAnalysis(prev => !prev);
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
        selectionMode,
        setSelectionMode,
        chartRegion,
        setChartRegion,
        hasCustomRegion,
        indicatorPosition,
        setIndicatorPosition,
        prediction,
        setPrediction,
        selectedTimeframe,
        setSelectedTimeframe,
        marketType, // Novo valor no contexto
        setMarketType, // Novo setter no contexto
        lastUpdated,
        setLastUpdated,
        enableCircularAnalysis,
        toggleCircularAnalysis,
        candelPatternSensitivity,
        setCandelPatternSensitivity
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
