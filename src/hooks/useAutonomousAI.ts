
/**
 * Hook para IA Autônoma
 * Integra o sistema de decisão autônoma com o contexto da aplicação
 */

import { useEffect, useState } from 'react';
import { useAnalyzer } from '@/context/AnalyzerContext';
import { makeAutonomousDecision, AutonomousDecision, DecisionFactors } from '@/utils/autonomousDecision';
import { toast } from 'sonner';

export const useAutonomousAI = (
  detailedResults: any,
  enhancedAnalysisResult: any,
  fastAnalysisResults: any[]
) => {
  const { selectedTimeframe, marketType, precision } = useAnalyzer();
  const [aiDecision, setAiDecision] = useState<AutonomousDecision | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
    
    console.log("🤖 IA preparando decisão autônoma...", factors);
    
    // Pequeno delay para simular processamento da IA
    setTimeout(() => {
      try {
        const decision = makeAutonomousDecision(factors, selectedTimeframe, marketType);
        setAiDecision(decision);
        setIsProcessing(false);
        
        // Notificar usuário da decisão da IA
        const actionText = decision.action === "BUY" ? "COMPRAR" : 
                          decision.action === "SELL" ? "VENDER" : "AGUARDAR";
        
        const emoji = decision.action === "BUY" ? "📈" : 
                     decision.action === "SELL" ? "📉" : "⏳";
        
        if (decision.action !== "WAIT") {
          if (decision.timing.enter_now) {
            toast.success(
              `${emoji} IA DECIDE: ${actionText} AGORA! (${decision.confidence}% confiança)`,
              {
                duration: 5000,
                description: `Taxa de sucesso esperada: ${decision.expected_success_rate}%`
              }
            );
          } else {
            toast.info(
              `${emoji} IA DECIDE: ${actionText} em ${decision.timing.wait_seconds}s (${decision.confidence}% confiança)`,
              {
                duration: 5000,
                description: `Aguardando timing ótimo. Taxa esperada: ${decision.expected_success_rate}%`
              }
            );
          }
        } else {
          toast.warning(
            `⏳ IA DECIDE: AGUARDAR (${decision.confidence}% confiança)`,
            {
              duration: 4000,
              description: "Condições não favoráveis para entrada"
            }
          );
        }
        
      } catch (error) {
        console.error("Erro na decisão autônoma da IA:", error);
        setIsProcessing(false);
        toast.error("Erro na análise autônoma da IA");
      }
    }, 1500);
    
  }, [detailedResults, enhancedAnalysisResult, selectedTimeframe, marketType]);
  
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
    isProcessing
  };
};
