
import React, { useMemo } from "react";
import { PatternResult } from "@/utils/patternDetection";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  Fingerprint,
  CandlestickChart,
  TrendingDown,
  BarChart,
  CheckCircle2,
  Info,
  AlertCircle,
  Clock
} from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger 
} from "@/components/ui/hover-card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAnalyzer, AnalysisType } from "@/context/AnalyzerContext";
import DirectionIndicator, { MarketDirection, SignalStrength } from "./DirectionIndicator";

interface AnalysisLabelsProps {
  results: Record<string, PatternResult>;
  compact: boolean;
}

const AnalysisLabels: React.FC<AnalysisLabelsProps> = ({ results, compact }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { activeAnalysis } = useAnalyzer();
  
  // Extract decision from recommendations
  const extractDecision = (recommendation: string): string | null => {
    if (!recommendation) return null;
    
    const match = recommendation.match(/DECISÃO:\s+(COMPRA|VENDA|AGUARDE|ESPERE|MANTENHA POSIÇÃO|REALIZE LUCROS|PREPARE-SE PARA COMPRA)/i);
    return match ? match[1] : null;
  };

  const getDecisionColor = (decision: string | null): string => {
    if (!decision) return "text-gray-600";
    
    if (decision.includes("COMPRA")) return "text-trader-green";
    if (decision.includes("VENDA")) return "text-trader-red";
    return "text-trader-yellow";
  };

  const getDecisionBgColor = (decision: string | null): string => {
    if (!decision) return "bg-gray-100";
    
    if (decision.includes("COMPRA")) return "bg-trader-green/20";
    if (decision.includes("VENDA")) return "bg-trader-red/20";
    return "bg-trader-yellow/20";
  };

  // Get timeframe recommendation text
  const getTimeframeText = (timeframe: "1min" | "5min" | null): string => {
    if (!timeframe) return "";
    return timeframe === "1min" ? "1 minuto" : "5 minutos";
  };

  // Format timeframe display
  const formatTimeframeDisplay = (timeframe: "1min" | "5min" | null): JSX.Element | null => {
    if (!timeframe) return null;
    
    return (
      <span className="flex items-center gap-1 text-blue-700 text-xs">
        <Clock className="h-3 w-3" />
        <span>{timeframe === "1min" ? "1 min" : "5 min"}</span>
      </span>
    );
  };

  const resultItems = [
    {
      type: "trendlines" as AnalysisType,
      icon: TrendingUp,
      label: "Linhas de Tendência",
      color: "text-trader-green",
      description: "Níveis de suporte e resistência"
    },
    {
      type: "fibonacci" as AnalysisType,
      icon: Fingerprint,
      label: "Fibonacci",
      color: "text-[#f97316]",
      description: "Níveis de Fibonacci"
    },
    {
      type: "candlePatterns" as AnalysisType,
      icon: CandlestickChart,
      label: "Padrões de Candles",
      color: "text-[#e11d48]",
      description: "Formações de candles específicas"
    },
    {
      type: "elliottWaves" as AnalysisType,
      icon: TrendingDown,
      label: "Ondas de Elliott",
      color: "text-[#06b6d4]",
      description: "Padrões de ondas e ciclos"
    },
    {
      type: "dowTheory" as AnalysisType,
      icon: BarChart,
      label: "Teoria de Dow",
      color: "text-[#d946ef]",
      description: "Análise de tendências"
    }
  ];
  
  // Get all items for active analyses
  const activeItems = resultItems.filter(
    item => activeAnalysis.includes(item.type)
  );
  
  // Filter items with found results
  const foundResults = resultItems.filter(
    item => results[item.type]?.found
  );
  
  // Check if we need to show "no patterns found" message
  const hasActiveAnalysis = activeAnalysis.some(type => type !== "all");
  const noResultsFound = hasActiveAnalysis && foundResults.length === 0;
  
  // Get count of activated vs found analyses
  const activatedCount = activeItems.length;
  const foundCount = foundResults.length;
  
  // Calculate overall market direction based on results
  const { direction, strength } = useMemo(() => {
    if (foundCount === 0) return { direction: "neutral" as MarketDirection, strength: "weak" as SignalStrength };
    
    let buyScore = 0;
    let sellScore = 0;
    
    // Analyze each result to determine direction
    Object.values(results).forEach(result => {
      if (!result.found) return;
      
      // Extract decision from recommendation
      const decision = extractDecision(result.recommendation || "");
      
      // Add to score based on confidence and decision
      if (decision?.includes("COMPRA")) {
        buyScore += result.confidence / 100;
      } else if (decision?.includes("VENDA")) {
        sellScore += result.confidence / 100;
      }
    });
    
    // Determine direction based on scores
    let direction: MarketDirection = "neutral";
    let strength: SignalStrength = "weak";
    
    if (buyScore > sellScore && buyScore > 0.5) {
      direction = "buy";
      strength = buyScore > 1.5 ? "strong" : buyScore > 0.8 ? "moderate" : "weak";
    } else if (sellScore > buyScore && sellScore > 0.5) {
      direction = "sell";
      strength = sellScore > 1.5 ? "strong" : sellScore > 0.8 ? "moderate" : "weak";
    }
    
    return { direction, strength };
  }, [results, foundCount]);
  
  // Get overall timeframe recommendation
  const overallTimeframe = results.all?.timeframeRecommendation;
  
  // Render message when no patterns were found
  if (noResultsFound) {
    return (
      <div className="flex items-center justify-center p-3 bg-white/70 rounded-lg border border-gray-300">
        <div className="flex items-center gap-2 text-gray-600">
          <AlertCircle className="h-4 w-4" />
          <span>Nenhum padrão detectado nas {activatedCount} análises ativadas</span>
        </div>
      </div>
    );
  }
  
  if (foundResults.length === 0) return null;

  // Render compact version
  if (compact) {
    return (
      <div className={`
        flex flex-wrap gap-1 p-2 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-300
        ${isMobile ? 'justify-center' : 'justify-start'}
      `}>
        {foundCount < activatedCount && activatedCount > 0 && (
          <div className="text-xs text-gray-700 mr-1 flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1 text-trader-green" />
            <span>{foundCount}/{activatedCount} padrões encontrados</span>
          </div>
        )}
        
        {/* Overall timeframe recommendation */}
        {overallTimeframe && (
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center mr-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>Timeframe: {getTimeframeText(overallTimeframe)}</span>
          </div>
        )}
        
        {foundResults.map(({ type, icon: Icon, label, color }) => {
          const decision = extractDecision(results[type]?.recommendation || "");
          const decisionColor = getDecisionColor(decision);
          const timeframe = results[type]?.timeframeRecommendation;
          
          return (
            <HoverCard key={type}>
              <HoverCardTrigger asChild>
                <button className={cn(
                  "flex items-center space-x-1 px-2 py-1 rounded-full",
                  "bg-white border border-gray-300",
                  decision ? decisionColor : ""
                )}>
                  <Icon className={cn("h-3 w-3", color)} />
                  <span className="text-xs font-medium text-gray-800">{label}</span>
                  {decision && (
                    <span className={cn("text-[10px] font-bold", decisionColor)}>
                      {decision}
                    </span>
                  )}
                  {timeframe && formatTimeframeDisplay(timeframe)}
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 p-3 bg-white border border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-5 w-5", color)} />
                      <h4 className="font-medium text-gray-900">{label}</h4>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-trader-green" />
                  </div>
                  
                  <p className="text-xs text-gray-600">{results[type]?.description}</p>
                  
                  {decision && (
                    <div className={cn(
                      "mt-2 p-2 rounded-sm text-sm font-medium",
                      getDecisionBgColor(decision),
                      decisionColor
                    )}>
                      {decision}
                    </div>
                  )}
                  
                  {timeframe && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-sm text-sm font-medium text-blue-700 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Timeframe recomendado: {getTimeframeText(timeframe)}</span>
                    </div>
                  )}
                  
                  <p className="text-xs text-blue-600 mt-1">
                    {results[type]?.recommendation?.replace(/DECISÃO:\s+(COMPRA|VENDA|AGUARDE|ESPERE|MANTENHA POSIÇÃO|REALIZE LUCROS|PREPARE-SE PARA COMPRA)/i, '')}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    );
  }

  // Render expanded version
  return (
    <div className="space-y-3">      
      <div className={`
        grid gap-2 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-300
        ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}
      `}>
        <div className="col-span-full flex flex-wrap gap-2 items-center justify-between mb-1">
          {foundCount < activatedCount && activatedCount > 0 && (
            <div className="text-xs text-gray-700 flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1 text-trader-green" />
              <span>{foundCount}/{activatedCount} padrões detectados</span>
            </div>
          )}
          
          {/* Overall timeframe recommendation */}
          {overallTimeframe && (
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Timeframe recomendado: {getTimeframeText(overallTimeframe)}</span>
            </div>
          )}
        </div>
        
        {foundResults.map(({ type, icon: Icon, label, color }) => {
          const decision = extractDecision(results[type]?.recommendation || "");
          const decisionColor = getDecisionColor(decision);
          const timeframe = results[type]?.timeframeRecommendation;
          
          return (
            <div 
              key={type} 
              className={cn(
                "flex flex-col p-2 rounded border border-gray-300",
                getDecisionBgColor(decision)
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("h-4 w-4", color)} />
                  <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                </div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="text-gray-500 hover:text-gray-700 transition-colors">
                      <Info size={14} />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72 p-3 bg-white">
                    <p className="text-xs text-gray-700">{results[type]?.description}</p>
                    {results[type]?.majorPlayers && results[type]?.majorPlayers.length > 0 && (
                      <div className="mt-2 text-xs">
                        <h5 className="font-medium text-gray-900">Usado por grandes players:</h5>
                        <ul className="list-disc pl-4 space-y-0.5 mt-1 text-gray-700">
                          {results[type]?.majorPlayers?.map((player, idx) => (
                            <li key={idx}>{player}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </HoverCardContent>
                </HoverCard>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                {decision && (
                  <div className={cn("text-xs font-bold", decisionColor)}>
                    {decision}
                  </div>
                )}
                
                {timeframe && formatTimeframeDisplay(timeframe)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisLabels;
