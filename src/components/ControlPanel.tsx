
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { 
  TrendingUp, 
  Play, 
  Camera, 
  Layers,
  Fingerprint,
  CandlestickChart,
  Eye,
  TrendingDown,
  BarChart,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ControlPanel = () => {
  const { 
    imageData, 
    isAnalyzing, 
    setIsAnalyzing, 
    activeAnalysis, 
    toggleAnalysis,
    setCaptureMode,
    resetAnalysis,
    showVisualMarkers,
    toggleVisualMarkers,
    analysisResults
  } = useAnalyzer();

  const handleAnalyze = () => {
    if (!imageData) {
      toast.error("Capture uma imagem primeiro");
      return;
    }

    if (activeAnalysis.length === 0) {
      toast.error("Selecione pelo menos um tipo de análise");
      return;
    }

    resetAnalysis();
    setIsAnalyzing(true);
    toast.success("Analisando gráfico...");
  };

  const handleRetake = () => {
    resetAnalysis();
    setCaptureMode(true);
  };

  // Count how many analyses have successfully found patterns
  const foundPatternCount = Object.entries(analysisResults)
    .filter(([type, found]) => found && type !== "all")
    .length;

  const analysisOptions = [
    { 
      type: "trendlines" as const, 
      label: "Tendências", 
      icon: <TrendingUp className="h-4 w-4 mr-2" />,
      color: "bg-trader-green",
      description: "Detecta linhas de tendência, suporte e resistência"
    },
    { 
      type: "fibonacci" as const, 
      label: "Fibonacci", 
      icon: <Fingerprint className="h-4 w-4 mr-2" />,
      color: "bg-[#f97316]",
      description: "Identifica retrações e extensões de Fibonacci"
    },
    { 
      type: "candlePatterns" as const, 
      label: "Padrões Candles", 
      icon: <CandlestickChart className="h-4 w-4 mr-2" />,
      color: "bg-[#e11d48]",
      description: "Reconhece padrões de candles japoneses"
    },
    { 
      type: "elliottWaves" as const, 
      label: "Ondas de Elliott", 
      icon: <TrendingDown className="h-4 w-4 mr-2" />,
      color: "bg-[#06b6d4]",
      description: "Identifica padrões de ondas de Elliott"
    },
    { 
      type: "dowTheory" as const, 
      label: "Teoria de Dow", 
      icon: <BarChart className="h-4 w-4 mr-2" />,
      color: "bg-[#d946ef]",
      description: "Analisa o mercado seguindo os princípios de Dow"
    },
    { 
      type: "all" as const, 
      label: "Todos", 
      icon: <Layers className="h-4 w-4 mr-2" />,
      color: "bg-trader-red",
      description: "Ativa todos os tipos de análise simultaneamente"
    }
  ];

  return (
    <div className="p-4 bg-trader-panel rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-trader-gray">Selecione os Tipos de Análise</h3>
            {activeAnalysis.length > 0 && foundPatternCount > 0 && (
              <div className="flex items-center text-xs text-trader-green">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>{foundPatternCount} padrões detectados</span>
              </div>
            )}
          </div>
          
          <TooltipProvider>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {analysisOptions.map(({ type, label, icon, color, description }) => (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "border-trader-gray/20 flex justify-start relative",
                        activeAnalysis.includes(type) && "border-transparent bg-secondary/20",
                        analysisResults[type] && "ring-1 ring-offset-1 ring-trader-blue"
                      )}
                      onClick={() => toggleAnalysis(type)}
                    >
                      <span className={cn(
                        "h-2 w-2 rounded-full mr-2", 
                        activeAnalysis.includes(type) ? color : "bg-trader-gray/30"
                      )} />
                      {icon}
                      {label}
                      {analysisResults[type] && (
                        <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-trader-green"></div>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs max-w-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="markers" 
              checked={showVisualMarkers}
              onCheckedChange={toggleVisualMarkers}
            />
            <label 
              htmlFor="markers" 
              className="text-sm font-medium cursor-pointer flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              Mostrar Marcadores Visuais
            </label>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            className="bg-trader-blue hover:bg-trader-blue/80 text-white flex-1"
            disabled={isAnalyzing || !imageData}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Analisar Gráfico
              </>
            )}
          </Button>
          
          <Button
            onClick={handleRetake}
            variant="outline"
            className="border-trader-gray/20"
            disabled={isAnalyzing}
          >
            <Camera className="mr-2 h-4 w-4" />
            Nova Captura
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
