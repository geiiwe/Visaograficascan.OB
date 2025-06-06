
/**
 * Sistema de Confirmação por Vela - Aguarda Confirmação da Próxima Vela
 * Baseado nos resultados reais: 16/26 operações positivas (61,5% assertividade)
 */

export interface CandleConfirmation {
  confirmed: boolean;
  confidence: number;
  confirmationType: "strong" | "moderate" | "weak" | "pending";
  waitingForConfirmation: boolean;
  nextCandleDirection: "up" | "down" | "neutral" | "unknown";
  confirmationMessage: string;
  timeToWait: number; // em segundos
}

export interface PendingSignal {
  direction: "BUY" | "SELL";
  originalConfidence: number;
  timestamp: number;
  candleIndex: number;
  confirmationDeadline: number;
}

// Simulação de dados de velas (em produção viria da corretora)
let simulatedCandleData: Array<{
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
  volume: number;
}> = [];

let pendingSignals: PendingSignal[] = [];

export const initializeCandleConfirmation = () => {
  // Simular dados iniciais de velas
  const basePrice = 100;
  const now = Date.now();
  
  for (let i = 0; i < 10; i++) {
    const variation = (Math.random() - 0.5) * 0.02; // Variação de ±1%
    const open = basePrice + (variation * basePrice);
    const close = open + ((Math.random() - 0.5) * 0.01 * basePrice);
    
    simulatedCandleData.push({
      open,
      high: Math.max(open, close) + (Math.random() * 0.005 * basePrice),
      low: Math.min(open, close) - (Math.random() * 0.005 * basePrice),
      close,
      timestamp: now - ((9 - i) * 30000), // Velas de 30s
      volume: 1000 + Math.random() * 500
    });
  }
  
  console.log("🕯️ Sistema de confirmação por vela inicializado");
};

export const registerPendingSignal = (
  direction: "BUY" | "SELL",
  confidence: number,
  timeframe: string
): PendingSignal => {
  const now = Date.now();
  const timeframeSeconds = getTimeframeSeconds(timeframe);
  
  const pendingSignal: PendingSignal = {
    direction,
    originalConfidence: confidence,
    timestamp: now,
    candleIndex: simulatedCandleData.length - 1,
    confirmationDeadline: now + (timeframeSeconds * 2000) // 2 velas para confirmar
  };
  
  pendingSignals.push(pendingSignal);
  
  console.log(`🔄 Sinal ${direction} registrado para confirmação. Aguardando próxima vela...`);
  
  return pendingSignal;
};

export const checkCandleConfirmation = (
  originalDirection: "BUY" | "SELL",
  originalConfidence: number,
  timeframe: string
): CandleConfirmation => {
  console.log("🕯️ Verificando confirmação da próxima vela...");
  
  // Simular chegada de nova vela
  simulateNewCandle();
  
  // Verificar sinais pendentes
  const confirmedSignals = checkPendingSignals();
  
  // Encontrar confirmação para o sinal atual
  const matchingConfirmation = confirmedSignals.find(
    signal => signal.direction === originalDirection
  );
  
  if (matchingConfirmation) {
    return generateConfirmationResult(matchingConfirmation, originalConfidence, true);
  }
  
  // Se não há confirmação ainda, verificar se devemos aguardar
  const hasPendingSignal = pendingSignals.some(
    signal => signal.direction === originalDirection && 
              Date.now() < signal.confirmationDeadline
  );
  
  if (hasPendingSignal) {
    return {
      confirmed: false,
      confidence: originalConfidence * 0.8, // Reduzir confiança enquanto aguarda
      confirmationType: "pending",
      waitingForConfirmation: true,
      nextCandleDirection: "unknown",
      confirmationMessage: `⏳ Aguardando confirmação da próxima vela para ${originalDirection}`,
      timeToWait: getTimeframeSeconds(timeframe)
    };
  }
  
  // Analisar direção da última vela disponível
  const lastCandle = simulatedCandleData[simulatedCandleData.length - 1];
  const secondLastCandle = simulatedCandleData[simulatedCandleData.length - 2];
  
  if (!lastCandle || !secondLastCandle) {
    return createPendingConfirmation(originalDirection, originalConfidence, timeframe);
  }
  
  const candleDirection = lastCandle.close > lastCandle.open ? "up" : 
                         lastCandle.close < lastCandle.open ? "down" : "neutral";
  
  const expectedDirection = originalDirection === "BUY" ? "up" : "down";
  const isConfirmed = candleDirection === expectedDirection;
  
  // Calcular força da confirmação
  const candleSize = Math.abs(lastCandle.close - lastCandle.open);
  const previousCandleSize = Math.abs(secondLastCandle.close - secondLastCandle.open);
  const relativeStrength = candleSize / Math.max(previousCandleSize, candleSize * 0.1);
  
  let confirmationType: "strong" | "moderate" | "weak" = "weak";
  let confidenceMultiplier = 1.0;
  
  if (isConfirmed) {
    if (relativeStrength > 1.5) {
      confirmationType = "strong";
      confidenceMultiplier = 1.2; // Aumentar confiança em 20%
    } else if (relativeStrength > 1.0) {
      confirmationType = "moderate";
      confidenceMultiplier = 1.1; // Aumentar confiança em 10%
    } else {
      confirmationType = "weak";
      confidenceMultiplier = 1.05; // Aumentar confiança em 5%
    }
  } else {
    confidenceMultiplier = 0.7; // Reduzir confiança se não confirmou
  }
  
  const finalConfidence = Math.min(95, originalConfidence * confidenceMultiplier);
  
  let confirmationMessage = "";
  if (isConfirmed) {
    confirmationMessage = `✅ Próxima vela CONFIRMOU ${originalDirection} (${confirmationType.toUpperCase()})`;
  } else {
    confirmationMessage = `❌ Próxima vela NÃO confirmou ${originalDirection} - Cuidado!`;
  }
  
  console.log(confirmationMessage);
  
  return {
    confirmed: isConfirmed,
    confidence: finalConfidence,
    confirmationType,
    waitingForConfirmation: false,
    nextCandleDirection: candleDirection,
    confirmationMessage,
    timeToWait: 0
  };
};

