import React, { useEffect, useState, useRef } from "react";
import { useAnalyzer, TimeframeType } from "@/context/AnalyzerContext";
import CameraView from "./CameraView";
import ControlPanel from "./ControlPanel";
import ResultsOverlay from "./ResultsOverlay";
import ChartRegionSelector from "./ChartRegionSelector";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Crop, Info, Maximize2, Minimize2, Clock, Clock1 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import MarketTypeSelector from "./MarketTypeSelector";

const GraphAnalyzer = () => {
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
  
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if the device has camera capabilities
    const checkCameraSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error("Camera API not supported");
          setCameraSupported(false);
          toast.error("Acesso à câmera não é suportado neste navegador ou dispositivo");
          return;
        }
        
        // Try to get permission for camera on component mount
        try {
          await navigator.mediaDevices.getUserMedia({ 
            video: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }
          });
          console.log("Camera permission granted with high quality settings");
          setCameraSupported(true);
        } catch (error) {
          console.error("Error requesting camera permission:", error);
          toast.error("Por favor, permita o acesso à câmera para usar este aplicativo");
          setCaptureMode(false);
          // We still mark as supported because the API exists, just permission was denied
          setCameraSupported(true);
        }
      } catch (e) {
        console.error("Error checking camera support:", e);
        setCameraSupported(false);
      }
    };

    checkCameraSupport();
  }, [setCaptureMode]);

  // Extract and display only the selected region
  useEffect(() => {
    if (imageData && chartRegion && !selectionMode) {
      extractSelectedRegion();
    } else if (imageData && !chartRegion) {
      // If there's no region selected, use the original image
      setCroppedImage(null);
    }
  }, [imageData, chartRegion, selectionMode]);

  const extractSelectedRegion = () => {
    if (!imageData || !chartRegion) return;
    
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error("Could not get canvas context");
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
        
        // Get the region as a new image
        const regionImage = canvas.toDataURL('image/png');
        setCroppedImage(regionImage);
      } catch (error) {
        console.error("Error extracting region:", error);
        setCroppedImage(null);
      }
    };
    
    img.onerror = () => {
      console.error("Failed to load image for region extraction");
      setCroppedImage(null);
    };
    
    img.src = imageData;
  };

  const handlePrecisionChange = (level: "baixa" | "normal" | "alta") => {
    setPrecision(level);
    toast.info(`Precisão de análise alterada para ${level}`);
  };

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

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
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
              {isMobile ? "Análise" : "Análise de Gráficos"}
            </h2>
            
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
              
              {/* Seletor de tipo de mercado */}
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
            
            {imageData && !selectionMode && (
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
        
        <CameraView />
        {imageData && (
          <div className="relative mt-2 sm:mt-4 rounded-lg overflow-hidden shadow-xl bg-black/20 backdrop-blur-sm">
            {/* Show either cropped image or full image with region indicator */}
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
                
                {/* Show image dimensions for better feedback */}
                <div className="absolute bottom-0 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded-tr-md backdrop-blur-sm">
                  {chartRegion.width} x {chartRegion.height}px
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
      <ControlPanel />
      
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-trader-panel/90 p-4 sm:p-8 rounded-lg shadow-xl flex flex-col items-center border border-trader-blue/20 max-w-[90%] mx-auto">
            <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-t-2 border-trader-blue"></div>
            <p className="mt-3 sm:mt-4 text-white text-sm sm:text-base font-medium">Analisando padrões do gráfico...</p>
            <p className="text-xs sm:text-sm text-trader-gray mt-1 sm:mt-2 text-center">
              {marketType === "otc" ? 
                `Análise de mercado OTC em andamento. ${selectedTimeframe === "30s" ? "Ciclos de 30 segundos" : "M1 com ciclos de 30s"}.` :
                precision === "alta" 
                  ? `Análise detalhada em andamento. Considerando ciclos de ${selectedTimeframe === "30s" ? "30 segundos" : "1 minuto"} para maior precisão.`
                  : precision === "baixa"
                    ? `Análise rápida em andamento. Identificando ciclos de ${selectedTimeframe === "30s" ? "30 segundos" : "1 minuto"}.`
                    : `Análise em andamento. Processando ciclos de ${selectedTimeframe === "30s" ? "30 segundos" : "1 minuto"}.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphAnalyzer;
