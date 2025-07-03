import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AnalysisData {
  analysis_type: string;
  image_data?: string;
  results: any;
  timeframe: string;
  market_type: string;
  precision?: number;
  confidence_score?: number;
  ai_decision?: any;
}

export interface TradingSignal {
  analysis_id?: string;
  signal_type: string;
  confidence_level: number;
  entry_point?: number;
  stop_loss?: number;
  take_profit?: number;
  timeframe: string;
  market_conditions?: any;
  ai_reasoning?: string;
  expires_at?: string;
}

export const useSupabaseAnalysis = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Memoize functions to prevent useEffect dependency issues
  const saveAnalysis = useCallback(async (data: AnalysisData) => {
    if (!user) {
      console.error('Usuário não autenticado para salvar análise');
      toast.error('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    try {
      console.log('Salvando análise para usuário:', user.id, data);
      
      const { data: analysis, error } = await supabase
        .from('chart_analyses')
        .insert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar análise:', error);
        throw error;
      }

      console.log('Análise salva com sucesso:', analysis);
      toast.success('Análise salva com sucesso!');
      return analysis;
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      toast.error('Erro ao salvar análise');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveSignal = useCallback(async (signal: TradingSignal) => {
    if (!user) {
      console.error('Usuário não autenticado para salvar sinal');
      toast.error('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    try {
      console.log('Salvando sinal para usuário:', user.id, signal);
      
      const { data: savedSignal, error } = await supabase
        .from('trading_signals')
        .insert({
          user_id: user.id,
          ...signal
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar sinal:', error);
        throw error;
      }

      console.log('Sinal salvo com sucesso:', savedSignal);
      toast.success('Sinal salvo com sucesso!');
      return savedSignal;
    } catch (error) {
      console.error('Erro ao salvar sinal:', error);
      toast.error('Erro ao salvar sinal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getUserAnalyses = useCallback(async (limit = 10) => {
    if (!user) {
      console.error('Usuário não autenticado para buscar análises');
      return [];
    }

    try {
      console.log('Buscando análises para usuário:', user.id, 'limit:', limit);
      
      const { data, error } = await supabase
        .from('chart_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar análises:', error);
        throw error;
      }
      
      console.log('Análises encontradas:', data?.length || 0);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erro ao buscar análises:', error);
      toast.error('Erro ao carregar análises');
      return [];
    }
  }, [user]);

  const getUserSignals = useCallback(async (limit = 20) => {
    if (!user) {
      console.error('Usuário não autenticado para buscar sinais');
      return [];
    }

    try {
      console.log('Buscando sinais para usuário:', user.id, 'limit:', limit);
      
      const { data, error } = await supabase
        .from('trading_signals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar sinais:', error);
        throw error;
      }
      
      console.log('Sinais encontrados:', data?.length || 0);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erro ao buscar sinais:', error);
      toast.error('Erro ao carregar sinais');
      return [];
    }
  }, [user]);

  return {
    saveAnalysis,
    saveSignal,
    getUserAnalyses,
    getUserSignals,
    loading
  };
};