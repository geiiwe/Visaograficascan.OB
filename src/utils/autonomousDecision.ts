/**
 * Sistema de Decisão Autônoma da IA - VERSÃO SINCRONIZADA E COERENTE
 * Integra padrões clássicos + confluências múltiplas + conhecimento profissional + CONFIRMAÇÃO POR VELA
 */

import { ExtendedPatternResult } from './predictionUtils';
import { performProfessionalAnalysis, MarketContext } from './professionalAnalysisEngine';
import { checkCandleConfirmation, registerPendingSignal, CandleConfirmation } from './candleConfirmation/candleConfirmationEngine';

export interface AutonomousDecision {
  action: "BUY" | "SELL" | "WAIT";
  confidence: number;
  timing: {
    enter_now: boolean;
    wait_seconds?: number;
    optimal_window: number;
  };
  reasoning: string[];
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  expected_success_rate: number;
  professional_analysis: {
    confluences: number;
    contraindications: string[];
    market_grade: "A" | "B" | "C" | "D" | "F";
  };
  candle_confirmation?: CandleConfirmation;
  decision_flow: {
    step: string;
    status: "completed" | "pending" | "failed";
    details: string;
  }[];
}

export interface DecisionFactors {
  micro_patterns: any[];
  visual_analysis: any;
  market_conditions: {
    volatility: number;
    noise: number;
    trend_strength: number;
  };
  timing_analysis: any;
  technical_indicators: Record<string, ExtendedPatternResult>;
}

