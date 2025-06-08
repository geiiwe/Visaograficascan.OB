import React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/hooks/useAuth';

// Define the context for the analyzer
const AnalyzerContext = ({ children }) => {
  return <>{children}</>;
};

const Index = () => {
  const { isAuthenticated, loading } = useAuth();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const formSchema = z.object({
    ticker: z.string().min(1, "Ticker é obrigatório"),
    timeframe: z.string().min(1, "Timeframe é obrigatório"),
    includeVolume: z.boolean().default(true),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: "",
      timeframe: "daily",
      includeVolume: true,
    },
  });

  const onSubmit = (data) => {
    setIsAnalyzing(true);
    console.log("Form data:", data);
    
    // Simulate analysis
    setTimeout(() => {
      setResult({
        prediction: "ALTA",
        confidence: 87,
        support: 45.32,
        resistance: 48.75,
        stopLoss: 44.50,
        recommendation: "Compra com potencial de alta de 7% nos próximos dias. Mantenha stop em 44.50."
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with Auth Button */}
      <div className="absolute top-4 right-4 z-50">
        <AuthButton />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Trading Pro
          </h1>
          <p className="text-gray-400">
            Análises técnicas avançadas com inteligência artificial
          </p>
          {!isAuthenticated && (
            <p className="text-yellow-400 mt-2 text-sm">
              ⚠️ Faça login para acessar todas as funcionalidades
            </p>
          )}
        </div>

        {/* Existing analyzer content */}
        <AnalyzerContext>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Visualização</h2>
              <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                {selectedImage ? (
                  <img src={selectedImage} alt="Selected chart" className="max-h-full rounded-lg" />
                ) : cameraActive ? (
                  <div className="text-gray-400">Câmera ativa (simulação)</div>
                ) : (
                  <div className="text-gray-400">Selecione uma imagem ou ative a câmera</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={toggleCamera} variant="outline">
                  {cameraActive ? "Desativar Câmera" : "Ativar Câmera"}
                </Button>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button variant="outline" className="w-full" onClick={() => document.getElementById('image-upload').click()}>
                      Carregar Imagem
                    </Button>
                  </Label>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Painel de Controle</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ticker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Ticker</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: PETR4, VALE3, ITUB4" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Timeframe</FormLabel>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="daily">Diário</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensal</option>
                          <option value="intraday">Intraday</option>
                        </select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includeVolume"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-white">
                            Incluir análise de volume
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Analisando..." : "Analisar"}
                  </Button>
                </form>
              </Form>
              
              {result && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-bold text-white mb-2">Resultado da Análise</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-gray-400 text-sm">Previsão:</span>
                      <div className={`font-bold ${result.prediction === "ALTA" ? "text-green-400" : "text-red-400"}`}>
                        {result.prediction}
                      </div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-gray-400 text-sm">Confiança:</span>
                      <div className="font-bold text-blue-400">{result.confidence}%</div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-gray-400 text-sm">Suporte:</span>
                      <div className="font-bold text-white">{result.support}</div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-gray-400 text-sm">Resistência:</span>
                      <div className="font-bold text-white">{result.resistance}</div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <span className="text-gray-400 text-sm">Recomendação:</span>
                    <p className="text-white">{result.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AnalyzerContext>
      </div>
    </div>
  );
};

export default Index;
