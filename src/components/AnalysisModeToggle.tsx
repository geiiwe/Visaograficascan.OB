
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AnalysisMode = 'photo' | 'live';

interface AnalysisModeToggleProps {
  mode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  isAnalyzing?: boolean;
  className?: string;
}

const AnalysisModeToggle: React.FC<AnalysisModeToggleProps> = ({
  mode,
  onModeChange,
  isAnalyzing = false,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex bg-trader-panel/60 rounded-lg p-1">
        <Button
          variant={mode === 'photo' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange('photo')}
          disabled={isAnalyzing}
          className={cn(
            "h-8 px-3 flex items-center gap-2 transition-all",
            mode === 'photo' 
              ? 'bg-trader-blue text-white' 
              : 'text-trader-gray hover:text-white hover:bg-trader-panel/50'
          )}
        >
          <Camera className="h-4 w-4" />
          <span>Foto</span>
        </Button>
        
        <Button
          variant={mode === 'live' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange('live')}
          disabled={isAnalyzing}
          className={cn(
            "h-8 px-3 flex items-center gap-2 transition-all",
            mode === 'live' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
              : 'text-trader-gray hover:text-white hover:bg-trader-panel/50'
          )}
        >
          <Activity className="h-4 w-4" />
          <Zap className="h-3 w-3" />
          <span>Live</span>
        </Button>
      </div>
      
      {mode === 'live' && (
        <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-400">
          Tempo Real
        </Badge>
      )}
    </div>
  );
};

export default AnalysisModeToggle;
