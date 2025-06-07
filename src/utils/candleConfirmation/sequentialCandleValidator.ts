
/**
 * Validador de Velas Sequenciais - VERSÃO APRIMORADA
 * Aguarda formação de velas na mesma direção para confirmar sinais
 * Ajusta tempo de expiração dinamicamente baseado na validação
 */

export interface SequentialValidation {
  isValid: boolean;
  candlesInDirection: number;
  requiredCandles: number;
  nextCandleDirection: "up" | "down" | "neutral";
  timeToNextValidation: number;
  adjustedExpirationTime: number;
  validationMessage: string;
  confidence: number;
}

export interface PendingSequentialSignal {
  signalId: string;
  direction: "BUY" | "SELL";
  originalConfidence: number;
  createdAt: number;
  requiredSequentialCandles: number;
  validatedCandles: number;
  lastCandleIndex: number;
  originalExpirationTime: number;
  adjustedExpirationTime: number;
  timeframe: string;
}

let pendingSequentialSignals: PendingSequentialSignal[] = [];
let sequentialCandleData: Array<{
  direction: "up" | "down" | "neutral";
  strength: number;
  timestamp: number;
  index: number;
}> = [];

export const initializeSequentialValidator = () => {
  pendingSequentialSignals = [];
  sequentialCandleData = [];
  console.log("🔄 Validador de velas sequenciais inicializado");
};

