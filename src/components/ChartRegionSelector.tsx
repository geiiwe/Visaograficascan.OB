
import React, { useRef, useState, useEffect } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { Button } from "@/components/ui/button";
import { Crop, Check, X, ZoomIn, ZoomOut, Maximize, Crosshair } from "lucide-react";
import { toast } from "sonner";

const ChartRegionSelector = () => {
  const { 
    imageData, 
    selectionMode, 
    setSelectionMode, 
    setChartRegion,
    chartRegion,
    precision
  } = useAnalyzer();
  
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGridLines, setShowGridLines] = useState(false);
  
  // Handle window resize to adjust canvas size
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && imageRef.current && canvasRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const canvas = canvasRef.current;
        
        // Set canvas size to match container
        canvas.width = containerRect.width;
        canvas.height = containerRect.height;
        
        setCanvasSize({
          width: canvas.width,
          height: canvas.height
        });
        
        // Redraw the selection if it exists
        if (chartRegion) {
          const scaleX = canvas.width / imageRef.current.naturalWidth;
          const scaleY = canvas.height / imageRef.current.naturalHeight;
          
          drawSelectionBox(
            chartRegion.x * scaleX, 
            chartRegion.y * scaleY, 
            chartRegion.width * scaleX, 
            chartRegion.height * scaleY
          );
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartRegion]);
  
  // Initialize the canvas when selection mode is activated
  useEffect(() => {
    if (!selectionMode || !imageData) return;
    
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match the container
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;
      
      setCanvasSize({
        width: canvas.width,
        height: canvas.height
      });
      
      // If there's already a chartRegion, draw it
      if (chartRegion) {
        const scaleX = canvas.width / img.naturalWidth;
        const scaleY = canvas.height / img.naturalHeight;
        
        drawSelectionBox(
          chartRegion.x * scaleX, 
          chartRegion.y * scaleY, 
          chartRegion.width * scaleX, 
          chartRegion.height * scaleY
        );
      } else {
        // Clear the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw semi-transparent overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw guide lines if enabled
          if (showGridLines) {
            drawGridLines(ctx, canvas.width, canvas.height);
          }
        }
      }
      
      // Store a reference to the image for later use
      imageRef.current = img;
    };
  }, [selectionMode, imageData, chartRegion, showGridLines]);
  
  // Draw grid lines for better alignment
  const drawGridLines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += width / 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += height / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };
  
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
    
    // Draw guide lines if enabled
    if (showGridLines) {
      drawGridLines(ctx, canvas.width, canvas.height);
    }
    
    // Clear the selection rectangle to show the image below
    ctx.clearRect(x, y, width, height);
    
    // Draw selection rectangle border
    ctx.strokeStyle = '#00aeff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(x, y, width, height);
    
    // Draw aspect ratio guide
    const aspectRatio = width / height;
    ctx.fillStyle = 'rgba(0, 174, 255, 0.3)';
    ctx.fillText(`${width.toFixed(0)}×${height.toFixed(0)} (${aspectRatio.toFixed(2)})`, x + 5, y + 15);
    
    // Draw crosshair at center of selection
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = 1;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(x, centerY);
    ctx.lineTo(x + width, centerY);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(centerX, y + height);
    ctx.stroke();
    
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
    
    // Middle handles for finer control
    // Top middle
    ctx.fillRect(x + width/2 - handleSize/2, y - handleSize/2, handleSize, handleSize);
    // Bottom middle
    ctx.fillRect(x + width/2 - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    // Left middle
    ctx.fillRect(x - handleSize/2, y + height/2 - handleSize/2, handleSize, handleSize);
    // Right middle
    ctx.fillRect(x + width - handleSize/2, y + height/2 - handleSize/2, handleSize, handleSize);
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPoint({ x, y });
    setCurrentPoint({ x, y });
    setIsDragging(true);
    
    // Draw initial point
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw guide lines if enabled
      if (showGridLines) {
        drawGridLines(ctx, canvas.width, canvas.height);
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
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
    if (!isDragging || !canvasRef.current || !imageRef.current) return;
    
    setIsDragging(false);
    
    // Calculate final selection rectangle
    const canvas = canvasRef.current;
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);
    
    // Only update if the selection has some size
    if (width > 10 && height > 10) {
      // Convert canvas coordinates to original image coordinates
      const img = imageRef.current;
      const scaleX = img.naturalWidth / canvas.width;
      const scaleY = img.naturalHeight / canvas.height;
      
      setChartRegion({
        x: Math.round(x * scaleX),
        y: Math.round(y * scaleY),
        width: Math.round(width * scaleX),
        height: Math.round(height * scaleY)
      });
      
      // Provide guidance based on selection size and precision level
      const aspectRatio = width / height;
      if (aspectRatio > 2.5 || aspectRatio < 0.5) {
        toast.warning("Proporção não ideal. Tente uma seleção mais balanceada.");
      } else if (width < 100 || height < 100) {
        toast.warning("Seleção muito pequena. Aumente para melhor precisão.");
      } else {
        toast.success("Região selecionada! Clique em 'Confirmar' para analisar.");
      }
    } else {
      toast.info("Selecione uma área maior arrastando o mouse.");
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
  
  const toggleGridLines = () => {
    setShowGridLines(!showGridLines);
    
    // Redraw the canvas with or without grid lines
    if (canvasRef.current && chartRegion) {
      const canvas = canvasRef.current;
      const scaleX = canvas.width / (imageRef.current?.naturalWidth || 1);
      const scaleY = canvas.height / (imageRef.current?.naturalHeight || 1);
      
      drawSelectionBox(
        chartRegion.x * scaleX, 
        chartRegion.y * scaleY, 
        chartRegion.width * scaleX, 
        chartRegion.height * scaleY
      );
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || e.touches.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setStartPoint({ x, y });
    setCurrentPoint({ x, y });
    setIsDragging(true);
    
    // Draw initial point
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw guide lines if enabled
      if (showGridLines) {
        drawGridLines(ctx, canvas.width, canvas.height);
      }
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || e.touches.length === 0) return;
    
    // Prevent scrolling while dragging
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setCurrentPoint({ x, y });
    
    // Calculate selection rectangle dimensions
    const selX = Math.min(startPoint.x, x);
    const selY = Math.min(startPoint.y, y);
    const selWidth = Math.abs(x - startPoint.x);
    const selHeight = Math.abs(y - startPoint.y);
    
    // Draw the selection rectangle
    drawSelectionBox(selX, selY, selWidth, selHeight);
  };
  
  const handleTouchEnd = () => {
    handleMouseUp(); // Reuse the same logic as mouseUp
  };
  
  // Use maximum precision mode from analyzer context
  const isPreciseMode = precision === "alta";
  
  if (!selectionMode || !imageData) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col" ref={containerRef}>
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
        className="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
      
      {/* Advanced selection tools */}
      <div className="absolute top-16 left-0 right-0 flex justify-center gap-2 z-30">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleGridLines}
          className={`bg-black/50 hover:bg-black/70 text-white ${showGridLines ? 'border border-blue-400' : ''}`}
        >
          <Crosshair className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setZoomLevel(Math.min(zoomLevel + 0.25, 2))}
          className="bg-black/50 hover:bg-black/70 text-white"
          disabled={zoomLevel >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setZoomLevel(Math.max(zoomLevel - 0.25, 1))}
          className="bg-black/50 hover:bg-black/70 text-white"
          disabled={zoomLevel <= 1}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setZoomLevel(1)}
          className="bg-black/50 hover:bg-black/70 text-white"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Instructions overlay */}
      <div className="absolute top-4 left-0 right-0 flex justify-center z-30">
        <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
          <Crop className="h-4 w-4" />
          {isPreciseMode ? 
            "Selecione com precisão a área do gráfico de velas" : 
            "Toque e arraste para selecionar a região do gráfico"}
        </div>
      </div>
    </div>
  );
};

export default ChartRegionSelector;
