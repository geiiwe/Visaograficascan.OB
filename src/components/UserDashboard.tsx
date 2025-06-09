
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAnalysis } from '@/hooks/useSupabaseAnalysis';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { Activity, TrendingUp, Settings, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UserDashboard = () => {
  const { user } = useAuth();
  const { getUserAnalyses, getUserSignals } = useSupabaseAnalysis();
  const { settings } = useUserSettings();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [recentSignals, setRecentSignals] = useState([]);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalSignals: 0,
    successRate: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    const analyses = await getUserAnalyses(5);
    const signals = await getUserSignals(10);
    
    setRecentAnalyses(analyses);
    setRecentSignals(signals);
    
    // Calcular estatísticas básicas
    const executedSignals = signals.filter(s => s.status === 'executed');
    const successRate = executedSignals.length > 0 ? (executedSignals.length / signals.length) * 100 : 0;
    
    setStats({
      totalAnalyses: analyses.length,
      totalSignals: signals.length,
      successRate: Math.round(successRate)
    });
  };

  const getSignalColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'buy': return 'bg-green-500';
      case 'sell': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6 p-6 bg-trader-dark min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="text-sm text-trader-gray">
          Bem-vindo, {user.email}
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
          {recentAnalyses.length === 0 ? (
            <p className="text-trader-gray text-center py-4">Nenhuma análise encontrada</p>
          ) : (
            <div className="space-y-3">
              {recentAnalyses.map((analysis: any) => (
                <div key={analysis.id} className="flex items-center justify-between p-3 bg-trader-dark rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{analysis.analysis_type}</span>
                      <Badge variant="outline" className="text-xs">
                        {analysis.market_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {analysis.timeframe}
                      </Badge>
                    </div>
                    <p className="text-sm text-trader-gray">
                      {formatDistanceToNow(new Date(analysis.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
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
          {recentSignals.length === 0 ? (
            <p className="text-trader-gray text-center py-4">Nenhum sinal encontrado</p>
          ) : (
            <div className="space-y-3">
              {recentSignals.map((signal: any) => (
                <div key={signal.id} className="flex items-center justify-between p-3 bg-trader-dark rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSignalColor(signal.signal_type)}`}></div>
                      <span className="text-white font-medium">{signal.signal_type}</span>
                      <Badge className={getStatusColor(signal.status)}>
                        {signal.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-trader-gray">
                      {formatDistanceToNow(new Date(signal.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{signal.confidence_level}%</p>
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
                <p className="text-white">{settings.default_timeframe}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-trader-gray">Mercado</p>
                <p className="text-white">{settings.default_market_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-trader-gray">IA Autônoma</p>
                <p className="text-white">{settings.ai_autonomous_enabled ? 'Ativa' : 'Inativa'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-trader-gray">Tolerância ao Risco</p>
                <p className="text-white">{settings.risk_tolerance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;
