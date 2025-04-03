
import React, { useEffect, useState, useRef } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { detectPatterns, PatternResult } from "@/utils/patternDetection";
import { prepareForAnalysis, extractRegionFromImage } from "@/utils/imageProcessing";
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
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const analysisImageRef = useRef<HTMLImageElement | null>(null);
  const processedRegionRef = useRef<string | null>(null);
  const originalImageDimensions = useRef<{width: number, height: number} | null>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      if (isAnalyzing && imageData) {
        try {
          console.log("Starting analysis with chart region:", chartRegion);
          
          // Store original image dimensions for accurate scaling
          const originalImg = new Image();
          originalImg.src = imageData;
          await new Promise(resolve => {
            originalImg.onload = () => {
              originalImageDimensions.current = {
                width: originalImg.naturalWidth,
                height: originalImg.naturalHeight
              };
              resolve(null);
            };
          });
          
          console.log("Original image dimensions:", originalImageDimensions.current);
          
          // Extract the region if specified
          let regionImage = imageData;
          
          if (chartRegion) {
            setProcessingStage("Extraindo região selecionada");
            try {
              regionImage = await extractRegionFromImage(imageData, chartRegion);
              
              // Store for verification
              const debugImg = new Image();
              debugImg.src = regionImage;
              analysisImageRef.current = debugImg;
              processedRegionRef.current = regionImage;
              setAnalysisImage(regionImage);
              
              console.log("Region extracted successfully");
            } catch (error) {
              console.error("Error extracting region:", error);
              toast.error("Erro ao extrair região selecionada");
            }
          } else {
            setProcessingStage("Processando imagem completa");
          }
          
          // Configure advanced processing options based on precision level
          const processOptions = {
            // Core options
            enhanceContrast: true,
            removeNoise: precision !== "baixa",
            sharpness: precision === "alta" ? 2.2 : precision === "normal" ? 1.5 : 1.0,
            iterations: precision === "alta" ? 3 : precision === "normal" ? 2 : 1,
            
            // Advanced vision options
            adaptiveThreshold: precision !== "baixa",
            perspectiveCorrection: true,
            chartRegionDetection: false, // We handle region extraction explicitly
            
            // Pattern recognition enhancements
            edgeEnhancement: precision !== "baixa",
            patternRecognition: true,
            
            // Advanced computer vision
            contourDetection: precision !== "baixa",
            featureExtraction: precision === "alta",
            histogramEqualization: precision !== "baixa",
            
            // Analysis properties
            sensitivity: precision === "alta" ? 1.5 : 
                        precision === "normal" ? 1.0 : 0.7,
            contextAwareness: true,
            patternConfidence: precision === "alta" ? 0.8 : 
                              precision === "normal" ? 0.7 : 0.6,
            
            // Disable simulation
            disableSimulation: true,
          };
          
          console.log(`Iniciando análise técnica com precisão ${precision}`, processOptions);
          
          // Preprocess the image for analysis
          setProcessingStage("Preparando imagem para análise");
          const processedImage = await prepareForAnalysis(regionImage, processOptions, 
            (stage) => setProcessingStage(stage));
          
          // Detect patterns with real algorithms
          setProcessingStage("Analisando padrões técnicos");
          
          // Pass original dimensions to ensure correct marker scaling
          const analysisOptions = {
            originalImageDimensions: originalImageDimensions.current,
            chartRegion: chartRegion,
            precision: precision,
            disableSimulation: true
          };
          
          const results = await detectPatterns(
            processedImage, 
            activeAnalysis, 
            precision, 
            true,
            analysisOptions
          );
          
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
          if (foundCount > 0) {
            toast.success(`Análise concluída! ${foundCount} padrões detectados.`);
          } else {
            toast.info("Análise concluída. Nenhum padrão técnico detectado na região selecionada.");
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
        imageRegion={chartRegion}
        processedImage={processedRegionRef.current}
        originalDimensions={originalImageDimensions.current}
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
        <div className="fixed bottom-0 right-0 w-32 h-32 opacity-50 pointer-events-none border border-red-500">
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
