
import React from "react";
import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import { MarketType } from "@/context/AnalyzerContext";

interface MarketTypeIndicatorProps {
  marketType: MarketType;
}

const MarketTypeIndicator: React.FC<MarketTypeIndicatorProps> = ({ marketType }) => {
  return (
    <div className="absolute top-2 left-2 z-30 bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center shadow-lg">
      {marketType === "otc" ? (
        <>
          <CircleArrowDown className="h-4 w-4 mr-2" />
          <span className="font-medium text-sm">Mercado OTC</span>
        </>
      ) : (
        <>
          <CircleArrowUp className="h-4 w-4 mr-2" />
          <span className="font-medium text-sm">Mercado Regular</span>
        </>
      )}
    </div>
  );
};

export default MarketTypeIndicator;
