
import { useState } from 'react';
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

  const saveAnalysis = async (data: AnalysisData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    try {
      const { data: analysis, error } = await supabase
        .from('chart_analyses')
        .insert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Análise salva com sucesso!');
      return analysis;
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      toast.error('Erro ao salvar análise');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveSignal = async (signal: TradingSignal) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    try {
      const { data: savedSignal, error } = await supabase
        .from('trading_signals')
        .insert({
          user_id: user.id,
          ...signal
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Sinal salvo com sucesso!');
      return savedSignal;
    } catch (error) {
      console.error('Erro ao salvar sinal:', error);
      toast.error('Erro ao salvar sinal');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserAnalyses = async (limit = 10) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('chart_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar análises:', error);
      return [];
    }
  };

  const getUserSignals = async (limit = 20) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('trading_signals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar sinais:', error);
      return [];
    }
  };

  return {
    saveAnalysis,
    saveSignal,
    getUserAnalyses,
    getUserSignals,
    loading
  };
};
