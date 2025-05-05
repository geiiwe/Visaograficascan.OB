
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
    <div className={`absolute ${isMobile ? "bottom-4" : "top-4"} left-0 right-0 flex justify-center z-50`}>
      <div className={`${isError ? "bg-trader-red/80" : "bg-black/80"} text-white px-4 py-2 rounded-full text-sm border ${isError ? "border-trader-red" : "border-trader-blue/50"} backdrop-blur-md shadow-lg max-w-[90%]`}>
        <p className="text-center truncate">{processingStage}</p>
      </div>
    </div>
  );
};

export default ProcessingIndicator;
