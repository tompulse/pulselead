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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lead_interactions: {
        Row: {
          created_at: string
          date_interaction: string
          date_relance: string | null
          entreprise_id: string
          id: string
          notes: string | null
          statut: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_interaction?: string
          date_relance?: string | null
          entreprise_id: string
          id?: string
          notes?: string | null
          statut?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_interaction?: string
          date_relance?: string | null
          entreprise_id?: string
          id?: string
          notes?: string | null
          statut?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_statuts: {
        Row: {
          created_at: string
          entreprise_id: string
          id: string
          notes: string | null
          score: number | null
          statut: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entreprise_id: string
          id?: string
          notes?: string | null
          score?: number | null
          statut?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entreprise_id?: string
          id?: string
          notes?: string | null
          score?: number | null
          statut?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nouveaux_sites: {
        Row: {
          adresse: string | null
          categorie_detaillee: string | null
          categorie_entreprise: string | null
          categorie_juridique: string | null
          code_naf: string | null
          code_postal: string | null
          complement_adresse: string | null
          coordonnee_lambert_x: number | null
          coordonnee_lambert_y: number | null
          created_at: string | null
          date_creation: string | null
          est_siege: boolean | null
          id: string
          latitude: number | null
          libelle_voie: string | null
          longitude: number | null
          naf_classe: string | null
          naf_division: string | null
          naf_groupe: string | null
          naf_section: string | null
          nom: string
          numero_voie: string | null
          siret: string
          type_voie: string | null
          updated_at: string | null
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          categorie_detaillee?: string | null
          categorie_entreprise?: string | null
          categorie_juridique?: string | null
          code_naf?: string | null
          code_postal?: string | null
          complement_adresse?: string | null
          coordonnee_lambert_x?: number | null
          coordonnee_lambert_y?: number | null
          created_at?: string | null
          date_creation?: string | null
          est_siege?: boolean | null
          id?: string
          latitude?: number | null
          libelle_voie?: string | null
          longitude?: number | null
          naf_classe?: string | null
          naf_division?: string | null
          naf_groupe?: string | null
          naf_section?: string | null
          nom: string
          numero_voie?: string | null
          siret: string
          type_voie?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          categorie_detaillee?: string | null
          categorie_entreprise?: string | null
          categorie_juridique?: string | null
          code_naf?: string | null
          code_postal?: string | null
          complement_adresse?: string | null
          coordonnee_lambert_x?: number | null
          coordonnee_lambert_y?: number | null
          created_at?: string | null
          date_creation?: string | null
          est_siege?: boolean | null
          id?: string
          latitude?: number | null
          libelle_voie?: string | null
          longitude?: number | null
          naf_classe?: string | null
          naf_division?: string | null
          naf_groupe?: string | null
          naf_section?: string | null
          nom?: string
          numero_voie?: string | null
          siret?: string
          type_voie?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      qualification_status: {
        Row: {
          created_at: string | null
          id: string
          is_running: boolean
          paused_at: string | null
          qualified_count: number
          started_at: string | null
          total_count: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_running?: boolean
          paused_at?: string | null
          qualified_count?: number
          started_at?: string | null
          total_count?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_running?: boolean
          paused_at?: string | null
          qualified_count?: number
          started_at?: string | null
          total_count?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          updated_at: string | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      tournees: {
        Row: {
          created_at: string
          date_planifiee: string
          distance_totale_km: number | null
          entreprises_ids: string[]
          heure_debut: string | null
          id: string
          nom: string
          notes: string | null
          ordre_optimise: string[]
          point_depart_lat: number | null
          point_depart_lng: number | null
          statut: string
          temps_estime_minutes: number | null
          updated_at: string
          user_id: string
          visites_effectuees: Json | null
        }
        Insert: {
          created_at?: string
          date_planifiee: string
          distance_totale_km?: number | null
          entreprises_ids: string[]
          heure_debut?: string | null
          id?: string
          nom: string
          notes?: string | null
          ordre_optimise: string[]
          point_depart_lat?: number | null
          point_depart_lng?: number | null
          statut?: string
          temps_estime_minutes?: number | null
          updated_at?: string
          user_id: string
          visites_effectuees?: Json | null
        }
        Update: {
          created_at?: string
          date_planifiee?: string
          distance_totale_km?: number | null
          entreprises_ids?: string[]
          heure_debut?: string | null
          id?: string
          nom?: string
          notes?: string | null
          ordre_optimise?: string[]
          point_depart_lat?: number | null
          point_depart_lng?: number | null
          statut?: string
          temps_estime_minutes?: number | null
          updated_at?: string
          user_id?: string
          visites_effectuees?: Json | null
        }
        Relationships: []
      }
      user_onboarding_progress: {
        Row: {
          completed_at: string | null
          completed_steps: Json | null
          created_at: string | null
          current_step: number
          demo_data_loaded: boolean | null
          id: string
          skipped_tutorial: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string | null
          current_step?: number
          demo_data_loaded?: boolean | null
          id?: string
          skipped_tutorial?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string | null
          current_step?: number
          demo_data_loaded?: boolean | null
          id?: string
          skipped_tutorial?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_plan: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
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
      check_subscription_access: { Args: { _user_id: string }; Returns: Json }
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
      get_filter_counts: {
        Args: {
          p_categories?: string[]
          p_departments?: string[]
          p_formes?: string[]
          p_search_query?: string
        }
        Returns: Json
      }
      get_nouveaux_sites_filter_counts: {
        Args: {
          p_categories?: string[]
          p_codes_naf?: string[]
          p_departments?: string[]
          p_search_query?: string
        }
        Returns: Json
      }
      get_nouveaux_sites_filter_counts_v2: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      interaction_statut:
        | "a_rappeler"
        | "en_cours"
        | "gagne"
        | "perdu"
        | "sans_suite"
      interaction_type:
        | "appel"
        | "email"
        | "visite"
        | "rdv"
        | "autre"
        | "a_revoir"
      lead_statut_enum:
        | "nouveau"
        | "contacte"
        | "qualifie"
        | "proposition"
        | "negociation"
        | "gagne"
        | "perdu"
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
    Enums: {
      app_role: ["admin", "user"],
      interaction_statut: [
        "a_rappeler",
        "en_cours",
        "gagne",
        "perdu",
        "sans_suite",
      ],
      interaction_type: [
        "appel",
        "email",
        "visite",
        "rdv",
        "autre",
        "a_revoir",
      ],
      lead_statut_enum: [
        "nouveau",
        "contacte",
        "qualifie",
        "proposition",
        "negociation",
        "gagne",
        "perdu",
      ],
    },
  },
} as const
