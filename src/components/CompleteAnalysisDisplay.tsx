/**
 * Componente para Exibição da Análise Completa da Imagem
 * Mostra todos os elementos de análise organizados em seções
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Clock, 
  BarChart3,
  Zap,
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { CompleteImageAnalysisResult } from '@/utils/completeImageAnalysis';

interface CompleteAnalysisDisplayProps {
  analysis: CompleteImageAnalysisResult;
}

export const CompleteAnalysisDisplay: React.FC<CompleteAnalysisDisplayProps> = ({ analysis }) => {
  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'uptrend': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'downtrend': return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'sideways': return <BarChart3 className="h-4 w-4 text-yellow-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-green-600';
      case 'SELL': return 'bg-red-600';
      default: return 'bg-yellow-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header com Recomendação Principal */}
      <Card className="bg-black/90 border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Análise Completa da Imagem
            </CardTitle>
            <Badge className={getActionColor(analysis.finalRecommendation.action)}>
              {analysis.finalRecommendation.action}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getConfidenceColor(analysis.finalRecommendation.confidence)}`}>
                {analysis.finalRecommendation.confidence}%
              </div>
              <div className="text-sm text-gray-400">Confiança</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                R$ {analysis.finalRecommendation.entry.price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Entrada</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {analysis.finalRecommendation.riskManagement.riskReward.toFixed(1)}:1
              </div>
              <div className="text-sm text-gray-400">Risk/Reward</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-800/50 rounded">
            <p className="text-sm text-gray-300">{analysis.finalRecommendation.reasoning}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para Análises Detalhadas */}
      <Tabs defaultValue="trend" className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-black/50">
          <TabsTrigger value="trend">Tendência</TabsTrigger>
          <TabsTrigger value="support">Suporte/Resist.</TabsTrigger>
          <TabsTrigger value="candles">Velas</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="region">Região</TabsTrigger>
          <TabsTrigger value="confluence">Confluências</TabsTrigger>
          <TabsTrigger value="probability">Probabilidades</TabsTrigger>
        </TabsList>

        {/* Análise de Tendência */}
        <TabsContent value="trend">
          <Card className="bg-black/90 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {getDirectionIcon(analysis.trendAnalysis.direction)}
                Análise de Tendência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Direção</div>
                  <div className="text-white font-semibold capitalize">
                    {analysis.trendAnalysis.direction}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Força</div>
                  <div className="text-white font-semibold">
                    {analysis.trendAnalysis.strength}%
                  </div>
                  <Progress value={analysis.trendAnalysis.strength} className="mt-1" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Probabilidade</div>
                  <div className="text-white font-semibold">
                    {analysis.trendAnalysis.probability}%
                  </div>
                  <Progress value={analysis.trendAnalysis.probability} className="mt-1" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Duração</div>
                  <div className="text-white font-semibold capitalize">
                    {analysis.trendAnalysis.duration}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Momentum</div>
                  <div className="text-white font-semibold">
                    {analysis.trendAnalysis.momentum.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Volatilidade</div>
                  <div className="text-white font-semibold">
                    {analysis.trendAnalysis.volatility.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Confiabilidade</div>
                  <div className="text-white font-semibold">
                    {analysis.trendAnalysis.reliability.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise de Suporte e Resistência */}
        <TabsContent value="support">
          <div className="grid gap-4">
            <Card className="bg-black/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  Níveis de Suporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.supportResistanceAnalysis.supports.slice(0, 5).map((support, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-green-900/20 rounded">
                      <div>
                        <span className="text-white font-semibold">R$ {support.level.toFixed(2)}</span>
                        <Badge className="ml-2" variant={support.type === 'major' ? 'default' : 'secondary'}>
                          {support.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Força: {support.strength}%</div>
                        <div className="text-sm text-gray-400">Testes: {support.tests}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-400" />
                  Níveis de Resistência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.supportResistanceAnalysis.resistances.slice(0, 5).map((resistance, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-red-900/20 rounded">
                      <div>
                        <span className="text-white font-semibold">R$ {resistance.level.toFixed(2)}</span>
                        <Badge className="ml-2" variant={resistance.type === 'major' ? 'default' : 'secondary'}>
                          {resistance.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Força: {resistance.strength}%</div>
                        <div className="text-sm text-gray-400">Testes: {resistance.tests}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análise de Velas */}
        <TabsContent value="candles">
          <div className="grid gap-4">
            <Card className="bg-black/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Vela Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Tipo</div>
                    <div className="text-white font-semibold capitalize">
                      {analysis.candleAnalysis.currentCandle.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Corpo</div>
                    <div className="text-white font-semibold capitalize">
                      {analysis.candleAnalysis.currentCandle.body}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Pavio Superior</div>
                    <div className="text-white font-semibold capitalize">
                      {analysis.candleAnalysis.currentCandle.shadows.upper}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Pavio Inferior</div>
                    <div className="text-white font-semibold capitalize">
                      {analysis.candleAnalysis.currentCandle.shadows.lower}
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-800/50 rounded">
                  <p className="text-sm text-gray-300">
                    {analysis.candleAnalysis.currentCandle.interpretation}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white">Análise de Pavios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-red-900/20 rounded">
                    <div className="text-sm text-red-400">Pavios Superiores</div>
                    <div className="text-white font-semibold">
                      Média: {analysis.shadowAnalysis.upperShadows.average}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {analysis.shadowAnalysis.upperShadows.interpretation}
                    </div>
                  </div>
                  <div className="p-3 bg-green-900/20 rounded">
                    <div className="text-sm text-green-400">Pavios Inferiores</div>
                    <div className="text-white font-semibold">
                      Média: {analysis.shadowAnalysis.lowerShadows.average}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {analysis.shadowAnalysis.lowerShadows.interpretation}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Padrões Gráficos */}
        <TabsContent value="patterns">
          <Card className="bg-black/90 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Figuras Gráficas Identificadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.chartPatterns.classic.length > 0 ? (
                <div className="space-y-3">
                  {analysis.chartPatterns.classic.map((pattern, idx) => (
                    <div key={idx} className="p-3 bg-gray-800/50 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">{pattern.name}</div>
                          <div className="text-sm text-gray-400 capitalize">{pattern.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white">
                            Completude: {pattern.completion}%
                          </div>
                          <div className="text-sm text-gray-400">
                            Confiança: {pattern.reliability}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {pattern.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  Nenhum padrão gráfico identificado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise de Região */}
        <TabsContent value="region">
          <Card className="bg-black/90 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Análise da Região
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Qualidade do Gráfico</div>
                  <div className="text-white font-semibold">
                    {analysis.regionAnalysis.chartQuality}%
                  </div>
                  <Progress value={analysis.regionAnalysis.chartQuality} className="mt-1" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Clareza</div>
                  <div className="text-white font-semibold">
                    {analysis.regionAnalysis.clarity}%
                  </div>
                  <Progress value={analysis.regionAnalysis.clarity} className="mt-1" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Timeframe</div>
                  <div className="text-white font-semibold">
                    {analysis.regionAnalysis.timeframe}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Tipo de Mercado</div>
                  <div className="text-white font-semibold capitalize">
                    {analysis.regionAnalysis.marketType}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Liquidez</div>
                  <div className="text-white font-semibold capitalize">
                    {analysis.regionAnalysis.liquidityLevel}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Posição do Preço</div>
                  <div className="text-white font-semibold capitalize">
                    {analysis.regionAnalysis.pricePosition}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confluências */}
        <TabsContent value="confluence">
          <div className="grid gap-4">
            <Card className="bg-black/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Fatores de Alta ({analysis.confluenceAnalysis.bullishFactors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.confluenceAnalysis.bullishFactors.map((factor, idx) => (
                    <div key={idx} className="p-2 bg-green-900/20 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{factor.factor}</span>
                        <Badge className="bg-green-600">Peso: {factor.weight.toFixed(1)}</Badge>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{factor.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  Fatores de Baixa ({analysis.confluenceAnalysis.bearishFactors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.confluenceAnalysis.bearishFactors.map((factor, idx) => (
                    <div key={idx} className="p-2 bg-red-900/20 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{factor.factor}</span>
                        <Badge className="bg-red-600">Peso: {factor.weight.toFixed(1)}</Badge>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{factor.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Probabilidades */}
        <TabsContent value="probability">
          <Card className="bg-black/90 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Probabilidades de Movimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 bg-green-900/20 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-semibold">Alta</span>
                    <span className="text-white font-bold">
                      {analysis.movementProbabilities.upward.probability}%
                    </span>
                  </div>
                  <Progress value={analysis.movementProbabilities.upward.probability} className="mb-2" />
                  <div className="text-xs text-gray-400">
                    Alvos: {analysis.movementProbabilities.upward.targets.join(', ')}
                  </div>
                  <div className="text-xs text-gray-400">
                    Timeframe: {analysis.movementProbabilities.upward.timeframe}
                  </div>
                </div>

                <div className="p-4 bg-red-900/20 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-400 font-semibold">Baixa</span>
                    <span className="text-white font-bold">
                      {analysis.movementProbabilities.downward.probability}%
                    </span>
                  </div>
                  <Progress value={analysis.movementProbabilities.downward.probability} className="mb-2" />
                  <div className="text-xs text-gray-400">
                    Alvos: {analysis.movementProbabilities.downward.targets.join(', ')}
                  </div>
                  <div className="text-xs text-gray-400">
                    Timeframe: {analysis.movementProbabilities.downward.timeframe}
                  </div>
                </div>

                <div className="p-4 bg-yellow-900/20 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-400 font-semibold">Lateral</span>
                    <span className="text-white font-bold">
                      {analysis.movementProbabilities.sideways.probability}%
                    </span>
                  </div>
                  <Progress value={analysis.movementProbabilities.sideways.probability} className="mb-2" />
                  <div className="text-xs text-gray-400">
                    Range: {analysis.movementProbabilities.sideways.range.lower} - {analysis.movementProbabilities.sideways.range.upper}
                  </div>
                  <div className="text-xs text-gray-400">
                    Duração: {analysis.movementProbabilities.sideways.duration}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metadata da Análise */}
      <Card className="bg-black/90 border-primary/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Informações da Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Duração</div>
              <div className="text-white">{analysis.analysisMetadata.duration}ms</div>
            </div>
            <div>
              <div className="text-gray-400">Elementos</div>
              <div className="text-white">{analysis.analysisMetadata.elementsAnalyzed}</div>
            </div>
            <div>
              <div className="text-gray-400">Confiança</div>
              <div className="text-white">{analysis.analysisMetadata.confidenceLevel}%</div>
            </div>
            <div>
              <div className="text-gray-400">Versão</div>
              <div className="text-white">{analysis.analysisMetadata.analysisVersion}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};