
import React, { useEffect } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { detectPatterns } from "@/utils/patternDetection";
import { prepareForAnalysis } from "@/utils/imageProcessing";
import { 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  LineChart, 
  Activity, 
  BarChart4,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const ResultsOverlay = () => {
  const { 
    imageData, 
    isAnalyzing, 
    setIsAnalyzing, 
    activeAnalysis, 
    analysisResults,
    setAnalysisResult
  } = useAnalyzer();

  useEffect(() => {
    const runAnalysis = async () => {
      if (isAnalyzing && imageData) {
        try {
          // Process the image first
          const processedImage = await prepareForAnalysis(imageData);
          
          // Run the pattern detection
          const results = await detectPatterns(processedImage, activeAnalysis);
          
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
      detailedDesc: "Linhas de tendência são formadas conectando-se pontos de máximo ou mínimo de um preço. Elas ajudam a identificar a direção do movimento do preço e possíveis pontos de reversão.",
      recommendation: "Compre próximo ao suporte e venda próximo à resistência."
    },
    {
      type: "movingAverages",
      icon: LineChart,
      label: "Médias Móveis",
      color: "text-trader-blue",
      description: "Padrões de SMA e EMA encontrados",
      detailedDesc: "Médias móveis suavizam flutuações de preço para mostrar tendências. O cruzamento de médias de diferentes períodos gera sinais de compra ou venda.",
      recommendation: "Considere comprar quando a média de curto prazo cruza acima da média de longo prazo."
    },
    {
      type: "rsi",
      icon: Activity,
      label: "RSI",
      color: "text-trader-yellow",
      description: "Condições de sobrecompra/sobrevenda identificadas",
      detailedDesc: "O Índice de Força Relativa (RSI) mede a velocidade e mudança dos movimentos de preço, indicando sobrecompra (>70) ou sobrevenda (<30).",
      recommendation: "Considere vender quando RSI > 70 e comprar quando RSI < 30."
    },
    {
      type: "macd",
      icon: BarChart4,
      label: "MACD",
      color: "text-trader-purple",
      description: "Cruzamentos de linha de sinal detectados",
      detailedDesc: "O MACD mostra a relação entre duas médias móveis exponenciais. Sinais são gerados quando a linha MACD cruza sua linha de sinal.",
      recommendation: "Considere comprar quando o MACD cruza acima da linha de sinal e vender quando cruza abaixo."
    }
  ];

  return (
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
      <div className="bg-trader-dark/90 rounded-lg border border-trader-panel p-4 backdrop-blur-sm">
        <h3 className="font-semibold text-lg mb-4">Resultados da Análise</h3>
        
        <div className="space-y-3">
          {resultItems.map(({ type, icon: Icon, label, color, description, detailedDesc, recommendation }) => {
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
                            {type === "trendlines" && (
                              <>
                                <li>Goldman Sachs</li>
                                <li>JP Morgan</li>
                                <li>BlackRock</li>
                              </>
                            )}
                            {type === "movingAverages" && (
                              <>
                                <li>Morgan Stanley</li>
                                <li>Fidelity</li>
                                <li>Vanguard</li>
                              </>
                            )}
                            {type === "rsi" && (
                              <>
                                <li>Renaissance Technologies</li>
                                <li>Citadel</li>
                                <li>Two Sigma</li>
                              </>
                            )}
                            {type === "macd" && (
                              <>
                                <li>Bridgewater Associates</li>
                                <li>AQR Capital</li>
                                <li>DE Shaw</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
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
  );
};

export default ResultsOverlay;
