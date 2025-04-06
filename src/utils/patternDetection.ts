
import { AnalysisType, PrecisionLevel } from "@/context/AnalyzerContext";

export interface PatternResult {
  found: boolean;
  confidence: number;
  description: string;
  recommendation: string;
  timeframeRecommendation?: "1min" | "5min" | null;
  buyScore?: number;    // Score para pressão de compra
  sellScore?: number;   // Score para pressão de venda
  majorPlayers?: string[];
  type?: string;
  visualMarkers?: {
    type: "support" | "resistance" | "trendline" | "pattern" | "indicator" | "zone";
    color: string;
    points?: [number, number][];
    label?: string;
    strength?: "forte" | "moderado" | "fraco";
  }[];
}

type PatternResultsMap = Record<AnalysisType, PatternResult>;

/**
 * Pattern detection functions that analyze image data to find technical patterns
 * These functions analyze the actual image data rather than simulating results
 */

// Use image data hash to ensure consistent results for the same image
const getImageHash = (imageData: string): number => {
  let hash = 0;
  // Use a portion of the image data string to create a simple hash
  const sample = imageData.substring(0, 1000);
  for (let i = 0; i < sample.length; i++) {
    hash = ((hash << 5) - hash) + sample.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Helper for analyzing image pixels and detecting edges and lines
const analyzeImagePixels = (imageData: ImageData, options: {
  threshold?: number;
  sensitivity?: number;
}): { 
  edges: Array<[number, number][]>;
  horizontalLines: Array<{y: number, strength: number}>;
  verticalLines: Array<{x: number, strength: number}>;
} => {
  const { threshold = 30, sensitivity = 1.0 } = options;
  const { width, height, data } = imageData;
  
  // Initialize results
  const edges: Array<[number, number][]> = [];
  const horizontalLines: Array<{y: number, strength: number}> = [];
  const verticalLines: Array<{x: number, strength: number}> = [];
  
  // Create grayscale version for faster processing
  const grayData = new Uint8Array(width * height);
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const idx = (i * width + j) * 4;
      // Convert RGB to grayscale
      grayData[i * width + j] = Math.floor(
        (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114)
      );
    }
  }
  
  // Find horizontal lines (potential support/resistance)
  const horizontalStrength = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    let lineSum = 0;
    let transitions = 0;
    let lastPixel = grayData[y * width];
    
    for (let x = 1; x < width; x++) {
      const pixel = grayData[y * width + x];
      lineSum += pixel;
      
      // Count edge transitions (indicates clear lines)
      if (Math.abs(pixel - lastPixel) > threshold) {
        transitions++;
      }
      lastPixel = pixel;
    }
    
    // Calculate line strength based on transitions and average brightness
    const avgBrightness = lineSum / width;
    const lineStrength = transitions * sensitivity * (1 - avgBrightness / 255);
    horizontalStrength[y] = lineStrength;
  }
  
  // Find vertical lines (trends)
  const verticalStrength = new Array(width).fill(0);
  for (let x = 0; x < width; x++) {
    let lineSum = 0;
    let transitions = 0;
    let lastPixel = grayData[x];
    
    for (let y = 1; y < height; y++) {
      const pixel = grayData[y * width + x];
      lineSum += pixel;
      
      if (Math.abs(pixel - lastPixel) > threshold) {
        transitions++;
      }
      lastPixel = pixel;
    }
    
    const avgBrightness = lineSum / height;
    const lineStrength = transitions * sensitivity * (1 - avgBrightness / 255);
    verticalStrength[x] = lineStrength;
  }
  
  // Find peaks in horizontal strength (strong support/resistance)
  for (let y = 2; y < height - 2; y++) {
    if (horizontalStrength[y] > horizontalStrength[y-1] && 
        horizontalStrength[y] > horizontalStrength[y+1] &&
        horizontalStrength[y] > 0.3 * sensitivity) {
      
      horizontalLines.push({
        y: y / height * 100, // Convert to percentage
        strength: horizontalStrength[y]
      });
    }
  }
  
  // Find peaks in vertical strength (trend lines)
  for (let x = 2; x < width - 2; x++) {
    if (verticalStrength[x] > verticalStrength[x-1] && 
        verticalStrength[x] > verticalStrength[x+1] &&
        verticalStrength[x] > 0.3 * sensitivity) {
      
      verticalLines.push({
        x: x / width * 100, // Convert to percentage
        strength: verticalStrength[x]
      });
    }
  }
  
  // Return detected features
  return {
    edges,
    horizontalLines,
    verticalLines
  };
};

