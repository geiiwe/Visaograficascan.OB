
import React, { useEffect } from "react";
import { useAnalyzer } from "@/context/AnalyzerContext";
import { detectPatterns } from "@/utils/patternDetection";
import { prepareForAnalysis } from "@/utils/imageProcessing";
import { 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  LineChart, 
  Activity, 
  BarChart4
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ResultsOverlay = () => {
  const { 
    imageData, 
    isAnalyzing, 
    setIsAnalyzing, 
    activeAnalysis, 
    analysisResults,
    setAnalysisResult
  } = useAnalyzer();

  useEffect(() => {
    const runAnalysis = async () => {
      if (isAnalyzing && imageData) {
        try {
          // Process the image first
          const processedImage = await prepareForAnalysis(imageData);
          
          // Run the pattern detection
          const results = await detectPatterns(processedImage, activeAnalysis);
          
          // Update the analysis results in the context
          Object.entries(results).forEach(([type, found]) => {
            setAnalysisResult(type as any, found);
          });
          
          // Notify the user about the results
          if (results.all) {
            toast.success("Analysis complete! Multiple patterns detected.");
          } else if (Object.values(results).some(Boolean)) {
            toast.success("Analysis complete! Some patterns detected.");
          } else {
            toast.info("Analysis complete. No clear patterns detected.");
          }
          
        } catch (error) {
          console.error("Analysis error:", error);
          toast.error("Error during analysis. Please try again.");
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    runAnalysis();
  }, [imageData, isAnalyzing, activeAnalysis, setAnalysisResult, setIsAnalyzing]);

  if (!imageData || !activeAnalysis.some(type => analysisResults[type])) {
    return null;
  }

  const resultItems = [
    {
      type: "trendlines",
      icon: TrendingUp,
      label: "Trend Lines",
      color: "text-trader-green",
      description: "Support and resistance levels detected"
    },
    {
      type: "movingAverages",
      icon: LineChart,
      label: "Moving Averages",
      color: "text-trader-blue",
      description: "SMA and EMA patterns found"
    },
    {
      type: "rsi",
      icon: Activity,
      label: "RSI",
      color: "text-trader-yellow",
      description: "Overbought/oversold conditions identified"
    },
    {
      type: "macd",
      icon: BarChart4,
      label: "MACD",
      color: "text-trader-purple",
      description: "Signal line crossovers detected"
    }
  ];

  return (
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
      <div className="bg-trader-dark/90 rounded-lg border border-trader-panel p-4 backdrop-blur-sm">
        <h3 className="font-semibold text-lg mb-4">Analysis Results</h3>
        
        <div className="space-y-3">
          {resultItems.map(({ type, icon: Icon, label, color, description }) => {
            // Only show results for active analysis types that have results
            if (!activeAnalysis.includes(type as any) || !analysisResults[type as any]) {
              return null;
            }
            
            return (
              <div key={type} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Icon className={cn("h-5 w-5", color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium">{label}</span>
                    <CheckCircle2 className="h-4 w-4 text-trader-green ml-2" />
                  </div>
                  <p className="text-sm text-trader-gray">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultsOverlay;
