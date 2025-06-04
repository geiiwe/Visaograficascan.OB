
/**
 * Hook para funcionalidades avançadas de trading
 * Integra backtesting, gestão de risco e alertas
 */

import { useState, useEffect, useCallback } from 'react';
import { runBacktest, BacktestResult } from '@/utils/backtesting/backtestEngine';
import { 
  calculatePositionSize, 
  assessOverallRisk, 
  RiskAssessment,
  PositionSizing 
} from '@/utils/riskManagement/advancedRiskManager';
import { alertManager, SmartAlert } from '@/utils/alerts/smartAlertSystem';
import { toast } from 'sonner';

export const useAdvancedTrading = () => {
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [currentRisk, setCurrentRisk] = useState<RiskAssessment | null>(null);
  const [positionSizing, setPositionSizing] = useState<PositionSizing | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<SmartAlert[]>([]);
  const [accountMetrics, setAccountMetrics] = useState({
    balance: 10000, // Demo account
    dailyPnL: 0,
    currentDrawdown: 0
  });
  
  // Simular dados de mercado para backtesting
  const generateMarketData = useCallback((days: number = 30): number[] => {
    const data: number[] = [];
    let price = 100;
    
    for (let i = 0; i < days * 24; i++) { // Dados horários
      const change = (Math.random() - 0.5) * 2;
      price += change;
      data.push(Math.max(50, Math.min(150, price))); // Limitar entre 50-150
    }
    
    return data;
  }, []);
  
  // Executar backtesting
  const performBacktest = useCallback(async (signals: any[]) => {
    if (signals.length === 0) return;
    
    console.log("🔍 Executando backtesting...");
    
    const marketData = generateMarketData();
    const config = {
      timeframe: "1m",
      marketType: "forex",
      initialCapital: 10000,
      maxRiskPerTrade: 2,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      minConfidence: 70
    };
    
    const result = runBacktest(signals, marketData, config);
    
    setBacktestResults(prev => {
      const newResults = [...prev, result];
      // Manter apenas os últimos 10 resultados
      return newResults.slice(-10);
    });
    
    // Mostrar resultado do backtesting
    if (result.winRate > 60) {
      toast.success(
        `📊 Backtesting: ${result.winRate.toFixed(1)}% win rate`,
        {
          description: `${result.totalTrades} trades, ${result.maxDrawdown.toFixed(1)}% max drawdown`
        }
      );
    } else {
      toast.warning(
        `📊 Backtesting: ${result.winRate.toFixed(1)}% win rate (baixo)`,
        {
          description: `Considere ajustar estratégia. ${result.totalTrades} trades analisados`
        }
      );
    }
    
    return result;
  }, [generateMarketData]);
  
  // Avaliar risco de um novo sinal
  const evaluateSignalRisk = useCallback((signal: any) => {
    const riskAssessment = assessOverallRisk(
      [], // Posições atuais (simulado vazio)
      signal,
      accountMetrics
    );
    
    setCurrentRisk(riskAssessment);
    
    // Calcular position sizing se o risco for aceitável
    if (riskAssessment.shouldTrade && signal.entry_price) {
      const stopLoss = signal.stop_loss || 
        (signal.entry_price * (signal.action === "BUY" ? 0.98 : 1.02));
      
      const positioning = calculatePositionSize(
        signal,
        accountMetrics.balance,
        signal.entry_price,
        stopLoss
      );
      
      setPositionSizing(positioning);
      
      // Mostrar recomendação de position sizing
      if (positioning.riskRewardRatio >= 2) {
        toast.success(
          `💰 Position Size: ${positioning.recommendedSize} unidades`,
          {
            description: `R/R: 1:${positioning.riskRewardRatio.toFixed(2)} | Risco: ${positioning.riskAmount.toFixed(2)}`
          }
        );
      }
    }
    
    // Processar alerta se necessário
    const alert = alertManager.processSignal(signal);
    if (alert) {
      setActiveAlerts(alertManager.getActiveAlerts());
    }
    
    // Processar alerta de risco
    const riskAlert = alertManager.processRiskAlert(riskAssessment);
    if (riskAlert) {
      setActiveAlerts(alertManager.getActiveAlerts());
    }
    
    return riskAssessment;
  }, [accountMetrics]);
  
  // Atualizar alertas ativos
  useEffect(() => {
    const updateAlerts = () => {
      setActiveAlerts(alertManager.getActiveAlerts());
    };
    
    // Subscrever a novos alertas
    alertManager.subscribe((alert) => {
      updateAlerts();
      
      // Mostrar toast para alertas importantes
      if (alert.priority === "CRITICAL" || alert.priority === "HIGH") {
        if (alert.type === "SIGNAL") {
          toast.success(alert.title, {
            description: alert.message,
            duration: 8000
          });
        } else if (alert.type === "RISK") {
          toast.error(alert.title, {
            description: alert.message,
            duration: 10000
          });
        }
      }
    });
    
    // Atualizar alertas a cada 30 segundos
    const interval = setInterval(updateAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Simular atualização de métricas de conta
  useEffect(() => {
    const updateAccountMetrics = () => {
      // Simular mudanças nas métricas (em aplicação real, viria da API)
      setAccountMetrics(prev => ({
        ...prev,
        dailyPnL: (Math.random() - 0.5) * 200, // -100 a +100
        currentDrawdown: Math.max(0, Math.random() * 10) // 0 a 10%
      }));
    };
    
    // Atualizar métricas a cada 2 minutos
    const interval = setInterval(updateAccountMetrics, 120000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    // Backtesting
    backtestResults,
    performBacktest,
    
    // Gestão de Risco
    currentRisk,
    positionSizing,
    evaluateSignalRisk,
    
    // Alertas
    activeAlerts,
    
    // Métricas
    accountMetrics,
    
    // Utilitários
    alertManager
  };
};
