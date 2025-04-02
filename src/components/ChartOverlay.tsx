
import React from "react";
import { PatternResult } from "@/utils/patternDetection";
import { useAnalyzer } from "@/context/AnalyzerContext";

interface ChartOverlayProps {
  results: Record<string, PatternResult>;
  showMarkers: boolean;
}

const ChartOverlay: React.FC<ChartOverlayProps> = ({ results, showMarkers }) => {
  const { precision, chartRegion } = useAnalyzer();
  
  // Don't render anything if markers are disabled
  if (!showMarkers) return null;
  
  const allMarkers = Object.values(results)
    .filter(result => result?.found && result.visualMarkers)
    .flatMap(result => result.visualMarkers || []);
  
  // Adjust the visual elements based on precision level
  const getStrokeWidth = (type: string) => {
    const baseWidth = type === "trendline" ? 2 : type === "pattern" ? 1.5 : 1;
    return precision === "alta" ? baseWidth * 0.8 : baseWidth;
  };

  const getFontSize = (baseSize: number) => {
    return precision === "alta" ? baseSize * 0.9 : baseSize;
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
      </defs>
      
      {/* Draw all markers from analysis results */}
      {allMarkers.map((marker, idx) => {
        // Render different marker types based on their properties
        if (marker.points && marker.points.length >= 2) {
          const isLine = ["trendline", "support", "resistance"].includes(marker.type);
          
          if (isLine) {
            const [[x1, y1], [x2, y2]] = marker.points;
            return (
              <g key={idx} style={{ filter: precision === "alta" ? "url(#glow)" : undefined }}>
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
                    fontSize={getFontSize(9)}
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
          if (marker.type === "indicator" && marker.points.length > 2) {
            const pointsString = marker.points
              .map(([x, y]) => `${x},${y}`)
              .join(" ");
            
            return (
              <g key={idx} style={{ filter: precision === "alta" ? "url(#glow)" : undefined }}>
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke={marker.color}
                  strokeWidth={getStrokeWidth("indicator")}
                />
                {marker.label && (
                  <text
                    x={`${marker.points[marker.points.length - 1][0] + 1}%`}
                    y={`${marker.points[marker.points.length - 1][1] + 3}%`}
                    fill={marker.color}
                    fontSize={getFontSize(9)}
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
            const [[x1, y1], [x2, y2]] = marker.points;
            const centerX = (x1 + x2) * 0.5;
            const centerY = (y1 + y2) * 0.5;
            
            return (
              <g key={idx} style={{ filter: precision === "alta" ? "url(#glow)" : undefined }}>
                <circle
                  cx={`${centerX}%`}
                  cy={`${centerY}%`}
                  r="5"
                  fill={`${marker.color}33`}
                  stroke={marker.color}
                  strokeWidth={getStrokeWidth("pattern")}
                />
                {marker.label && (
                  <text
                    x={`${centerX}%`}
                    y={`${centerY - 8}%`}
                    fill={marker.color}
                    fontSize={getFontSize(10)}
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
                    fontSize={getFontSize(8)}
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
            const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = marker.points;
            return (
              <g key={idx} style={{ filter: precision === "alta" ? "url(#glow)" : undefined }}>
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
                    fontSize={getFontSize(9)}
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
