
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
      toast.info("Modo OTC ativado. Análise automática em progresso...", {
        description: "A entrada será calculada considerando manipulações típicas de mercados OTC."
      });
    } else {
      toast.info("Modo Regular ativado. Análise automática em progresso...", {
        description: "A entrada será calculada usando análise técnica padrão."
      });
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-sm font-medium text-center text-white/90 px-2.5 py-1.5 bg-trader-panel/90 rounded-md">
        <span className="animate-pulse">⚠️</span> Selecione apenas o tipo de mercado <span className="animate-pulse">⚠️</span>
      </div>
      <Tabs 
        value={marketType} 
        onValueChange={(value) => handleMarketTypeChange(value as MarketType)}
        className="bg-trader-panel/80 rounded-md px-1.5 py-1 border-2 border-trader-blue/50"
      >
        <TabsList className="h-9 bg-transparent">
          <TabsTrigger 
            value="regular" 
            className={`h-7 ${marketType === "regular" ? 'data-[state=active]:bg-trader-blue' : ''}`}
          >
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5" />
              <span className="inline font-medium">REGULAR</span>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="otc"
            className={`h-7 ${marketType === "otc" ? 'data-[state=active]:bg-trader-blue' : ''}`}
          >
            <span className="flex items-center gap-1.5">
              <TrendingDown className="h-4.5 w-4.5" />
              <span className="inline font-medium">OTC</span>
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MarketTypeSelector;