export const makeAutonomousDecision = (
  factors: DecisionFactors,
  timeframe: string,
  marketType: string
): AutonomousDecision => {
  console.log("🎓 IA iniciando decisão SINCRONIZADA com confirmação por vela...");
  
  const decisionFlow: AutonomousDecision['decision_flow'] = [];
  
  // PASSO 1: Preparar contexto de mercado
  decisionFlow.push({
    step: "market_context",
    status: "completed",
    details: `Timeframe: ${timeframe}, Tipo: ${marketType}, Volatilidade: ${factors.market_conditions.volatility}%`
  });
  
  const marketContext: MarketContext = {
    timeframe,
    marketType,
    volatility: factors.market_conditions.volatility,
    trendStrength: factors.market_conditions.trend_strength,
    volumeProfile: determineVolumeProfile(factors.visual_analysis)
  };
  
  // PASSO 2: Realizar análise ULTRA profissional
  decisionFlow.push({
    step: "professional_analysis",
    status: "completed",
    details: "Analisando padrões clássicos + multi-indicadores + confluências"
  });
  
  const professionalResult = performProfessionalAnalysis(
    factors.visual_analysis,
    factors.micro_patterns,
    factors.timing_analysis,
    marketContext
  );
  
  console.log(`🎓 Análise profissional: ${professionalResult.signal} com ${professionalResult.confluences} confluências`);
  
  // PASSO 3: Verificar qualidade do setup
  const marketGrade = gradeMarketSetup(
    professionalResult.confluences,
    professionalResult.contraindications.length,
    professionalResult.confidence,
    marketContext
  );
  
  decisionFlow.push({
    step: "setup_grading",
    status: "completed",
    details: `Setup grau ${marketGrade} - ${professionalResult.confluences} confluências, ${professionalResult.contraindications.length} contraindicações`
  });
  
  // PASSO 4: Verificar se setup atende critérios mínimos
  if (marketGrade === "C" || marketGrade === "D" || marketGrade === "F") {
    decisionFlow.push({
      step: "setup_validation",
      status: "failed",
      details: `Setup grau ${marketGrade} rejeitado - ULTRA requer mínimo grau B`
    });
    
    console.log(`🎓 Setup rejeitado: Grau ${marketGrade} - Abaixo do padrão ULTRA profissional`);
    
    return createWaitDecision(
      marketGrade,
      professionalResult,
      decisionFlow,
      "Setup insuficiente para análise ULTRA profissional"
    );
  }
  
  decisionFlow.push({
    step: "setup_validation",
    status: "completed",
    details: `Setup grau ${marketGrade} aprovado para análise ULTRA`
  });
  
  // PASSO 5: Verificar confirmação por vela (CRÍTICO)
  let candleConfirmation: CandleConfirmation | undefined;
  
  if (professionalResult.signal !== "WAIT") {
    decisionFlow.push({
      step: "candle_confirmation_check",
      status: "pending",
      details: `Verificando confirmação da próxima vela para ${professionalResult.signal}`
    });
    
    console.log("🕯️ Verificando confirmação da próxima vela antes de sugerir entrada...");
    
    try {
      candleConfirmation = checkCandleConfirmation(
        professionalResult.signal,
        professionalResult.confidence,
        timeframe
      );
      
      console.log(`🕯️ Confirmação por vela: ${candleConfirmation.confirmed ? 'CONFIRMADA' : candleConfirmation.waitingForConfirmation ? 'PENDENTE' : 'NEGATIVA'}`);
      
      // AGUARDANDO CONFIRMAÇÃO
      if (candleConfirmation.waitingForConfirmation) {
        decisionFlow.push({
          step: "candle_confirmation_check",
          status: "pending",
          details: `Aguardando confirmação da próxima vela (${candleConfirmation.timeToWait}s)`
        });
        
        return {
          action: "WAIT",
          confidence: candleConfirmation.confidence,
          timing: {
            enter_now: false,
            wait_seconds: candleConfirmation.timeToWait,
            optimal_window: candleConfirmation.timeToWait / 2
          },
          reasoning: [
            `🕯️ ${candleConfirmation.confirmationMessage}`,
            `⏳ Baseado em 61,5% de assertividade (16/26 operações positivas)`,
            `🎯 Sistema aguarda confirmação para ${professionalResult.signal}`,
            `🎓 Setup grau ${marketGrade} pré-aprovado`,
            ...professionalResult.reasoning.slice(0, 2) // Apenas primeiros 2 para não sobrecarregar
          ],
          risk_level: "MEDIUM",
          expected_success_rate: Math.max(55, candleConfirmation.confidence),
          professional_analysis: {
            confluences: professionalResult.confluences,
            contraindications: professionalResult.contraindications,
            market_grade: marketGrade
          },
          candle_confirmation: candleConfirmation,
          decision_flow: decisionFlow
        };
      }
      
      // VELA NÃO CONFIRMOU
      if (!candleConfirmation.confirmed) {
        decisionFlow.push({
          step: "candle_confirmation_check",
          status: "failed",
          details: `Vela seguinte NÃO confirmou ${professionalResult.signal} - Direção: ${candleConfirmation.nextCandleDirection}`
        });
        
        console.log("❌ Vela seguinte NÃO confirmou o sinal - Aguardando nova oportunidade");
        
        return {
          action: "WAIT",
          confidence: Math.max(35, candleConfirmation.confidence),
          timing: {
            enter_now: false,
            wait_seconds: 60,
            optimal_window: 30
          },
          reasoning: [
            `❌ ${candleConfirmation.confirmationMessage}`,
            `⚠️ Movimento contrário detectado: ${candleConfirmation.nextCandleDirection}`,
            `🕯️ Sistema aguarda nova confirmação baseado em dados reais`,
            `📊 Setup ${marketGrade} permanece válido para próxima oportunidade`,
            "🎯 Proteção baseada em 61,5% de assertividade histórica"
          ],
          risk_level: "HIGH",
          expected_success_rate: Math.max(40, candleConfirmation.confidence - 10),
          professional_analysis: {
            confluences: professionalResult.confluences,
            contraindications: professionalResult.contraindications,
            market_grade: marketGrade
          },
          candle_confirmation: candleConfirmation,
          decision_flow: decisionFlow
        };
      }
      
      // VELA CONFIRMOU - SUCESSO!
      decisionFlow.push({
        step: "candle_confirmation_check",
        status: "completed",
        details: `Vela CONFIRMOU ${professionalResult.signal} (${candleConfirmation.confirmationType}) - Força: ${candleConfirmation.signalStrength.toFixed(1)}%`
      });
      
      console.log(`✅ Vela seguinte CONFIRMOU ${professionalResult.signal} - Aumentando confiança!`);
      
    } catch (error) {
      decisionFlow.push({
        step: "candle_confirmation_check",
        status: "failed",
        details: `Erro na verificação de vela: ${error}`
      });
      
      console.error("Erro na verificação de confirmação por vela:", error);
      // Continuar sem confirmação por vela em caso de erro
    }
  }
  
  // PASSO 6: Calcular timing e taxa de sucesso
  decisionFlow.push({
    step: "timing_calculation",
    status: "completed",
    details: "Calculando timing de entrada e taxa de sucesso"
  });
  
  const entryTiming = calculateProfessionalTiming(
    professionalResult,
    marketContext,
    factors.timing_analysis,
    candleConfirmation
  );
  
  let successRate = calculateProfessionalSuccessRate(
    professionalResult.signal,
    professionalResult.confidence,
    professionalResult.confluences,
    marketGrade,
    marketContext
  );
  
  // Aplicar boost de confirmação por vela
  if (candleConfirmation?.confirmed) {
    const confirmationBoost = candleConfirmation.confirmationType === "strong" ? 10 :
                            candleConfirmation.confirmationType === "moderate" ? 6 : 3;
    successRate = Math.min(95, successRate + confirmationBoost);
    console.log(`🚀 Taxa de sucesso aumentada em ${confirmationBoost}% pela confirmação ${candleConfirmation.confirmationType} da vela`);
  }
  
  // PASSO 7: Compilar reasoning final
  const professionalReasoning = [
    `🏆 Setup ULTRA grau ${marketGrade} APROVADO (${professionalResult.confluences} confluências)`,
    `📊 Análise técnica: ${professionalResult.signal} com ${professionalResult.confidence}% confiança`
  ];
  
  // Adicionar informações de confirmação por vela
  if (candleConfirmation) {
    professionalReasoning.push(`🕯️ ${candleConfirmation.confirmationMessage}`);
    
    if (candleConfirmation.confirmed) {
      professionalReasoning.push(`✅ Confirmação ${candleConfirmation.confirmationType.toUpperCase()} validada`);
      professionalReasoning.push(`📈 Força do sinal: ${candleConfirmation.signalStrength.toFixed(1)}%`);
    }
  }
  
  professionalReasoning.push(
    `🎯 Taxa de sucesso esperada: ${successRate}%`,
    `⚠️ Nível de risco: ${professionalResult.riskLevel}`,
    `📚 Baseado em Edwards & Magee + Elder + dados reais (61,5% assertividade)`
  );
  
  decisionFlow.push({
    step: "final_decision",
    status: "completed",
    details: `Decisão: ${professionalResult.signal} | Confiança: ${candleConfirmation?.confidence || professionalResult.confidence}% | Sucesso esperado: ${successRate}%`
  });
  
  console.log(`🏆 Decisão ULTRA final: ${professionalResult.signal} | Grau: ${marketGrade} | Sucesso: ${successRate}% | Vela: ${candleConfirmation?.confirmed ? 'CONFIRMADA' : 'N/A'}`);
  
  return {
    action: professionalResult.signal,
    confidence: candleConfirmation?.confidence || professionalResult.confidence,
    timing: entryTiming,
    reasoning: professionalReasoning,
    risk_level: professionalResult.riskLevel,
    expected_success_rate: successRate,
    professional_analysis: {
      confluences: professionalResult.confluences,
      contraindications: professionalResult.contraindications,
      market_grade: marketGrade
    },
    candle_confirmation: candleConfirmation,
    decision_flow: decisionFlow
  };
};

