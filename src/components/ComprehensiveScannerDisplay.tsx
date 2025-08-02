/**
 * Exibição dos Resultados do Scanner Completo
 * Interface para mostrar todos os elementos detectados pelo scanner detalhado
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Zap
} from 'lucide-react';
import { ComprehensiveScanResult } from '@/utils/comprehensiveScanner';

interface ComprehensiveScannerDisplayProps {
  scanResult: ComprehensiveScanResult;
}

export const ComprehensiveScannerDisplay: React.FC<ComprehensiveScannerDisplayProps> = ({
  scanResult
}) => {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 bg-green-100';
      case 'SELL': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-red-600 bg-red-100';
      case 'soon': return 'text-orange-600 bg-orange-100';
      case 'wait': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (recommendation: string) => {
    switch (recommendation) {
      case 'PROCEED': return 'text-green-600';
      case 'CAUTION': return 'text-yellow-600';
      case 'ABORT': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {/* Cabeçalho do Scanner */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Scanner Completo - Análise Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{scanResult.technicalDetails.elementsScanned}</div>
              <div className="text-gray-600">Elementos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">{scanResult.technicalDetails.patternsFound}</div>
              <div className="text-gray-600">Padrões</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{scanResult.technicalDetails.scanDuration}ms</div>
              <div className="text-gray-600">Duração</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">{scanResult.technicalDetails.dataQuality}%</div>
              <div className="text-gray-600">Qualidade</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendação Final */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Recomendação Final
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={`${getActionColor(scanResult.recommendation.action)} font-semibold text-lg px-3 py-1`}>
                {scanResult.recommendation.action}
              </Badge>
              <div className="text-right">
                <div className="font-semibold text-lg">{scanResult.recommendation.confidence}%</div>
                <div className="text-sm text-gray-600">Confiança</div>
              </div>
            </div>
            
            <Progress value={scanResult.recommendation.confidence} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Entrada:</span>
                <span className="font-semibold ml-1">{scanResult.recommendation.entryPrice}</span>
              </div>
              <div>
                <span className="text-gray-600">Stop:</span>
                <span className="font-semibold ml-1">{scanResult.recommendation.stopLoss}</span>
              </div>
              <div>
                <span className="text-gray-600">Alvo:</span>
                <span className="font-semibold ml-1">{scanResult.recommendation.takeProfit}</span>
              </div>
              <div>
                <span className="text-gray-600">Tamanho:</span>
                <span className="font-semibold ml-1">{scanResult.recommendation.positionSize}%</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {scanResult.recommendation.reasoning}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Elementos Identificados */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Elementos Identificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Candles ({scanResult.identifiedElements.candles.length})
              </div>
              {scanResult.identifiedElements.candles.slice(0, 3).map((candle, i) => (
                <div key={i} className="text-xs text-gray-600 ml-3">
                  • {candle.type} ({candle.size})
                </div>
              ))}
            </div>
            
            <div>
              <div className="font-semibold mb-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Padrões ({scanResult.identifiedElements.patterns.length})
              </div>
              {scanResult.identifiedElements.patterns.slice(0, 3).map((pattern, i) => (
                <div key={i} className="text-xs text-gray-600 ml-3">
                  • {pattern.name} ({pattern.confidence}%)
                </div>
              ))}
            </div>
            
            <div>
              <div className="font-semibold mb-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Níveis ({scanResult.identifiedElements.levels.length})
              </div>
              {scanResult.identifiedElements.levels.map((level, i) => (
                <div key={i} className="text-xs text-gray-600 ml-3">
                  • {level.type}: {level.price.toFixed(2)}
                </div>
              ))}
            </div>
            
            <div>
              <div className="font-semibold mb-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Indicadores ({scanResult.identifiedElements.indicators.length})
              </div>
              {scanResult.identifiedElements.indicators.map((indicator, i) => (
                <div key={i} className="text-xs text-gray-600 ml-3">
                  • {indicator.name}: {indicator.signal}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confluências */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Análise de Confluências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-700">Fatores de Alta</span>
                <Badge variant="outline" className="text-green-600">
                  {scanResult.confluences.totalBullishWeight.toFixed(1)}
                </Badge>
              </div>
              <div className="space-y-1">
                {scanResult.confluences.bullish.slice(0, 3).map((factor, i) => (
                  <div key={i} className="text-xs bg-green-50 p-2 rounded">
                    <div className="font-medium">{factor.factor}</div>
                    <div className="text-gray-600">Peso: {factor.weight.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-red-700">Fatores de Baixa</span>
                <Badge variant="outline" className="text-red-600">
                  {scanResult.confluences.totalBearishWeight.toFixed(1)}
                </Badge>
              </div>
              <div className="space-y-1">
                {scanResult.confluences.bearish.slice(0, 3).map((factor, i) => (
                  <div key={i} className="text-xs bg-red-50 p-2 rounded">
                    <div className="font-medium">{factor.factor}</div>
                    <div className="text-gray-600">Peso: {factor.weight.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing e Riscos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Timing de Entrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Entrada Ótima:</span>
                {scanResult.timing.optimalEntry ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Urgência:</span>
                <Badge className={getUrgencyColor(scanResult.timing.urgency)}>
                  {scanResult.timing.urgency}
                </Badge>
              </div>
              
              <div className="text-xs text-gray-600">
                Sinais: {scanResult.timing.entrySignals.length}
              </div>
              
              <div className="text-xs text-gray-600">
                Validade: {scanResult.timing.validityPeriod}s
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Riscos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Avaliação de Riscos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Manipulação:</span>
                <span className={`text-sm font-medium ${getRiskColor(scanResult.riskFactors.manipulation.recommendation)}`}>
                  {scanResult.riskFactors.manipulation.score}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Volatilidade:</span>
                <Badge variant="outline" className="capitalize">
                  {scanResult.riskFactors.volatility.level}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Liquidez:</span>
                <span className="text-sm font-medium">
                  {scanResult.riskFactors.marketConditions.liquidity.toFixed(0)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Notícias:</span>
                <Badge variant="outline" className="capitalize">
                  {scanResult.riskFactors.marketConditions.news}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};