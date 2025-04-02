import React, { useEffect, useState, useRef } from "react";
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
    compactMode,
    chartRegion
  } = useAnalyzer();
  
  const [detailedResults, setDetailedResults] = useState<Record<string, PatternResult>>({});
  const [processingStage, setProcessingStage] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const analysisImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      if (isAnalyzing && imageData) {
        try {
          console.log("Starting analysis with chart region:", chartRegion);
          
          // Create a new image to extract the chart region if needed
          const extractRegionFromImage = async (): Promise<string> => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                try {
                  // If no region is specified, use the full image
                  if (!chartRegion) {
                    console.log("No chart region specified, using full image");
                    resolve(imageData);
                    return;
                  }
                  
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  
                  if (!ctx) {
                    console.error("Could not get canvas context");
                    resolve(imageData); // Fallback to full image
                    return;
                  }
                  
                  // Set canvas size to match the region
                  canvas.width = chartRegion.width;
                  canvas.height = chartRegion.height;
                  
                  // Draw only the selected region
                  ctx.drawImage(
                    img, 
                    chartRegion.x, chartRegion.y, chartRegion.width, chartRegion.height,
                    0, 0, canvas.width, canvas.height
                  );
                  
                  // Store for debugging
                  const regionImage = canvas.toDataURL('image/png');
                  console.log("Extracted region for analysis");
                  
                  // Keep a reference to verify the region
                  const debugImg = new Image();
                  debugImg.src = regionImage;
                  analysisImageRef.current = debugImg;
                  
                  resolve(regionImage);
                } catch (error) {
                  console.error("Error extracting region:", error);
                  resolve(imageData); // Fallback to full image on error
                }
              };
              
              img.onerror = () => {
                console.error("Failed to load image for region extraction");
                reject(new Error("Image loading failed"));
              };
              
              img.src = imageData;
            });
          };
          
          // Configure advanced processing options based on precision level
          const processOptions = {
            // Core options
            enhanceContrast: true,
            removeNoise: precision !== "baixa",
            sharpness: precision === "alta" ? 2.2 : precision === "normal" ? 1.5 : 1.0,
            iterations: precision === "alta" ? 3 : precision === "normal" ? 2 : 1,
            
            // Advanced vision options
            adaptiveThreshold: precision !== "baixa",
            perspectiveCorrection: true, // Always apply perspective correction
            chartRegionDetection: !chartRegion, // Only if user hasn't selected a region
            
            // Pattern recognition enhancements
            edgeEnhancement: precision !== "baixa",
            patternRecognition: true,
            
            // Advanced computer vision
            contourDetection: precision !== "baixa",
            featureExtraction: precision === "alta",
            histogramEqualization: precision !== "baixa",
            
            // Human-like analysis properties
            sensitivity: precision === "alta" ? 0.85 : precision === "normal" ? 0.7 : 0.5,
            contextAwareness: precision !== "baixa", // Consider surrounding elements
            patternConfidence: precision === "alta" ? 0.75 : precision === "normal" ? 0.6 : 0.45,
            
            // User-defined chart region
            chartRegion: chartRegion || undefined,
          };
          
          console.log(`Iniciando análise técnica avançada com precisão ${precision}`, processOptions);
          
          // Stage 1: Extract the chart region if specified
          setProcessingStage(chartRegion ? "Processando região selecionada" : "Detectando região do gráfico");
          const regionImage = await extractRegionFromImage();
          
          // Stage 2: Preprocess the image for analysis
          setProcessingStage("Preparando imagem para análise");
          const processedImage = await prepareForAnalysis(regionImage, processOptions, 
            (stage) => setProcessingStage(stage));
          
          // Stage 3: Detect patterns with enhanced algorithms
          setProcessingStage("Analisando padrões técnicos");
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
          if (results.all?.found) {
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
          setProcessingStage("");
          setIsAnalyzing(false);
        }
      }
    };

    runAnalysis();
  }, [imageData, isAnalyzing, activeAnalysis, setAnalysisResult, setIsAnalyzing, precision, chartRegion]);

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
      
      {/* Processing stage indicator */}
      {processingStage && (
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm">
            {processingStage}
          </div>
        </div>
      )}
      
      {/* Debug view of the selected region (hidden) */}
      {process.env.NODE_ENV === 'development' && analysisImageRef.current && (
        <div className="fixed bottom-0 right-0 w-32 h-32 opacity-50 pointer-events-none">
          <img 
            src={analysisImageRef.current.src} 
            alt="Region debug" 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
    </div>
  );
};

export default ResultsOverlay;