export const registerSequentialSignal = (
  direction: "BUY" | "SELL",
  confidence: number,
  timeframe: string,
  originalExpirationTime: number
): PendingSequentialSignal => {
  const signalId = `SEQ_${direction}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Determinar quantas velas sequenciais são necessárias baseado na confiança e timeframe
  let requiredCandles = calculateRequiredSequentialCandles(confidence, timeframe);
  
  const sequentialSignal: PendingSequentialSignal = {
    signalId,
    direction,
    originalConfidence: confidence,
    createdAt: Date.now(),
    requiredSequentialCandles: requiredCandles,
    validatedCandles: 0,
    lastCandleIndex: getCurrentCandleIndex(),
    originalExpirationTime,
    adjustedExpirationTime: originalExpirationTime,
    timeframe
  };
  
  pendingSequentialSignals.push(sequentialSignal);
  
  console.log(`🕯️ Sinal sequencial registrado: ${direction} | Requer ${requiredCandles} velas na mesma direção`);
  console.log(`⏰ Tempo original: ${originalExpirationTime}s | ID: ${signalId}`);
  
  return sequentialSignal;
};

export const validateSequentialCandles = (
  signalDirection: "BUY" | "SELL",
  confidence: number,
  timeframe: string,
  originalExpirationTime: number
): SequentialValidation => {
  console.log("🔍 Validando velas sequenciais...");
  
  // Buscar sinal pendente correspondente
  let matchingSignal = pendingSequentialSignals.find(
    signal => signal.direction === signalDirection && signal.originalConfidence === confidence
  );
  
  // Se não existe, registrar novo sinal
  if (!matchingSignal) {
    matchingSignal = registerSequentialSignal(signalDirection, confidence, timeframe, originalExpirationTime);
  }
  
  // Simular nova vela (em produção, isso viria dos dados reais)
  simulateNewSequentialCandle();
  
  // Validar velas desde o sinal
  const candlesSinceSignal = sequentialCandleData.filter(
    candle => candle.index > matchingSignal!.lastCandleIndex
  );
  
  if (candlesSinceSignal.length === 0) {
    return createPendingSequentialValidation(matchingSignal, "Aguardando primeira vela de confirmação");
  }
  
  // Analisar sequência de velas
  const expectedDirection = signalDirection === "BUY" ? "up" : "down";
  let consecutiveCorrectCandles = 0;
  let lastValidationFailed = false;
  
  for (const candle of candlesSinceSignal) {
    if (candle.direction === expectedDirection) {
      consecutiveCorrectCandles++;
    } else if (candle.direction !== "neutral") {
      // Vela na direção oposta - resetar contagem
      consecutiveCorrectCandles = 0;
      lastValidationFailed = true;
      console.log(`❌ Vela na direção oposta detectada: ${candle.direction} (esperado: ${expectedDirection})`);
    }
    // Velas neutras não afetam a contagem
  }
  
  // Atualizar sinal com progresso atual
  matchingSignal.validatedCandles = consecutiveCorrectCandles;
  matchingSignal.lastCandleIndex = Math.max(...candlesSinceSignal.map(c => c.index));
  
  // Verificar se atingiu o número necessário de velas
  if (consecutiveCorrectCandles >= matchingSignal.requiredSequentialCandles) {
    // VALIDAÇÃO COMPLETA - SUCESSO!
    console.log(`✅ Validação sequencial COMPLETA: ${consecutiveCorrectCandles}/${matchingSignal.requiredSequentialCandles} velas em ${expectedDirection}`);
    
    // Ajustar tempo de expiração baseado na força da sequência
    const sequenceStrength = calculateSequenceStrength(candlesSinceSignal, expectedDirection);
    const adjustedExpirationTime = adjustExpirationTime(
      matchingSignal.originalExpirationTime,
      sequenceStrength,
      consecutiveCorrectCandles,
      timeframe
    );
    
    matchingSignal.adjustedExpirationTime = adjustedExpirationTime;
    
    // Remover da lista de pendentes
    pendingSequentialSignals = pendingSequentialSignals.filter(s => s.signalId !== matchingSignal!.signalId);
    
    return {
      isValid: true,
      candlesInDirection: consecutiveCorrectCandles,
      requiredCandles: matchingSignal.requiredSequentialCandles,
      nextCandleDirection: expectedDirection,
      timeToNextValidation: 0,
      adjustedExpirationTime,
      validationMessage: `✅ ${consecutiveCorrectCandles} velas consecutivas confirmaram ${signalDirection} - ENTRADA VALIDADA`,
      confidence: Math.min(95, confidence + (sequenceStrength * 15))
    };
  }
  
  // Se última validação falhou, aguardar mais tempo
  if (lastValidationFailed) {
    // Estender tempo de aguardo quando há reversão
    const extendedWaitTime = getTimeframeSeconds(timeframe) * 2;
    
    return {
      isValid: false,
      candlesInDirection: consecutiveCorrectCandles,
      requiredCandles: matchingSignal.requiredSequentialCandles,
      nextCandleDirection: "neutral",
      timeToNextValidation: extendedWaitTime,
      adjustedExpirationTime: matchingSignal.originalExpirationTime + extendedWaitTime,
      validationMessage: `⚠️ Reversão detectada - Aguardando nova sequência de ${matchingSignal.requiredSequentialCandles} velas em ${expectedDirection}`,
      confidence: Math.max(40, confidence - 20)
    };
  }
  
  // Validação em progresso
  const remainingCandles = matchingSignal.requiredSequentialCandles - consecutiveCorrectCandles;
  const timeToNext = getTimeframeSeconds(timeframe);
  
  return {
    isValid: false,
    candlesInDirection: consecutiveCorrectCandles,
    requiredCandles: matchingSignal.requiredSequentialCandles,
    nextCandleDirection: expectedDirection,
    timeToNextValidation: timeToNext,
    adjustedExpirationTime: matchingSignal.adjustedExpirationTime,
    validationMessage: `🔄 Progresso: ${consecutiveCorrectCandles}/${matchingSignal.requiredSequentialCandles} velas - Aguardando ${remainingCandles} velas em ${expectedDirection}`,
    confidence: confidence + (consecutiveCorrectCandles * 5)
  };
};

const calculateRequiredSequentialCandles = (confidence: number, timeframe: string): number => {
  // Baseado na confiança: menor confiança = mais velas necessárias
  let baseCandles = confidence >= 80 ? 2 : confidence >= 65 ? 3 : 4;
  
  // Ajustar por timeframe
  if (timeframe === "30s") {
    baseCandles += 1; // Timeframes menores precisam mais confirmação
  } else if (timeframe === "5m" || timeframe === "15m") {
    baseCandles -= 1; // Timeframes maiores podem ter menos confirmação
  }
  
  return Math.max(2, Math.min(5, baseCandles)); // Mínimo 2, máximo 5 velas
};

const simulateNewSequentialCandle = () => {
  const currentIndex = getCurrentCandleIndex();
  
  // Simular direção da vela com base em tendências (70% seguem tendência anterior)
  const lastCandle = sequentialCandleData[sequentialCandleData.length - 1];
  let direction: "up" | "down" | "neutral";
  
  if (!lastCandle || Math.random() < 0.15) {
    // 15% chance de vela neutral
    direction = "neutral";
  } else if (Math.random() < 0.70) {
    // 70% chance de seguir tendência anterior
    direction = lastCandle.direction === "neutral" ? (Math.random() > 0.5 ? "up" : "down") : lastCandle.direction;
  } else {
    // 15% chance de reverter direção
    direction = lastCandle.direction === "up" ? "down" : 
               lastCandle.direction === "down" ? "up" : 
               (Math.random() > 0.5 ? "up" : "down");
  }
  
  const strength = direction === "neutral" ? 0.1 : 0.3 + Math.random() * 0.7;
  
  const newCandle = {
    direction,
    strength,
    timestamp: Date.now(),
    index: currentIndex + 1
  };
  
  sequentialCandleData.push(newCandle);
  
  // Manter apenas últimas 20 velas
  if (sequentialCandleData.length > 20) {
    sequentialCandleData = sequentialCandleData.slice(-20);
  }
  
  const directionEmoji = direction === "up" ? "📈" : direction === "down" ? "📉" : "➡️";
  console.log(`🕯️ Nova vela sequencial [${newCandle.index}]: ${direction} ${directionEmoji} (força: ${(strength * 100).toFixed(0)}%)`);
};

const createPendingSequentialValidation = (
  signal: PendingSequentialSignal,
  message: string
): SequentialValidation => {
  const timeToNext = getTimeframeSeconds(signal.timeframe);
  
  return {
    isValid: false,
    candlesInDirection: signal.validatedCandles,
    requiredCandles: signal.requiredSequentialCandles,
    nextCandleDirection: signal.direction === "BUY" ? "up" : "down",
    timeToNextValidation: timeToNext,
    adjustedExpirationTime: signal.adjustedExpirationTime,
    validationMessage: message,
    confidence: signal.originalConfidence * 0.9
  };
};

const calculateSequenceStrength = (candles: any[], expectedDirection: string): number => {
  if (candles.length === 0) return 0;
  
  const correctCandles = candles.filter(c => c.direction === expectedDirection);
  const averageStrength = correctCandles.reduce((sum, c) => sum + c.strength, 0) / correctCandles.length;
  const directionConsistency = correctCandles.length / candles.length;
  
  return averageStrength * directionConsistency;
};

const adjustExpirationTime = (
  originalTime: number,
  sequenceStrength: number,
  validatedCandles: number,
  timeframe: string
): number => {
  // Sequências mais fortes = tempo de expiração maior
  let multiplier = 1.0;
  
  // Boost baseado na força da sequência
  multiplier += sequenceStrength * 0.3;
  
  // Boost baseado no número de velas validadas
  multiplier += (validatedCandles - 2) * 0.1;
  
  // Ajuste por timeframe
  if (timeframe === "30s") {
    multiplier *= 1.2; // Timeframes curtos precisam mais tempo
  }
  
  const adjustedTime = Math.round(originalTime * multiplier);
  
  console.log(`⏰ Tempo ajustado: ${originalTime}s → ${adjustedTime}s (força: ${(sequenceStrength*100).toFixed(0)}%, velas: ${validatedCandles})`);
  
  return adjustedTime;
};

const getCurrentCandleIndex = (): number => {
  return sequentialCandleData.length > 0 ? 
    Math.max(...sequentialCandleData.map(c => c.index)) : 0;
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

export const cleanupSequentialValidator = () => {
  pendingSequentialSignals = [];
  sequentialCandleData = [];
  console.log("🧹 Validador sequencial limpo");
};

// Inicializar automaticamente
initializeSequentialValidator();

export default {
  validateSequentialCandles,
  registerSequentialSignal,
  initializeSequentialValidator,
  cleanupSequentialValidator
};