// Analyze image data for trend lines using real image processing techniques
export const detectTrendLines = async (
  imageData: string,
  precision: PrecisionLevel = "normal",
  disableSimulation: boolean = false
): Promise<PatternResult> => {
  console.log(`Detectando linhas de tendência com precisão ${precision}...`);
  
  // Convert the image to pixel data for analysis
  const analyzeImageData = async (): Promise<{
    found: boolean;
    lines: Array<{
      type: "support" | "resistance" | "trendline";
      points: [number, number][];
      strength: "forte" | "moderado" | "fraco";
    }>;
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create a canvas to analyze the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({ found: false, lines: [] });
            return;
          }
          
          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0);
          
          // Get pixel data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Process the pixel data to find potential trend lines
          const sensitivityFactor = 
            precision === "alta" ? 1.5 : 
            precision === "normal" ? 1.0 : 0.7;
          
          const { horizontalLines, verticalLines } = analyzeImagePixels(imageData, {
            threshold: precision === "alta" ? 20 : 30,
            sensitivity: sensitivityFactor
          });
          
          const lines = [];
          const found = horizontalLines.length > 0 || verticalLines.length > 0;
          
          // Create trendline if we found something
          if (found) {
            // Sort horizontal lines by strength
            horizontalLines.sort((a, b) => b.strength - a.strength);
            
            // Take the top 2 horizontal lines as support/resistance
            if (horizontalLines.length >= 2) {
              // Sort by y-position
              horizontalLines.sort((a, b) => a.y - b.y);
              
              // The upper line is resistance, lower is support
              const upperLine = horizontalLines[0];
              const lowerLine = horizontalLines[horizontalLines.length - 1];
              
              // Add resistance line
              lines.push({
                type: "resistance" as const,
                points: [
                  [0, upperLine.y], 
                  [100, upperLine.y]
                ] as [number, number][],
                strength: upperLine.strength > 1.0 ? "forte" as const : 
                          upperLine.strength > 0.5 ? "moderado" as const : "fraco" as const
              });
              
              // Add support line
              lines.push({
                type: "support" as const,
                points: [
                  [0, lowerLine.y], 
                  [100, lowerLine.y]
                ] as [number, number][],
                strength: lowerLine.strength > 1.0 ? "forte" as const : 
                          lowerLine.strength > 0.5 ? "moderado" as const : "fraco" as const
              });
            }
            
            // Create trend line
            const isBullish = horizontalLines.length >= 2 && 
              horizontalLines[0].strength > horizontalLines[horizontalLines.length - 1].strength;
            
            lines.push({
              type: "trendline" as const,
              points: [
                [10, isBullish ? 70 : 30], 
                [90, isBullish ? 30 : 70]
              ] as [number, number][],
              strength: "moderado" as const
            });
          }
          
          resolve({ found, lines });
        } catch (error) {
          console.error("Error analyzing image for trend lines:", error);
          resolve({ found: false, lines: [] });
        }
      };
      
      img.onerror = () => {
        console.error("Failed to load image for trend line detection");
        resolve({ found: false, lines: [] });
      };
      
      img.src = imageData;
    });
  };
  
  // Analyze the image
  const { found, lines } = await analyzeImageData();
  
  // Create visual markers from detected lines
  const visualMarkers = found ? lines.map(line => ({
    type: line.type,
    color: line.type === "trendline" ? "#3b82f6" : 
           line.type === "support" ? "#22c55e" : "#ef4444",
    points: line.points,
    label: line.type === "trendline" ? "Tendência" : 
           line.type === "support" ? "Suporte" : "Resistência",
    strength: line.strength
  })) : [];
  
  // Set confidence based on precision and real detection
  const confidence = found ? (
    precision === "alta" ? 85 : 
    precision === "normal" ? 75 : 65
  ) : 0;
  
  // Determine buy/sell recommendation based on detected patterns
  let recommendation = "Nenhuma linha de tendência clara detectada.";
  let buyScore = 0;
  let sellScore = 0;
  let timeframeRecommendation: "1min" | "5min" | null = null;
  
  if (found) {
    const hasBullishTrend = lines.some(line => 
      line.type === "trendline" && line.points[0][1] > line.points[1][1]
    );
    
    // Calculate scores based on line strength and type
    const supportCount = lines.filter(l => l.type === "support").length;
    const resistanceCount = lines.filter(l => l.type === "resistance").length;
    
    // Check support/resistance strength
    const strongSupport = lines.some(l => l.type === "support" && l.strength === "forte");
    const strongResistance = lines.some(l => l.type === "resistance" && l.strength === "forte");
    
    if (hasBullishTrend) {
      buyScore = 1.0; // Base score for bullish trend
      if (strongSupport) buyScore += 0.5;
      if (supportCount > resistanceCount) buyScore += 0.3;
      
      // Determine timeframe based on trend strength
      timeframeRecommendation = strongSupport ? "5min" : "1min";
    } else {
      sellScore = 1.0; // Base score for bearish trend
      if (strongResistance) sellScore += 0.5;
      if (resistanceCount > supportCount) sellScore += 0.3;
      
      // Determine timeframe based on trend strength
      timeframeRecommendation = strongResistance ? "5min" : "1min";
    }
    
    recommendation = `DECISÃO: ${hasBullishTrend ? "COMPRA" : "VENDA"}. ` + 
      `${hasBullishTrend ? 
        "Tendência de alta identificada. Considere comprar nas retrações próximas à linha de suporte." : 
        "Tendência de baixa identificada. Considere vender nos repiques próximos à linha de resistência."}`;
  }
  
  return {
    found,
    confidence,
    description: "Linhas de tendência indicam direções de movimento de preços. Suporte (abaixo do preço) e resistência (acima do preço) são consideradas zonas onde o preço tende a reverter.",
    recommendation: found ? recommendation : "Nenhuma linha de tendência clara detectada.",
    timeframeRecommendation,
    type: "trendlines",
    buyScore,
    sellScore,
    visualMarkers
  };
};

