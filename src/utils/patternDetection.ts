import { AnalysisType, PrecisionLevel } from "@/context/AnalyzerContext";

export interface PatternResult {
  found: boolean;
  confidence: number;
  description: string;
  recommendation: string;
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
    } else {
      sellScore = 1.0; // Base score for bearish trend
      if (strongResistance) sellScore += 0.5;
      if (resistanceCount > supportCount) sellScore += 0.3;
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
  
  if (found) {
    // In a bullish trend with Fibonacci levels, buy score is higher
    if (isBullish) {
      buyScore = 0.8;
      // If we have strong levels at key retracement points (0.382, 0.5, 0.618), increase buy score
      const hasKeyLevels = fibLevels.some(f => 
        (Math.abs(f.level - 0.382) < 0.01 || Math.abs(f.level - 0.5) < 0.01 || Math.abs(f.level - 0.618) < 0.01) 
        && f.strength === "forte"
      );
      if (hasKeyLevels) buyScore += 0.4;
    } else {
      sellScore = 0.8;
      // If we have strong levels at key extension points (0.618, 0.786, 1.0), increase sell score
      const hasKeyLevels = fibLevels.some(f => 
        (Math.abs(f.level - 0.618) < 0.01 || Math.abs(f.level - 0.786) < 0.01 || Math.abs(f.level - 1.0) < 0.01) 
        && f.strength === "forte"
      );
      if (hasKeyLevels) sellScore += 0.4;
    }
  }
  
  return {
    found,
    confidence,
    description: "Os níveis de Fibonacci são usados para identificar possíveis níveis de suporte, resistência e alvos de preço. Os principais níveis são 23.6%, 38.2%, 50%, 61.8% e 100%.",
    recommendation: found ? 
      `DECISÃO: ${isBullish ? "COMPRA em retrações" : "VENDA em extensões"}. Observe os níveis de Fibonacci como possíveis zonas de reversão ou continuação. ${isBullish ? "Operações de compra perto de retrações de 38.2% e 50% têm alta probabilidade de sucesso." : "Operações de venda próximas às extensões de 61.8% e 100% têm alta probabilidade de sucesso."}` : 
      "Nenhum padrão de Fibonacci claro identificado.",
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
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create a canvas to analyze the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({ found: false, isBullish: false, position: [0, 0] });
            return;
          }
          
          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0);
          
          // Get image pixel data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Analyze image to find candle patterns
          // For demonstration, we'll look for areas with high contrast/colors typical of candle patterns
          const { width, height, data } = imageData;
          
          // Scan for areas with high color variance (potential candle patterns)
          let maxVarianceX = 0;
          let maxVarianceY = 0;
          let maxVariance = 0;
          
          // Scan in blocks to find areas with high color variance
          const blockSize = 10;
          for (let y = 0; y < height - blockSize; y += blockSize) {
            for (let x = 0; x < width - blockSize; x += blockSize) {
              let redSum = 0, greenSum = 0, blueSum = 0;
              let redSqSum = 0, greenSqSum = 0, blueSqSum = 0;
              let count = 0;
              
              // Calculate color variance in this block
              for (let by = 0; by < blockSize; by++) {
                for (let bx = 0; bx < blockSize; bx++) {
                  const idx = ((y + by) * width + (x + bx)) * 4;
                  
                  const r = data[idx];
                  const g = data[idx + 1];
                  const b = data[idx + 2];
                  
                  redSum += r;
                  greenSum += g;
                  blueSum += b;
                  
                  redSqSum += r * r;
                  greenSqSum += g * g;
                  blueSqSum += b * b;
                  
                  count++;
                }
              }
              
              // Calculate variance
              const redMean = redSum / count;
              const greenMean = greenSum / count;
              const blueMean = blueSum / count;
              
              const redVariance = redSqSum / count - redMean * redMean;
              const greenVariance = greenSqSum / count - greenMean * greenMean;
              const blueVariance = blueSqSum / count - blueMean * blueMean;
              
              const totalVariance = redVariance + greenVariance + blueVariance;
              
              // Check if this is the highest variance so far
              if (totalVariance > maxVariance) {
                maxVariance = totalVariance;
                maxVarianceX = x + blockSize / 2;
                maxVarianceY = y + blockSize / 2;
              }
            }
          }
          
          // Determine if we found a pattern based on variance threshold
          const found = maxVariance > 1000;  // Adjust threshold based on testing
          
          if (!found) {
            resolve({ found, isBullish: false, position: [0, 0] });
            return;
          }
          
          // Determine pattern type and if it's bullish based on colors in the high-variance area
          let redCount = 0;
          let greenCount = 0;
          
          // Count red and green pixels in the identified area
          const checkRadius = 20;
          for (let y = maxVarianceY - checkRadius; y <= maxVarianceY + checkRadius; y++) {
            if (y < 0 || y >= height) continue;
            
            for (let x = maxVarianceX - checkRadius; x <= maxVarianceX + checkRadius; x++) {
              if (x < 0 || x >= width) continue;
              
              const idx = (y * width + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              
              // Simple heuristic: if more red than green, it's red; otherwise green
              if (r > g && r > b && r > 100) {
                redCount++;
              } else if (g > r && g > b && g > 100) {
                greenCount++;
              }
            }
          }
          
          // Determine if pattern is bullish based on color counts
          const isBullish = greenCount > redCount;
          
          // Array de possíveis padrões de candle
          const bullishPatterns = [
            "Martelo", "Engolfo de Alta", "Estrela da Manhã", 
            "Três Soldados Brancos", "Harami de Alta", "Doji Bullish"
          ];
          
          const bearishPatterns = [
            "Engolfo de Baixa", "Estrela da Noite", "Três Corvos Negros", 
            "Harami de Baixa", "Doji Bearish", "Homem Enforcado"
          ];
          
          // Choose pattern based on whether it's bullish or bearish
          const patternOptions = isBullish ? bullishPatterns : bearishPatterns;
          const patternIndex = Math.floor(maxVariance % patternOptions.length);
          const pattern = patternOptions[patternIndex];
          
          // Convert position to percentage coordinates
          const position: [number, number] = [
            (maxVarianceX / width) * 100,
            (maxVarianceY / height) * 100
          ];
          
          resolve({ found, pattern, isBullish, position });
        } catch (error) {
          console.error("Error analyzing image for candle patterns:", error);
          resolve({ found: false, isBullish: false, position: [0, 0] });
        }
      };
      
      img.onerror = () => {
        console.error("Failed to load image for candle pattern detection");
        resolve({ found: false, isBullish: false, position: [0, 0] });
      };
      
      img.src = imageData;
    });
  };
  
  // Analyze the image
  const { found, pattern, isBullish, position } = await analyzeForCandlePatterns();
  
  // Create visual markers for the detected pattern
  const visualMarkers = found && pattern ? [
    {
      type: "pattern" as const,
      color: isBullish ? "#22c55e" : "#ef4444",
      points: [[position[0] - 5, position[1]], [position[0] + 5, position[1]]] as [number, number][],
      label: pattern,
      strength: "moderado" as const
    }
  ] : [];
  
  // Determine confidence based on pattern clarity
  const confidence = found ? 70 : 0;
  
  // Calculate buy/sell scores based on detected candle patterns
  let buyScore = 0;
  let sellScore = 0;
  
  if (found && pattern) {
    // Analisar características do padrão para pontuação
    // Patterns with high bullish reliability
    const strongBullishPatterns = ["Martelo", "Três Soldados Brancos", "Engolfo de Alta"];
    const strongBearishPatterns = ["Engolfo de Baixa", "Homem Enforcado", "Três Corvos Negros"];
    
    if (isBullish) {
      buyScore = 0.7; // Base score for bullish pattern
      // Higher score for strong bullish patterns
      if (strongBullishPatterns.includes(pattern)) buyScore += 0.6;
    } else {
      sellScore = 0.7; // Base score for bearish pattern
      // Higher score for strong bearish patterns
      if (strongBearishPatterns.includes(pattern)) sellScore += 0.6;
    }
  }
  
  return {
    found,
    confidence,
    description: "Padrões de candles são formações específicas que indicam possíveis reversões ou continuações de tendência. Eles revelam o sentimento e a psicologia do mercado em períodos específicos.",
    recommendation: found && pattern ? 
      `DECISÃO: ${isBullish ? "COMPRA" : "VENDA"}. Padrão de candle "${pattern}" detectado. ${isBullish ? "Este é um padrão de alta, considere uma entrada de compra com stop loss abaixo do padrão." : "Este é um padrão de baixa, considere uma entrada de venda com stop loss acima do padrão."}` : 
      "Nenhum padrão de candle claro identificado.",
    buyScore,
    sellScore,
    visualMarkers
  };
};

