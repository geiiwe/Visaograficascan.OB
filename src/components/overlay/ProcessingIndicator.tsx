
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProcessingIndicatorProps {
  processingStage: string;
  isError?: boolean;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ processingStage, isError = false }) => {
  const isMobile = useIsMobile();
  
  if (!processingStage) return null;
  
  return (
    <div className={`fixed ${isMobile ? "bottom-16" : "top-6"} left-0 right-0 flex justify-center z-50 pointer-events-none`}>
      <div className={`${isError ? "bg-trader-red/90" : "bg-black/90"} text-white px-5 py-3 rounded-full text-sm border ${isError ? "border-trader-red" : "border-trader-blue/50"} backdrop-blur-md shadow-lg max-w-[90%] animate-fade-in`}>
        <p className="text-center font-medium">{processingStage}</p>
      </div>
    </div>
  );
};

export default ProcessingIndicator;
