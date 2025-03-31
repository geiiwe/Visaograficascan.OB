
import React, { useEffect, useState } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { detectPatterns, PatternResult } from "@/utils/patternDetection";
import { prepareForAnalysis } from "@/utils/imageProcessing";
import { 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  LineChart, 
  Activity, 
  BarChart4,
  Users,
  Fingerprint,
  CandlestickChart,
  TrendingDown,
  BarChart
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import ChartOverlay from "./ChartOverlay";
import { useMediaQuery } from "@/hooks/use-media-query";

const ResultsOverlay = () => {
  const { 
    imageData, 
    isAnalyzing, 
    setIsAnalyzing, 
    activeAnalysis, 
    analysisResults,
    setAnalysisResult,
    showVisualMarkers
  } = useAnalyzer();
  
  const [detailedResults, setDetailedResults] = useState<Record<string, PatternResult>>({});
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const runAnalysis = async () => {
      if (isAnalyzing && imageData) {
        try {
          // Process the image first
          const processedImage = await prepareForAnalysis(imageData);
          
          // Run the pattern detection with more detailed processing
          const results = await detectPatterns(processedImage, activeAnalysis);
          
          // Save the detailed results
          setDetailedResults(results);
          
          // Update the analysis results in the context
          Object.entries(results).forEach(([type, result]) => {
            setAnalysisResult(type as any, result.found);
          });
          
          // Notify the user about the results
          if (results.all.found) {
            toast.success("Análise concluída! Múltiplos padrões detectados.");
          } else if (Object.values(results).some(r => r.found)) {
            toast.success("Análise concluída! Alguns padrões foram detectados.");
          } else {
            toast.info("Análise concluída. Nenhum padrão claro detectado.");
          }
          
        } catch (error) {
          console.error("Analysis error:", error);
          toast.error("Erro durante a análise. Por favor, tente novamente.");
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    runAnalysis();
  }, [imageData, isAnalyzing, activeAnalysis, setAnalysisResult, setIsAnalyzing]);

  if (!imageData || !activeAnalysis.some(type => analysisResults[type])) {
    return null;
  }

  // Extrair decisões das recomendações para exibição em destaque
  const extractDecision = (recommendation: string): string | null => {
    if (!recommendation) return null;
    
    const match = recommendation.match(/DECISÃO:\s+(COMPRA|VENDA|AGUARDE|ESPERE|MANTENHA POSIÇÃO|REALIZE LUCROS|PREPARE-SE PARA COMPRA)/i);
    return match ? match[1] : null;
  };

  const getDecisionColor = (decision: string | null): string => {
    if (!decision) return "text-trader-gray";
    
    if (decision.includes("COMPRA")) return "text-trader-green";
    if (decision.includes("VENDA")) return "text-trader-red";
    return "text-trader-yellow";
  };

  const resultItems = [
    {
      type: "trendlines",
      icon: TrendingUp,
      label: "Linhas de Tendência",
      color: "text-trader-green",
      description: "Níveis de suporte e resistência detectados",
      detailedDesc: detailedResults.trendlines?.description || "Linhas de tendência são formadas conectando-se pontos de máximo ou mínimo de um preço. Elas ajudam a identificar a direção do movimento do preço e possíveis pontos de reversão.",
      recommendation: detailedResults.trendlines?.recommendation || "Compre próximo ao suporte e venda próximo à resistência.",
      majorPlayers: detailedResults.trendlines?.majorPlayers || []
    },
    {
      type: "movingAverages",
      icon: LineChart,
      label: "Médias Móveis",
      color: "text-trader-blue",
      description: "Padrões de MM e MMA encontrados",
      detailedDesc: detailedResults.movingAverages?.description || "Médias móveis suavizam flutuações de preço para mostrar tendências. O cruzamento de médias de diferentes períodos gera sinais de compra ou venda.",
      recommendation: detailedResults.movingAverages?.recommendation || "Considere comprar quando a média de curto prazo cruza acima da média de longo prazo.",
      majorPlayers: detailedResults.movingAverages?.majorPlayers || []
    },
    {
      type: "rsi",
      icon: Activity,
      label: "RSI",
      color: "text-trader-yellow",
      description: "Condições de sobrecompra/sobrevenda identificadas",
      detailedDesc: detailedResults.rsi?.description || "O Índice de Força Relativa (RSI) mede a velocidade e mudança dos movimentos de preço, indicando sobrecompra (>70) ou sobrevenda (<30).",
      recommendation: detailedResults.rsi?.recommendation || "Considere vender quando RSI > 70 e comprar quando RSI < 30.",
      majorPlayers: detailedResults.rsi?.majorPlayers || []
    },
    {
      type: "macd",
      icon: BarChart4,
      label: "MACD",
      color: "text-trader-purple",
      description: "Cruzamentos de linha de sinal detectados",
      detailedDesc: detailedResults.macd?.description || "O MACD mostra a relação entre duas médias móveis exponenciais. Sinais são gerados quando a linha MACD cruza sua linha de sinal.",
      recommendation: detailedResults.macd?.recommendation || "Considere comprar quando o MACD cruza acima da linha de sinal e vender quando cruza abaixo.",
      majorPlayers: detailedResults.macd?.majorPlayers || []
    },
    {
      type: "fibonacci",
      icon: Fingerprint,
      label: "Fibonacci",
      color: "text-[#f97316]",
      description: "Níveis de Fibonacci identificados",
      detailedDesc: detailedResults.fibonacci?.description || "Os níveis de Fibonacci são usados para identificar possíveis níveis de suporte, resistência e alvos de preço. Os principais níveis são 23.6%, 38.2%, 50%, 61.8% e 100%.",
      recommendation: detailedResults.fibonacci?.recommendation || "Observe os níveis de Fibonacci como possíveis zonas de reversão ou continuação.",
      majorPlayers: detailedResults.fibonacci?.majorPlayers || []
    },
    {
      type: "candlePatterns",
      icon: CandlestickChart,
      label: "Padrões de Candles",
      color: "text-[#e11d48]",
      description: "Formações de candles específicas detectadas",
      detailedDesc: detailedResults.candlePatterns?.description || "Padrões de candles são formações específicas que indicam possíveis reversões ou continuações de tendência. Eles revelam o sentimento e a psicologia do mercado.",
      recommendation: detailedResults.candlePatterns?.recommendation || "Use padrões de candles para identificar pontos de entrada e saída com bom risco/retorno.",
      majorPlayers: detailedResults.candlePatterns?.majorPlayers || []
    },
    {
      type: "elliottWaves",
      icon: TrendingDown,
      label: "Ondas de Elliott",
      color: "text-[#06b6d4]",
      description: "Padrões de ondas e ciclos identificados",
      detailedDesc: detailedResults.elliottWaves?.description || "A Teoria das Ondas de Elliott divide os movimentos do mercado em 5 ondas de impulso seguidas por 3 ondas corretivas, revelando padrões fractais nos mercados financeiros.",
      recommendation: detailedResults.elliottWaves?.recommendation || "As ondas de Elliott ajudam a identificar pontos de reversão e continuação da tendência principal.",
      majorPlayers: detailedResults.elliottWaves?.majorPlayers || []
    },
    {
      type: "dowTheory",
      icon: BarChart,
      label: "Teoria de Dow",
      color: "text-[#d946ef]",
      description: "Análise de tendências primárias e secundárias",
      detailedDesc: detailedResults.dowTheory?.description || "A Teoria de Dow é a base da análise técnica moderna, estabelecendo que os preços se movem em tendências e que o volume deve confirmar o movimento.",
      recommendation: detailedResults.dowTheory?.recommendation || "A Teoria de Dow ajuda a identificar tendências de longo prazo e pontos de reversão.",
      majorPlayers: detailedResults.dowTheory?.majorPlayers || []
    }
  ];

  // Layout para dispositivos móveis (resultados abaixo)
  if (isMobile) {
    return (
      <div className="absolute inset-0 flex flex-col justify-end">
        <ChartOverlay 
          results={detailedResults} 
          showMarkers={showVisualMarkers}
        />
        
        <div className="bg-gradient-to-t from-black/80 via-transparent to-transparent p-2">
          <div className="bg-trader-dark/90 rounded-lg border border-trader-panel p-3 backdrop-blur-sm">
            <h3 className="font-semibold text-lg mb-3">Resultados da Análise</h3>
            
            {/* Resumo das decisões */}
            <div className="mb-3 border-b border-trader-panel/50 pb-2">
              <div className="flex flex-wrap gap-2">
                {resultItems.map(({ type, label, recommendation }) => {
                  if (!activeAnalysis.includes(type as any) || !analysisResults[type as any]) {
                    return null;
                  }
                  
                  const decision = extractDecision(recommendation);
                  if (!decision) return null;
                  
                  return (
                    <div 
                      key={`decision-${type}`}
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        getDecisionColor(decision)
                      )}
                    >
                      {label}: {decision}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2 max-h-[35vh] overflow-y-auto">
              {resultItems.map(({ type, icon: Icon, label, color, description }) => {
                // Only show results for active analysis types that have results
                if (!activeAnalysis.includes(type as any) || !analysisResults[type as any]) {
                  return null;
                }
                
                return (
                  <div key={type} className="flex items-start gap-2 border-b border-trader-panel/40 pb-2">
                    <div className="flex-shrink-0 mt-1">
                      <Icon className={cn("h-4 w-4", color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-sm">{label}</span>
                        <CheckCircle2 className="h-3 w-3 text-trader-green ml-1" />
                      </div>
                      <p className="text-xs text-trader-gray">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout para desktop (resultados ao lado)
  return (
    <div className="absolute inset-0 flex">
      <ChartOverlay 
        results={detailedResults} 
        showMarkers={showVisualMarkers}
      />
      
      <div className="relative flex-1">
        {/* Espaço para o gráfico */}
      </div>
      
      <div className="w-2/5 md:w-1/3 bg-trader-dark/90 border-l border-trader-panel p-4 backdrop-blur-sm overflow-y-auto">
        <h3 className="font-semibold text-lg mb-4">Resultados da Análise</h3>
        
        {/* Resumo das decisões */}
        <div className="mb-4 bg-trader-panel/30 p-3 rounded-md border border-trader-panel/50">
          <h4 className="text-sm font-medium mb-2">Decisões Recomendadas:</h4>
          <div className="flex flex-wrap gap-2">
            {resultItems.map(({ type, label, recommendation }) => {
              if (!activeAnalysis.includes(type as any) || !analysisResults[type as any]) {
                return null;
              }
              
              const decision = extractDecision(recommendation);
              if (!decision) return null;
              
              return (
                <div 
                  key={`decision-${type}`}
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getDecisionColor(decision)
                  )}
                >
                  {label}: {decision}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-4">
          {resultItems.map(({ type, icon: Icon, label, color, description, detailedDesc, recommendation, majorPlayers }) => {
            // Only show results for active analysis types that have results
            if (!activeAnalysis.includes(type as any) || !analysisResults[type as any]) {
              return null;
            }
            
            // Extrair a decisão da recomendação
            const decision = extractDecision(recommendation);
            
            return (
              <div key={type} className="flex items-start gap-3 border-b border-trader-panel/40 pb-3">
                <div className="flex-shrink-0 mt-1">
                  <Icon className={cn("h-5 w-5", color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium">{label}</span>
                    <CheckCircle2 className="h-4 w-4 text-trader-green ml-2" />
                    
                    {majorPlayers && majorPlayers.length > 0 && (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="ml-2 text-trader-gray hover:text-white transition-colors">
                            <Users size={14} />
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 text-sm p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Usado por grandes players:</h4>
                            <ul className="list-disc pl-4 space-y-1">
                              {majorPlayers.map((player, idx) => (
                                <li key={idx}>{player}</li>
                              ))}
                            </ul>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </div>
                  <p className="text-sm text-trader-gray">{description}</p>
                  
                  <div className="mt-2 bg-trader-panel/50 p-2 rounded-sm">
                    <p className="text-xs text-trader-gray">{detailedDesc}</p>
                    
                    {decision && (
                      <p className={cn(
                        "text-sm font-bold mt-2 p-1 rounded",
                        getDecisionColor(decision)
                      )}>
                        {decision}
                      </p>
                    )}
                    
                    <p className="text-xs mt-1 text-trader-blue">{recommendation.replace(/DECISÃO:\s+(COMPRA|VENDA|AGUARDE|ESPERE|MANTENHA POSIÇÃO|REALIZE LUCROS|PREPARE-SE PARA COMPRA)/i, '')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultsOverlay;
