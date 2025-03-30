
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { Camera, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

const CameraView = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const { setImageData, captureMode, setCaptureMode } = useAnalyzer();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      try {
        if (captureMode && !streamActive) {
          // Request camera access
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });

          // Set the stream to the video element
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStreamActive(true);
          }
        } else if (!captureMode && streamActive) {
          // Stop the camera stream
          if (videoRef.current && videoRef.current.srcObject) {
            const currentStream = videoRef.current.srcObject as MediaStream;
            currentStream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setStreamActive(false);
          }
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast.error("Camera access denied. Please allow camera access and try again.");
        setCaptureMode(false);
      }
    };

    setupCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [captureMode, streamActive, setCaptureMode]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageData = canvas.toDataURL("image/png");
        setImageData(imageData);
        toast.success("Image captured! Ready for analysis.");
        
        // Stop camera stream after capture
        setCaptureMode(false);
      }
    }
  };

  const resetCamera = () => {
    setImageData(null);
    setCaptureMode(true);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative overflow-hidden rounded-lg border border-trader-panel bg-trader-panel shadow-xl aspect-[4/3] flex items-center justify-center">
        {captureMode ? (
          <>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {!streamActive && (
                <div className="animate-pulse-slow text-trader-gray">
                  <Camera size={48} />
                  <p className="mt-2 text-sm">Initializing camera...</p>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button 
                onClick={captureImage} 
                variant="secondary"
                className="bg-trader-blue hover:bg-trader-blue/80 text-white"
                size="lg"
                disabled={!streamActive}
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetCamera}
                className="text-trader-gray hover:text-white hover:bg-trader-panel/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <RefreshCw 
                className="mb-2 text-trader-gray" 
                size={32} 
                onClick={resetCamera}
              />
              <p className="text-sm text-trader-gray">Tap to retake photo</p>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
