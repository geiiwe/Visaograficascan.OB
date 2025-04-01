
import React, { useRef, useState, useEffect } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { Button } from "@/components/ui/button";
import { Crop, Check, X } from "lucide-react";
import { toast } from "sonner";

const ChartRegionSelector = () => {
  const { 
    imageData, 
    selectionMode, 
    setSelectionMode, 
    setChartRegion,
    chartRegion
  } = useAnalyzer();
  
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  
  // Initialize the canvas when selection mode is activated
  useEffect(() => {
    if (!selectionMode || !imageData || !canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    // Set canvas dimensions to match the image
    canvas.width = image.width;
    canvas.height = image.height;
    
    // If there's already a chartRegion, draw it
    if (chartRegion) {
      drawSelectionBox(
        chartRegion.x, 
        chartRegion.y, 
        chartRegion.width, 
        chartRegion.height
      );
    }
  }, [selectionMode, imageData, chartRegion]);
  
  const drawSelectionBox = (x: number, y: number, width: number, height: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw semi-transparent overlay for the entire canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear the selection rectangle to show the image below
    ctx.clearRect(x, y, width, height);
    
    // Draw selection rectangle border
    ctx.strokeStyle = '#00aeff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(x, y, width, height);
    
    // Draw handles at corners
    const handleSize = 8;
    ctx.fillStyle = '#00aeff';
    ctx.setLineDash([]);
    
    // Top-left handle
    ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
    // Top-right handle
    ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
    // Bottom-left handle
    ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    // Bottom-right handle
    ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setStartPoint({ x, y });
    setCurrentPoint({ x, y });
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setCurrentPoint({ x, y });
    
    // Calculate selection rectangle dimensions
    const selX = Math.min(startPoint.x, x);
    const selY = Math.min(startPoint.y, y);
    const selWidth = Math.abs(x - startPoint.x);
    const selHeight = Math.abs(y - startPoint.y);
    
    // Draw the selection rectangle
    drawSelectionBox(selX, selY, selWidth, selHeight);
  };
  
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Calculate final selection rectangle
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);
    
    // Only update if the selection has some size
    if (width > 10 && height > 10) {
      setChartRegion({ x, y, width, height });
    }
  };
  
  const confirmSelection = () => {
    if (chartRegion) {
      toast.success("Região do gráfico selecionada para análise");
      setSelectionMode(false);
    } else {
      toast.error("Por favor, selecione uma região do gráfico primeiro");
    }
  };
  
  const cancelSelection = () => {
    setSelectionMode(false);
    if (!chartRegion) {
      // If there wasn't already a selection, clear any partial selection
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };
  
  if (!selectionMode || !imageData) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Hidden image to get dimensions */}
      <img 
        ref={imageRef}
        src={imageData}
        alt="Imagem original"
        className="hidden"
      />
      
      {/* Selection canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-20 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Selection controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-30">
        <Button
          onClick={confirmSelection}
          variant="secondary"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="mr-2 h-4 w-4" />
          Confirmar
        </Button>
        <Button
          onClick={cancelSelection}
          variant="secondary"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </div>
      
      {/* Instructions overlay */}
      <div className="absolute top-4 left-0 right-0 flex justify-center z-30">
        <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm">
          Selecione a região do gráfico para análise
        </div>
      </div>
    </div>
  );
};

export default ChartRegionSelector;
