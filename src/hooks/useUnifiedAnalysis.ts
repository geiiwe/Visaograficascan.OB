
import { useState, useCallback, useRef } from 'react';
import { useAnalyzer } from '@/context/AnalyzerContext';
import { PatternDetectionService, type PatternDetectionResult } from '@/services/patternDetectionService';
import { useSupabaseAnalysis } from './useSupabaseAnalysis';
import { toast } from 'sonner';

export interface AnalysisProgress {
  stage: 'idle' | 'capturing' | 'processing' | 'saving' | 'complete';
  percentage: number;
  message: string;
}

export interface AnalysisResult extends PatternDetectionResult {
  id: string;
  timestamp: Date;
  imageData: string;
  settings: {
    precision: string;
    timeframe: string;
    marketType: string;
  };
}

export const useUnifiedAnalysis = () => {
  const {
    activeAnalysis,
    precision,
    selectedTimeframe,
    marketType,
    setIsAnalyzing,
    isAnalyzing
  } = useAnalyzer();
  
  const { saveAnalysis, saveSignal } = useSupabaseAnalysis();
  const [progress, setProgress] = useState<AnalysisProgress>({
    stage: 'idle',
    percentage: 0,
    message: ''
  });
  
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateProgress = useCallback((stage: AnalysisProgress['stage'], percentage: number, message: string) => {
    setProgress({ stage, percentage, message });
  }, []);

  const generateSignalFromResult = useCallback(async (result: PatternDetectionResult) => {
    try {
      const signal = {
        signal_type: result.signal,
        confidence_level: result.confidence,
        timeframe: selectedTimeframe,
        ai_reasoning: result.reasoning,
        market_conditions: {
          patterns: result.patterns,
          marketType,
          precision,
          buyScore: result.buyScore,
          sellScore: result.sellScore,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('💾 Salvando sinal automático:', signal);
      await saveSignal(signal);
      return signal;
    } catch (error) {
      console.error('❌ Erro ao salvar sinal:', error);
      return null;
    }
  }, [selectedTimeframe, marketType, precision, saveSignal]);

  const analyzeImage = useCallback(async (imageData: string): Promise<AnalysisResult | null> => {
    if (isAnalyzing) {
      toast.error('Análise já em andamento');
      return null;
    }

    // Criar novo AbortController para esta análise
    abortControllerRef.current = new AbortController();
    
    setIsAnalyzing(true);
    
    try {
      // Etapa 1: Preparação
      updateProgress('processing', 10, 'Preparando análise...');
      
      // Pequeno delay para mostrar o progresso
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Análise cancelada');
      }

      // Etapa 2: Detecção de padrões
      updateProgress('processing', 30, 'Detectando padrões...');
      
      const detectionResult = await PatternDetectionService.analyzeImage(imageData, {
        precision,
        analysisTypes: activeAnalysis,
        marketType,
        timeframe: selectedTimeframe
      });
      
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Análise cancelada');
      }

      // Etapa 3: Processamento completo
      updateProgress('processing', 70, 'Processando resultados...');
      
      const analysisResult: AnalysisResult = {
        ...detectionResult,
        id: `analysis_${Date.now()}`,
        timestamp: new Date(),
        imageData,
        settings: {
          precision,
          timeframe: selectedTimeframe,
          marketType
        }
      };

      // Etapa 4: Salvamento
      updateProgress('saving', 90, 'Salvando análise...');
      
      // Salvar no Supabase
      await saveAnalysis({
        analysis_type: 'unified',
        image_data: imageData,
        results: detectionResult.rawResults,
        timeframe: selectedTimeframe,
        market_type: marketType,
        precision: precision === 'alta' ? 5 : precision === 'normal' ? 3 : 1,
        confidence_score: detectionResult.confidence,
        ai_decision: {
          action: detectionResult.signal,
          confidence: detectionResult.confidence,
          reasoning: detectionResult.reasoning,
          patterns: detectionResult.patterns,
          timestamp: new Date().toISOString()
        }
      });

      // Etapa 5: Finalização
      updateProgress('complete', 100, 'Análise concluída!');
      
      setCurrentResult(analysisResult);
      setAnalysisHistory(prev => [analysisResult, ...prev].slice(0, 50)); // Manter últimas 50
      
      toast.success(`Análise concluída: ${detectionResult.signal} (${detectionResult.confidence}%)`);
      
      // Auto-gerar sinal para todas as análises
      console.log('🎯 Gerando sinal automático para análise:', detectionResult.signal);
      await generateSignalFromResult(detectionResult);
      
      return analysisResult;
      
    } catch (error) {
      console.error('Erro na análise:', error);
      
      if (error instanceof Error && error.message === 'Análise cancelada') {
        toast.info('Análise cancelada');
      } else {
        toast.error('Erro durante a análise');
      }
      
      return null;
    } finally {
      setIsAnalyzing(false);
      
      // Resetar progresso após um delay
      setTimeout(() => {
        setProgress({ stage: 'idle', percentage: 0, message: '' });
      }, 1500);
      
      abortControllerRef.current = null;
    }
  }, [
    isAnalyzing,
    precision,
    activeAnalysis,
    marketType,
    selectedTimeframe,
    setIsAnalyzing,
    updateProgress,
    saveAnalysis,
    generateSignalFromResult
  ]);

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info('Cancelando análise...');
    }
  }, []);

  const clearHistory = useCallback(() => {
    setAnalysisHistory([]);
    setCurrentResult(null);
    toast.info('Histórico limpo');
  }, []);

  return {
    // Estados
    isAnalyzing,
    progress,
    currentResult,
    analysisHistory,
    
    // Ações
    analyzeImage,
    cancelAnalysis,
    clearHistory,
    
    // Utilitários
    canAnalyze: !isAnalyzing,
    hasResults: analysisHistory.length > 0
  };
};