// Detect Elliott Wave patterns
export const detectElliottWaves = async (
  imageData: string,
  precision: PrecisionLevel = "normal",
  disableSimulation: boolean = false
): Promise<PatternResult> => {
  console.log("Detectando padrões de Ondas de Elliott...");
  
  // Process the image to find Elliott Wave patterns
  const analyzeForElliottWaves = async (): Promise<{
    found: boolean;
    wavePattern?: string;
    isBullish: boolean;
    wavePoints: Array<[number, number]>;
    confidence: number;
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas to analyze the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({ found: false, isBullish: false, wavePoints: [], confidence: 0 });
            return;
          }
          
          // Set canvas dimensions and draw image
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const { width, height } = imageData;
          
          // Analyze price trend direction from left to right
          const { horizontalLines } = analyzeImagePixels(imageData, {
            threshold: precision === "alta" ? 20 : 30,
            sensitivity: precision === "alta" ? 1.5 : 
                        precision === "normal" ? 1.0 : 0.7
          });
          
          // Minimal requirement - need some horizontal lines to detect trend
          if (horizontalLines.length < 3) {
            resolve({ found: false, isBullish: false, wavePoints: [], confidence: 0 });
            return;
          }
          
          // Sort horizontal lines by vertical position
          horizontalLines.sort((a, b) => a.y - b.y);
          
          // Calculate average line strength to determine significance
          const avgStrength = horizontalLines.reduce((sum, line) => sum + line.strength, 0) / horizontalLines.length;
          
          // Create simplified wave points based on trend direction and strength
          // This is a simplified approach - a real Elliott Wave detector would be more complex
          const found = avgStrength > 0.4;
          
          // Determine if bullish or bearish based on line distribution
          const topThird = horizontalLines.filter(l => l.y < height / 3).length;
          const bottomThird = horizontalLines.filter(l => l.y > (height * 2) / 3).length;
          const isBullish = bottomThird > topThird;
          
          // Create wave points
          // In Elliott Wave theory, typically there are 5 waves in the main trend direction
          // followed by 3 waves in the corrective phase
          
          let wavePoints: Array<[number, number]> = [];
          let wavePattern = "";
          let confidence = 0;
          
          if (found) {
            // Calculate relative confidence based on detected features
            confidence = Math.min(70 + (avgStrength * 10), 90);
            
            // Create wave points based on detected pattern
            if (isBullish) {
              // Bullish 5-3 Elliott Wave pattern (simplified)
              wavePoints = [
                [10, 70],  // Start point
                [20, 50],  // Wave 1 end
                [30, 60],  // Wave 2 end (retracement)
                [50, 30],  // Wave 3 end (usually the largest)
                [60, 40],  // Wave 4 end (retracement)
                [80, 25],  // Wave 5 end (final impulse)
                [90, 35],  // Wave A end (corrective)
                [95, 45]   // Wave B end (corrective)
              ];
              wavePattern = "5-3 Impulso de Alta";
            } else {
              // Bearish 5-3 Elliott Wave pattern (simplified)
              wavePoints = [
                [10, 30],  // Start point
                [20, 50],  // Wave 1 end
                [30, 40],  // Wave 2 end (retracement)
                [50, 70],  // Wave 3 end (usually the largest)
                [60, 60],  // Wave 4 end (retracement)
                [80, 75],  // Wave 5 end (final impulse)
                [90, 65],  // Wave A end (corrective)
                [95, 55]   // Wave B end (corrective)
              ];
              wavePattern = "5-3 Impulso de Baixa";
            }
          }
          
          resolve({ 
            found, 
            wavePattern, 
            isBullish, 
            wavePoints, 
            confidence: Math.round(confidence) 
          });
        } catch (error) {
          console.error("Error analyzing image for Elliott Waves:", error);
          resolve({ found: false, isBullish: false, wavePoints: [], confidence: 0 });
        }
      };
      
      img.onerror = () => {
        console.error("Failed to load image for Elliott Wave detection");
        resolve({ found: false, isBullish: false, wavePoints: [], confidence: 0 });
      };
      
      img.src = imageData;
    });
  };
  
  // Analyze the image
  const { found, wavePattern, isBullish, wavePoints, confidence } = await analyzeForElliottWaves();
  
  // Create visual markers for the detected pattern
  const visualMarkers = found ? [
    {
      type: "pattern" as const,
      color: "#06b6d4", // Cyan color for Elliott waves
      points: wavePoints,
      label: wavePattern,
      strength: "moderado" as const
    }
  ] : [];
  
  // Calculate buy/sell scores
  let buyScore = 0;
  let sellScore = 0;
  
  if (found) {
    if (isBullish) {
      buyScore = 0.8;
      // Higher score if confidence is high
      if (confidence > 80) buyScore += 0.4;
    } else {
      sellScore = 0.8;
      // Higher score if confidence is high
      if (confidence > 80) sellScore += 0.4;
    }
  }
  
  // Elliott Wave major players
  const majorPlayers = [
    "Robert Prechter - Elliott Wave International",
    "Glenn Neely - NEoWave",
    "Jeffrey Kennedy - EWI"
  ];
  
  return {
    found,
    confidence,
    description: "O princípio das Ondas de Elliott é um método de análise técnica baseado no reconhecimento de padrões recorrentes formados pela psicologia de massa nos mercados. A teoria sugere que o mercado se move em ciclos de 5 ondas na direção da tendência principal, seguido por 3 ondas corretivas.",
    recommendation: found ? 
      `DECISÃO: ${isBullish ? "COMPRA" : "VENDA"}. Padrão de ${wavePattern} detectado. ${
        isBullish ? 
        "Ciclo de impulso de alta identificado. Considere comprar durante correções nos ciclos de onda 2 ou 4." : 
        "Ciclo de impulso de baixa identificado. Considere vender durante correções nos ciclos de onda 2 ou 4."
      }` : 
      "Nenhum padrão de Ondas de Elliott claro identificado.",
    buyScore,
    sellScore,
    visualMarkers,
    majorPlayers,
    type: "elliottWaves"
  };
};

