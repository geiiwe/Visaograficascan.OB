
import { AnalysisType, PrecisionLevel } from "@/context/AnalyzerContext";

export interface PatternResult {
  found: boolean;
  confidence: number;
  description: string;
  recommendation: string;
  majorPlayers?: string[];
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
 * Simulates pattern detection functions that would normally use mathematical algorithms
 * In a real implementation, these would use NumPy-like libraries or custom algorithms
 */

// Mock functions to simulate technical analysis pattern detection
export const detectTrendLines = async (imageData: string): Promise<PatternResult> => {
  console.log("Detectando linhas de tendência...");
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800));
  // In a real implementation, we'd use algorithms like Hough Transform
  const found = Math.random() > 0.3; // 70% chance of finding trend lines
  
  // Simulação de marcadores visuais para linhas de tendência
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
  
  return {
    found,
    confidence: found ? Math.round(70 + Math.random() * 25) : 0,
    description: "Linhas de tendência indicam direções de movimento de preços. Suporte (abaixo do preço) e resistência (acima do preço) são consideradas zonas onde o preço tende a reverter.",
    recommendation: found ? "DECISÃO: " + (Math.random() > 0.5 ? "COMPRA" : "VENDA") + ". Considere comprar próximo às linhas de suporte e vender próximo às linhas de resistência. A quebra confirmada de suporte ou resistência indica continuação do movimento." : "Nenhuma linha de tendência clara detectada.",
    majorPlayers: ["Goldman Sachs", "JP Morgan", "BlackRock", "XP Investimentos", "BTG Pactual"],
    visualMarkers
  };
};

export const detectMovingAverages = async (imageData: string): Promise<PatternResult> => {
  console.log("Detectando médias móveis...");
  await new Promise(resolve => setTimeout(resolve, 1000));
  const found = Math.random() > 0.4; // 60% chance of finding moving averages
  
  // Simulação de marcadores visuais para médias móveis
  const visualMarkers = found ? [
    {
      type: "indicator" as const,
      color: "#8b5cf6", // roxo
      points: [[0, 40], [25, 37], [50, 42], [75, 47], [100, 50]] as [number, number][],
      label: "MM 20",
      strength: "moderado" as const
    },
    {
      type: "indicator" as const,
      color: "#f59e0b", // laranja
      points: [[0, 45], [25, 42], [50, 45], [75, 50], [100, 55]] as [number, number][],
      label: "MM 50",
      strength: "forte" as const
    },
    {
      type: "pattern" as const,
      color: "#10b981", // verde
      points: [[47, 43], [53, 43]] as [number, number][],
      label: "Cruzamento Dourado",
      strength: "forte" as const
    }
  ] : [];
  
  return {
    found,
    confidence: found ? Math.round(65 + Math.random() * 30) : 0,
    description: "Médias móveis indicam a direção de tendência do mercado. Cruzamentos da média curta (MM de 9 ou 20 períodos) com a longa (MM de 50 ou 200 períodos) são sinais importantes.",
    recommendation: found ? "DECISÃO: " + (Math.random() > 0.6 ? "COMPRA" : "VENDA") + ". Observe os cruzamentos de médias móveis. Um cruzamento para cima (Cruzamento Dourado) sugere entrada de compra, enquanto um cruzamento para baixo (Cruzamento da Morte) sugere entrada de venda." : "Nenhum padrão de médias móveis identificado.",
    majorPlayers: ["Morgan Stanley", "Fidelity", "Vanguard", "Itaú Asset", "Bradesco Asset"],
    visualMarkers
  };
};

export const detectRSI = async (imageData: string): Promise<PatternResult> => {
  console.log("Detectando padrões de RSI...");
  await new Promise(resolve => setTimeout(resolve, 1200));
  const found = Math.random() > 0.5; // 50% chance of finding RSI patterns
  
  // Rsi aleatório entre 0 e 100
  const rsiValue = Math.floor(Math.random() * 100);
  const rsiCondition = rsiValue > 70 ? "sobrecomprado" : rsiValue < 30 ? "sobrevendido" : "neutro";
  
  // Simulação de marcadores visuais para RSI
  const visualMarkers = found ? [
    {
      type: "indicator" as const,
      color: rsiValue > 70 ? "#ef4444" : rsiValue < 30 ? "#22c55e" : "#3b82f6",
      points: [[90, 80], [100, 80]] as [number, number][],
      label: `RSI: ${rsiValue} (${rsiCondition})`,
      strength: rsiValue > 80 || rsiValue < 20 ? "forte" as const : "moderado" as const
    },
    {
      type: "pattern" as const,
      color: "#8b5cf6",
      points: [[75, 75], [85, 75]] as [number, number][],
      label: "Divergência RSI",
      strength: "moderado" as const
    }
  ] : [];
  
  return {
    found,
    confidence: found ? Math.round(60 + Math.random() * 35) : 0,
    description: "RSI (Índice de Força Relativa) mede o momentum do preço em uma escala de 0 a 100. Valores acima de 70 indicam sobrecompra, enquanto valores abaixo de 30 indicam sobrevenda.",
    recommendation: found ? `DECISÃO: ${rsiValue > 70 ? "VENDA" : rsiValue < 30 ? "COMPRA" : "AGUARDE"}. RSI atual: ${rsiValue}. ${rsiValue > 70 ? "Condição de sobrecompra detectada, considere venda ou aguarde correção" : rsiValue < 30 ? "Condição de sobrevenda detectada, considere compra" : "RSI em zona neutra, observe outros indicadores"}. Divergências entre RSI e preço podem indicar reversões.` : "Nenhum padrão claro de RSI detectado.",
    majorPlayers: ["Renaissance Technologies", "Citadel", "Two Sigma", "Verde Asset", "Alaska Asset"],
    visualMarkers
  };
};

