import React from 'react';
import { AnalyzerProvider } from '@/context/AnalyzerContext';
import { ImageUploadAnalysis } from '@/components/ImageUploadAnalysis';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UploadAnalysis = () => {
  return (
    <AnalyzerProvider>
      <div className="min-h-screen bg-trader-dark">
        <header className="bg-trader-panel/90 backdrop-blur-sm py-3 px-4 shadow-md border-b border-trader-blue/20">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-trader-gray hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-bold text-white">Análise Manual de Imagens</h1>
            </div>
          </div>
        </header>

        <main className="py-6">
          <ImageUploadAnalysis />
        </main>
      </div>
    </AnalyzerProvider>
  );
};

export default UploadAnalysis;