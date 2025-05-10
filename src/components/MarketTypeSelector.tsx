
import React from "react";
import { useAnalyzer, MarketType } from "@/context/AnalyzerContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const MarketTypeSelector: React.FC = () => {
  const { marketType, setMarketType, isAnalyzing } = useAnalyzer();
  
  const handleMarketTypeChange = (type: MarketType) => {
    if (isAnalyzing) {
      toast.warning("Aguarde a análise atual ser concluída antes de mudar o tipo de mercado.");
      return;
    }
    
    setMarketType(type);
    
    if (type === "otc") {
      toast.info("Modo OTC ativado. Sistema otimizado para detectar manipulações de mercado.", {
        description: "Algoritmos adaptados para maior assertividade em mercados OTC."
      });
    } else {
      toast.info("Modo Regular ativado. Sistema otimizado para mercados tradicionais.", {
        description: "Algoritmos calibrados para maior precisão em mercados regulares."
      });
    }
  };
  
  return (
    <Tabs 
      value={marketType} 
      onValueChange={(value) => handleMarketTypeChange(value as MarketType)}
      className="bg-trader-panel/60 rounded-md px-1"
    >
      <TabsList className="h-7 bg-transparent">
        <TabsTrigger 
          value="regular" 
          className={`h-6 ${marketType === "regular" ? 'data-[state=active]:bg-trader-blue border-b-2 border-blue-400' : ''}`}
          disabled={isAnalyzing}
        >
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Regular</span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="otc"
          className={`h-6 ${marketType === "otc" ? 'data-[state=active]:bg-trader-blue border-b-2 border-purple-400' : ''}`}
          disabled={isAnalyzing}
        >
          <span className="flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">OTC</span>
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default MarketTypeSelector;
