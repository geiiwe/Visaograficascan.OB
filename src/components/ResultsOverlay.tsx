
import React, { useEffect, useState, useRef } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { detectPatterns } from "@/utils/patternDetection";
import { extractRegionFromImage } from "@/utils/imageProcessing";
import { enhancedPrepareForAnalysis, getEnhancedProcessOptions } from "@/utils/enhancedImageProcessing";
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
import AnalysisContainer from "./analysis/AnalysisContainer";
import { useMarketAnalysis, IndicatorPosition } from "@/hooks/useMarketAnalysis";

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
  const [visualAnalysisResult, setVisualAnalysisResult] = useState<any>(null);
  
  // New state for controlling the overlay panel position
  const [panelPosition, setPanelPosition] = useState<'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'>('top-right');
  
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
  
  const rotatePanelPosition = () => {
    const positions: Array<'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'> = 
      ['top-right', 'bottom-right', 'bottom-left', 'top-left'];
    const currentIndex = positions.indexOf(panelPosition);
    const nextIndex = (currentIndex + 1) % positions.length;
    setPanelPosition(positions[nextIndex]);
  };

  const cleanupResources = () => {
    setProcessingStage("");
    analysisInProgress.current = false;
    analysisCleanupDone.current = true;
    
    if (analysisImageRef.current) {
      analysisImageRef.current.onload = null;
      analysisImageRef.current.onerror = null;
      analysisImageRef.current = null;
    }
    
    processedRegionRef.current = null;
    console.log("Análise resources cleaned up");
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
    const runEnhancedAnalysis = async () => {
      if (analysisInProgress.current) {
        console.log("Análise já em progresso, aguardando...");
        return;
      }
      
      if (isAnalyzing && imageData) {
        setHasError(false);
        analysisInProgress.current = true;
        analysisCleanupDone.current = false;
        
        try {
          console.log(`Iniciando análise aprimorada com IA para ${selectedTimeframe} timeframe em mercado ${marketType}`);
          console.log("Análises ativas:", activeAnalysis);
          
          // Reset previous results
          setDetailedResults({});
          setAiConfirmation({
            active: false,
            verified: false,
            direction: 'neutral',
            confidence: 0,
            majorityDirection: false
          });
          setVisualAnalysisResult(null);
          
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
              console.error("Falha ao carregar imagem original", err);
              reject(new Error("Falha ao carregar imagem"));
            };
            
            setTimeout(() => {
              if (!originalImageDimensions.current) {
                reject(new Error("Timeout no carregamento da imagem"));
              }
            }, 10000);
          });
          
          console.log("Dimensões da imagem original:", originalImageDimensions.current);
          
          let regionImage = imageData;
          
          if (chartRegion) {
            setProcessingStage("Extraindo região selecionada com precisão aprimorada");
            try {
              regionImage = await extractRegionFromImage(imageData, chartRegion);
              
              const debugImg = new Image();
              debugImg.src = regionImage;
              analysisImageRef.current = debugImg;
              processedRegionRef.current = regionImage;
              setAnalysisImage(regionImage);
              
              console.log("Região extraída com sucesso para análise aprimorada");
            } catch (error) {
              console.error("Erro ao extrair região:", error);
              toast.error("Erro ao extrair região selecionada");
              setHasError(true);
              throw new Error("Falha na extração da região");
            }
          } else {
            setProcessingStage("Processando imagem completa com análise visual avançada");
          }
          
          // Use enhanced processing options with advanced visual analysis
          const enhancedOptions = getEnhancedProcessOptions(
            precision, 
            selectedTimeframe, 
            marketType, 
            true, // enableCircular
            75   // candlePrecision
          );
          
          console.log(`Iniciando análise técnica aprimorada com IA para ${precision} precisão`, enhancedOptions);
          
          setProcessingStage(`Executando análise visual baseada em conhecimento de livros técnicos clássicos`);
          
          // Enhanced image processing with advanced visual analysis
          const { processedImage, visualAnalysis } = await enhancedPrepareForAnalysis(
            regionImage, 
            enhancedOptions,
            (stage) => setProcessingStage(stage)
          );
          
          console.log("Análise visual avançada concluída:", visualAnalysis);
          setVisualAnalysisResult(visualAnalysis);
          
          // Display analysis insights
          if (visualAnalysis.chartQuality > 80) {
            toast.success(`Gráfico de alta qualidade detectado (${visualAnalysis.chartQuality}%). Análise otimizada.`);
          } else if (visualAnalysis.chartQuality < 60) {
            toast.info(`Qualidade do gráfico moderada (${visualAnalysis.chartQuality}%). Aplicando processamento adicional.`);
          }
          
          if (visualAnalysis.trendDirection !== "unknown") {
            console.log(`Tendência ${visualAnalysis.trendDirection} identificada pela IA`);
          }
          
          if (visualAnalysis.candlePatterns.length > 0) {
            console.log(`${visualAnalysis.candlePatterns.length} padrões de candles identificados:`, 
              visualAnalysis.candlePatterns.map(p => p.name));
          }
          
          setProcessingStage(`Detectando padrões técnicos com conhecimento aprimorado de análise gráfica`);
          
          console.log("Tipos de análise ativos antes da detecção:", activeAnalysis);
          
          // Fixed: Use correct number of arguments for detectPatterns function
          const results = await detectPatterns(
            processedImage, 
            activeAnalysis, 
            precision,
            enhancedOptions.disableSimulation
          );
          
          console.log("Análise completa com resultados aprimorados:", results);
          
          setDetailedResults(results);
          
          Object.entries(results).forEach(([type, result]) => {
            console.log(`Definindo resultado para ${type}: ${result.found}`);
            setAnalysisResult(type as any, result.found);
          });
          
          // Generate enhanced fast analyses
          generateFastAnalyses(selectedTimeframe, marketType);
          
          // Enhanced AI confirmation with visual analysis context
          setProcessingStage(`Verificação final com IA baseada em análise visual avançada`);
          
          setTimeout(() => {
            // Fixed: Use correct number of arguments for generateAIConfirmation function
            generateAIConfirmation(results);
            setProcessingStage("");
            setLastUpdated(new Date());
            setIsAnalyzing(false);
            
            if (!analysisCleanupDone.current) {
              cleanupResources();
            }
          }, 500);
          
          const foundCount = Object.values(results)
            .filter(r => r.found && r.type !== "all")
            .length;
          
          const totalBuyScore = results.all?.buyScore || 0;
          const totalSellScore = results.all?.sellScore || 0;
          
          let directionMessage = "";
          if (totalBuyScore > totalSellScore && totalBuyScore > 1) {
            directionMessage = `Pressão compradora detectada (Score: ${totalBuyScore.toFixed(1)})`;
            if (totalBuyScore > totalSellScore * 2) {
              directionMessage = `Forte pressão compradora detectada (Score: ${totalBuyScore.toFixed(1)})`;
            }
          } else if (totalSellScore > totalBuyScore && totalSellScore > 1) {
            directionMessage = `Pressão vendedora detectada (Score: ${totalSellScore.toFixed(1)})`;
            if (totalSellScore > totalBuyScore * 2) {
              directionMessage = `Forte pressão vendedora detectada (Score: ${totalSellScore.toFixed(1)})`;
            }
          }
          
          // Enhanced success message with visual analysis insights
          if (foundCount > 0) {
            const trendInfo = visualAnalysis.trendDirection !== "unknown" ? 
              ` Tendência ${visualAnalysis.trendDirection} confirmada.` : "";
            const qualityInfo = ` Qualidade: ${visualAnalysis.chartQuality}%.`;
            
            if (directionMessage) {
              toast.success(`Análise IA concluída! ${foundCount} padrões detectados. ${directionMessage}.${trendInfo}${qualityInfo}`);
            } else {
              toast.success(`Análise IA concluída! ${foundCount} padrões detectados.${trendInfo}${qualityInfo}`);
            }
          } else {
            const qualityInfo = visualAnalysis.chartQuality < 70 ? 
              " Considere melhorar a qualidade da imagem." : "";
            toast.info(`Análise IA concluída. Nenhum padrão técnico forte detectado.${qualityInfo}`);
          }
          
        } catch (error) {
          console.error("Erro na análise aprimorada:", error);
          toast.error("Erro durante a análise aprimorada. Tente novamente com melhor qualidade de imagem.");
          setHasError(true);
          setIsAnalyzing(false);
          
          if (!analysisCleanupDone.current) {
            cleanupResources();
          }
        }
      }
    };

    runEnhancedAnalysis();
  }, [imageData, isAnalyzing, activeAnalysis, setAnalysisResult, setIsAnalyzing, precision, chartRegion, selectedTimeframe, marketType, generateFastAnalyses, setLastUpdated]);

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

  const getPanelPositionClasses = () => {
    switch (panelPosition) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

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
            alt="Região processada com IA"
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
      
      {/* Enhanced results panel with visual analysis insights */}
      <div className={`absolute ${getPanelPositionClasses()} z-40 pointer-events-auto`}>
        <button 
          onClick={rotatePanelPosition}
          className="absolute -left-3 -top-3 bg-trader-blue text-white p-1 rounded-full shadow-md z-50"
          title="Mover painel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
        
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
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
              majorityDirection={aiConfirmation.majorityDirection}
            />
            
            {/* Visual Analysis Quality Indicator */}
            {visualAnalysisResult && (
              <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-gray-700/50">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    visualAnalysisResult.chartQuality > 80 ? 'bg-green-500' :
                    visualAnalysisResult.chartQuality > 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs text-white font-medium">
                    IA: {visualAnalysisResult.chartQuality}% | {visualAnalysisResult.trendDirection}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <FastAnalysisIndicators results={fastAnalysisResults} />
          
          <AnalysisPanel 
            detailedResults={detailedResults}
            compactMode={compactMode}
            selectedTimeframe={selectedTimeframe}
            fastAnalysisResults={fastAnalysisResults}
          />
        </div>
      </div>
      
      <div className="absolute inset-0 z-40 pointer-events-none">
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
            alt="Debug da região processada pela IA" 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
    </div>
  );
};

export default ResultsOverlay;
