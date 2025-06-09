import { supabase } from './client';
import type { Database } from './types';

export const SupabaseService = {
  async getUserProfile(userId: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  async insertChartAnalysis(data: Database['public']['Tables']['chart_analyses']['Insert']) {
    return supabase
      .from('chart_analyses')
      .insert([data]);
  },

  async getUserSettings(userId: string) {
    return supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
  },

  // Adicione outros métodos conforme necessário
}; 