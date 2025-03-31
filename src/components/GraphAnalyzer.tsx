
import React, { useEffect, useState } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import CameraView from "./CameraView";
import ControlPanel from "./ControlPanel";
import ResultsOverlay from "./ResultsOverlay";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const GraphAnalyzer = () => {
  const { imageData, isAnalyzing, setCaptureMode } = useAnalyzer();
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null);
  const [captureQuality, setCaptureQuality] = useState<"alta" | "normal" | "baixa">("normal");

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

  const handleCaptureQualityChange = (quality: "alta" | "normal" | "baixa") => {
    setCaptureQuality(quality);
    toast.info(`Qualidade de análise alterada para ${quality}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {cameraSupported === false && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Sua câmera não está disponível. Verifique se você está usando um navegador atualizado e 
            se concedeu as permissões necessárias.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Análise de Gráficos</h2>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-trader-gray">Qualidade da análise:</span>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleCaptureQualityChange("baixa")}
                      className={`px-2 py-1 text-xs rounded ${captureQuality === "baixa" ? "bg-trader-blue text-white" : "bg-trader-panel text-trader-gray"}`}
                    >
                      Rápida
                    </button>
                    <button 
                      onClick={() => handleCaptureQualityChange("normal")}
                      className={`px-2 py-1 text-xs rounded ${captureQuality === "normal" ? "bg-trader-blue text-white" : "bg-trader-panel text-trader-gray"}`}
                    >
                      Normal
                    </button>
                    <button 
                      onClick={() => handleCaptureQualityChange("alta")}
                      className={`px-2 py-1 text-xs rounded ${captureQuality === "alta" ? "bg-trader-blue text-white" : "bg-trader-panel text-trader-gray"}`}
                    >
                      Precisa
                    </button>
                  </div>
                  <Info className="h-4 w-4 text-trader-gray" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Ajuste a qualidade da análise de acordo com sua necessidade:
                  <br />- <strong>Rápida:</strong> Análise mais veloz, menos precisa
                  <br />- <strong>Normal:</strong> Equilíbrio entre velocidade e precisão
                  <br />- <strong>Precisa:</strong> Análise detalhada, mais demorada
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <CameraView />
        {imageData && (
          <div className="relative mt-4 rounded-lg overflow-hidden shadow-xl">
            <img 
              src={imageData} 
              alt="Gráfico Capturado" 
              className="w-full object-contain" 
            />
            <ResultsOverlay />
          </div>
        )}
      </div>
      <ControlPanel />
      
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-trader-panel p-8 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-trader-blue"></div>
            <p className="mt-4 text-white font-medium">Analisando padrões do gráfico...</p>
            <p className="text-sm text-trader-gray mt-2">
              {captureQuality === "alta" 
                ? "Análise detalhada em andamento. Isso pode levar mais tempo para maior precisão."
                : captureQuality === "baixa"
                  ? "Análise rápida em andamento."
                  : "Análise em andamento. Isso pode levar alguns instantes."
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphAnalyzer;
