
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAnalysis } from '@/hooks/useSupabaseAnalysis';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { Activity, TrendingUp, Settings, History, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const UserDashboard = () => {
  const { user } = useAuth();
  const { getUserAnalyses, getUserSignals, loading } = useSupabaseAnalysis();
  const { settings } = useUserSettings();
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [recentSignals, setRecentSignals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalSignals: 0,
    successRate: 0
  });

  const loadDashboardData = async () => {
    if (!user) {
      console.log('Usuário não encontrado, não carregando dados do dashboard');
      setIsLoading(false);
      return;
    }

    console.log('Carregando dados do dashboard para:', user.email);
    setIsLoading(true);
    
    try {
      // Buscar análises recentes
      const analyses = await getUserAnalyses(5);
      console.log('Análises carregadas:', analyses);
      
      // Garantir que analyses é um array
      const analysesArray = Array.isArray(analyses) ? analyses : [];
      setRecentAnalyses(analysesArray);
      
      // Buscar sinais recentes  
      const signals = await getUserSignals(10);
      console.log('Sinais carregados:', signals);
      
      // Garantir que signals é um array
      const signalsArray = Array.isArray(signals) ? signals : [];
      setRecentSignals(signalsArray);
      
      // Calcular estatísticas
      const totalAnalyses = analysesArray.length;
      const totalSignals = signalsArray.length;
      const executedSignals = signalsArray.filter(s => s?.status === 'executed');
      const successRate = totalSignals > 0 ? Math.round((executedSignals.length / totalSignals) * 100) : 0;
      
      setStats({
        totalAnalyses,
        totalSignals,
        successRate
      });

      console.log('Estatísticas calculadas:', { totalAnalyses, totalSignals, successRate });
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
      // Definir valores padrão em caso de erro
      setRecentAnalyses([]);
      setRecentSignals([]);
      setStats({ totalAnalyses: 0, totalSignals: 0, successRate: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Usuário autenticado, carregando dashboard:', user.email);
      loadDashboardData();
    } else {
      console.log('Usuário não autenticado');
      setIsLoading(false);
    }
  }, [user]);

  const handleRefresh = () => {
    toast.info('Atualizando dados...');
    loadDashboardData();
  };

  const getSignalColor = (type: string) => {
    if (!type) return 'bg-gray-500';
    switch (type.toLowerCase()) {
      case 'buy': return 'bg-green-500';
      case 'sell': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'executed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-trader-gray">Faça login para ver seu dashboard</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 bg-trader-dark min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-white">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Carregando dados do dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-trader-dark min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="text-trader-gray hover:text-white"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <div className="text-sm text-trader-gray">
            Bem-vindo, {user.email}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-trader-panel border-trader-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Análises</CardTitle>
            <Activity className="h-4 w-4 text-trader-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalAnalyses}</div>
            <p className="text-xs text-trader-gray">Total realizadas</p>
          </CardContent>
        </Card>

        <Card className="bg-trader-panel border-trader-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Sinais</CardTitle>
            <TrendingUp className="h-4 w-4 text-trader-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalSignals}</div>
            <p className="text-xs text-trader-gray">Sinais gerados</p>
          </CardContent>
        </Card>

        <Card className="bg-trader-panel border-trader-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Taxa de Sucesso</CardTitle>
            <Settings className="h-4 w-4 text-trader-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
            <p className="text-xs text-trader-gray">Sinais executados</p>
          </CardContent>
        </Card>
      </div>

      {/* Análises Recentes */}
      <Card className="bg-trader-panel border-trader-blue/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5" />
            Análises Recentes
          </CardTitle>
          <CardDescription className="text-trader-gray">
            Suas últimas análises de gráficos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!recentAnalyses || recentAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-trader-gray mx-auto mb-4" />
              <p className="text-trader-gray mb-2">Nenhuma análise encontrada</p>
              <p className="text-sm text-trader-gray">
                Faça sua primeira análise de gráfico para ver os resultados aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnalyses.map((analysis: any) => (
                <div key={analysis.id} className="flex items-center justify-between p-3 bg-trader-dark rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{analysis.analysis_type || 'Análise'}</span>
                      <Badge variant="outline" className="text-xs">
                        {analysis.market_type || 'N/A'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {analysis.timeframe || 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-trader-gray">
                      {analysis.created_at ? formatDistanceToNow(new Date(analysis.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      }) : 'Data não disponível'}
                    </p>
                  </div>
                  {analysis.confidence_score && (
                    <div className="text-right">
                      <p className="text-sm text-white">{analysis.confidence_score}%</p>
                      <p className="text-xs text-trader-gray">Confiança</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sinais Recentes */}
      <Card className="bg-trader-panel border-trader-blue/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sinais de Trading
          </CardTitle>
          <CardDescription className="text-trader-gray">
            Histórico de sinais gerados pela IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!recentSignals || recentSignals.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-trader-gray mx-auto mb-4" />
              <p className="text-trader-gray mb-2">Nenhum sinal encontrado</p>
              <p className="text-sm text-trader-gray">
                Os sinais de trading aparecerão aqui quando gerados pela IA
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSignals.map((signal: any) => (
                <div key={signal.id} className="flex items-center justify-between p-3 bg-trader-dark rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSignalColor(signal.signal_type)}`}></div>
                      <span className="text-white font-medium">{signal.signal_type || 'Sinal'}</span>
                      <Badge className={getStatusColor(signal.status)}>
                        {signal.status || 'pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-trader-gray">
                      {signal.created_at ? formatDistanceToNow(new Date(signal.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      }) : 'Data não disponível'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{signal.confidence_level || 0}%</p>
                    <p className="text-xs text-trader-gray">Confiança</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações Atuais */}
      {settings && (
        <Card className="bg-trader-panel border-trader-blue/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Atuais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-trader-gray">Timeframe</p>
                <p className="text-white">{settings.default_timeframe || '5m'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-trader-gray">Mercado</p>
                <p className="text-white">{settings.default_market_type || 'forex'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-trader-gray">IA Autônoma</p>
                <p className="text-white">{settings.ai_autonomous_enabled ? 'Ativa' : 'Inativa'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-trader-gray">Tolerância ao Risco</p>
                <p className="text-white">{settings.risk_tolerance || 'medium'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;
