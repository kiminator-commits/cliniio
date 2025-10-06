export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          facility_id: string;
          preferences: Json | null;
          last_login: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          date_of_birth: string | null;
          emergency_contact: Json | null;
          work_schedule: Json | null;
          total_points: number | null;
          mobile_shortcuts: Json | null;
          active_sessions: number | null;
          email: string | null;
          full_name: string | null;
          role: string | null;
          department: string | null;
          position: string | null;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          preferred_language: string | null;
          timezone: string | null;
          first_name: string | null;
          last_name: string | null;
        };
        Insert: {
          id?: string;
          facility_id: string;
          preferences?: Json | null;
          last_login?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          date_of_birth?: string | null;
          emergency_contact?: Json | null;
          work_schedule?: Json | null;
          total_points?: number | null;
          mobile_shortcuts?: Json | null;
          active_sessions?: number | null;
          email?: string | null;
          full_name?: string | null;
          role?: string | null;
          department?: string | null;
          position?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          preferred_language?: string | null;
          timezone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
        };
        Update: {
          id?: string;
          facility_id?: string;
          preferences?: Json | null;
          last_login?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          date_of_birth?: string | null;
          emergency_contact?: Json | null;
          work_schedule?: Json | null;
          total_points?: number | null;
          mobile_shortcuts?: Json | null;
          active_sessions?: number | null;
          email?: string | null;
          full_name?: string | null;
          role?: string | null;
          department?: string | null;
          position?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          preferred_language?: string | null;
          timezone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          reorder_point: number | null;
          facility_id: string | null;
          quantity: number | null;
          data: Json | null;
          created_at: string | null;
          updated_at: string | null;
          expiration_date: string | null;
          unit_cost: number | null;
          name: string | null;
          category: string | null;
          reorder_level: number | null;
          status: string | null;
        };
        Insert: {
          id?: string;
          reorder_point?: number | null;
          facility_id?: string | null;
          quantity?: number | null;
          data?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          expiration_date?: string | null;
          unit_cost?: number | null;
          name?: string | null;
          category?: string | null;
          reorder_level?: number | null;
          status?: string | null;
        };
        Update: {
          id?: string;
          reorder_point?: number | null;
          facility_id?: string | null;
          quantity?: number | null;
          data?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          expiration_date?: string | null;
          unit_cost?: number | null;
          name?: string | null;
          category?: string | null;
          reorder_level?: number | null;
          status?: string | null;
        };
      };
      sterilization_cycles: {
        Row: {
          temperature_celsius: number | null;
          id: string;
          facility_id: string;
          operator_id: string;
          start_time: string | null;
          end_time: string | null;
          duration_minutes: number | null;
          pressure_psi: number | null;
          parameters: Json | null;
          results: Json | null;
          created_at: string;
          updated_at: string;
          tools: Json | null;
          cycle_time: number | null;
          autoclave_id: string;
          tool_batch_id: string;
          cycle_type: string | null;
          cycle_number: string | null;
          status: string | null;
          notes: string | null;
        };
        Insert: {
          temperature_celsius?: number | null;
          id: string;
          facility_id: string;
          operator_id: string;
          start_time?: string | null;
          end_time?: string | null;
          duration_minutes?: number | null;
          pressure_psi?: number | null;
          parameters?: Json | null;
          results?: Json | null;
          created_at?: string;
          updated_at?: string;
          tools?: Json | null;
          cycle_time?: number | null;
          autoclave_id: string;
          tool_batch_id: string;
          cycle_type?: string | null;
          cycle_number?: string | null;
          status?: string | null;
          notes?: string | null;
        };
        Update: {
          temperature_celsius?: number | null;
          id?: string;
          facility_id?: string;
          operator_id?: string;
          start_time?: string | null;
          end_time?: string | null;
          duration_minutes?: number | null;
          pressure_psi?: number | null;
          parameters?: Json | null;
          results?: Json | null;
          created_at?: string;
          updated_at?: string;
          tools?: Json | null;
          cycle_time?: number | null;
          autoclave_id?: string;
          tool_batch_id?: string;
          cycle_type?: string | null;
          cycle_number?: string | null;
          status?: string | null;
          notes?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          session_id: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string | null;
          module: string | null;
          action: string | null;
          table_name: string | null;
          user_agent: string | null;
          user_id: string | null;
          facility_id: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          session_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string | null;
          module?: string | null;
          action?: string | null;
          table_name?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
          facility_id?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          session_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string | null;
          module?: string | null;
          action?: string | null;
          table_name?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
          facility_id?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      tools: {
        Row: {
          id: string;
          name: string | null;
          status: string | null;
          facility_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          status?: string | null;
          facility_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          status?: string | null;
          facility_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_roles: {
        Row: {
          id: string;
          name: string | null;
          description: string | null;
          permissions: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          description?: string | null;
          permissions?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          description?: string | null;
          permissions?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sterilization_batches: {
        Row: {
          id: string;
          batch_number: string | null;
          facility_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          batch_number?: string | null;
          facility_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          batch_number?: string | null;
          facility_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sterilization_sessions: {
        Row: {
          id: string;
          facility_id: string;
          cycle_id: string | null;
          start_time: string;
          end_time: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          facility_id: string;
          cycle_id?: string | null;
          start_time: string;
          end_time?: string | null;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          facility_id?: string;
          cycle_id?: string | null;
          start_time?: string;
          end_time?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sterilization_events: {
        Row: {
          id: string;
          session_id: string;
          facility_id: string;
          event_type: string;
          notes: string | null;
          occurred_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          facility_id: string;
          event_type: string;
          notes?: string | null;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          facility_id?: string;
          event_type?: string;
          notes?: string | null;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      tool_status: 'active' | 'inactive' | 'maintenance' | 'retired';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
