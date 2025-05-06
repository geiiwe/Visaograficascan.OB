
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
      toast.info("Modo OTC ativado. Análises automaticamente ajustadas para padrões de mercado OTC.", {
        description: "As entradas serão calculadas considerando manipulações e reversões típicas de mercados OTC."
      });
    } else {
      toast.info("Modo Regular ativado. Análises automaticamente ajustadas para padrões de mercado tradicional.", {
        description: "As entradas serão calculadas usando análises técnicas padrão para mercados regulares."
      });
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1.5 text-xs font-medium text-center text-white/80 px-1.5 py-0.5 bg-trader-panel/80 rounded-sm">
        Selecione o tipo de mercado (única configuração necessária)
      </div>
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
              <span className="inline">Regular</span>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="otc"
            className={`h-6 ${marketType === "otc" ? 'data-[state=active]:bg-trader-blue' : ''}`}
          >
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" />
              <span className="inline">OTC</span>
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MarketTypeSelector;
