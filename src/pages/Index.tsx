import React from "react";
import { AnalyzerProvider } from "@/context/AnalyzerContext";
import GraphAnalyzer from "@/components/GraphAnalyzer";
import DisclaimerAlert from "@/components/DisclaimerAlert";
import AuthButton from "@/components/AuthButton";
import { BarChart3, Camera, ChartLine, TrendingUp, LineChart, Activity, BarChart4, Fingerprint, CandlestickChart, TrendingDown, BarChart, ShieldCheck, Star, Award, Clock, BookOpen, AlertTriangle, HelpCircle } from "lucide-react";

const Index = () => {
  return (
    <AnalyzerProvider>
      <div className="min-h-screen bg-trader-dark">
        <header className="bg-trader-panel/90 backdrop-blur-sm py-3 px-4 shadow-md border-b border-trader-blue/20">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <ChartLine className="h-6 w-6 text-trader-blue" />
              <h1 className="text-xl font-bold">Analisador Gráfico Inteligente</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-trader-gray text-sm">
                <Camera className="h-4 w-4" />
                <span>v1.5</span>
                <span className="ml-2 bg-trader-blue/20 text-trader-blue text-xs px-2 py-0.5 rounded-full">PRO</span>
              </div>
              <AuthButton />
            </div>
          </div>
        </header>

        <main className="py-4">
          <GraphAnalyzer />
          <DisclaimerAlert showOnStartup={true} />
          
          {/* Educational Tooltip Section com transparência melhorada */}
          <div className="max-w-4xl mx-auto px-4 mt-4">
            <div className="bg-trader-panel/80 backdrop-blur-sm rounded-lg p-4 border-l-4 border-trader-blue shadow-md">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-trader-blue mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white mb-1">Dicas de Uso</h3>
                  <p className="text-xs text-trader-gray">
                    Esta ferramenta analisa imagens de gráficos financeiros para identificar padrões técnicos. 
                    Para melhores resultados, capture apenas a região com o gráfico de preços. 
                    Os resultados são aproximações baseadas em análise de imagem e devem ser usados como 
                    complemento, não como única fonte para decisões de investimento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-4 mt-4">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-trader-gray text-sm">
              <p className="mb-2 text-center">
                Aponte sua câmera para qualquer gráfico financeiro para detectar padrões e indicadores utilizados pelos grandes players do mercado
              </p>
              
              {/* Cards melhorados com transparência */}
              <div className="grid grid-cols-3 gap-3 my-6">
                <div className="flex flex-col items-center justify-center bg-trader-panel/70 backdrop-blur-sm p-4 rounded-lg border border-trader-blue/10 shadow-md">
                  <ShieldCheck className="h-7 w-7 mb-2 text-trader-blue" />
                  <h3 className="font-medium text-white">Análise Segura</h3>
                  <p className="text-xs text-trader-gray mt-1">Tecnologia confiável para traders profissionais</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-trader-panel/70 backdrop-blur-sm p-4 rounded-lg border border-trader-green/10 shadow-md">
                  <Award className="h-7 w-7 mb-2 text-trader-green" />
                  <h3 className="font-medium text-white">85% de Precisão</h3>
                  <p className="text-xs text-trader-gray mt-1">Algoritmos avançados testados por especialistas</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-trader-panel/70 backdrop-blur-sm p-4 rounded-lg border border-trader-yellow/10 shadow-md">
                  <Clock className="h-7 w-7 mb-2 text-trader-yellow" />
                  <h3 className="font-medium text-white">Análise em Tempo Real</h3>
                  <p className="text-xs text-trader-gray mt-1">Resultados instantâneos para decisões rápidas</p>
                </div>
              </div>

              {/* Educational Resources Section */}
              <div className="mt-8 mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <BookOpen className="h-5 w-5 text-trader-blue" />
                  <h3 className="text-lg font-medium text-white">Entenda as Análises</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-trader-panel/70 backdrop-blur-sm p-4 rounded-lg border border-trader-green/20 shadow-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-trader-green" />
                      <h4 className="font-medium text-white">Linhas de Tendência</h4>
                    </div>
                    <p className="text-xs text-trader-gray">Indicam direções de movimento de preços. Suportes e resistências são níveis onde o preço tende a reverter.</p>
                  </div>
                  
                  <div className="bg-trader-panel/70 backdrop-blur-sm p-4 rounded-lg border border-[#f97316]/20 shadow-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <Fingerprint className="h-4 w-4 text-[#f97316]" />
                      <h4 className="font-medium text-white">Fibonacci</h4>
                    </div>
                    <p className="text-xs text-trader-gray">Níveis utilizados para identificar possíveis pontos de reversão, continuação e alvos de preço.</p>
                  </div>
                  
                  <div className="bg-trader-panel/70 backdrop-blur-sm p-4 rounded-lg border border-[#e11d48]/20 shadow-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <CandlestickChart className="h-4 w-4 text-[#e11d48]" />
                      <h4 className="font-medium text-white">Padrões de Candles</h4>
                    </div>
                    <p className="text-xs text-trader-gray">Formações específicas que indicam possíveis reversões ou continuações de tendência.</p>
                  </div>
                  
                  <div className="bg-trader-panel/70 backdrop-blur-sm p-4 rounded-lg border border-[#06b6d4]/20 shadow-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-[#06b6d4]" />
                      <h4 className="font-medium text-white">Ondas de Elliott</h4>
                    </div>
                    <p className="text-xs text-trader-gray">Método baseado na psicologia de massa que sugere que o mercado se move em ciclos de 5 ondas na direção da tendência principal, seguido por 3 ondas corretivas.</p>
                  </div>
                  
                  <div className="bg-trader-panel/70 backdrop-blur-sm p-4 rounded-lg border border-[#d946ef]/20 shadow-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart className="h-4 w-4 text-[#d946ef]" />
                      <h4 className="font-medium text-white">Teoria de Dow</h4>
                    </div>
                    <p className="text-xs text-trader-gray">Teoria clássica que avalia tendências de mercado baseando-se na confirmação entre diferentes índices e no volume.</p>
                  </div>
                  
                  <div className="bg-trader-panel/70 backdrop-blur-sm p-4 rounded-lg border border-trader-yellow/20 shadow-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-trader-yellow" />
                      <h4 className="font-medium text-white">Limitações</h4>
                    </div>
                    <p className="text-xs text-trader-gray">A análise técnica não considera fatores fundamentais, eventos econômicos ou contexto macroeconômico que podem afetar significativamente os preços.</p>
                  </div>
                </div>
              </div>
              
              {/* Available Tools Section - Design melhorado */}
              <div className="bg-trader-panel/40 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <h4 className="text-center text-sm text-white mb-3">Ferramentas de Análise para M1</h4>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
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
              
              {/* Enhanced Disclaimers com transparência melhorada */}
              <div className="mt-6 border-t border-trader-panel/50 pt-4 text-trader-gray/80 text-xs">
                <div className="bg-trader-panel/40 backdrop-blur-sm p-3 rounded-lg">
                  <p className="mb-2 flex items-start">
                    <AlertTriangle className="h-4 w-4 text-trader-yellow mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Aviso de Risco:</strong> Investimentos em mercados financeiros envolvem riscos significativos de perda. 
                      Resultados passados não garantem retornos futuros. Esta ferramenta oferece apenas análise técnica
                      e deve ser usada como complemento, nunca como única base para decisões de investimento.
                    </span>
                  </p>
                  <p className="mb-1">
                    <strong>Antes de investir:</strong> Estude o ativo, considere fatores fundamentais, notícias de mercado, 
                    e sua própria situação financeira. É recomendado consultar um profissional financeiro antes de tomar decisões.
                  </p>
                  <p className="text-trader-gray/60 mt-2">
                    Este aplicativo não fornece aconselhamento financeiro, recomendações de investimento ou serviços de corretagem.
                  </p>
                </div>
              </div>
              
              {/* Testimonials/Social Proof */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="ml-1 text-white">4.9/5</span>
                <span className="text-trader-gray mx-2">|</span>
                <span className="text-trader-gray">+2.500 traders confiam</span>
              </div>
              
              <p className="mt-4 text-xs text-trader-gray/60 text-center">
                © 2023-2025 Analisador Gráfico Inteligente. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AnalyzerProvider>
  );
};

export default Index;
