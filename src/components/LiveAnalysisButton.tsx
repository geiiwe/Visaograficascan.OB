
import React from 'react';
import { Button } from '@/components/ui/button';
import { Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const LiveAnalysisButton: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleClick = () => {
    if (!user) {
      toast.error('Faça login para usar a análise em tempo real');
      navigate('/auth');
      return;
    }
    
    navigate('/live-analysis');
  };
  
  return (
    <Button 
      onClick={handleClick}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
      size="lg"
    >
      <Activity className="h-5 w-5 mr-2" />
      <Zap className="h-4 w-4 mr-1" />
      Análise Live
    </Button>
  );
};

export default LiveAnalysisButton;
