
import React, { useState, useEffect } from "react";
import { AlertCircle, BookOpen, TrendingUp, Info, XCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface DisclaimerAlertProps {
  showOnStartup?: boolean;
}

const DisclaimerAlert: React.FC<DisclaimerAlertProps> = ({
  showOnStartup = true
}) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  useEffect(() => {
    // Verificar se o aviso já foi mostrado antes
    const hasShownDisclaimer = localStorage.getItem('disclaimer-shown');
    
    // Se configurado para mostrar na inicialização e ainda não foi mostrado
    if (showOnStartup && !hasShownDisclaimer) {
      // Atraso pequeno para não mostrar imediatamente na carga da página
      const timer = setTimeout(() => {
        setShowDisclaimer(true);
        localStorage.setItem('disclaimer-shown', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [showOnStartup]);

  const handleDismiss = () => {
    setShowDisclaimer(false);
    toast.info("Você pode rever o aviso de risco clicando no ícone de informação no canto superior direito.");
  };

  const showRiskInfo = () => {
    setShowDisclaimer(true);
  };

  return (
    <>
      {/* Botão de informação sempre visível no canto */}
      <button
        onClick={showRiskInfo}
        className="fixed top-4 right-4 z-50 bg-trader-blue/80 hover:bg-trader-blue text-white p-2 rounded-full shadow-lg"
        aria-label="Informações de risco"
      >
        <Info className="h-5 w-5" />
      </button>

      {/* Alerta visível quando showDisclaimer for true */}
      {showDisclaimer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                  <h2 className="text-xl font-bold">Aviso importante sobre análise técnica</h2>
                </div>
                <button onClick={handleDismiss} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <Alert className="mt-4 border-trader-yellow bg-trader-yellow/10">
                <AlertTitle className="flex items-center text-amber-800">
                  <TrendingUp className="h-4 w-4 mr-2" /> Limitações da análise técnica
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  <p className="mt-2">
                    Este analisador utiliza <strong>apenas padrões gráficos</strong> para gerar sinais de compra e venda. 
                    A análise técnica tem limitações inerentes e não considera fatores fundamentais, notícias de mercado ou condições macroeconômicas.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="mt-6 space-y-4 text-gray-700">
                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Resultados passados não garantem retornos futuros</h3>
                    <p className="text-sm mt-1">
                      Padrões identificados historicamente podem não se comportar da mesma forma no futuro.
                      O mercado financeiro é influenciado por inúmeros fatores imprevisíveis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Use como complemento, não como decisão final</h3>
                    <p className="text-sm mt-1">
                      Este analisador deve ser usado apenas como uma ferramenta complementar,
                      junto com pesquisa fundamentalista, análise de risco e consultas com profissionais qualificados.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Confiabilidade varia conforme condições de mercado</h3>
                    <p className="text-sm mt-1">
                      Os sinais tendem a ser mais confiáveis em mercados com tendências claras e podem 
                      apresentar falsos sinais em mercados lateralizados ou de alta volatilidade.
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 my-4 pt-4">
                  <p className="text-sm text-gray-600">
                    <strong>A única pessoa responsável por suas decisões financeiras é você.</strong> Invista somente o que está disposto a perder e 
                    busque sempre diversificar seus investimentos. Considere consultar um profissional de finanças certificado antes 
                    de tomar decisões com base nesta ferramenta.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-5 py-3 flex justify-end rounded-b-lg">
              <button 
                onClick={handleDismiss}
                className="px-4 py-2 bg-trader-blue text-white rounded-md hover:bg-trader-blue/90"
              >
                Entendi os riscos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisclaimerAlert;