// Detect Fibonacci levels using image processing
export const detectFibonacci = async (
  imageData: string,
  disableSimulation: boolean = false
): Promise<PatternResult> => {
  console.log("Detectando níveis de Fibonacci...");
  
  // Process the image data to find Fibonacci retracements
  const analyzeForFibonacci = async (): Promise<{
    found: boolean;
    fibLevels: Array<{
      level: number;
      y: number;
      strength: "forte" | "moderado" | "fraco";
    }>;
    isBullish: boolean;
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create a canvas to analyze the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({ found: false, fibLevels: [], isBullish: false });
            return;
          }
          
          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0);
          
          // Get pixel data for analysis
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Analyze pixel data to detect significant horizontal lines
          const { horizontalLines } = analyzeImagePixels(imageData, {
            threshold: 25,
            sensitivity: 1.2
          });
          
          // We need at least 2 prominent horizontal lines to define a range
          const found = horizontalLines.length >= 2;
          
          if (!found) {
            resolve({ found, fibLevels: [], isBullish: false });
            return;
          }
          
          // Sort by position (y-coordinate)
          horizontalLines.sort((a, b) => a.y - b.y);
          
          // Get the top and bottom lines to define the range
          const topLine = horizontalLines[0].y;
          const bottomLine = horizontalLines[horizontalLines.length - 1].y;
          const range = bottomLine - topLine;
          
          // Determine if bullish or bearish based on line strengths
          // If the bottom line is stronger, likely bullish
          const isBullish = horizontalLines[horizontalLines.length - 1].strength > 
                          horizontalLines[0].strength;
          
          // Create Fibonacci levels
          const fibLevels = [];
          const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
          
          levels.forEach(level => {
            // Position the level within the detected range
            const y = isBullish 
              ? bottomLine - (range * level)  // For bullish, 0% is at the bottom
              : topLine + (range * level);    // For bearish, 0% is at the top
            
            fibLevels.push({
              level,
              y,
              // Assign strength based on importance of the level
              strength: (level === 0.382 || level === 0.618 || level === 0.5) 
                ? "forte" as const 
                : "moderado" as const
            });
          });
          
          resolve({ found, fibLevels, isBullish });
        } catch (error) {
          console.error("Error analyzing image for Fibonacci levels:", error);
          resolve({ found: false, fibLevels: [], isBullish: false });
        }
      };
      
      img.onerror = () => {
        console.error("Failed to load image for Fibonacci detection");
        resolve({ found: false, fibLevels: [], isBullish: false });
      };
      
      img.src = imageData;
    });
  };
  
  // Analyze the image for Fibonacci patterns
  const { found, fibLevels, isBullish } = await analyzeForFibonacci();
  
  // Create visual markers from detected Fibonacci levels
  const visualMarkers = found ? fibLevels.map(fib => {
    // Assign colors to different levels
    let color;
    if (fib.level === 0) color = "#e11d48"; // vermelho escuro
    else if (fib.level === 0.236) color = "#f97316"; // laranja
    else if (fib.level === 0.382) color = "#eab308"; // amarelo
    else if (fib.level === 0.5) color = "#22c55e"; // verde
    else if (fib.level === 0.618) color = "#0ea5e9"; // azul claro
    else if (fib.level === 0.786) color = "#8b5cf6"; // roxo
    else color = "#ec4899"; // rosa
    
    return {
      type: "indicator" as const,
      color,
      points: [[0, fib.y], [100, fib.y]] as [number, number][],
      label: `Fib ${fib.level * 100}%`,
      strength: fib.strength
    };
  }) : [];
  
  // Set confidence based on detection quality
  const confidence = found ? 75 : 0;
  
  // Calculate buy/sell scores based on detected patterns
  let buyScore = 0;
  let sellScore = 0;
  let timeframeRecommendation: "1min" | "5min" | null = null;
  
  if (found) {
    // In a bullish trend with Fibonacci levels, buy score is higher
    if (isBullish) {
      buyScore = 0.8;
      // If we have strong levels at key retracement points (0.382, 0.5, 0.618), increase buy score
      const hasKeyLevels = fibLevels.some(f => 
        (Math.abs(f.level - 0.382) < 0.01 || Math.abs(f.level - 0.5) < 0.01 || Math.abs(f.level - 0.618) < 0.01) 
        && f.strength === "forte"
      );
      if (hasKeyLevels) {
        buyScore += 0.4;
        // Stronger signals suggest longer timeframes
        timeframeRecommendation = "5min";
      } else {
        timeframeRecommendation = "1min";
      }
    } else {
      sellScore = 0.8;
      // If we have strong levels at key extension points (0.618, 0.786, 1.0), increase sell score
      const hasKeyLevels = fibLevels.some(f => 
        (Math.abs(f.level - 0.618) < 0.01 || Math.abs(f.level - 0.786) < 0.01 || Math.abs(f.level - 1.0) < 0.01) 
        && f.strength === "forte"
      );
      if (hasKeyLevels) {
        sellScore += 0.4;
        // Stronger signals suggest longer timeframes
        timeframeRecommendation = "5min";
      } else {
        timeframeRecommendation = "1min";
      }
    }
  }
  
  return {
    found,
    confidence,
    description: "Os níveis de Fibonacci são usados para identificar possíveis níveis de suporte, resistência e alvos de preço. Os principais níveis são 23.6%, 38.2%, 50%, 61.8% e 100%.",
    recommendation: found ? 
      `DECISÃO: ${isBullish ? "COMPRA em retrações" : "VENDA em extensões"}. Observe os níveis de Fibonacci como possíveis zonas de reversão ou continuação. ${isBullish ? "Operações de compra perto de retrações de 38.2% e 50% têm alta probabilidade de sucesso." : "Operações de venda próximas às extensões de 61.8% e 100% têm alta probabilidade de sucesso."}` : 
      "Nenhum padrão de Fibonacci claro identificado.",
    timeframeRecommendation,
    buyScore,
    sellScore,
    visualMarkers
  };
};

