
/**
 * Hook para IA Autônoma - VERSÃO APRIMORADA COM CONFIRMAÇÃO POR VELA
 * Integra sistema de decisão autônoma com confirmação baseada na próxima vela
 */

import { useEffect, useState } from 'react';
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
  
  // Integrar funcionalidades avançadas
  const { 
    evaluateSignalRisk, 
    performBacktest, 
    currentRisk, 
    positionSizing,
    activeAlerts,
    accountMetrics 
  } = useAdvancedTrading();
  
  useEffect(() => {
    if (!detailedResults || Object.keys(detailedResults).length === 0) {
      return;
    }
    
    // A IA só toma decisão quando tem dados suficientes
    if (!enhancedAnalysisResult || !enhancedAnalysisResult.microPatterns) {
      return;
    }
    
    setIsProcessing(true);
    
    // Preparar fatores para decisão
    const factors: DecisionFactors = {
      micro_patterns: enhancedAnalysisResult.microPatterns || [],
      visual_analysis: enhancedAnalysisResult.visualAnalysis || {},
      market_conditions: {
        volatility: enhancedAnalysisResult.visualAnalysis?.priceAction?.volatility || 50,
        noise: calculateMarketNoise(),
        trend_strength: enhancedAnalysisResult.visualAnalysis?.trendStrength || 50
      },
      timing_analysis: enhancedAnalysisResult.timing || {},
      technical_indicators: detailedResults
    };
    
    console.log("🤖 IA preparando decisão autônoma APRIMORADA com confirmação por vela...", factors);
    
    // Pequeno delay para simular processamento da IA
    setTimeout(async () => {
      try {
        const decision = makeAutonomousDecision(factors, selectedTimeframe, marketType);
        setAiDecision(decision);
        
        // ✨ NOVA FUNCIONALIDADE: Avaliar risco do sinal
        if (decision.action !== "WAIT") {
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
        }
        
        // ✨ NOVA FUNCIONALIDADE: Executar backtesting com sinais similares
        if (fastAnalysisResults.length > 5) {
          await performBacktest(fastAnalysisResults.map(result => ({
            action: result.direction === "up" ? "BUY" : result.direction === "down" ? "SELL" : "WAIT",
            confidence: result.confidence,
            confluences: 2, // Simulado
            timeframe: selectedTimeframe
          })));
        }
        
        setIsProcessing(false);
        
        // Notificar usuário da decisão da IA com informações aprimoradas + confirmação por vela
        const actionText = decision.action === "BUY" ? "COMPRAR" : 
                          decision.action === "SELL" ? "VENDER" : "AGUARDAR";
        
        const emoji = decision.action === "BUY" ? "📈" : 
                     decision.action === "SELL" ? "📉" : "⏳";
        
        const gradeEmoji = decision.professional_analysis.market_grade === "A" ? "🏆" :
                          decision.professional_analysis.market_grade === "B" ? "🥈" : 
                          decision.professional_analysis.market_grade === "C" ? "🥉" : "📊";
        
        // ✨ NOVA FUNCIONALIDADE: Incluir informações de confirmação por vela nas notificações
        const candleInfo = decision.candle_confirmation ? 
          (decision.candle_confirmation.waitingForConfirmation ? " 🕯️ Aguardando vela" :
           decision.candle_confirmation.confirmed ? ` 🕯️ Vela ${decision.candle_confirmation.confirmationType}` :
           " 🕯️ Vela não confirmou") : "";
        
        if (decision.action !== "WAIT") {
          // Incluir informações de risco e position sizing
          const riskInfo = currentRisk ? ` | Risco: ${currentRisk.totalRisk}` : "";
          const positionInfo = positionSizing ? ` | Size: ${positionSizing.recommendedSize}` : "";
          
          if (decision.timing.enter_now && decision.candle_confirmation?.confirmed) {
            toast.success(
              `${emoji} IA DECIDE: ${actionText} AGORA! ${gradeEmoji} Grade ${decision.professional_analysis.market_grade}${candleInfo}`,
              {
                duration: 8000,
                description: `${decision.confidence}% confiança | Sucesso: ${decision.expected_success_rate}% | Confirmado por vela${riskInfo}${positionInfo}`
              }
            );
          } else if (decision.candle_confirmation?.waitingForConfirmation) {
            toast.info(
              `${emoji} IA PREPARA: ${actionText} ${gradeEmoji} Grade ${decision.professional_analysis.market_grade}${candleInfo}`,
              {
                duration: 10000,
                description: `${decision.confidence}% confiança | Baseado em 61,5% assertividade real | Aguardando confirmação da próxima vela`
              }
            );
          } else {
            toast.info(
              `${emoji} IA DECIDE: ${actionText} em ${decision.timing.wait_seconds}s ${gradeEmoji} Grade ${decision.professional_analysis.market_grade}${candleInfo}`,
              {
                duration: 6000,
                description: `${decision.confidence}% confiança | Timing ótimo em breve${riskInfo}`
              }
            );
          }
        } else {
          const waitReason = decision.candle_confirmation?.waitingForConfirmation ? 
            "Aguardando confirmação da próxima vela" :
            decision.candle_confirmation && !decision.candle_confirmation.confirmed ?
            "Vela seguinte não confirmou sinal" :
            "Condições não favoráveis";
            
          toast.warning(
            `⏳ IA DECIDE: AGUARDAR ${gradeEmoji} Grade ${decision.professional_analysis.market_grade}${candleInfo}`,
            {
              duration: 7000,
              description: `${decision.confidence}% confiança | ${waitReason}`
            }
          );
        }
        
      } catch (error) {
        console.error("Erro na decisão autônoma da IA:", error);
        setIsProcessing(false);
        toast.error("Erro na análise autônoma da IA");
      }
    }, 1500);
    
  }, [detailedResults, enhancedAnalysisResult, selectedTimeframe, marketType, evaluateSignalRisk, performBacktest, fastAnalysisResults]);
  
  // Calcular ruído de mercado baseado nos resultados
  const calculateMarketNoise = (): number => {
    if (!detailedResults) return 50;
    
    const patterns = Object.values(detailedResults).filter((r: any) => r.found);
    const conflicting = patterns.filter((r: any) => 
      Math.abs((r.buyScore || 0) - (r.sellScore || 0)) < 0.3
    ).length;
    
    return Math.min(100, (conflicting / Math.max(1, patterns.length)) * 100);
  };
  
  return {
    aiDecision,
    isProcessing,
    // ✨ NOVAS FUNCIONALIDADES EXPOSTAS
    currentRisk,
    positionSizing,
    activeAlerts,
    accountMetrics
  };
};
