/**
 * Sistema de Confirmação por Vela - VERSÃO APRIMORADA COM VALIDAÇÃO SEQUENCIAL
 * Baseado nos resultados reais: 16/26 operações positivas (61,5% assertividade)
 * Agora com validação de velas sequenciais para maior precisão
 */

import { validateSequentialCandles, SequentialValidation } from './sequentialCandleValidator';

export interface CandleConfirmation {
  confirmed: boolean;
  confidence: number;
  confirmationType: "strong" | "moderate" | "weak" | "pending" | "sequential";
  waitingForConfirmation: boolean;
  nextCandleDirection: "up" | "down" | "neutral" | "unknown";
  confirmationMessage: string;
  timeToWait: number; // em segundos
  signalStrength: number; // força do sinal original
  sequentialValidation?: SequentialValidation;
  adjustedExpirationTime?: number;
}

export interface PendingSignal {
  direction: "BUY" | "SELL";
  originalConfidence: number;
  timestamp: number;
  candleIndex: number;
  confirmationDeadline: number;
  signalId: string;
  requiresSequential: boolean;
  originalExpirationTime: number;
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
  
  console.log("🕯️ Sistema de confirmação APRIMORADO inicializado com validação sequencial");
  console.log(`📊 ${simulatedCandleData.length} velas históricas carregadas`);
};

export const registerPendingSignal = (
  direction: "BUY" | "SELL",
  confidence: number,
  timeframe: string,
  originalExpirationTime: number = 300
): PendingSignal => {
  const now = Date.now();
  const timeframeSeconds = getTimeframeSeconds(timeframe);
  const signalId = `${direction}_${now}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Determinar se requer validação sequencial baseado na confiança
  const requiresSequential = confidence < 75 || timeframe === "30s";
  
  const pendingSignal: PendingSignal = {
    direction,
    originalConfidence: confidence,
    timestamp: now,
    candleIndex: currentCandleIndex,
    confirmationDeadline: now + (timeframeSeconds * 2000),
    signalId,
    requiresSequential,
    originalExpirationTime
  };
  
  pendingSignals.push(pendingSignal);
  
  const validationType = requiresSequential ? "SEQUENCIAL" : "SIMPLES";
  console.log(`🔄 Sinal ${direction} registrado para confirmação ${validationType} (ID: ${signalId})`);
  console.log(`⏰ Deadline: ${new Date(pendingSignal.confirmationDeadline).toLocaleTimeString()}`);
  
  return pendingSignal;
};

export const checkCandleConfirmation = (
  originalDirection: "BUY" | "SELL",
  originalConfidence: number,
  timeframe: string,
  originalExpirationTime: number = 300
): CandleConfirmation => {
  console.log("🕯️ Verificando confirmação APRIMORADA com validação sequencial...");
  console.log(`📊 Vela atual: ${currentCandleIndex} | Sinais pendentes: ${pendingSignals.length}`);
  
  // Verificar se precisa de validação sequencial
  const needsSequentialValidation = originalConfidence < 75 || timeframe === "30s";
  
  if (needsSequentialValidation) {
    console.log("🔍 Aplicando validação sequencial para maior precisão...");
    
    try {
      const sequentialValidation = validateSequentialCandles(
        originalDirection,
        originalConfidence,
        timeframe,
        originalExpirationTime
      );
      
      if (sequentialValidation.isValid) {
        // VALIDAÇÃO SEQUENCIAL COMPLETA - ENTRADA AUTORIZADA
        console.log(`✅ Validação sequencial APROVADA: ${sequentialValidation.candlesInDirection} velas confirmaram ${originalDirection}`);
        
        return {
          confirmed: true,
          confidence: sequentialValidation.confidence,
          confirmationType: "sequential",
          waitingForConfirmation: false,
          nextCandleDirection: sequentialValidation.nextCandleDirection,
          confirmationMessage: sequentialValidation.validationMessage,
          timeToWait: 0,
          signalStrength: sequentialValidation.candlesInDirection * 25,
          sequentialValidation,
          adjustedExpirationTime: sequentialValidation.adjustedExpirationTime
        };
      } else {
        // AGUARDANDO MAIS VELAS SEQUENCIAIS
        console.log(`⏳ Validação sequencial em progresso: ${sequentialValidation.candlesInDirection}/${sequentialValidation.requiredCandles} velas`);
        
        return {
          confirmed: false,
          confidence: sequentialValidation.confidence,
          confirmationType: "pending",
          waitingForConfirmation: true,
          nextCandleDirection: sequentialValidation.nextCandleDirection,
          confirmationMessage: sequentialValidation.validationMessage,
          timeToWait: sequentialValidation.timeToNextValidation,
          signalStrength: sequentialValidation.candlesInDirection * 15,
          sequentialValidation,
          adjustedExpirationTime: sequentialValidation.adjustedExpirationTime
        };
      }
    } catch (error) {
      console.error("❌ Erro na validação sequencial:", error);
      // Fallback para validação simples em caso de erro
    }
  }
  
  // VALIDAÇÃO SIMPLES (para sinais de alta confiança)
  console.log("🔄 Aplicando validação simples (alta confiança)...");
  
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
  return analyzeCurrentMarketCondition(originalDirection, originalConfidence, timeframe, originalExpirationTime);
};

const simulateNewCandle = () => {
  const lastCandle = simulatedCandleData[simulatedCandleData.length - 1];
  if (!lastCandle) return;
  
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
  
  if (simulatedCandleData.length > 25) {
    simulatedCandleData = simulatedCandleData.slice(-25);
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
    if (now > signal.confirmationDeadline) {
      console.log(`⏰ Sinal ${signal.direction} (${signal.signalId}) expirou sem confirmação`);
      return false;
    }
    
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
  
  const candleSize = Math.abs(confirmationCandle.close - confirmationCandle.open);
  const bodyPercentage = candleSize / confirmationCandle.open;
  
  let confirmationType: "strong" | "moderate" | "weak" = "weak";
  let confidenceMultiplier = 1.0;
  
  if (isConfirmed) {
    if (bodyPercentage > 0.008) {
      confirmationType = "strong";
      confidenceMultiplier = 1.25;
    } else if (bodyPercentage > 0.004) {
      confirmationType = "moderate";
      confidenceMultiplier = 1.15;
    } else {
      confirmationType = "weak";
      confidenceMultiplier = 1.08;
    }
  } else {
    confidenceMultiplier = 0.65;
  }
  
  const finalConfidence = Math.min(95, originalConfidence * confidenceMultiplier);
  
  let confirmationMessage = "";
  if (isConfirmed) {
    confirmationMessage = `✅ Vela [${confirmationCandle.index}] CONFIRMOU ${originalDirection} (${confirmationType.toUpperCase()}) - ${(bodyPercentage * 100).toFixed(2)}% movimento`;
  } else {
    confirmationMessage = `❌ Vela [${confirmationCandle.index}] NÃO confirmou ${originalDirection} - Movimento contrário detectado`;
  }
  
  console.log(confirmationMessage);
  
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
  timeframe: string,
  originalExpirationTime: number
): CandleConfirmation => {
  registerPendingSignal(direction, confidence, timeframe, originalExpirationTime);
  
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
    confirmationMessage: `⏳ Aguardando confirmação para ${direction}... (Sistema aprimorado com validação sequencial)`,
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