// Função auxiliar para criar decisão de espera
const createWaitDecision = (
  marketGrade: string,
  professionalResult: any,
  decisionFlow: any[],
  reason: string
): AutonomousDecision => {
  decisionFlow.push({
    step: "final_decision",
    status: "completed",
    details: `Decisão: WAIT - ${reason}`
  });
  
  return {
    action: "WAIT",
    confidence: Math.max(30, professionalResult.confidence - 25),
    timing: {
      enter_now: false,
      wait_seconds: 90,
      optimal_window: 45
    },
    reasoning: [
      `❌ ${reason}`,
      `📊 Setup grau ${marketGrade} - Requer mínimo grau B`,
      "🎓 Aguardando setup ULTRA profissional",
      "🏛️ Padrões clássicos + Multi-indicadores necessários",
      ...professionalResult.reasoning.slice(0, 2)
    ],
    risk_level: "HIGH",
    expected_success_rate: Math.max(45, professionalResult.confidence - 15),
    professional_analysis: {
      confluences: professionalResult.confluences,
      contraindications: professionalResult.contraindications,
      market_grade: marketGrade as any
    },
    decision_flow: decisionFlow
  };
};

// Determinar perfil de volume
const determineVolumeProfile = (visualAnalysis: any): "high" | "medium" | "low" => {
  const volumeSignificance = visualAnalysis?.volumeAnalysis?.significance || 50;
  
  if (volumeSignificance > 70) return "high";
  if (volumeSignificance > 40) return "medium";
  return "low";
};

