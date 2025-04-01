
import React from "react";
import { PatternResult } from "@/utils/patternDetection";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  Fingerprint,
  CandlestickChart,
  TrendingDown,
  BarChart,
  CheckCircle2,
  Info
} from "lucide-react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger 
} from "@/components/ui/hover-card";
import { useMediaQuery } from "@/hooks/use-media-query";

interface AnalysisLabelsProps {
  results: Record<string, PatternResult>;
  compact: boolean;
}

const AnalysisLabels: React.FC<AnalysisLabelsProps> = ({ results, compact }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Extrair decisões das recomendações
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

  const getDecisionBgColor = (decision: string | null): string => {
    if (!decision) return "bg-trader-panel/30";
    
    if (decision.includes("COMPRA")) return "bg-trader-green/10";
    if (decision.includes("VENDA")) return "bg-trader-red/10";
    return "bg-trader-yellow/10";
  };

  const resultItems = [
    {
      type: "trendlines",
      icon: TrendingUp,
      label: "Linhas de Tendência",
      color: "text-trader-green",
      description: "Níveis de suporte e resistência"
    },
    {
      type: "fibonacci",
      icon: Fingerprint,
      label: "Fibonacci",
      color: "text-[#f97316]",
      description: "Níveis de Fibonacci"
    },
    {
      type: "candlePatterns",
      icon: CandlestickChart,
      label: "Padrões de Candles",
      color: "text-[#e11d48]",
      description: "Formações de candles específicas"
    },
    {
      type: "elliottWaves",
      icon: TrendingDown,
      label: "Ondas de Elliott",
      color: "text-[#06b6d4]",
      description: "Padrões de ondas e ciclos"
    },
    {
      type: "dowTheory",
      icon: BarChart,
      label: "Teoria de Dow",
      color: "text-[#d946ef]",
      description: "Análise de tendências"
    }
  ];
  
  // Filtrar apenas resultados encontrados
  const foundResults = resultItems.filter(
    item => results[item.type]?.found
  );
  
  if (foundResults.length === 0) return null;

  // Renderizar versão compacta
  if (compact) {
    return (
      <div className={`
        flex flex-wrap gap-1 p-2 bg-black/60 backdrop-blur-sm rounded-lg border border-trader-panel/30
        ${isMobile ? 'justify-center' : 'justify-start'}
      `}>
        {foundResults.map(({ type, icon: Icon, label, color }) => {
          const decision = extractDecision(results[type]?.recommendation || "");
          const decisionColor = getDecisionColor(decision);
          
          return (
            <HoverCard key={type}>
              <HoverCardTrigger asChild>
                <button className={cn(
                  "flex items-center space-x-1 px-2 py-1 rounded-full",
                  "bg-trader-dark/80 border border-trader-panel/60",
                  decision ? decisionColor : ""
                )}>
                  <Icon className={cn("h-3 w-3", color)} />
                  <span className="text-xs font-medium">{label}</span>
                  {decision && (
                    <span className={cn("text-[10px] font-bold", decisionColor)}>
                      {decision}
                    </span>
                  )}
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-5 w-5", color)} />
                      <h4 className="font-medium">{label}</h4>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-trader-green" />
                  </div>
                  
                  <p className="text-xs text-trader-gray">{results[type]?.description}</p>
                  
                  {decision && (
                    <div className={cn(
                      "mt-2 p-2 rounded-sm text-sm font-medium",
                      getDecisionBgColor(decision),
                      decisionColor
                    )}>
                      {decision}
                    </div>
                  )}
                  
                  <p className="text-xs text-trader-blue mt-1">
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

  // Renderizar versão expandida
  return (
    <div className={`
      grid gap-2 p-3 bg-black/70 backdrop-blur-sm rounded-lg border border-trader-panel/50
      ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}
    `}>
      {foundResults.map(({ type, icon: Icon, label, color }) => {
        const decision = extractDecision(results[type]?.recommendation || "");
        const decisionColor = getDecisionColor(decision);
        
        return (
          <div 
            key={type} 
            className={cn(
              "flex flex-col p-2 rounded border border-trader-panel/50",
              getDecisionBgColor(decision)
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Icon className={cn("h-4 w-4", color)} />
                <h4 className="text-sm font-medium">{label}</h4>
              </div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="text-trader-gray hover:text-white transition-colors">
                    <Info size={14} />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72 p-3">
                  <p className="text-xs">{results[type]?.description}</p>
                  {results[type]?.majorPlayers && results[type]?.majorPlayers.length > 0 && (
                    <div className="mt-2 text-xs">
                      <h5 className="font-medium">Usado por grandes players:</h5>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1">
                        {results[type]?.majorPlayers?.map((player, idx) => (
                          <li key={idx}>{player}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </HoverCardContent>
              </HoverCard>
            </div>
            
            {decision && (
              <div className={cn("text-xs font-bold mt-1", decisionColor)}>
                {decision}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnalysisLabels;
