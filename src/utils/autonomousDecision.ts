/**
 * Sistema de Decisão Autônoma da IA - VERSÃO ULTRA PROFISSIONAL
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
  candle_confirmation?: CandleConfirmation; // NOVA PROPRIEDADE
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
  console.log("🎓 IA iniciando decisão ULTRA PROFISSIONAL com confirmação por vela...");
  
  // Preparar contexto de mercado para análise ULTRA profissional
  const marketContext: MarketContext = {
    timeframe,
    marketType,
    volatility: factors.market_conditions.volatility,
    trendStrength: factors.market_conditions.trend_strength,
    volumeProfile: determineVolumeProfile(factors.visual_analysis)
  };
  
  // Realizar análise ULTRA profissional (agora com padrões clássicos + multi-indicadores)
  const professionalResult = performProfessionalAnalysis(
    factors.visual_analysis,
    factors.micro_patterns,
    factors.timing_analysis,
    marketContext
  );
  
  console.log(`🎓 Análise ULTRA profissional: ${professionalResult.signal} com ${professionalResult.confluences} confluências`);
  console.log(`🏛️ Padrões clássicos + Multi-indicadores integrados`);
  console.log(`🎓 Contraindicações encontradas: ${professionalResult.contraindications.length}`);
  
  // Verificar qualidade do setup ULTRA profissional
  const marketGrade = gradeMarketSetup(
    professionalResult.confluences,
    professionalResult.contraindications.length,
    professionalResult.confidence,
    marketContext
  );
  
  // NOVA REGRA: Setup deve ser pelo menos grau B para análise ULTRA
  if (marketGrade === "C" || marketGrade === "D" || marketGrade === "F") {
    console.log(`🎓 Setup rejeitado: Grau ${marketGrade} - Abaixo do padrão ULTRA profissional`);
    
    return {
      action: "WAIT",
      confidence: Math.max(25, professionalResult.confidence - 25),
      timing: {
        enter_now: false,
        wait_seconds: 90,
        optimal_window: 45
      },
      reasoning: [
        `❌ Setup grau ${marketGrade} rejeitado (ULTRA requer mín. grau B)`,
        ...professionalResult.reasoning,
        "🎓 Aguardando setup ULTRA profissional",
        "🏛️ Padrões clássicos + Multi-indicadores necessários"
      ],
      risk_level: "HIGH",
      expected_success_rate: Math.max(40, professionalResult.confidence - 15),
      professional_analysis: {
        confluences: professionalResult.confluences,
        contraindications: professionalResult.contraindications,
        market_grade: marketGrade
      }
    };
  }
  
  // ✨ NOVA FUNCIONALIDADE: VERIFICAR CONFIRMAÇÃO POR VELA
  let candleConfirmation: CandleConfirmation | undefined;
  
  if (professionalResult.signal !== "WAIT") {
    console.log("🕯️ Verificando confirmação da próxima vela antes de sugerir entrada...");
    
    candleConfirmation = checkCandleConfirmation(
      professionalResult.signal,
      professionalResult.confidence,
      timeframe
    );
    
    console.log(`🕯️ Confirmação por vela: ${candleConfirmation.confirmed ? 'CONFIRMADA' : 'PENDENTE/NEGATIVA'}`);
    
    // Se aguardando confirmação, registrar sinal pendente
    if (candleConfirmation.waitingForConfirmation) {
      registerPendingSignal(professionalResult.signal, professionalResult.confidence, timeframe);
      
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
          `🎯 Aguardando confirmação da próxima vela para ${professionalResult.signal}`,
          ...professionalResult.reasoning
        ],
        risk_level: "MEDIUM",
        expected_success_rate: Math.max(50, candleConfirmation.confidence),
        professional_analysis: {
          confluences: professionalResult.confluences,
          contraindications: professionalResult.contraindications,
          market_grade: marketGrade
        },
        candle_confirmation: candleConfirmation
      };
    }
    
    // Se vela não confirmou, reduzir confiança drasticamente
    if (!candleConfirmation.confirmed) {
      console.log("❌ Vela seguinte NÃO confirmou o sinal - Reduzindo confiança");
      
      return {
        action: "WAIT",
        confidence: Math.max(30, candleConfirmation.confidence),
        timing: {
          enter_now: false,
          wait_seconds: 60,
          optimal_window: 30
        },
        reasoning: [
          `❌ ${candleConfirmation.confirmationMessage}`,
          `⚠️ Vela seguinte moveu-se ${candleConfirmation.nextCandleDirection} (esperado: ${professionalResult.signal === 'BUY' ? 'up' : 'down'})`,
          `🕯️ Sistema aguarda nova confirmação baseado em dados reais`,
          ...professionalResult.reasoning
        ],
        risk_level: "HIGH",
        expected_success_rate: Math.max(40, candleConfirmation.confidence - 10),
        professional_analysis: {
          confluences: professionalResult.confluences,
          contraindications: professionalResult.contraindications,
          market_grade: marketGrade
        },
        candle_confirmation: candleConfirmation
      };
    }
    
    // Se vela confirmou, aumentar confiança!
    console.log(`✅ Vela seguinte CONFIRMOU ${professionalResult.signal} - Aumentando confiança!`);
  }
  
  // Verificar timing de entrada ULTRA profissional (com confirmação por vela)
  const entryTiming = calculateProfessionalTiming(
    professionalResult,
    marketContext,
    factors.timing_analysis
  );
  
  // Calcular taxa de sucesso baseada em estatísticas ULTRA profissionais + confirmação por vela
  let successRate = calculateProfessionalSuccessRate(
    professionalResult.signal,
    professionalResult.confidence,
    professionalResult.confluences,
    marketGrade,
    marketContext
  );
  
  // Aplicar boost de confirmação por vela
  if (candleConfirmation?.confirmed) {
    const confirmationBoost = candleConfirmation.confirmationType === "strong" ? 8 :
                            candleConfirmation.confirmationType === "moderate" ? 5 : 2;
    successRate = Math.min(95, successRate + confirmationBoost);
    console.log(`🚀 Taxa de sucesso aumentada em ${confirmationBoost}% pela confirmação da vela`);
  }
  
  // Compilar reasoning ULTRA profissional com confirmação por vela
  const professionalReasoning = [
    `🏆 Setup ULTRA grau ${marketGrade} aprovado (${professionalResult.confluences} confluências)`,
    `📊 Análise técnica integrada: ${professionalResult.signal} com ${professionalResult.confidence}% confiança`,
    `🏛️ Padrões clássicos + Multi-indicadores + Confluências técnicas`,
    ...professionalResult.reasoning
  ];
  
  // Adicionar informações de confirmação por vela
  if (candleConfirmation) {
    professionalReasoning.push(`🕯️ ${candleConfirmation.confirmationMessage}`);
    
    if (candleConfirmation.confirmed) {
      professionalReasoning.push(`✅ Confirmação ${candleConfirmation.confirmationType.toUpperCase()} da próxima vela`);
      professionalReasoning.push(`📈 Baseado em resultados reais: 61,5% assertividade (16/26 ops)`);
    }
  }
  
  professionalReasoning.push(
    `⚠️ Nível de risco ULTRA: ${professionalResult.riskLevel}`,
    `🎯 Taxa de sucesso ULTRA esperada: ${successRate}%`,
    `📚 Baseado em Edwards & Magee, Bulkowski, Elder, Murphy + dados reais`
  );
  
  if (professionalResult.contraindications.length > 0) {
    professionalReasoning.push(`⚠️ Contraindicações: ${professionalResult.contraindications.join(", ")}`);
  }
  
  console.log(`🏆 Decisão ULTRA final: ${professionalResult.signal} | Grau: ${marketGrade} | Sucesso esperado: ${successRate}% | Vela: ${candleConfirmation?.confirmed ? 'CONFIRMADA' : 'N/A'}`);
  
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
    candle_confirmation: candleConfirmation
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
  
  // NOVA PONTUAÇÃO: Confluências são mais importantes no sistema ULTRA
  score += Math.min(60, confluences * 15); // Aumentado de 12 para 15
  
  // NOVA PENALIDADE: Contraindicações são mais penalizadas
  score -= Math.min(40, contraindications * 12); // Aumentado de 10 para 12
  
  // Pontuação por confiança (máximo 30 pontos)
  score += Math.min(30, (confidence - 50) * 0.6);
  
  // NOVOS AJUSTES: Critérios mais rígidos para sistema ULTRA
  if (context.timeframe === "30s" && context.trendStrength < 75) {
    score -= 20; // Aumentado de 15 para 20
  }
  
  if (context.marketType === "otc" && contraindications > 0) {
    score -= 15; // Aumentado de 10 para 15
  }
  
  if (context.volatility > 75) {
    score -= 15; // Aumentado de 10 para 15
  }
  
  // NOVA REGRA: Bonus por confluências altas
  if (confluences >= 6) {
    score += 10; // Bonus para setups com muitas confluências
  }
  
  // NOVA CLASSIFICAÇÃO: Mais rígida para sistema ULTRA
  if (score >= 90) return "A"; // Setup ULTRA excelente
  if (score >= 75) return "B"; // Setup ULTRA bom
  if (score >= 60) return "C"; // Setup aceitável (mas rejeitado no ULTRA)
  if (score >= 45) return "D"; // Setup fraco
  return "F"; // Setup péssimo
};

// Calcular timing de entrada ULTRA profissional
const calculateProfessionalTiming = (
  professionalResult: any,
  context: MarketContext,
  timingAnalysis: any
) => {
  const optimalEntry = timingAnalysis?.optimal_entry || false;
  const timeRemaining = professionalResult.timeValidity;
  
  // Entrada imediata apenas para setups de alta qualidade
  const enterNow = optimalEntry && 
                   professionalResult.confidence >= 80 && 
                   professionalResult.confluences >= 4;
  
  let waitSeconds = 0;
  let optimalWindow = timeRemaining;
  
  if (!enterNow) {
    // Calcular tempo de espera baseado no timeframe e qualidade
    if (context.timeframe === "30s") {
      waitSeconds = Math.min(20, Math.max(5, 25 - professionalResult.confidence / 4));
      optimalWindow = 15;
    } else if (context.timeframe === "1m") {
      waitSeconds = Math.min(40, Math.max(10, 50 - professionalResult.confidence / 2));
      optimalWindow = 30;
    } else {
      waitSeconds = Math.min(80, Math.max(20, 100 - professionalResult.confidence));
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
    return Math.max(65, confidence); // Esperar é sempre mais seguro no sistema ULTRA
  }
  
  // NOVA BASE: Setups ULTRA têm bases de sucesso mais altas
  const gradeBaseSuccess = {
    "A": 85, // Aumentado de 78 para 85
    "B": 75, // Aumentado de 68 para 75
    "C": 65, // Aumentado de 58 para 65 (mas não usado no ULTRA)
    "D": 50, // Aumentado de 45 para 50 (mas não usado no ULTRA)
    "F": 35  // Aumentado de 30 para 35 (mas não usado no ULTRA)
  };
  
  let successRate = gradeBaseSuccess[grade as keyof typeof gradeBaseSuccess];
  
  // NOVO AJUSTE: Confluências têm impacto maior
  successRate += Math.min(15, (confluences - 3) * 2.5); // Aumentado de 2 para 2.5
  
  // Ajustes por confiança
  successRate += (confidence - 70) * 0.4; // Aumentado de 0.3 para 0.4
  
  // Ajustes por timeframe (estatísticas ULTRA de trading)
  if (context.timeframe === "30s") {
    successRate *= 0.90; // Melhorado de 0.85 para 0.90
  } else if (context.timeframe === "5m") {
    successRate *= 1.10; // Aumentado de 1.05 para 1.10
  }
  
  // Ajustes por tipo de mercado
  if (context.marketType === "otc") {
    successRate *= 0.95; // Melhorado de 0.90 para 0.95
  }
  
  // Ajustes por volatilidade
  if (context.volatility > 70) {
    successRate *= 0.95; // Melhorado de 0.92 para 0.95
  } else if (context.volatility < 30) {
    successRate *= 1.12; // Aumentado de 1.08 para 1.12
  }
  
  // NOVO BONUS: Para setups ULTRA com muitas confluências
  if (confluences >= 6) {
    successRate *= 1.05;
  }
  
  return Math.max(50, Math.min(95, Math.round(successRate)));
};

export default makeAutonomousDecision;
