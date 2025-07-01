
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAnalyzer } from '@/context/AnalyzerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  Square, 
  Camera, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Activity,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { detectPatterns } from '@/utils/patternDetection';
import { useSupabaseAnalysis } from '@/hooks/useSupabaseAnalysis';

interface LiveSignal {
  id: string;
  timestamp: Date;
  signal: 'BUY' | 'SELL' | 'WAIT';
  confidence: number;
  patterns: string[];
  reasoning: string;
  validity: number; // segundos
}

interface AnalysisStats {
  totalAnalyses: number;
  buySignals: number;
  sellSignals: number;
  waitSignals: number;
  averageConfidence: number;
  lastAnalysis: Date | null;
}

const LiveAnalysis: React.FC = () => {
  const { 
    selectedTimeframe, 
    marketType, 
    precision,
    activeAnalysis 
  } = useAnalyzer();
  
  const { saveAnalysis } = useSupabaseAnalysis();
  
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSignal, setCurrentSignal] = useState<LiveSignal | null>(null);
  const [signalHistory, setSignalHistory] = useState<LiveSignal[]>([]);
  const [analysisStats, setAnalysisStats] = useState<AnalysisStats>({
    totalAnalyses: 0,
    buySignals: 0,
    sellSignals: 0,
    waitSignals: 0,
    averageConfidence: 0,
    lastAnalysis: null
  });
  
  const [captureProgress, setCaptureProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Configurações do modo live
  const ANALYSIS_INTERVAL = selectedTimeframe === '30s' ? 30000 : 60000; // 30s ou 1min
  const CAPTURE_INTERVAL = 1000; // Captura a cada 1 segundo para progress
  const MAX_HISTORY = 20; // Máximo de sinais no histórico
  
  // Inicializar câmera
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      toast.success('Câmera iniciada para análise em tempo real');
    } catch (error) {
      console.error('Erro ao inicializar câmera:', error);
      toast.error('Erro ao acessar câmera');
    }
  }, []);
  
  // Capturar imagem da câmera
  const captureCurrentFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/png');
  }, []);
  
  // Análise em tempo real
  const performLiveAnalysis = useCallback(async () => {
    if (isPaused || !isLiveMode) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      const imageData = captureCurrentFrame();
      if (!imageData) {
        toast.error('Erro ao capturar imagem');
        return;
      }
      
      // Simular progresso da análise
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 20, 90));
      }, 200);
      
      // Executar análise usando sistema existente - Fixed: provide all required parameters
      const results = await detectPatterns(imageData, selectedTimeframe, marketType, precision === 'alta' ? 5 : 3);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Processar resultados
      const signal = generateSignalFromResults(results);
      
      // Salvar análise no Supabase - Fixed: use correct property name
      await saveAnalysis({
        analysis_type: 'live',
        image_data: imageData,
        results,
        timeframe: selectedTimeframe,
        marketType,
        precision: precision === 'alta' ? 5 : precision === 'normal' ? 3 : 1,
        confidenceScore: signal.confidence,
        aiDecision: {
          action: signal.signal,
          confidence: signal.confidence,
          reasoning: signal.reasoning,
          timestamp: new Date().toISOString()
        }
      });
      
      // Atualizar estado
      setCurrentSignal(signal);
      setSignalHistory(prev => [signal, ...prev].slice(0, MAX_HISTORY));
      
      // Atualizar estatísticas
      updateAnalysisStats(signal);
      
      toast.success(`Sinal gerado: ${signal.signal} (${signal.confidence}%)`);
      
    } catch (error) {
      console.error('Erro na análise em tempo real:', error);
      toast.error('Erro durante análise');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [
    isPaused, 
    isLiveMode, 
    captureCurrentFrame, 
    selectedTimeframe, 
    marketType, 
    precision, 
    activeAnalysis,
    saveAnalysis
  ]);
  
  // Gerar sinal baseado nos resultados
  const generateSignalFromResults = (results: any): LiveSignal => {
    const patterns = Object.keys(results).filter(key => results[key]?.found);
    
    let signal: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
    let confidence = 50;
    let reasoning = 'Análise inconclusiva';
    
    // Lógica de decisão baseada nos padrões encontrados
    const buyScore = patterns.reduce((sum, pattern) => {
      return sum + (results[pattern]?.buyScore || 0);
    }, 0);
    
    const sellScore = patterns.reduce((sum, pattern) => {
      return sum + (results[pattern]?.sellScore || 0);
    }, 0);
    
    const totalScore = buyScore + sellScore;
    
    if (totalScore > 0) {
      if (buyScore > sellScore * 1.3) {
        signal = 'BUY';
        confidence = Math.min(95, Math.round((buyScore / totalScore) * 100));
        reasoning = `Confluência de padrões bullish: ${patterns.join(', ')}`;
      } else if (sellScore > buyScore * 1.3) {
        signal = 'SELL';
        confidence = Math.min(95, Math.round((sellScore / totalScore) * 100));
        reasoning = `Confluência de padrões bearish: ${patterns.join(', ')}`;
      } else {
        signal = 'WAIT';
        confidence = 60;
        reasoning = 'Sinais conflitantes, aguardar confirmação';
      }
    }
    
    // Ajustar confiança por número de padrões
    if (patterns.length >= 3) confidence += 10;
    if (patterns.length >= 5) confidence += 5;
    
    return {
      id: `signal_${Date.now()}`,
      timestamp: new Date(),
      signal,
      confidence: Math.min(98, confidence),
      patterns,
      reasoning,
      validity: selectedTimeframe === '30s' ? 30 : 60
    };
  };
  
  // Atualizar estatísticas
  const updateAnalysisStats = (signal: LiveSignal) => {
    setAnalysisStats(prev => {
      const newStats = {
        totalAnalyses: prev.totalAnalyses + 1,
        buySignals: prev.buySignals + (signal.signal === 'BUY' ? 1 : 0),
        sellSignals: prev.sellSignals + (signal.signal === 'SELL' ? 1 : 0),
        waitSignals: prev.waitSignals + (signal.signal === 'WAIT' ? 1 : 0),
        averageConfidence: 0,
        lastAnalysis: signal.timestamp
      };
      
      // Calcular média de confiança
      const allSignals = [...signalHistory, signal];
      newStats.averageConfidence = Math.round(
        allSignals.reduce((sum, s) => sum + s.confidence, 0) / allSignals.length
      );
      
      return newStats;
    });
  };
  
  // Iniciar modo live
  const startLiveMode = async () => {
    await initializeCamera();
    setIsLiveMode(true);
    setIsPaused(false);
    
    // Iniciar análise periódica
    intervalRef.current = setInterval(() => {
      performLiveAnalysis();
    }, ANALYSIS_INTERVAL);
    
    // Iniciar progresso de captura
    const captureInterval = setInterval(() => {
      if (!isPaused) {
        setCaptureProgress(prev => {
          const newProgress = (prev + (CAPTURE_INTERVAL / ANALYSIS_INTERVAL) * 100) % 100;
          return newProgress;
        });
      }
    }, CAPTURE_INTERVAL);
    
    toast.success('Modo de análise em tempo real iniciado');
  };
  
  // Parar modo live
  const stopLiveMode = () => {
    setIsLiveMode(false);
    setIsPaused(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Parar câmera
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    setCaptureProgress(0);
    toast.info('Modo de análise em tempo real parado');
  };
  
  // Pausar/Retomar
  const togglePause = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Análise retomada' : 'Análise pausada');
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-400" />
            Análise em Tempo Real
          </h2>
          <p className="text-gray-400">
            Análise contínua de gráficos usando {selectedTimeframe} • {marketType.toUpperCase()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isLiveMode ? (
            <Button onClick={startLiveMode} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Iniciar Live
            </Button>
          ) : (
            <>
              <Button 
                onClick={togglePause} 
                variant={isPaused ? "default" : "secondary"}
              >
                {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                {isPaused ? 'Retomar' : 'Pausar'}
              </Button>
              <Button onClick={stopLiveMode} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Parar
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Video Feed */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Feed da Câmera
            {isLiveMode && (
              <Badge variant={isPaused ? "secondary" : "default"} className="ml-2">
                {isPaused ? 'PAUSADO' : 'AO VIVO'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay de progresso */}
            {isLiveMode && (
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="bg-black/70 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-white text-sm mb-2">
                    <span>Próxima análise em:</span>
                    <span>{Math.round((100 - captureProgress) * ANALYSIS_INTERVAL / 100 / 1000)}s</span>
                  </div>
                  <Progress value={captureProgress} className="h-2" />
                </div>
                
                {isAnalyzing && (
                  <div className="bg-blue-900/70 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-white text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4 animate-pulse" />
                        Analisando...
                      </span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sinal Atual */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Sinal Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentSignal ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Badge 
                    className={cn(
                      "text-lg px-4 py-2",
                      currentSignal.signal === 'BUY' ? "bg-green-600" :
                      currentSignal.signal === 'SELL' ? "bg-red-600" :
                      "bg-yellow-600"
                    )}
                  >
                    {currentSignal.signal === 'BUY' ? (
                      <TrendingUp className="h-5 w-5 mr-2" />
                    ) : currentSignal.signal === 'SELL' ? (
                      <TrendingDown className="h-5 w-5 mr-2" />
                    ) : (
                      <Clock className="h-5 w-5 mr-2" />
                    )}
                    {currentSignal.signal}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {currentSignal.confidence}%
                  </div>
                  <div className="text-sm text-gray-400">Confiança</div>
                </div>
                
                <div className="text-sm text-gray-300">
                  <div className="font-semibold mb-1">Padrões:</div>
                  <div className="flex flex-wrap gap-1">
                    {currentSignal.patterns.map(pattern => (
                      <Badge key={pattern} variant="outline" className="text-xs">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-gray-400">
                  {currentSignal.reasoning}
                </div>
                
                <div className="text-xs text-gray-500">
                  {currentSignal.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aguardando primeira análise...</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Estatísticas */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas da Sessão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analysisStats.totalAnalyses}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analysisStats.averageConfidence}%</div>
                <div className="text-sm text-gray-400">Confiança Média</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-400">BUY</span>
                <span className="text-white">{analysisStats.buySignals}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-400">SELL</span>
                <span className="text-white">{analysisStats.sellSignals}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-400">WAIT</span>
                <span className="text-white">{analysisStats.waitSignals}</span>
              </div>
            </div>
            
            {analysisStats.lastAnalysis && (
              <div className="text-xs text-gray-500 text-center border-t pt-2">
                Última: {analysisStats.lastAnalysis.toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Histórico */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Histórico de Sinais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {signalHistory.map(signal => (
                <div 
                  key={signal.id}
                  className="flex items-center justify-between p-2 rounded bg-gray-800 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={cn(
                        "text-xs px-2 py-1",
                        signal.signal === 'BUY' ? "bg-green-600" :
                        signal.signal === 'SELL' ? "bg-red-600" :
                        "bg-yellow-600"
                      )}
                    >
                      {signal.signal}
                    </Badge>
                    <span className="text-white">{signal.confidence}%</span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {signal.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
              
              {signalHistory.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  <p>Nenhum sinal gerado ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveAnalysis;
