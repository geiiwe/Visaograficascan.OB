
import React from "react";
import { Button } from "@/components/ui/button";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { 
  TrendingUp, 
  LineChart, 
  BarChart4, 
  Activity, 
  Play, 
  Camera, 
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ControlPanel = () => {
  const { 
    imageData, 
    isAnalyzing, 
    setIsAnalyzing, 
    activeAnalysis, 
    toggleAnalysis,
    setCaptureMode,
    resetAnalysis
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

  const analysisOptions = [
    { 
      type: "trendlines" as const, 
      label: "Tendências", 
      icon: <TrendingUp className="h-4 w-4 mr-2" />,
      color: "bg-trader-green" 
    },
    { 
      type: "movingAverages" as const, 
      label: "Médias Móveis", 
      icon: <LineChart className="h-4 w-4 mr-2" />,
      color: "bg-trader-blue" 
    },
    { 
      type: "rsi" as const, 
      label: "RSI", 
      icon: <Activity className="h-4 w-4 mr-2" />,
      color: "bg-trader-yellow" 
    },
    { 
      type: "macd" as const, 
      label: "MACD", 
      icon: <BarChart4 className="h-4 w-4 mr-2" />,
      color: "bg-trader-purple" 
    },
    { 
      type: "all" as const, 
      label: "Todos", 
      icon: <Layers className="h-4 w-4 mr-2" />,
      color: "bg-trader-red" 
    }
  ];

  return (
    <div className="p-4 bg-trader-panel rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 text-trader-gray">Selecione os Tipos de Análise</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {analysisOptions.map(({ type, label, icon, color }) => (
              <Button
                key={type}
                variant="outline"
                className={cn(
                  "border-trader-gray/20 flex justify-start",
                  activeAnalysis.includes(type) && "border-transparent bg-secondary/20" 
                )}
                onClick={() => toggleAnalysis(type)}
              >
                <span className={cn(
                  "h-2 w-2 rounded-full mr-2", 
                  activeAnalysis.includes(type) ? color : "bg-trader-gray/30"
                )} />
                {icon}
                {label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            className="bg-trader-blue hover:bg-trader-blue/80 text-white flex-1"
            disabled={isAnalyzing || !imageData}
          >
            <Play className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analisando..." : "Analisar Gráfico"}
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
