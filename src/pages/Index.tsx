
import React from "react";
import { AnalyzerProvider } from "@/context/AnalyzerContext";
import GraphAnalyzer from "@/components/GraphAnalyzer";
import { BarChart3, Camera, ChartLine, TrendingUp, LineChart, Activity, BarChart4, Fingerprint, CandlestickChart, TrendingDown, BarChart } from "lucide-react";

const Index = () => {
  return (
    <AnalyzerProvider>
      <div className="min-h-screen bg-trader-dark">
        <header className="bg-trader-panel py-3 px-4 shadow-md">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <ChartLine className="h-6 w-6 text-trader-blue" />
              <h1 className="text-xl font-bold">Analisador Gráfico Inteligente</h1>
            </div>
            <div className="flex items-center space-x-1 text-trader-gray text-sm">
              <Camera className="h-4 w-4" />
              <span>v1.3</span>
            </div>
          </div>
        </header>

        <main className="py-4">
          <GraphAnalyzer />
        </main>

        <footer className="py-4">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="text-trader-gray text-sm">
              <p className="mb-2">
                Aponte sua câmera para qualquer gráfico financeiro para detectar padrões e indicadores utilizados pelos grandes players do mercado
              </p>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mt-4">
                <div className="flex flex-col items-center">
                  <TrendingUp className="h-5 w-5 mb-1 text-trader-green" />
                  <span className="text-xs">Tendências</span>
                </div>
                <div className="flex flex-col items-center">
                  <LineChart className="h-5 w-5 mb-1 text-trader-blue" />
                  <span className="text-xs">Médias Móveis</span>
                </div>
                <div className="flex flex-col items-center">
                  <Activity className="h-5 w-5 mb-1 text-trader-yellow" />
                  <span className="text-xs">RSI</span>
                </div>
                <div className="flex flex-col items-center">
                  <BarChart4 className="h-5 w-5 mb-1 text-trader-purple" />
                  <span className="text-xs">MACD</span>
                </div>
                <div className="flex flex-col items-center">
                  <Fingerprint className="h-5 w-5 mb-1 text-[#f97316]" />
                  <span className="text-xs">Fibonacci</span>
                </div>
                <div className="flex flex-col items-center">
                  <CandlestickChart className="h-5 w-5 mb-1 text-[#e11d48]" />
                  <span className="text-xs">Candles</span>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingDown className="h-5 w-5 mb-1 text-[#06b6d4]" />
                  <span className="text-xs">Elliott</span>
                </div>
                <div className="flex flex-col items-center">
                  <BarChart className="h-5 w-5 mb-1 text-[#d946ef]" />
                  <span className="text-xs">Dow</span>
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
