import React from "react";
import { PatternResult } from "@/utils/patternDetection";
import { useAnalyzer } from "@/context/AnalyzerContext";

interface ChartOverlayProps {
  results: Record<string, PatternResult>;
  showMarkers: boolean;
  imageRegion: { x: number; y: number; width: number; height: number } | null;
  processedImage: string | null;
}

const ChartOverlay: React.FC<ChartOverlayProps> = ({ 
  results, 
  showMarkers, 
  imageRegion,
  processedImage
}) => {
  const { precision } = useAnalyzer();
  
  // Don't render anything if markers are disabled
  if (!showMarkers) return null;
  
  const allMarkers = Object.values(results)
    .filter(result => result?.found && result.visualMarkers)
    .flatMap(result => result.visualMarkers || []);
  
  // If no markers found, don't render anything
  if (allMarkers.length === 0) return null;
  
  // Adjust the visual elements based on precision level
  const getStrokeWidth = (type: string) => {
    const baseWidth = type === "trendline" ? 2 : type === "pattern" ? 1.5 : 1;
    return precision === "alta" ? baseWidth * 1.2 : baseWidth;
  };

  const getFontSize = (baseSize: number) => {
    return precision === "alta" ? baseSize * 1.1 : baseSize;
  };

  // Map percentage coordinates to the correct positions within the selected region
  const adjustCoordinates = (x: number, y: number): [number, number] => {
    if (!imageRegion) return [x, y];
    
    // The markers are already in percentage coordinates (0-100%)
    // Keep them in percentage coordinates within the visible area
    return [x, y];
  };

  // Enhance marker styling based on precision level
  const getMarkerStyle = (marker: any) => {
    if (precision === "alta") {
      return { filter: "url(#enhanced-glow)" };
    } else if (precision === "normal") {
      return { filter: "url(#glow)" };
    }
    return {};
  };

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Enhanced glow filter for alta precision */}
        <filter id="enhanced-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feComponentTransfer in="coloredBlur">
            <feFuncA type="linear" slope="1.5"/>
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
          strokeWidth="2"
          strokeDasharray="5,3"
          className="pointer-events-none"
        />
      )}
      
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
          
          // For indicators like Fibonacci levels
          if (marker.type === "indicator" && marker.points.length > 1) {
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
          
          // For pattern markers
          if (marker.type === "pattern") {
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
