
import React, { useEffect } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import CameraView from "./CameraView";
import ControlPanel from "./ControlPanel";
import ResultsOverlay from "./ResultsOverlay";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const GraphAnalyzer = () => {
  const { imageData, isAnalyzing, setCaptureMode } = useAnalyzer();
  const [cameraSupported, setCameraSupported] = React.useState<boolean | null>(null);

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
          await navigator.mediaDevices.getUserMedia({ video: true });
          console.log("Camera permission granted");
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
            <p className="text-sm text-trader-gray mt-2">Isso pode levar alguns instantes</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphAnalyzer;
