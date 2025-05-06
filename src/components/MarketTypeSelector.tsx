
import React from "react";
import { useAnalyzer, MarketType } from "@/context/AnalyzerContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const MarketTypeSelector: React.FC = () => {
  const { marketType, setMarketType } = useAnalyzer();
  
  const handleMarketTypeChange = (type: MarketType) => {
    setMarketType(type);
    
    if (type === "otc") {
      toast.info("Modo OTC ativado. Análises ajustadas para padrões de mercado OTC.", {
        description: "Este modo é otimizado para detectar manipulações e reversões típicas de mercados OTC."
      });
    } else {
      toast.info("Modo Regular ativado. Análises ajustadas para padrões de mercado tradicional.", {
        description: "Este modo é otimizado para análises técnicas padrão em mercados regulares."
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
          className={`h-6 ${marketType === "regular" ? 'data-[state=active]:bg-trader-blue' : ''}`}
        >
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Regular</span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="otc"
          className={`h-6 ${marketType === "otc" ? 'data-[state=active]:bg-trader-blue' : ''}`}
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