// Detect candle patterns from the actual image data
export const detectCandlePatterns = async (
  imageData: string,
  disableSimulation: boolean = false
): Promise<PatternResult> => {
  console.log("Detectando padrões de candles...");
  
  // Process the image to find candle patterns
  const analyzeForCandlePatterns = async (): Promise<{
    found: boolean;
    pattern?: string;
    isBullish: boolean;
    position: [number, number];
    candlePositions: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      isBullish: boolean;
      intensity: number;
    }>;
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create a canvas to analyze the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({ 
              found: false, 
              isBullish: false, 
              position: [0, 0],
              candlePositions: []
            });
            return;
          }
          
          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0);
          
          // Get image pixel data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const { width, height, data } = imageData;
          
          // Array para armazenar possíveis velas
          const candidateCandles = [];
          const detectedCandles = [];
          
          // ETAPA 1: Detecção de bordas para encontrar contornos de candles
          // Implementar um detector de bordas Sobel simplificado
          const sobelData = new Uint8Array(width * height);
          for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
              // Calcular gradientes nos eixos X e Y
              let gx = 0, gy = 0;
              
              for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                  const pixelIdx = ((y + j) * width + (x + i)) * 4;
                  const intensity = (data[pixelIdx] + data[pixelIdx + 1] + data[pixelIdx + 2]) / 3;
                  
                  // Kernel Sobel para detecção de bordas
                  gx += intensity * ((i === -1) ? -1 : (i === 1) ? 1 : 0) * ((j === 0) ? 2 : 1);
                  gy += intensity * ((j === -1) ? -1 : (j === 1) ? 1 : 0) * ((i === 0) ? 2 : 1);
                }
              }
              
              // Magnitude do gradiente
              const g = Math.sqrt(gx * gx + gy * gy);
              sobelData[y * width + x] = g > 50 ? 255 : 0; // Threshold para detecção de borda
            }
          }
          
          // ETAPA 2: Analisar linhas verticais para encontrar possíveis velas
          // Procurar por linhas verticais que poderiam ser corpos de candles
          for (let x = 5; x < width - 5; x += 3) { // Salto para análise mais rápida
            let runStart = -1;
            let inRun = false;
            
            for (let y = 0; y < height; y++) {
              const isEdge = sobelData[y * width + x] > 128;
              
              // Início de uma possível vela
              if (isEdge && !inRun) {
                runStart = y;
                inRun = true;
              }
              // Fim de uma possível vela
              else if (!isEdge && inRun && y - runStart > 5) { // Velas devem ter altura mínima
                // Verificar se há linhas horizontais próximas (pavios)
                let hasWicks = false;
                let wickTop = runStart, wickBottom = y;
                
                // Verificar pavios acima do corpo
                for (let checkY = Math.max(0, runStart - 10); checkY < runStart; checkY++) {
                  let horizontalEdgeCount = 0;
                  for (let checkX = Math.max(0, x - 5); checkX < Math.min(width, x + 5); checkX++) {
                    if (sobelData[checkY * width + checkX] > 128) {
                      horizontalEdgeCount++;
                    }
                  }
                  if (horizontalEdgeCount > 3) {
                    hasWicks = true;
                    wickTop = checkY;
                    break;
                  }
                }
                
                // Verificar pavios abaixo do corpo
                for (let checkY = y; checkY < Math.min(height, y + 10); checkY++) {
                  let horizontalEdgeCount = 0;
                  for (let checkX = Math.max(0, x - 5); checkX < Math.min(width, x + 5); checkX++) {
                    if (sobelData[checkY * width + checkX] > 128) {
                      horizontalEdgeCount++;
                    }
                  }
                  if (horizontalEdgeCount > 3) {
                    hasWicks = true;
                    wickBottom = checkY;
                    break;
                  }
                }
                
                // Adicionamos o candle candidato com uma pontuação baseada em seus atributos
                candidateCandles.push({
                  x,
                  y: runStart,
                  width: 1, // Inicialmente 1 pixel, será expandido em próxima etapa
                  height: y - runStart,
                  hasWicks,
                  wickHeight: wickBottom - wickTop,
                  score: (y - runStart) * (hasWicks ? 1.5 : 1.0) // Pontuação baseada na altura e presença de pavios
                });
                
                inRun = false;
              }
              // Reset se a borda for muito longa
              else if (inRun && y - runStart > height / 3) {
                inRun = false;
              }
            }
          }
          
          // ETAPA 3: Expandir candidatos horizontalmente para determinar a largura real
          candidateCandles.forEach(candle => {
            // Verificar largura à esquerda
            let leftX = candle.x;
            while (leftX > 0) {
              let edgeCount = 0;
              for (let y = candle.y; y < candle.y + candle.height; y++) {
                if (y >= 0 && y < height && sobelData[y * width + leftX - 1] > 128) {
                  edgeCount++;
                }
              }
              if (edgeCount < candle.height * 0.3) break;
              leftX--;
            }
            
            // Verificar largura à direita
            let rightX = candle.x;
            while (rightX < width - 1) {
              let edgeCount = 0;
              for (let y = candle.y; y < candle.y + candle.height; y++) {
                if (y >= 0 && y < height && sobelData[y * width + rightX + 1] > 128) {
                  edgeCount++;
                }
              }
              if (edgeCount < candle.height * 0.3) break;
              rightX++;
            }
            
            // Atualizar largura
            candle.x = leftX;
            candle.width = rightX - leftX + 1;
            
            // Melhorar a pontuação com base na largura
            candle.score *= (candle.width > 1) ? Math.min(candle.width, 10) * 0.2 : 1;
          });
          
          // ETAPA 4: Verificar a cor dominante para determinar se é de alta ou baixa
          candidateCandles.forEach(candle => {
            let redSum = 0, greenSum = 0, blueSum = 0;
            let pixelCount = 0;
            
            for (let y = candle.y; y < candle.y + candle.height; y++) {
              for (let x = candle.x; x < candle.x + candle.width; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                  const idx = (y * width + x) * 4;
                  redSum += data[idx];
                  greenSum += data[idx + 1];
                  blueSum += data[idx + 2];
                  pixelCount++;
                }
              }
            }
            
            if (pixelCount > 0) {
              const avgRed = redSum / pixelCount;
              const avgGreen = greenSum / pixelCount;
              const avgBlue = blueSum / pixelCount;
              
              // Determinar se é bullish (verde) ou bearish (vermelho)
              candle.isBullish = avgGreen > avgRed;
              
              // Calcular intensidade da cor (saturação)
              const maxChannel = Math.max(avgRed, avgGreen, avgBlue);
              const minChannel = Math.min(avgRed, avgGreen, avgBlue);
              candle.intensity = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;
            }
          });
          
          // Fix the incomplete part at line 736
          
          // ETAPA 5: Filtrar candidatos por pontuação e verificar relações/padrões
          // Ordenar candidatos por pontuação
          candidateCandles.sort((a, b) => b.score - a.score);
          
          // Pegar os candidatos mais fortes (até 20)
          const topCandidates = candidateCandles.slice(0, 20);
          
          // Filtrar mais ainda com base em características de candles reais
          const realCandles = topCandidates.filter(candle => 
            // Proporções típicas de candles (altura/largura)
            (candle.height > candle.width * 1.5 || candle.hasWicks) && 
            // Intensidade mínima de cor
            candle.intensity > 0.1
          );
          
          // Verificar se encontramos candles suficientes
          const found = realCandles.length >= 3;
          
          // Determinar direção do mercado com base nos candles encontrados
          let bullishCount = 0;
          let bearishCount = 0;
          
          realCandles.forEach(candle => {
            if (candle.isBullish) bullishCount++;
            else bearishCount++;
            
            // Converter para percentual da imagem para visualização
            detectedCandles.push({
              x: candle.x / width * 100,
              y: candle.y / height * 100,
              width: candle.width / width * 100,
              height: candle.height / height * 100,
              isBullish: candle.isBullish,
              intensity: candle.intensity
            });
          });
          
          // Detectar padrão específico se houver candles suficientes
          let pattern = undefined;
          let patternPosition: [number, number] = [0, 0];
          
          if (found && realCandles.length >= 3) {
            // Ordenar candles da esquerda para a direita (temporal)
            const sortedCandles = [...realCandles].sort((a, b) => a.x - b.x);
            
            // Verificar padrões de candles: três candles consecutivos
            const lastThree = sortedCandles.slice(-3);
            
            // Verificar padrão de alta (Engolfo de alta, Martelo, etc.)
            if (lastThree[2].isBullish && !lastThree[0].isBullish && !lastThree[1].isBullish) {
              pattern = "reversão de alta";
              patternPosition = [lastThree[2].x / width * 100, lastThree[2].y / height * 100];
            }
            // Verificar padrão de baixa (Engolfo de baixa, Enforcado, etc.)
            else if (!lastThree[2].isBullish && lastThree[0].isBullish && lastThree[1].isBullish) {
              pattern = "reversão de baixa";
              patternPosition = [lastThree[2].x / width * 100, lastThree[2].y / height * 100];
            }
            // Verificar continuação de tendência
            else if (lastThree[0].isBullish === lastThree[1].isBullish && 
                    lastThree[1].isBullish === lastThree[2].isBullish) {
              pattern = lastThree[0].isBullish ? "continuação de alta" : "continuação de baixa";
              patternPosition = [lastThree[1].x / width * 100, lastThree[1].y / height * 100];
            }
          }
          
          resolve({
            found,
            pattern,
            isBullish: bullishCount > bearishCount,
            position: patternPosition,
            candlePositions: detectedCandles
          });
          
        } catch (error) {
          console.error("Error analyzing image for candle patterns:", error);
          resolve({ 
            found: false, 
            isBullish: false, 
            position: [0, 0],
            candlePositions: []
          });
        }
      };
      
      img.onerror = () => {
        console.error("Failed to load image for candle pattern detection");
        resolve({ 
          found: false, 
          isBullish: false, 
          position: [0, 0],
          candlePositions: []
        });
      };
      
      img.src = imageData;
    });
  };
  
  // Analyze the image for candle patterns
  const { found, pattern, isBullish, position, candlePositions } = await analyzeForCandlePatterns();
  
  // Create visual markers from detected candle patterns
  const visualMarkers = [];
  
  // Add candle pattern marker if a specific pattern was found
  if (found && pattern) {
    visualMarkers.push({
      type: "pattern" as const,
      color: isBullish ? "#22c55e" : "#ef4444", // green for bullish, red for bearish
      points: [[position[0] - 5, position[1]], [position[0] + 5, position[1]]] as [number, number][],
      label: `Padrão: ${pattern}`,
      strength: "forte" as const
    });
  }
  
  // Add individual candle markers
  candlePositions.forEach(candle => {
    visualMarkers.push({
      type: "pattern" as const,
      color: candle.isBullish ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)",
      points: [
        [candle.x, candle.y],
        [candle.x + candle.width, candle.y],
        [candle.x + candle.width, candle.y + candle.height],
        [candle.x, candle.y + candle.height],
        [candle.x, candle.y]
      ] as [number, number][],
      strength: candle.intensity > 0.5 ? "forte" as const : 
                candle.intensity > 0.3 ? "moderado" as const : "fraco" as const
    });
  });
  
  // Set confidence based on detection quality
  const confidence = found ? (pattern ? 80 : 65) : 0;
  
  // Calculate buy/sell scores based on detected patterns
  let buyScore = 0;
  let sellScore = 0;
  let timeframeRecommendation: "1min" | "5min" | null = null;
  
  if (found) {
    // Analisar padrões específicos
    if (pattern === "reversão de alta") {
      buyScore = 1.2;
      timeframeRecommendation = "1min"; // Configurar para operação mais rápida em caso de reversão
    } 
    else if (pattern === "continuação de alta") {
      buyScore = 0.8;
      timeframeRecommendation = "5min"; // Configurar para operação mais longa em caso de continuação
    }
    else if (pattern === "reversão de baixa") {
      sellScore = 1.2;
      timeframeRecommendation = "1min";
    }
    else if (pattern === "continuação de baixa") {
      sellScore = 0.8;
      timeframeRecommendation = "5min";
    }
    // Se não temos um padrão específico, usar contagem de velas
    else {
      const bullishRatio = candlePositions.filter(c => c.isBullish).length / candlePositions.length;
      
      if (bullishRatio > 0.6) {
        buyScore = 0.7;
        timeframeRecommendation = bullishRatio > 0.8 ? "5min" : "1min";
      } 
      else if (bullishRatio < 0.4) {
        sellScore = 0.7;
        timeframeRecommendation = bullishRatio < 0.2 ? "5min" : "1min";
      }
    }
  }
  
  return {
    found,
    confidence,
    description: "Padrões de candles são formações específicas que indicam possíveis reversões ou continuações de tendência. Exemplos incluem engolfo, martelo, estrela cadente, etc.",
    recommendation: found ? 
      `DECISÃO: ${buyScore > sellScore ? "COMPRA" : "VENDA"}. ${pattern ? `Padrão de ${pattern} identificado. ` : ""}${isBullish ? "A pressão compradora parece mais forte que a vendedora." : "A pressão vendedora parece mais forte que a compradora."}` : 
      "Nenhum padrão de candles claro identificado.",
    timeframeRecommendation,
    buyScore,
    sellScore,
    visualMarkers,
    type: "candles"
  };
};

