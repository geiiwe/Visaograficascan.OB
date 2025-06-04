
import React, { useEffect, useState, useRef } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { detectPatterns } from "@/utils/patternDetection";
import { extractRegionFromImage } from "@/utils/imageProcessing";
import { enhancedPrepareForAnalysis, getEnhancedProcessOptions } from "@/utils/enhancedImageProcessing";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAutonomousAI } from "@/hooks/useAutonomousAI";

// Importing the modularized components
import ProcessingIndicator from "./overlay/ProcessingIndicator";
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
    precision,
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
  
  const [hasError, setHasError] = useState<boolean>(false);
  const [enhancedAnalysisResult, setEnhancedAnalysisResult] = useState<any>(null);
  
  const isMobile = useIsMobile();
  const analysisImageRef = useRef<HTMLImageElement | null>(null);
  const processedRegionRef = useRef<string | null>(null);
  const originalImageDimensions = useRef<{width: number, height: number} | null>(null);
  const analysisInProgress = useRef<boolean>(false);
  const analysisCleanupDone = useRef<boolean>(true);

  const { aiDecision, isProcessing: aiProcessing } = useAutonomousAI(
    detailedResults,
    enhancedAnalysisResult,
    fastAnalysisResults
  );

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
    return () => {
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
          setEnhancedAnalysisResult(null);
          
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
          const { processedImage, enhancedAnalysis } = await enhancedPrepareForAnalysis(
            regionImage, 
            enhancedOptions,
            (stage) => setProcessingStage(stage)
          );
          
          console.log("Análise visual avançada concluída:", enhancedAnalysis);
          setEnhancedAnalysisResult(enhancedAnalysis);
          
          // Display analysis insights from enhanced analysis
          if (enhancedAnalysis.visualAnalysis && enhancedAnalysis.visualAnalysis.chartQuality > 80) {
            toast.success(`Gráfico de alta qualidade detectado (${enhancedAnalysis.visualAnalysis.chartQuality}%). Análise otimizada.`);
          } else if (enhancedAnalysis.visualAnalysis && enhancedAnalysis.visualAnalysis.chartQuality < 60) {
            toast.info(`Qualidade do gráfico moderada (${enhancedAnalysis.visualAnalysis.chartQuality}%). Aplicando processamento adicional.`);
          }
          
          if (enhancedAnalysis.visualAnalysis && enhancedAnalysis.visualAnalysis.trendDirection !== "unknown") {
            console.log(`Tendência ${enhancedAnalysis.visualAnalysis.trendDirection} identificada pela IA`);
          }
          
          if (enhancedAnalysis.visualAnalysis && enhancedAnalysis.visualAnalysis.candlePatterns && enhancedAnalysis.visualAnalysis.candlePatterns.length > 0) {
            console.log(`${enhancedAnalysis.visualAnalysis.candlePatterns.length} padrões de candles identificados:`, 
              enhancedAnalysis.visualAnalysis.candlePatterns.map((p: any) => p.name));
          }
          
          setProcessingStage(`Detectando padrões técnicos com conhecimento aprimorado de análise gráfica`);
          
          console.log("Tipos de análise ativos antes da detecção:", activeAnalysis);
          
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
            const trendInfo = enhancedAnalysis.visualAnalysis && enhancedAnalysis.visualAnalysis.trendDirection !== "unknown" ? 
              ` Tendência ${enhancedAnalysis.visualAnalysis.trendDirection} confirmada.` : "";
            const qualityInfo = enhancedAnalysis.visualAnalysis ? 
              ` Qualidade: ${enhancedAnalysis.visualAnalysis.chartQuality}%.` : "";
            
            if (directionMessage) {
              toast.success(`Análise IA concluída! ${foundCount} padrões detectados. ${directionMessage}.${trendInfo}${qualityInfo}`);
            } else {
              toast.success(`Análise IA concluída! ${foundCount} padrões detectados.${trendInfo}${qualityInfo}`);
            }
          } else {
            const qualityInfo = enhancedAnalysis.visualAnalysis && enhancedAnalysis.visualAnalysis.chartQuality < 70 ? 
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

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none">
      {chartRegion && processedRegionRef.current && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img 
            src={processedRegionRef.current}
            alt="Região processada com IA"
            className="opacity-0 w-0 h-0"
          />
        </div>
      )}
      
      {/* APENAS o painel lateral limpo - SEM sobreposições no gráfico */}
      <AnalysisContainer
        detailedResults={detailedResults}
        fastAnalysisResults={fastAnalysisResults}
        timeframe={selectedTimeframe}
        marketType={marketType}
        visualAnalysis={enhancedAnalysisResult?.visualAnalysis}
        position="right"
        aiDecision={aiDecision}
      />
      
      {/* Apenas o indicador de processamento quando necessário */}
      <div className="absolute top-4 left-4 z-40 pointer-events-none">
        <ProcessingIndicator 
          processingStage={aiProcessing ? "🤖 IA tomando decisão autônoma..." : processingStage} 
          isError={hasError} 
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
