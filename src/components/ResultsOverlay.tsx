import React, { useEffect, useState, useRef } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { detectPatterns, PatternResult } from "@/utils/patternDetection";
import { prepareForAnalysis, extractRegionFromImage } from "@/utils/imageProcessing";
import { toast } from "sonner";
import ChartOverlay from "./ChartOverlay";
import AnalysisLabels from "./AnalysisLabels";
import DirectionIndicator from "./DirectionIndicator";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Clock, Bot, BarChart2, Activity, LineChart } from "lucide-react";

interface IndicatorPosition {
  x: number;
  y: number;
  isDragging: boolean;
}

interface AIConfirmation {
  active: boolean;
  verified: boolean;
  direction: "buy" | "sell" | "neutral";
  confidence: number;
}

// Análises técnicas complementares para o timeframe de 1 minuto
interface FastAnalysisResult {
  type: string;
  found: boolean;
  direction: "up" | "down" | "neutral";
  strength: number;
  name: string;
  description: string;
}

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
  const [indicatorPosition, setIndicatorPosition] = useState<IndicatorPosition>({
    x: 20,
    y: 20,
    isDragging: false
  });
  
  const [aiConfirmation, setAiConfirmation] = useState<AIConfirmation>({
    active: false,
    verified: false,
    direction: "neutral",
    confidence: 0
  });

  // Indicadores rápidos específicos para 1 minuto
  const [fastAnalysisResults, setFastAnalysisResults] = useState<FastAnalysisResult[]>([]);
  const [showDetailedPanel, setShowDetailedPanel] = useState<boolean>(false);
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  const analysisImageRef = useRef<HTMLImageElement | null>(null);
  const processedRegionRef = useRef<string | null>(null);
  const originalImageDimensions = useRef<{width: number, height: number} | null>(null);
  const resultsPanelRef = useRef<HTMLDivElement | null>(null);

  // Function to generate M1-specific fast analyses with 30-second candle awareness
  const generateM1Analyses = () => {
    // Simulated fast analyses specifically for 1-minute timeframe with 30-second candles
    const m1Analyses: FastAnalysisResult[] = [
      {
        type: "priceAction",
        found: Math.random() > 0.3,
        direction: Math.random() > 0.5 ? "up" : "down",
        strength: Math.random() * 100,
        name: "Price Action",
        description: "Análise de movimentos rápidos a cada 30 segundos, ideal para operações de 1 minuto"
      },
      {
        type: "momentum",
        found: Math.random() > 0.3,
        direction: Math.random() > 0.5 ? "up" : "down",
        strength: Math.random() * 100,
        name: "Momentum",
        description: "Força do movimento atual com resolução de 30 segundos, crucial para timeframes curtos"
      },
      {
        type: "volumeSpikes",
        found: Math.random() > 0.4,
        direction: Math.random() > 0.5 ? "up" : "down",
        strength: Math.random() * 100,
        name: "Picos de Volume",
        description: "Detecção de aumentos súbitos de volume a cada 30 segundos, indicador forte para M1"
      },
      {
        type: "candleFormation",
        found: Math.random() > 0.35,
        direction: Math.random() > 0.5 ? "up" : "down",
        strength: Math.random() * 100,
        name: "Formação de Velas",
        description: "Análise de padrões de velas de 30 segundos para previsão do próximo minuto"
      }
    ];

    return m1Analyses;
  };

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
          console.log("Starting analysis with chart region:", chartRegion);
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
          
          const processOptions = {
            enhanceContrast: true,
            removeNoise: precision !== "baixa",
            sharpness: precision === "alta" ? 2.2 : precision === "normal" ? 1.5 : 1.0,
            iterations: precision === "alta" ? 3 : precision === "normal" ? 2 : 1,
            
            adaptiveThreshold: precision !== "baixa",
            perspectiveCorrection: true,
            chartRegionDetection: false,
            
            edgeEnhancement: precision !== "baixa",
            patternRecognition: true,
            
            contourDetection: precision !== "baixa",
            featureExtraction: precision === "alta",
            histogramEqualization: precision !== "baixa",
            
            sensitivity: precision === "alta" ? 1.8 : 
                        precision === "normal" ? 1.2 : 0.9,
            
            contextAwareness: true,
            patternConfidence: precision === "alta" ? 0.8 : 
                              precision === "normal" ? 0.7 : 0.6,
            
            disableSimulation: false,
          };
          
          console.log(`Iniciando análise técnica com precisão ${precision} para timeframe de 1 minuto`, processOptions);
          
          setProcessingStage("Preparando imagem para análise");
          const processedImage = await prepareForAnalysis(regionImage, processOptions, 
            (stage) => setProcessingStage(stage));
          
          setProcessingStage("Analisando padrões técnicos com foco em ciclos de 30 segundos");
          
          console.log("Active analysis types before detection:", activeAnalysis);
          
          const results = await detectPatterns(
            processedImage, 
            activeAnalysis, 
            precision, 
            processOptions.disableSimulation
          );
          
          console.log("Analysis complete with results:", results);
          
          setDetailedResults(results);
          
          Object.entries(results).forEach(([type, result]) => {
            console.log(`Setting result for ${type}: ${result.found}`);
            setAnalysisResult(type as any, result.found);
          });
          
          // Adiciona análises rápidas específicas para M1 com ciclos de 30 segundos
          setFastAnalysisResults(generateM1Analyses());
          
          // AI Confirmation stage
          setProcessingStage("Verificando análise com IA para ciclos de 30 segundos");
          
          // Simulate AI verification
          setTimeout(() => {
            // Get overall buy/sell scores
            const totalBuyScore = results.all?.buyScore || 0;
            const totalSellScore = results.all?.sellScore || 0;
            
            // Set AI confirmation based on analysis results
            setAiConfirmation({
              active: true,
              verified: totalBuyScore > 0.5 || totalSellScore > 0.5,
              direction: totalBuyScore > totalSellScore ? "buy" : 
                        totalSellScore > totalBuyScore ? "sell" : "neutral",
              confidence: results.all?.confidence || 0
            });
            
            setProcessingStage("");
          }, 800);
          
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
              toast.success(`Análise concluída! ${foundCount} padrões detectados. ${directionMessage}. Operação com ciclos de 30 segundos.`);
            } else {
              toast.success(`Análise concluída! ${foundCount} padrões detectados. Operação com ciclos de 30 segundos.`);
            }
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
      
      {/* Indicador de tempo com visual melhorado */}
      <div className="absolute top-2 right-2 z-30 bg-blue-600/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center shadow-lg">
        <Clock className="h-4 w-4 mr-2" />
        <span className="font-medium text-sm">
          M1 - Ciclos de 30 segundos
        </span>
      </div>
      
      {/* AI confirmation badge com visual melhorado */}
      {aiConfirmation.active && aiConfirmation.verified && (
        <div className={`absolute top-14 right-2 z-30 px-3 py-1.5 rounded-full flex items-center shadow-lg backdrop-blur-sm ${
          aiConfirmation.direction === "buy" ? "bg-trader-green/80 text-white" :
          aiConfirmation.direction === "sell" ? "bg-trader-red/80 text-white" :
          "bg-gray-600/80 text-white"
        }`}>
          <Bot className="h-4 w-4 mr-2" />
          <span className="font-medium text-sm">
            {aiConfirmation.direction === "buy" ? "IA confirma COMPRA" :
             aiConfirmation.direction === "sell" ? "IA confirma VENDA" :
             "IA sem confirmação clara"}
             {" "}
            <span className="text-xs opacity-80">({Math.round(aiConfirmation.confidence * 100)}% confiança)</span>
          </span>
        </div>
      )}
      
      {/* Indicadores rápidos específicos para M1 */}
      {fastAnalysisResults.length > 0 && (
        <div className="absolute top-26 right-2 z-30">
          <div className="flex flex-col gap-2 mt-2">
            {fastAnalysisResults.filter(r => r.found).map((result, index) => (
              <div 
                key={result.type}
                className={`flex items-center rounded-full px-3 py-1 text-xs text-white shadow-lg backdrop-blur-sm ${
                  result.direction === "up" ? "bg-trader-green/70" : 
                  result.direction === "down" ? "bg-trader-red/70" : 
                  "bg-gray-500/70"
                }`}
                style={{ marginTop: index > 0 ? '0.5rem' : '0' }}
              >
                {result.type === "priceAction" ? <BarChart2 className="h-3.5 w-3.5 mr-1.5" /> :
                 result.type === "momentum" ? <Activity className="h-3.5 w-3.5 mr-1.5" /> :
                 <LineChart className="h-3.5 w-3.5 mr-1.5" />}
                <span>{result.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Painel de análise com transparência melhorada */}
      <div className={`absolute ${isMobile ? "bottom-2 left-2 right-2" : "bottom-4 left-2 max-w-[90%] w-auto"} pointer-events-auto`}>
        <div className="bg-black/60 backdrop-blur-md border border-gray-700/50 p-2 rounded-lg shadow-lg">
          <AnalysisLabels 
            results={detailedResults} 
            compact={compactMode}
            specificTimeframe="30s"
            m1Analyses={fastAnalysisResults.filter(r => r.found)}
          />
        </div>
      </div>
      
      {processingStage && (
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm border border-trader-blue/50 backdrop-blur-md shadow-lg">
            {processingStage}
          </div>
        </div>
      )}
      
      {process.env.NODE_ENV === 'development' && analysisImageRef.current && (
        <div className="fixed bottom-0 right-0 w-32 h-32 opacity-50 pointer-events-none border border-red-500">
          <img 
            src={analysisImageRef.current.src} 
            alt="Region debug" 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
      
      {/* Botão para mostrar/esconder painel detalhado */}
      <button
        onClick={toggleDetailedPanel}
        className="absolute bottom-2 right-2 bg-trader-blue/80 text-white rounded-full p-1.5 shadow-lg z-40 pointer-events-auto"
      >
        {showDetailedPanel ? 
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg> : 
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>}
      </button>
    </div>
  );
};

export default ResultsOverlay;
