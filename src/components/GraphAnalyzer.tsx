
import React, { useEffect } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import CameraView from "./CameraView";
import ControlPanel from "./ControlPanel";
import ResultsOverlay from "./ResultsOverlay";
import { toast } from "sonner";

const GraphAnalyzer = () => {
  const { imageData, isAnalyzing, setCaptureMode } = useAnalyzer();

  useEffect(() => {
    // Check if the device has camera capabilities
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Camera access is not supported in this browser or device");
      return;
    }

    // Try to get permission for camera on component mount
    const requestCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("Camera permission granted");
      } catch (error) {
        console.error("Error requesting camera permission:", error);
        toast.error("Please allow camera access to use this app");
        setCaptureMode(false);
      }
    };

    requestCameraPermission();
  }, [setCaptureMode]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="relative">
        <CameraView />
        {imageData && (
          <div className="relative mt-4 rounded-lg overflow-hidden shadow-xl">
            <img 
              src={imageData} 
              alt="Captured Chart" 
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
            <p className="mt-4 text-white font-medium">Analyzing chart patterns...</p>
            <p className="text-sm text-trader-gray mt-2">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphAnalyzer;
