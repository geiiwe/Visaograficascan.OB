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

// Importando os novos componentes modularizados
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
    marketType, // Novo campo do contexto
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
    marketType, // Passando o tipo de mercado
    setIsAnalyzing,
    setAnalysisResult
  });
  
  const [indicatorPosition, setIndicatorPosition] = useState<IndicatorPosition>({
    x: 20,
    y: 20,
    isDragging: false
  });
  
  const [showDetailedPanel, setShowDetailedPanel] = useState<boolean>(false);
  
  const isMobile = useIsMobile();
  const analysisImageRef = useRef<HTMLImageElement | null>(null);
  const processedRegionRef = useRef<string | null>(null);
  const originalImageDimensions = useRef<{width: number, height: number} | null>(null);
  const resultsPanelRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIndicatorPosition(prev => ({ ...prev, isDragging: false }));
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    const runAnalysis = async () => {
      if (isAnalyzing && imageData) {
        try {
          console.log(`Starting analysis with chart region for ${selectedTimeframe} timeframe in ${marketType} market:`, chartRegion);
          console.log("Active analyses:", activeAnalysis);
          
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
            }
          } else {
            setProcessingStage("Processando imagem completa");
          }
          
          // Usar as opções de processamento otimizadas com o tipo de mercado
          const processOptions = getProcessOptions(precision, selectedTimeframe, marketType);
          
          console.log(`Iniciando análise técnica com precisão ${precision} para timeframe de ${selectedTimeframe} em mercado ${marketType}`, processOptions);
          
          setProcessingStage(`Preparando imagem para análise de ${marketType === "otc" ? "mercado OTC" : "mercado regular"}`);
          const processedImage = await prepareForAnalysis(regionImage, processOptions, 
            (stage) => setProcessingStage(stage));
          
          setProcessingStage(`Analisando padrões técnicos com foco em ciclos de ${selectedTimeframe === "30s" ? "30 segundos" : "1 minuto"} em ${marketType === "otc" ? "mercado OTC" : "mercado regular"}`);
          
          console.log("Active analysis types before detection:", activeAnalysis);
          
          // Passar os parâmetros corretos para detectPatterns
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
          
          // Gerar análises rápidas específicas para o timeframe e tipo de mercado
          generateFastAnalyses(selectedTimeframe, marketType);
          
          // Estágio de confirmação da IA
          setProcessingStage(`Verificando análise com IA para ciclos de ${selectedTimeframe} em ${marketType === "otc" ? "mercado OTC" : "mercado regular"}`);
          
          // Simular verificação de IA usando a nova função
          setTimeout(() => {
            generateAIConfirmation(results);
            setProcessingStage("");
            setLastUpdated(new Date());
          }, 500); // Reduzido para 500ms para análise mais rápida
          
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
        } finally {
          setProcessingStage("");
          setIsAnalyzing(false);
        }
      }
    };

    runAnalysis();
  }, [imageData, isAnalyzing, activeAnalysis, setAnalysisResult, setIsAnalyzing, precision, chartRegion, selectedTimeframe, marketType, generateFastAnalyses, setLastUpdated]);

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

      {/* Entry Point Predictor */}
      {Object.keys(detailedResults).length > 0 && (
        <EntryPointPredictor results={detailedResults} />
      )}
      
      {detailedResults.all?.found && (
        <DirectionIndicator 
          direction={detailedResults.all?.buyScore > detailedResults.all?.sellScore ? "buy" : 
                    detailedResults.all?.sellScore > detailedResults.all?.buyScore ? "sell" : "neutral"} 
          strength={detailedResults.all?.buyScore > 1.5 || detailedResults.all?.sellScore > 1.5 ? "strong" : 
                    detailedResults.all?.buyScore > 0.8 || detailedResults.all?.sellScore > 0.8 ? "moderate" : "weak"}
          className="drag-handle pointer-events-auto"
          style={indicatorStyle as React.CSSProperties}
          onMouseDown={handleMouseDown}
        />
      )}
      
      {/* Componentes modularizados */}
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
      
      <FastAnalysisIndicators results={fastAnalysisResults} />
      
      <AnalysisPanel 
        detailedResults={detailedResults}
        compactMode={compactMode}
        selectedTimeframe={selectedTimeframe}
        fastAnalysisResults={fastAnalysisResults}
      />
      
      <ProcessingIndicator processingStage={processingStage} />
      
      <DetailedPanelToggle 
        showDetailedPanel={showDetailedPanel}
        toggleDetailedPanel={toggleDetailedPanel}
      />
      
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
