
import React, { useEffect, useState } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { detectPatterns, PatternResult } from "@/utils/patternDetection";
import { prepareForAnalysis } from "@/utils/imageProcessing";
import { toast } from "sonner";
import ChartOverlay from "./ChartOverlay";
import AnalysisLabels from "./AnalysisLabels";
import { useMediaQuery } from "@/hooks/use-media-query";

const ResultsOverlay = () => {
  const { 
    imageData, 
    isAnalyzing, 
    setIsAnalyzing, 
    activeAnalysis, 
    analysisResults,
    setAnalysisResult,
    showVisualMarkers,
    precision,
    compactMode
  } = useAnalyzer();
  
  const [detailedResults, setDetailedResults] = useState<Record<string, PatternResult>>({});
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const runAnalysis = async () => {
      if (isAnalyzing && imageData) {
        try {
          // Aplicar nível de precisão na preparação da imagem
          const processOptions = {
            enhanceContrast: precision === "alta",
            removeNoise: precision !== "baixa",
            sharpness: precision === "alta" ? 1.5 : 1.0,
            iterations: precision === "alta" ? 3 : precision === "normal" ? 2 : 1
          };
          
          // Process the image first with enhanced settings
          const processedImage = await prepareForAnalysis(imageData, processOptions);
          
          // Run the pattern detection with the precision level
          const results = await detectPatterns(processedImage, activeAnalysis, precision);
          
          // Save the detailed results
          setDetailedResults(results);
          
          // Update the analysis results in the context
          Object.entries(results).forEach(([type, result]) => {
            setAnalysisResult(type as any, result.found);
          });
          
          // Notify the user about the results
          if (results.all.found) {
            toast.success("Análise concluída! Múltiplos padrões detectados.");
          } else if (Object.values(results).some(r => r.found)) {
            toast.success("Análise concluída! Alguns padrões foram detectados.");
          } else {
            toast.info("Análise concluída. Nenhum padrão claro detectado.");
          }
          
        } catch (error) {
          console.error("Analysis error:", error);
          toast.error("Erro durante a análise. Por favor, tente novamente.");
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    runAnalysis();
  }, [imageData, isAnalyzing, activeAnalysis, setAnalysisResult, setIsAnalyzing, precision]);

  if (!imageData || !activeAnalysis.some(type => analysisResults[type])) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Overlay para as marcações no gráfico */}
      <ChartOverlay 
        results={detailedResults} 
        showMarkers={showVisualMarkers}
      />
      
      {/* Labels das análises na parte inferior */}
      <div className={`absolute ${isMobile ? "bottom-0 left-0 right-0" : "bottom-2 left-2 right-2"}`}>
        <AnalysisLabels 
          results={detailedResults} 
          compact={compactMode}
        />
      </div>
    </div>
  );
};

export default ResultsOverlay;
