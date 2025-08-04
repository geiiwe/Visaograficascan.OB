import { useState, useCallback } from 'react';
import { useAnalyzer } from '@/context/AnalyzerContext';
import { useAdvancedAnalysisArsenal } from './useAdvancedAnalysisArsenal';
import { performComprehensiveScan } from '@/utils/comprehensiveScanner';
import { performDetailedCandleAnalysis } from '@/utils/candleByCandle/detailedCandleAnalysis';
import { toast } from 'sonner';

export interface ManualAnalysisRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  timestamp: Date;
}

export interface ManualAnalysisResult {
  regionId: string;
  analysisType: string;
  result: any;
  confidence: number;
  timestamp: Date;
  projections?: {
    trend: 'up' | 'down' | 'sideways';
    targetLevels: number[];
    timeframe: string;
  };
}

export const useManualAnalysis = () => {
  const { imageData, precision, selectedTimeframe, marketType } = useAnalyzer();
  const { runCompleteAnalysisArsenal } = useAdvancedAnalysisArsenal();
  
  const [regions, setRegions] = useState<ManualAnalysisRegion[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<ManualAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Adicionar nova região para análise
  const addAnalysisRegion = useCallback((region: Omit<ManualAnalysisRegion, 'id' | 'timestamp'>) => {
    const newRegion: ManualAnalysisRegion = {
      ...region,
      id: `region_${Date.now()}`,
      timestamp: new Date()
    };
    
    setRegions(prev => [...prev, newRegion]);
    toast.success(`Região "${region.label}" adicionada para análise`);
    
    return newRegion.id;
  }, []);

  // Remover região
  const removeRegion = useCallback((regionId: string) => {
    setRegions(prev => prev.filter(r => r.id !== regionId));
    setAnalysisHistory(prev => prev.filter(r => r.regionId !== regionId));
    if (selectedRegion === regionId) {
      setSelectedRegion(null);
    }
    toast.info('Região removida');
  }, [selectedRegion]);

  // Análise focada em região específica
  const analyzeFocusedRegion = useCallback(async (
    regionId: string, 
    analysisType: 'comprehensive' | 'candle-by-candle' | 'advanced' | 'projection' = 'comprehensive'
  ) => {
    if (!imageData) {
      toast.error('Imagem não disponível para análise');
      return null;
    }

    const region = regions.find(r => r.id === regionId);
    if (!region) {
      toast.error('Região não encontrada');
      return null;
    }

    setIsAnalyzing(true);
    setSelectedRegion(regionId);

    try {
      let result: any = null;
      let confidence = 0;

      switch (analysisType) {
        case 'comprehensive':
          result = await performComprehensiveScan(imageData, region, {
            precision,
            timeframe: selectedTimeframe,
            marketType,
            deepScan: true
          });
          confidence = result.recommendation.confidence || 0;
          break;

        case 'candle-by-candle':
          result = performDetailedCandleAnalysis(imageData, selectedTimeframe);
          confidence = result.overallConfidence || 0;
          break;

        case 'advanced':
          result = await runCompleteAnalysisArsenal();
          confidence = result?.finalDecision?.confidence || 0;
          break;

        case 'projection':
          // Análise de projeção baseada na região
          result = await analyzeProjections(imageData, region);
          confidence = result.confidence || 0;
          break;
      }

      const analysisResult: ManualAnalysisResult = {
        regionId,
        analysisType,
        result,
        confidence,
        timestamp: new Date(),
        projections: analysisType === 'projection' ? result.projections : undefined
      };

      setAnalysisHistory(prev => [...prev, analysisResult]);
      toast.success(`Análise ${analysisType} concluída para região "${region.label}"`);
      
      return analysisResult;

    } catch (error) {
      console.error('Erro na análise focada:', error);
      toast.error('Erro ao realizar análise focada');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageData, regions, precision, selectedTimeframe, marketType, runCompleteAnalysisArsenal]);

  // Análise de projeções
  const analyzeProjections = useCallback(async (imageData: string, region: ManualAnalysisRegion) => {
    // Simular análise de projeções baseada na região
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockProjections = {
      trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
      targetLevels: [
        Math.random() * 100 + 50,
        Math.random() * 100 + 100,
        Math.random() * 100 + 150
      ],
      timeframe: selectedTimeframe,
      confidence: Math.random() * 40 + 60, // 60-100%
      projections: {
        shortTerm: {
          direction: Math.random() > 0.5 ? 'up' : 'down',
          probability: Math.random() * 30 + 70
        },
        mediumTerm: {
          direction: Math.random() > 0.5 ? 'up' : 'down',
          probability: Math.random() * 30 + 60
        },
        longTerm: {
          direction: Math.random() > 0.5 ? 'up' : 'down',
          probability: Math.random() * 30 + 50
        }
      }
    };

    return mockProjections;
  }, [selectedTimeframe]);

  // Reanálise de região
  const reanalyzeRegion = useCallback(async (regionId: string, newAnalysisType?: string) => {
    const lastAnalysis = analysisHistory
      .filter(a => a.regionId === regionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    const analysisType = newAnalysisType || lastAnalysis?.analysisType || 'comprehensive';
    
    toast.info('Iniciando reanálise...');
    return await analyzeFocusedRegion(regionId, analysisType as any);
  }, [analysisHistory, analyzeFocusedRegion]);

  // Comparar análises de diferentes regiões
  const compareRegions = useCallback((regionIds: string[]) => {
    const regionResults = regionIds.map(id => {
      const region = regions.find(r => r.id === id);
      const analyses = analysisHistory.filter(a => a.regionId === id);
      return { region, analyses };
    });

    return {
      regions: regionResults,
      comparison: {
        averageConfidence: regionResults.reduce((acc, r) => {
          const avgConf = r.analyses.reduce((sum, a) => sum + a.confidence, 0) / r.analyses.length;
          return acc + avgConf;
        }, 0) / regionResults.length,
        strongestSignal: regionResults.reduce((strongest, current) => {
          const maxConf = Math.max(...current.analyses.map(a => a.confidence));
          return maxConf > (strongest?.confidence || 0) ? 
            { regionId: current.region?.id, confidence: maxConf } : strongest;
        }, null as any),
        consensus: determineConsensus(regionResults)
      }
    };
  }, [regions, analysisHistory]);

  // Determinar consenso entre análises
  const determineConsensus = (regionResults: any[]) => {
    const signals = regionResults.flatMap(r => 
      r.analyses.map((a: any) => a.result?.recommendation?.signal || 'neutral')
    );
    
    const counts = signals.reduce((acc: any, signal: string) => {
      acc[signal] = (acc[signal] || 0) + 1;
      return acc;
    }, {});

    const total = signals.length;
    const consensus = Object.entries(counts).reduce((max, [signal, count]) => 
      (count as number) > (max.count || 0) ? { signal, count, percentage: (count as number) / total * 100 } : max
    , { signal: 'neutral', count: 0, percentage: 0 });

    return consensus;
  };

  // Limpar histórico
  const clearHistory = useCallback(() => {
    setAnalysisHistory([]);
    toast.info('Histórico de análises limpo');
  }, []);

  // Exportar dados de análise
  const exportAnalysisData = useCallback(() => {
    const exportData = {
      regions,
      analysisHistory,
      exportTime: new Date(),
      summary: {
        totalRegions: regions.length,
        totalAnalyses: analysisHistory.length,
        averageConfidence: analysisHistory.reduce((sum, a) => sum + a.confidence, 0) / analysisHistory.length
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manual-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Dados de análise exportados');
  }, [regions, analysisHistory]);

  return {
    // Estado
    regions,
    analysisHistory,
    isAnalyzing,
    selectedRegion,
    
    // Ações
    addAnalysisRegion,
    removeRegion,
    analyzeFocusedRegion,
    reanalyzeRegion,
    compareRegions,
    clearHistory,
    exportAnalysisData,
    setSelectedRegion,
    
    // Utilitários
    getRegionAnalyses: (regionId: string) => analysisHistory.filter(a => a.regionId === regionId),
    getLatestAnalysis: (regionId: string) => analysisHistory
      .filter(a => a.regionId === regionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
  };
};