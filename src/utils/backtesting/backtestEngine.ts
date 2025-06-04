
/**
 * Sistema de Backtesting Profissional
 * Valida as decisões da IA contra dados históricos
 */

export interface BacktestResult {
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  timeframe: string;
  marketType: string;
}

export interface TradeResult {
  entry: number;
  exit: number;
  duration: number; // segundos
  profit: number;
  profitPercent: number;
  signal: "BUY" | "SELL";
  confidence: number;
  confluences: number;
  success: boolean;
}

export interface BacktestConfig {
  timeframe: string;
  marketType: string;
  initialCapital: number;
  maxRiskPerTrade: number; // % do capital
  startDate: Date;
  endDate: Date;
  minConfidence: number;
}

export const runBacktest = (
  signals: any[],
  marketData: number[],
  config: BacktestConfig
): BacktestResult => {
  console.log("🔍 Iniciando backtesting profissional...");
  
  const trades: TradeResult[] = [];
  let capital = config.initialCapital;
  let maxCapital = capital;
  let maxDrawdown = 0;
  
  for (let i = 0; i < signals.length - 1; i++) {
    const signal = signals[i];
    
    // Filtrar apenas sinais de alta qualidade
    if (signal.confidence < config.minConfidence) continue;
    if (signal.action === "WAIT") continue;
    
    const entryPrice = marketData[i];
    const exitPrice = marketData[i + 1]; // Simplificado para demo
    
    // Calcular position size baseado no risco
    const riskAmount = capital * (config.maxRiskPerTrade / 100);
    const positionSize = riskAmount / (entryPrice * 0.02); // 2% stop loss
    
    let profit = 0;
    let success = false;
    
    if (signal.action === "BUY") {
      profit = (exitPrice - entryPrice) * positionSize;
      success = exitPrice > entryPrice;
    } else if (signal.action === "SELL") {
      profit = (entryPrice - exitPrice) * positionSize;
      success = exitPrice < entryPrice;
    }
    
    const profitPercent = (profit / capital) * 100;
    capital += profit;
    
    // Calcular drawdown
    if (capital > maxCapital) {
      maxCapital = capital;
    } else {
      const currentDrawdown = ((maxCapital - capital) / maxCapital) * 100;
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
    }
    
    trades.push({
      entry: entryPrice,
      exit: exitPrice,
      duration: 60, // Simplificado
      profit,
      profitPercent,
      signal: signal.action,
      confidence: signal.confidence,
      confluences: signal.confluences || 0,
      success
    });
  }
  
  // Calcular métricas
  const winningTrades = trades.filter(t => t.success).length;
  const losingTrades = trades.length - winningTrades;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const totalLoss = trades.filter(t => !t.success).reduce((sum, t) => sum + Math.abs(t.profit), 0);
  
  const averageReturn = trades.length > 0 ? totalProfit / trades.length : 0;
  const profitFactor = totalLoss > 0 ? Math.abs(totalProfit) / totalLoss : 0;
  
  // Sharpe Ratio simplificado
  const returns = trades.map(t => t.profitPercent);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
  
  console.log(`✅ Backtesting concluído: ${winRate.toFixed(1)}% win rate, ${trades.length} trades`);
  
  return {
    winRate,
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    averageReturn,
    maxDrawdown,
    sharpeRatio,
    profitFactor,
    timeframe: config.timeframe,
    marketType: config.marketType
  };
};

export const generatePerformanceReport = (results: BacktestResult[]): string => {
  const report = results.map(result => 
    `📊 ${result.timeframe} ${result.marketType.toUpperCase()}: ` +
    `${result.winRate.toFixed(1)}% win rate, ` +
    `${result.totalTrades} trades, ` +
    `${result.maxDrawdown.toFixed(1)}% max DD`
  ).join('\n');
  
  return `🎯 RELATÓRIO DE PERFORMANCE:\n${report}`;
};