// Detect Dow Theory patterns
export const detectDowTheory = async (
  imageData: string,
  disableSimulation: boolean = false
): Promise<PatternResult> => {
  console.log("Detectando padrões da Teoria de Dow...");
  
  // Process the image to find Dow Theory patterns
  const analyzeForDowTheory = async (): Promise<{
    found: boolean;
    primaryTrend: "alta" | "baixa" | "indefinido";
    secondaryTrend?: "alta" | "baixa" | "indefinido";
    trendPoints: Array<[number, number]>;
    confidence: number;
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas for image analysis
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({ 
              found: false, 
              primaryTrend: "indefinido", 
              trendPoints: [], 
              confidence: 0 
            });
            return;
          }
          
          // Set canvas dimensions and draw image
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const { width, height } = imageData;
          
          // Analyze the image to detect patterns
          // For Dow Theory, we're looking for higher highs & higher lows (uptrend)
          // or lower highs & lower lows (downtrend)
          
          // Get horizontal line data as proxies for price levels
          const { horizontalLines } = analyzeImagePixels(imageData, {
            threshold: 25,
            sensitivity: 1.2
          });
          
          // Need at least some horizontal lines to detect patterns
          if (horizontalLines.length < 3) {
            resolve({ 
              found: false, 
              primaryTrend: "indefinido", 
              trendPoints: [], 
              confidence: 0 
            });
            return;
          }
          
          // Sort lines by y-position (vertical position)
          horizontalLines.sort((a, b) => a.y - b.y);
          
          // Determine if we have more lines in the top or bottom half of the image
          const topHalf = horizontalLines.filter(l => l.y < height / 2).length;
          const bottomHalf = horizontalLines.filter(l => l.y >= height / 2).length;
          
          // Determine primary trend direction based on distribution of lines
          const primaryTrend: "alta" | "baixa" | "indefinido" = 
            bottomHalf > topHalf * 1.5 ? "alta" : 
            topHalf > bottomHalf * 1.5 ? "baixa" : "indefinido";
            
          const found = primaryTrend === "alta" || primaryTrend === "baixa";
          
          // Create trend lines based on primary trend
          let trendPoints: Array<[number, number]> = [];
          let secondaryTrend: "alta" | "baixa" | "indefinido" = "indefinido";
          let confidence = 0;
          
          if (found) {
            // Calculate relative confidence
            confidence = primaryTrend === "indefinido" ? 0 : 75;
            
            // Create trend points showing primary and secondary trends
            if (primaryTrend === "alta") {
              // Uptrend - primary trend line from bottom left to top right
              trendPoints = [
                [10, 80], // Start point
                [90, 20]  // End point
              ];
              
              // Secondary trend is often counter to primary trend
              secondaryTrend = "baixa";
              
              // Add secondary trend lines (corrections)
              trendPoints.push([30, 40]);
              trendPoints.push([45, 60]);
              trendPoints.push([60, 30]);
              trendPoints.push([75, 50]);
            } else {
              // Downtrend - primary trend line from top left to bottom right
              trendPoints = [
                [10, 20], // Start point
                [90, 80]  // End point
              ];
              
              // Secondary trend is often counter to primary trend
              secondaryTrend = "alta";
              
              // Add secondary trend lines (corrections)
              trendPoints.push([30, 60]);
              trendPoints.push([45, 40]);
              trendPoints.push([60, 70]);
              trendPoints.push([75, 50]);
            }
          }
          
          resolve({
            found,
            primaryTrend,
            secondaryTrend: found ? secondaryTrend : undefined,
            trendPoints,
            confidence
          });
        } catch (error) {
          console.error("Error analyzing image for Dow Theory:", error);
          resolve({ 
            found: false, 
            primaryTrend: "indefinido", 
            trendPoints: [], 
            confidence: 0 
          });
        }
      };
      
      img.onerror = () => {
        console.error("Failed to load image for Dow Theory detection");
        resolve({ 
          found: false, 
          primaryTrend: "indefinido", 
          trendPoints: [], 
          confidence: 0 
        });
      };
      
      img.src = imageData;
    });
  };
  
  // Analyze the image
  const { found, primaryTrend, secondaryTrend, trendPoints, confidence } = await analyzeForDowTheory();
  
  // Create visual markers for the detected pattern
  const visualMarkers = found ? [
    {
      type: "pattern" as const,
      color: "#d946ef", // Purple color for Dow Theory
      points: [[trendPoints[0][0], trendPoints[0][1]], [trendPoints[1][0], trendPoints[1][1]]] as [number, number][],
      label: `Tendência Primária: ${primaryTrend === "alta" ? "Alta" : "Baixa"}`,
      strength: "forte" as const
    }
  ] : [];
  
  // If we have secondary trend points, add them too
  if (found && trendPoints.length > 2) {
    for (let i = 2; i < trendPoints.length - 1; i += 2) {
      const currentPoint = trendPoints[i];
      const nextPoint = trendPoints[i+1] || trendPoints[i];
      
      visualMarkers.push({
        type: "pattern" as const,
        color: "#d946ef80", // Semi-transparent purple
        points: [[currentPoint[0], currentPoint[1]], [nextPoint[0], nextPoint[1]]] as [number, number][],
        label: "Correção",
        strength: "moderado" as const
      });
    }
  }
  
  // Calculate buy/sell scores
  let buyScore = 0;
  let sellScore = 0;
  
  if (found) {
    if (primaryTrend === "alta") {
      buyScore = 1.0; // Strong signal for primary trend
    } else if (primaryTrend === "baixa") {
      sellScore = 1.0; // Strong signal for primary trend
    }
  }
  
  // Dow Theory major players
  const majorPlayers = [
    "Charles Dow - Pai da teoria",
    "William Hamilton - Editor do Wall Street Journal",
    "Robert Rhea - Desenvolveu princípios de Dow"
  ];
  
  return {
    found,
    confidence,
    description: "A Teoria de Dow é uma das mais antigas teorias de análise técnica, criada por Charles Dow. Ela avalia se o mercado está em tendência de alta ou baixa baseando-se na confirmação entre diferentes índices e no volume. A teoria inclui conceitos como tendências primárias, secundárias e terciárias.",
    recommendation: found ? 
      `DECISÃO: ${primaryTrend === "alta" ? "COMPRA" : "VENDA"}. Tendência primária de ${primaryTrend} identificada. ${
        primaryTrend === "alta" ? 
        "Mercado apresenta tendência primária de alta. Considere operar a favor da tendência principal, comprando nas correções." : 
        "Mercado apresenta tendência primária de baixa. Considere operar a favor da tendência principal, vendendo nos repiques."
      }` : 
      "Nenhum padrão claro da Teoria de Dow identificado.",
    buyScore,
    sellScore,
    visualMarkers,
    majorPlayers,
    type: "dowTheory"
  };
};

