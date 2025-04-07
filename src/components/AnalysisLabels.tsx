
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
  Clock,
  Bot,
  BarChart2,
  Activity,
  LineChart,
  Zap
} from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger 
} from "@/components/ui/hover-card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAnalyzer, AnalysisType } from "@/context/AnalyzerContext";
import DirectionIndicator, { MarketDirection, SignalStrength } from "./DirectionIndicator";

// Interface para análises rápidas de M1
interface FastAnalysis {
  type: string;
  found: boolean;
  direction: "up" | "down" | "neutral";
  strength: number;
  name: string;
  description: string;
}

interface AnalysisLabelsProps {
  results: Record<string, PatternResult>;
  compact: boolean;
  specificTimeframe?: string;
  m1Analyses?: FastAnalysis[];
}

const AnalysisLabels: React.FC<AnalysisLabelsProps> = ({ 
  results, 
  compact, 
  specificTimeframe = "1min", 
  m1Analyses = []
}) => {
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

  // Format timeframe display
  const formatTimeframeDisplay = (): JSX.Element => {
    return (
      <span className="flex items-center gap-1 text-blue-700 text-xs">
        <Clock className="h-3 w-3" />
        <span>{specificTimeframe === "1min" ? "1 min" : specificTimeframe}</span>
      </span>
    );
  };

  // Principais estratégias de análise técnica
  const resultItems = [
    {
      type: "trendlines" as AnalysisType,
      icon: TrendingUp,
      label: "Linhas de Tendência",
      color: "text-trader-green",
      description: "Níveis de suporte e resistência",
      m1Effectiveness: 70, // Eficácia estimada para M1
    },
    {
      type: "fibonacci" as AnalysisType,
      icon: Fingerprint,
      label: "Fibonacci",
      color: "text-[#f97316]",
      description: "Níveis de Fibonacci",
      m1Effectiveness: 60,
    },
    {
      type: "candlePatterns" as AnalysisType,
      icon: CandlestickChart,
      label: "Padrões de Candles",
      color: "text-[#e11d48]",
      description: "Formações de candles específicas",
      m1Effectiveness: 85, // Alta eficácia para M1
    },
    {
      type: "elliottWaves" as AnalysisType,
      icon: TrendingDown,
      label: "Ondas de Elliott",
      color: "text-[#06b6d4]",
      description: "Padrões de ondas e ciclos",
      m1Effectiveness: 55,
    },
    {
      type: "dowTheory" as AnalysisType,
      icon: BarChart,
      label: "Teoria de Dow",
      color: "text-[#d946ef]",
      description: "Análise de tendências",
      m1Effectiveness: 50,
    }
  ];
  
  // Mapeamento de ícones para análises rápidas de M1
  const fastAnalysisIcons: Record<string, any> = {
    priceAction: BarChart2,
    momentum: Activity,
    volumeSpikes: LineChart,
    default: Zap
  };
  
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
  const noResultsFound = hasActiveAnalysis && foundResults.length === 0 && m1Analyses.length === 0;
  
  // Get count of activated vs found analyses
  const activatedCount = activeItems.length;
  const foundCount = foundResults.length;
  
  // Calculate overall market direction based on results
  const { direction, strength } = useMemo(() => {
    if (foundCount === 0 && m1Analyses.length === 0) {
      return { direction: "neutral" as MarketDirection, strength: "weak" as SignalStrength };
    }
    
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
    
    // Adiciona pontuação das análises rápidas de M1
    m1Analyses.forEach(analysis => {
      if (!analysis.found) return;
      const factor = analysis.strength / 200; // Convertendo para escala similar
      if (analysis.direction === "up") {
        buyScore += factor;
      } else if (analysis.direction === "down") {
        sellScore += factor;
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
  }, [results, foundCount, m1Analyses]);
  
  // Check if AI confirmation is available
  const hasAiConfirmation = results.all && 
    (results.all.buyScore && results.all.buyScore > 0.5) || 
    (results.all.sellScore && results.all.sellScore > 0.5);
  
  // Render message when no patterns were found
  if (noResultsFound) {
    return (
      <div className="flex items-center justify-center p-3 bg-white/90 rounded-lg border border-gray-300">
        <div className="flex items-center gap-2 text-gray-600">
          <AlertCircle className="h-4 w-4" />
          <span>Nenhum padrão detectado nas {activatedCount} análises ativadas</span>
        </div>
      </div>
    );
  }
  
  if (foundResults.length === 0 && m1Analyses.length === 0) return null;

  // Render compact version
  if (compact) {
    return (
      <div className={`
        flex flex-wrap gap-1 p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300
        ${isMobile ? 'justify-center' : 'justify-start'}
      `}>
        {foundCount < activatedCount && activatedCount > 0 && (
          <div className="text-xs text-gray-700 mr-1 flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1 text-trader-green" />
            <span>{foundCount}/{activatedCount} padrões encontrados</span>
          </div>
        )}
        
        {/* AI confirmation badge with better styling */}
        {hasAiConfirmation && (
          <div className={`
            text-xs px-2 py-1 rounded-full flex items-center mr-1
            ${results.all && results.all.buyScore && results.all.buyScore > results.all.sellScore ? 
              "bg-trader-green text-white" : 
              "bg-trader-red text-white"}
          `}>
            <Bot className="h-3 w-3 mr-1" />
            <span>IA {results.all && results.all.buyScore && results.all.buyScore > results.all.sellScore ? 
              "confirma COMPRA" : "confirma VENDA"}</span>
          </div>
        )}
        
        {/* Improved timeframe display */}
        <div className="text-xs bg-blue-600 text-white font-medium px-2 py-1 rounded-full flex items-center mr-1">
          <Clock className="h-3 w-3 mr-1" />
          <span>M1</span>
        </div>
        
        {/* M1 Fast Analyses */}
        {m1Analyses.map(analysis => {
          const Icon = fastAnalysisIcons[analysis.type] || fastAnalysisIcons.default;
          
          return (
            <HoverCard key={`m1-${analysis.type}`}>
              <HoverCardTrigger asChild>
                <button className={`
                  flex items-center space-x-1 px-2 py-1 rounded-full
                  ${analysis.direction === "up" ? "bg-trader-green/20 text-trader-green" : 
                    analysis.direction === "down" ? "bg-trader-red/20 text-trader-red" : 
                    "bg-gray-200 text-gray-700"}
                  border border-gray-300
                `}>
                  <Icon className="h-3 w-3" />
                  <span className="text-xs font-medium">{analysis.name}</span>
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 p-3 bg-white border border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <h4 className="font-medium text-gray-900">{analysis.name}</h4>
                    </div>
                    <div className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${analysis.direction === "up" ? "bg-trader-green/20 text-trader-green" : 
                        analysis.direction === "down" ? "bg-trader-red/20 text-trader-red" : 
                        "bg-gray-100 text-gray-700"}
                    `}>
                      {analysis.direction === "up" ? "ALTA" : 
                       analysis.direction === "down" ? "BAIXA" : "NEUTRO"}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600">{analysis.description}</p>
                  
                  <div className="mt-1">
                    <div className="text-xs text-gray-500">Força do sinal:</div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                      <div 
                        className={`h-full rounded-full ${
                          analysis.direction === "up" ? "bg-trader-green" : 
                          analysis.direction === "down" ? "bg-trader-red" : "bg-gray-400"
                        }`}
                        style={{ width: `${Math.min(analysis.strength, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 p-2 bg-blue-50 rounded-sm text-sm font-medium text-blue-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Ideal para timeframe de 1 minuto</span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
        
        {/* Traditional analyses */}
        {foundResults.map(({ type, icon: Icon, label, color, m1Effectiveness }) => {
          const decision = extractDecision(results[type]?.recommendation || "");
          const decisionColor = getDecisionColor(decision);
          
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
                  {formatTimeframeDisplay()}
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
                  
                  {/* M1 Effectiveness Indicator */}
                  <div className="mt-1">
                    <div className="text-xs text-gray-500">Eficácia para M1:</div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                      <div 
                        className={`h-full rounded-full ${
                          m1Effectiveness >= 80 ? "bg-trader-green" : 
                          m1Effectiveness >= 60 ? "bg-trader-yellow" : 
                          "bg-trader-red/70"
                        }`}
                        style={{ width: `${m1Effectiveness}%` }}
                      />
                    </div>
                    <div className="text-xs text-right mt-0.5">
                      {m1Effectiveness >= 80 ? "Alta" : 
                       m1Effectiveness >= 60 ? "Média" : 
                       "Limitada"}
                    </div>
                  </div>
                  
                  {decision && (
                    <div className={cn(
                      "mt-2 p-2 rounded-sm text-sm font-medium",
                      getDecisionBgColor(decision),
                      decisionColor
                    )}>
                      {decision}
                    </div>
                  )}
                  
                  <div className="mt-2 p-2 bg-blue-50 rounded-sm text-sm font-medium text-blue-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Timeframe recomendado: 1 minuto</span>
                  </div>
                  
                  <p className="text-xs text-blue-600 mt-1">
                    {results[type]?.recommendation?.replace(/DECISÃO:\s+(COMPRA|VENDA|AGUARDE|ESPERE|MANTENHA POSIÇÃO|REALIZE LUCROS|PREPARE-SE PARA COMPRA)/i, '')}
                  </p>
                  
                  {results[type]?.majorPlayers && results[type]?.majorPlayers.length > 0 && (
                    <div className="mt-1 text-xs">
                      <h5 className="font-medium text-gray-700">Usado por grandes players:</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {results[type]?.majorPlayers?.map((player, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-1 rounded text-[10px]">
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    );
  }

  // Render expanded version with improved organization
  return (
    <div className="space-y-3">      
      <div className={`
        grid gap-2 p-3 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300
        ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}
      `}>
        <div className="col-span-full flex flex-wrap gap-2 items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {foundCount < activatedCount && activatedCount > 0 && (
              <div className="text-xs text-gray-700 flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1 text-trader-green" />
                <span>{foundCount}/{activatedCount} padrões</span>
              </div>
            )}
            
            {/* Enhanced timeframe badge */}
            <div className="text-xs bg-blue-600 text-white font-semibold px-2 py-1 rounded-full flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>M1</span>
            </div>
          </div>
          
          {/* AI confirmation badge with improved style */}
          {hasAiConfirmation && (
            <div className={`
              text-xs px-2 py-1 rounded-full flex items-center
              ${results.all && results.all.buyScore && results.all.buyScore > results.all.sellScore ? 
                "bg-trader-green text-white" : 
                "bg-trader-red text-white"}
            `}>
              <Bot className="h-3 w-3 mr-1" />
              <span>IA {results.all && results.all.buyScore && results.all.buyScore > results.all.sellScore ? 
                "confirma COMPRA" : "confirma VENDA"}</span>
            </div>
          )}
        </div>
        
        {/* M1-specific analyses section */}
        {m1Analyses.length > 0 && (
          <div className="col-span-full mb-1">
            <h3 className="text-xs font-medium text-gray-500 mb-1.5">Análises específicas para 1 minuto:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {m1Analyses.map(analysis => {
                const Icon = fastAnalysisIcons[analysis.type] || fastAnalysisIcons.default;
                
                return (
                  <div 
                    key={`m1-${analysis.type}`}
                    className={`
                      p-2 rounded border flex flex-col justify-between
                      ${analysis.direction === "up" ? "bg-trader-green/10 border-trader-green/30" :
                        analysis.direction === "down" ? "bg-trader-red/10 border-trader-red/30" :
                        "bg-gray-100 border-gray-200"}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Icon className={`h-4 w-4 ${
                          analysis.direction === "up" ? "text-trader-green" :
                          analysis.direction === "down" ? "text-trader-red" :
                          "text-gray-500"
                        }`} />
                        <span className="text-xs font-medium text-gray-900">{analysis.name}</span>
                      </div>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="text-gray-500 hover:text-gray-700">
                            <Info size={12} />
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-72 p-3">
                          <p className="text-xs">{analysis.description}</p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className={`text-xs font-medium ${
                        analysis.direction === "up" ? "text-trader-green" :
                        analysis.direction === "down" ? "text-trader-red" :
                        "text-gray-600"
                      }`}>
                        {analysis.direction === "up" ? "COMPRA" :
                         analysis.direction === "down" ? "VENDA" :
                         "NEUTRO"}
                      </span>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-0.5 text-blue-600" />
                        <span className="text-[10px] text-blue-700">1min</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Traditional technical analyses */}
        {foundResults.length > 0 && (
          <div className="col-span-full">
            <h3 className="text-xs font-medium text-gray-500 mb-1.5">Padrões técnicos detectados:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {foundResults.map(({ type, icon: Icon, label, color, m1Effectiveness }) => {
                const decision = extractDecision(results[type]?.recommendation || "");
                const decisionColor = getDecisionColor(decision);
                
                return (
                  <div 
                    key={type} 
                    className={cn(
                      "flex flex-col p-2 rounded border",
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
                          
                          {/* M1 Effectiveness Indicator */}
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700">
                              Eficácia para timeframe de 1 minuto:
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                              <div 
                                className={`h-full rounded-full ${
                                  m1Effectiveness >= 80 ? "bg-trader-green" : 
                                  m1Effectiveness >= 60 ? "bg-trader-yellow" : 
                                  "bg-trader-red/70"
                                }`}
                                style={{ width: `${m1Effectiveness}%` }}
                              />
                            </div>
                            <div className="text-xs text-right mt-0.5">
                              {m1Effectiveness >= 80 ? "Altamente eficaz" : 
                              m1Effectiveness >= 60 ? "Moderadamente eficaz" : 
                              "Eficácia limitada"}
                            </div>
                          </div>
                          
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
                      
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span className="text-blue-700">1min</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisLabels;
