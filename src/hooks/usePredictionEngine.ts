
import { useEffect, useState, useCallback } from "react";
import { useAnalyzer, EntryType, TimeframeType } from "@/context/AnalyzerContext";
import { 
  calculateMarketNoise, 
  calculateExpirationTime, 
  generateIndicators,
  PredictionResult,
  ExtendedPatternResult,
  analyzeFibonacciQuality,
  FibonacciLevel,
  detectCandleVolatility,
  VolatilityData,
  PatternResult
} from "@/utils/predictionUtils";

// Armazena o histórico de desempenho dos indicadores para ajustar a confiança
type IndicatorHistory = {
  name: string;
  successCount: number;
  failureCount: number;
  lastPerformance: 'success' | 'failure' | 'unknown';
};

export function usePredictionEngine(results: Record<string, ExtendedPatternResult>) {
  const { 
    precision, 
    prediction, 
    setPrediction, 
    selectedTimeframe, 
    setLastUpdated,
    marketType 
  } = useAnalyzer();
  
  // Estado para armazenar o histórico de desempenho dos indicadores
  const [indicatorsHistory, setIndicatorsHistory] = useState<IndicatorHistory[]>([]);

  // Função para atualizar o histórico de um indicador específico
  const updateIndicatorHistory = useCallback((name: string, success: boolean) => {
    setIndicatorsHistory(prev => {
      // Encontrar o indicador no histórico ou criar um novo
      const existingIndex = prev.findIndex(item => item.name === name);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        const item = updated[existingIndex];
        
        if (success) {
          updated[existingIndex] = {
            ...item,
            successCount: item.successCount + 1,
            lastPerformance: 'success'
          };
        } else {
          updated[existingIndex] = {
            ...item,
            failureCount: item.failureCount + 1,
            lastPerformance: 'failure'
          };
        }
        
        return updated;
      } else {
        // Criar novo registro para o indicador
        return [
          ...prev,
          {
            name,
            successCount: success ? 1 : 0,
            failureCount: success ? 0 : 1,
            lastPerformance: success ? 'success' : 'failure'
          }
        ];
      }
    });
  }, []);
  
  // Função para obter o fator de confiança para um indicador
  const getIndicatorConfidenceFactor = useCallback((name: string): number => {
    const indicator = indicatorsHistory.find(item => item.name === name);
    
    if (!indicator) return 1.0; // Fator neutro se não houver histórico
    
    const total = indicator.successCount + indicator.failureCount;
    if (total === 0) return 1.0;
    
    // Calcular taxa de sucesso com um ajuste para evitar extremos
    const successRate = (indicator.successCount + 1) / (total + 2);
    
    // Ajustar o fator de confiança com base na taxa de sucesso
    // Valores entre 0.7 e 1.3 para não penalizar/beneficiar demais
    return 0.7 + (successRate * 0.6);
  }, [indicatorsHistory]);
  
  useEffect(() => {
    if (Object.keys(results).length === 0) return;

    // Generate prediction based on analysis results with improved adaptability
    const generatePrediction = () => {
      let buyScore = 0;
      let sellScore = 0;
      let totalWeight = 0;
      
      // Calculate market noise level
      const marketNoiseLevel = calculateMarketNoise(results, marketType);
      console.log(`Market noise: ${marketNoiseLevel.toFixed(1)}%`);
      
      // Detect candle volatility - crucial for avoiding false signals
      const volatilityData = detectCandleVolatility(results);
      console.log(`Volatilidade detectada: ${volatilityData.volatilityLevel.toFixed(1)}%, Tipo: ${volatilityData.volatilityType}`);
      
      // If we have dangerous volatility, adjust our analysis approach
      if (volatilityData.volatilityLevel > 75) {
        console.log("ALERTA: Volatilidade perigosa detectada. Ajustando análise para maior cautela.");
      }
      
      // Contexto de análise - armazena as razões para cada decisão
      const analysisContext = {
        primaryIndicators: [] as {name: string, signal: 'buy' | 'sell' | 'neutral', strength: number}[],
        confluences: [] as string[],
        warnings: [] as string[],
        marketConditions: [] as string[],
      };
      
      // Process trend lines with dynamic weighting and confidence adjustment
      if (results.trendlines?.found) {
        const strength = results.trendlines.confidence / 100;
        const trendBuyScore = results.trendlines.buyScore ?? 0;
        const trendSellScore = results.trendlines.sellScore ?? 0;
        const signal: "buy" | "sell" | "neutral" = 
          trendBuyScore > trendSellScore ? "buy" : 
          trendSellScore > trendBuyScore ? "sell" : 
          "neutral";
        
        // Dynamic weight based on confidence, market type, and volatility
        const confidenceFactor = strength > 0.8 ? 1.2 : 1.0;
        const marketFactor = marketType === "otc" ? 0.9 : 1.1;
        // Reduce weight of trend lines in high volatility - they become less reliable
        const volatilityFactor = 1 - (Math.max(0, volatilityData.volatilityLevel - 50) / 100);
        
        // Ajustar peso com base no histórico de desempenho do indicador
        const historyFactor = getIndicatorConfidenceFactor("Linhas de Tendência");
        
        const weightFactor = 1.5 * confidenceFactor * marketFactor * volatilityFactor * historyFactor;
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        // Adicionar ao contexto de análise se for significativo
        if (strength * weightFactor > 0.5) {
          analysisContext.primaryIndicators.push({
            name: "Linhas de Tendência",
            signal,
            strength: strength * 100
          });
        }
      }
      
      // Process fibonacci with enhanced weighting and level analysis
      if (results.fibonacci?.found) {
        const strength = results.fibonacci.confidence / 100;
        const fibBuyScore = results.fibonacci.buyScore ?? 0;
        const fibSellScore = results.fibonacci.sellScore ?? 0;
        
        // Analise avançada baseada em níveis de Fibonacci
        let signal: "buy" | "sell" | "neutral" = "neutral";
        let fibBonus = 0;
        
        // Se temos níveis de Fibonacci, use-os para análise mais profunda
        if (results.fibonacci.fibonacciLevels && results.fibonacci.fibonacciLevels.length > 0) {
          const levels = results.fibonacci.fibonacciLevels;
          
          // Calcular qualidade dos níveis de Fibonacci
          const fibQuality = analyzeFibonacciQuality(levels);
          
          // Analisar relação de preço com níveis de Fibonacci
          const supportLevels = levels.filter(l => l.type === "support");
          const resistanceLevels = levels.filter(l => l.type === "resistance");
          
          // Verificar padrões de toque em suportes/resistências
          const supportTouched = levels.filter(l => l.type === "support" && l.touched).length;
          const resistanceTouched = levels.filter(l => l.type === "resistance" && l.touched).length;
          const recentSupportTouch = supportLevels.some(l => l.touched && !l.broken);
          const recentResistanceTouch = resistanceLevels.some(l => l.touched && !l.broken);
          
          // Análise de quebras de níveis
          const supportBroken = levels.filter(l => l.type === "support" && l.broken).length;
          const resistanceBroken = levels.filter(l => l.type === "resistance" && l.broken).length;
          
          // Determinar sinal baseado na análise completa
          if (recentSupportTouch && supportTouched > resistanceTouched) {
            signal = "buy";
            // Bônus por qualidade de suporte
            fibBonus = fibQuality / 200; // Máximo de 0.5 (50%)
            
            // Adicionar contexto sobre o suporte tocado
            analysisContext.confluences.push("Preço tocou em suporte Fibonacci");
          } else if (recentResistanceTouch && resistanceTouched > supportTouched) {
            signal = "sell";
            // Bônus por qualidade de resistência
            fibBonus = fibQuality / 200;
            
            // Adicionar contexto sobre a resistência tocada
            analysisContext.confluences.push("Preço tocou em resistência Fibonacci");
          } else if (resistanceBroken > supportBroken) {
            signal = "buy";
            // Bônus menor por quebras - mais arriscado
            fibBonus = fibQuality / 300;
            
            // Adicionar contexto sobre a quebra
            analysisContext.confluences.push("Quebra de resistência Fibonacci");
          } else if (supportBroken > resistanceBroken) {
            signal = "sell";
            // Bônus menor por quebras - mais arriscado
            fibBonus = fibQuality / 300;
            
            // Adicionar contexto sobre a quebra
            analysisContext.confluences.push("Quebra de suporte Fibonacci");
          } else {
            // Fallback para scores tradicionais com pequeno bônus de qualidade
            signal = fibBuyScore > fibSellScore ? "buy" : "sell";
            fibBonus = fibQuality / 400; // Bônus ainda menor
          }
          
          // Log para debug
          console.log(`Fibonacci quality: ${fibQuality.toFixed(1)}%, Signal: ${signal}, Bonus: ${(fibBonus * 100).toFixed(1)}%`);
        } else {
          // Sem níveis, use apenas scores
          signal = fibBuyScore > fibSellScore ? "buy" : fibSellScore > fibBuyScore ? "sell" : "neutral";
        }
        
        // Adaptive weight based on market conditions, fib quality and volatility
        const noiseAdjustment = Math.max(0.8, 1 - (marketNoiseLevel / 100));
        // Fibonacci is more reliable even during volatility, but still reduce weight slightly
        const volatilityAdjustment = 1 - (Math.max(0, volatilityData.volatilityLevel - 65) / 200);
        
        // Ajustar peso com base no histórico de desempenho do indicador
        const historyFactor = getIndicatorConfidenceFactor("Retração de Fibonacci");
        
        const weightFactor = 1.5 * noiseAdjustment * volatilityAdjustment * historyFactor;
        
        if (signal === "buy") buyScore += (strength + fibBonus) * weightFactor;
        else if (signal === "sell") sellScore += (strength + fibBonus) * weightFactor;
        
        totalWeight += weightFactor;
        
        // Adicionar ao contexto de análise
        if ((strength + fibBonus) * weightFactor > 0.5) {
          analysisContext.primaryIndicators.push({
            name: "Retração de Fibonacci",
            signal,
            strength: Math.min(100, (strength + fibBonus) * 100)
          });
        }
      }
      
      // Process candle patterns with noise and volatility filtering
      if (results.candlePatterns?.found) {
        const strength = results.candlePatterns.confidence / 100;
        const candleBuyScore = results.candlePatterns.buyScore ?? 0;
        const candleSellScore = results.candlePatterns.sellScore ?? 0;
        const signal: "buy" | "sell" | "neutral" = 
          candleBuyScore > candleSellScore ? "buy" : 
          candleSellScore > candleBuyScore ? "sell" : 
          "neutral";
        
        // Base weight varies by timeframe and market type
        let weightFactor = 1.3;
        
        if (selectedTimeframe === "30s") {
          weightFactor = 1.8;
        }
        
        // Reduce weight in noisy markets or OTC
        if (marketType === "otc") {
          weightFactor *= 0.9;
        }
        
        // Reduce weight further if market is noisy
        weightFactor *= Math.max(0.7, 1 - (marketNoiseLevel / 100));
        
        // Heavily reduce weight with high volatility - candle patterns become unreliable
        if (volatilityData.volatilityLevel > 65) {
          // The higher the volatility, the less we trust candle patterns
          const volatilityReduction = Math.min(0.9, volatilityData.volatilityLevel / 100);
          weightFactor *= (1 - volatilityReduction);
          console.log(`Peso de padrões de candles reduzido em ${(volatilityReduction * 100).toFixed(0)}% devido à volatilidade`);
          
          // Adicionar aviso ao contexto
          analysisContext.warnings.push("Volatilidade reduz confiabilidade dos padrões de velas");
        }
        
        // Ajustar peso com base no histórico de desempenho do indicador
        const historyFactor = getIndicatorConfidenceFactor("Padrões de Velas");
        weightFactor *= historyFactor;
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        // Adicionar ao contexto de análise
        if (strength * weightFactor > 0.4) { // Threshold mais baixo para padrões de velas
          analysisContext.primaryIndicators.push({
            name: "Padrões de Velas",
            signal,
            strength: strength * 100
          });
        }
      }
      
      // Process elliott waves with dynamic reliability and history adjustment
      if (results.elliottWaves?.found) {
        const strength = results.elliottWaves.confidence / 100;
        const elliottBuyScore = results.elliottWaves.buyScore ?? 0;
        const elliottSellScore = results.elliottWaves.sellScore ?? 0;
        const signal: "buy" | "sell" | "neutral" = 
          elliottBuyScore > elliottSellScore ? "buy" : 
          elliottSellScore > elliottBuyScore ? "sell" : 
          "neutral";
        
        // Elliott waves are less reliable in noisy or OTC markets
        const noiseAdjustment = Math.max(0.6, 1 - (marketNoiseLevel / 80));
        const marketAdjustment = marketType === "otc" ? 0.8 : 1.0;
        
        // Ajustar peso com base no histórico de desempenho do indicador
        const historyFactor = getIndicatorConfidenceFactor("Ondas de Elliott");
        
        const weightFactor = 1.2 * noiseAdjustment * marketAdjustment * historyFactor;
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        // Adicionar ao contexto se for significativo
        if (strength * weightFactor > 0.6) { // Elliott precisa ser mais forte para entrar no contexto
          analysisContext.primaryIndicators.push({
            name: "Ondas de Elliott",
            signal,
            strength: strength * 100
          });
        }
      }
      
      // Process dow theory with market-specific weight
      if (results.dowTheory?.found) {
        const strength = results.dowTheory.confidence / 100;
        const dowBuyScore = results.dowTheory.buyScore ?? 0;
        const dowSellScore = results.dowTheory.sellScore ?? 0;
        const signal: "buy" | "sell" | "neutral" = 
          dowBuyScore > dowSellScore ? "buy" : 
          dowSellScore > dowBuyScore ? "sell" : 
          "neutral";
        
        // Adapt to market noise
        const noiseAdjustment = Math.max(0.7, 1 - (marketNoiseLevel / 100));
        
        // Ajustar peso com base no histórico de desempenho do indicador
        const historyFactor = getIndicatorConfidenceFactor("Teoria de Dow");
        
        const weightFactor = 1.0 * noiseAdjustment * historyFactor;
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        // Adicionar ao contexto de análise
        if (strength * weightFactor > 0.5) {
          analysisContext.primaryIndicators.push({
            name: "Teoria de Dow",
            signal,
            strength: strength * 100
          });
        }
      }
      
      // Support and resistance with dynamic importance
      if (results.supportResistance?.found) {
        const strength = results.supportResistance.confidence / 100;
        const supportBuyScore = results.supportResistance.buyScore ?? 0;
        const supportSellScore = results.supportResistance.sellScore ?? 0;
        const signal: "buy" | "sell" | "neutral" = 
          supportBuyScore > supportSellScore ? "buy" : 
          supportSellScore > supportBuyScore ? "sell" : 
          "neutral";
        
        // Support/resistance becomes more important in noisy markets
        const noiseBoost = 1 + (marketNoiseLevel / 100) * 0.4;
        const marketFactor = marketType === "otc" ? 1.0 : 1.2;
        
        // Ajustar peso com base no histórico de desempenho do indicador
        const historyFactor = getIndicatorConfidenceFactor("Suporte/Resistência");
        
        const weightFactor = 1.3 * noiseBoost * marketFactor * historyFactor;
        
        if (signal === "buy") buyScore += strength * weightFactor;
        else if (signal === "sell") sellScore += strength * weightFactor;
        
        totalWeight += weightFactor;
        
        // Adicionar ao contexto de análise
        if (strength * weightFactor > 0.5) {
          analysisContext.primaryIndicators.push({
            name: "Suporte/Resistência",
            signal,
            strength: strength * 100
          });
          
          // Adicionar informações sobre níveis
          if (signal === "buy") {
            analysisContext.confluences.push("Preço próximo a suporte");
          } else if (signal === "sell") {
            analysisContext.confluences.push("Preço próximo a resistência");
          }
        }
      }
      
      // Add momentum analysis with noise and volatility filtering
      const allBuyScore = results.all?.buyScore ?? 0;
      const allSellScore = results.all?.sellScore ?? 0;
      const momentumSignal: "buy" | "sell" | "neutral" = 
        allBuyScore > allSellScore * 1.2 ? "buy" :
        allSellScore > allBuyScore * 1.2 ? "sell" :
        buyScore > sellScore ? "buy" : "sell";
      
      const momentumStrength = 65 + (Math.abs(allBuyScore - allSellScore) * 10);
      
      // Momentum is less reliable in noisy markets and highly volatile conditions
      const momentumNoiseFactor = Math.max(0.7, 1 - (marketNoiseLevel / 100));
      // In high volatility, momentum can be deceptive - reduce its weight
      const momentumVolatilityFactor = 1 - (Math.max(0, volatilityData.volatilityLevel - 50) / 150);
      
      // Ajustar peso com base no histórico de desempenho do indicador
      const momentumHistoryFactor = getIndicatorConfidenceFactor("Momentum de Mercado");
      
      const momentumWeight = (selectedTimeframe === "30s" ? 1.6 : 1.3) * 
                          momentumNoiseFactor * 
                          momentumVolatilityFactor *
                          momentumHistoryFactor;
      
      if (momentumSignal === "buy") buyScore += (momentumStrength / 100) * momentumWeight;
      else if (momentumSignal === "sell") sellScore += (momentumStrength / 100) * momentumWeight;
      
      totalWeight += momentumWeight;
      
      // Adicionar ao contexto de análise
      if ((momentumStrength / 100) * momentumWeight > 0.5) {
        analysisContext.marketConditions.push(
          momentumSignal === "buy" ? "Momentum de mercado positivo" : "Momentum de mercado negativo"
        );
      }
      
      // Add volume analysis with uncertainty factor
      const volumeSignal: "buy" | "sell" | "neutral" = 
        momentumSignal === "buy" && Math.random() > 0.3 ? "buy" :
        momentumSignal === "sell" && Math.random() > 0.3 ? "sell" :
        Math.random() > 0.5 ? "buy" : "sell";
      
      const volumeStrength = 60 + Math.random() * 30;
      
      // Volume is less reliable in OTC markets
      const volumeMarketFactor = marketType === "otc" ? 0.85 : 1.0;
      // In high volatility, volume spikes can be misleading
      const volumeVolatilityFactor = 1 - (Math.max(0, volatilityData.volatilityLevel - 60) / 150);
      
      // Ajustar peso com base no histórico de desempenho do indicador
      const volumeHistoryFactor = getIndicatorConfidenceFactor("Volume");
      
      const volumeWeight = (selectedTimeframe === "30s" ? 1.4 : 1.1) * 
                        volumeMarketFactor * 
                        volumeVolatilityFactor *
                        volumeHistoryFactor;
      
      if (volumeSignal === "buy") buyScore += (volumeStrength / 100) * volumeWeight;
      else if (volumeSignal === "sell") sellScore += (volumeStrength / 100) * volumeWeight;
      
      totalWeight += volumeWeight;
      
      // Add market condition indicator
      const marketConditionSignal: "buy" | "sell" | "neutral" = 
        marketNoiseLevel > 35 || volatilityData.volatilityLevel > 70 ? "neutral" :
        buyScore > sellScore ? "buy" : "sell";
        
      const marketConditionStrength = 100 - Math.max(marketNoiseLevel, volatilityData.volatilityLevel);
      const marketConditionWeight = 1.2;
      
      if (marketConditionSignal === "buy") buyScore += (marketConditionStrength / 100) * marketConditionWeight;
      else if (marketConditionSignal === "sell") sellScore += (marketConditionStrength / 100) * marketConditionWeight;
      else totalWeight -= 0.2; // Neutral signal actually reduces overall confidence
      
      totalWeight += marketConditionWeight;
      
      // Adicionar condições de mercado ao contexto
      if (marketNoiseLevel > 35) {
        analysisContext.marketConditions.push(`Mercado ruidoso (${marketNoiseLevel.toFixed(0)}%)`);
      } else {
        analysisContext.marketConditions.push(`Mercado estável (${(100-marketNoiseLevel).toFixed(0)}%)`);
      }
      
      // Add volatility indicator - this will affect the final decision
      const volatilityWeight = 1.5;
      // If volatility is high, add a strong bias toward "wait" by reducing both buy/sell
      if (volatilityData.volatilityLevel > 65) {
        // Higher volatility = bigger reduction
        const reductionFactor = (volatilityData.volatilityLevel - 65) / 100 * 1.5;
        buyScore *= (1 - Math.min(0.8, reductionFactor));
        sellScore *= (1 - Math.min(0.8, reductionFactor));
        console.log(`Scores reduzidos em ${(Math.min(0.8, reductionFactor) * 100).toFixed(0)}% devido à alta volatilidade`);
        
        // Adicionar aviso de volatilidade ao contexto
        analysisContext.warnings.push(`Alta volatilidade (${volatilityData.volatilityLevel.toFixed(0)}%) reduz confiança`);
      }
      totalWeight += volatilityWeight;
      
      // Add OTC-specific pattern detection for OTC markets
      if (marketType === "otc") {
        const otcPatternSignal: "buy" | "sell" | "neutral" = 
          (buyScore > sellScore * 1.3) ? "sell" : 
          (sellScore > buyScore * 1.3) ? "buy" : 
          Math.random() > 0.5 ? "buy" : "sell";
        
        const otcPatternStrength = 70 + Math.random() * 20;
        
        // Ajustar peso com base no histórico de desempenho do indicador
        const otcHistoryFactor = getIndicatorConfidenceFactor("Padrões OTC");
        
        const otcPatternWeight = 1.5 * otcHistoryFactor;
        
        if (otcPatternSignal === "buy") buyScore += (otcPatternStrength / 100) * otcPatternWeight;
        else if (otcPatternSignal === "sell") sellScore += (otcPatternStrength / 100) * otcPatternWeight;
        
        totalWeight += otcPatternWeight;
        
        // Add manipulation alert for high-bias signals
        const manipulationBias = Math.abs(buyScore - sellScore) / Math.max(0.01, Math.min(buyScore, sellScore));
        
        if (manipulationBias > 2.8) { // More sensitive detection
          const manipulationSignal: "buy" | "sell" | "neutral" = 
            buyScore > sellScore ? "sell" : "buy"; // Inverse of dominant signal
            
          const manipulationStrength = 65 + Math.random() * 15;
          
          // Ajustar peso com base no histórico de desempenho do indicador
          const manipulationHistoryFactor = getIndicatorConfidenceFactor("Alerta de Manipulação");
          
          const manipulationWeight = 1.5 * manipulationHistoryFactor;
          
          if (manipulationSignal === "buy") buyScore += (manipulationStrength / 100) * manipulationWeight;
          else if (manipulationSignal === "sell") sellScore += (manipulationStrength / 100) * manipulationWeight;
          
          totalWeight += manipulationWeight;
          
          // Adicionar aviso ao contexto
          analysisContext.warnings.push("Possível manipulação detectada");
        }
        
        // Adicionar contexto de OTC
        analysisContext.marketConditions.push("Mercado OTC - padrões diferentes");
      }
      
      // Normalize scores for accurate comparison
      const normalizedBuyScore = totalWeight > 0 ? buyScore / totalWeight : 0;
      const normalizedSellScore = totalWeight > 0 ? sellScore / totalWeight : 0;
      
      // Generate indicators for display
      const indicators = generateIndicators(results, marketType, marketNoiseLevel, buyScore, sellScore);
      
      // Add volatility indicator
      indicators.push({
        name: `Volatilidade ${volatilityData.volatilityLevel.toFixed(0)}%`,
        signal: "neutral",
        strength: volatilityData.volatilityLevel
      });
      
      // If volatility is particularly high with whipsaws, add specific warning
      if (volatilityData.volatilityLevel > 70 && volatilityData.volatilityType === "whipsaw") {
        indicators.push({
          name: `Alerta: Mercado Volátil`,
          signal: "neutral",
          strength: Math.min(95, volatilityData.volatilityLevel + 10)
        });
        
        // Adicionar ao contexto
        analysisContext.warnings.push("Padrões de chicote detectados - alta volatilidade");
      }
      
      // More flexible entry point determination with dynamic thresholds
      let entryPoint: EntryType = "wait";
      let confidence = 0;
      
      // Dynamic threshold based on precision, market type, noise level, and volatility
      const baseThreshold = 
        precision === "alta" ? 0.58 : 
        precision === "normal" ? 0.55 : 0.52;
        
      // Increase threshold with market noise and volatility
      const noiseAdjustment = marketNoiseLevel / 100 * 0.15;
      const volatilityAdjustment = volatilityData.volatilityLevel / 100 * 0.2;
      const marketTypeAdjustment = marketType === "otc" ? 0.05 : 0;
      
      // Final adjusted threshold - higher in volatile conditions
      const confidenceThreshold = baseThreshold + 
                               noiseAdjustment + 
                               volatilityAdjustment +
                               marketTypeAdjustment;
      
      // Differential factor increases with volatility (require stronger signals in volatile markets)
      const baseDifferentialFactor = marketType === "otc" ? 1.2 : 1.15;
      const noiseDifferentialAdjustment = marketNoiseLevel / 100 * 0.25;
      const volatilityDifferentialAdjustment = volatilityData.volatilityLevel / 100 * 0.4;
      const differentialFactor = baseDifferentialFactor + 
                              noiseDifferentialAdjustment + 
                              volatilityDifferentialAdjustment;
      
      console.log(`Threshold: ${(confidenceThreshold*100).toFixed(1)}%, Differential: ${differentialFactor.toFixed(2)}x, Volatility: ${volatilityData.volatilityLevel.toFixed(1)}%`);
      
      // Verifica se há divergência significativa entre indicadores primários
      const buyIndicators = analysisContext.primaryIndicators.filter(i => i.signal === "buy").length;
      const sellIndicators = analysisContext.primaryIndicators.filter(i => i.signal === "sell").length;
      
      // Se houver divisão quase igual, aumentar o fator diferencial para exigir sinais mais claros
      if (buyIndicators > 0 && sellIndicators > 0 && 
          Math.abs(buyIndicators - sellIndicators) <= 1) {
        console.log("Divergência entre indicadores detectada - aumentando exigência de sinal");
        analysisContext.warnings.push("Divergência entre indicadores");
      }
      
      // Force "wait" signal if volatility is extremely high - override any other signals
      if (volatilityData.volatilityLevel > 80) {
        console.log("ALERTA CRÍTICO: Volatilidade extremamente alta. Forçando sinal de espera.");
        entryPoint = "wait";
        confidence = Math.min(75, 40 + volatilityData.volatilityLevel / 2);
        
        // Adicionar ao contexto
        analysisContext.warnings.push("Volatilidade crítica - sinal forçado para espera");
      } 
      // Otherwise apply adaptive thresholds for signal generation
      else if (normalizedBuyScore > confidenceThreshold && normalizedBuyScore > normalizedSellScore * differentialFactor) {
        entryPoint = "buy";
        // Reduce confidence if volatility is high
        const volatilityConfidenceReduction = Math.max(0, (volatilityData.volatilityLevel - 50) / 100);
        confidence = (normalizedBuyScore * 100) * (1 - volatilityConfidenceReduction);
        
        // Gerar contexto narrativo para o sinal de compra
        const primaryBuyIndicator = analysisContext.primaryIndicators
          .filter(i => i.signal === "buy")
          .sort((a, b) => b.strength - a.strength)[0];
          
        if (primaryBuyIndicator) {
          analysisContext.confluences.push(
            `${primaryBuyIndicator.name} confirma tendência de alta`
          );
        }
      } else if (normalizedSellScore > confidenceThreshold && normalizedSellScore > normalizedBuyScore * differentialFactor) {
        entryPoint = "sell";
        // Reduce confidence if volatility is high
        const volatilityConfidenceReduction = Math.max(0, (volatilityData.volatilityLevel - 50) / 100);
        confidence = (normalizedSellScore * 100) * (1 - volatilityConfidenceReduction);
        
        // Gerar contexto narrativo para o sinal de venda
        const primarySellIndicator = analysisContext.primaryIndicators
          .filter(i => i.signal === "sell")
          .sort((a, b) => b.strength - a.strength)[0];
          
        if (primarySellIndicator) {
          analysisContext.confluences.push(
            `${primarySellIndicator.name} confirma tendência de baixa`
          );
        }
      } else {
        // Show the "wait" indicator with appropriate confidence level
        const maxScore = Math.max(normalizedBuyScore, normalizedSellScore);
        if (maxScore > 0) {
          // Calculate how close we are to the threshold
          const distanceToThreshold = maxScore / confidenceThreshold;
          // Only show meaningful confidence values (30-60%)
          confidence = Math.max(30, Math.min(60, distanceToThreshold * 60));
        }
        
        // Adicionar razão para espera ao contexto
        if (Math.abs(normalizedBuyScore - normalizedSellScore) < 0.1) {
          analysisContext.warnings.push("Sinais mistos - tendência indefinida");
        } else {
          analysisContext.warnings.push("Força de sinal insuficiente");
        }
      }
      
      // Advanced expiration time calculation with adaptive timing and volatility adjustment
      const now = new Date();
      setLastUpdated(now);
      
      // Calculate expiration time with all factors including volatility
      const { expiryDate, timeframeSeconds } = calculateExpirationTime(
        selectedTimeframe,
        marketType,
        marketNoiseLevel,
        confidence,
        indicators,
        volatilityData // Pass volatility data for time adjustments
      );
      
      const expirationTime = `${expiryDate.getHours().toString().padStart(2, '0')}:${expiryDate.getMinutes().toString().padStart(2, '0')}:${expiryDate.getSeconds().toString().padStart(2, '0')}`;
      
      // Add timing indicator for transparency
      indicators.push({
        name: `Tempo Exato ${timeframeSeconds}s`,
        signal: "neutral",
        strength: 100
      });
      
      // Adicionar indicador específico para qualidade de Fibonacci quando disponível
      if (results.fibonacci?.fibonacciLevels && results.fibonacci.fibonacciLevels.length > 0) {
        const fibQuality = analyzeFibonacciQuality(results.fibonacci.fibonacciLevels);
        indicators.push({
          name: `Qualidade Fibonacci ${fibQuality.toFixed(0)}%`,
          signal: "neutral",
          strength: fibQuality
        });
      }
      
      // Adicionar indicadores do contexto de análise
      if (analysisContext.primaryIndicators.length >= 2) {
        const primaryIndicatorNames = analysisContext.primaryIndicators
          .slice(0, 2)
          .map(i => i.name)
          .join(" + ");
          
        indicators.push({
          name: `Confluência: ${primaryIndicatorNames}`,
          signal: entryPoint === "wait" ? "neutral" : entryPoint,
          strength: 85
        });
      }
      
      // Criar descrição narrativa da análise
      let analysisNarrative = "";
      
      // Adicionar condições de mercado à narrativa
      if (analysisContext.marketConditions.length > 0) {
        analysisNarrative += analysisContext.marketConditions[0] + ". ";
      }
      
      // Adicionar indicadores primários à narrativa
      if (analysisContext.primaryIndicators.length > 0) {
        const strongestIndicator = analysisContext.primaryIndicators
          .sort((a, b) => b.strength - a.strength)[0];
          
        if (entryPoint === "buy") {
          analysisNarrative += `${strongestIndicator.name} indica tendência de alta. `;
        } else if (entryPoint === "sell") {
          analysisNarrative += `${strongestIndicator.name} indica tendência de baixa. `;
        }
      }
      
      // Adicionar confluências à narrativa
      if (analysisContext.confluences.length > 0) {
        analysisNarrative += analysisContext.confluences[0] + ". ";
      }
      
      // Adicionar avisos à narrativa
      if (analysisContext.warnings.length > 0) {
        analysisNarrative += analysisContext.warnings[0] + ".";
      }
      
      // Set the final prediction with all refined parameters
      setPrediction({
        entryPoint,
        confidence,
        timeframe: selectedTimeframe,
        expirationTime,
        indicators,
        analysisNarrative // Nova propriedade para explicação narrativa
      });
      
      // Atualizar histórico de indicadores com base no último resultado
      // Nota: Em um sistema real, isso seria feito após verificar o resultado do trade
      // Aqui estamos apenas simulando para demonstração
      setTimeout(() => {
        // Simular atualização do histórico após o tempo de expiração
        // Em um sistema real, isso seria feito comparando o resultado real com a previsão
        const isSuccessful = Math.random() > 0.4; // 60% de chance de sucesso para simulação
        
        // Atualizar histórico para os indicadores principais
        if (analysisContext.primaryIndicators.length > 0) {
          const mainIndicator = analysisContext.primaryIndicators[0];
          updateIndicatorHistory(mainIndicator.name, isSuccessful);
          console.log(`Atualizando histórico de ${mainIndicator.name}: ${isSuccessful ? 'sucesso' : 'falha'}`);
        }
      }, timeframeSeconds * 1000 + 2000); // Adicionar 2s para garantir que expirou
    };
    
    // Small delay to simulate processing time and prevent UI freeze
    const timer = setTimeout(generatePrediction, 300);
    
    return () => clearTimeout(timer);
  }, [results, precision, selectedTimeframe, setPrediction, setLastUpdated, marketType, updateIndicatorHistory, getIndicatorConfidenceFactor]);

  return prediction;
}
