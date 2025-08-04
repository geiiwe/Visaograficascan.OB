import React, { useState } from 'react';
import { useAnalyzer } from '@/context/AnalyzerContext';
import { useManualAnalysis } from '@/hooks/useManualAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target, 
  Plus, 
  Trash2, 
  Play, 
  RotateCcw, 
  GitCompare, 
  Download, 
  Eye, 
  Activity,
  TrendingUp,
  BarChart3,
  Zap,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const ManualAnalysisInterface = () => {
  const { imageData, chartRegion, setChartRegion, selectionMode, setSelectionMode } = useAnalyzer();
  const {
    regions,
    analysisHistory,
    isAnalyzing,
    selectedRegion,
    addAnalysisRegion,
    removeRegion,
    analyzeFocusedRegion,
    reanalyzeRegion,
    compareRegions,
    clearHistory,
    exportAnalysisData,
    setSelectedRegion,
    getRegionAnalyses,
    getLatestAnalysis
  } = useManualAnalysis();

  const [newRegionLabel, setNewRegionLabel] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'comprehensive' | 'candle-by-candle' | 'advanced' | 'projection'>('comprehensive');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Adicionar região atual do ChartRegionSelector
  const addCurrentRegion = () => {
    if (!chartRegion) {
      toast.error('Selecione uma região primeiro');
      return;
    }

    if (!newRegionLabel.trim()) {
      toast.error('Digite um nome para a região');
      return;
    }

    const regionId = addAnalysisRegion({
      ...chartRegion,
      label: newRegionLabel.trim()
    });

    setNewRegionLabel('');
    toast.success('Região adicionada! Agora você pode analisá-la.');
  };

  // Analisar região específica
  const handleAnalyzeRegion = async (regionId: string) => {
    await analyzeFocusedRegion(regionId, selectedAnalysisType);
  };

  // Alternar seleção para comparação
  const toggleComparisonSelection = (regionId: string) => {
    setSelectedForComparison(prev => 
      prev.includes(regionId) 
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    );
  };

  // Executar comparação
  const handleCompareRegions = () => {
    if (selectedForComparison.length < 2) {
      toast.error('Selecione pelo menos 2 regiões para comparar');
      return;
    }

    const comparison = compareRegions(selectedForComparison);
    
    // Mostrar resultados da comparação
    toast.success(
      `Comparação concluída! Consenso: ${comparison.comparison.consensus.signal} (${comparison.comparison.consensus.percentage.toFixed(1)}%)`,
      { duration: 10000 }
    );
    
    console.log('Resultado da comparação:', comparison);
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'comprehensive': return <BarChart3 className="h-4 w-4" />;
      case 'candle-by-candle': return <Activity className="h-4 w-4" />;
      case 'advanced': return <Zap className="h-4 w-4" />;
      case 'projection': return <TrendingUp className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!imageData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Carregue uma imagem para começar a análise manual</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análise Manual por Região
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <Label htmlFor="region-label">Nome da Região</Label>
              <Input
                id="region-label"
                placeholder="Ex: Vela de reversão, Suporte principal..."
                value={newRegionLabel}
                onChange={(e) => setNewRegionLabel(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={() => setSelectionMode(true)}
              variant="outline"
              disabled={selectionMode}
            >
              <Target className="h-4 w-4 mr-2" />
              {selectionMode ? 'Selecionando...' : 'Selecionar Região'}
            </Button>
            
            <Button 
              onClick={addCurrentRegion}
              disabled={!chartRegion || !newRegionLabel.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Região
            </Button>
          </div>
          
          {chartRegion && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Região selecionada:</strong> {chartRegion.width}×{chartRegion.height}px 
                na posição ({chartRegion.x}, {chartRegion.y})
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="regions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="regions">Regiões ({regions.length})</TabsTrigger>
          <TabsTrigger value="analysis">Análises ({analysisHistory.length})</TabsTrigger>
          <TabsTrigger value="compare">Comparar</TabsTrigger>
        </TabsList>

        {/* Regiões Tab */}
        <TabsContent value="regions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Regiões Definidas</h3>
            <div className="flex gap-2">
              <Select 
                value={selectedAnalysisType} 
                onValueChange={(value: any) => setSelectedAnalysisType(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Análise Completa</SelectItem>
                  <SelectItem value="candle-by-candle">Vela a Vela</SelectItem>
                  <SelectItem value="advanced">Arsenal Avançado</SelectItem>
                  <SelectItem value="projection">Projeções</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {regions.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  Nenhuma região definida. Selecione uma área na imagem para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {regions.map((region) => {
                const analyses = getRegionAnalyses(region.id);
                const latestAnalysis = getLatestAnalysis(region.id);
                
                return (
                  <Card key={region.id} className={selectedRegion === region.id ? 'ring-2 ring-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{region.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {region.width}×{region.height}px • {new Date(region.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAnalyzeRegion(region.id)}
                            disabled={isAnalyzing}
                          >
                            {getAnalysisTypeIcon(selectedAnalysisType)}
                            <span className="ml-1">Analisar</span>
                          </Button>
                          {analyses.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reanalyzeRegion(region.id)}
                              disabled={isAnalyzing}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeRegion(region.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Status da Análise */}
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {analyses.length} análise{analyses.length !== 1 ? 's' : ''}
                        </Badge>
                        
                        {latestAnalysis && (
                          <>
                            <Badge 
                              variant="secondary"
                              className={getConfidenceColor(latestAnalysis.confidence)}
                            >
                              {latestAnalysis.confidence.toFixed(1)}% confiança
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {getAnalysisTypeIcon(latestAnalysis.analysisType)}
                              <span className="ml-1">{latestAnalysis.analysisType}</span>
                            </span>
                          </>
                        )}
                      </div>

                      {isAnalyzing && selectedRegion === region.id && (
                        <div className="mt-3">
                          <Progress value={75} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-1">Analisando região...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Análises Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Histórico de Análises</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportAnalysisData} disabled={analysisHistory.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" onClick={clearHistory} disabled={analysisHistory.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>

          {analysisHistory.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Nenhuma análise realizada ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {analysisHistory
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((analysis, index) => {
                    const region = regions.find(r => r.id === analysis.regionId);
                    
                    return (
                      <Card key={`${analysis.regionId}-${index}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{region?.label || 'Região removida'}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                {getAnalysisTypeIcon(analysis.analysisType)}
                                <span className="text-sm">{analysis.analysisType}</span>
                                <Badge 
                                  variant="secondary"
                                  className={getConfidenceColor(analysis.confidence)}
                                >
                                  {analysis.confidence.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(analysis.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Mostrar projeções se existirem */}
                          {analysis.projections && (
                            <div className="mt-3 p-2 bg-muted rounded">
                              <p className="text-sm">
                                <strong>Projeção:</strong> Tendência {analysis.projections.trend} • 
                                Timeframe: {analysis.projections.timeframe}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Comparar Tab */}
        <TabsContent value="compare" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Comparar Regiões</h3>
            <div className="flex gap-2">
              <Button 
                onClick={handleCompareRegions}
                disabled={selectedForComparison.length < 2}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Comparar ({selectedForComparison.length})
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedForComparison([])}
                disabled={selectedForComparison.length === 0}
              >
                Limpar Seleção
              </Button>
            </div>
          </div>

          {regions.length < 2 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  Você precisa de pelo menos 2 regiões para fazer comparações.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {regions.map((region) => {
                const analyses = getRegionAnalyses(region.id);
                const isSelected = selectedForComparison.includes(region.id);
                
                return (
                  <Card 
                    key={region.id} 
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleComparisonSelection(region.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{region.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {analyses.length} análise{analyses.length !== 1 ? 's' : ''} realizadas
                          </p>
                        </div>
                        <div className="text-right">
                          {isSelected && (
                            <Badge variant="default">Selecionada</Badge>
                          )}
                          {analyses.length === 0 && (
                            <Badge variant="outline">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Sem análises
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManualAnalysisInterface;