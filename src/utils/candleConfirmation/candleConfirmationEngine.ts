
/**
 * Sistema de Confirmação por Vela - VERSÃO CORRIGIDA E SINCRONIZADA
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
  signalStrength: number; // força do sinal original
}

export interface PendingSignal {
  direction: "BUY" | "SELL";
  originalConfidence: number;
  timestamp: number;
  candleIndex: number;
  confirmationDeadline: number;
  signalId: string;
}

// Simulação de dados de velas sincronizada
let simulatedCandleData: Array<{
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
  volume: number;
  index: number;
}> = [];

let pendingSignals: PendingSignal[] = [];
// CORRIGIDO: Usar NodeJS.Timeout ao invés de number para compatibilidade
let candleUpdateInterval: NodeJS.Timeout | null = null;
let currentCandleIndex = 0;

export const initializeCandleConfirmation = () => {
  // Limpar dados anteriores
  simulatedCandleData = [];
  pendingSignals = [];
  currentCandleIndex = 0;
  
  // Parar interval anterior se existir
  if (candleUpdateInterval) {
    clearInterval(candleUpdateInterval);
  }
  
  // Simular dados iniciais de velas com índices sequenciais
  const basePrice = 100;
  const now = Date.now();
  
  for (let i = 0; i < 15; i++) {
    const variation = (Math.random() - 0.5) * 0.02;
    const open = basePrice + (variation * basePrice);
    const close = open + ((Math.random() - 0.5) * 0.01 * basePrice);
    
    simulatedCandleData.push({
      open,
      high: Math.max(open, close) + (Math.random() * 0.005 * basePrice),
      low: Math.min(open, close) - (Math.random() * 0.005 * basePrice),
      close,
      timestamp: now - ((14 - i) * 30000), // Velas de 30s
      volume: 1000 + Math.random() * 500,
      index: i
    });
  }
  
  currentCandleIndex = simulatedCandleData.length - 1;
  
  // Iniciar atualização automática de velas (simulando tempo real)
  candleUpdateInterval = setInterval(() => {
    simulateNewCandle();
    checkAndProcessPendingSignals();
  }, 30000); // Nova vela a cada 30 segundos
  
  console.log("🕯️ Sistema de confirmação por vela inicializado e sincronizado");
  console.log(`📊 ${simulatedCandleData.length} velas históricas carregadas`);
};

export const registerPendingSignal = (
  direction: "BUY" | "SELL",
  confidence: number,
  timeframe: string
): PendingSignal => {
  const now = Date.now();
  const timeframeSeconds = getTimeframeSeconds(timeframe);
  const signalId = `${direction}_${now}_${Math.random().toString(36).substr(2, 9)}`;
  
  const pendingSignal: PendingSignal = {
    direction,
    originalConfidence: confidence,
    timestamp: now,
    candleIndex: currentCandleIndex,
    confirmationDeadline: now + (timeframeSeconds * 2000), // 2 velas para confirmar
    signalId
  };
  
  pendingSignals.push(pendingSignal);
  
  console.log(`🔄 Sinal ${direction} registrado para confirmação (ID: ${signalId})`);
  console.log(`⏰ Deadline: ${new Date(pendingSignal.confirmationDeadline).toLocaleTimeString()}`);
  
  return pendingSignal;
};

export const checkCandleConfirmation = (
  originalDirection: "BUY" | "SELL",
  originalConfidence: number,
  timeframe: string
): CandleConfirmation => {
  console.log("🕯️ Verificando confirmação da próxima vela...");
  console.log(`📊 Vela atual: ${currentCandleIndex} | Sinais pendentes: ${pendingSignals.length}`);
  
  // Verificar se temos velas suficientes para análise
  if (simulatedCandleData.length < 2) {
    return createPendingConfirmation(originalDirection, originalConfidence, timeframe);
  }
  
  // Buscar confirmação para sinais existentes
  const matchingSignal = pendingSignals.find(
    signal => signal.direction === originalDirection && 
              Date.now() < signal.confirmationDeadline
  );
  
  if (matchingSignal) {
    // Verificar se já temos vela confirmação disponível
    const candlesAfterSignal = currentCandleIndex - matchingSignal.candleIndex;
    
    if (candlesAfterSignal >= 1) {
      // Analisar a vela de confirmação
      const confirmationCandleIndex = matchingSignal.candleIndex + 1;
      const confirmationCandle = simulatedCandleData[confirmationCandleIndex];
      
      if (confirmationCandle) {
        return analyzeConfirmationCandle(
          confirmationCandle,
          originalDirection,
          originalConfidence,
          matchingSignal
        );
      }
    }
    
    // Ainda aguardando confirmação
    return {
      confirmed: false,
      confidence: originalConfidence * 0.8,
      confirmationType: "pending",
      waitingForConfirmation: true,
      nextCandleDirection: "unknown",
      confirmationMessage: `⏳ Aguardando próxima vela para confirmar ${originalDirection} (${Math.ceil((matchingSignal.confirmationDeadline - Date.now()) / 1000)}s restantes)`,
      timeToWait: getTimeframeSeconds(timeframe),
      signalStrength: originalConfidence
    };
  }
  
  // Não há sinal pendente - analisar última vela disponível
  return analyzeCurrentMarketCondition(originalDirection, originalConfidence, timeframe);
};

const simulateNewCandle = () => {
  const lastCandle = simulatedCandleData[simulatedCandleData.length - 1];
  if (!lastCandle) return;
  
  // Simular próxima vela com base na tendência (baseado nos 61,5% de assertividade)
  const followTrend = Math.random() < 0.62;
  
  const previousDirection = lastCandle.close > lastCandle.open ? 1 : -1;
  const variation = followTrend ? 
    (Math.random() * 0.008 + 0.002) * previousDirection : 
    (Math.random() * 0.006 + 0.001) * -previousDirection;
  
  const open = lastCandle.close;
  const close = open + (variation * open);
  
  currentCandleIndex++;
  
  const newCandle = {
    open,
    high: Math.max(open, close) + (Math.random() * 0.003 * open),
    low: Math.min(open, close) - (Math.random() * 0.003 * open),
    close,
    timestamp: Date.now(),
    volume: 1000 + Math.random() * 500,
    index: currentCandleIndex
  };
  
  simulatedCandleData.push(newCandle);
  
  // Manter apenas últimas 25 velas
  if (simulatedCandleData.length > 25) {
    simulatedCandleData = simulatedCandleData.slice(-25);
    // Ajustar índices dos sinais pendentes
    pendingSignals.forEach(signal => {
      signal.candleIndex = Math.max(0, signal.candleIndex - 1);
    });
  }
  
  const direction = variation > 0 ? "📈" : "📉";
  console.log(`🕯️ Nova vela simulada [${currentCandleIndex}]: ${open.toFixed(4)} → ${close.toFixed(4)} ${direction} (${(variation * 100).toFixed(2)}%)`);
};

const checkAndProcessPendingSignals = () => {
  const now = Date.now();
  const confirmedSignals: PendingSignal[] = [];
  
  pendingSignals = pendingSignals.filter(signal => {
    // Remover sinais expirados
    if (now > signal.confirmationDeadline) {
      console.log(`⏰ Sinal ${signal.direction} (${signal.signalId}) expirou sem confirmação`);
      return false;
    }
    
    // Verificar se há velas suficientes para confirmar
    const candlesAfterSignal = currentCandleIndex - signal.candleIndex;
    
    if (candlesAfterSignal >= 1) {
      const confirmationCandleIndex = signal.candleIndex + 1;
      const confirmationCandle = simulatedCandleData.find(c => c.index === confirmationCandleIndex);
      
      if (confirmationCandle) {
        const candleDirection = confirmationCandle.close > confirmationCandle.open ? "up" : "down";
        const expectedDirection = signal.direction === "BUY" ? "up" : "down";
        
        if (candleDirection === expectedDirection) {
          confirmedSignals.push(signal);
          console.log(`✅ Sinal ${signal.direction} (${signal.signalId}) CONFIRMADO pela vela [${confirmationCandleIndex}]!`);
          return false; // Remove da lista de pendentes
        } else {
          console.log(`❌ Sinal ${signal.direction} (${signal.signalId}) NÃO confirmado pela vela [${confirmationCandleIndex}]`);
          return false; // Remove da lista de pendentes
        }
      }
    }
    
    return true; // Mantém na lista de pendentes
  });
  
  return confirmedSignals;
};

const analyzeConfirmationCandle = (
  confirmationCandle: any,
  originalDirection: "BUY" | "SELL",
  originalConfidence: number,
  signal: PendingSignal
): CandleConfirmation => {
  const candleDirection = confirmationCandle.close > confirmationCandle.open ? "up" : "down";
  const expectedDirection = originalDirection === "BUY" ? "up" : "down";
  const isConfirmed = candleDirection === expectedDirection;
  
  // Calcular força da confirmação
  const candleSize = Math.abs(confirmationCandle.close - confirmationCandle.open);
  const bodyPercentage = candleSize / confirmationCandle.open;
  
  let confirmationType: "strong" | "moderate" | "weak" = "weak";
  let confidenceMultiplier = 1.0;
  
  if (isConfirmed) {
    if (bodyPercentage > 0.008) {
      confirmationType = "strong";
      confidenceMultiplier = 1.25; // Aumentar confiança em 25%
    } else if (bodyPercentage > 0.004) {
      confirmationType = "moderate";
      confidenceMultiplier = 1.15; // Aumentar confiança em 15%
    } else {
      confirmationType = "weak";
      confidenceMultiplier = 1.08; // Aumentar confiança em 8%
    }
  } else {
    confidenceMultiplier = 0.65; // Reduzir significativamente se não confirmou
  }
  
  const finalConfidence = Math.min(95, originalConfidence * confidenceMultiplier);
  
  let confirmationMessage = "";
  if (isConfirmed) {
    confirmationMessage = `✅ Vela [${confirmationCandle.index}] CONFIRMOU ${originalDirection} (${confirmationType.toUpperCase()}) - ${(bodyPercentage * 100).toFixed(2)}% movimento`;
  } else {
    confirmationMessage = `❌ Vela [${confirmationCandle.index}] NÃO confirmou ${originalDirection} - Movimento contrário detectado`;
  }
  
  console.log(confirmationMessage);
  
  // Remover sinal da lista de pendentes
  pendingSignals = pendingSignals.filter(s => s.signalId !== signal.signalId);
  
  return {
    confirmed: isConfirmed,
    confidence: finalConfidence,
    confirmationType,
    waitingForConfirmation: false,
    nextCandleDirection: candleDirection,
    confirmationMessage,
    timeToWait: 0,
    signalStrength: bodyPercentage * 100
  };
};

const analyzeCurrentMarketCondition = (
  direction: "BUY" | "SELL",
  confidence: number,
  timeframe: string
): CandleConfirmation => {
  // Registrar novo sinal para monitoramento
  registerPendingSignal(direction, confidence, timeframe);
  
  return createPendingConfirmation(direction, confidence, timeframe);
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
    confirmationMessage: `⏳ Aguardando próxima vela para confirmar ${direction}... (Baseado em 61,5% assertividade)`,
    timeToWait,
    signalStrength: confidence
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

// Limpeza ao sair
export const cleanup = () => {
  if (candleUpdateInterval) {
    clearInterval(candleUpdateInterval);
    candleUpdateInterval = null;
  }
  pendingSignals = [];
  console.log("🧹 Sistema de confirmação por vela limpo");
};

// Inicializar automaticamente
initializeCandleConfirmation();

export default {
  checkCandleConfirmation,
  registerPendingSignal,
  initializeCandleConfirmation,
  cleanup
};
