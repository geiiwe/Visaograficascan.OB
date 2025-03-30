
import React from "react";
import { AnalyzerProvider } from "@/context/AnalyzerContext";
import GraphAnalyzer from "@/components/GraphAnalyzer";
import { BarChart3, Camera, ChartLine } from "lucide-react";

const Index = () => {
  return (
    <AnalyzerProvider>
      <div className="min-h-screen bg-trader-dark">
        <header className="bg-trader-panel py-4 px-6 shadow-md">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <ChartLine className="h-6 w-6 text-trader-blue" />
              <h1 className="text-xl font-bold">Smart Graph Analyzer</h1>
            </div>
            <div className="flex items-center space-x-1 text-trader-gray text-sm">
              <Camera className="h-4 w-4" />
              <span>v1.0</span>
            </div>
          </div>
        </header>

        <main className="py-6">
          <GraphAnalyzer />
        </main>

        <footer className="py-6">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="text-trader-gray text-sm">
              <p className="mb-2">
                Aim your camera at any financial chart to detect patterns and indicators
              </p>
              <div className="flex justify-center space-x-8 mt-4">
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-6 w-6 mb-2 text-trader-blue" />
                  <span className="text-xs">Technical Patterns</span>
                </div>
                <div className="flex flex-col items-center">
                  <ChartLine className="h-6 w-6 mb-2 text-trader-green" />
                  <span className="text-xs">Trend Lines</span>
                </div>
                <div className="flex flex-col items-center">
                  <Camera className="h-6 w-6 mb-2 text-trader-purple" />
                  <span className="text-xs">Real-time Analysis</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AnalyzerProvider>
  );
};

export default Index;