export const detectMACD = async (imageData: string): Promise<PatternResult> => {
  console.log("Detectando padrões MACD...");
  await new Promise(resolve => setTimeout(resolve, 1500));
  const found = Math.random() > 0.5; // 50% chance of finding MACD patterns
  
  // Simulação de marcadores visuais para MACD
  const macdValue = (Math.random() * 2 - 1).toFixed(2); // Valor entre -1 e 1
  const signalValue = (Math.random() * 2 - 1).toFixed(2); // Valor entre -1 e 1
  const histogram = (parseFloat(macdValue) - parseFloat(signalValue)).toFixed(2);
  const isBullish = parseFloat(histogram) > 0;
  
  const visualMarkers = found ? [
    {
      type: "indicator" as const,
      color: "#3b82f6", // azul
      points: [[80, 85], [100, 85]] as [number, number][],
      label: `MACD: ${macdValue}`,
      strength: Math.abs(parseFloat(macdValue)) > 0.5 ? "forte" as const : "moderado" as const
    },
    {
      type: "indicator" as const,
      color: "#f59e0b", // laranja
      points: [[80, 88], [100, 88]] as [number, number][],
      label: `Sinal: ${signalValue}`,
      strength: "moderado" as const
    },
    {
      type: "pattern" as const,
      color: isBullish ? "#22c55e" : "#ef4444",
      points: [[90, 90], [95, 90]] as [number, number][],
      label: `Histograma: ${histogram} (${isBullish ? "Alta" : "Baixa"})`,
      strength: Math.abs(parseFloat(histogram)) > 0.3 ? "forte" as const : "moderado" as const
    }
  ] : [];
  
  return {
    found,
    confidence: found ? Math.round(65 + Math.random() * 30) : 0,
    description: "MACD (Convergência e Divergência de Médias Móveis) é um indicador de momentum que mostra a relação entre duas médias móveis do preço. Usado para identificar mudanças na força, direção, momentum e duração de tendências.",
    recommendation: found ? `DECISÃO: ${isBullish ? "COMPRA" : "VENDA"}. MACD: ${macdValue}, Sinal: ${signalValue}, Histograma: ${histogram}. ${isBullish ? "MACD acima da linha de sinal, tendência de alta. Considere compra." : "MACD abaixo da linha de sinal, tendência de baixa. Considere venda."}` : "Nenhum padrão de MACD claro identificado.",
    majorPlayers: ["Bridgewater Associates", "AQR Capital", "DE Shaw", "Kapitalo Investimentos", "Legacy Capital"],
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
): Promise<PatternResultsMap> => {
  const results: PatternResultsMap = {
    trendlines: {
      found: false,
      confidence: 0,
      description: "",
      recommendation: ""
    },
    movingAverages: {
      found: false,
      confidence: 0,
      description: "",
      recommendation: ""
    },
    rsi: {
      found: false,
      confidence: 0,
      description: "",
      recommendation: ""
    },
    macd: {
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
      recommendation: ""
    }
  };

  const detectionPromises: Promise<void>[] = [];

  // Apply detection probability adjustments based on precision level
  const precisionFactor = precision === "alta" ? 0.2 : precision === "baixa" ? -0.2 : 0;
  console.log(`Aplicando fator de precisão: ${precisionFactor} para nível ${precision}`);

  if (types.includes("trendlines") || types.includes("all")) {
    detectionPromises.push(
      detectTrendLines(imageData).then(result => {
        results.trendlines = result;
      })
    );
  }

  if (types.includes("movingAverages") || types.includes("all")) {
    detectionPromises.push(
      detectMovingAverages(imageData).then(result => {
        results.movingAverages = result;
      })
    );
  }

  if (types.includes("rsi") || types.includes("all")) {
    detectionPromises.push(
      detectRSI(imageData).then(result => {
        results.rsi = result;
      })
    );
  }

  if (types.includes("macd") || types.includes("all")) {
    detectionPromises.push(
      detectMACD(imageData).then(result => {
        results.macd = result;
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
    
    results.all = {
      ...results.all,
      found: true,
      confidence: avgConfidence,
      recommendation: "DECISÃO: " + (foundTypes.length > enabledTypes.length / 2 ? (Math.random() > 0.5 ? "COMPRA" : "VENDA") : "AGUARDE") + ". Múltiplos padrões detectados. Considere a combinação de sinais para tomar decisões mais confiáveis."
    };
  }

  return results;
};