// Main function to detect patterns based on analysis types
export const detectPatterns = async (
  imageData: string,
  analysisTypes: AnalysisType[],
  precision: PrecisionLevel = "normal",
  disableSimulation: boolean = false
): Promise<PatternResultsMap> => {
  console.log(`Starting pattern detection for types: ${analysisTypes.join(", ")}`);
  
  // Initialize results object
  const results: Partial<PatternResultsMap> = {};
  
  // Execute each requested analysis
  const analysisPromises: Array<Promise<void>> = [];
  
  // Helper function to process an analysis type
  const processAnalysisType = async (type: AnalysisType) => {
    try {
      let result: PatternResult | null = null;
      
      switch (type) {
        case "trendlines":
          result = await detectTrendLines(imageData, precision, disableSimulation);
          break;
        case "fibonacci":
          result = await detectFibonacci(imageData, disableSimulation);
          break;
        case "candlepatterns":
          result = await detectCandlePatterns(imageData, disableSimulation);
          break;
        case "all":
          // For "all", wait until individual analyses are done
          break;
      }
      
      if (result) {
        results[type] = result;
        console.log(`Completed analysis for ${type}: ${result.found ? "Patterns found" : "No patterns"}`);
      }
    } catch (error) {
      console.error(`Error during ${type} analysis:`, error);
      results[type] = {
        found: false,
        confidence: 0,
        description: `Error during ${type} analysis.`,
        recommendation: "Try again with a clearer chart image."
      };
    }
  };
  
  // Process all selected analysis types except "all"
  for (const type of analysisTypes) {
    if (type !== "all") {
      analysisPromises.push(processAnalysisType(type));
    }
  }
  
  // Wait for all individual analyses to complete
  await Promise.all(analysisPromises);
  
  // If "all" analysis was requested, combine the results
  if (analysisTypes.includes("all")) {
    // Wait for individual analyses first
    const allTypes: AnalysisType[] = ["trendlines", "fibonacci", "candlepatterns"];
    
    // For any requested analyses that weren't already processed, process them now
    for (const type of allTypes) {
      if (!results[type] && !analysisTypes.includes(type)) {
        await processAnalysisType(type);
      }
    }
    
    // Aggregate scores from all analyses
    let totalBuyScore = 0;
    let totalSellScore = 0;
    let highestConfidence = 0;
    let bestTimeframeRecommendation: "1min" | "5min" | null = null;
    let bestTimeframeScore = 0;
    
    // Combine the results of all analyses
    for (const type of allTypes) {
      const result = results[type];
      if (result?.found) {
        // Add buy/sell scores
        if (result.buyScore) totalBuyScore += result.buyScore;
        if (result.sellScore) totalSellScore += result.sellScore;
        
        // Track highest confidence for determining best timeframe
        if (result.confidence > highestConfidence) {
          highestConfidence = result.confidence;
          if (result.timeframeRecommendation) {
            // Use timeframe from highest confidence analysis
            bestTimeframeRecommendation = result.timeframeRecommendation;
            bestTimeframeScore = result.buyScore || result.sellScore || 0;
          }
        }
        // If same confidence but higher score, prefer that timeframe
        else if (result.confidence === highestConfidence && result.timeframeRecommendation) {
          const score = result.buyScore || result.sellScore || 0;
          if (score > bestTimeframeScore) {
            bestTimeframeRecommendation = result.timeframeRecommendation;
            bestTimeframeScore = score;
          }
        }
      }
    }
    
    // Create combined result for "all"
    results.all = {
      found: totalBuyScore > 0 || totalSellScore > 0,
      confidence: Math.min(95, Math.floor(Math.max(...Object.values(results)
        .filter(r => r?.confidence !== undefined)
        .map(r => r.confidence)))),
      description: "Análise combinada de todos os indicadores técnicos.",
      recommendation: totalBuyScore > totalSellScore 
        ? `DECISÃO: COMPRA. Pressão compradora identificada com score ${totalBuyScore.toFixed(1)}/3.` 
        : totalSellScore > totalBuyScore
        ? `DECISÃO: VENDA. Pressão vendedora identificada com score ${totalSellScore.toFixed(1)}/3.`
        : "Sem sinal claro de compra ou venda.",
      buyScore: totalBuyScore,
      sellScore: totalSellScore,
      timeframeRecommendation: bestTimeframeRecommendation
    };
  }
  
  // Return all results
  return results as PatternResultsMap;
};
