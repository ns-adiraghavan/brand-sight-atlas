export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cross_platform_correlation_mat: {
        Row: {
          alignment_correlation: number | null
          platform: string | null
        }
        Insert: {
          alignment_correlation?: number | null
          platform?: string | null
        }
        Update: {
          alignment_correlation?: number | null
          platform?: string | null
        }
        Relationships: []
      }
      ola_availability_distribution_mat: {
        Row: {
          availability_band: string | null
          platform: string | null
          sku_count: number | null
        }
        Insert: {
          availability_band?: string | null
          platform?: string | null
          sku_count?: number | null
        }
        Update: {
          availability_band?: string | null
          platform?: string | null
          sku_count?: number | null
        }
        Relationships: []
      }
      ola_bottom_skus_mat: {
        Row: {
          base_pack: string | null
          business_group_clean: string | null
          platform: string | null
          risk_band: string | null
          sku_availability_ratio: number | null
          total_days: number | null
        }
        Insert: {
          base_pack?: string | null
          business_group_clean?: string | null
          platform?: string | null
          risk_band?: string | null
          sku_availability_ratio?: number | null
          total_days?: number | null
        }
        Update: {
          base_pack?: string | null
          business_group_clean?: string | null
          platform?: string | null
          risk_band?: string | null
          sku_availability_ratio?: number | null
          total_days?: number | null
        }
        Relationships: []
      }
      ola_exec_summary_mat: {
        Row: {
          availability_pct: number | null
          must_have_availability_pct: number | null
          platform: string | null
          sku_reliability_pct: number | null
        }
        Insert: {
          availability_pct?: number | null
          must_have_availability_pct?: number | null
          platform?: string | null
          sku_reliability_pct?: number | null
        }
        Update: {
          availability_pct?: number | null
          must_have_availability_pct?: number | null
          platform?: string | null
          sku_reliability_pct?: number | null
        }
        Relationships: []
      }
      ola_fact: {
        Row: {
          availability: string | null
          base_pack: string | null
          business_group: string | null
          cotc_flag: string | null
          customer: string | null
          customer_code: string | null
          customer_group: string | null
          date: string
          ean: string | null
          id: number
          location: string | null
          merchant: string | null
          mrp: string | null
          must_have_flag: string | null
          new_launch_flag: string | null
          pincode: string | null
          platform: string | null
          product_description: string | null
          sale_price: string | null
          sales_category: string | null
          screenshot_url: string | null
          seller_name: string | null
          top_packs_flag: string | null
        }
        Insert: {
          availability?: string | null
          base_pack?: string | null
          business_group?: string | null
          cotc_flag?: string | null
          customer?: string | null
          customer_code?: string | null
          customer_group?: string | null
          date: string
          ean?: string | null
          id?: number
          location?: string | null
          merchant?: string | null
          mrp?: string | null
          must_have_flag?: string | null
          new_launch_flag?: string | null
          pincode?: string | null
          platform?: string | null
          product_description?: string | null
          sale_price?: string | null
          sales_category?: string | null
          screenshot_url?: string | null
          seller_name?: string | null
          top_packs_flag?: string | null
        }
        Update: {
          availability?: string | null
          base_pack?: string | null
          business_group?: string | null
          cotc_flag?: string | null
          customer?: string | null
          customer_code?: string | null
          customer_group?: string | null
          date?: string
          ean?: string | null
          id?: number
          location?: string | null
          merchant?: string | null
          mrp?: string | null
          must_have_flag?: string | null
          new_launch_flag?: string | null
          pincode?: string | null
          platform?: string | null
          product_description?: string | null
          sale_price?: string | null
          sales_category?: string | null
          screenshot_url?: string | null
          seller_name?: string | null
          top_packs_flag?: string | null
        }
        Relationships: []
      }
      ola_pincode_volatility_mat: {
        Row: {
          avg_availability: number | null
          location: string | null
          platform: string | null
          volatility_index: number | null
        }
        Insert: {
          avg_availability?: number | null
          location?: string | null
          platform?: string | null
          volatility_index?: number | null
        }
        Update: {
          avg_availability?: number | null
          location?: string | null
          platform?: string | null
          volatility_index?: number | null
        }
        Relationships: []
      }
      ola_platform_gap_mat: {
        Row: {
          availability_gap: number | null
        }
        Insert: {
          availability_gap?: number | null
        }
        Update: {
          availability_gap?: number | null
        }
        Relationships: []
      }
      ola_vendor_health_mat: {
        Row: {
          availability_pct: number | null
          must_have_availability_pct: number | null
          platform: string | null
          sku_reliability_pct: number | null
          skus_tracked: number | null
        }
        Insert: {
          availability_pct?: number | null
          must_have_availability_pct?: number | null
          platform?: string | null
          sku_reliability_pct?: number | null
          skus_tracked?: number | null
        }
        Update: {
          availability_pct?: number | null
          must_have_availability_pct?: number | null
          platform?: string | null
          sku_reliability_pct?: number | null
          skus_tracked?: number | null
        }
        Relationships: []
      }
      ola_weekly_trend_mat: {
        Row: {
          availability_pct: number | null
          must_have_availability_pct: number | null
          platform: string | null
          week: string | null
        }
        Insert: {
          availability_pct?: number | null
          must_have_availability_pct?: number | null
          platform?: string | null
          week?: string | null
        }
        Update: {
          availability_pct?: number | null
          must_have_availability_pct?: number | null
          platform?: string | null
          week?: string | null
        }
        Relationships: []
      }
      sos_exclusive_weekly_mat: {
        Row: {
          exclusive_share_pct: number | null
          platform: string | null
          week: string | null
        }
        Insert: {
          exclusive_share_pct?: number | null
          platform?: string | null
          week?: string | null
        }
        Update: {
          exclusive_share_pct?: number | null
          platform?: string | null
          week?: string | null
        }
        Relationships: []
      }
      sos_exec_summary_mat: {
        Row: {
          elite_rank_share_pct: number | null
          exclusive_share_pct: number | null
          platform: string | null
          top10_presence_pct: number | null
        }
        Insert: {
          elite_rank_share_pct?: number | null
          exclusive_share_pct?: number | null
          platform?: string | null
          top10_presence_pct?: number | null
        }
        Update: {
          elite_rank_share_pct?: number | null
          exclusive_share_pct?: number | null
          platform?: string | null
          top10_presence_pct?: number | null
        }
        Relationships: []
      }
      sos_fact: {
        Row: {
          asin_code: string | null
          base_pack_code: string | null
          brand_competition: string | null
          bucket: string | null
          date: string
          hul_vs_non_hul: string | null
          id: number
          ingested_at: string | null
          manufacturer: string | null
          mrp: string | null
          offer_price: string | null
          platform: string | null
          product_description: string | null
          search_keyword: string | null
          search_keyword_category: string | null
          search_rank: number | null
          search_type: string | null
          seller_name: string | null
        }
        Insert: {
          asin_code?: string | null
          base_pack_code?: string | null
          brand_competition?: string | null
          bucket?: string | null
          date: string
          hul_vs_non_hul?: string | null
          id?: number
          ingested_at?: string | null
          manufacturer?: string | null
          mrp?: string | null
          offer_price?: string | null
          platform?: string | null
          product_description?: string | null
          search_keyword?: string | null
          search_keyword_category?: string | null
          search_rank?: number | null
          search_type?: string | null
          seller_name?: string | null
        }
        Update: {
          asin_code?: string | null
          base_pack_code?: string | null
          brand_competition?: string | null
          bucket?: string | null
          date?: string
          hul_vs_non_hul?: string | null
          id?: number
          ingested_at?: string | null
          manufacturer?: string | null
          mrp?: string | null
          offer_price?: string | null
          platform?: string | null
          product_description?: string | null
          search_keyword?: string | null
          search_keyword_category?: string | null
          search_rank?: number | null
          search_type?: string | null
          seller_name?: string | null
        }
        Relationships: []
      }
      sos_keyword_risk_mat: {
        Row: {
          mean_rank: number | null
          performance_band: string | null
          platform: string | null
          search_keyword: string | null
        }
        Insert: {
          mean_rank?: number | null
          performance_band?: string | null
          platform?: string | null
          search_keyword?: string | null
        }
        Update: {
          mean_rank?: number | null
          performance_band?: string | null
          platform?: string | null
          search_keyword?: string | null
        }
        Relationships: []
      }
      sos_keyword_volatility_mat: {
        Row: {
          mean_rank: number | null
          platform: string | null
          rank_volatility: number | null
          search_keyword: string | null
        }
        Insert: {
          mean_rank?: number | null
          platform?: string | null
          rank_volatility?: number | null
          search_keyword?: string | null
        }
        Update: {
          mean_rank?: number | null
          platform?: string | null
          rank_volatility?: number | null
          search_keyword?: string | null
        }
        Relationships: []
      }
      sos_rank_distribution_mat: {
        Row: {
          listing_count: number | null
          platform: string | null
          rank_bucket: string | null
        }
        Insert: {
          listing_count?: number | null
          platform?: string | null
          rank_bucket?: string | null
        }
        Update: {
          listing_count?: number | null
          platform?: string | null
          rank_bucket?: string | null
        }
        Relationships: []
      }
      sos_vendor_health_mat: {
        Row: {
          avg_rank_volatility: number | null
          elite_rank_share_pct: number | null
          keywords_tracked: number | null
          organic_share_pct: number | null
          platform: string | null
          top10_presence_pct: number | null
        }
        Insert: {
          avg_rank_volatility?: number | null
          elite_rank_share_pct?: number | null
          keywords_tracked?: number | null
          organic_share_pct?: number | null
          platform?: string | null
          top10_presence_pct?: number | null
        }
        Update: {
          avg_rank_volatility?: number | null
          elite_rank_share_pct?: number | null
          keywords_tracked?: number | null
          organic_share_pct?: number | null
          platform?: string | null
          top10_presence_pct?: number | null
        }
        Relationships: []
      }
      sos_weekly_trend_mat: {
        Row: {
          elite_rank_share_pct: number | null
          platform: string | null
          top10_presence_pct: number | null
          week: string | null
        }
        Insert: {
          elite_rank_share_pct?: number | null
          platform?: string | null
          top10_presence_pct?: number | null
          week?: string | null
        }
        Update: {
          elite_rank_share_pct?: number | null
          platform?: string | null
          top10_presence_pct?: number | null
          week?: string | null
        }
        Relationships: []
      }
      vendor_health_overview_mat: {
        Row: {
          availability_pct: number | null
          last_date: string | null
          platform: string | null
          skus_tracked: number | null
        }
        Insert: {
          availability_pct?: number | null
          last_date?: string | null
          platform?: string | null
          skus_tracked?: number | null
        }
        Update: {
          availability_pct?: number | null
          last_date?: string | null
          platform?: string | null
          skus_tracked?: number | null
        }
        Relationships: []
      }
      vendor_search_overview_mat: {
        Row: {
          keywords_tracked: number | null
          platform: string | null
          top10_presence_pct: number | null
        }
        Insert: {
          keywords_tracked?: number | null
          platform?: string | null
          top10_presence_pct?: number | null
        }
        Update: {
          keywords_tracked?: number | null
          platform?: string | null
          top10_presence_pct?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      cross_platform_correlation: {
        Row: {
          alignment_correlation: number | null
          platform: string | null
        }
        Relationships: []
      }
      cross_platform_weekly: {
        Row: {
          availability_pct: number | null
          platform: string | null
          top10_presence_pct: number | null
          week: string | null
        }
        Relationships: []
      }
      exec_overview: {
        Row: {
          availability_pct: number | null
          elite_rank_share_pct: number | null
          exclusive_share_pct: number | null
          must_have_availability_pct: number | null
          platform: string | null
          sku_reliability_pct: number | null
          top10_presence_pct: number | null
        }
        Relationships: []
      }
      ola_availability_distribution: {
        Row: {
          availability_band: string | null
          platform: string | null
          sku_count: number | null
        }
        Relationships: []
      }
      ola_bottom_skus: {
        Row: {
          base_pack: string | null
          business_group_clean: string | null
          platform: string | null
          risk_band: string | null
          sku_availability_ratio: number | null
          total_days: number | null
        }
        Relationships: []
      }
      ola_category_health: {
        Row: {
          availability_pct: number | null
          business_group_clean: string | null
          platform: string | null
        }
        Relationships: []
      }
      ola_exec_summary: {
        Row: {
          availability_pct: number | null
          must_have_availability_pct: number | null
          platform: string | null
          sku_reliability_pct: number | null
        }
        Relationships: []
      }
      ola_new_launch_trend: {
        Row: {
          new_launch_availability_pct: number | null
          platform: string | null
          week: string | null
        }
        Relationships: []
      }
      ola_pincode_volatility: {
        Row: {
          avg_availability: number | null
          location: string | null
          platform: string | null
          volatility_index: number | null
        }
        Relationships: []
      }
      ola_platform_gap: {
        Row: {
          availability_gap: number | null
        }
        Relationships: []
      }
      ola_sku_reliability: {
        Row: {
          base_pack: string | null
          business_group_clean: string | null
          platform: string | null
          risk_band: string | null
          sku_availability_ratio: number | null
          total_days: number | null
        }
        Relationships: []
      }
      ola_top_fix_opportunities: {
        Row: {
          base_pack: string | null
          days_unavailable: number | null
          locations_affected: number | null
          platform: string | null
          total_days: number | null
        }
        Relationships: []
      }
      ola_vendor_health: {
        Row: {
          availability_pct: number | null
          must_have_availability_pct: number | null
          platform: string | null
          sku_reliability_pct: number | null
          skus_tracked: number | null
        }
        Relationships: []
      }
      ola_weekly_trend: {
        Row: {
          availability_pct: number | null
          must_have_availability_pct: number | null
          platform: string | null
          week: string | null
        }
        Relationships: []
      }
      sos_exclusive_weekly: {
        Row: {
          exclusive_share_pct: number | null
          platform: string | null
          week: string | null
        }
        Relationships: []
      }
      sos_exec_summary: {
        Row: {
          elite_rank_share_pct: number | null
          exclusive_share_pct: number | null
          platform: string | null
          top10_presence_pct: number | null
        }
        Relationships: []
      }
      sos_keyword_risk: {
        Row: {
          mean_rank: number | null
          performance_band: string | null
          platform: string | null
          search_keyword: string | null
        }
        Relationships: []
      }
      sos_keyword_volatility: {
        Row: {
          mean_rank: number | null
          platform: string | null
          rank_volatility: number | null
          search_keyword: string | null
        }
        Relationships: []
      }
      sos_rank_distribution: {
        Row: {
          listing_count: number | null
          platform: string | null
          rank_bucket: string | null
        }
        Relationships: []
      }
      sos_top_volatile_keywords: {
        Row: {
          mean_rank: number | null
          platform: string | null
          rank_volatility: number | null
          search_keyword: string | null
        }
        Relationships: []
      }
      sos_vendor_health: {
        Row: {
          avg_rank_volatility: number | null
          elite_rank_share_pct: number | null
          keywords_tracked: number | null
          organic_share_pct: number | null
          platform: string | null
          top10_presence_pct: number | null
        }
        Relationships: []
      }
      sos_weekly_trend: {
        Row: {
          elite_rank_share_pct: number | null
          platform: string | null
          top10_presence_pct: number | null
          week: string | null
        }
        Relationships: []
      }
      vendor_health_overview: {
        Row: {
          availability_pct: number | null
          last_date: string | null
          platform: string | null
          skus_tracked: number | null
        }
        Relationships: []
      }
      vendor_search_overview: {
        Row: {
          keywords_tracked: number | null
          platform: string | null
          top10_presence_pct: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