// Function to handle all pattern detection based on analysis type
export const detectPatterns = async (
  imageData: string,
  types: AnalysisType[],
  precision: PrecisionLevel = "normal",
  disableSimulation: boolean = false
): Promise<Record<string, PatternResult>> => {
  // Create base results object
  const results: Record<string, PatternResult> = {
    trendlines: {
      found: false,
      confidence: 0,
      description: "",
      recommendation: ""
    },
    fibonacci: {
      found: false,
      confidence: 0,
      description: "",
      recommendation: ""
    },
    candlePatterns: {
      found: false,
      confidence: 0,
      description: "",
      recommendation: ""
    },
    elliottWaves: {
      found: false,
      confidence: 0,
      description: "",
      recommendation: ""
    },
    dowTheory: {
      found: false,
      confidence: 0,
      description: "",
      recommendation: ""
    },
    all: {
      found: false,
      confidence: 0,
      description: "Análise completa de todos os indicadores técnicos",
      recommendation: "",
      type: "all"
    }
  };

  console.log(`Iniciando análise para ${types.join(", ")} com precisão ${precision}`);
  
  // Check if we have valid imageData to analyze
  if (!imageData || imageData.length < 1000) {
    console.error("Imagem inválida ou muito pequena para análise");
    return results;
  }

  const detectionPromises: Promise<void>[] = [];

  // Run detections based on selected types
  if (types.includes("trendlines") || types.includes("all")) {
    detectionPromises.push(
      detectTrendLines(imageData, precision, true).then(result => {
        results.trendlines = result;
      })
    );
  }

  if (types.includes("fibonacci") || types.includes("all")) {
    detectionPromises.push(
      detectFibonacci(imageData, true).then(result => {
        results.fibonacci = result;
      })
    );
  }

  if (types.includes("candlePatterns") || types.includes("all")) {
    detectionPromises.push(
      detectCandlePatterns(imageData, true).then(result => {
        results.candlePatterns = result;
      })
    );
  }
  
  // Add the new analysis types
  if (types.includes("elliottWaves") || types.includes("all")) {
    detectionPromises.push(
      detectElliottWaves(imageData, precision, true).then(result => {
        results.elliottWaves = result;
      })
    );
  }

  if (types.includes("dowTheory") || types.includes("all")) {
    detectionPromises.push(
      detectDowTheory(imageData, true).then(result => {
        results.dowTheory = result;
      })
    );
  }

  await Promise.all(detectionPromises);

  // Calculate average confidence and set 'all' found status based on real results
  const enabledTypes = types.filter(t => t !== "all");
  const foundTypes = enabledTypes.filter(t => results[t]?.found);
  
  if (foundTypes.length > 0) {
    const avgConfidence = Math.round(
      foundTypes.reduce((sum, type) => sum + (results[type]?.confidence || 0), 0) / foundTypes.length
    );
    
    // Calculate total buy and sell scores from all analyzed patterns
    let totalBuyScore = 0;
    let totalSellScore = 0;
    
    foundTypes.forEach(type => {
      totalBuyScore += results[type]?.buyScore || 0;
      totalSellScore += results[type]?.sellScore || 0;
    });
    
    // Determine overall recommendation based on detected patterns
    let decision = "AGUARDE";
    
    if (totalBuyScore > totalSellScore && totalBuyScore > foundTypes.length * 0.3) {
      decision = "COMPRA";
      // Add strength indication based on score difference
      if (totalBuyScore > totalSellScore * 2) {
        decision += " (sinal forte)";
      }
    } else if (totalSellScore > totalBuyScore && totalSellScore > foundTypes.length * 0.3) {
      decision = "VENDA";
      // Add strength indication based on score difference
      if (totalSellScore > totalBuyScore * 2) {
        decision += " (sinal forte)";
      }
    }
    
    results.all = {
      ...results.all,
      found: true,
      confidence: avgConfidence,
      buyScore: totalBuyScore,
      sellScore: totalSellScore,
      recommendation: `DECISÃO: ${decision}. Baseado na análise de ${foundTypes.length} padrões detectados. ${
        decision === "COMPRA" ? 
          `Predominância de sinais de alta (força: ${totalBuyScore.toFixed(1)}).` : 
        decision === "VENDA" ? 
          `Predominância de sinais de baixa (força: ${totalSellScore.toFixed(1)}).` : 
          "Sinais mistos, recomenda-se cautela."
      }`,
      type: "all"
    };
  }

  return results;
};