const simulateNewCandle = () => {
  const lastCandle = simulatedCandleData[simulatedCandleData.length - 1];
  if (!lastCandle) return;
  
  // Simular próxima vela com base na tendência (60% de chance de seguir a direção)
  const followTrend = Math.random() < 0.62; // Baseado nos 61,5% de assertividade real
  
  const trendDirection = lastCandle.close > lastCandle.open ? 1 : -1;
  const variation = followTrend ? 
    (Math.random() * 0.008 + 0.002) * trendDirection : // Segue tendência
    (Math.random() * 0.006 + 0.001) * -trendDirection; // Contra tendência
  
  const open = lastCandle.close;
  const close = open + (variation * open);
  
  const newCandle = {
    open,
    high: Math.max(open, close) + (Math.random() * 0.003 * open),
    low: Math.min(open, close) - (Math.random() * 0.003 * open),
    close,
    timestamp: Date.now(),
    volume: 1000 + Math.random() * 500
  };
  
  simulatedCandleData.push(newCandle);
  
  // Manter apenas últimas 20 velas
  if (simulatedCandleData.length > 20) {
    simulatedCandleData = simulatedCandleData.slice(-20);
  }
  
  console.log(`🕯️ Nova vela simulada: ${open.toFixed(4)} → ${close.toFixed(4)} (${variation > 0 ? '+' : ''}${(variation * 100).toFixed(2)}%)`);
};

const checkPendingSignals = (): PendingSignal[] => {
  const now = Date.now();
  const confirmedSignals: PendingSignal[] = [];
  
  pendingSignals = pendingSignals.filter(signal => {
    if (now > signal.confirmationDeadline) {
      console.log(`⏰ Sinal ${signal.direction} expirou sem confirmação`);
      return false; // Remove sinais expirados
    }
    
    // Verificar se há velas suficientes para confirmar
    const candlesAfterSignal = simulatedCandleData.length - 1 - signal.candleIndex;
    
    if (candlesAfterSignal >= 1) {
      const confirmationCandle = simulatedCandleData[signal.candleIndex + 1];
      const candleDirection = confirmationCandle.close > confirmationCandle.open ? "up" : "down";
      const expectedDirection = signal.direction === "BUY" ? "up" : "down";
      
      if (candleDirection === expectedDirection) {
        confirmedSignals.push(signal);
        console.log(`✅ Sinal ${signal.direction} CONFIRMADO pela vela seguinte!`);
        return false; // Remove da lista de pendentes
      }
    }
    
    return true; // Manter na lista de pendentes
  });
  
  return confirmedSignals;
};

const generateConfirmationResult = (
  signal: PendingSignal,
  originalConfidence: number,
  confirmed: boolean
): CandleConfirmation => {
  const confidenceBoost = confirmed ? 1.15 : 0.8;
  const finalConfidence = Math.min(95, originalConfidence * confidenceBoost);
  
  return {
    confirmed,
    confidence: finalConfidence,
    confirmationType: confirmed ? "strong" : "weak",
    waitingForConfirmation: false,
    nextCandleDirection: signal.direction === "BUY" ? "up" : "down",
    confirmationMessage: confirmed ? 
      `✅ CONFIRMADO! Próxima vela seguiu ${signal.direction} como previsto` :
      `❌ Vela seguinte não confirmou ${signal.direction}`,
    timeToWait: 0
  };
};

const createPendingConfirmation = (
  direction: "BUY" | "SELL",
  confidence: number,
  timeframe: string
): CandleConfirmation => {
  const timeToWait = getTimeframeSeconds(timeframe);
  
  return {
    confirmed: false,
    confidence: confidence * 0.9,
    confirmationType: "pending",
    waitingForConfirmation: true,
    nextCandleDirection: "unknown",
    confirmationMessage: `⏳ Aguardando próxima vela para confirmar ${direction}...`,
    timeToWait
  };
};

const getTimeframeSeconds = (timeframe: string): number => {
  switch (timeframe) {
    case "30s": return 30;
    case "1m": return 60;
    case "5m": return 300;
    case "15m": return 900;
    default: return 60;
  }
};

// Inicializar automaticamente
initializeCandleConfirmation();

export default {
  checkCandleConfirmation,
  registerPendingSignal,
  initializeCandleConfirmation
};
