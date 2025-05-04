
import React from "react";

interface ProcessingIndicatorProps {
  processingStage: string;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ processingStage }) => {
  if (!processingStage) return null;
  
  return (
    <div className="absolute top-4 left-0 right-0 flex justify-center">
      <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm border border-trader-blue/50 backdrop-blur-md shadow-lg">
        {processingStage}
      </div>
    </div>
  );
};

export default ProcessingIndicator;
