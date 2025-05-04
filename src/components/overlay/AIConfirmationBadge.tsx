
import React from "react";
import { Bot } from "lucide-react";

interface AIConfirmationProps {
  direction: "buy" | "sell" | "neutral";
  confidence: number;
  active: boolean;
  verified: boolean;
}

const AIConfirmationBadge: React.FC<AIConfirmationProps> = ({ 
  direction, 
  confidence, 
  active,
  verified 
}) => {
  if (!active || !verified) return null;
  
  return (
    <div className={`absolute top-14 right-2 z-30 px-3 py-1.5 rounded-full flex items-center shadow-lg backdrop-blur-sm ${
      direction === "buy" ? "bg-trader-green/80 text-white" :
      direction === "sell" ? "bg-trader-red/80 text-white" :
      "bg-gray-600/80 text-white"
    }`}>
      <Bot className="h-4 w-4 mr-2" />
      <span className="font-medium text-sm">
        {direction === "buy" ? "IA confirma COMPRA" :
         direction === "sell" ? "IA confirma VENDA" :
         "IA sem confirmação clara"}
         {" "}
        <span className="text-xs opacity-80">({Math.round(confidence * 100)}% confiança)</span>
      </span>
    </div>
  );
};

export default AIConfirmationBadge;
