
import React, { useEffect, useState, useRef } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { detectPatterns } from "@/utils/patternDetection";
import { prepareForAnalysis, extractRegionFromImage } from "@/utils/imageProcessing";
import { toast } from "sonner";
import ChartOverlay from "./ChartOverlay";
import DirectionIndicator from "./DirectionIndicator";
import EntryPointPredictor from "./EntryPointPredictor";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useIsMobile } from "@/hooks/use-mobile";

// Importing the modularized components
import ProcessingIndicator from "./overlay/ProcessingIndicator";
import TimeframeIndicator from "./overlay/TimeframeIndicator";
import MarketTypeIndicator from "./overlay/MarketTypeIndicator";
import AIConfirmationBadge from "./overlay/AIConfirmationBadge";
import FastAnalysisIndicators from "./overlay/FastAnalysisIndicators";
import DetailedPanelToggle from "./overlay/DetailedPanelToggle";
import AnalysisPanel from "./overlay/AnalysisPanel";
import { useMarketAnalysis, IndicatorPosition } from "@/hooks/useMarketAnalysis";
import { getProcessOptions } from "@/utils/fastAnalysis";

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
    chartRegion,
    selectedTimeframe,
    marketType,
    setLastUpdated
  } = useAnalyzer();
  
  const {
    detailedResults,
    setDetailedResults,
    processingStage,
    setProcessingStage,
    analysisImage,
    setAnalysisImage,
    fastAnalysisResults,
    aiConfirmation,
    setAiConfirmation,
    generateFastAnalyses,
    generateAIConfirmation
  } = useMarketAnalysis({
    isAnalyzing,
    imageData,
    activeAnalysis,
    precision,
    selectedTimeframe,
    marketType,
    setIsAnalyzing,
    setAnalysisResult
  });
  
  const [indicatorPosition, setIndicatorPosition] = useState<IndicatorPosition>({
    x: 20,
    y: 20,
    isDragging: false
  });
  
  const [showDetailedPanel, setShowDetailedPanel] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  
  const isMobile = useIsMobile();
  const analysisImageRef = useRef<HTMLImageElement | null>(null);
  const processedRegionRef = useRef<string | null>(null);
  const originalImageDimensions = useRef<{width: number, height: number} | null>(null);
  const resultsPanelRef = useRef<HTMLDivElement | null>(null);
  const analysisInProgress = useRef<boolean>(false);
  const analysisCleanupDone = useRef<boolean>(true);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIndicatorPosition(prev => ({ ...prev, isDragging: true }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (indicatorPosition.isDragging && resultsPanelRef.current) {
      const rect = resultsPanelRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(0, ((e.clientX - rect.left) / rect.width) * 100), 90);
      const y = Math.min(Math.max(0, ((e.clientY - rect.top) / rect.height) * 100), 90);
      
      setIndicatorPosition(prev => ({ ...prev, x, y }));
    }
  };

  const handleMouseUp = () => {
    setIndicatorPosition(prev => ({ ...prev, isDragging: false }));
  };

  const toggleDetailedPanel = () => {
    setShowDetailedPanel(!showDetailedPanel);
  };

  // Cleanup function to properly handle resources
  const cleanupResources = () => {
    setProcessingStage("");
    analysisInProgress.current = false;
    analysisCleanupDone.current = true;
    
    // Clear any references to prevent memory leaks
    if (analysisImageRef.current) {
      analysisImageRef.current.onload = null;
      analysisImageRef.current.onerror = null;
      analysisImageRef.current = null;
    }
    
    processedRegionRef.current = null;
    console.log("Analysis resources cleaned up");
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIndicatorPosition(prev => ({ ...prev, isDragging: false }));
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      cleanupResources();
    };
  }, []);

  useEffect(() => {
    const runAnalysis = async () => {
      // Prevent multiple analyses from running simultaneously
      if (analysisInProgress.current) {
        console.log("Analysis already in progress, skipping...");
        return;
      }
      
      if (isAnalyzing && imageData) {
        setHasError(false);
        analysisInProgress.current = true;
        analysisCleanupDone.current = false;
        
        try {
          console.log(`Starting analysis with chart region for ${selectedTimeframe} timeframe in ${marketType} market:`, chartRegion);
          console.log("Active analyses:", activeAnalysis);
          
          // Reset previous analysis results to avoid overlapping display
          setDetailedResults({});
          setAiConfirmation({
            active: false,
            verified: false,
            direction: 'neutral',
            confidence: 0
          });
          
          const originalImg = new Image();
          originalImg.src = imageData;
          await new Promise((resolve, reject) => {
            originalImg.onload = () => {
              originalImageDimensions.current = {
                width: originalImg.naturalWidth,
                height: originalImg.naturalHeight
              };
              resolve(null);
            };
            originalImg.onerror = (err) => {
              console.error("Failed to load original image", err);
              reject(new Error("Failed to load image"));
            };
            
            // Add timeout to prevent hanging
            setTimeout(() => {
              if (!originalImageDimensions.current) {
                reject(new Error("Image load timed out"));
              }
            }, 10000);
          });
          
          console.log("Original image dimensions:", originalImageDimensions.current);
          
          let regionImage = imageData;
          
          if (chartRegion) {
            setProcessingStage("Extraindo região selecionada");
            try {
              regionImage = await extractRegionFromImage(imageData, chartRegion);
              
              const debugImg = new Image();
              debugImg.src = regionImage;
              analysisImageRef.current = debugImg;
              processedRegionRef.current = regionImage;
              setAnalysisImage(regionImage);
              
              console.log("Region extracted successfully");
            } catch (error) {
              console.error("Error extracting region:", error);
              toast.error("Erro ao extrair região selecionada");
              setHasError(true);
              throw new Error("Region extraction failed");
            }
          } else {
            setProcessingStage("Processando imagem completa");
          }
          
          // Use optimized processing options with market type
          const processOptions = getProcessOptions(precision, selectedTimeframe, marketType);
          
          console.log(`Iniciando análise técnica com precisão ${precision} para timeframe de ${selectedTimeframe} em mercado ${marketType}`, processOptions);
          
          setProcessingStage(`Preparando imagem para análise de ${marketType === "otc" ? "mercado OTC" : "mercado regular"}`);
          const processedImage = await prepareForAnalysis(regionImage, processOptions, 
            (stage) => setProcessingStage(stage));
          
          setProcessingStage(`Analisando padrões técnicos com foco em ciclos de ${selectedTimeframe === "30s" ? "30 segundos" : "1 minuto"} em ${marketType === "otc" ? "mercado OTC" : "mercado regular"}`);
          
          console.log("Active analysis types before detection:", activeAnalysis);
          
          // Pass correct parameters to detectPatterns
          const results = await detectPatterns(
            processedImage, 
            activeAnalysis, 
            precision,
            processOptions.disableSimulation // Using the boolean value from processOptions
          );
          
          console.log("Analysis complete with results:", results);
          
          setDetailedResults(results);
          
          Object.entries(results).forEach(([type, result]) => {
            console.log(`Setting result for ${type}: ${result.found}`);
            setAnalysisResult(type as any, result.found);
          });
          
          // Generate fast analyses specific to timeframe and market type
          generateFastAnalyses(selectedTimeframe, marketType);
          
          // AI confirmation stage
          setProcessingStage(`Verificando análise com IA para ciclos de ${selectedTimeframe} em ${marketType === "otc" ? "mercado OTC" : "mercado regular"}`);
          
          // Simulate AI verification using the new function
          setTimeout(() => {
            generateAIConfirmation(results);
            setProcessingStage("");
            setLastUpdated(new Date());
            setIsAnalyzing(false);
            
            // Only call cleanup resources once analysis is complete
            if (!analysisCleanupDone.current) {
              cleanupResources();
            }
          }, 500); // Reduced to 500ms for faster analysis
          
          const notFoundTypes = activeAnalysis
            .filter(type => type !== "all")
            .filter(type => !results[type]?.found);
          
          console.log("Types with no patterns found:", notFoundTypes);
          
          const foundCount = Object.values(results)
            .filter(r => r.found && r.type !== "all")
            .length;
          
          const totalBuyScore = results.all?.buyScore || 0;
          const totalSellScore = results.all?.sellScore || 0;
          
          let directionMessage = "";
          if (totalBuyScore > totalSellScore && totalBuyScore > 1) {
            directionMessage = "Pressão compradora detectada";
            if (totalBuyScore > totalSellScore * 2) {
              directionMessage = "Forte pressão compradora detectada";
            }
          } else if (totalSellScore > totalBuyScore && totalSellScore > 1) {
            directionMessage = "Pressão vendedora detectada";
            if (totalSellScore > totalBuyScore * 2) {
              directionMessage = "Forte pressão vendedora detectada";
            }
          }
          
          if (foundCount > 0) {
            if (directionMessage) {
              toast.success(`Análise concluída! ${foundCount} padrões detectados. ${directionMessage}. Operação com ciclos de ${selectedTimeframe}${marketType === "otc" ? " em mercado OTC" : ""}.`);
            } else {
              toast.success(`Análise concluída! ${foundCount} padrões detectados. Operação com ciclos de ${selectedTimeframe}${marketType === "otc" ? " em mercado OTC" : ""}.`);
            }
          } else {
            toast.info(`Análise concluída. Nenhum padrão técnico detectado na região selecionada${marketType === "otc" ? " em mercado OTC" : ""}.`);
          }
          
        } catch (error) {
          console.error("Analysis error:", error);
          toast.error("Erro durante a análise. Por favor, tente novamente.");
          setHasError(true);
          setIsAnalyzing(false);
          
          // Ensure cleanup runs even in case of error
          if (!analysisCleanupDone.current) {
            cleanupResources();
          }
        }
      }
    };

    runAnalysis();
  }, [imageData, isAnalyzing, activeAnalysis, setAnalysisResult, setIsAnalyzing, precision, chartRegion, selectedTimeframe, marketType, generateFastAnalyses, setLastUpdated]);

  // Make sure we properly cleanup when unmounting or when component re-renders
  useEffect(() => {
    return () => {
      if (!analysisCleanupDone.current) {
        cleanupResources();
      }
    };
  }, []);

  if (!imageData || (Object.keys(detailedResults).length === 0 && !activeAnalysis.some(type => analysisResults[type]))) {
    return null;
  }

  const indicatorStyle = {
    position: 'absolute',
    left: `${indicatorPosition.x}%`,
    top: `${indicatorPosition.y}%`,
    cursor: indicatorPosition.isDragging ? 'grabbing' : 'grab',
    zIndex: 30
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col pointer-events-none"
      ref={resultsPanelRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {chartRegion && processedRegionRef.current && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img 
            src={processedRegionRef.current}
            alt="Região processada"
            className="opacity-0 w-0 h-0"
          />
        </div>
      )}
      
      <ChartOverlay 
        results={detailedResults} 
        showMarkers={showVisualMarkers}
        imageRegion={chartRegion}
        processedImage={processedRegionRef.current}
        originalDimensions={originalImageDimensions.current}
      />

      {/* Entry Point Predictor - Moved down in z-index to avoid overlap */}
      {Object.keys(detailedResults).length > 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <EntryPointPredictor results={detailedResults} />
        </div>
      )}
      
      {detailedResults.all?.found && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <DirectionIndicator 
            direction={detailedResults.all?.buyScore > detailedResults.all?.sellScore ? "buy" : 
                      detailedResults.all?.sellScore > detailedResults.all?.buyScore ? "sell" : "neutral"} 
            strength={detailedResults.all?.buyScore > 1.5 || detailedResults.all?.sellScore > 1.5 ? "strong" : 
                      detailedResults.all?.buyScore > 0.8 || detailedResults.all?.sellScore > 0.8 ? "moderate" : "weak"}
            className="drag-handle pointer-events-auto"
            style={indicatorStyle as React.CSSProperties}
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
      
      {/* Organized modular components with proper z-index layers */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <TimeframeIndicator 
          selectedTimeframe={selectedTimeframe} 
          marketType={marketType} 
        />
        
        <MarketTypeIndicator marketType={marketType} />
        
        <AIConfirmationBadge 
          active={aiConfirmation.active}
          verified={aiConfirmation.verified}
          direction={aiConfirmation.direction}
          confidence={aiConfirmation.confidence}
        />
      </div>
      
      <div className="absolute inset-0 z-30 pointer-events-none">
        <FastAnalysisIndicators results={fastAnalysisResults} />
      </div>
      
      <div className="absolute inset-0 z-40 pointer-events-none">
        <AnalysisPanel 
          detailedResults={detailedResults}
          compactMode={compactMode}
          selectedTimeframe={selectedTimeframe}
          fastAnalysisResults={fastAnalysisResults}
        />
        
        <ProcessingIndicator processingStage={processingStage} isError={hasError} />
        
        <DetailedPanelToggle 
          showDetailedPanel={showDetailedPanel}
          toggleDetailedPanel={toggleDetailedPanel}
        />
      </div>
      
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
