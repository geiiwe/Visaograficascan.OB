/**
 * Hook para IA Autônoma - VERSÃO APRIMORADA COM VALIDAÇÃO SEQUENCIAL
 * Sistema integrado com confirmação sequencial de velas e ajuste dinâmico de expiração
 */

import { useEffect, useState, useCallback } from 'react';
import { useAnalyzer } from '@/context/AnalyzerContext';
import { makeAutonomousDecision, AutonomousDecision, DecisionFactors } from '@/utils/autonomousDecision';
import { useAdvancedTrading } from './useAdvancedTrading';
import { toast } from 'sonner';

export const useAutonomousAI = (
  detailedResults: any,
  enhancedAnalysisResult: any,
  fastAnalysisResults: any[]
) => {
  const { selectedTimeframe, marketType, precision } = useAnalyzer();
  const [aiDecision, setAiDecision] = useState<AutonomousDecision | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<number>(0);
  
  // Integrar funcionalidades avançadas
  const { 
    evaluateSignalRisk, 
    performBacktest, 
    currentRisk, 
    positionSizing,
    activeAlerts,
    accountMetrics 
  } = useAdvancedTrading();
  
  // Função para processar decisão IA com verificações de coerência
  const processAIDecision = useCallback(async () => {
    if (!detailedResults || Object.keys(detailedResults).length === 0) {
      console.log("❌ Dados insuficientes para análise IA");
      return;
    }
    
    if (!enhancedAnalysisResult || !enhancedAnalysisResult.microPatterns) {
      console.log("❌ Análise enhanced não disponível");
      return;
    }
    
    // Verificar se é uma nova análise (evitar processamento duplicado)
    const currentTimestamp = Date.now();
    if (currentTimestamp - lastAnalysisTimestamp < 5000) {
      console.log("⏭️ Análise muito recente - aguardando intervalo mínimo");
      return;
    }
    
    setIsProcessing(true);
    setLastAnalysisTimestamp(currentTimestamp);
    
    // Preparar fatores para decisão com validação
    const factors: DecisionFactors = {
      micro_patterns: enhancedAnalysisResult.microPatterns || [],
      visual_analysis: enhancedAnalysisResult.visualAnalysis || {},
      market_conditions: {
        volatility: Math.max(0, Math.min(100, enhancedAnalysisResult.visualAnalysis?.priceAction?.volatility || 50)),
        noise: calculateMarketNoise(),
        trend_strength: Math.max(0, Math.min(100, enhancedAnalysisResult.visualAnalysis?.trendStrength || 50))
      },
      timing_analysis: enhancedAnalysisResult.timing || {},
      technical_indicators: detailedResults
    };
    
    console.log("🤖 IA processando decisão APRIMORADA com validação sequencial...");
    console.log("📊 Fatores de decisão:", {
      microPatterns: factors.micro_patterns.length,
      volatility: factors.market_conditions.volatility,
      trendStrength: factors.market_conditions.trend_strength,
      timeframe: selectedTimeframe
    });
    
    try {
      // Simular processamento mais realista
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const decision = makeAutonomousDecision(factors, selectedTimeframe, marketType);
      setAiDecision(decision);
      
      console.log("✅ Decisão IA APRIMORADA processada:", {
        action: decision.action,
        confidence: decision.confidence,
        grade: decision.professional_analysis.market_grade,
        candleConfirmation: decision.candle_confirmation?.confirmed,
        sequentialValidation: decision.candle_confirmation?.sequentialValidation?.isValid
      });
      
      // ✨ Avaliar risco do sinal se aplicável
      if (decision.action !== "WAIT" && decision.candle_confirmation?.confirmed) {
        try {
          const riskAssessment = evaluateSignalRisk({
            ...decision,
            timeframe: selectedTimeframe,
            entry_price: 100, // Simulado
            stop_loss: decision.action === "BUY" ? 98 : 102,
            take_profit: decision.action === "BUY" ? 104 : 96,
            volatility: factors.market_conditions.volatility,
            confluences: decision.professional_analysis.confluences
          });
          
          console.log("🎯 Avaliação de risco:", riskAssessment);
        } catch (error) {
          console.warn("⚠️ Erro na avaliação de risco:", error);
        }
      }
      
      // ✨ Executar backtesting com sinais similares
      if (fastAnalysisResults.length > 5) {
        try {
          await performBacktest(fastAnalysisResults.map(result => ({
            action: result.direction === "up" ? "BUY" : result.direction === "down" ? "SELL" : "WAIT",
            confidence: result.confidence,
            confluences: 2,
            timeframe: selectedTimeframe
          })));
        } catch (error) {
          console.warn("⚠️ Erro no backtesting:", error);
        }
      }
      
      // Notificar usuário com informações APRIMORADAS
      notifyUserDecisionAdvanced(decision, factors);
      
    } catch (error) {
      console.error("❌ Erro na decisão autônoma da IA:", error);
      toast.error("Erro na análise autônoma da IA", {
        description: "Sistema reiniciando análise..."
      });
    } finally {
      setIsProcessing(false);
    }
  }, [detailedResults, enhancedAnalysisResult, selectedTimeframe, marketType, evaluateSignalRisk, performBacktest, fastAnalysisResults, lastAnalysisTimestamp]);
  
  // Função APRIMORADA para notificar usuário
  const notifyUserDecisionAdvanced = (decision: AutonomousDecision, factors: DecisionFactors) => {
    const actionText = decision.action === "BUY" ? "COMPRAR" : 
                      decision.action === "SELL" ? "VENDER" : "AGUARDAR";
    
    const emoji = decision.action === "BUY" ? "📈" : 
                 decision.action === "SELL" ? "📉" : "⏳";
    
    const gradeEmoji = decision.professional_analysis.market_grade === "A" ? "🏆" :
                      decision.professional_analysis.market_grade === "B" ? "🥈" : 
                      decision.professional_analysis.market_grade === "C" ? "🥉" : "📊";
    
    // Informações APRIMORADAS de confirmação por vela
    let candleInfo = "";
    let sequentialInfo = "";
    
    if (decision.candle_confirmation) {
      const confirmation = decision.candle_confirmation;
      
      if (confirmation.waitingForConfirmation) {
        if (confirmation.sequentialValidation) {
          const seq = confirmation.sequentialValidation;
          candleInfo = ` 🕯️ Aguardando velas sequenciais (${seq.candlesInDirection}/${seq.requiredCandles})`;
          sequentialInfo = ` | Validação: ${seq.candlesInDirection}/${seq.requiredCandles}`;
        } else {
          candleInfo = " 🕯️ Aguardando próxima vela";
        }
      } else if (confirmation.confirmed) {
        if (confirmation.confirmationType === "sequential") {
          const seq = confirmation.sequentialValidation!;
          candleInfo = ` 🕯️ ${seq.candlesInDirection} velas CONFIRMARAM`;
          sequentialInfo = ` | Tempo ajustado: ${seq.adjustedExpirationTime}s`;
        } else {
          candleInfo = ` 🕯️ Vela ${confirmation.confirmationType}`;
        }
      } else {
        candleInfo = " 🕯️ Vela não confirmou";
      }
    }
    
    // Informações de risco e position sizing
    const riskInfo = currentRisk?.totalRisk ? ` | Risco: ${currentRisk.totalRisk}` : "";
    const positionInfo = positionSizing ? ` | Size: ${positionSizing.recommendedSize}` : "";
    
    if (decision.action !== "WAIT") {
      if (decision.timing.enter_now && decision.candle_confirmation?.confirmed) {
        // ENTRADA IMEDIATA CONFIRMADA (com validação sequencial se aplicável)
        const validationType = decision.candle_confirmation.confirmationType === "sequential" ? 
          "SEQUENCIAL" : "SIMPLES";
          
        toast.success(
          `${emoji} IA CONFIRMA ${validationType}: ${actionText} AGORA! ${gradeEmoji} Grau ${decision.professional_analysis.market_grade}${candleInfo}`,
          {
            duration: 12000,
            description: `${decision.confidence.toFixed(1)}% confiança | Sucesso: ${decision.expected_success_rate}%${sequentialInfo}${riskInfo}${positionInfo}`
          }
        );
      } else if (decision.candle_confirmation?.waitingForConfirmation) {
        // AGUARDANDO CONFIRMAÇÃO (simples ou sequencial)
        const validationType = decision.candle_confirmation.sequentialValidation ? 
          "SEQUENCIAL" : "SIMPLES";
          
        toast.info(
          `${emoji} IA PREPARA ${validationType}: ${actionText} ${gradeEmoji} Grau ${decision.professional_analysis.market_grade}${candleInfo}`,
          {
            duration: 15000,
            description: `${decision.confidence.toFixed(1)}% confiança | Aguardando confirmação | Sistema aprimorado ativo`
          }
        );
      } else if (decision.candle_confirmation && !decision.candle_confirmation.confirmed) {
        // CONFIRMAÇÃO NEGATIVA
        toast.warning(
          `⚠️ IA ALERTA: Confirmação negativa para ${actionText} ${gradeEmoji}${candleInfo}`,
          {
            duration: 10000,
            description: `${decision.confidence.toFixed(1)}% confiança | Aguardando nova oportunidade | Proteção sequencial ativa`
          }
        );
      } else {
        // SINAL COM TIMING
        toast.info(
          `${emoji} IA DECIDE: ${actionText} em ${decision.timing.wait_seconds}s ${gradeEmoji} Grau ${decision.professional_analysis.market_grade}${candleInfo}`,
          {
            duration: 10000,
            description: `${decision.confidence.toFixed(1)}% confiança | Timing otimizado${riskInfo}`
          }
        );
      }
    } else {
      // AGUARDAR (com contexto aprimorado)
      let waitReason = "Condições não favoráveis";
      
      if (decision.candle_confirmation?.sequentialValidation) {
        waitReason = `Aguardando ${decision.candle_confirmation.sequentialValidation.requiredCandles} velas sequenciais`;
      } else if (decision.candle_confirmation?.waitingForConfirmation) {
        waitReason = "Aguardando confirmação da próxima vela";
      } else if (decision.candle_confirmation && !decision.candle_confirmation.confirmed) {
        waitReason = "Confirmação por vela negativa";
      }
        
      toast.warning(
        `⏳ IA DECIDE: AGUARDAR ${gradeEmoji} Grau ${decision.professional_analysis.market_grade}${candleInfo}`,
        {
          duration: 10000,
          description: `${decision.confidence.toFixed(1)}% confiança | ${waitReason} | Sistema aprimorado ativo`
        }
      );
    }
    
    // Log APRIMORADO do fluxo de decisão
    if (decision.decision_flow) {
      console.log("📋 Fluxo de decisão aprimorado:", decision.decision_flow);
    }
    
    // Log adicional para validação sequencial
    if (decision.candle_confirmation?.sequentialValidation) {
      console.log("🔄 Validação sequencial:", decision.candle_confirmation.sequentialValidation);
    }
  };
  
  // Calcular ruído de mercado baseado nos resultados
  const calculateMarketNoise = (): number => {
    if (!detailedResults) return 50;
    
    const patterns = Object.values(detailedResults).filter((r: any) => r.found);
    if (patterns.length === 0) return 30;
    
    const conflicting = patterns.filter((r: any) => 
      Math.abs((r.buyScore || 0) - (r.sellScore || 0)) < 0.3
    ).length;
    
    return Math.min(100, (conflicting / Math.max(1, patterns.length)) * 100);
  };
  
  // Effect principal para trigger da análise
  useEffect(() => {
    processAIDecision();
  }, [processAIDecision]);
  
  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      console.log("🧹 Limpando hook useAutonomousAI aprimorado");
    };
  }, []);
  
  return {
    aiDecision,
    isProcessing,
    currentRisk,
    positionSizing,
    activeAlerts,
    accountMetrics,
    // Função para forçar nova análise (se necessário)
    refreshAnalysis: processAIDecision
  };
};
