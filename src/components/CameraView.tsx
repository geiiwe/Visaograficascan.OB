
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { Camera, RefreshCw, X, ZoomIn, ZoomOut, FlipHorizontal, Settings } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const CameraView = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { setImageData, captureMode, setCaptureMode, precision } = useAnalyzer();
  const isMobile = useIsMobile();
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [videoConstraints, setVideoConstraints] = useState({
    width: { ideal: isMobile ? 1280 : 1920 },
    height: { ideal: isMobile ? 720 : 1080 },
    facingMode: isMobile ? "environment" : "user"
  });

  // List available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.error("enumerateDevices() not supported.");
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(cameras);
        
        // Set the default camera (usually back camera on mobile)
        if (cameras.length > 0) {
          // On mobile, prefer the environment-facing camera
          if (isMobile) {
            // Try to find back camera
            const backCamera = cameras.find(camera => 
              camera.label.toLowerCase().includes('back') || 
              camera.label.toLowerCase().includes('traseira') ||
              camera.label.toLowerCase().includes('rear')
            );
            if (backCamera) {
              setSelectedCamera(backCamera.deviceId);
            } else {
              setSelectedCamera(cameras[0].deviceId);
            }
          } else {
            setSelectedCamera(cameras[0].deviceId);
          }
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };

    getCameras();
  }, [isMobile]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      if (!captureMode) {
        return;
      }

      try {
        // Stop any existing streams first
        if (videoRef.current && videoRef.current.srcObject) {
          const currentStream = videoRef.current.srcObject as MediaStream;
          currentStream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }

        setCameraError(null);
        setStreamActive(false);
        setCameraLoading(true);
        console.log("Requesting camera access...", isMobile ? "mobile" : "desktop");
        
        // Request camera access with appropriate constraints
        const constraints: MediaStreamConstraints = {
          video: {
            ...videoConstraints,
            deviceId: selectedCamera ? { exact: selectedCamera } : undefined
          },
          audio: false,
        };
        
        console.log("Using constraints:", constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Camera access granted:", stream.active);

        if (!stream.active) {
          throw new Error("Camera stream is not active");
        }

        // Set the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.setAttribute("playsinline", "true");
          
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  console.log("Video playback started");
                  setStreamActive(true);
                  setCameraLoading(false);
                })
                .catch(err => {
                  console.error("Error starting video playback:", err);
                  setCameraError("Could not start video playback");
                  setCameraLoading(false);
                  toast.error("Could not start video playback");
                });
            }
          };
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        let errorMessage = "Error accessing camera. ";
        
        if (isMobile) {
          errorMessage += "Please make sure camera permissions are granted in your browser settings.";
        } else {
          errorMessage += "Please allow camera access and try again.";
        }
        
        setCameraError(errorMessage);
        setCameraLoading(false);
        toast.error(errorMessage);
        setCaptureMode(false);
      }
    };

    setupCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [captureMode, setCaptureMode, isMobile, selectedCamera, videoConstraints]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Apply zoom if needed (using clipping)
        if (zoom > 1) {
          const zoomOffsetX = (canvas.width - canvas.width / zoom) / 2;
          const zoomOffsetY = (canvas.height - canvas.height / zoom) / 2;
          
          ctx.drawImage(
            video, 
            zoomOffsetX, zoomOffsetY,  // Source position
            canvas.width / zoom, canvas.height / zoom,  // Source size
            0, 0,  // Destination position
            canvas.width, canvas.height  // Destination size
          );
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        
        // Apply high-quality processing for precise mode
        if (precision === "alta") {
          // Apply sharpening
          applySharpening(ctx, canvas.width, canvas.height);
          
          // Apply contrast enhancement
          applyContrastEnhancement(ctx, canvas.width, canvas.height, 1.2);
        }
        
        // Convert canvas to data URL with appropriate quality
        const imageQuality = precision === "alta" ? 1.0 : precision === "normal" ? 0.9 : 0.85;
        const imageData = canvas.toDataURL("image/png", imageQuality);
        
        setImageData(imageData);
        toast.success("Imagem capturada! Pronta para análise.");
        
        // Stop camera stream after capture
        setCaptureMode(false);
      }
    }
  };
  
  const applySharpening = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const dataBackup = new Uint8ClampedArray(data);
    
    // Simple sharpening kernel
    for (let y = 1; y < height-1; y++) {
      for (let x = 1; x < width-1; x++) {
        const offset = (y * width + x) * 4;
        
        // Apply a simple convolution kernel for each color channel
        for (let c = 0; c < 3; c++) {
          const currentVal = dataBackup[offset + c];
          const neighbors = [
            dataBackup[((y-1) * width + x) * 4 + c],     // top
            dataBackup[(y * width + (x-1)) * 4 + c],     // left
            dataBackup[(y * width + (x+1)) * 4 + c],     // right
            dataBackup[((y+1) * width + x) * 4 + c]      // bottom
          ];
          
          // Kernel: -1 for neighbors, 5 for center (increases contrast at edges)
          const sharpened = 5 * currentVal - neighbors.reduce((a, b) => a + b, 0);
          
          // Clamp to valid range
          data[offset + c] = Math.max(0, Math.min(255, sharpened));
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };
  
  const applyContrastEnhancement = (ctx: CanvasRenderingContext2D, width: number, height: number, factor: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply contrast enhancement
    const contrastFactor = (259 * (factor * 100 + 255)) / (255 * (259 - factor * 100));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, Math.floor(contrastFactor * (data[i] - 128) + 128)));     // R
      data[i + 1] = Math.max(0, Math.min(255, Math.floor(contrastFactor * (data[i + 1] - 128) + 128)));   // G
      data[i + 2] = Math.max(0, Math.min(255, Math.floor(contrastFactor * (data[i + 2] - 128) + 128)));   // B
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const resetCamera = () => {
    setImageData(null);
    setCaptureMode(true);
  };
  
  const switchCamera = () => {
    if (availableCameras.length <= 1) return;
    
    const currentIndex = availableCameras.findIndex(cam => cam.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    setSelectedCamera(availableCameras[nextIndex].deviceId);
    
    toast.info("Alternando câmera...");
  };
  
  const toggleHighResolution = () => {
    const isHighRes = videoConstraints.width.ideal === 1920;
    
    setVideoConstraints({
      ...videoConstraints,
      width: { ideal: isHighRes ? 1280 : 1920 },
      height: { ideal: isHighRes ? 720 : 1080 }
    });
    
    toast.info(isHighRes ? 
      "Resolução padrão ativada" : 
      "Alta resolução ativada para melhor precisão"
    );
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
              muted
              className={`w-full h-full object-cover ${zoom > 1 ? 'scale-' + (zoom * 100) : ''}`}
              style={{ 
                transform: zoom > 1 ? `scale(${zoom})` : 'none',
                transformOrigin: 'center'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {!streamActive && (
                <div className="animate-pulse-slow text-trader-gray text-center px-4">
                  {cameraError ? (
                    <>
                      <Camera size={48} className="mx-auto mb-2 text-red-400" />
                      <p className="text-sm text-red-400">{cameraError}</p>
                    </>
                  ) : (
                    <>
                      <Camera size={48} className="mx-auto" />
                      <p className="mt-2 text-sm">
                        {cameraLoading ? "Inicializando câmera..." : "Aguardando câmera..."}
                      </p>
                    </>
                  )}
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
                {precision === "alta" ? "Capturar em HD" : "Capturar"}
              </Button>
            </div>
            
            {/* Camera controls */}
            {streamActive && (
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                {availableCameras.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={switchCamera}
                    className="bg-black/30 text-white hover:bg-black/50 hover:text-white"
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleHighResolution}
                  className="bg-black/30 text-white hover:bg-black/50 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
                  className="bg-black/30 text-white hover:bg-black/50 hover:text-white"
                  disabled={zoom >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(Math.max(zoom - 0.1, 1))}
                  className="bg-black/30 text-white hover:bg-black/50 hover:text-white"
                  disabled={zoom <= 1}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Camera resolution indicator */}
            {streamActive && precision === "alta" && (
              <div className="absolute top-2 left-2 bg-black/30 text-white text-xs px-2 py-1 rounded">
                {videoRef.current?.videoWidth || "-"}×{videoRef.current?.videoHeight || "-"}
                {zoom > 1 && ` (${Math.round(zoom * 100)}%)`}
              </div>
            )}
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
              <p className="text-sm text-trader-gray">Toque para tirar outra foto</p>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
