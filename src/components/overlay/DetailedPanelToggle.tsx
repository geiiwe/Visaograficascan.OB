
import React from "react";

interface DetailedPanelToggleProps {
  showDetailedPanel: boolean;
  toggleDetailedPanel: () => void;
}

const DetailedPanelToggle: React.FC<DetailedPanelToggleProps> = ({ 
  showDetailedPanel, 
  toggleDetailedPanel 
}) => {
  return (
    <button
      onClick={toggleDetailedPanel}
      className="absolute bottom-2 right-2 bg-trader-blue/80 text-white rounded-full p-1.5 shadow-lg z-40 pointer-events-auto"
    >
      {showDetailedPanel ? 
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg> : 
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>}
    </button>
  );
};

export default DetailedPanelToggle;
