
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Função para atualizar o estado com base no resultado da media query
    const updateMatches = () => {
      setMatches(media.matches);
    };

    // Verificação inicial
    updateMatches();
    
    // Adicionar listener para alterações na media query
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateMatches);
      return () => media.removeEventListener('change', updateMatches);
    } else {
      // Fallback para navegadores mais antigos
      media.addListener(updateMatches);
      return () => media.removeListener(updateMatches);
    }
  }, [query]);

  return matches;
}
