
import { useAnalyzer } from '@/context/AnalyzerContext';
import { useSupabaseAnalysis } from './useSupabaseAnalysis';
import { useUserSettings } from './useUserSettings';
import { useAdvancedTrading } from './useAdvancedTrading';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useEnhancedAnalysis = () => {
  const { user } = useAuth();
  const { imageData, prediction, marketType, selectedTimeframe, precision } = useAnalyzer();
  const { saveAnalysis, saveSignal } = useSupabaseAnalysis();
  const { settings } = useUserSettings();
  const { evaluateSignalRisk, performBacktest } = useAdvancedTrading();

  const runCompleteAnalysis = async (analysisType: string = 'enhanced') => {
    if (!user) {
      toast.error('Faça login para salvar análises');
      return;
    }

    if (!imageData) {
      toast.error('Nenhuma imagem para analisar');
      return;
    }

    try {
      // Salvar análise no Supabase
      const analysisData = {
        analysis_type: analysisType,
        image_data: imageData,
        results: prediction || {},
        timeframe: selectedTimeframe,
        market_type: marketType,
        precision: precision === 'alta' ? 5 : precision === 'normal' ? 3 : 1,
        confidence_score: prediction?.confidence || 0,
        ai_decision: prediction
      };

      const savedAnalysis = await saveAnalysis(analysisData);

      if (savedAnalysis && prediction) {
        // Avaliar risco do sinal
        const riskAssessment = evaluateSignalRisk(prediction);

        // Gerar sinal de trading se aplicável
        if (prediction.entryPoint !== 'wait' && prediction.confidence > 70) {
          const signal = {
            analysis_id: savedAnalysis.id,
            signal_type: prediction.entryPoint.toUpperCase(),
            confidence_level: prediction.confidence,
            entry_point: parseFloat(prediction.entryPoint) || undefined,
            timeframe: selectedTimeframe,
            market_conditions: {
              indicators: prediction.indicators,
              keyLevels: prediction.keyLevels,
              candleFormations: prediction.candleFormations
            },
            ai_reasoning: prediction.analysisNarrative,
            expires_at: new Date(Date.now() + (selectedTimeframe === '1m' ? 5 * 60 * 1000 : 30 * 60 * 1000)).toISOString()
          };

          await saveSignal(signal);

          // Executar backtesting se configurado
          if (settings?.ai_autonomous_enabled) {
            await performBacktest([prediction]);
          }
        }

        toast.success(`Análise ${analysisType} salva com sucesso!`);
        return savedAnalysis;
      }
    } catch (error) {
      console.error('Erro na análise completa:', error);
      toast.error('Erro ao salvar análise');
    }
  };

  return {
    runCompleteAnalysis
  };
};
