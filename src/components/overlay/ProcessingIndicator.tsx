
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, AlertCircle, Brain } from "lucide-react";

interface ProcessingIndicatorProps {
  processingStage: string;
  isError?: boolean;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ processingStage, isError = false }) => {
  const isMobile = useIsMobile();
  
  if (!processingStage) return null;
  
  const isAIStage = processingStage.toLowerCase().includes("ia") || 
                    processingStage.toLowerCase().includes("verific") || 
                    processingStage.toLowerCase().includes("analis");
  
  return (
    <div className={`fixed ${isMobile ? "bottom-16" : "top-6"} left-0 right-0 flex justify-center z-50 pointer-events-none`}>
      <div className={`
        ${isError ? "bg-trader-red/90" : isAIStage ? "bg-blue-900/90" : "bg-black/90"} 
        text-white px-5 py-3 rounded-full text-sm border 
        ${isError ? "border-trader-red" : isAIStage ? "border-blue-400/50" : "border-trader-blue/50"} 
        backdrop-blur-md shadow-lg max-w-[90%] animate-fade-in flex items-center gap-2`}>
        {isError ? (
          <AlertCircle className="h-4 w-4 text-red-300 animate-pulse" />
        ) : isAIStage ? (
          <Brain className="h-4 w-4 text-blue-300 animate-pulse" />
        ) : (
          <Loader2 className="h-4 w-4 text-blue-300 animate-spin" />
        )}
        <p className="text-center font-medium">{processingStage}</p>
      </div>
    </div>
  );
};

export default ProcessingIndicator;
