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
      entreprises: {
        Row: {
          activite: string | null
          administration: string | null
          adresse: string | null
          capital: number | null
          categorie_confidence: number | null
          categorie_qualifiee: string | null
          chiffre_affaires: number | null
          code_naf: string | null
          code_postal: string | null
          created_at: string | null
          date_demarrage: string | null
          date_enrichissement: string | null
          date_qualification: string | null
          dirigeant: string | null
          effectifs: number | null
          email: string | null
          enrichi: boolean | null
          forme_juridique: string | null
          id: string
          interlocuteur: string | null
          latitude: number | null
          longitude: number | null
          nom: string
          nom_voie: string | null
          numero_voie: string | null
          score_lead: number | null
          siret: string
          site_web: string | null
          sous_categorie: string | null
          statut: string | null
          telephone: string | null
          type_batiment: string | null
          type_voie: string | null
          updated_at: string | null
          ville: string | null
          zone_type: string | null
        }
        Insert: {
          activite?: string | null
          administration?: string | null
          adresse?: string | null
          capital?: number | null
          categorie_confidence?: number | null
          categorie_qualifiee?: string | null
          chiffre_affaires?: number | null
          code_naf?: string | null
          code_postal?: string | null
          created_at?: string | null
          date_demarrage?: string | null
          date_enrichissement?: string | null
          date_qualification?: string | null
          dirigeant?: string | null
          effectifs?: number | null
          email?: string | null
          enrichi?: boolean | null
          forme_juridique?: string | null
          id?: string
          interlocuteur?: string | null
          latitude?: number | null
          longitude?: number | null
          nom: string
          nom_voie?: string | null
          numero_voie?: string | null
          score_lead?: number | null
          siret: string
          site_web?: string | null
          sous_categorie?: string | null
          statut?: string | null
          telephone?: string | null
          type_batiment?: string | null
          type_voie?: string | null
          updated_at?: string | null
          ville?: string | null
          zone_type?: string | null
        }
        Update: {
          activite?: string | null
          administration?: string | null
          adresse?: string | null
          capital?: number | null
          categorie_confidence?: number | null
          categorie_qualifiee?: string | null
          chiffre_affaires?: number | null
          code_naf?: string | null
          code_postal?: string | null
          created_at?: string | null
          date_demarrage?: string | null
          date_enrichissement?: string | null
          date_qualification?: string | null
          dirigeant?: string | null
          effectifs?: number | null
          email?: string | null
          enrichi?: boolean | null
          forme_juridique?: string | null
          id?: string
          interlocuteur?: string | null
          latitude?: number | null
          longitude?: number | null
          nom?: string
          nom_voie?: string | null
          numero_voie?: string | null
          score_lead?: number | null
          siret?: string
          site_web?: string | null
          sous_categorie?: string | null
          statut?: string | null
          telephone?: string | null
          type_batiment?: string | null
          type_voie?: string | null
          updated_at?: string | null
          ville?: string | null
          zone_type?: string | null
        }
        Relationships: []
      }
      lead_interactions: {
        Row: {
          created_at: string
          date_prochaine_action: string | null
          entreprise_id: string
          id: string
          notes: string | null
          prochaine_action: string | null
          statut: Database["public"]["Enums"]["interaction_statut"]
          type: Database["public"]["Enums"]["interaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_prochaine_action?: string | null
          entreprise_id: string
          id?: string
          notes?: string | null
          prochaine_action?: string | null
          statut: Database["public"]["Enums"]["interaction_statut"]
          type: Database["public"]["Enums"]["interaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_prochaine_action?: string | null
          entreprise_id?: string
          id?: string
          notes?: string | null
          prochaine_action?: string | null
          statut?: Database["public"]["Enums"]["interaction_statut"]
          type?: Database["public"]["Enums"]["interaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_entreprise_id_fkey"
            columns: ["entreprise_id"]
            isOneToOne: false
            referencedRelation: "entreprises"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_statuts: {
        Row: {
          entreprise_id: string
          etape_pipeline: number
          id: string
          probabilite: number | null
          statut_actuel: Database["public"]["Enums"]["lead_statut_enum"]
          updated_at: string
          user_id: string
          valeur_estimee: number | null
        }
        Insert: {
          entreprise_id: string
          etape_pipeline?: number
          id?: string
          probabilite?: number | null
          statut_actuel?: Database["public"]["Enums"]["lead_statut_enum"]
          updated_at?: string
          user_id: string
          valeur_estimee?: number | null
        }
        Update: {
          entreprise_id?: string
          etape_pipeline?: number
          id?: string
          probabilite?: number | null
          statut_actuel?: Database["public"]["Enums"]["lead_statut_enum"]
          updated_at?: string
          user_id?: string
          valeur_estimee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_statuts_entreprise_id_fkey"
            columns: ["entreprise_id"]
            isOneToOne: false
            referencedRelation: "entreprises"
            referencedColumns: ["id"]
          },
        ]
      }
      qualification_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          failed_count: number
          id: string
          processed_count: number
          started_at: string
          status: string
          succeeded_count: number
          total_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          failed_count?: number
          id?: string
          processed_count?: number
          started_at?: string
          status?: string
          succeeded_count?: number
          total_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          failed_count?: number
          id?: string
          processed_count?: number
          started_at?: string
          status?: string
          succeeded_count?: number
          total_count?: number
          updated_at?: string
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
      tournee_visites: {
        Row: {
          a_revoir: boolean | null
          created_at: string | null
          entreprise_id: string
          id: string
          notes: string | null
          ordre_visite: number | null
          rdv_pris: boolean | null
          statut: string | null
          tournee_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          a_revoir?: boolean | null
          created_at?: string | null
          entreprise_id: string
          id?: string
          notes?: string | null
          ordre_visite?: number | null
          rdv_pris?: boolean | null
          statut?: string | null
          tournee_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          a_revoir?: boolean | null
          created_at?: string | null
          entreprise_id?: string
          id?: string
          notes?: string | null
          ordre_visite?: number | null
          rdv_pris?: boolean | null
          statut?: string | null
          tournee_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournee_visites_entreprise_id_fkey"
            columns: ["entreprise_id"]
            isOneToOne: false
            referencedRelation: "entreprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournee_visites_tournee_id_fkey"
            columns: ["tournee_id"]
            isOneToOne: false
            referencedRelation: "tournees"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
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
