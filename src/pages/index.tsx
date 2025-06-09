import { Seo } from '@/components/Seo';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/auth', { replace: true });
  }, [navigate]);

  return (
    <>
      <Seo title="Analisador Gráfico Inteligente" description="Ferramenta inteligente de análise gráfica com visão computacional." />
      {/* ...restante do componente... */}
    </>
  );
};

export default Index; 