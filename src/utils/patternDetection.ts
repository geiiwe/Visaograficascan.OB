import { AnalysisType, PrecisionLevel } from "@/context/AnalyzerContext";

export interface PatternResult {
  found: boolean;
  confidence: number;
  description: string;
  recommendation: string;
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
 * In a real implementation, these would use computer vision algorithms 
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

// Deterministic random function based on seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// More deterministic pattern detection based on the image data
export const detectTrendLines = async (imageData: string, precision: PrecisionLevel = "normal"): Promise<PatternResult> => {
  console.log(`Detectando linhas de tendência com precisão ${precision}...`);
  
  // Get image hash for consistent results
  const imageHash = getImageHash(imageData);
  
  // Simulate processing time based on precision
  const processingTime = precision === "alta" ? 1200 : precision === "normal" ? 800 : 500;
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Adjust detection probability based on precision and image hash
  const randomFactor = seededRandom(imageHash);
  const detectionThreshold = precision === "alta" ? 0.2 : 
                             precision === "normal" ? 0.3 : 0.4;
  const found = randomFactor > detectionThreshold; // More deterministic based on image
  
  // Generate visual markers based on the image hash for consistency
  const visualMarkers = found ? [
    {
      type: "support" as const,
      color: "#22c55e", // verde
      points: [[20, 80], [80, 85]] as [number, number][],
      label: "Suporte",
      strength: "forte" as const
    },
    {
      type: "resistance" as const,
      color: "#ef4444", // vermelho
      points: [[10, 30], [90, 20]] as [number, number][],
      label: "Resistência",
      strength: "moderado" as const
    },
    {
      type: "trendline" as const,
      color: "#3b82f6", // azul
      points: [[0, 45], [100, 25]] as [number, number][],
      label: "Tendência Primária",
      strength: "forte" as const
    }
  ] : [];
  
  // Better confidence with higher precision, but still consistent for the same image
  const baseConfidence = precision === "alta" ? 80 : precision === "normal" ? 70 : 60;
  const confVariance = precision === "alta" ? 15 : 25;
  const confidence = found ? Math.round(baseConfidence + (seededRandom(imageHash + 1) * confVariance)) : 0;
  
  return {
    found,
    confidence,
    description: "Linhas de tendência indicam direções de movimento de preços. Suporte (abaixo do preço) e resistência (acima do preço) são consideradas zonas onde o preço tende a reverter.",
    recommendation: found ? "DECISÃO: " + (seededRandom(imageHash + 2) > 0.5 ? "COMPRA" : "VENDA") + ". Considere comprar próximo às linhas de suporte e vender próximo às linas de resistência. A quebra confirmada de suporte ou resistência indica continuação do movimento." : "Nenhuma linha de tendência clara detectada.",
    majorPlayers: ["Goldman Sachs", "JP Morgan", "BlackRock", "XP Investimentos", "BTG Pactual"],
    type: "trendlines",
    visualMarkers
  };
};

export const detectFibonacci = async (imageData: string): Promise<PatternResult> => {
  console.log("Detectando níveis de Fibonacci...");
  await new Promise(resolve => setTimeout(resolve, 1300));
  const found = Math.random() > 0.4; // 60% chance of finding fibonacci levels
  
  // Simulação de marcadores visuais para níveis de Fibonacci
  const visualMarkers = found ? [
    {
      type: "indicator" as const,
      color: "#e11d48", // vermelho escuro
      points: [[0, 20], [100, 20]] as [number, number][],
      label: "Fib 0%",
      strength: "forte" as const
    },
    {
      type: "indicator" as const,
      color: "#f97316", // laranja
      points: [[0, 32], [100, 32]] as [number, number][],
      label: "Fib 23.6%",
      strength: "moderado" as const
    },
    {
      type: "indicator" as const,
      color: "#eab308", // amarelo
      points: [[0, 45], [100, 45]] as [number, number][],
      label: "Fib 38.2%",
      strength: "forte" as const
    },
    {
      type: "indicator" as const,
      color: "#22c55e", // verde
      points: [[0, 57], [100, 57]] as [number, number][],
      label: "Fib 50%",
      strength: "forte" as const
    },
    {
      type: "indicator" as const,
      color: "#0ea5e9", // azul claro
      points: [[0, 70], [100, 70]] as [number, number][],
      label: "Fib 61.8%",
      strength: "forte" as const
    },
    {
      type: "indicator" as const,
      color: "#8b5cf6", // roxo
      points: [[0, 82], [100, 82]] as [number, number][],
      label: "Fib 100%",
      strength: "forte" as const
    }
  ] : [];
  
  return {
    found,
    confidence: found ? Math.round(70 + Math.random() * 25) : 0,
    description: "Os níveis de Fibonacci são usados para identificar possíveis níveis de suporte, resistência e alvos de preço. Os principais níveis são 23.6%, 38.2%, 50%, 61.8% e 100%.",
    recommendation: found ? "DECISÃO: " + (Math.random() > 0.5 ? "COMPRA em retrações" : "VENDA em extensões") + ". Observe os níveis de Fibonacci como possíveis zonas de reversão ou continuação. Operações de compra perto de retrações de 38.2% e 50% em tendências de alta têm alta probabilidade de sucesso." : "Nenhum padrão de Fibonacci claro identificado.",
    majorPlayers: ["Point72", "Elliott Management", "Tudor Investment", "Absolute Investimentos", "Dahlia Capital"],
    visualMarkers
  };
};

export const detectCandlePatterns = async (imageData: string): Promise<PatternResult> => {
  console.log("Detectando padrões de candles...");
  await new Promise(resolve => setTimeout(resolve, 1100));
  const found = Math.random() > 0.6; // 40% chance of finding candle patterns
  
  // Array de possíveis padrões de candle
  const candlePatterns = [
    "Doji", "Martelo", "Engolfo de Alta", "Engolfo de Baixa", 
    "Estrela da Manhã", "Estrela da Noite", "Três Soldados Brancos",
    "Três Corvos Negros", "Harami de Alta", "Harami de Baixa"
  ];
  
  // Escolhe um padrão aleatório
  const randomPattern = candlePatterns[Math.floor(Math.random() * candlePatterns.length)];
  
  // Define se é padrão de alta ou baixa
  const isBullish = ["Martelo", "Engolfo de Alta", "Estrela da Manhã", "Três Soldados Brancos", "Harami de Alta"].includes(randomPattern);
  
  // Simulação de marcadores visuais para padrões de candle
  const visualMarkers = found ? [
    {
      type: "pattern" as const,
      color: isBullish ? "#22c55e" : "#ef4444",
      points: [[75, 50], [85, 50]] as [number, number][],
      label: randomPattern,
      strength: Math.random() > 0.5 ? "forte" as const : "moderado" as const
    }
  ] : [];
  
  return {
    found,
    confidence: found ? Math.round(65 + Math.random() * 30) : 0,
    description: "Padrões de candles são formações específicas que indicam possíveis reversões ou continuações de tendência. Eles revelam o sentimento e a psicologia do mercado em períodos específicos.",
    recommendation: found ? `DECISÃO: ${isBullish ? "COMPRA" : "VENDA"}. Padrão de candle "${randomPattern}" detectado. ${isBullish ? "Este é um padrão de alta, considere uma entrada de compra com stop loss abaixo do padrão." : "Este é um padrão de baixa, considere uma entrada de venda com stop loss acima do padrão."}` : "Nenhum padrão de candle claro identificado.",
    majorPlayers: ["Interactive Brokers", "Charles Schwab", "TradeStation", "Clear Corretora", "XP Investimentos"],
    visualMarkers
  };
};

export const detectElliottWaves = async (imageData: string): Promise<PatternResult> => {
  console.log("Detectando padrões de Ondas de Elliott...");
  await new Promise(resolve => setTimeout(resolve, 1600));
  const found = Math.random() > 0.6; // 40% chance of finding Elliott patterns
  
  // Determina qual onda foi detectada (1-5 para ondas de impulso, A-C para ondas corretivas)
  const waveTypes = ["Impulso", "Corretiva"];
  const waveType = waveTypes[Math.floor(Math.random() * waveTypes.length)];
  
  let waveName, isBullish, description, recommendation;
  
  if (waveType === "Impulso") {
    const waveNumber = Math.floor(Math.random() * 5) + 1;
    waveName = `Onda ${waveNumber}`;
    isBullish = waveNumber !== 4; // Ondas 1, 2, 3, 5 são geralmente favoráveis para compra
    description = "Teoria das Ondas de Elliott divide os movimentos do mercado em 5 ondas de impulso (1, 3, 5 na direção da tendência principal; 2, 4 contra a tendência) seguidas por 3 ondas corretivas (A, B, C).";
    
    if (waveNumber === 1) {
      recommendation = "DECISÃO: COMPRA. Primeira onda de impulso detectada, início provável de uma nova tendência de alta.";
    } else if (waveNumber === 2) {
      recommendation = "DECISÃO: ESPERE. Segunda onda (corretiva) em progresso, aguarde para possível entrada na onda 3.";
    } else if (waveNumber === 3) {
      recommendation = "DECISÃO: COMPRA. Terceira onda detectada - geralmente a mais forte e longa, excelente para entradas de compra.";
    } else if (waveNumber === 4) {
      recommendation = "DECISÃO: ESPERE. Quarta onda (corretiva) em progresso, aguarde para possível entrada na onda 5.";
    } else {
      recommendation = "DECISÃO: REALIZE LUCROS. Quinta onda de impulso detectada, considere realização de lucros pois uma correção ABC pode seguir.";
    }
  } else {
    const waveLetters = ["A", "B", "C"];
    const waveLetter = waveLetters[Math.floor(Math.random() * 3)];
    waveName = `Onda ${waveLetter}`;
    isBullish = waveLetter === "B"; // Apenas onda B é contra-tendência numa correção
    description = "As ondas corretivas (A, B, C) ocorrem após um movimento completo de 5 ondas, corrigindo parcialmente o movimento anterior.";
    
    if (waveLetter === "A") {
      recommendation = "DECISÃO: ESPERE. Onda corretiva A detectada, o mercado está iniciando uma correção. Aguarde completar o padrão ABC.";
    } else if (waveLetter === "B") {
      recommendation = "DECISÃO: VENDA. Onda corretiva B detectada, este é um repique contra a nova tendência de baixa. Oportunidade para venda.";
    } else {
      recommendation = "DECISÃO: PREPARE-SE PARA COMPRA. Onda C finaliza o padrão corretivo. Prepare-se para retomada da tendência principal após completar esta onda.";
    }
  }
  
  // Simulação de marcadores visuais para Ondas de Elliott
  const visualMarkers = found ? [
    {
      type: "pattern" as const,
      color: isBullish ? "#22c55e" : "#ef4444",
      points: [[60, 55], [90, 55]] as [number, number][],
      label: waveName,
      strength: Math.random() > 0.5 ? "forte" as const : "moderado" as const
    },
    {
      type: "trendline" as const,
      color: "#3b82f6", // azul
      points: [[10, 50], [100, 35]] as [number, number][],
      label: "Tendência Elliott",
      strength: "forte" as const
    }
  ] : [];
  
  return {
    found,
    confidence: found ? Math.round(60 + Math.random() * 30) : 0,
    description,
    recommendation: found ? recommendation : "Nenhum padrão de Ondas de Elliott identificado.",
    majorPlayers: ["Renaissance Technologies", "Bridgewater Associates", "D.E. Shaw", "AQR Capital", "Brevan Howard"],
    visualMarkers
  };
};

export const detectDowTheory = async (imageData: string): Promise<PatternResult> => {
  console.log("Analisando Teoria de Dow...");
  await new Promise(resolve => setTimeout(resolve, 1400));
  const found = Math.random() > 0.5; // 50% chance of finding Dow patterns
  
  // Determina qual princípio da Teoria de Dow foi identificado
  const dowPrinciples = [
    "Médias Descontam Tudo", 
    "Mercado Tem Três Tendências", 
    "Tendências Principais Têm Três Fases",
    "Médias Devem Confirmar-se Mutuamente",
    "Volume Deve Confirmar Tendência",
    "Tendência Permanece até Sinal Definitivo"
  ];
  
  const principle = dowPrinciples[Math.floor(Math.random() * dowPrinciples.length)];
  const isBullish = Math.random() > 0.5;
  
  let description, recommendation;
  
  description = "A Teoria de Dow é a base da análise técnica moderna. Ela estabelece que os preços se movem em tendências e que o volume deve confirmar esse movimento.";
  
  if (principle === "Médias Descontam Tudo") {
    recommendation = `DECISÃO: ${isBullish ? "COMPRA" : "VENDA"}. Princípio "Médias Descontam Tudo" detectado. O preço atual já reflete todas as informações conhecidas pelo mercado.`;
  } else if (principle === "Mercado Tem Três Tendências") {
    recommendation = `DECISÃO: ${isBullish ? "COMPRA" : "VENDA"}. Princípio "Mercado Tem Três Tendências" identificado. ${isBullish ? "Tendência primária de alta identificada." : "Tendência primária de baixa identificada."}`;
  } else if (principle === "Tendências Principais Têm Três Fases") {
    const phases = ["acumulação", "participação pública", "distribuição"];
    const phase = phases[Math.floor(Math.random() * phases.length)];
    recommendation = `DECISÃO: ${phase === "acumulação" ? "COMPRA" : phase === "distribuição" ? "VENDA" : "MANTENHA POSIÇÃO"}. Fase de ${phase} identificada no ciclo de mercado.`;
  } else if (principle === "Médias Devem Confirmar-se Mutuamente") {
    recommendation = `DECISÃO: ${isBullish ? "COMPRA" : "VENDA"}. Diferentes índices/ativos estão confirmando a mesma direção de movimento, fortalecendo o sinal.`;
  } else if (principle === "Volume Deve Confirmar Tendência") {
    recommendation = `DECISÃO: ${isBullish ? "COMPRA" : "VENDA"}. ${isBullish ? "Volume crescente em movimento de alta" : "Volume crescente em movimento de baixa"} confirma a tendência atual.`;
  } else {
    recommendation = `DECISÃO: MANTENHA POSIÇÃO. Princípio "Tendência Permanece até Sinal Definitivo" detectado. Não há sinais claros de reversão, mantenha a posição atual.`;
  }
  
  // Simulação de marcadores visuais para Teoria de Dow
  const visualMarkers = found ? [
    {
      type: "pattern" as const,
      color: "#8b5cf6", // roxo
      points: [[50, 40], [80, 40]] as [number, number][],
      label: principle,
      strength: "forte" as const
    },
    {
      type: "trendline" as const,
      color: isBullish ? "#22c55e" : "#ef4444",
      points: [[5, isBullish ? 75 : 25], [95, isBullish ? 25 : 75]] as [number, number][],
      label: isBullish ? "Tendência Primária de Alta" : "Tendência Primária de Baixa",
      strength: "forte" as const
    }
  ] : [];
  
  return {
    found,
    confidence: found ? Math.round(65 + Math.random() * 30) : 0,
    description,
    recommendation: found ? recommendation : "Nenhum padrão claro da Teoria de Dow identificado.",
    majorPlayers: ["JP Morgan", "Goldman Sachs", "Morgan Stanley", "Itaú BBA", "BTG Pactual"],
    visualMarkers
  };
};

// Function to handle all pattern detection based on analysis type
export const detectPatterns = async (
  imageData: string,
  types: AnalysisType[],
  precision: PrecisionLevel = "normal"
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

  // Apply detection probability adjustments based on precision level
  const precisionFactor = precision === "alta" ? 0.2 : precision === "baixa" ? -0.2 : 0;
  console.log(`Aplicando fator de precisão: ${precisionFactor} para nível ${precision}`);

  // Run detections based on selected types
  if (types.includes("trendlines") || types.includes("all")) {
    detectionPromises.push(
      detectTrendLines(imageData, precision).then(result => {
        results.trendlines = result;
      })
    );
  }

  if (types.includes("fibonacci") || types.includes("all")) {
    detectionPromises.push(
      detectFibonacci(imageData).then(result => {
        results.fibonacci = result;
      })
    );
  }

  if (types.includes("candlePatterns") || types.includes("all")) {
    detectionPromises.push(
      detectCandlePatterns(imageData).then(result => {
        results.candlePatterns = result;
      })
    );
  }

  if (types.includes("elliottWaves") || types.includes("all")) {
    detectionPromises.push(
      detectElliottWaves(imageData).then(result => {
        results.elliottWaves = result;
      })
    );
  }

  if (types.includes("dowTheory") || types.includes("all")) {
    detectionPromises.push(
      detectDowTheory(imageData).then(result => {
        results.dowTheory = result;
      })
    );
  }

  await Promise.all(detectionPromises);

  // Calculate average confidence and set 'all' found status
  const enabledTypes = types.filter(t => t !== "all");
  const foundTypes = enabledTypes.filter(t => results[t]?.found);
  
  if (foundTypes.length > 0) {
    const avgConfidence = Math.round(
      foundTypes.reduce((sum, type) => sum + (results[type]?.confidence || 0), 0) / foundTypes.length
    );
    
    // Get image hash for consistent decisions
    const imageHash = getImageHash(imageData);
    const decision = foundTypes.length > enabledTypes.length / 2 ? 
      (precision === "alta" ? 
        (seededRandom(imageHash + 100) > 0.7 ? "COMPRA" : "VENDA") : 
        (seededRandom(imageHash + 101) > 0.5 ? "COMPRA" : "VENDA")) 
      : "AGUARDE";
    
    results.all = {
      ...results.all,
      found: true,
      confidence: avgConfidence,
      recommendation: `DECISÃO: ${decision}. Múltiplos padrões detectados. Considere a combinação de sinais para tomar decisões mais confiáveis.`,
      type: "all"
    };
  }

  return results;
};
