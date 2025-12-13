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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      access_tokens: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          token: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          token: string
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          token?: string
        }
        Relationships: []
      }
      analytics_logs: {
        Row: {
          created_at: string | null
          filename: string | null
          id: number
          idempotency_key: string | null
          insight: string | null
          metadata: Json | null
          report_date: string
          status: string | null
          total_rows: number | null
        }
        Insert: {
          created_at?: string | null
          filename?: string | null
          id?: number
          idempotency_key?: string | null
          insight?: string | null
          metadata?: Json | null
          report_date: string
          status?: string | null
          total_rows?: number | null
        }
        Update: {
          created_at?: string | null
          filename?: string | null
          id?: number
          idempotency_key?: string | null
          insight?: string | null
          metadata?: Json | null
          report_date?: string
          status?: string | null
          total_rows?: number | null
        }
        Relationships: []
      }
      attendance_statuses: {
        Row: {
          id: number
          status: Database["public"]["Enums"]["enum"] | null
        }
        Insert: {
          id?: number
          status?: Database["public"]["Enums"]["enum"] | null
        }
        Update: {
          id?: number
          status?: Database["public"]["Enums"]["enum"] | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string | null
          id: number
          major_id: number | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          major_id?: number | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          major_id?: number | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_major_id_fkey"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          id: string
          message: string | null
          order_id: string | null
          supporter_email: string | null
          supporter_name: string | null
          unit: string | null
          verified: boolean | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          message?: string | null
          order_id?: string | null
          supporter_email?: string | null
          supporter_name?: string | null
          unit?: string | null
          verified?: boolean | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          message?: string | null
          order_id?: string | null
          supporter_email?: string | null
          supporter_name?: string | null
          unit?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      majors: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: number
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      student_attendances: {
        Row: {
          check_in: string | null
          check_out: string | null
          class_id: number | null
          date: string | null
          id: number
          note: string | null
          status_id: number | null
          student_id: number | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          class_id?: number | null
          date?: string | null
          id?: number
          note?: string | null
          status_id?: number | null
          student_id?: number | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          class_id?: number | null
          date?: string | null
          id?: number
          note?: string | null
          status_id?: number | null
          student_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_attendances_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendances_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "attendance_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          class_id: number | null
          full_name: string | null
          gender: string | null
          id: number
          nis: string | null
          phone_number: string | null
          unique_code: string | null
        }
        Insert: {
          class_id?: number | null
          full_name?: string | null
          gender?: string | null
          id?: number
          nis?: string | null
          phone_number?: string | null
          unique_code?: string | null
        }
        Update: {
          class_id?: number | null
          full_name?: string | null
          gender?: string | null
          id?: number
          nis?: string | null
          phone_number?: string | null
          unique_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_attendances: {
        Row: {
          check_in: string | null
          check_out: string | null
          date: string | null
          id: number
          note: string | null
          status_id: number | null
          teacher_id: number | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          date?: string | null
          id?: number
          note?: string | null
          status_id?: number | null
          teacher_id?: number | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          date?: string | null
          id?: number
          note?: string | null
          status_id?: number | null
          teacher_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_attendances_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "attendance_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_attendances_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          address: string | null
          full_name: string | null
          gender: string | null
          id: number
          nuptk: string | null
          phone_number: string | null
          unique_code: string | null
        }
        Insert: {
          address?: string | null
          full_name?: string | null
          gender?: string | null
          id?: number
          nuptk?: string | null
          phone_number?: string | null
          unique_code?: string | null
        }
        Update: {
          address?: string | null
          full_name?: string | null
          gender?: string | null
          id?: number
          nuptk?: string | null
          phone_number?: string | null
          unique_code?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string | null
          id: number
          is_superadmin: boolean | null
          password_hash: string | null
          reset_hash: string | null
          username: string | null
        }
        Insert: {
          email?: string | null
          id?: number
          is_superadmin?: boolean | null
          password_hash?: string | null
          reset_hash?: string | null
          username?: string | null
        }
        Update: {
          email?: string | null
          id?: number
          is_superadmin?: boolean | null
          password_hash?: string | null
          reset_hash?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      enum: "Hadir" | "Sakit" | "Izin" | "Tanpa Keterangan"
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
      enum: ["Hadir", "Sakit", "Izin", "Tanpa Keterangan"],
    },
  },
} as const
