import React from "react";
import { ExtendedPatternResult, FibonacciLevel } from "@/utils/predictionUtils";
import { useAnalyzer } from "@/context/AnalyzerContext";

interface ChartOverlayProps {
  results: Record<string, ExtendedPatternResult>;
  showMarkers: boolean;
  imageRegion: { x: number; y: number; width: number; height: number } | null;
  processedImage: string | null;
  originalDimensions: { width: number; height: number } | null;
}

const ChartOverlay: React.FC<ChartOverlayProps> = ({ 
  results, 
  showMarkers, 
  imageRegion,
  processedImage,
  originalDimensions
}) => {
  const { precision, enableCircularAnalysis, candelPatternSensitivity } = useAnalyzer();
  
  // Don't render anything if markers are disabled
  if (!showMarkers) return null;
  
  const allMarkers = Object.values(results)
    .filter(result => result?.found && result.visualMarkers)
    .flatMap(result => result.visualMarkers || []);
  
  // If no markers found, don't render anything
  if (allMarkers.length === 0) return null;
  
  // Adjust the visual elements based on precision level
  const getStrokeWidth = (type: string) => {
    const baseWidth = type === "trendline" ? 3 : type === "pattern" ? 2.5 : type === "candle" ? 1.8 : 2;
    return precision === "alta" ? baseWidth * 1.5 : baseWidth;
  };

  const getFontSize = (baseSize: number) => {
    return precision === "alta" ? baseSize * 1.2 : baseSize;
  };

  // Map percentage coordinates to the correct positions within the selected region
  const adjustCoordinates = (x: number, y: number): [number, number] => {
    if (!imageRegion || !originalDimensions) return [x, y];
    
    // Convert percentage to pixels in original image
    const pixelX = (x / 100) * originalDimensions.width;
    const pixelY = (y / 100) * originalDimensions.height;
    
    // Calculate the position relative to the region
    const relX = (pixelX - imageRegion.x) / imageRegion.width * 100;
    const relY = (pixelY - imageRegion.y) / imageRegion.height * 100;
    
    // Ensure coordinates stay within bounds (0-100%)
    return [
      Math.max(0, Math.min(100, relX)),
      Math.max(0, Math.min(100, relY))
    ];
  };

  // Enhanced marker styling for better visibility
  const getMarkerStyle = (marker: any) => {
    const type = marker.type || "";
    
    // Specific styling for different marker types
    if (type === "candle" || type.includes("candle")) {
      return { filter: "url(#candle-highlight)" };
    } else if (type.includes("cycle") || type.includes("circular")) {
      return { filter: "url(#cycle-glow)" };
    } else if (precision === "alta") {
      return { filter: "url(#enhanced-glow)" };
    } else if (precision === "normal") {
      return { filter: "url(#glow)" };
    }
    return {};
  };

  // Renderizar candles individuais com alta precisão
  const renderCandleMarkers = () => {
    // Verificar se temos resultados de candles
    const candleResult = results.candlePatterns;
    if (!candleResult?.visualMarkers || candleResult.visualMarkers.length === 0) return null;
    
    // Filtrar marcadores que representam candles individuais
    const candleMarkers = candleResult.visualMarkers.filter(
      marker => marker.type === "pattern" || marker.type === "candle" || 
      (marker.label === "Bullish" || marker.label === "Bearish")
    );
    
    if (candleMarkers.length === 0) return null;
    
    // Get Fibonacci levels if available
    const fibLevels = results.fibonacci?.fibonacciLevels || [];
    const hasFibLevels = fibLevels.length > 0;
    
    return candleMarkers.map((marker, idx) => {
      // Usar os pontos para desenhar retângulos representando candles
      if (marker.points && marker.points.length >= 2) {
        const [[x1, y1], [x2, y2]] = marker.points.map(point => adjustCoordinates(point[0], point[1]));
        const isBullish = marker.label === "Bullish" || marker.label?.includes("Alta");
        const isBearish = marker.label === "Bearish" || marker.label?.includes("Baixa");
        const isDoji = marker.label?.includes("Doji");
        const isHammer = marker.label?.includes("Martelo") || marker.label?.includes("Hammer");
        const isEngulfing = marker.label?.includes("Engolfo") || marker.label?.includes("Engulfing");
        
        // Determine candle pattern type for specialized rendering
        const patternType = isDoji ? "doji" : 
                           isHammer ? "hammer" : 
                           isEngulfing ? "engulfing" : "regular";
        
        // Check if this candle is near any Fibonacci level
        let nearFibLevel = null;
        let distanceToFib = Infinity;
        
        if (hasFibLevels) {
          // Find the closest Fibonacci level to this candle
          fibLevels.forEach(level => {
            // Convert level price to y coordinate (rough estimate)
            const levelY = 100 - (level.level * 100); // Inverted because 0 is top in SVG
            const candleY = (y1 + y2) / 2;
            const distance = Math.abs(levelY - candleY);
            
            if (distance < distanceToFib && distance < 10) { // Only if within 10% of chart height
              distanceToFib = distance;
              nearFibLevel = level;
            }
          });
        }
        
        // Enhanced candle rendering with pattern recognition
        let fillColor = isBullish ? "#22c55e80" : isBearish ? "#ef444480" : "#a3a3a380";
        let strokeColor = isBullish ? "#22c55e" : isBearish ? "#ef4444" : "#a3a3a3";
        let strokeWidth = getStrokeWidth("candle");
        
        // Special coloring for recognized patterns
        if (isDoji) {
          fillColor = "#f59e0b80"; // amber for doji
          strokeColor = "#f59e0b";
        } else if (isHammer) {
          fillColor = isBullish ? "#10b98180" : "#f4346480"; // teal for bullish, rose for bearish
          strokeColor = isBullish ? "#10b981" : "#f43464";
        } else if (isEngulfing) {
          fillColor = isBullish ? "#3b82f680" : "#be185d80"; // blue for bullish, pink for bearish
          strokeColor = isBullish ? "#3b82f6" : "#be185d";
          strokeWidth *= 1.5; // Thicker for engulfing
        }
        
        // If candle is near a Fibonacci level, enhance its appearance
        if (nearFibLevel) {
          // Use different styling based on the type of Fibonacci level
          if (nearFibLevel.type === "support") {
            strokeWidth = getStrokeWidth("pattern") * 1.2;
            strokeColor = isBullish ? "#22c55e" : "#f97316"; // Orange for bearish at support (potential reversal)
            fillColor = isBullish ? "#22c55eA0" : "#f97316A0"; // More opaque
          } else if (nearFibLevel.type === "resistance") {
            strokeWidth = getStrokeWidth("pattern") * 1.2;
            strokeColor = isBullish ? "#f97316" : "#ef4444"; // Orange for bullish at resistance (potential reversal)
            fillColor = isBullish ? "#f97316A0" : "#ef4444A0"; // More opaque
          }
        }
        
        // Width calculation: thinner for doji, wider for engulfing
        const candleWidth = isDoji ? Math.abs(x2 - x1) * 0.6 : 
                           isEngulfing ? Math.abs(x2 - x1) * 1.2 : 
                           Math.abs(x2 - x1);
        
        // Calculate candle center for positioning
        const candleCenterX = (x1 + x2) / 2;
        const adjustedX = candleCenterX - (candleWidth / 2);
        
        return (
          <g key={`candle-${idx}`} style={nearFibLevel ? { filter: "url(#fibonacci-glow)" } : getMarkerStyle(marker)}>
            {/* Enhanced candle body with specific pattern rendering */}
            <rect
              x={`${adjustedX}%`}
              y={`${Math.min(y1, y2)}%`}
              width={`${candleWidth}%`}
              height={`${Math.abs(y2 - y1)}%`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              rx={isDoji ? "2" : "0"} // Rounded corners for doji
            />
            
            {/* Upper wick with variable length based on pattern */}
            <line
              x1={`${candleCenterX}%`}
              y1={`${Math.min(y1, y2) - (isHammer ? 4 : 2)}%`}
              x2={`${candleCenterX}%`}
              y2={`${Math.min(y1, y2)}%`}
              stroke={strokeColor}
              strokeWidth={strokeWidth * (isHammer ? 0.8 : 0.6)}
            />
            
            {/* Lower wick with variable length based on pattern */}
            <line
              x1={`${candleCenterX}%`}
              y1={`${Math.max(y1, y2)}%`}
              x2={`${candleCenterX}%`}
              y2={`${Math.max(y1, y2) + (isHammer ? 1.5 : 2)}%`}
              stroke={strokeColor}
              strokeWidth={strokeWidth * (isHammer ? 0.8 : 0.6)}
            />
            
            {/* Pattern indicator */}
            {(isDoji || isHammer || isEngulfing) && (
              <circle
                cx={`${candleCenterX}%`}
                cy={`${Math.min(y1, y2) - 6}%`}
                r="2.5"
                fill={strokeColor}
                stroke="white"
                strokeWidth="0.5"
              />
            )}
            
            {/* Pattern label for important candles */}
            {(isDoji || isHammer || isEngulfing) && precision === "alta" && (
              <text
                x={`${candleCenterX}%`}
                y={`${Math.min(y1, y2) - 9}%`}
                fill={strokeColor}
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none"
              >
                {isDoji ? "Doji" : isHammer ? "Hammer" : "Engulfing"}
              </text>
            )}
            
            {/* Special indicator for key reversal candles */}
            {marker.significance && marker.significance > 80 && (
              <path
                d={`M ${candleCenterX-3},${Math.min(y1, y2)-10} L ${candleCenterX},${Math.min(y1, y2)-14} L ${candleCenterX+3},${Math.min(y1, y2)-10} Z`}
                fill={isBullish ? "#22c55e" : "#ef4444"}
                stroke="white"
                strokeWidth="0.5"
              />
            )}
          </g>
        );
      }
      return null;
    });
  };

  // Nova função para renderizar padrões circulares
  const renderCircularPatterns = () => {
    if (!enableCircularAnalysis) return null;
    
    // Extract circular patterns from results, across different analysis types
    const circularPatterns = allMarkers.filter(marker => 
      marker.type === "cycle" || 
      marker.type === "circular" || 
      (marker.label && (
        marker.label.includes("Ciclo") || 
        marker.label.includes("Onda") ||
        marker.label.includes("Rotação")
      ))
    );
    
    if (circularPatterns.length === 0) return null;
    
    return circularPatterns.map((pattern, idx) => {
      if (pattern.points && pattern.points.length >= 3) {
        // For circular patterns, we use the points to define the circle
        const points = pattern.points.map(point => adjustCoordinates(point[0], point[1]));
        
        // Calculate center point and radius
        let sumX = 0, sumY = 0;
        points.forEach(([x, y]) => {
          sumX += x;
          sumY += y;
        });
        
        const centerX = sumX / points.length;
        const centerY = sumY / points.length;
        
        // Calculate average radius
        let radius = 0;
        points.forEach(([x, y]) => {
          const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          radius += dist;
        });
        radius = radius / points.length;
        
        // Get direction (clockwise/counterclockwise) and color accordingly
        const isClockwise = pattern.direction === "clockwise";
        const color = isClockwise ? "#8b5cf6" : "#ec4899"; // Purple for clockwise, pink for counterclockwise
        
        return (
          <g key={`circle-${idx}`} style={{ filter: "url(#cycle-glow)" }}>
            {/* Main circle outline */}
            <circle
              cx={`${centerX}%`}
              cy={`${centerY}%`}
              r={`${radius}%`}
              fill="none"
              stroke={color}
              strokeWidth={getStrokeWidth("pattern")}
              strokeDasharray={pattern.strength && pattern.strength < 70 ? "5,5" : undefined}
              strokeOpacity="0.7"
            />
            
            {/* Direction arrows along the circle */}
            {[0, 90, 180, 270].map((angle, i) => {
              const radian = angle * (Math.PI / 180);
              const arrowX = centerX + radius * Math.cos(radian);
              const arrowY = centerY + radius * Math.sin(radian);
              
              const arrowDirection = isClockwise ? 
                  (angle + 90) * (Math.PI / 180) : 
                  (angle - 90) * (Math.PI / 180);
              
              const arrowSize = 2;
              const arrowX1 = arrowX + arrowSize * Math.cos(arrowDirection - 0.5);
              const arrowY1 = arrowY + arrowSize * Math.sin(arrowDirection - 0.5);
              const arrowX2 = arrowX + arrowSize * Math.cos(arrowDirection + 0.5);
              const arrowY2 = arrowY + arrowSize * Math.sin(arrowDirection + 0.5);
              
              return (
                <polygon
                  key={`arrow-${i}`}
                  points={`${arrowX}%,${arrowY}%, ${arrowX1}%,${arrowY1}%, ${arrowX2}%,${arrowY2}%`}
                  fill={color}
                  strokeWidth="0"
                />
              );
            })}
            
            {/* Pattern label */}
            <text
              x={`${centerX}%`}
              y={`${centerY - radius - 5}%`}
              fill={color}
              fontSize={getFontSize(11)}
              fontWeight="bold"
              textAnchor="middle"
              className="select-none"
            >
              {pattern.label || (isClockwise ? "Ciclo Horário" : "Ciclo Anti-horário")}
            </text>
            
            {/* Strength indicator */}
            {pattern.strength && (
              <text
                x={`${centerX}%`}
                y={`${centerY - radius - 2}%`}
                fill={color}
                fontSize={getFontSize(9)}
                textAnchor="middle"
                className="select-none"
              >
                {Math.round(pattern.strength)}%
              </text>
            )}
          </g>
        );
      }
      return null;
    });
  };

  // Renderizar níveis de Fibonacci com maior destaque
  const renderFibonacciLevels = () => {
    // Verificar se temos resultados de Fibonacci com níveis
    const fibResult = results.fibonacci;
    if (!fibResult?.found || !fibResult.fibonacciLevels || fibResult.fibonacciLevels.length === 0) return null;
    
    const levels = fibResult.fibonacciLevels;
    
    return levels.map((level, idx) => {
      // Estimar posição da linha horizontal baseada no nível
      // Nota: Isso é uma estimativa, idealmente precisaríamos de coordenadas reais
      // Mas para um visual estimado, podemos usar o nível relativo (0-1) na tela
      const y = 100 - (level.level * 100); // Inverte porque em SVG 0 é topo
      
      // Determinar cor baseada no tipo e toques
      let color;
      if (level.type === "support") {
        color = level.touched ? "#22c55e" : level.broken ? "#9ca3af" : "#4ade80";
      } else if (level.type === "resistance") {
        color = level.touched ? "#ef4444" : level.broken ? "#9ca3af" : "#f87171";
      } else {
        color = "#60a5fa";
      }
      
      // Largura da linha baseada na força
      const strokeWidth = (level.strength / 100 * 2) + 1;
      
      // Estilo de linha baseado em toques e quebras
      const strokeDasharray = level.broken ? "3,3" : level.touched ? undefined : "5,3";
      
      // Texto do nível (ex: "0.618 - Suporte")
      const levelText = `${level.level.toFixed(3)} - ${level.type === "support" ? "Suporte" : 
                          level.type === "resistance" ? "Resistência" : "Neutro"}`;
      
      // Preço formatado
      const priceText = `${level.price.toFixed(2)}`;
      
      // Marcador especial para níveis tocados recentemente
      const showTouchMarker = level.touched && !level.broken;
      
      return (
        <g key={`fib-${idx}`} style={{ filter: "url(#fibonacci-glow)" }}>
          {/* Linha horizontal do nível */}
          <line
            x1="0%"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            opacity={0.8}
          />
          
          {/* Background para o texto */}
          <rect
            x="0.5%"
            y={`${y - 3}%`}
            width="auto"
            height="18"
            rx="3"
            fill="rgba(0,0,0,0.7)"
            className="text-box"
          />
          
          {/* Texto do nível */}
          <text
            x="1.5%"
            y={`${y + 0.5}%`}
            fill={color}
            fontSize={precision === "alta" ? "12" : "10"}
            fontWeight="bold"
            textAnchor="start"
            dominantBaseline="middle"
            className="select-none"
          >
            {levelText} ({level.strength}%)
          </text>
          
          {/* Texto de preço do outro lado */}
          <text
            x="98.5%"
            y={`${y + 0.5}%`}
            fill={color}
            fontSize={precision === "alta" ? "12" : "10"}
            fontWeight="bold"
            textAnchor="end"
            dominantBaseline="middle"
            className="select-none"
          >
            {priceText}
          </text>
          
          {/* Marcador especial para níveis tocados recentemente */}
          {showTouchMarker && (
            <circle
              cx="95%"
              cy={`${y}%`}
              r="4"
              fill={level.type === "support" ? "#22c55e" : "#ef4444"}
              stroke="white"
              strokeWidth="1"
            />
          )}
        </g>
      );
    });
  };

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Enhanced glow filter for alta precision */}
        <filter id="enhanced-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feComponentTransfer in="coloredBlur">
            <feFuncA type="linear" slope="2"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Outline filter for better visibility */}
        <filter id="outline">
          <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="thicken" />
          <feFlood flood-color="black" result="outlineColor" />
          <feComposite in="outlineColor" in2="thicken" operator="in" result="outline" />
          <feComposite in="SourceGraphic" in2="outline" operator="over" />
        </filter>
        
        {/* Candle highlight filter */}
        <filter id="candle-highlight">
          <feGaussianBlur stdDeviation="1.2" result="blur"/>
          <feComponentTransfer in="blur">
            <feFuncA type="linear" slope="1.8"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Filtro especial para padrões circulares */}
        <filter id="cycle-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feComponentTransfer in="coloredBlur">
            <feFuncA type="linear" slope="3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Filtro especial para níveis de Fibonacci */}
        <filter id="fibonacci-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feComponentTransfer in="coloredBlur">
            <feFuncA type="linear" slope="2.5"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Draw selected region outline if we have a region */}
      {imageRegion && (
        <rect
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeDasharray="5,5"
          className="pointer-events-none"
          style={{ filter: "url(#glow)" }}
        />
      )}
      
      {/* Renderizar níveis de Fibonacci primeiro (background) */}
      {renderFibonacciLevels()}
      
      {/* Render circular patterns as background elements */}
      {renderCircularPatterns()}
      
      {/* Renderizar candles individuais por cima dos níveis */}
      {renderCandleMarkers()}
      
      {/* Draw all markers from analysis results */}
      {allMarkers.map((marker, idx) => {
        // Render different marker types based on their properties
        if (marker.points && marker.points.length >= 2) {
          const isLine = ["trendline", "support", "resistance"].includes(marker.type);
          
          if (isLine) {
            const [[x1, y1], [x2, y2]] = marker.points.map(point => adjustCoordinates(point[0], point[1]));
            return (
              <g key={idx} style={getMarkerStyle(marker)}>
                <line
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke={marker.color}
                  strokeWidth={getStrokeWidth(marker.type)}
                  strokeDasharray={marker.type === "support" ? "5,3" : marker.type === "resistance" ? "3,3" : undefined}
                />
                {marker.label && (
                  <text
                    x={`${x2 + 1}%`}
                    y={`${y2 + 3}%`}
                    fill={marker.color}
                    fontSize={getFontSize(11)}
                    fontWeight="bold"
                    textAnchor="start"
                    className="select-none"
                    style={{ filter: "url(#outline)" }}
                  >
                    {marker.label} {marker.strength ? `(${marker.strength})` : ""}
                  </text>
                )}
              </g>
            );
          }
          
          // For indicators like Fibonacci levels
          if (marker.type === "indicator") {
            // Fixed: Check for Fibonacci in the label instead of using marker.name
            const isFibonacci = marker.label && marker.label.toLowerCase().includes("fib");
            
            if (isFibonacci && marker.points.length > 1) {
              const adjustedPoints = marker.points.map(point => adjustCoordinates(point[0], point[1]));
              
              // Create the polyline points string with adjusted coordinates
              const pointsString = adjustedPoints
                .map(([x, y]) => `${x},${y}`)
                .join(" ");
              
              const [lastX, lastY] = adjustedPoints[adjustedPoints.length - 1];
              
              return (
                <g key={idx} style={getMarkerStyle(marker)}>
                  <polyline
                    points={pointsString}
                    fill="none"
                    stroke={marker.color}
                    strokeWidth={getStrokeWidth("indicator")}
                  />
                  {marker.label && (
                    <text
                      x={`${lastX + 1}%`}
                      y={`${lastY + 3}%`}
                      fill={marker.color}
                      fontSize={getFontSize(10)}
                      fontWeight="bold"
                      textAnchor="start"
                      className="select-none"
                    >
                      {marker.label} {marker.strength ? `(${marker.strength})` : ""}
                    </text>
                  )}
                </g>
              );
            } else {
              // Standard indicator rendering for other types
              const pointsString = marker.points
                .map(point => {
                  const [x, y] = adjustCoordinates(point[0], point[1]);
                  return `${x},${y}`;
                })
                .join(" ");
              
              const [lastX, lastY] = adjustCoordinates(
                marker.points[marker.points.length - 1][0], 
                marker.points[marker.points.length - 1][1]
              );
              
              return (
                <g key={idx} style={getMarkerStyle(marker)}>
                  <polyline
                    points={pointsString}
                    fill="none"
                    stroke={marker.color}
                    strokeWidth={getStrokeWidth("indicator")}
                  />
                  {marker.label && (
                    <text
                      x={`${lastX + 1}%`}
                      y={`${lastY + 3}%`}
                      fill={marker.color}
                      fontSize={getFontSize(10)}
                      fontWeight="bold"
                      textAnchor="start"
                      className="select-none"
                    >
                      {marker.label} {marker.strength ? `(${marker.strength})` : ""}
                    </text>
                  )}
                </g>
              );
            }
          }
          
          // For pattern markers
          if (marker.type === "pattern") {
            // Skip individual candles, they're rendered separately
            if (marker.label === "Bullish" || marker.label === "Bearish") {
              return null;
            }
            
            const [[x1, y1], [x2, y2]] = marker.points.map(point => adjustCoordinates(point[0], point[1]));
            const centerX = (x1 + x2) * 0.5;
            const centerY = (y1 + y2) * 0.5;
            
            return (
              <g key={idx} style={getMarkerStyle(marker)}>
                <circle
                  cx={`${centerX}%`}
                  cy={`${centerY}%`}
                  r="6"
                  fill={`${marker.color}33`}
                  stroke={marker.color}
                  strokeWidth={getStrokeWidth("pattern")}
                />
                {marker.label && (
                  <text
                    x={`${centerX}%`}
                    y={`${centerY - 8}%`}
                    fill={marker.color}
                    fontSize={getFontSize(11)}
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {marker.label}
                  </text>
                )}
                {marker.strength && (
                  <text
                    x={`${centerX}%`}
                    y={`${centerY - 4}%`}
                    fill={marker.color}
                    fontSize={getFontSize(9)}
                    textAnchor="middle"
                    className="select-none"
                  >
                    {marker.strength}
                  </text>
                )}
              </g>
            );
          }
          
          // For zone areas like support/resistance zones
          if (marker.type === "zone" && marker.points.length >= 4) {
            const adjustedPoints = marker.points.map(point => adjustCoordinates(point[0], point[1]));
            const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = adjustedPoints;
            
            return (
              <g key={idx} style={getMarkerStyle(marker)}>
                <polygon
                  points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
                  fill={`${marker.color}33`}
                  stroke={marker.color}
                  strokeWidth={getStrokeWidth("zone")}
                />
                {marker.label && (
                  <text
                    x={`${(x1 + x3) * 0.5}%`}
                    y={`${(y1 + y3) * 0.5}%`}
                    fill={marker.color}
                    fontSize={getFontSize(10)}
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {marker.label}
                  </text>
                )}
              </g>
            );
          }
        }
        
        return null;
      })}
    </svg>
  );
};

export default ChartOverlay;
