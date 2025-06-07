/**
 * Sistema de Decisão Autônoma da IA - VERSÃO APRIMORADA COM VALIDAÇÃO SEQUENCIAL
 * Integra padrões clássicos + confluências múltiplas + conhecimento profissional + CONFIRMAÇÃO SEQUENCIAL DE VELAS
 */

import { ExtendedPatternResult } from './predictionUtils';
import { performProfessionalAnalysis, MarketContext } from './professionalAnalysisEngine';
import { checkCandleConfirmation, CandleConfirmation } from './candleConfirmation/candleConfirmationEngine';

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
  console.log("🎓 IA iniciando decisão APRIMORADA com validação sequencial de velas...");
  
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
  
  // PASSO 5: Verificar confirmação APRIMORADA por vela (com validação sequencial)
  let candleConfirmation: CandleConfirmation | undefined;
  
  if (professionalResult.signal !== "WAIT") {
    decisionFlow.push({
      step: "candle_confirmation_check",
      status: "pending",
      details: `Verificando confirmação APRIMORADA (sequencial) para ${professionalResult.signal}`
    });
    
    console.log("🕯️ Verificando confirmação APRIMORADA com validação sequencial...");
    
    try {
      // Calcular tempo de expiração baseado no timeframe e confluências
      const baseExpirationTime = calculateBaseExpirationTime(timeframe, professionalResult.confluences);
      
      candleConfirmation = checkCandleConfirmation(
        professionalResult.signal,
        professionalResult.confidence,
        timeframe,
        baseExpirationTime
      );
      
      console.log(`🕯️ Confirmação APRIMORADA: ${candleConfirmation.confirmed ? 'CONFIRMADA' : candleConfirmation.waitingForConfirmation ? 'PENDENTE' : 'NEGATIVA'}`);
      
      // Log adicional para validação sequencial
      if (candleConfirmation.sequentialValidation) {
        const seq = candleConfirmation.sequentialValidation;
        console.log(`🔄 Validação sequencial: ${seq.candlesInDirection}/${seq.requiredCandles} velas | Válida: ${seq.isValid}`);
      }
      
      // AGUARDANDO CONFIRMAÇÃO (simples ou sequencial)
      if (candleConfirmation.waitingForConfirmation) {
        const validationType = candleConfirmation.sequentialValidation ? "SEQUENCIAL" : "SIMPLES";
        
        decisionFlow.push({
          step: "candle_confirmation_check",
          status: "pending",
          details: `Aguardando confirmação ${validationType} (${candleConfirmation.timeToWait}s)`
        });
        
        let waitDescription = `⏳ ${candleConfirmation.confirmationMessage}`;
        if (candleConfirmation.sequentialValidation) {
          const seq = candleConfirmation.sequentialValidation;
          waitDescription += ` | Progresso: ${seq.candlesInDirection}/${seq.requiredCandles}`;
        }
        
        return {
          action: "WAIT",
          confidence: candleConfirmation.confidence,
          timing: {
            enter_now: false,
            wait_seconds: candleConfirmation.timeToWait,
            optimal_window: candleConfirmation.timeToWait / 2
          },
          reasoning: [
            waitDescription,
            `🎯 Sistema APRIMORADO aguarda confirmação para ${professionalResult.signal}`,
            `🎓 Setup grau ${marketGrade} pré-aprovado`,
            `🔄 Validação ${validationType.toLowerCase()} em andamento`,
            ...professionalResult.reasoning.slice(0, 1)
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
      
      // CONFIRMAÇÃO NEGATIVA
      if (!candleConfirmation.confirmed) {
        decisionFlow.push({
          step: "candle_confirmation_check",
          status: "failed",
          details: `Confirmação ${candleConfirmation.confirmationType} NEGATIVA para ${professionalResult.signal}`
        });
        
        console.log("❌ Confirmação NEGATIVA - Sistema aguarda nova oportunidade");
        
        let negativeReason = `❌ ${candleConfirmation.confirmationMessage}`;
        if (candleConfirmation.sequentialValidation && !candleConfirmation.sequentialValidation.isValid) {
          negativeReason += ` | Validação sequencial falhou`;
        }
        
        return {
          action: "WAIT",
          confidence: Math.max(35, candleConfirmation.confidence),
          timing: {
            enter_now: false,
            wait_seconds: candleConfirmation.timeToWait || 90,
            optimal_window: 45
          },
          reasoning: [
            negativeReason,
            `⚠️ Sistema APRIMORADO detectou reversão ou inconsistência`,
            `📊 Setup ${marketGrade} permanece válido para próxima oportunidade`,
            "🎯 Proteção baseada em validação sequencial de velas",
            "🔄 Aguardando nova confirmação com critérios aprimorados"
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
      
      // CONFIRMAÇÃO POSITIVA - SUCESSO!
      const validationType = candleConfirmation.confirmationType === "sequential" ? "SEQUENCIAL" : "SIMPLES";
      
      decisionFlow.push({
        step: "candle_confirmation_check",
        status: "completed",
        details: `Confirmação ${validationType} APROVADA para ${professionalResult.signal} - Força: ${candleConfirmation.signalStrength.toFixed(1)}%`
      });
      
      console.log(`✅ Confirmação ${validationType} APROVADA para ${professionalResult.signal}!`);
      
    } catch (error) {
      decisionFlow.push({
        step: "candle_confirmation_check",
        status: "failed",
        details: `Erro na verificação APRIMORADA: ${error}`
      });
      
      console.error("Erro na verificação de confirmação APRIMORADA:", error);
    }
  }
  
  // PASSO 6: Calcular timing APRIMORADO e taxa de sucesso
  decisionFlow.push({
    step: "timing_calculation",
    status: "completed",
    details: "Calculando timing APRIMORADO e taxa de sucesso"
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
  
  // Aplicar boost APRIMORADO de confirmação por vela
  if (candleConfirmation?.confirmed) {
    let confirmationBoost = 0;
    
    if (candleConfirmation.confirmationType === "sequential") {
      // Boost maior para validação sequencial
      const sequentialBoost = candleConfirmation.sequentialValidation?.candlesInDirection || 2;
      confirmationBoost = Math.min(15, sequentialBoost * 3);
      console.log(`🚀 Taxa de sucesso aumentada em ${confirmationBoost}% pela validação SEQUENCIAL de ${sequentialBoost} velas`);
    } else {
      // Boost padrão para confirmação simples
      confirmationBoost = candleConfirmation.confirmationType === "strong" ? 10 :
                         candleConfirmation.confirmationType === "moderate" ? 6 : 3;
      console.log(`🚀 Taxa de sucesso aumentada em ${confirmationBoost}% pela confirmação ${candleConfirmation.confirmationType}`);
    }
    
    successRate = Math.min(95, successRate + confirmationBoost);
  }
  
  // PASSO 7: Compilar reasoning APRIMORADO
  const professionalReasoning = [
    `🏆 Setup ULTRA grau ${marketGrade} APROVADO (${professionalResult.confluences} confluências)`,
    `📊 Análise técnica APRIMORADA: ${professionalResult.signal} com ${professionalResult.confidence}% confiança`
  ];
  
  // Adicionar informações APRIMORADAS de confirmação por vela
  if (candleConfirmation) {
    if (candleConfirmation.confirmationType === "sequential") {
      const seq = candleConfirmation.sequentialValidation!;
      professionalReasoning.push(`🕯️ Validação SEQUENCIAL: ${seq.candlesInDirection} velas confirmaram direção`);
      professionalReasoning.push(`⏰ Tempo ajustado: ${seq.adjustedExpirationTime}s (otimizado pela sequência)`);
    } else {
      professionalReasoning.push(`🕯️ ${candleConfirmation.confirmationMessage}`);
    }
    
    if (candleConfirmation.confirmed) {
      professionalReasoning.push(`✅ Confirmação ${candleConfirmation.confirmationType.toUpperCase()} validada`);
      professionalReasoning.push(`📈 Força do sinal: ${candleConfirmation.signalStrength.toFixed(1)}%`);
    }
  }
  
  professionalReasoning.push(
    `🎯 Taxa de sucesso esperada: ${successRate}%`,
    `⚠️ Nível de risco: ${professionalResult.riskLevel}`,
    `📚 Baseado em Edwards & Magee + Elder + validação sequencial aprimorada`
  );
  
  decisionFlow.push({
    step: "final_decision",
    status: "completed",
    details: `Decisão: ${professionalResult.signal} | Confiança: ${candleConfirmation?.confidence || professionalResult.confidence}% | Sucesso: ${successRate}% | Validação: ${candleConfirmation?.confirmationType || 'N/A'}`
  });
  
  console.log(`🏆 Decisão ULTRA APRIMORADA: ${professionalResult.signal} | Grau: ${marketGrade} | Sucesso: ${successRate}% | Validação: ${candleConfirmation?.confirmationType || 'N/A'}`);
  
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

// Função para calcular tempo de expiração base
const calculateBaseExpirationTime = (timeframe: string, confluences: number): number => {
  const baseTimeframes = {
    "30s": 180,  // 3 minutos base
    "1m": 300,   // 5 minutos base
    "5m": 900,   // 15 minutos base
    "15m": 1800  // 30 minutos base
  };
  
  let baseTime = baseTimeframes[timeframe as keyof typeof baseTimeframes] || 300;
  
  // Ajustar baseado nas confluências
  if (confluences >= 5) {
    baseTime *= 1.3; // Mais confluências = mais tempo
  } else if (confluences <= 2) {
    baseTime *= 0.8; // Poucas confluências = menos tempo
  }
  
  return Math.round(baseTime);
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
      "🎓 Aguardando setup ULTRA profissional com validação sequencial",
      "🏛️ Padrões clássicos + Multi-indicadores + Confirmação sequencial necessários",
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
  
  // Entrada imediata apenas se confirmação for positiva E setup de alta qualidade
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
