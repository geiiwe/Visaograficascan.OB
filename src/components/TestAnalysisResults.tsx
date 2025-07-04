import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseAnalysis } from '@/hooks/useSupabaseAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { RefreshCw, Activity, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const TestAnalysisResults = () => {
  const { getUserAnalyses, getUserSignals } = useSupabaseAnalysis();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('🔍 Testando carregamento de dados...');
      
      const [analysesData, signalsData] = await Promise.all([
        getUserAnalyses(10),
        getUserSignals(10)
      ]);
      
      console.log('📊 Análises encontradas:', analysesData);
      console.log('📈 Sinais encontrados:', signalsData);
      
      setAnalyses(analysesData || []);
      setSignals(signalsData || []);
      
      toast.success(`Carregados: ${analysesData?.length || 0} análises, ${signalsData?.length || 0} sinais`);
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast.error('Erro ao carregar dados de teste');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 space-y-2 z-40">
      <Card className="bg-trader-panel border-trader-blue/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Debug: Sistema
            </span>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={loadData}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status das análises */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-trader-gray">Análises:</span>
            <Badge variant="outline" className="text-xs">
              {analyses.length} registros
            </Badge>
          </div>

          {/* Status dos sinais */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-trader-gray">Sinais:</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${signals.length > 0 ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
            >
              {signals.length} registros
            </Badge>
          </div>

          {/* Última análise */}
          {analyses.length > 0 && (
            <div className="text-xs">
              <div className="text-trader-gray mb-1">Última análise:</div>
              <div className="flex items-center justify-between">
                <span className="text-white truncate">
                  {analyses[0].market_type} • {analyses[0].timeframe}
                </span>
                <span className="text-trader-gray">
                  {new Date(analyses[0].created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

          {/* Último sinal */}
          {signals.length > 0 && (
            <div className="text-xs">
              <div className="text-trader-gray mb-1">Último sinal:</div>
              <div className="flex items-center justify-between">
                <Badge 
                  className={`text-xs ${
                    signals[0].signal_type === 'BUY' ? 'bg-green-600' :
                    signals[0].signal_type === 'SELL' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}
                >
                  {signals[0].signal_type}
                </Badge>
                <span className="text-trader-gray">
                  {signals[0].confidence_level}%
                </span>
              </div>
            </div>
          )}

          {/* Status geral */}
          <div className="border-t border-trader-blue/20 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-trader-gray">Sistema:</span>
              <Badge 
                className={`text-xs ${
                  analyses.length > 0 && signals.length > 0 ? 'bg-green-600' :
                  analyses.length > 0 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
              >
                {analyses.length > 0 && signals.length > 0 ? 'Completo' :
                 analyses.length > 0 ? 'Parcial' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAnalysisResults;