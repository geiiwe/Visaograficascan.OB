import React, { useRef, useState } from 'react';
import { Upload, Image, X, Camera, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyzer } from '@/context/AnalyzerContext';
import ManualAnalysisInterface from './ManualAnalysisInterface';
import { toast } from 'sonner';
import { performCompleteImageAnalysis, CompleteImageAnalysisResult } from '@/utils/completeImageAnalysis';
import { CompleteAnalysisDisplay } from '@/components/CompleteAnalysisDisplay';
import ProcessingIndicator from '@/components/overlay/ProcessingIndicator';

export const ImageUploadAnalysis = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { imageData, setImageData, analysisMode, setAnalysisMode, precision, selectedTimeframe, marketType, chartRegion, isAnalyzing, setIsAnalyzing } = useAnalyzer();
  const [completeAnalysis, setCompleteAnalysis] = useState<CompleteImageAnalysisResult | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingError, setProcessingError] = useState<boolean>(false);
  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setImageData(result);
      setAnalysisMode('photo');
      toast.success('Imagem carregada com sucesso! Agora você pode fazer análises manuais.');
      setCompleteAnalysis(null);
      try {
        setIsAnalyzing(true);
        setProcessingError(false);
        setProcessingStage('Analisando imagem...');
        const analysis = await performCompleteImageAnalysis(result, {
          precision,
          timeframe: selectedTimeframe,
          marketType,
          region: chartRegion || undefined,
        });
        setCompleteAnalysis(analysis);
        toast.success('Análise completa concluída!');
      } catch (err) {
        console.error(err);
        setProcessingError(true);
        setProcessingStage('Falha ao analisar a imagem');
        toast.error('Falha ao analisar a imagem');
      } finally {
        setIsAnalyzing(false);
        setProcessingStage('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const clearImage = () => {
    setImageData(null);
    setCompleteAnalysis(null);
    setProcessingStage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Imagem removida');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <ProcessingIndicator processingStage={processingStage} isError={processingError} />
      <Card className="bg-trader-panel/90 backdrop-blur-sm border-trader-blue/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileImage className="h-6 w-6 text-trader-blue" />
            Upload de Imagem para Análise Manual
          </CardTitle>
          <p className="text-trader-gray text-sm">
            Faça upload de uma imagem de gráfico da sua galeria para realizar análises manuais detalhadas
          </p>
        </CardHeader>
        <CardContent>
          {!imageData ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-trader-blue bg-trader-blue/10'
                  : 'border-trader-gray/30 hover:border-trader-blue/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-trader-blue/20 rounded-full">
                  <Upload className="h-8 w-8 text-trader-blue" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">
                    Arrastar e soltar ou clique para selecionar
                  </h3>
                  <p className="text-trader-gray text-sm mb-4">
                    Suporta JPG, PNG, GIF até 10MB
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleFileSelect}
                      className="bg-trader-blue hover:bg-trader-blue/80"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Selecionar da Galeria
                    </Button>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imageData}
                  alt="Imagem carregada"
                  className="w-full max-h-96 object-contain rounded-lg border border-trader-blue/20"
                />
                <Button
                  onClick={clearImage}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-trader-blue/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-trader-blue" />
                  <span className="text-white font-medium">Imagem carregada</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleFileSelect}
                    variant="outline"
                    size="sm"
                    className="border-trader-blue/30 text-trader-blue hover:bg-trader-blue/10"
                  >
                    Trocar Imagem
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {completeAnalysis && (
        <CompleteAnalysisDisplay analysis={completeAnalysis} />
      )}

      {imageData && (
        <Card className="bg-trader-panel/90 backdrop-blur-sm border-trader-green/20">
          <CardHeader>
            <CardTitle className="text-white">Análise Manual</CardTitle>
            <p className="text-trader-gray text-sm">
              Selecione regiões na imagem para realizar análises focadas
            </p>
          </CardHeader>
          <CardContent>
            <ManualAnalysisInterface />
          </CardContent>
        </Card>
      )}
    </div>
  );
};