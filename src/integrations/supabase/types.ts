export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_analysis_logs: {
        Row: {
          analysis_narrative: string | null
          confidence: number | null
          created_at: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          prediction: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          analysis_narrative?: string | null
          confidence?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          prediction?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_narrative?: string | null
          confidence?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          prediction?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          id: string
          prediction_id: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          prediction_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          prediction_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_training_data: {
        Row: {
          actual_entry_point: string | null
          analysis: string | null
          buy_score_raw: number | null
          candle_patterns_confidence: number | null
          candle_patterns_found: boolean | null
          candle_timestamp: string | null
          close: number | null
          created_at: string | null
          direction: string | null
          dow_theory_confidence: number | null
          dow_theory_found: boolean | null
          elliott_waves_confidence: number | null
          elliott_waves_found: boolean | null
          fibonacci_confidence: number | null
          fibonacci_found: boolean | null
          high: number | null
          id: string
          image_url: string | null
          low: number | null
          market_context: string | null
          market_noise_level: number | null
          market_type: string
          momentum_signal: string | null
          momentum_strength: number | null
          open: number | null
          pattern: string | null
          predicted_confidence: number | null
          predicted_entry_point: string | null
          sell_score_raw: number | null
          support_resistance_confidence: number | null
          support_resistance_found: boolean | null
          technical_name: string | null
          timeframe: string
          timestamp: string | null
          trade_outcome: string | null
          trendlines_confidence: number | null
          trendlines_found: boolean | null
          volatility_level: number | null
          volatility_type: string | null
          volume_signal: string | null
          volume_strength: number | null
        }
        Insert: {
          actual_entry_point?: string | null
          analysis?: string | null
          buy_score_raw?: number | null
          candle_patterns_confidence?: number | null
          candle_patterns_found?: boolean | null
          candle_timestamp?: string | null
          close?: number | null
          created_at?: string | null
          direction?: string | null
          dow_theory_confidence?: number | null
          dow_theory_found?: boolean | null
          elliott_waves_confidence?: number | null
          elliott_waves_found?: boolean | null
          fibonacci_confidence?: number | null
          fibonacci_found?: boolean | null
          high?: number | null
          id?: string
          image_url?: string | null
          low?: number | null
          market_context?: string | null
          market_noise_level?: number | null
          market_type: string
          momentum_signal?: string | null
          momentum_strength?: number | null
          open?: number | null
          pattern?: string | null
          predicted_confidence?: number | null
          predicted_entry_point?: string | null
          sell_score_raw?: number | null
          support_resistance_confidence?: number | null
          support_resistance_found?: boolean | null
          technical_name?: string | null
          timeframe: string
          timestamp?: string | null
          trade_outcome?: string | null
          trendlines_confidence?: number | null
          trendlines_found?: boolean | null
          volatility_level?: number | null
          volatility_type?: string | null
          volume_signal?: string | null
          volume_strength?: number | null
        }
        Update: {
          actual_entry_point?: string | null
          analysis?: string | null
          buy_score_raw?: number | null
          candle_patterns_confidence?: number | null
          candle_patterns_found?: boolean | null
          candle_timestamp?: string | null
          close?: number | null
          created_at?: string | null
          direction?: string | null
          dow_theory_confidence?: number | null
          dow_theory_found?: boolean | null
          elliott_waves_confidence?: number | null
          elliott_waves_found?: boolean | null
          fibonacci_confidence?: number | null
          fibonacci_found?: boolean | null
          high?: number | null
          id?: string
          image_url?: string | null
          low?: number | null
          market_context?: string | null
          market_noise_level?: number | null
          market_type?: string
          momentum_signal?: string | null
          momentum_strength?: number | null
          open?: number | null
          pattern?: string | null
          predicted_confidence?: number | null
          predicted_entry_point?: string | null
          sell_score_raw?: number | null
          support_resistance_confidence?: number | null
          support_resistance_found?: boolean | null
          technical_name?: string | null
          timeframe?: string
          timestamp?: string | null
          trade_outcome?: string | null
          trendlines_confidence?: number | null
          trendlines_found?: boolean | null
          volatility_level?: number | null
          volatility_type?: string | null
          volume_signal?: string | null
          volume_strength?: number | null
        }
        Relationships: []
      }
      chart_analyses: {
        Row: {
          ai_decision: Json | null
          analysis_type: string
          analysis_type_enum:
            | Database["public"]["Enums"]["analysis_type_enum"]
            | null
          confidence_score: number | null
          created_at: string | null
          id: string
          image_data: string | null
          is_best: boolean | null
          market_type: string
          precision: number | null
          real_result: Json | null
          results: Json
          timeframe: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_decision?: Json | null
          analysis_type: string
          analysis_type_enum?:
            | Database["public"]["Enums"]["analysis_type_enum"]
            | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          image_data?: string | null
          is_best?: boolean | null
          market_type: string
          precision?: number | null
          real_result?: Json | null
          results: Json
          timeframe: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_decision?: Json | null
          analysis_type?: string
          analysis_type_enum?:
            | Database["public"]["Enums"]["analysis_type_enum"]
            | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          image_data?: string | null
          is_best?: boolean | null
          market_type?: string
          precision?: number | null
          real_result?: Json | null
          results?: Json
          timeframe?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          plan_type: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          plan_type?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          plan_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          ai_confidence: number | null
          ai_prediction: string | null
          amount: number | null
          asset: string | null
          created_at: string | null
          entry_point: string | null
          id: string
          price_close: number | null
          price_open: number | null
          result: string | null
          timeframe: string | null
          user_id: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_prediction?: string | null
          amount?: number | null
          asset?: string | null
          created_at?: string | null
          entry_point?: string | null
          id?: string
          price_close?: number | null
          price_open?: number | null
          result?: string | null
          timeframe?: string | null
          user_id?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_prediction?: string | null
          amount?: number | null
          asset?: string | null
          created_at?: string | null
          entry_point?: string | null
          id?: string
          price_close?: number | null
          price_open?: number | null
          result?: string | null
          timeframe?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trading_signals: {
        Row: {
          ai_reasoning: string | null
          analysis_id: string | null
          confidence_level: number
          created_at: string | null
          entry_point: number | null
          expires_at: string | null
          id: string
          market_conditions: Json | null
          real_result: Json | null
          signal_type: string
          status: string | null
          stop_loss: number | null
          take_profit: number | null
          timeframe: string
          user_id: string
        }
        Insert: {
          ai_reasoning?: string | null
          analysis_id?: string | null
          confidence_level: number
          created_at?: string | null
          entry_point?: number | null
          expires_at?: string | null
          id?: string
          market_conditions?: Json | null
          real_result?: Json | null
          signal_type: string
          status?: string | null
          stop_loss?: number | null
          take_profit?: number | null
          timeframe: string
          user_id: string
        }
        Update: {
          ai_reasoning?: string | null
          analysis_id?: string | null
          confidence_level?: number
          created_at?: string | null
          entry_point?: number | null
          expires_at?: string | null
          id?: string
          market_conditions?: Json | null
          real_result?: Json | null
          signal_type?: string
          status?: string | null
          stop_loss?: number | null
          take_profit?: number | null
          timeframe?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_signals_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "chart_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          ai_autonomous_enabled: boolean | null
          created_at: string | null
          default_market_type: string | null
          default_precision: number | null
          default_timeframe: string | null
          id: string
          notification_preferences: Json | null
          risk_tolerance: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_autonomous_enabled?: boolean | null
          created_at?: string | null
          default_market_type?: string | null
          default_precision?: number | null
          default_timeframe?: string | null
          id?: string
          notification_preferences?: Json | null
          risk_tolerance?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_autonomous_enabled?: boolean | null
          created_at?: string | null
          default_market_type?: string | null
          default_precision?: number | null
          default_timeframe?: string | null
          id?: string
          notification_preferences?: Json | null
          risk_tolerance?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_analysis_with_signal: {
        Args: {
          p_user_id: string
          p_analysis_type: string
          p_market_type: string
          p_timeframe: string
          p_results: Json
          p_signal_type: string
          p_confidence_level: number
        }
        Returns: undefined
      }
    }
    Enums: {
      analysis_type_enum: "price_action" | "indicator" | "pattern"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      analysis_type_enum: ["price_action", "indicator", "pattern"],
    },
  },
} as const
