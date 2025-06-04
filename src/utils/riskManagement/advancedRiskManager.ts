
/**
 * Gestão de Risco Profissional
 * Baseado em práticas institucionais de trading
 */

export interface RiskProfile {
  maxRiskPerTrade: number; // % do capital
  maxDailyRisk: number; // % do capital por dia
  maxDrawdown: number; // % máximo de perda do pico
  correlationLimit: number; // máximo de trades correlacionados
  volatilityAdjustment: boolean;
}

export interface PositionSizing {
  recommendedSize: number;
  maxSize: number;
  riskAmount: number;
  stopLossDistance: number;
  riskRewardRatio: number;
  reasoning: string[];
}

export interface RiskAssessment {
  totalRisk: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  riskScore: number; // 0-100
  recommendations: string[];
  shouldTrade: boolean;
  maxPositionSize: number;
  emergencyStop: boolean;
}

const DEFAULT_RISK_PROFILE: RiskProfile = {
  maxRiskPerTrade: 2.0, // 2% por trade
  maxDailyRisk: 6.0, // 6% por dia
  maxDrawdown: 15.0, // 15% drawdown máximo
  correlationLimit: 3, // máximo 3 trades correlacionados
  volatilityAdjustment: true
};

export const calculatePositionSize = (
  signal: any,
  accountBalance: number,
  currentPrice: number,
  stopLoss: number,
  riskProfile: RiskProfile = DEFAULT_RISK_PROFILE
): PositionSizing => {
  const riskAmount = accountBalance * (riskProfile.maxRiskPerTrade / 100);
  const stopLossDistance = Math.abs(currentPrice - stopLoss);
  const stopLossPercent = (stopLossDistance / currentPrice) * 100;
  
  // Calcular tamanho base da posição
  let recommendedSize = riskAmount / stopLossDistance;
  
  // Ajustar por volatilidade se habilitado
  if (riskProfile.volatilityAdjustment && signal.volatility) {
    const volatilityMultiplier = signal.volatility > 70 ? 0.5 : 
                                signal.volatility > 50 ? 0.7 : 
                                signal.volatility < 30 ? 1.3 : 1.0;
    recommendedSize *= volatilityMultiplier;
  }
  
  // Ajustar por confiança do sinal
  const confidenceMultiplier = signal.confidence > 90 ? 1.2 :
                              signal.confidence > 80 ? 1.0 :
                              signal.confidence > 70 ? 0.8 :
                              signal.confidence > 60 ? 0.6 : 0.4;
  
  recommendedSize *= confidenceMultiplier;
  
  // Limitar tamanho máximo (nunca mais que 5% do account)
  const maxSize = accountBalance * 0.05;
  recommendedSize = Math.min(recommendedSize, maxSize);
  
  // Calcular risk/reward
  const takeProfit = signal.take_profit || (currentPrice * (signal.action === "BUY" ? 1.02 : 0.98));
  const profitDistance = Math.abs(takeProfit - currentPrice);
  const riskRewardRatio = profitDistance / stopLossDistance;
  
  const reasoning = [
    `💰 Capital em risco: ${riskAmount.toFixed(2)} (${riskProfile.maxRiskPerTrade}%)`,
    `📏 Distância do stop: ${stopLossPercent.toFixed(2)}%`,
    `🎯 Risk/Reward: 1:${riskRewardRatio.toFixed(2)}`,
    `📊 Ajuste por confiança: ${(confidenceMultiplier * 100).toFixed(0)}%`
  ];
  
  if (riskProfile.volatilityAdjustment) {
    reasoning.push(`📈 Ajuste por volatilidade aplicado`);
  }
  
  return {
    recommendedSize: Math.floor(recommendedSize),
    maxSize: Math.floor(maxSize),
    riskAmount,
    stopLossDistance,
    riskRewardRatio,
    reasoning
  };
};

export const assessOverallRisk = (
  currentPositions: any[],
  newSignal: any,
  accountMetrics: {
    balance: number;
    dailyPnL: number;
    currentDrawdown: number;
  },
  riskProfile: RiskProfile = DEFAULT_RISK_PROFILE
): RiskAssessment => {
  let riskScore = 0;
  const recommendations: string[] = [];
  
  // Avaliar drawdown atual
  if (accountMetrics.currentDrawdown > riskProfile.maxDrawdown * 0.8) {
    riskScore += 40;
    recommendations.push(`⚠️ Próximo do drawdown máximo (${accountMetrics.currentDrawdown.toFixed(1)}%)`);
  }
  
  // Avaliar risco diário
  const dailyRiskPercent = Math.abs(accountMetrics.dailyPnL / accountMetrics.balance) * 100;
  if (dailyRiskPercent > riskProfile.maxDailyRisk * 0.8) {
    riskScore += 30;
    recommendations.push(`📅 Risco diário elevado (${dailyRiskPercent.toFixed(1)}%)`);
  }
  
  // Avaliar correlação de posições
  const correlatedPositions = currentPositions.filter(p => 
    p.timeframe === newSignal.timeframe && p.marketType === newSignal.marketType
  ).length;
  
  if (correlatedPositions >= riskProfile.correlationLimit) {
    riskScore += 25;
    recommendations.push(`🔗 Muitas posições correlacionadas (${correlatedPositions})`);
  }
  
  // Avaliar qualidade do sinal
  if (newSignal.confidence < 70) {
    riskScore += 15;
    recommendations.push(`📉 Baixa confiança no sinal (${newSignal.confidence}%)`);
  }
  
  if (newSignal.confluences < 3) {
    riskScore += 10;
    recommendations.push(`🎯 Poucas confluências técnicas (${newSignal.confluences})`);
  }
  
  // Determinar nível de risco total
  let totalRisk: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  if (riskScore <= 20) totalRisk = "LOW";
  else if (riskScore <= 50) totalRisk = "MEDIUM";
  else if (riskScore <= 80) totalRisk = "HIGH";
  else totalRisk = "EXTREME";
  
  // Decidir se deve operar
  const shouldTrade = riskScore < 70 && accountMetrics.currentDrawdown < riskProfile.maxDrawdown;
  const emergencyStop = accountMetrics.currentDrawdown >= riskProfile.maxDrawdown;
  
  // Calcular tamanho máximo permitido
  const maxPositionSize = shouldTrade ? 
    accountMetrics.balance * (riskProfile.maxRiskPerTrade / 100) : 0;
  
  if (emergencyStop) {
    recommendations.push(`🚨 STOP DE EMERGÊNCIA ATIVADO - Não operar!`);
  } else if (!shouldTrade) {
    recommendations.push(`⛔ Condições desfavoráveis - Aguardar`);
  } else if (totalRisk === "LOW") {
    recommendations.push(`✅ Condições favoráveis para operação`);
  }
  
  return {
    totalRisk,
    riskScore,
    recommendations,
    shouldTrade,
    maxPositionSize,
    emergencyStop
  };
};

export const generateRiskReport = (assessment: RiskAssessment): string => {
  const emoji = assessment.totalRisk === "LOW" ? "🟢" :
               assessment.totalRisk === "MEDIUM" ? "🟡" :
               assessment.totalRisk === "HIGH" ? "🟠" : "🔴";
  
  return `${emoji} RISCO ${assessment.totalRisk} (${assessment.riskScore}/100)\n` +
         assessment.recommendations.join('\n');
};
