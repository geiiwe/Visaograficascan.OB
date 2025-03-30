
import React from "react";
import { PatternResult } from "@/utils/patternDetection";
import { cn } from "@/lib/utils";

interface ChartOverlayProps {
  results: Record<string, PatternResult>;
  showMarkers: boolean;
}

const ChartOverlay: React.FC<ChartOverlayProps> = ({ results, showMarkers }) => {
  if (!showMarkers) return null;
  
  const allMarkers = Object.values(results)
    .filter(result => result?.found && result.visualMarkers)
    .flatMap(result => result.visualMarkers || []);
  
  if (allMarkers.length === 0) return null;

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      preserveAspectRatio="none"
    >
      {allMarkers.map((marker, idx) => {
        // Trendlines, support, resistance
        if (marker.points && marker.points.length >= 2) {
          const isLine = ["trendline", "support", "resistance"].includes(marker.type);
          
          if (isLine) {
            const [[x1, y1], [x2, y2]] = marker.points;
            return (
              <g key={idx}>
                <line
                  x1={`${x1 / 2}%`}
                  y1={`${y1 / 2}%`}
                  x2={`${x2 / 2}%`}
                  y2={`${y2 / 2}%`}
                  stroke={marker.color}
                  strokeWidth={marker.type === "trendline" ? 1.5 : 1}
                  strokeDasharray={marker.type === "support" ? "5,3" : marker.type === "resistance" ? "3,3" : undefined}
                />
                {marker.label && (
                  <text
                    x={`${x2 / 2 + 1}%`}
                    y={`${y2 / 2 + 4}%`}
                    fill={marker.color}
                    fontSize="8"
                    textAnchor="start"
                  >
                    {marker.label} {marker.strength ? `(${marker.strength})` : ""}
                  </text>
                )}
              </g>
            );
          }
          
          // For indicators like MA, MACD that need a polyline
          if (marker.type === "indicator" && marker.points.length > 2) {
            const pointsString = marker.points
              .map(([x, y]) => `${x / 2},${y / 2}`)
              .join(" ");
            
            return (
              <g key={idx}>
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke={marker.color}
                  strokeWidth={1}
                  strokeDasharray={marker.label?.includes("MA 50") ? "3,2" : undefined}
                />
                {marker.label && (
                  <text
                    x={`${marker.points[marker.points.length - 1][0] / 2 + 1}%`}
                    y={`${marker.points[marker.points.length - 1][1] / 2 + 4}%`}
                    fill={marker.color}
                    fontSize="8"
                    textAnchor="start"
                  >
                    {marker.label} {marker.strength ? `(${marker.strength})` : ""}
                  </text>
                )}
              </g>
            );
          }
          
          // For patterns like Golden Cross, Divergence, etc
          if (marker.type === "pattern") {
            const [[x1, y1], [x2, y2]] = marker.points;
            
            return (
              <g key={idx}>
                <circle
                  cx={`${(x1 + x2) / 4}%`}
                  cy={`${(y1 + y2) / 4}%`}
                  r="5"
                  fill="none"
                  stroke={marker.color}
                  strokeWidth={1.5}
                />
                {marker.label && (
                  <text
                    x={`${(x1 + x2) / 4}%`}
                    y={`${(y1 + y2) / 4 - 10}%`}
                    fill={marker.color}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {marker.label}
                  </text>
                )}
                {marker.strength && (
                  <text
                    x={`${(x1 + x2) / 4}%`}
                    y={`${(y1 + y2) / 4 - 5}%`}
                    fill={marker.color}
                    fontSize="7"
                    textAnchor="middle"
                  >
                    {marker.strength}
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