// Classificar qualidade do setup ULTRA profissional
const gradeMarketSetup = (
  confluences: number,
  contraindications: number,
  confidence: number,
  context: MarketContext
): "A" | "B" | "C" | "D" | "F" => {
  let score = 0;
  
  score += Math.min(60, confluences * 15);
  score -= Math.min(40, contraindications * 12);
  score += Math.min(30, (confidence - 50) * 0.6);
  
  if (context.timeframe === "30s" && context.trendStrength < 75) {
    score -= 20;
  }
  
  if (context.marketType === "otc" && contraindications > 0) {
    score -= 15;
  }
  
  if (context.volatility > 75) {
    score -= 15;
  }
  
  if (confluences >= 6) {
    score += 10;
  }
  
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
};

// Calcular timing de entrada ULTRA profissional com confirmação por vela
const calculateProfessionalTiming = (
  professionalResult: any,
  context: MarketContext,
  timingAnalysis: any,
  candleConfirmation?: CandleConfirmation
) => {
  const optimalEntry = timingAnalysis?.optimal_entry || false;
  const timeRemaining = professionalResult.timeValidity;
  
  // Entrada imediata apenas se vela confirmou E setup é de alta qualidade
  const enterNow = optimalEntry && 
                   candleConfirmation?.confirmed === true &&
                   professionalResult.confidence >= 80 && 
                   professionalResult.confluences >= 4;
  
  let waitSeconds = 0;
  let optimalWindow = timeRemaining;
  
  if (!enterNow) {
    if (context.timeframe === "30s") {
      waitSeconds = candleConfirmation?.waitingForConfirmation ? candleConfirmation.timeToWait : 
                   Math.min(20, Math.max(5, 25 - professionalResult.confidence / 4));
      optimalWindow = 15;
    } else if (context.timeframe === "1m") {
      waitSeconds = candleConfirmation?.waitingForConfirmation ? candleConfirmation.timeToWait :
                   Math.min(40, Math.max(10, 50 - professionalResult.confidence / 2));
      optimalWindow = 30;
    } else {
      waitSeconds = candleConfirmation?.waitingForConfirmation ? candleConfirmation.timeToWait :
                   Math.min(80, Math.max(20, 100 - professionalResult.confidence));
      optimalWindow = 60;
    }
  }
  
  return {
    enter_now: enterNow,
    wait_seconds: waitSeconds,
    optimal_window: optimalWindow
  };
};

// Calcular taxa de sucesso ULTRA profissional
const calculateProfessionalSuccessRate = (
  signal: "BUY" | "SELL" | "WAIT",
  confidence: number,
  confluences: number,
  grade: string,
  context: MarketContext
): number => {
  if (signal === "WAIT") {
    return Math.max(65, confidence);
  }
  
  const gradeBaseSuccess = {
    "A": 85,
    "B": 75,
    "C": 65,
    "D": 50,
    "F": 35
  };
  
  let successRate = gradeBaseSuccess[grade as keyof typeof gradeBaseSuccess];
  
  successRate += Math.min(15, (confluences - 3) * 2.5);
  successRate += (confidence - 70) * 0.4;
  
  if (context.timeframe === "30s") {
    successRate *= 0.90;
  } else if (context.timeframe === "5m") {
    successRate *= 1.10;
  }
  
  if (context.marketType === "otc") {
    successRate *= 0.95;
  }
  
  if (context.volatility > 70) {
    successRate *= 0.95;
  } else if (context.volatility < 30) {
    successRate *= 1.12;
  }
  
  if (confluences >= 6) {
    successRate *= 1.05;
  }
  
  return Math.max(50, Math.min(95, Math.round(successRate)));
};

export default makeAutonomousDecision;
