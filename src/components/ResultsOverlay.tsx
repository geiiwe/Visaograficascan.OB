
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
          // Configure processing options based on precision level
          const processOptions = {
            // Basic options
            enhanceContrast: true,
            removeNoise: true,
            sharpness: precision === "alta" ? 1.8 : precision === "normal" ? 1.2 : 0.8,
            iterations: precision === "alta" ? 3 : precision === "normal" ? 2 : 1,
            
            // Advanced options
            adaptiveThreshold: precision !== "baixa",
            edgeEnhancement: true,
            patternRecognition: true,
            
            // Computer vision enhancements
            contourDetection: precision !== "baixa",
            featureExtraction: precision === "alta",
            histogramEqualization: precision !== "baixa"
          };
          
          console.log(`Iniciando análise técnica com precisão ${precision}`, processOptions);
          
          // Process the image with enhanced computer vision
          const processedImage = await prepareForAnalysis(imageData, processOptions);
          
          // Run pattern detection with the precision level
          const results = await detectPatterns(processedImage, activeAnalysis, precision);
          
          // Save detailed results
          setDetailedResults(results);
          
          // Update analysis results in context
          Object.entries(results).forEach(([type, result]) => {
            setAnalysisResult(type as any, result.found);
          });
          
          // Count patterns found
          const foundCount = Object.values(results)
            .filter(r => r.found && r.type !== "all")
            .length;
          
          // Notify user about results
          if (results.all.found) {
            toast.success(`Análise concluída! ${foundCount} padrões detectados.`);
          } else if (foundCount > 0) {
            toast.success(`Análise concluída! ${foundCount} padrões foram detectados.`);
          } else {
            toast.info("Análise concluída. Nenhum padrão técnico detectado.");
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
      {/* Chart overlay with visual markers */}
      <ChartOverlay 
        results={detailedResults} 
        showMarkers={showVisualMarkers}
      />
      
      {/* Analysis labels at the bottom */}
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
