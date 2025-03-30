
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
  CandlestickChart
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import ChartOverlay from "./ChartOverlay";

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

  useEffect(() => {
    const runAnalysis = async () => {
      if (isAnalyzing && imageData) {
        try {
          // Process the image first
          const processedImage = await prepareForAnalysis(imageData);
          
          // Run the pattern detection
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
      description: "Padrões de SMA e EMA encontrados",
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
    }
  ];

  return (
    <div className="absolute inset-0 flex flex-col justify-end">
      <ChartOverlay 
        results={detailedResults} 
        showMarkers={showVisualMarkers}
      />
      
      <div className="bg-gradient-to-t from-black/80 via-transparent to-transparent p-4">
        <div className="bg-trader-dark/90 rounded-lg border border-trader-panel p-4 backdrop-blur-sm">
          <h3 className="font-semibold text-lg mb-4">Resultados da Análise</h3>
          
          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {resultItems.map(({ type, icon: Icon, label, color, description, detailedDesc, recommendation, majorPlayers }) => {
              // Only show results for active analysis types that have results
              if (!activeAnalysis.includes(type as any) || !analysisResults[type as any]) {
                return null;
              }
              
              return (
                <div key={type} className="flex items-start gap-3">
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
                    
                    <div className="mt-2 bg-trader-panel/50 p-2 rounded-sm border-l-2 border-trader-blue">
                      <p className="text-xs text-trader-gray">{detailedDesc}</p>
                      <p className="text-xs font-medium mt-1 text-trader-blue">{recommendation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsOverlay;
