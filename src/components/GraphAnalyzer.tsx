
import React, { useEffect, useState, useRef } from "react";
import { useAnalyzer, TimeframeType } from "@/context/AnalyzerContext";
import CameraView from "./CameraView";
import ControlPanel from "./ControlPanel";
import ResultsOverlay from "./ResultsOverlay";
import ChartRegionSelector from "./ChartRegionSelector";
import AnalysisModeToggle, { type AnalysisMode } from "./AnalysisModeToggle";
import { useUnifiedAnalysis } from "@/hooks/useUnifiedAnalysis";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Crop, Info, Maximize2, Minimize2, Clock, Clock1, Target, Activity, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import MarketTypeSelector from "./MarketTypeSelector";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import TestAnalysisResults from "./TestAnalysisResults";

const GraphAnalyzer = () => {
  // Todos os hooks primeiro para evitar Rules of Hooks violations
  const { 
    imageData, 
    isAnalyzing, 
    setCaptureMode, 
    precision, 
    setPrecision,
    compactMode,
    toggleCompactMode,
    selectionMode,
    setSelectionMode,
    chartRegion,
    hasCustomRegion,
    selectedTimeframe,
    setSelectedTimeframe,
    marketType
  } = useAnalyzer();
  
  const { 
    analyzeImage, 
    progress, 
    currentResult, 
    analysisHistory, 
    cancelAnalysis,
    clearHistory,
    canAnalyze 
  } = useUnifiedAnalysis();
  
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('photo');
  const [liveProgress, setLiveProgress] = useState(0);
  const [liveStats, setLiveStats] = useState({
    totalAnalyses: 0,
    buySignals: 0,
    sellSignals: 0,
    waitSignals: 0,
    averageConfidence: 0
  });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  const { user, loading } = useAuth();

  // Verificar suporte da câmera - hook sempre executado
  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraSupported(false);
          toast.error("Acesso à câmera não é suportado neste navegador ou dispositivo");
          return;
        }
        
        try {
          await navigator.mediaDevices.getUserMedia({ 
            video: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }
          });
          setCameraSupported(true);
          console.log("Suporte à câmera verificado com sucesso");
        } catch (error) {
          setCameraSupported(false);
          console.log("Acesso à câmera negado ou não disponível:", error);
        }
      } catch (error) {
        setCameraSupported(false);
        console.error("Erro ao verificar suporte à câmera:", error);
      }
    };

    checkCameraSupport();
  }, []);

  // Outros useEffects
  useEffect(() => {
    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
    };
  }, []);

  const toggleChartSelection = () => {
    if (isAnalyzing) {
      toast.error("Não é possível selecionar região durante a análise");
      return;
    }
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      toast.info("Arraste para selecionar a área exata do gráfico para análise");
    }
  };

  const handleTimeframeChange = (timeframe: TimeframeType) => {
    setSelectedTimeframe(timeframe);
    toast.info(`Análise ajustada para timeframe de ${timeframe === "30s" ? "30 segundos" : "1 minuto"}`);
  };

  const handlePhotoCapture = async (imageData: string) => {
    await analyzeImage(imageData);
  };

  const handleModeChange = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
  };

  const startLiveAnalysis = () => {
    console.log('🚀 Iniciando modo live real (removido simulação)');
    // Remover simulação - análises agora são feitas pelo CameraView
  };

  const stopLiveAnalysis = () => {
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
  };

  // Extrair região selecionada - MOVED TO TOP
  useEffect(() => {
    if (imageData && chartRegion && !selectionMode) {
      const extractRegion = () => {
        if (!imageData || !chartRegion) return;
        
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) return;
            
            canvas.width = chartRegion.width;
            canvas.height = chartRegion.height;
            
            ctx.drawImage(
              img, 
              chartRegion.x, chartRegion.y, chartRegion.width, chartRegion.height,
              0, 0, canvas.width, canvas.height
            );
            
            const regionImage = canvas.toDataURL('image/png');
            setCroppedImage(regionImage);
          } catch (error) {
            console.error("Error extracting region:", error);
            setCroppedImage(null);
          }
        };
        
        img.src = imageData;
      };
      
      extractRegion();
    } else if (imageData && !chartRegion) {
      setCroppedImage(null);
    }
  }, [imageData, chartRegion, selectionMode]);

  // Progresso unificado para modo live
  useEffect(() => {
    if (analysisMode === 'live') {
      const interval = selectedTimeframe === '30s' ? 30000 : 60000;
      console.log(`⏱️ GraphAnalyzer: Configurando progresso live: intervalo de ${interval}ms`);
      
      // Progresso visual sincronizado com análise real
      liveIntervalRef.current = setInterval(() => {
        setLiveProgress(prev => {
          const newProgress = (prev + 1) % 100;
          if (newProgress === 0) {
            console.log('🔄 GraphAnalyzer: Ciclo de progresso completo');
          }
          return newProgress;
        });
      }, interval / 100);
    }

    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    };
  }, [analysisMode, selectedTimeframe]);

  // Aguardar o carregamento da autenticação
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 text-center">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Verificar se o usuário está autenticado
  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 text-center">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            Acesso Restrito
          </h2>
          <p className="text-gray-400 mb-6">
            Faça login para usar o analisador de gráficos
          </p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Fazer Login
          </Button>
      </div>
      
      {/* Componente de debug */}
      <TestAnalysisResults />
    </div>
  );
  }

  const extractSelectedRegion = () => {
    if (!imageData || !chartRegion) return;
    
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        canvas.width = chartRegion.width;
        canvas.height = chartRegion.height;
        
        ctx.drawImage(
          img, 
          chartRegion.x, chartRegion.y, chartRegion.width, chartRegion.height,
          0, 0, canvas.width, canvas.height
        );
        
        const regionImage = canvas.toDataURL('image/png');
        setCroppedImage(regionImage);
      } catch (error) {
        console.error("Error extracting region:", error);
        setCroppedImage(null);
      }
    };
    
    img.src = imageData;
  };

  // Handlers
  const handlePrecisionChange = (level: "baixa" | "normal" | "alta") => {
    setPrecision(level);
    toast.info(`Precisão de análise alterada para ${level}`);
  };

  const handleLiveCapture = async (imageData: string) => {
    console.log('🎯 handleLiveCapture chamado:', { 
      canAnalyze, 
      analysisMode, 
      hasImageData: !!imageData 
    });
    
    if (canAnalyze && analysisMode === 'live') {
      console.log('🔴 Executando análise REAL no modo live...');
      const result = await analyzeImage(imageData);
      if (result) {
        console.log('📊 Resultado da análise live:', result);
        updateLiveStats(result);
        // Sinal já é salvo automaticamente pelo useUnifiedAnalysis
      }
    } else {
      console.log('❌ Análise live bloqueada:', { canAnalyze, analysisMode });
    }
  };

  const updateLiveStats = (result: any) => {
    setLiveStats(prev => {
      const newStats = {
        totalAnalyses: prev.totalAnalyses + 1,
        buySignals: prev.buySignals + (result.signal === 'BUY' ? 1 : 0),
        sellSignals: prev.sellSignals + (result.signal === 'SELL' ? 1 : 0),
        waitSignals: prev.waitSignals + (result.signal === 'WAIT' ? 1 : 0),
        averageConfidence: 0
      };
      
      // Calcular média de confiança
      const allResults = [...analysisHistory, result];
      newStats.averageConfidence = Math.round(
        allResults.reduce((sum, r) => sum + r.confidence, 0) / allResults.length
      );
      
      return newStats;
    });
  };


  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
      {cameraSupported === false && (
        <Alert variant="destructive" className="mb-2 sm:mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Sua câmera não está disponível. Verifique se você está usando um navegador atualizado e 
            se concedeu as permissões necessárias.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="relative">
        <div className={`flex flex-wrap ${isMobile ? 'gap-2' : 'justify-between'} items-center mb-2`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-white`}>
              Análise de Gráficos
            </h2>
            
            {/* Toggle de modo */}
            <AnalysisModeToggle
              mode={analysisMode}
              onModeChange={setAnalysisMode}
              isAnalyzing={isAnalyzing}
            />
            
            <div className="flex gap-1 sm:gap-2">
              <Tabs 
                value={selectedTimeframe} 
                onValueChange={(value) => handleTimeframeChange(value as TimeframeType)}
                className="bg-trader-panel/60 rounded-md px-1"
              >
                <TabsList className="h-7 bg-transparent">
                  <TabsTrigger 
                    value="30s" 
                    className={`h-6 ${selectedTimeframe === "30s" ? 'data-[state=active]:bg-trader-blue' : ''}`}
                  >
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>30s</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="1m"
                    className={`h-6 ${selectedTimeframe === "1m" ? 'data-[state=active]:bg-trader-blue' : ''}`}
                  >
                    <span className="flex items-center gap-1">
                      <Clock1 className="h-3.5 w-3.5" />
                      <span>1m</span>
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <MarketTypeSelector />
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-xs text-trader-gray hidden sm:inline">Precisão:</span>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handlePrecisionChange("baixa")}
                        className={`px-1 sm:px-2 py-1 text-xs rounded ${precision === "baixa" ? "bg-trader-blue text-white" : "bg-trader-panel text-trader-gray"}`}
                      >
                        {isMobile ? "R" : "Rápida"}
                      </button>
                      <button 
                        onClick={() => handlePrecisionChange("normal")}
                        className={`px-1 sm:px-2 py-1 text-xs rounded ${precision === "normal" ? "bg-trader-blue text-white" : "bg-trader-panel text-trader-gray"}`}
                      >
                        {isMobile ? "N" : "Normal"}
                      </button>
                      <button 
                        onClick={() => handlePrecisionChange("alta")}
                        className={`px-1 sm:px-2 py-1 text-xs rounded ${precision === "alta" ? "bg-trader-blue text-white" : "bg-trader-panel text-trader-gray"}`}
                      >
                        {isMobile ? "P" : "Precisa"}
                      </button>
                    </div>
                    <Info className="h-4 w-4 text-trader-gray" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Ajuste a precisão da análise:
                    <br />- <strong>Rápida:</strong> Análise mais veloz, menos precisa
                    <br />- <strong>Normal:</strong> Equilíbrio entre velocidade e precisão
                    <br />- <strong>Precisa:</strong> Análise detalhada, mais demorada
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {imageData && !selectionMode && analysisMode === 'photo' && (
              <Button 
                variant="outline" 
                size={isMobile ? "xs" : "sm"}
                onClick={toggleChartSelection}
                className={`h-7 sm:h-8 ${hasCustomRegion ? "bg-trader-blue/20 text-trader-blue border-trader-blue" : ""}`}
              >
                <Crop className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1" />
                {hasCustomRegion ? (isMobile ? "Editar" : "Editar Região") : (isMobile ? "Região" : "Definir Região")}
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCompactMode}
              className="h-7 sm:h-8 w-7 sm:w-8"
            >
              {compactMode ? <Maximize2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" /> : <Minimize2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal - Câmera */}
          <div className="lg:col-span-2 space-y-4">
            <CameraView 
              mode={analysisMode === 'live' ? 'continuous' : 'single'}
              onCapture={handlePhotoCapture}
              onContinuousCapture={handleLiveCapture}
              captureInterval={selectedTimeframe === '30s' ? 30000 : 60000}
              showProgress={analysisMode === 'live'}
              progress={liveProgress}
            />
            
            {imageData && analysisMode === 'photo' && (
              <div className="relative mt-2 sm:mt-4 rounded-lg overflow-hidden shadow-xl bg-black/20 backdrop-blur-sm">
                {croppedImage && hasCustomRegion && !selectionMode ? (
                  <div className="relative">
                    <img 
                      src={croppedImage} 
                      alt="Região do Gráfico" 
                      className="w-full object-contain" 
                    />
                    <div className="absolute top-0 right-0 bg-trader-blue/80 text-white text-xs px-2 py-1 rounded-bl-md backdrop-blur-sm">
                      Região selecionada
                    </div>
                    <div className="absolute bottom-0 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded-tr-md backdrop-blur-sm">
                      {chartRegion?.width} x {chartRegion?.height}px
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      ref={imageRef}
                      src={imageData} 
                      alt="Gráfico Capturado" 
                      className="w-full object-contain" 
                    />
                    {hasCustomRegion && !selectionMode && imageRef.current && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div 
                          className="absolute border-2 border-dashed border-trader-blue rounded-sm"
                          style={{
                            left: `${(chartRegion?.x || 0) / (imageRef.current?.naturalWidth || 1) * 100}%`,
                            top: `${(chartRegion?.y || 0) / (imageRef.current?.naturalHeight || 1) * 100}%`,
                            width: `${(chartRegion?.width || 0) / (imageRef.current?.naturalWidth || 1) * 100}%`,
                            height: `${(chartRegion?.height || 0) / (imageRef.current?.naturalHeight || 1) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                <ResultsOverlay />
                <ChartRegionSelector />
              </div>
            )}
          </div>
          
          {/* Coluna lateral - Resultados */}
          <div className="space-y-4">
            {/* Resultado atual */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {analysisMode === 'live' ? 'Último Sinal' : 'Resultado'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentResult ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Badge 
                        className={cn(
                          "text-lg px-4 py-2",
                          currentResult.signal === 'BUY' ? "bg-green-600" :
                          currentResult.signal === 'SELL' ? "bg-red-600" :
                          "bg-yellow-600"
                        )}
                      >
                        {currentResult.signal}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {currentResult.confidence}%
                      </div>
                      <div className="text-sm text-gray-400">Confiança</div>
                    </div>
                    
                    <div className="text-sm text-gray-300">
                      <div className="font-semibold mb-1">Padrões:</div>
                      <div className="flex flex-wrap gap-1">
                        {currentResult.patterns.map(pattern => (
                          <Badge key={pattern} variant="outline" className="text-xs">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {currentResult.reasoning}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {currentResult.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aguardando análise...</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Estatísticas do modo live */}
            {analysisMode === 'live' && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Estatísticas da Sessão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{liveStats.totalAnalyses}</div>
                      <div className="text-sm text-gray-400">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{liveStats.averageConfidence}%</div>
                      <div className="text-sm text-gray-400">Confiança Média</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">BUY</span>
                      <span className="text-white">{liveStats.buySignals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-400">SELL</span>
                      <span className="text-white">{liveStats.sellSignals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-400">WAIT</span>
                      <span className="text-white">{liveStats.waitSignals}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Histórico */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Histórico</CardTitle>
                {analysisHistory.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearHistory}
                    className="text-gray-400 hover:text-white"
                  >
                    Limpar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {analysisHistory.slice(0, 10).map(result => (
                    <div 
                      key={result.id}
                      className="flex items-center justify-between p-2 rounded bg-gray-800 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={cn(
                            "text-xs px-2 py-1",
                            result.signal === 'BUY' ? "bg-green-600" :
                            result.signal === 'SELL' ? "bg-red-600" :
                            "bg-yellow-600"
                          )}
                        >
                          {result.signal}
                        </Badge>
                        <span className="text-white">{result.confidence}%</span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  
                  {analysisHistory.length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      <p>Nenhuma análise ainda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {analysisMode === 'photo' && <ControlPanel />}
      
      {/* Loading overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-trader-panel/90 p-4 sm:p-8 rounded-lg shadow-xl flex flex-col items-center border border-trader-blue/20 max-w-[90%] mx-auto">
            <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-t-2 border-trader-blue mb-4"></div>
            
            <div className="text-center space-y-2">
              <p className="text-white text-sm sm:text-base font-medium">
                {progress.message || 'Analisando padrões do gráfico...'}
              </p>
              
              <div className="w-64 space-y-2">
                <Progress value={progress.percentage} className="h-2" />
                <p className="text-xs text-trader-gray">
                  {progress.stage === 'processing' && 'Processando imagem...'}
                  {progress.stage === 'saving' && 'Salvando resultados...'}
                  {progress.stage === 'complete' && 'Concluído!'}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={cancelAnalysis}
                className="mt-4"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Componente de debug */}
      <TestAnalysisResults />
    </div>
  );
};

export default GraphAnalyzer;
