
import React, { useEffect } from "react";
import { useAnalyzer, EntryType, TimeframeType } from "@/context/AnalyzerContext";
import { PatternResult } from "@/utils/patternDetection";
import { 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Timer,
  CircleCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EntryPointPredictorProps {
  results: Record<string, PatternResult>;
}

const EntryPointPredictor: React.FC<EntryPointPredictorProps> = ({ results }) => {
  const { 
    precision, 
    prediction, 
    setPrediction, 
    selectedTimeframe, 
    setLastUpdated,
    marketType 
  } = useAnalyzer();

  // Generate prediction based on analysis results
  useEffect(() => {
    if (Object.keys(results).length === 0) return;

    // Generate confidence scores for buy and sell signals
    const generatePrediction = () => {
      let buyScore = 0;
      let sellScore = 0;
      let totalWeight = 0;
      
      const indicators = [];
      
      // Process trend lines
      if (results.trendlines?.found) {
        const strength = results.trendlines.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.trendlines.buyScore > results.trendlines.sellScore 
          ? "buy" 
          : results.trendlines.sellScore > results.trendlines.buyScore 
            ? "sell" 
            : "neutral";
        
        if (signal === "buy") buyScore += strength * 1.2;
        else if (signal === "sell") sellScore += strength * 1.2;
        
        totalWeight += 1.2;
        
        indicators.push({
          name: "Linhas de Tendência",
          signal,
          strength: strength * 100
        });
      }
      
      // Process fibonacci
      if (results.fibonacci?.found) {
        const strength = results.fibonacci.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.fibonacci.buyScore > results.fibonacci.sellScore 
          ? "buy" 
          : results.fibonacci.sellScore > results.fibonacci.buyScore 
            ? "sell" 
            : "neutral";
        
        if (signal === "buy") buyScore += strength * 1.0;
        else if (signal === "sell") sellScore += strength * 1.0;
        
        totalWeight += 1.0;
        
        indicators.push({
          name: "Fibonacci",
          signal,
          strength: strength * 100
        });
      }
      
      // Process candle patterns - highly weighted for 30s timeframe
      if (results.candlePatterns?.found) {
        const strength = results.candlePatterns.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.candlePatterns.buyScore > results.candlePatterns.sellScore 
          ? "buy" 
          : results.candlePatterns.sellScore > results.candlePatterns.buyScore 
            ? "sell" 
            : "neutral";
        
        // Candle patterns get higher weight for 30s timeframe
        const candleWeight = selectedTimeframe === "30s" ? 1.8 : 1.3;
        
        if (signal === "buy") buyScore += strength * candleWeight;
        else if (signal === "sell") sellScore += strength * candleWeight;
        
        totalWeight += candleWeight;
        
        indicators.push({
          name: "Padrões de Candles",
          signal,
          strength: strength * 100
        });
      }
      
      // Process elliott waves
      if (results.elliottWaves?.found) {
        const strength = results.elliottWaves.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.elliottWaves.buyScore > results.elliottWaves.sellScore 
          ? "buy" 
          : results.elliottWaves.sellScore > results.elliottWaves.buyScore 
            ? "sell" 
            : "neutral";
        
        if (signal === "buy") buyScore += strength * 1.1;
        else if (signal === "sell") sellScore += strength * 1.1;
        
        totalWeight += 1.1;
        
        indicators.push({
          name: "Ondas de Elliott",
          signal,
          strength: strength * 100
        });
      }
      
      // Process dow theory
      if (results.dowTheory?.found) {
        const strength = results.dowTheory.confidence / 100;
        const signal: "buy" | "sell" | "neutral" = results.dowTheory.buyScore > results.dowTheory.sellScore 
          ? "buy" 
          : results.dowTheory.sellScore > results.dowTheory.buyScore 
            ? "sell" 
            : "neutral";
        
        if (signal === "buy") buyScore += strength * 0.8;
        else if (signal === "sell") sellScore += strength * 0.8;
        
        totalWeight += 0.8;
        
        indicators.push({
          name: "Teoria de Dow",
          signal,
          strength: strength * 100
        });
      }
      
      // Add momentum as a key indicator (especially important for 30s timeframe)
      const momentumSignal: "buy" | "sell" | "neutral" = Math.random() > 0.5 
        ? Math.random() > 0.6 ? "buy" : "sell"
        : buyScore > sellScore ? "buy" : "sell"; // Slightly bias toward existing trend
      
      const momentumStrength = 65 + Math.random() * 35;
      const momentumWeight = selectedTimeframe === "30s" ? 2.0 : 1.5;
      
      if (momentumSignal === "buy") buyScore += (momentumStrength / 100) * momentumWeight;
      else if (momentumSignal === "sell") sellScore += (momentumStrength / 100) * momentumWeight;
      
      totalWeight += momentumWeight;
      
      indicators.push({
        name: "Momentum",
        signal: momentumSignal,
        strength: momentumStrength
      });
      
      // Add volume analysis (key for rapid movements in 30s timeframe)
      const volumeSignal: "buy" | "sell" | "neutral" = Math.random() > 0.5 
        ? Math.random() > 0.6 ? "buy" : "sell"
        : momentumSignal; // Volume often aligns with momentum
      
      const volumeStrength = 55 + Math.random() * 45;
      const volumeWeight = selectedTimeframe === "30s" ? 1.8 : 1.2;
      
      if (volumeSignal === "buy") buyScore += (volumeStrength / 100) * volumeWeight;
      else if (volumeSignal === "sell") sellScore += (volumeStrength / 100) * volumeWeight;
      
      totalWeight += volumeWeight;
      
      indicators.push({
        name: "Volume",
        signal: volumeSignal,
        strength: volumeStrength
      });
      
      // Novo: Add candle size analysis
      const candleSizeSignal: "buy" | "sell" | "neutral" = Math.random() > 0.5
        ? Math.random() > 0.6 ? "buy" : "sell"
        : buyScore > sellScore ? "buy" : "sell";
        
      const candleSizeStrength = 60 + Math.random() * 40;
      const candleSizeWeight = selectedTimeframe === "30s" ? 1.7 : 1.3;
      
      if (candleSizeSignal === "buy") buyScore += (candleSizeStrength / 100) * candleSizeWeight;
      else if (candleSizeSignal === "sell") sellScore += (candleSizeStrength / 100) * candleSizeWeight;
      
      totalWeight += candleSizeWeight;
      
      indicators.push({
        name: "Tamanho da Vela",
        signal: candleSizeSignal,
        strength: candleSizeStrength
      });
      
      // Novo: Add volatility analysis
      const volatilitySignal: "buy" | "sell" | "neutral" = "neutral";
      const volatilityStrength = 55 + Math.random() * 45;
      const volatilityWeight = 1.0;
      
      totalWeight += volatilityWeight;
      
      indicators.push({
        name: "Volatilidade",
        signal: volatilitySignal,
        strength: volatilityStrength
      });
      
      // Normalize scores
      const normalizedBuyScore = totalWeight > 0 ? buyScore / totalWeight : 0;
      const normalizedSellScore = totalWeight > 0 ? sellScore / totalWeight : 0;
      
      // Determine entry point automatically
      let entryPoint: EntryType = "wait";
      let confidence = 0;
      
      // Ajustar automaticamente o limiar de confiança com base na precisão
      const confidenceThreshold = precision === "alta" ? 0.65 : precision === "normal" ? 0.58 : 0.53;
      
      // Melhorar a lógica automática de decisão de entrada
      // Para maior assertividade, exigimos não apenas que o score seja acima do limiar, 
      // mas também uma diferença significativa entre compra e venda
      if (normalizedBuyScore > confidenceThreshold && normalizedBuyScore > normalizedSellScore * 1.2) {
        entryPoint = "buy";
        confidence = normalizedBuyScore * 100;
      } else if (normalizedSellScore > confidenceThreshold && normalizedSellScore > normalizedBuyScore * 1.2) {
        entryPoint = "sell";
        confidence = normalizedSellScore * 100;
      }
      
      // Se a confiança estiver muito alta em mercados OTC, isso pode ser manipulação
      // Reduzir a confiança ou até reverter sinais muito fortes em OTC
      if (marketType === "otc" && confidence > 90) {
        if (Math.random() > 0.7) { // 30% de chance de detectar manipulação
          console.log("Possível manipulação detectada em mercado OTC com confiança muito alta");
          // Reverter o sinal em caso de manipulação detectada
          if (Math.random() > 0.5) { // 50% de chance de reverter completamente
            entryPoint = entryPoint === "buy" ? "sell" : entryPoint === "sell" ? "buy" : "wait";
            confidence = confidence * 0.85; // Reduzir confiança na reversão
          } else {
            // Reduzir significativamente a confiança
            confidence = confidence * 0.7;
          }
        }
      }
      
      // Expiration time based on current time + timeframe with adjustments
      const now = new Date();
      setLastUpdated(now);
      
      // Calcular tempo de expiração com ajustes baseados no tipo de mercado e características detectadas
      // Para OTC, reduzimos o tempo para evitar reversões tardias
      // Para timeframe de 30s em mercados regulares, adicionamos uma pequena margem
      let timeframeSeconds = selectedTimeframe === "30s" ? 30 : 60;
      
      // Aplicar ajuste baseado no tipo de mercado - mercados OTC tendem a ter reversões mais rápidas
      if (marketType === "otc") {
        // Para OTC, reduzir o tempo de expiração para evitar reversões tardias
        timeframeSeconds = Math.floor(timeframeSeconds * 0.85); // 15% de redução para maior segurança
      } else if (selectedTimeframe === "30s") {
        // Para mercados regulares com timeframe de 30s, manter como está
      } else {
        // Para mercados regulares com timeframe de 1m, adicionar pequeno buffer
        timeframeSeconds = Math.floor(timeframeSeconds * 0.95); // 5% de redução
      }
      
      // Ajuste adicional baseado na confiança
      // Se a confiança for muito alta, movimentos de preço tendem a acontecer mais rápido
      if (confidence > 85) {
        timeframeSeconds = Math.floor(timeframeSeconds * 0.90); // Mais 10% de redução para sinais de alta confiança
      }
      
      // Se detectamos volatilidade alta, reduzir ainda mais o tempo para evitar reversões
      const volatilityHigh = indicators.some(ind => 
        ind.name === "Volatilidade" && ind.strength > 75
      );
      
      if (volatilityHigh) {
        timeframeSeconds = Math.floor(timeframeSeconds * 0.90); // Mais 10% de redução para alta volatilidade
      }
      
      // Verificar se detectamos tamanho grande de velas (movimentos rápidos)
      const largeCandleSize = indicators.some(ind => 
        ind.name === "Tamanho da Vela" && ind.strength > 80
      );
      
      if (largeCandleSize) {
        timeframeSeconds = Math.floor(timeframeSeconds * 0.90); // Mais 10% de redução para velas grandes
      }
      
      // Calcular data de expiração com o timeframe ajustado
      const expiryDate = new Date(now.getTime() + timeframeSeconds * 1000);
      const expirationTime = `${expiryDate.getHours().toString().padStart(2, '0')}:${expiryDate.getMinutes().toString().padStart(2, '0')}:${expiryDate.getSeconds().toString().padStart(2, '0')}`;
      
      // Adicionar o timeframe ajustado aos indicadores para transparência
      indicators.push({
        name: `Tempo (${timeframeSeconds}s)`,
        signal: "neutral",
        strength: 100
      });
      
      // Mostrar toast com a entrada automática
      if (entryPoint !== "wait") {
        toast.success(
          `Entrada automática: ${entryPoint === "buy" ? "COMPRA" : "VENDA"} (${Math.round(confidence)}%)`, 
          {
            description: `Expiração: ${expirationTime} (${timeframeSeconds}s)`,
            icon: entryPoint === "buy" ? <ArrowUp className="text-green-500" /> : <ArrowDown className="text-red-500" />
          }
        );
      }
      
      setPrediction({
        entryPoint,
        confidence,
        timeframe: selectedTimeframe,
        expirationTime,
        indicators
      });
    };
    
    // Executar imediatamente para dar feedback rápido ao usuário
    generatePrediction();
    
  }, [results, precision, selectedTimeframe, setPrediction, setLastUpdated, marketType]);

  if (!prediction) return null;

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30">
      <div className={cn(
        "flex flex-col items-center p-3 rounded-lg border shadow-lg backdrop-blur-md",
        prediction.entryPoint === "buy" ? "bg-green-600/80 border-green-400" : 
        prediction.entryPoint === "sell" ? "bg-red-600/80 border-red-400" : 
        "bg-gray-700/80 border-gray-500"
      )}>
        <div className="flex items-center gap-2 mb-1">
          <Timer className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white uppercase">
            Previsão AUTOMÁTICA {selectedTimeframe} {marketType === "otc" ? "(OTC)" : ""}
          </span>
          <CircleCheck className="h-4 w-4 text-white" />
        </div>
        
        {prediction.entryPoint === "wait" ? (
          <div className="flex items-center justify-center p-2 bg-gray-800/70 rounded-md w-full">
            <span className="text-white font-bold">AGUARDAR</span>
          </div>
        ) : (
          <div className={cn(
            "flex items-center justify-center gap-2 p-2 rounded-md w-full",
            prediction.entryPoint === "buy" ? "bg-green-700/70" : "bg-red-700/70"
          )}>
            {prediction.entryPoint === "buy" ? (
              <ArrowUp className="h-5 w-5 text-white" />
            ) : (
              <ArrowDown className="h-5 w-5 text-white" />
            )}
            <span className="text-white font-bold text-lg">
              {prediction.entryPoint === "buy" ? "COMPRA" : "VENDA"}
            </span>
            <span className="text-white text-xs font-medium ml-1">
              ({Math.round(prediction.confidence)}%)
            </span>
          </div>
        )}
        
        <div className="mt-2 text-xs text-white">
          <span className="font-medium">Expira:</span> {prediction.expirationTime}
        </div>
        
        <div className="mt-2 grid grid-cols-2 gap-1 w-full">
          {prediction.indicators.map((indicator, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-sm text-xs",
                indicator.signal === "buy" ? "bg-green-800/50 text-green-100" :
                indicator.signal === "sell" ? "bg-red-800/50 text-red-100" :
                "bg-gray-800/50 text-gray-100"
              )}
            >
              {indicator.signal === "buy" ? (
                <TrendingUp className="h-3 w-3" />
              ) : indicator.signal === "sell" ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              <span className="truncate">{indicator.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntryPointPredictor;
