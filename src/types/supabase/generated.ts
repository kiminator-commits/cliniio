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
      activity_feed: {
        Row: {
          activity_description: string | null;
          activity_title: string | null;
          activity_type: string | null;
          created_at: string | null;
          facility_id: string | null;
          id: string;
          metadata: Json | null;
          module: string | null;
          related_record_id: string | null;
          related_record_type: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          activity_description?: string | null;
          activity_title?: string | null;
          activity_type?: string | null;
          created_at?: string | null;
          facility_id?: string | null;
          id: string;
          metadata?: Json | null;
          module?: string | null;
          related_record_id?: string | null;
          related_record_type?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          activity_description?: string | null;
          activity_title?: string | null;
          activity_type?: string | null;
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          metadata?: Json | null;
          module?: string | null;
          related_record_id?: string | null;
          related_record_type?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      ai_challenge_completions: {
        Row: {
          challenge_id: string | null;
          challenge_type: string | null;
          completed_at: string | null;
          created_at: string | null;
          data: Json | null;
          facility_id: string | null;
          id: string;
          rewards: Json | null;
          score: number | null;
          time_taken_ms: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          challenge_id?: string | null;
          challenge_type?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          data?: Json | null;
          facility_id?: string | null;
          id: string;
          rewards?: Json | null;
          score?: number | null;
          time_taken_ms?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          challenge_id?: string | null;
          challenge_type?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          data?: Json | null;
          facility_id?: string | null;
          id?: string;
          rewards?: Json | null;
          score?: number | null;
          time_taken_ms?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      ai_content_recommendations: {
        Row: {
          ai_confidence_score: number | null;
          ai_model_version: string | null;
          algorithm_used: string | null;
          click_count: number | null;
          click_through_rate: number | null;
          completion_count: number | null;
          completion_rate: number | null;
          confidence_level: number | null;
          content_context: Json | null;
          content_id: string | null;
          content_metadata: Json | null;
          created_at: string | null;
          display_count: number | null;
          expires_at: string | null;
          facility_id: string | null;
          feature_vector: Json | null;
          id: string;
          is_clicked: boolean | null;
          is_completed: boolean | null;
          is_displayed: boolean | null;
          last_ai_analysis: string | null;
          learning_context: string | null;
          model_version: string | null;
          reasoning: string | null;
          recommendation_algorithm: string | null;
          recommendation_reason: string | null;
          recommendation_score: number | null;
          recommendation_timing: string | null;
          recommendation_type: string | null;
          tags: string[] | null;
          updated_at: string | null;
          user_context: Json | null;
          user_feedback: string | null;
          user_feedback_rating: number | null;
          user_id: string | null;
        };
        Insert: {
          ai_confidence_score?: number | null;
          ai_model_version?: string | null;
          algorithm_used?: string | null;
          click_count?: number | null;
          click_through_rate?: number | null;
          completion_count?: number | null;
          completion_rate?: number | null;
          confidence_level?: number | null;
          content_context?: Json | null;
          content_id?: string | null;
          content_metadata?: Json | null;
          created_at?: string | null;
          display_count?: number | null;
          expires_at?: string | null;
          facility_id?: string | null;
          feature_vector?: Json | null;
          id: string;
          is_clicked?: boolean | null;
          is_completed?: boolean | null;
          is_displayed?: boolean | null;
          last_ai_analysis?: string | null;
          learning_context?: string | null;
          model_version?: string | null;
          reasoning?: string | null;
          recommendation_algorithm?: string | null;
          recommendation_reason?: string | null;
          recommendation_score?: number | null;
          recommendation_timing?: string | null;
          recommendation_type?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
          user_context?: Json | null;
          user_feedback?: string | null;
          user_feedback_rating?: number | null;
          user_id?: string | null;
        };
        Update: {
          ai_confidence_score?: number | null;
          ai_model_version?: string | null;
          algorithm_used?: string | null;
          click_count?: number | null;
          click_through_rate?: number | null;
          completion_count?: number | null;
          completion_rate?: number | null;
          confidence_level?: number | null;
          content_context?: Json | null;
          content_id?: string | null;
          content_metadata?: Json | null;
          created_at?: string | null;
          display_count?: number | null;
          expires_at?: string | null;
          facility_id?: string | null;
          feature_vector?: Json | null;
          id?: string;
          is_clicked?: boolean | null;
          is_completed?: boolean | null;
          is_displayed?: boolean | null;
          last_ai_analysis?: string | null;
          learning_context?: string | null;
          model_version?: string | null;
          reasoning?: string | null;
          recommendation_algorithm?: string | null;
          recommendation_reason?: string | null;
          recommendation_score?: number | null;
          recommendation_timing?: string | null;
          recommendation_type?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
          user_context?: Json | null;
          user_feedback?: string | null;
          user_feedback_rating?: number | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      ai_learning_analytics: {
        Row: {
          attention_metrics: Json | null;
          comprehension_indicators: Json | null;
          confidence_metrics: Json | null;
          content_items_accessed: string[] | null;
          created_at: string | null;
          difficulty_assessment: Json | null;
          engagement_score: number | null;
          facility_id: string | null;
          id: string;
          knowledge_gaps_identified: string[] | null;
          learning_path_progress: Json | null;
          learning_patterns: Json | null;
          model_predictions: Json | null;
          recommendation_effectiveness: Json | null;
          retention_indicators: Json | null;
          session_duration_minutes: number | null;
          session_end: string | null;
          session_id: string | null;
          session_start: string | null;
          skill_progression: Json | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          attention_metrics?: Json | null;
          comprehension_indicators?: Json | null;
          confidence_metrics?: Json | null;
          content_items_accessed?: string[] | null;
          created_at?: string | null;
          difficulty_assessment?: Json | null;
          engagement_score?: number | null;
          facility_id?: string | null;
          id: string;
          knowledge_gaps_identified?: string[] | null;
          learning_path_progress?: Json | null;
          learning_patterns?: Json | null;
          model_predictions?: Json | null;
          recommendation_effectiveness?: Json | null;
          retention_indicators?: Json | null;
          session_duration_minutes?: number | null;
          session_end?: string | null;
          session_id?: string | null;
          session_start?: string | null;
          skill_progression?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          attention_metrics?: Json | null;
          comprehension_indicators?: Json | null;
          confidence_metrics?: Json | null;
          content_items_accessed?: string[] | null;
          created_at?: string | null;
          difficulty_assessment?: Json | null;
          engagement_score?: number | null;
          facility_id?: string | null;
          id?: string;
          knowledge_gaps_identified?: string[] | null;
          learning_path_progress?: Json | null;
          learning_patterns?: Json | null;
          model_predictions?: Json | null;
          recommendation_effectiveness?: Json | null;
          retention_indicators?: Json | null;
          session_duration_minutes?: number | null;
          session_end?: string | null;
          session_id?: string | null;
          session_start?: string | null;
          skill_progression?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      ai_learning_insights: {
        Row: {
          ai_confidence_score: number | null;
          avoided_content_types: string[] | null;
          completion_rate_by_category: Json | null;
          content_affinity_scores: Json | null;
          content_interaction_patterns: Json | null;
          created_at: string | null;
          difficulty_progression: Json | null;
          facility_id: string | null;
          id: string;
          knowledge_retention_rate: number | null;
          last_ai_analysis: string | null;
          learning_efficiency_score: number | null;
          learning_preferences: Json | null;
          learning_recommendations: Json | null;
          model_version: string | null;
          next_learning_milestone: string | null;
          optimal_study_duration: number | null;
          preferred_content_categories: string[] | null;
          skill_gaps: string[] | null;
          study_patterns: Json | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          ai_confidence_score?: number | null;
          avoided_content_types?: string[] | null;
          completion_rate_by_category?: Json | null;
          content_affinity_scores?: Json | null;
          content_interaction_patterns?: Json | null;
          created_at?: string | null;
          difficulty_progression?: Json | null;
          facility_id?: string | null;
          id: string;
          knowledge_retention_rate?: number | null;
          last_ai_analysis?: string | null;
          learning_efficiency_score?: number | null;
          learning_preferences?: Json | null;
          learning_recommendations?: Json | null;
          model_version?: string | null;
          next_learning_milestone?: string | null;
          optimal_study_duration?: number | null;
          preferred_content_categories?: string[] | null;
          skill_gaps?: string[] | null;
          study_patterns?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          ai_confidence_score?: number | null;
          avoided_content_types?: string[] | null;
          completion_rate_by_category?: Json | null;
          content_affinity_scores?: Json | null;
          content_interaction_patterns?: Json | null;
          created_at?: string | null;
          difficulty_progression?: Json | null;
          facility_id?: string | null;
          id?: string;
          knowledge_retention_rate?: number | null;
          last_ai_analysis?: string | null;
          learning_efficiency_score?: number | null;
          learning_preferences?: Json | null;
          learning_recommendations?: Json | null;
          model_version?: string | null;
          next_learning_milestone?: string | null;
          optimal_study_duration?: number | null;
          preferred_content_categories?: string[] | null;
          skill_gaps?: string[] | null;
          study_patterns?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      ai_task_performance: {
        Row: {
          accuracy_score: number | null;
          completed_at: string | null;
          completion_time_ms: number | null;
          created_at: string | null;
          data: Json | null;
          facility_id: string | null;
          id: string;
          metadata: Json | null;
          task_id: string | null;
          task_type: string | null;
          updated_at: string | null;
          user_id: string | null;
          user_satisfaction: number | null;
        };
        Insert: {
          accuracy_score?: number | null;
          completed_at?: string | null;
          completion_time_ms?: number | null;
          created_at?: string | null;
          data?: Json | null;
          facility_id?: string | null;
          id: string;
          metadata?: Json | null;
          task_id?: string | null;
          task_type?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          user_satisfaction?: number | null;
        };
        Update: {
          accuracy_score?: number | null;
          completed_at?: string | null;
          completion_time_ms?: number | null;
          created_at?: string | null;
          data?: Json | null;
          facility_id?: string | null;
          id?: string;
          metadata?: Json | null;
          task_id?: string | null;
          task_type?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          user_satisfaction?: number | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: string | null;
          created_at: string;
          facility_id: string | null;
          id: string;
          ip_address: unknown | null;
          metadata: Json | null;
          module: string | null;
          new_values: Json | null;
          old_values: Json | null;
          record_id: string | null;
          session_id: string | null;
          table_name: string | null;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action?: string | null;
          created_at?: string;
          facility_id?: string | null;
          id: string;
          ip_address?: unknown | null;
          metadata?: Json | null;
          module?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          record_id?: string | null;
          session_id?: string | null;
          table_name?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string | null;
          created_at?: string;
          facility_id?: string | null;
          id?: string;
          ip_address?: unknown | null;
          metadata?: Json | null;
          module?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          record_id?: string | null;
          session_id?: string | null;
          table_name?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      autoclave_equipment: {
        Row: {
          created_at: string | null;
          facility_id: string | null;
          id: string;
          location: string | null;
          model: string | null;
          name: string | null;
          serial_number: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          facility_id?: string | null;
          id: string;
          location?: string | null;
          model?: string | null;
          name?: string | null;
          serial_number?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          location?: string | null;
          model?: string | null;
          name?: string | null;
          serial_number?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      autoclave_receipts: {
        Row: {
          autoclave_id: string | null;
          created_at: string | null;
          id: string;
          receipt_number: string;
        };
        Insert: {
          autoclave_id?: string | null;
          created_at?: string | null;
          id?: string;
          receipt_number: string;
        };
        Update: {
          autoclave_id?: string | null;
          created_at?: string | null;
          id?: string;
          receipt_number?: string;
        };
        Relationships: [];
      };
      autoclaves: {
        Row: {
          created_at: string | null;
          facility_id: string | null;
          id: string;
          model: string | null;
          name: string;
          serial_number: string | null;
        };
        Insert: {
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          model?: string | null;
          name: string;
          serial_number?: string | null;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          model?: string | null;
          name?: string;
          serial_number?: string | null;
        };
        Relationships: [];
      };
      barcode_counts: {
        Row: {
          code: string;
          count: number;
          created_at: string | null;
          id: string;
        };
        Insert: {
          code: string;
          count?: number;
          created_at?: string | null;
          id?: string;
        };
        Update: {
          code?: string;
          count?: number;
          created_at?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      bi_activity_log: {
        Row: {
          activity_type: string;
          created_at: string | null;
          description: string | null;
          facility_id: string;
          id: string;
          status: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          activity_type: string;
          created_at?: string | null;
          description?: string | null;
          facility_id: string;
          id?: string;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          activity_type?: string;
          created_at?: string | null;
          description?: string | null;
          facility_id?: string;
          id?: string;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'bi_activity_log_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
        ];
      };
      bi_failure_incidents: {
        Row: {
          created_at: string | null;
          cycle_id: string | null;
          description: string | null;
          detected_at: string | null;
          facility_id: string;
          failure_reason: string | null;
          id: string;
          incident_type: string;
          metadata: Json | null;
          resolved_at: string | null;
          severity: string;
          status: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          cycle_id?: string | null;
          description?: string | null;
          detected_at?: string | null;
          facility_id: string;
          failure_reason?: string | null;
          id?: string;
          incident_type: string;
          metadata?: Json | null;
          resolved_at?: string | null;
          severity: string;
          status: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          cycle_id?: string | null;
          description?: string | null;
          detected_at?: string | null;
          facility_id?: string;
          failure_reason?: string | null;
          id?: string;
          incident_type?: string;
          metadata?: Json | null;
          resolved_at?: string | null;
          severity?: string;
          status?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'bi_failure_incidents_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'sterilization_cycles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bi_failure_incidents_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bi_failure_incidents_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      bi_test_kits: {
        Row: {
          barcode: string | null;
          cost: number | null;
          created_at: string | null;
          created_by: string | null;
          expiry_date: string | null;
          facility_id: string | null;
          id: string;
          incubation_temperature_celsius: number | null;
          incubation_time_minutes: number | null;
          location: string | null;
          lot_number: string | null;
          manufacturer: string | null;
          max_quantity: number | null;
          min_quantity: number | null;
          name: string | null;
          notes: string | null;
          quantity: number | null;
          serial_number: string | null;
          status: string | null;
          supplier: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          barcode?: string | null;
          cost?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          expiry_date?: string | null;
          facility_id?: string | null;
          id: string;
          incubation_temperature_celsius?: number | null;
          incubation_time_minutes?: number | null;
          location?: string | null;
          lot_number?: string | null;
          manufacturer?: string | null;
          max_quantity?: number | null;
          min_quantity?: number | null;
          name?: string | null;
          notes?: string | null;
          quantity?: number | null;
          serial_number?: string | null;
          status?: string | null;
          supplier?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          barcode?: string | null;
          cost?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          expiry_date?: string | null;
          facility_id?: string | null;
          id?: string;
          incubation_temperature_celsius?: number | null;
          incubation_time_minutes?: number | null;
          location?: string | null;
          lot_number?: string | null;
          manufacturer?: string | null;
          max_quantity?: number | null;
          min_quantity?: number | null;
          name?: string | null;
          notes?: string | null;
          quantity?: number | null;
          serial_number?: string | null;
          status?: string | null;
          supplier?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      bi_test_results: {
        Row: {
          audit_signature: string | null;
          bi_expiry_date: string | null;
          bi_lot_number: string | null;
          compliance_notes: string | null;
          created_at: string | null;
          cycle_id: string | null;
          facility_id: string | null;
          failure_reason: string | null;
          id: string;
          incubation_temperature_celsius: number | null;
          incubation_time_minutes: number | null;
          operator_id: string | null;
          result: string | null;
          skip_reason: string | null;
          status: string | null;
          test_conditions: Json | null;
          test_date: string | null;
          test_number: string | null;
          updated_at: string | null;
        };
        Insert: {
          audit_signature?: string | null;
          bi_expiry_date?: string | null;
          bi_lot_number?: string | null;
          compliance_notes?: string | null;
          created_at?: string | null;
          cycle_id?: string | null;
          facility_id?: string | null;
          failure_reason?: string | null;
          id: string;
          incubation_temperature_celsius?: number | null;
          incubation_time_minutes?: number | null;
          operator_id?: string | null;
          result?: string | null;
          skip_reason?: string | null;
          status?: string | null;
          test_conditions?: Json | null;
          test_date?: string | null;
          test_number?: string | null;
          updated_at?: string | null;
        };
        Update: {
          audit_signature?: string | null;
          bi_expiry_date?: string | null;
          bi_lot_number?: string | null;
          compliance_notes?: string | null;
          created_at?: string | null;
          cycle_id?: string | null;
          facility_id?: string | null;
          failure_reason?: string | null;
          id?: string;
          incubation_temperature_celsius?: number | null;
          incubation_time_minutes?: number | null;
          operator_id?: string | null;
          result?: string | null;
          skip_reason?: string | null;
          status?: string | null;
          test_conditions?: Json | null;
          test_date?: string | null;
          test_number?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      biological_indicator_tests: {
        Row: {
          created_at: string | null;
          facility_id: string | null;
          id: string;
          notes: string | null;
          result: string | null;
          test_date: string;
        };
        Insert: {
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          notes?: string | null;
          result?: string | null;
          test_date?: string;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          notes?: string | null;
          result?: string | null;
          test_date?: string;
        };
        Relationships: [];
      };
      biological_indicators: {
        Row: {
          created_at: string | null;
          data: Json | null;
          facility_id: string | null;
          id: string;
          result: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          data?: Json | null;
          facility_id?: string | null;
          id: string;
          result?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          data?: Json | null;
          facility_id?: string | null;
          id?: string;
          result?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      certifications: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          issuing_organization: string | null;
          name: string | null;
          updated_at: string | null;
          user_id: string | null;
          valid_until: string | null;
          validity_period_months: number | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id: string;
          is_active?: boolean | null;
          issuing_organization?: string | null;
          name?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          valid_until?: string | null;
          validity_period_months?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          issuing_organization?: string | null;
          name?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          valid_until?: string | null;
          validity_period_months?: number | null;
        };
        Relationships: [];
      };
      cleaning_tasks: {
        Row: {
          compliance_score: number | null;
          created_at: string | null;
          description: string | null;
          facility_id: string | null;
          id: string;
          room_id: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          compliance_score?: number | null;
          created_at?: string | null;
          description?: string | null;
          facility_id?: string | null;
          id: string;
          room_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          compliance_score?: number | null;
          created_at?: string | null;
          description?: string | null;
          facility_id?: string | null;
          id?: string;
          room_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          archived_at: string | null;
          author_id: string | null;
          content: Json | null;
          content_type: string | null;
          created_at: string | null;
          department: string | null;
          description: string | null;
          difficulty_level: string | null;
          domain: string | null;
          estimated_duration_minutes: number | null;
          facility_id: string | null;
          id: string;
          is_active: boolean | null;
          is_repeat: boolean | null;
          learning_objectives: string[] | null;
          media: Json | null;
          points: number | null;
          prerequisites: string[] | null;
          published_at: string | null;
          status: string | null;
          tags: string[] | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          archived_at?: string | null;
          author_id?: string | null;
          content?: Json | null;
          content_type?: string | null;
          created_at?: string | null;
          department?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          domain?: string | null;
          estimated_duration_minutes?: number | null;
          facility_id?: string | null;
          id: string;
          is_active?: boolean | null;
          is_repeat?: boolean | null;
          learning_objectives?: string[] | null;
          media?: Json | null;
          points?: number | null;
          prerequisites?: string[] | null;
          published_at?: string | null;
          status?: string | null;
          tags?: string[] | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          archived_at?: string | null;
          author_id?: string | null;
          content?: Json | null;
          content_type?: string | null;
          created_at?: string | null;
          department?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          domain?: string | null;
          estimated_duration_minutes?: number | null;
          facility_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_repeat?: boolean | null;
          learning_objectives?: string[] | null;
          media?: Json | null;
          points?: number | null;
          prerequisites?: string[] | null;
          published_at?: string | null;
          status?: string | null;
          tags?: string[] | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'courses_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'courses_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
        ];
      };
      email_alert_queue: {
        Row: {
          body: string;
          created_at: string | null;
          id: string;
          recipient_email: string;
          status: string | null;
          subject: string;
        };
        Insert: {
          body: string;
          created_at?: string | null;
          id?: string;
          recipient_email: string;
          status?: string | null;
          subject: string;
        };
        Update: {
          body?: string;
          created_at?: string | null;
          id?: string;
          recipient_email?: string;
          status?: string | null;
          subject?: string;
        };
        Relationships: [];
      };
      environmental_cleaning_predefined_tasks: {
        Row: {
          category_id: string | null;
          compliance_requirements: string[] | null;
          created_at: string | null;
          created_by: string | null;
          estimated_duration_minutes: number | null;
          facility_id: string | null;
          id: string;
          is_active: boolean | null;
          is_required: boolean | null;
          quality_checkpoints: string[] | null;
          required_equipment: string[] | null;
          required_supplies: string[] | null;
          safety_notes: string | null;
          task_description: string | null;
          task_name: string | null;
          task_order: number | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          category_id?: string | null;
          compliance_requirements?: string[] | null;
          created_at?: string | null;
          created_by?: string | null;
          estimated_duration_minutes?: number | null;
          facility_id?: string | null;
          id: string;
          is_active?: boolean | null;
          is_required?: boolean | null;
          quality_checkpoints?: string[] | null;
          required_equipment?: string[] | null;
          required_supplies?: string[] | null;
          safety_notes?: string | null;
          task_description?: string | null;
          task_name?: string | null;
          task_order?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          category_id?: string | null;
          compliance_requirements?: string[] | null;
          created_at?: string | null;
          created_by?: string | null;
          estimated_duration_minutes?: number | null;
          facility_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_required?: boolean | null;
          quality_checkpoints?: string[] | null;
          required_equipment?: string[] | null;
          required_supplies?: string[] | null;
          safety_notes?: string | null;
          task_description?: string | null;
          task_name?: string | null;
          task_order?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      environmental_cleaning_task_categories: {
        Row: {
          color: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          facility_id: string | null;
          icon: string | null;
          id: string;
          is_active: boolean | null;
          name: string | null;
          sort_order: number | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          facility_id?: string | null;
          icon?: string | null;
          id: string;
          is_active?: boolean | null;
          name?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          facility_id?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      environmental_cleaning_task_details: {
        Row: {
          completed_at: string | null;
          completed_by: string | null;
          compliance_verified: boolean | null;
          created_at: string | null;
          created_by: string | null;
          duration_minutes: number | null;
          end_time: string | null;
          environmental_clean_id: string | null;
          facility_id: string | null;
          id: string;
          is_completed: boolean | null;
          is_required: boolean | null;
          notes: string | null;
          photos: Json | null;
          quality_score: number | null;
          start_time: string | null;
          task_description: string | null;
          task_name: string | null;
          task_order: number | null;
          updated_at: string | null;
          updated_by: string | null;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          completed_at?: string | null;
          completed_by?: string | null;
          compliance_verified?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          duration_minutes?: number | null;
          end_time?: string | null;
          environmental_clean_id?: string | null;
          facility_id?: string | null;
          id: string;
          is_completed?: boolean | null;
          is_required?: boolean | null;
          notes?: string | null;
          photos?: Json | null;
          quality_score?: number | null;
          start_time?: string | null;
          task_description?: string | null;
          task_name?: string | null;
          task_order?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          completed_at?: string | null;
          completed_by?: string | null;
          compliance_verified?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          duration_minutes?: number | null;
          end_time?: string | null;
          environmental_clean_id?: string | null;
          facility_id?: string | null;
          id?: string;
          is_completed?: boolean | null;
          is_required?: boolean | null;
          notes?: string | null;
          photos?: Json | null;
          quality_score?: number | null;
          start_time?: string | null;
          task_description?: string | null;
          task_name?: string | null;
          task_order?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [];
      };
      environmental_cleans_enhanced: {
        Row: {
          checklist_items: Json | null;
          cleaner_id: string | null;
          cleaning_type: string | null;
          completed_items: Json | null;
          completed_time: string | null;
          compliance_notes: string | null;
          compliance_score: number | null;
          corrective_actions: Json | null;
          created_at: string | null;
          created_by: string | null;
          equipment_used: Json | null;
          facility_id: string | null;
          failed_items: Json | null;
          id: string;
          inventory_usage: Json | null;
          notes: string | null;
          photos: Json | null;
          quality_issues: Json | null;
          quality_score: number | null;
          room_id: string | null;
          room_name: string | null;
          scheduled_time: string | null;
          started_time: string | null;
          status: string | null;
          supervisor_notes: string | null;
          supervisor_review_at: string | null;
          supervisor_review_by: string | null;
          supplies_consumed: Json | null;
          task_completion_details: Json | null;
          task_durations: Json | null;
          task_end_times: Json | null;
          task_start_times: Json | null;
          updated_at: string | null;
          updated_by: string | null;
          user_activities: Json | null;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          checklist_items?: Json | null;
          cleaner_id?: string | null;
          cleaning_type?: string | null;
          completed_items?: Json | null;
          completed_time?: string | null;
          compliance_notes?: string | null;
          compliance_score?: number | null;
          corrective_actions?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          equipment_used?: Json | null;
          facility_id?: string | null;
          failed_items?: Json | null;
          id: string;
          inventory_usage?: Json | null;
          notes?: string | null;
          photos?: Json | null;
          quality_issues?: Json | null;
          quality_score?: number | null;
          room_id?: string | null;
          room_name?: string | null;
          scheduled_time?: string | null;
          started_time?: string | null;
          status?: string | null;
          supervisor_notes?: string | null;
          supervisor_review_at?: string | null;
          supervisor_review_by?: string | null;
          supplies_consumed?: Json | null;
          task_completion_details?: Json | null;
          task_durations?: Json | null;
          task_end_times?: Json | null;
          task_start_times?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
          user_activities?: Json | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          checklist_items?: Json | null;
          cleaner_id?: string | null;
          cleaning_type?: string | null;
          completed_items?: Json | null;
          completed_time?: string | null;
          compliance_notes?: string | null;
          compliance_score?: number | null;
          corrective_actions?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          equipment_used?: Json | null;
          facility_id?: string | null;
          failed_items?: Json | null;
          id?: string;
          inventory_usage?: Json | null;
          notes?: string | null;
          photos?: Json | null;
          quality_issues?: Json | null;
          quality_score?: number | null;
          room_id?: string | null;
          room_name?: string | null;
          scheduled_time?: string | null;
          started_time?: string | null;
          status?: string | null;
          supervisor_notes?: string | null;
          supervisor_review_at?: string | null;
          supervisor_review_by?: string | null;
          supplies_consumed?: Json | null;
          task_completion_details?: Json | null;
          task_durations?: Json | null;
          task_end_times?: Json | null;
          task_start_times?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
          user_activities?: Json | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [];
      };
      equipment_maintenance: {
        Row: {
          completed_date: string | null;
          cost: number | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          equipment_id: string | null;
          facility_id: string | null;
          id: string;
          maintenance_type: string | null;
          scheduled_date: string | null;
          status: string | null;
          technician: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          completed_date?: string | null;
          cost?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          equipment_id?: string | null;
          facility_id?: string | null;
          id: string;
          maintenance_type?: string | null;
          scheduled_date?: string | null;
          status?: string | null;
          technician?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          completed_date?: string | null;
          cost?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          equipment_id?: string | null;
          facility_id?: string | null;
          id?: string;
          maintenance_type?: string | null;
          scheduled_date?: string | null;
          status?: string | null;
          technician?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      error_logs: {
        Row: {
          context: Json | null;
          created_at: string | null;
          id: string;
          message: string;
          stack_trace: string | null;
        };
        Insert: {
          context?: Json | null;
          created_at?: string | null;
          id?: string;
          message: string;
          stack_trace?: string | null;
        };
        Update: {
          context?: Json | null;
          created_at?: string | null;
          id?: string;
          message?: string;
          stack_trace?: string | null;
        };
        Relationships: [];
      };
      error_reports: {
        Row: {
          context: string | null;
          created_at: string | null;
          created_by: string | null;
          error_message: string | null;
          error_stack: string | null;
          facility_id: string | null;
          id: string;
          metadata: Json | null;
          updated_at: string | null;
          updated_by: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          context?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          error_message?: string | null;
          error_stack?: string | null;
          facility_id?: string | null;
          id: string;
          metadata?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          context?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          error_message?: string | null;
          error_stack?: string | null;
          facility_id?: string | null;
          id?: string;
          metadata?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      facilities: {
        Row: {
          address: Json | null;
          contact_info: Json | null;
          created_at: string;
          created_by: string | null;
          hourly_rate: number | null;
          id: string;
          is_active: boolean | null;
          name: string | null;
          settings: Json | null;
          staff_count: number | null;
          subscription_tier: string | null;
          type: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          address?: Json | null;
          contact_info?: Json | null;
          created_at?: string;
          created_by?: string | null;
          hourly_rate?: number | null;
          id: string;
          is_active?: boolean | null;
          name?: string | null;
          settings?: Json | null;
          staff_count?: number | null;
          subscription_tier?: string | null;
          type?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          address?: Json | null;
          contact_info?: Json | null;
          created_at?: string;
          created_by?: string | null;
          hourly_rate?: number | null;
          id?: string;
          is_active?: boolean | null;
          name?: string | null;
          settings?: Json | null;
          staff_count?: number | null;
          subscription_tier?: string | null;
          type?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      facility_compliance_settings: {
        Row: {
          allow_overrides: boolean | null;
          created_at: string | null;
          enforce_bi: boolean | null;
          enforce_ci: boolean | null;
          facility_id: string;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          allow_overrides?: boolean | null;
          created_at?: string | null;
          enforce_bi?: boolean | null;
          enforce_ci?: boolean | null;
          facility_id: string;
          id?: string;
          updated_at?: string | null;
        };
        Update: {
          allow_overrides?: boolean | null;
          created_at?: string | null;
          enforce_bi?: boolean | null;
          enforce_ci?: boolean | null;
          facility_id?: string;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'facility_compliance_settings_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
        ];
      };
      facility_notification_config: {
        Row: {
          auto_notification_enabled: boolean | null;
          created_at: string | null;
          created_by: string | null;
          email_service_config: Json | null;
          escalation_levels: Json | null;
          facility_id: string | null;
          id: string;
          notification_channels: string[] | null;
          notification_delay_minutes: number | null;
          regulatory_bodies: string[] | null;
          sms_service_config: Json | null;
          updated_at: string | null;
          updated_by: string | null;
          webhook_service_config: Json | null;
        };
        Insert: {
          auto_notification_enabled?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          email_service_config?: Json | null;
          escalation_levels?: Json | null;
          facility_id?: string | null;
          id: string;
          notification_channels?: string[] | null;
          notification_delay_minutes?: number | null;
          regulatory_bodies?: string[] | null;
          sms_service_config?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
          webhook_service_config?: Json | null;
        };
        Update: {
          auto_notification_enabled?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          email_service_config?: Json | null;
          escalation_levels?: Json | null;
          facility_id?: string | null;
          id?: string;
          notification_channels?: string[] | null;
          notification_delay_minutes?: number | null;
          regulatory_bodies?: string[] | null;
          sms_service_config?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
          webhook_service_config?: Json | null;
        };
        Relationships: [];
      };
      facility_office_hours: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          end_hour: number | null;
          facility_id: string | null;
          id: string;
          open_holidays: boolean | null;
          start_hour: number | null;
          timezone: string | null;
          updated_at: string | null;
          updated_by: string | null;
          working_days: Json | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          end_hour?: number | null;
          facility_id?: string | null;
          id: string;
          open_holidays?: boolean | null;
          start_hour?: number | null;
          timezone?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          working_days?: Json | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          end_hour?: number | null;
          facility_id?: string | null;
          id?: string;
          open_holidays?: boolean | null;
          start_hour?: number | null;
          timezone?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          working_days?: Json | null;
        };
        Relationships: [];
      };
      home_challenge_completions: {
        Row: {
          challenge_id: string | null;
          completed_at: string | null;
          created_at: string | null;
          created_by: string | null;
          facility_id: string | null;
          id: string;
          points_earned: number | null;
          updated_at: string | null;
          updated_by: string | null;
          user_id: string | null;
        };
        Insert: {
          challenge_id?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          facility_id?: string | null;
          id: string;
          points_earned?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
          user_id?: string | null;
        };
        Update: {
          challenge_id?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          facility_id?: string | null;
          id?: string;
          points_earned?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      home_challenges: {
        Row: {
          category: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          difficulty: string | null;
          facility_id: string | null;
          id: string;
          is_active: boolean | null;
          points: number | null;
          time_estimate: string | null;
          title: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          difficulty?: string | null;
          facility_id?: string | null;
          id: string;
          is_active?: boolean | null;
          points?: number | null;
          time_estimate?: string | null;
          title?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          difficulty?: string | null;
          facility_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          points?: number | null;
          time_estimate?: string | null;
          title?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      home_daily_operations_tasks: {
        Row: {
          actual_duration: number | null;
          assigned_to: string | null;
          category: string | null;
          completed: boolean | null;
          completed_at: string | null;
          completed_by: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          due_date: string | null;
          estimated_duration: number | null;
          facility_id: string | null;
          id: string;
          points: number | null;
          priority: string | null;
          status: string | null;
          title: string | null;
          type: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          actual_duration?: number | null;
          assigned_to?: string | null;
          category?: string | null;
          completed?: boolean | null;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          estimated_duration?: number | null;
          facility_id?: string | null;
          id: string;
          points?: number | null;
          priority?: string | null;
          status?: string | null;
          title?: string | null;
          type?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          actual_duration?: number | null;
          assigned_to?: string | null;
          category?: string | null;
          completed?: boolean | null;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          estimated_duration?: number | null;
          facility_id?: string | null;
          id?: string;
          points?: number | null;
          priority?: string | null;
          status?: string | null;
          title?: string | null;
          type?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      inventory_ai_barcode_analysis: {
        Row: {
          analysis_result: Json | null;
          created_at: string | null;
          id: string;
          item_id: string | null;
        };
        Insert: {
          analysis_result?: Json | null;
          created_at?: string | null;
          id?: string;
          item_id?: string | null;
        };
        Update: {
          analysis_result?: Json | null;
          created_at?: string | null;
          id?: string;
          item_id?: string | null;
        };
        Relationships: [];
      };
      inventory_ai_settings: {
        Row: {
          ai_confidence_threshold: number | null;
          ai_data_retention_days: number | null;
          ai_enabled: boolean | null;
          ai_model_training: boolean | null;
          ai_version: string | null;
          anomaly_detection_enabled: boolean | null;
          audit_trail_enhancement_enabled: boolean | null;
          auto_classification_enabled: boolean | null;
          auto_optimization_enabled: boolean | null;
          azure_computer_vision_key_encrypted: string | null;
          barcode_scanning_enabled: boolean | null;
          compliance_monitoring_enabled: boolean | null;
          computer_vision_enabled: boolean | null;
          cost_optimization_enabled: boolean | null;
          created_at: string | null;
          created_by: string | null;
          cycle_optimization_enabled: boolean | null;
          damage_detection_enabled: boolean | null;
          data_sharing_enabled: boolean | null;
          demand_forecasting_enabled: boolean | null;
          encrypted_data_transmission: boolean | null;
          error_prevention_enabled: boolean | null;
          facility_id: string | null;
          google_vision_api_key_encrypted: string | null;
          id: string;
          image_recognition_enabled: boolean | null;
          intelligent_workflow_enabled: boolean | null;
          inventory_counting_enabled: boolean | null;
          local_ai_processing_enabled: boolean | null;
          maintenance_prediction_enabled: boolean | null;
          multi_format_barcode_support: boolean | null;
          openai_api_key_encrypted: string | null;
          performance_monitoring: boolean | null;
          predictive_analytics_enabled: boolean | null;
          predictive_maintenance_enabled: boolean | null;
          quality_assessment_enabled: boolean | null;
          quality_assurance_enabled: boolean | null;
          real_time_monitoring_enabled: boolean | null;
          real_time_processing_enabled: boolean | null;
          resource_optimization: boolean | null;
          risk_assessment_enabled: boolean | null;
          scanner_intelligence_enabled: boolean | null;
          seasonal_analysis_enabled: boolean | null;
          smart_categorization_enabled: boolean | null;
          smart_form_filling_enabled: boolean | null;
          smart_notifications_enabled: boolean | null;
          smart_validation_enabled: boolean | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          ai_confidence_threshold?: number | null;
          ai_data_retention_days?: number | null;
          ai_enabled?: boolean | null;
          ai_model_training?: boolean | null;
          ai_version?: string | null;
          anomaly_detection_enabled?: boolean | null;
          audit_trail_enhancement_enabled?: boolean | null;
          auto_classification_enabled?: boolean | null;
          auto_optimization_enabled?: boolean | null;
          azure_computer_vision_key_encrypted?: string | null;
          barcode_scanning_enabled?: boolean | null;
          compliance_monitoring_enabled?: boolean | null;
          computer_vision_enabled?: boolean | null;
          cost_optimization_enabled?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          cycle_optimization_enabled?: boolean | null;
          damage_detection_enabled?: boolean | null;
          data_sharing_enabled?: boolean | null;
          demand_forecasting_enabled?: boolean | null;
          encrypted_data_transmission?: boolean | null;
          error_prevention_enabled?: boolean | null;
          facility_id?: string | null;
          google_vision_api_key_encrypted?: string | null;
          id: string;
          image_recognition_enabled?: boolean | null;
          intelligent_workflow_enabled?: boolean | null;
          inventory_counting_enabled?: boolean | null;
          local_ai_processing_enabled?: boolean | null;
          maintenance_prediction_enabled?: boolean | null;
          multi_format_barcode_support?: boolean | null;
          openai_api_key_encrypted?: string | null;
          performance_monitoring?: boolean | null;
          predictive_analytics_enabled?: boolean | null;
          predictive_maintenance_enabled?: boolean | null;
          quality_assessment_enabled?: boolean | null;
          quality_assurance_enabled?: boolean | null;
          real_time_monitoring_enabled?: boolean | null;
          real_time_processing_enabled?: boolean | null;
          resource_optimization?: boolean | null;
          risk_assessment_enabled?: boolean | null;
          scanner_intelligence_enabled?: boolean | null;
          seasonal_analysis_enabled?: boolean | null;
          smart_categorization_enabled?: boolean | null;
          smart_form_filling_enabled?: boolean | null;
          smart_notifications_enabled?: boolean | null;
          smart_validation_enabled?: boolean | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          ai_confidence_threshold?: number | null;
          ai_data_retention_days?: number | null;
          ai_enabled?: boolean | null;
          ai_model_training?: boolean | null;
          ai_version?: string | null;
          anomaly_detection_enabled?: boolean | null;
          audit_trail_enhancement_enabled?: boolean | null;
          auto_classification_enabled?: boolean | null;
          auto_optimization_enabled?: boolean | null;
          azure_computer_vision_key_encrypted?: string | null;
          barcode_scanning_enabled?: boolean | null;
          compliance_monitoring_enabled?: boolean | null;
          computer_vision_enabled?: boolean | null;
          cost_optimization_enabled?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          cycle_optimization_enabled?: boolean | null;
          damage_detection_enabled?: boolean | null;
          data_sharing_enabled?: boolean | null;
          demand_forecasting_enabled?: boolean | null;
          encrypted_data_transmission?: boolean | null;
          error_prevention_enabled?: boolean | null;
          facility_id?: string | null;
          google_vision_api_key_encrypted?: string | null;
          id?: string;
          image_recognition_enabled?: boolean | null;
          intelligent_workflow_enabled?: boolean | null;
          inventory_counting_enabled?: boolean | null;
          local_ai_processing_enabled?: boolean | null;
          maintenance_prediction_enabled?: boolean | null;
          multi_format_barcode_support?: boolean | null;
          openai_api_key_encrypted?: string | null;
          performance_monitoring?: boolean | null;
          predictive_analytics_enabled?: boolean | null;
          predictive_maintenance_enabled?: boolean | null;
          quality_assessment_enabled?: boolean | null;
          quality_assurance_enabled?: boolean | null;
          real_time_monitoring_enabled?: boolean | null;
          real_time_processing_enabled?: boolean | null;
          resource_optimization?: boolean | null;
          risk_assessment_enabled?: boolean | null;
          scanner_intelligence_enabled?: boolean | null;
          seasonal_analysis_enabled?: boolean | null;
          smart_categorization_enabled?: boolean | null;
          smart_form_filling_enabled?: boolean | null;
          smart_notifications_enabled?: boolean | null;
          smart_validation_enabled?: boolean | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      inventory_checks: {
        Row: {
          accuracy: number | null;
          created_at: string | null;
          data: Json | null;
          facility_id: string | null;
          id: string;
          items_checked: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          accuracy?: number | null;
          created_at?: string | null;
          data?: Json | null;
          facility_id?: string | null;
          id: string;
          items_checked?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          accuracy?: number | null;
          created_at?: string | null;
          data?: Json | null;
          facility_id?: string | null;
          id?: string;
          items_checked?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          category: string | null;
          created_at: string | null;
          data: Json | null;
          expiration_date: string | null;
          facility_id: string | null;
          id: string;
          name: string | null;
          quantity: number | null;
          reorder_point: number | null;
          unit_cost: number | null;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          data?: Json | null;
          expiration_date?: string | null;
          facility_id?: string | null;
          id: string;
          name?: string | null;
          quantity?: number | null;
          reorder_point?: number | null;
          unit_cost?: number | null;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          data?: Json | null;
          expiration_date?: string | null;
          facility_id?: string | null;
          id?: string;
          name?: string | null;
          quantity?: number | null;
          reorder_point?: number | null;
          unit_cost?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      inventory_orders: {
        Row: {
          created_at: string | null;
          data: Json | null;
          facility_id: string | null;
          id: string;
          status: string | null;
          total_items: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          data?: Json | null;
          facility_id?: string | null;
          id: string;
          status?: string | null;
          total_items?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          data?: Json | null;
          facility_id?: string | null;
          id?: string;
          status?: string | null;
          total_items?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      knowledge_article_ratings: {
        Row: {
          article_id: string | null;
          created_at: string | null;
          id: string;
          rating: number | null;
          review: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          article_id?: string | null;
          created_at?: string | null;
          id: string;
          rating?: number | null;
          review?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          article_id?: string | null;
          created_at?: string | null;
          id?: string;
          rating?: number | null;
          review?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      knowledge_article_views: {
        Row: {
          article_id: string | null;
          created_at: string | null;
          id: string;
          ip_address: unknown | null;
          session_id: string | null;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string | null;
          view_duration_seconds: number | null;
        };
        Insert: {
          article_id?: string | null;
          created_at?: string | null;
          id: string;
          ip_address?: unknown | null;
          session_id?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
          view_duration_seconds?: number | null;
        };
        Update: {
          article_id?: string | null;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown | null;
          session_id?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
          view_duration_seconds?: number | null;
        };
        Relationships: [];
      };
      knowledge_articles: {
        Row: {
          allow_comments: boolean | null;
          author_id: string | null;
          category_id: string | null;
          content: string | null;
          created_at: string | null;
          created_by: string | null;
          difficulty_level: string | null;
          editor_id: string | null;
          facility_id: string | null;
          featured: boolean | null;
          id: string;
          last_modified_at: string | null;
          published_at: string | null;
          reading_time_minutes: number | null;
          seo_description: string | null;
          seo_keywords: string[] | null;
          seo_title: string | null;
          status: string | null;
          summary: string | null;
          tags: string[] | null;
          title: string | null;
          updated_at: string | null;
          updated_by: string | null;
          version: number | null;
          visibility: string | null;
        };
        Insert: {
          allow_comments?: boolean | null;
          author_id?: string | null;
          category_id?: string | null;
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          difficulty_level?: string | null;
          editor_id?: string | null;
          facility_id?: string | null;
          featured?: boolean | null;
          id: string;
          last_modified_at?: string | null;
          published_at?: string | null;
          reading_time_minutes?: number | null;
          seo_description?: string | null;
          seo_keywords?: string[] | null;
          seo_title?: string | null;
          status?: string | null;
          summary?: string | null;
          tags?: string[] | null;
          title?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: number | null;
          visibility?: string | null;
        };
        Update: {
          allow_comments?: boolean | null;
          author_id?: string | null;
          category_id?: string | null;
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          difficulty_level?: string | null;
          editor_id?: string | null;
          facility_id?: string | null;
          featured?: boolean | null;
          id?: string;
          last_modified_at?: string | null;
          published_at?: string | null;
          reading_time_minutes?: number | null;
          seo_description?: string | null;
          seo_keywords?: string[] | null;
          seo_title?: string | null;
          status?: string | null;
          summary?: string | null;
          tags?: string[] | null;
          title?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: number | null;
          visibility?: string | null;
        };
        Relationships: [];
      };
      knowledge_bookmarks: {
        Row: {
          article_id: string | null;
          created_at: string | null;
          folder_name: string | null;
          id: string;
          notes: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          article_id?: string | null;
          created_at?: string | null;
          folder_name?: string | null;
          id: string;
          notes?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          article_id?: string | null;
          created_at?: string | null;
          folder_name?: string | null;
          id?: string;
          notes?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      knowledge_categories: {
        Row: {
          color: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          facility_id: string | null;
          icon: string | null;
          id: string;
          is_active: boolean | null;
          name: string | null;
          parent_category_id: string | null;
          sort_order: number | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          facility_id?: string | null;
          icon?: string | null;
          id: string;
          is_active?: boolean | null;
          name?: string | null;
          parent_category_id?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          facility_id?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string | null;
          parent_category_id?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      knowledge_hub_content: {
        Row: {
          category: string | null;
          content_type: string | null;
          created_at: string | null;
          created_by: string | null;
          department: string | null;
          description: string | null;
          difficulty_level: string | null;
          domain: string | null;
          due_date: string | null;
          estimated_duration: number | null;
          facility_id: string | null;
          id: string;
          is_active: boolean | null;
          mandatory_repeat: boolean | null;
          passing_score: number | null;
          progress: number | null;
          repeat_settings: Json | null;
          status: string | null;
          tags: string[] | null;
          title: string | null;
          type: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          category?: string | null;
          content_type?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          department?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          domain?: string | null;
          due_date?: string | null;
          estimated_duration?: number | null;
          facility_id?: string | null;
          id: string;
          is_active?: boolean | null;
          mandatory_repeat?: boolean | null;
          passing_score?: number | null;
          progress?: number | null;
          repeat_settings?: Json | null;
          status?: string | null;
          tags?: string[] | null;
          title?: string | null;
          type?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          category?: string | null;
          content_type?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          department?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          domain?: string | null;
          due_date?: string | null;
          estimated_duration?: number | null;
          facility_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          mandatory_repeat?: boolean | null;
          passing_score?: number | null;
          progress?: number | null;
          repeat_settings?: Json | null;
          status?: string | null;
          tags?: string[] | null;
          title?: string | null;
          type?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      knowledge_hub_user_progress: {
        Row: {
          assigned_at: string | null;
          attempts_count: number | null;
          completed_at: string | null;
          content_id: string | null;
          content_type: string | null;
          created_at: string | null;
          due_date: string | null;
          id: string;
          is_repeat: boolean | null;
          last_accessed: string | null;
          last_completed_at: string | null;
          metadata: Json | null;
          notes: string | null;
          progress_percentage: number | null;
          repeat_count: number | null;
          score: number | null;
          started_at: string | null;
          status: string | null;
          time_spent: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          assigned_at?: string | null;
          attempts_count?: number | null;
          completed_at?: string | null;
          content_id?: string | null;
          content_type?: string | null;
          created_at?: string | null;
          due_date?: string | null;
          id: string;
          is_repeat?: boolean | null;
          last_accessed?: string | null;
          last_completed_at?: string | null;
          metadata?: Json | null;
          notes?: string | null;
          progress_percentage?: number | null;
          repeat_count?: number | null;
          score?: number | null;
          started_at?: string | null;
          status?: string | null;
          time_spent?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          assigned_at?: string | null;
          attempts_count?: number | null;
          completed_at?: string | null;
          content_id?: string | null;
          content_type?: string | null;
          created_at?: string | null;
          due_date?: string | null;
          id?: string;
          is_repeat?: boolean | null;
          last_accessed?: string | null;
          last_completed_at?: string | null;
          metadata?: Json | null;
          notes?: string | null;
          progress_percentage?: number | null;
          repeat_count?: number | null;
          score?: number | null;
          started_at?: string | null;
          status?: string | null;
          time_spent?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      knowledge_learning_paths: {
        Row: {
          category_id: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          difficulty_level: string | null;
          estimated_duration_hours: number | null;
          facility_id: string | null;
          featured: boolean | null;
          id: string;
          is_active: boolean | null;
          title: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          estimated_duration_hours?: number | null;
          facility_id?: string | null;
          featured?: boolean | null;
          id: string;
          is_active?: boolean | null;
          title?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          category_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          estimated_duration_hours?: number | null;
          facility_id?: string | null;
          featured?: boolean | null;
          id?: string;
          is_active?: boolean | null;
          title?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      knowledge_quiz_attempts: {
        Row: {
          answers: Json | null;
          attempt_number: number | null;
          completed_at: string | null;
          earned_points: number | null;
          id: string;
          quiz_id: string | null;
          score_percentage: number | null;
          started_at: string | null;
          status: string | null;
          time_taken_minutes: number | null;
          total_points: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          answers?: Json | null;
          attempt_number?: number | null;
          completed_at?: string | null;
          earned_points?: number | null;
          id: string;
          quiz_id?: string | null;
          score_percentage?: number | null;
          started_at?: string | null;
          status?: string | null;
          time_taken_minutes?: number | null;
          total_points?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          answers?: Json | null;
          attempt_number?: number | null;
          completed_at?: string | null;
          earned_points?: number | null;
          id?: string;
          quiz_id?: string | null;
          score_percentage?: number | null;
          started_at?: string | null;
          status?: string | null;
          time_taken_minutes?: number | null;
          total_points?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'knowledge_quiz_attempts_quiz_id_fkey';
            columns: ['quiz_id'];
            isOneToOne: false;
            referencedRelation: 'knowledge_quizzes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'knowledge_quiz_attempts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      knowledge_quizzes: {
        Row: {
          category_id: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          difficulty_level: string | null;
          facility_id: string | null;
          id: string;
          is_active: boolean | null;
          max_attempts: number | null;
          passing_score_percentage: number | null;
          time_limit_minutes: number | null;
          title: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          facility_id?: string | null;
          id: string;
          is_active?: boolean | null;
          max_attempts?: number | null;
          passing_score_percentage?: number | null;
          time_limit_minutes?: number | null;
          title?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          category_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          facility_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_attempts?: number | null;
          passing_score_percentage?: number | null;
          time_limit_minutes?: number | null;
          title?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'knowledge_quizzes_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'knowledge_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'knowledge_quizzes_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'knowledge_quizzes_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'knowledge_quizzes_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      knowledge_user_progress: {
        Row: {
          article_id: string | null;
          completed_at: string | null;
          completion_percentage: number | null;
          created_at: string | null;
          id: string;
          learning_path_id: string | null;
          notes: string | null;
          progress_status: string | null;
          started_at: string | null;
          step_id: string | null;
          time_spent_minutes: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          article_id?: string | null;
          completed_at?: string | null;
          completion_percentage?: number | null;
          created_at?: string | null;
          id: string;
          learning_path_id?: string | null;
          notes?: string | null;
          progress_status?: string | null;
          started_at?: string | null;
          step_id?: string | null;
          time_spent_minutes?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          article_id?: string | null;
          completed_at?: string | null;
          completion_percentage?: number | null;
          created_at?: string | null;
          id?: string;
          learning_path_id?: string | null;
          notes?: string | null;
          progress_status?: string | null;
          started_at?: string | null;
          step_id?: string | null;
          time_spent_minutes?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'knowledge_user_progress_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'courses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'knowledge_user_progress_learning_path_id_fkey';
            columns: ['learning_path_id'];
            isOneToOne: false;
            referencedRelation: 'learning_pathways';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'knowledge_user_progress_step_id_fkey';
            columns: ['step_id'];
            isOneToOne: false;
            referencedRelation: 'learning_modules';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'knowledge_user_progress_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      learning_modules: {
        Row: {
          content_url: string | null;
          created_at: string | null;
          description: string | null;
          difficulty_level: string | null;
          estimated_duration_minutes: number | null;
          id: string;
          is_active: boolean | null;
          module_type: string | null;
          score: number | null;
          time_spent: number | null;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          content_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          estimated_duration_minutes?: number | null;
          id: string;
          is_active?: boolean | null;
          module_type?: string | null;
          score?: number | null;
          time_spent?: number | null;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          content_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          estimated_duration_minutes?: number | null;
          id?: string;
          is_active?: boolean | null;
          module_type?: string | null;
          score?: number | null;
          time_spent?: number | null;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'learning_modules_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      learning_pathways: {
        Row: {
          allow_parallel: boolean | null;
          archived_at: string | null;
          author_id: string | null;
          completion_threshold: number | null;
          created_at: string | null;
          department: string | null;
          description: string | null;
          difficulty_level: string | null;
          domain: string | null;
          estimated_total_duration_minutes: number | null;
          id: string;
          is_active: boolean | null;
          is_sequential: boolean | null;
          media: Json | null;
          pathway_items: Json | null;
          points: number | null;
          prerequisites: Json | null;
          published_at: string | null;
          status: string | null;
          tags: string[] | null;
          target_audience: string[] | null;
          title: string | null;
          total_items: number | null;
          updated_at: string | null;
        };
        Insert: {
          allow_parallel?: boolean | null;
          archived_at?: string | null;
          author_id?: string | null;
          completion_threshold?: number | null;
          created_at?: string | null;
          department?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          domain?: string | null;
          estimated_total_duration_minutes?: number | null;
          id: string;
          is_active?: boolean | null;
          is_sequential?: boolean | null;
          media?: Json | null;
          pathway_items?: Json | null;
          points?: number | null;
          prerequisites?: Json | null;
          published_at?: string | null;
          status?: string | null;
          tags?: string[] | null;
          target_audience?: string[] | null;
          title?: string | null;
          total_items?: number | null;
          updated_at?: string | null;
        };
        Update: {
          allow_parallel?: boolean | null;
          archived_at?: string | null;
          author_id?: string | null;
          completion_threshold?: number | null;
          created_at?: string | null;
          department?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          domain?: string | null;
          estimated_total_duration_minutes?: number | null;
          id?: string;
          is_active?: boolean | null;
          is_sequential?: boolean | null;
          media?: Json | null;
          pathway_items?: Json | null;
          points?: number | null;
          prerequisites?: Json | null;
          published_at?: string | null;
          status?: string | null;
          tags?: string[] | null;
          target_audience?: string[] | null;
          title?: string | null;
          total_items?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'learning_pathways_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      login_attempts: {
        Row: {
          attempted_at: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          ip_address: string | null;
          success: boolean | null;
          updated_at: string | null;
          user_agent: string | null;
        };
        Insert: {
          attempted_at?: string | null;
          created_at?: string | null;
          email?: string | null;
          id: string;
          ip_address?: string | null;
          success?: boolean | null;
          updated_at?: string | null;
          user_agent?: string | null;
        };
        Update: {
          attempted_at?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          ip_address?: string | null;
          success?: boolean | null;
          updated_at?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      monitoring_events: {
        Row: {
          action: string | null;
          category: string | null;
          created_at: string | null;
          facility_id: string | null;
          id: string;
          level: string | null;
          message: string | null;
          metadata: Json | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          action?: string | null;
          category?: string | null;
          created_at?: string | null;
          facility_id?: string | null;
          id: string;
          level?: string | null;
          message?: string | null;
          metadata?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string | null;
          category?: string | null;
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          level?: string | null;
          message?: string | null;
          metadata?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      monitoring_performance_metrics: {
        Row: {
          created_at: string | null;
          facility_id: string;
          id: string;
          metric_name: string;
          metric_value: number | null;
          recorded_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          facility_id: string;
          id?: string;
          metric_name: string;
          metric_value?: number | null;
          recorded_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string;
          id?: string;
          metric_name?: string;
          metric_value?: number | null;
          recorded_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'monitoring_performance_metrics_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          action_data: Json | null;
          action_url: string | null;
          created_at: string | null;
          expires_at: string | null;
          facility_id: string | null;
          id: string;
          is_read: boolean | null;
          message: string | null;
          module: string | null;
          notification_type: string | null;
          read_at: string | null;
          severity: string | null;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          action_data?: Json | null;
          action_url?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          facility_id?: string | null;
          id: string;
          is_read?: boolean | null;
          message?: string | null;
          module?: string | null;
          notification_type?: string | null;
          read_at?: string | null;
          severity?: string | null;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          action_data?: Json | null;
          action_url?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          facility_id?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string | null;
          module?: string | null;
          notification_type?: string | null;
          read_at?: string | null;
          severity?: string | null;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      office_closures: {
        Row: {
          closure_date: string | null;
          closure_type: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          facility_id: string | null;
          id: string;
          is_recurring: boolean | null;
          recurring_pattern: Json | null;
          updated_at: string | null;
        };
        Insert: {
          closure_date?: string | null;
          closure_type?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          facility_id?: string | null;
          id: string;
          is_recurring?: boolean | null;
          recurring_pattern?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          closure_date?: string | null;
          closure_type?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          facility_id?: string | null;
          id?: string;
          is_recurring?: boolean | null;
          recurring_pattern?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      performance_metrics: {
        Row: {
          created_at: string | null;
          date: string | null;
          facility_id: string | null;
          id: string;
          metric_name: string | null;
          metric_value: number | null;
          month: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          date?: string | null;
          facility_id?: string | null;
          id: string;
          metric_name?: string | null;
          metric_value?: number | null;
          month?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          date?: string | null;
          facility_id?: string | null;
          id?: string;
          metric_name?: string | null;
          metric_value?: number | null;
          month?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      policies: {
        Row: {
          archived_at: string | null;
          author_id: string | null;
          compliance_required: boolean | null;
          content: Json | null;
          content_type: string | null;
          created_at: string | null;
          department: string | null;
          description: string | null;
          domain: string | null;
          effective_date: string | null;
          estimated_read_time_minutes: number | null;
          id: string;
          is_active: boolean | null;
          is_repeat: boolean | null;
          media: Json | null;
          points: number | null;
          policy_number: string | null;
          published_at: string | null;
          review_date: string | null;
          status: string | null;
          tags: string[] | null;
          title: string | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          archived_at?: string | null;
          author_id?: string | null;
          compliance_required?: boolean | null;
          content?: Json | null;
          content_type?: string | null;
          created_at?: string | null;
          department?: string | null;
          description?: string | null;
          domain?: string | null;
          effective_date?: string | null;
          estimated_read_time_minutes?: number | null;
          id: string;
          is_active?: boolean | null;
          is_repeat?: boolean | null;
          media?: Json | null;
          points?: number | null;
          policy_number?: string | null;
          published_at?: string | null;
          review_date?: string | null;
          status?: string | null;
          tags?: string[] | null;
          title?: string | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          archived_at?: string | null;
          author_id?: string | null;
          compliance_required?: boolean | null;
          content?: Json | null;
          content_type?: string | null;
          created_at?: string | null;
          department?: string | null;
          description?: string | null;
          domain?: string | null;
          effective_date?: string | null;
          estimated_read_time_minutes?: number | null;
          id?: string;
          is_active?: boolean | null;
          is_repeat?: boolean | null;
          media?: Json | null;
          points?: number | null;
          policy_number?: string | null;
          published_at?: string | null;
          review_date?: string | null;
          status?: string | null;
          tags?: string[] | null;
          title?: string | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'policies_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      procedures: {
        Row: {
          archived_at: string | null;
          author_id: string | null;
          content: Json | null;
          content_type: string | null;
          created_at: string | null;
          department: string | null;
          description: string | null;
          difficulty_level: string | null;
          domain: string | null;
          equipment_required: string[] | null;
          estimated_duration_minutes: number | null;
          id: string;
          is_active: boolean | null;
          is_repeat: boolean | null;
          materials_required: string[] | null;
          media: Json | null;
          points: number | null;
          procedure_number: string | null;
          published_at: string | null;
          safety_level: string | null;
          status: string | null;
          tags: string[] | null;
          title: string | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          archived_at?: string | null;
          author_id?: string | null;
          content?: Json | null;
          content_type?: string | null;
          created_at?: string | null;
          department?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          domain?: string | null;
          equipment_required?: string[] | null;
          estimated_duration_minutes?: number | null;
          id: string;
          is_active?: boolean | null;
          is_repeat?: boolean | null;
          materials_required?: string[] | null;
          media?: Json | null;
          points?: number | null;
          procedure_number?: string | null;
          published_at?: string | null;
          safety_level?: string | null;
          status?: string | null;
          tags?: string[] | null;
          title?: string | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          archived_at?: string | null;
          author_id?: string | null;
          content?: Json | null;
          content_type?: string | null;
          created_at?: string | null;
          department?: string | null;
          description?: string | null;
          difficulty_level?: string | null;
          domain?: string | null;
          equipment_required?: string[] | null;
          estimated_duration_minutes?: number | null;
          id?: string;
          is_active?: boolean | null;
          is_repeat?: boolean | null;
          materials_required?: string[] | null;
          media?: Json | null;
          points?: number | null;
          procedure_number?: string | null;
          published_at?: string | null;
          safety_level?: string | null;
          status?: string | null;
          tags?: string[] | null;
          title?: string | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'procedures_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      product_feedback: {
        Row: {
          assigned_to: string | null;
          browser_info: Json | null;
          contact_email: string | null;
          created_at: string | null;
          description: string;
          estimated_effort: string | null;
          facility_id: string | null;
          id: string;
          internal_notes: string | null;
          page_url: string | null;
          priority: string;
          resolution_notes: string | null;
          status: string;
          target_version: string | null;
          title: string;
          type: string;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          browser_info?: Json | null;
          contact_email?: string | null;
          created_at?: string | null;
          description: string;
          estimated_effort?: string | null;
          facility_id?: string | null;
          id?: string;
          internal_notes?: string | null;
          page_url?: string | null;
          priority?: string;
          resolution_notes?: string | null;
          status?: string;
          target_version?: string | null;
          title: string;
          type: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          browser_info?: Json | null;
          contact_email?: string | null;
          created_at?: string | null;
          description?: string;
          estimated_effort?: string | null;
          facility_id?: string | null;
          id?: string;
          internal_notes?: string | null;
          page_url?: string | null;
          priority?: string;
          resolution_notes?: string | null;
          status?: string;
          target_version?: string | null;
          title?: string;
          type?: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'product_feedback_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
        ];
      };
      quality_incidents: {
        Row: {
          cost_impact: number | null;
          created_at: string | null;
          description: string | null;
          facility_id: string | null;
          id: string | null;
          incident_type: string | null;
          metadata: Json | null;
          reported_by: string | null;
          resolved_at: string | null;
          severity: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          cost_impact?: number | null;
          created_at?: string | null;
          description?: string | null;
          facility_id?: string | null;
          id?: string | null;
          incident_type?: string | null;
          metadata?: Json | null;
          reported_by?: string | null;
          resolved_at?: string | null;
          severity?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          cost_impact?: number | null;
          created_at?: string | null;
          description?: string | null;
          facility_id?: string | null;
          id?: string | null;
          incident_type?: string | null;
          metadata?: Json | null;
          reported_by?: string | null;
          resolved_at?: string | null;
          severity?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      quick_actions: {
        Row: {
          action_color: string | null;
          action_icon: string | null;
          action_name: string | null;
          action_target: string | null;
          action_type: string | null;
          created_at: string | null;
          facility_id: string | null;
          id: string | null;
          is_active: boolean | null;
          position: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          action_color?: string | null;
          action_icon?: string | null;
          action_name?: string | null;
          action_target?: string | null;
          action_type?: string | null;
          created_at?: string | null;
          facility_id?: string | null;
          id?: string | null;
          is_active?: boolean | null;
          position?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          action_color?: string | null;
          action_icon?: string | null;
          action_name?: string | null;
          action_target?: string | null;
          action_type?: string | null;
          created_at?: string | null;
          facility_id?: string | null;
          id?: string | null;
          is_active?: boolean | null;
          position?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      realtime_subscriptions: {
        Row: {
          channel: string;
          id: string;
          subscribed_at: string | null;
          user_id: string | null;
        };
        Insert: {
          channel: string;
          id?: string;
          subscribed_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          channel?: string;
          id?: string;
          subscribed_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          barcode: string | null;
          building: string | null;
          capacity: number | null;
          created_at: string | null;
          created_by: string | null;
          department: string | null;
          floor: string | null;
          id: string | null;
          is_active: boolean | null;
          name: string | null;
          room_type: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          barcode?: string | null;
          building?: string | null;
          capacity?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          department?: string | null;
          floor?: string | null;
          id?: string | null;
          is_active?: boolean | null;
          name?: string | null;
          room_type?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          barcode?: string | null;
          building?: string | null;
          capacity?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          department?: string | null;
          floor?: string | null;
          id?: string | null;
          is_active?: boolean | null;
          name?: string | null;
          room_type?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      sds_chemical_recommendations: {
        Row: {
          ai_confidence_score: number | null;
          ai_reasoning: string | null;
          assigned_to: string | null;
          category: string | null;
          chemical_name: string | null;
          completed_at: string | null;
          created_at: string | null;
          estimated_time_to_create: number | null;
          facility_id: string | null;
          gap_analysis_id: string | null;
          id: string | null;
          manufacturer: string | null;
          priority: string | null;
          reason: string | null;
          risk_level: string | null;
          status: string | null;
          suggested_action: string | null;
          updated_at: string | null;
          user_notes: string | null;
          user_rating: number | null;
        };
        Insert: {
          ai_confidence_score?: number | null;
          ai_reasoning?: string | null;
          assigned_to?: string | null;
          category?: string | null;
          chemical_name?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          estimated_time_to_create?: number | null;
          facility_id?: string | null;
          gap_analysis_id?: string | null;
          id?: string | null;
          manufacturer?: string | null;
          priority?: string | null;
          reason?: string | null;
          risk_level?: string | null;
          status?: string | null;
          suggested_action?: string | null;
          updated_at?: string | null;
          user_notes?: string | null;
          user_rating?: number | null;
        };
        Update: {
          ai_confidence_score?: number | null;
          ai_reasoning?: string | null;
          assigned_to?: string | null;
          category?: string | null;
          chemical_name?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          estimated_time_to_create?: number | null;
          facility_id?: string | null;
          gap_analysis_id?: string | null;
          id?: string | null;
          manufacturer?: string | null;
          priority?: string | null;
          reason?: string | null;
          risk_level?: string | null;
          status?: string | null;
          suggested_action?: string | null;
          updated_at?: string | null;
          user_notes?: string | null;
          user_rating?: number | null;
        };
        Relationships: [];
      };
      sds_gap_analysis: {
        Row: {
          ai_insights: Json | null;
          analysis_date: string | null;
          analysis_type: string | null;
          compliance_score: number | null;
          coverage_percentage: number | null;
          created_at: string | null;
          estimated_total_time: number | null;
          existing_sds_sheets: number | null;
          facility_id: string | null;
          high_priority_missing: number | null;
          id: string | null;
          inventory_snapshot: Json | null;
          library_snapshot: Json | null;
          low_priority_missing: number | null;
          medium_priority_missing: number | null;
          missing_sds_sheets: number | null;
          recommendations: Json | null;
          total_chemicals: number | null;
        };
        Insert: {
          ai_insights?: Json | null;
          analysis_date?: string | null;
          analysis_type?: string | null;
          compliance_score?: number | null;
          coverage_percentage?: number | null;
          created_at?: string | null;
          estimated_total_time?: number | null;
          existing_sds_sheets?: number | null;
          facility_id?: string | null;
          high_priority_missing?: number | null;
          id?: string | null;
          inventory_snapshot?: Json | null;
          library_snapshot?: Json | null;
          low_priority_missing?: number | null;
          medium_priority_missing?: number | null;
          missing_sds_sheets?: number | null;
          recommendations?: Json | null;
          total_chemicals?: number | null;
        };
        Update: {
          ai_insights?: Json | null;
          analysis_date?: string | null;
          analysis_type?: string | null;
          compliance_score?: number | null;
          coverage_percentage?: number | null;
          created_at?: string | null;
          estimated_total_time?: number | null;
          existing_sds_sheets?: number | null;
          facility_id?: string | null;
          high_priority_missing?: number | null;
          id?: string | null;
          inventory_snapshot?: Json | null;
          library_snapshot?: Json | null;
          low_priority_missing?: number | null;
          medium_priority_missing?: number | null;
          missing_sds_sheets?: number | null;
          recommendations?: Json | null;
          total_chemicals?: number | null;
        };
        Relationships: [];
      };
      sds_sheets: {
        Row: {
          acute_effects: string[] | null;
          ai_confidence_score: number | null;
          ai_recommendations: Json | null;
          appearance: string | null;
          aquatic_toxicity: string | null;
          bioaccumulation: string | null;
          biodegradability: string | null;
          boiling_point: string | null;
          carcinogenicity: string | null;
          cas_number: string | null;
          chemical_name: string | null;
          chronic_effects: string[] | null;
          conditions_to_avoid: string[] | null;
          created_at: string | null;
          created_by: string | null;
          decomposition_products: string[] | null;
          density: string | null;
          description: string | null;
          disposal_methods: string[] | null;
          dot_classification: string | null;
          emergency_procedures: string[] | null;
          engineering_controls: string[] | null;
          environmental_hazards: string[] | null;
          epa_regulations: string[] | null;
          exposure_limits: string[] | null;
          extinguishing_media: string[] | null;
          facility_id: string | null;
          first_aid_eye_contact: string | null;
          first_aid_ingestion: string | null;
          first_aid_inhalation: string | null;
          first_aid_skin_contact: string | null;
          ghs_classification: string[] | null;
          health_hazards: string[] | null;
          id: string | null;
          incompatible_materials: string[] | null;
          last_ai_analysis: string | null;
          melting_point: string | null;
          molecular_formula: string | null;
          molecular_weight: number | null;
          monitoring_methods: string[] | null;
          notes: string | null;
          odor: string | null;
          osha_hazards: string[] | null;
          packing_group: string | null;
          pdf_file_path: string | null;
          pdf_file_size: number | null;
          pdf_uploaded_at: string | null;
          personal_protection: string[] | null;
          physical_hazards: string[] | null;
          priority: string | null;
          proper_shipping_name: string | null;
          protective_equipment: string[] | null;
          reference_list: string[] | null;
          reproductive_toxicity: string | null;
          revision_date: string | null;
          risk_level: string | null;
          safe_handling: string[] | null;
          solubility: string | null;
          special_hazards: string[] | null;
          stability: string | null;
          status: string | null;
          storage_requirements: string[] | null;
          title: string | null;
          transport_hazard_class: string | null;
          un_number: string | null;
          updated_at: string | null;
          updated_by: string | null;
          ventilation_requirements: string | null;
          version: string | null;
        };
        Insert: {
          acute_effects?: string[] | null;
          ai_confidence_score?: number | null;
          ai_recommendations?: Json | null;
          appearance?: string | null;
          aquatic_toxicity?: string | null;
          bioaccumulation?: string | null;
          biodegradability?: string | null;
          boiling_point?: string | null;
          carcinogenicity?: string | null;
          cas_number?: string | null;
          chemical_name?: string | null;
          chronic_effects?: string[] | null;
          conditions_to_avoid?: string[] | null;
          created_at?: string | null;
          created_by?: string | null;
          decomposition_products?: string[] | null;
          density?: string | null;
          description?: string | null;
          disposal_methods?: string[] | null;
          dot_classification?: string | null;
          emergency_procedures?: string[] | null;
          engineering_controls?: string[] | null;
          environmental_hazards?: string[] | null;
          epa_regulations?: string[] | null;
          exposure_limits?: string[] | null;
          extinguishing_media?: string[] | null;
          facility_id?: string | null;
          first_aid_eye_contact?: string | null;
          first_aid_ingestion?: string | null;
          first_aid_inhalation?: string | null;
          first_aid_skin_contact?: string | null;
          ghs_classification?: string[] | null;
          health_hazards?: string[] | null;
          id?: string | null;
          incompatible_materials?: string[] | null;
          last_ai_analysis?: string | null;
          melting_point?: string | null;
          molecular_formula?: string | null;
          molecular_weight?: number | null;
          monitoring_methods?: string[] | null;
          notes?: string | null;
          odor?: string | null;
          osha_hazards?: string[] | null;
          packing_group?: string | null;
          pdf_file_path?: string | null;
          pdf_file_size?: number | null;
          pdf_uploaded_at?: string | null;
          personal_protection?: string[] | null;
          physical_hazards?: string[] | null;
          priority?: string | null;
          proper_shipping_name?: string | null;
          protective_equipment?: string[] | null;
          reference_list?: string[] | null;
          reproductive_toxicity?: string | null;
          revision_date?: string | null;
          risk_level?: string | null;
          safe_handling?: string[] | null;
          solubility?: string | null;
          special_hazards?: string[] | null;
          stability?: string | null;
          status?: string | null;
          storage_requirements?: string[] | null;
          title?: string | null;
          transport_hazard_class?: string | null;
          un_number?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          ventilation_requirements?: string | null;
          version?: string | null;
        };
        Update: {
          acute_effects?: string[] | null;
          ai_confidence_score?: number | null;
          ai_recommendations?: Json | null;
          appearance?: string | null;
          aquatic_toxicity?: string | null;
          bioaccumulation?: string | null;
          biodegradability?: string | null;
          boiling_point?: string | null;
          carcinogenicity?: string | null;
          cas_number?: string | null;
          chemical_name?: string | null;
          chronic_effects?: string[] | null;
          conditions_to_avoid?: string[] | null;
          created_at?: string | null;
          created_by?: string | null;
          decomposition_products?: string[] | null;
          density?: string | null;
          description?: string | null;
          disposal_methods?: string[] | null;
          dot_classification?: string | null;
          emergency_procedures?: string[] | null;
          engineering_controls?: string[] | null;
          environmental_hazards?: string[] | null;
          epa_regulations?: string[] | null;
          exposure_limits?: string[] | null;
          extinguishing_media?: string[] | null;
          facility_id?: string | null;
          first_aid_eye_contact?: string | null;
          first_aid_ingestion?: string | null;
          first_aid_inhalation?: string | null;
          first_aid_skin_contact?: string | null;
          ghs_classification?: string[] | null;
          health_hazards?: string[] | null;
          id?: string | null;
          incompatible_materials?: string[] | null;
          last_ai_analysis?: string | null;
          melting_point?: string | null;
          molecular_formula?: string | null;
          molecular_weight?: number | null;
          monitoring_methods?: string[] | null;
          notes?: string | null;
          odor?: string | null;
          osha_hazards?: string[] | null;
          packing_group?: string | null;
          pdf_file_path?: string | null;
          pdf_file_size?: number | null;
          pdf_uploaded_at?: string | null;
          personal_protection?: string[] | null;
          physical_hazards?: string[] | null;
          priority?: string | null;
          proper_shipping_name?: string | null;
          protective_equipment?: string[] | null;
          reference_list?: string[] | null;
          reproductive_toxicity?: string | null;
          revision_date?: string | null;
          risk_level?: string | null;
          safe_handling?: string[] | null;
          solubility?: string | null;
          special_hazards?: string[] | null;
          stability?: string | null;
          status?: string | null;
          storage_requirements?: string[] | null;
          title?: string | null;
          transport_hazard_class?: string | null;
          un_number?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          ventilation_requirements?: string | null;
          version?: string | null;
        };
        Relationships: [];
      };
      status_types: {
        Row: {
          alert_level: string | null;
          auto_transition: boolean | null;
          category: string | null;
          color: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          facility_id: string | null;
          icon: string;
          id: string;
          is_core: boolean;
          is_published: boolean;
          name: string;
          requires_verification: boolean | null;
          sort_order: number | null;
          transition_to: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          alert_level?: string | null;
          auto_transition?: boolean | null;
          category?: string | null;
          color: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          facility_id?: string | null;
          icon: string;
          id?: string;
          is_core?: boolean;
          is_published?: boolean;
          name: string;
          requires_verification?: boolean | null;
          sort_order?: number | null;
          transition_to?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          alert_level?: string | null;
          auto_transition?: boolean | null;
          category?: string | null;
          color?: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          facility_id?: string | null;
          icon?: string;
          id?: string;
          is_core?: boolean;
          is_published?: boolean;
          name?: string;
          requires_verification?: boolean | null;
          sort_order?: number | null;
          transition_to?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'status_types_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
        ];
      };
      sterilization_batches: {
        Row: {
          batch_name: string | null;
          batch_type: string | null;
          chemical_indicator_added: boolean | null;
          completed_at: string | null;
          created_at: string | null;
          cycle_id: string | null;
          facility_id: string | null;
          id: string;
          notes: string | null;
          package_count: number | null;
          package_id: string | null;
          package_size: string | null;
          package_type: string | null;
          packaged_at: string | null;
          packaged_by: string | null;
          priority: string | null;
          requested_by: string | null;
          requested_for: string | null;
          status: string | null;
          total_items: number | null;
          updated_at: string | null;
        };
        Insert: {
          batch_name?: string | null;
          batch_type?: string | null;
          chemical_indicator_added?: boolean | null;
          completed_at?: string | null;
          created_at?: string | null;
          cycle_id?: string | null;
          facility_id?: string | null;
          id: string;
          notes?: string | null;
          package_count?: number | null;
          package_id?: string | null;
          package_size?: string | null;
          package_type?: string | null;
          packaged_at?: string | null;
          packaged_by?: string | null;
          priority?: string | null;
          requested_by?: string | null;
          requested_for?: string | null;
          status?: string | null;
          total_items?: number | null;
          updated_at?: string | null;
        };
        Update: {
          batch_name?: string | null;
          batch_type?: string | null;
          chemical_indicator_added?: boolean | null;
          completed_at?: string | null;
          created_at?: string | null;
          cycle_id?: string | null;
          facility_id?: string | null;
          id?: string;
          notes?: string | null;
          package_count?: number | null;
          package_id?: string | null;
          package_size?: string | null;
          package_type?: string | null;
          packaged_at?: string | null;
          packaged_by?: string | null;
          priority?: string | null;
          requested_by?: string | null;
          requested_for?: string | null;
          status?: string | null;
          total_items?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      sterilization_cycle_tools: {
        Row: {
          created_at: string | null;
          cycle_id: string;
          facility_id: string;
          id: string;
          status: string | null;
          tool_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          cycle_id: string;
          facility_id: string;
          id?: string;
          status?: string | null;
          tool_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          cycle_id?: string;
          facility_id?: string;
          id?: string;
          status?: string | null;
          tool_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'sterilization_cycle_tools_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'sterilization_cycles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sterilization_cycle_tools_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sterilization_cycle_tools_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'tools';
            referencedColumns: ['id'];
          },
        ];
      };
      sterilization_cycles: {
        Row: {
          autoclave_id: string | null;
          created_at: string | null;
          cycle_number: string | null;
          cycle_time: number | null;
          cycle_type: string | null;
          duration_minutes: number | null;
          end_time: string | null;
          facility_id: string | null;
          id: string;
          notes: string | null;
          operator_id: string | null;
          parameters: Json | null;
          pressure_psi: number | null;
          results: Json | null;
          start_time: string | null;
          status: string | null;
          temperature_celsius: number | null;
          tool_batch_id: string | null;
          tools: Json | null;
          updated_at: string | null;
        };
        Insert: {
          autoclave_id?: string | null;
          created_at?: string | null;
          cycle_number?: string | null;
          cycle_time?: number | null;
          cycle_type?: string | null;
          duration_minutes?: number | null;
          end_time?: string | null;
          facility_id?: string | null;
          id: string;
          notes?: string | null;
          operator_id?: string | null;
          parameters?: Json | null;
          pressure_psi?: number | null;
          results?: Json | null;
          start_time?: string | null;
          status?: string | null;
          temperature_celsius?: number | null;
          tool_batch_id?: string | null;
          tools?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          autoclave_id?: string | null;
          created_at?: string | null;
          cycle_number?: string | null;
          cycle_time?: number | null;
          cycle_type?: string | null;
          duration_minutes?: number | null;
          end_time?: string | null;
          facility_id?: string | null;
          id?: string;
          notes?: string | null;
          operator_id?: string | null;
          parameters?: Json | null;
          pressure_psi?: number | null;
          results?: Json | null;
          start_time?: string | null;
          status?: string | null;
          temperature_celsius?: number | null;
          tool_batch_id?: string | null;
          tools?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'sterilization_cycles_autoclave_id_fkey';
            columns: ['autoclave_id'];
            isOneToOne: false;
            referencedRelation: 'autoclave_equipment';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sterilization_cycles_tool_batch_id_fkey';
            columns: ['tool_batch_id'];
            isOneToOne: false;
            referencedRelation: 'tool_batches';
            referencedColumns: ['id'];
          },
        ];
      };
      sterilization_events: {
        Row: {
          created_at: string | null;
          event_type: string;
          facility_id: string;
          id: string;
          notes: string | null;
          occurred_at: string | null;
          session_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          event_type: string;
          facility_id: string;
          id?: string;
          notes?: string | null;
          occurred_at?: string | null;
          session_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          event_type?: string;
          facility_id?: string;
          id?: string;
          notes?: string | null;
          occurred_at?: string | null;
          session_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'sterilization_events_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sterilization_events_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sterilization_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      sterilization_sessions: {
        Row: {
          created_at: string | null;
          cycle_id: string | null;
          end_time: string | null;
          facility_id: string;
          id: string;
          start_time: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          cycle_id?: string | null;
          end_time?: string | null;
          facility_id: string;
          id?: string;
          start_time: string;
          status: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          cycle_id?: string | null;
          end_time?: string | null;
          facility_id?: string;
          id?: string;
          start_time?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'sterilization_sessions_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'sterilization_cycles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sterilization_sessions_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
        ];
      };
      sterilization_tools: {
        Row: {
          barcode: string | null;
          created_at: string | null;
          current_cycle_id: string | null;
          facility_id: string | null;
          gps_accuracy: number | null;
          id: string | null;
          last_sterilized: string | null;
          latitude: number | null;
          location: string | null;
          location_timestamp: string | null;
          longitude: number | null;
          maintenance_due_date: string | null;
          manufacturer: string | null;
          metadata: Json | null;
          model: string | null;
          notes: string | null;
          serial_number: string | null;
          status: string | null;
          sterilization_count: number | null;
          tool_name: string | null;
          tool_type: string | null;
          updated_at: string | null;
        };
        Insert: {
          barcode?: string | null;
          created_at?: string | null;
          current_cycle_id?: string | null;
          facility_id?: string | null;
          gps_accuracy?: number | null;
          id?: string | null;
          last_sterilized?: string | null;
          latitude?: number | null;
          location?: string | null;
          location_timestamp?: string | null;
          longitude?: number | null;
          maintenance_due_date?: string | null;
          manufacturer?: string | null;
          metadata?: Json | null;
          model?: string | null;
          notes?: string | null;
          serial_number?: string | null;
          status?: string | null;
          sterilization_count?: number | null;
          tool_name?: string | null;
          tool_type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          barcode?: string | null;
          created_at?: string | null;
          current_cycle_id?: string | null;
          facility_id?: string | null;
          gps_accuracy?: number | null;
          id?: string | null;
          last_sterilized?: string | null;
          latitude?: number | null;
          location?: string | null;
          location_timestamp?: string | null;
          longitude?: number | null;
          maintenance_due_date?: string | null;
          manufacturer?: string | null;
          metadata?: Json | null;
          model?: string | null;
          notes?: string | null;
          serial_number?: string | null;
          status?: string | null;
          sterilization_count?: number | null;
          tool_name?: string | null;
          tool_type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      supplier_performance: {
        Row: {
          category: string | null;
          cost_trend: string | null;
          created_at: string | null;
          delivery_time_days: number | null;
          facility_id: string | null;
          id: string;
          last_order_date: string | null;
          performance_score: number | null;
          quality_rating: number | null;
          supplier_name: string | null;
          total_orders: number | null;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          cost_trend?: string | null;
          created_at?: string | null;
          delivery_time_days?: number | null;
          facility_id?: string | null;
          id: string;
          last_order_date?: string | null;
          performance_score?: number | null;
          quality_rating?: number | null;
          supplier_name?: string | null;
          total_orders?: number | null;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          cost_trend?: string | null;
          created_at?: string | null;
          delivery_time_days?: number | null;
          facility_id?: string | null;
          id?: string;
          last_order_date?: string | null;
          performance_score?: number | null;
          quality_rating?: number | null;
          supplier_name?: string | null;
          total_orders?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tool_batches: {
        Row: {
          category: string | null;
          created_at: string | null;
          description: string | null;
          facility_id: string | null;
          id: string;
          name: string | null;
          status: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          facility_id?: string | null;
          id: string;
          name?: string | null;
          status?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          facility_id?: string | null;
          id?: string;
          name?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tool_batches_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
        ];
      };
      tools: {
        Row: {
          barcode: string | null;
          created_at: string;
          current_cycle_id: string;
          current_phase: string | null;
          facility_id: string;
          gps_accuracy: number | null;
          id: string;
          last_sterilized: string | null;
          latitude: number | null;
          location: string | null;
          location_timestamp: string | null;
          longitude: number | null;
          maintenance_due_date: string | null;
          manufacturer: string | null;
          metadata: Json | null;
          model: string | null;
          notes: string | null;
          priority: number | null;
          serial_number: string | null;
          status: Database['public']['Enums']['tool_status'] | null;
          sterilization_count: number | null;
          tool_name: string | null;
          tool_type: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          barcode?: string | null;
          created_at?: string;
          current_cycle_id: string;
          current_phase?: string | null;
          facility_id: string;
          gps_accuracy?: number | null;
          id: string;
          last_sterilized?: string | null;
          latitude?: number | null;
          location?: string | null;
          location_timestamp?: string | null;
          longitude?: number | null;
          maintenance_due_date?: string | null;
          manufacturer?: string | null;
          metadata?: Json | null;
          model?: string | null;
          notes?: string | null;
          priority?: number | null;
          serial_number?: string | null;
          status?: Database['public']['Enums']['tool_status'] | null;
          sterilization_count?: number | null;
          tool_name?: string | null;
          tool_type?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          barcode?: string | null;
          created_at?: string;
          current_cycle_id?: string;
          current_phase?: string | null;
          facility_id?: string;
          gps_accuracy?: number | null;
          id?: string;
          last_sterilized?: string | null;
          latitude?: number | null;
          location?: string | null;
          location_timestamp?: string | null;
          longitude?: number | null;
          maintenance_due_date?: string | null;
          manufacturer?: string | null;
          metadata?: Json | null;
          model?: string | null;
          notes?: string | null;
          priority?: number | null;
          serial_number?: string | null;
          status?: Database['public']['Enums']['tool_status'] | null;
          sterilization_count?: number | null;
          tool_name?: string | null;
          tool_type?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      user_certifications: {
        Row: {
          certification_name: string | null;
          created_at: string | null;
          expiry_date: string | null;
          id: string;
          issued_at: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          certification_name?: string | null;
          created_at?: string | null;
          expiry_date?: string | null;
          id: string;
          issued_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          certification_name?: string | null;
          created_at?: string | null;
          expiry_date?: string | null;
          id?: string;
          issued_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_facilities: {
        Row: {
          created_at: string | null;
          facility_id: string;
          id: string;
          role: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          facility_id: string;
          id?: string;
          role?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string;
          id?: string;
          role?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_facilities_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
        ];
      };
      user_gamification_stats: {
        Row: {
          best_streak: number | null;
          completed_tasks: number | null;
          created_at: string | null;
          current_streak: number | null;
          date: string | null;
          facility_id: string | null;
          id: string;
          total_points: number | null;
          total_tasks: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          best_streak?: number | null;
          completed_tasks?: number | null;
          created_at?: string | null;
          current_streak?: number | null;
          date?: string | null;
          facility_id?: string | null;
          id: string;
          total_points?: number | null;
          total_tasks?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          best_streak?: number | null;
          completed_tasks?: number | null;
          created_at?: string | null;
          current_streak?: number | null;
          date?: string | null;
          facility_id?: string | null;
          id?: string;
          total_points?: number | null;
          total_tasks?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_learning_progress: {
        Row: {
          created_at: string | null;
          id: string;
          module_name: string | null;
          progress: number | null;
          score: number | null;
          time_spent_minutes: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          module_name?: string | null;
          progress?: number | null;
          score?: number | null;
          time_spent_minutes?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          module_name?: string | null;
          progress?: number | null;
          score?: number | null;
          time_spent_minutes?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          created_at: string | null;
          facility_id: string | null;
          id: string;
          is_global: boolean | null;
          preference_key: string | null;
          preference_type: string | null;
          preference_value: Json | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          facility_id?: string | null;
          id: string;
          is_global?: boolean | null;
          preference_key?: string | null;
          preference_type?: string | null;
          preference_value?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          is_global?: boolean | null;
          preference_key?: string | null;
          preference_type?: string | null;
          preference_value?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          assigned_at: string | null;
          attempts_count: number | null;
          completed_at: string | null;
          content_id: string | null;
          content_type: string | null;
          created_at: string | null;
          due_date: string | null;
          id: string;
          is_repeat: boolean | null;
          last_completed_at: string | null;
          learning_pathway_id: string | null;
          metadata: Json | null;
          notes: string | null;
          progress_percentage: number | null;
          repeat_count: number | null;
          score: number | null;
          started_at: string | null;
          status: string | null;
          time_spent_minutes: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          assigned_at?: string | null;
          attempts_count?: number | null;
          completed_at?: string | null;
          content_id?: string | null;
          content_type?: string | null;
          created_at?: string | null;
          due_date?: string | null;
          id: string;
          is_repeat?: boolean | null;
          last_completed_at?: string | null;
          learning_pathway_id?: string | null;
          metadata?: Json | null;
          notes?: string | null;
          progress_percentage?: number | null;
          repeat_count?: number | null;
          score?: number | null;
          started_at?: string | null;
          status?: string | null;
          time_spent_minutes?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          assigned_at?: string | null;
          attempts_count?: number | null;
          completed_at?: string | null;
          content_id?: string | null;
          content_type?: string | null;
          created_at?: string | null;
          due_date?: string | null;
          id?: string;
          is_repeat?: boolean | null;
          last_completed_at?: string | null;
          learning_pathway_id?: string | null;
          metadata?: Json | null;
          notes?: string | null;
          progress_percentage?: number | null;
          repeat_count?: number | null;
          score?: number | null;
          started_at?: string | null;
          status?: string | null;
          time_spent_minutes?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          facility_id: string;
          id: string;
          role: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          facility_id: string;
          id?: string;
          role: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string;
          id?: string;
          role?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_facility_id_fkey';
            columns: ['facility_id'];
            isOneToOne: false;
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          },
        ];
      };
      user_security_settings: {
        Row: {
          created_at: string | null;
          id: string;
          inactive_timeout: number | null;
          remember_me_duration: number | null;
          require_reauth_for_sensitive: boolean | null;
          session_timeout: number | null;
          two_factor_enabled: boolean | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          inactive_timeout?: number | null;
          remember_me_duration?: number | null;
          require_reauth_for_sensitive?: boolean | null;
          session_timeout?: number | null;
          two_factor_enabled?: boolean | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          inactive_timeout?: number | null;
          remember_me_duration?: number | null;
          require_reauth_for_sensitive?: boolean | null;
          session_timeout?: number | null;
          two_factor_enabled?: boolean | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_sessions: {
        Row: {
          created_at: string;
          device_info: Json | null;
          id: string;
          ip_address: unknown | null;
          is_active: boolean | null;
          last_activity: string | null;
          login_time: string | null;
          logout_time: string | null;
          session_token: string | null;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          device_info?: Json | null;
          id: string;
          ip_address?: unknown | null;
          is_active?: boolean | null;
          last_activity?: string | null;
          login_time?: string | null;
          logout_time?: string | null;
          session_token?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          device_info?: Json | null;
          id?: string;
          ip_address?: unknown | null;
          is_active?: boolean | null;
          last_activity?: string | null;
          login_time?: string | null;
          logout_time?: string | null;
          session_token?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_training_records: {
        Row: {
          completion_date: string | null;
          completion_status: string | null;
          created_at: string | null;
          expiry_date: string | null;
          facility_id: string | null;
          id: string;
          notes: string | null;
          score: number | null;
          training_type: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          completion_date?: string | null;
          completion_status?: string | null;
          created_at?: string | null;
          expiry_date?: string | null;
          facility_id?: string | null;
          id: string;
          notes?: string | null;
          score?: number | null;
          training_type?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          completion_date?: string | null;
          completion_status?: string | null;
          created_at?: string | null;
          expiry_date?: string | null;
          facility_id?: string | null;
          id?: string;
          notes?: string | null;
          score?: number | null;
          training_type?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          active_sessions: number | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          department: string | null;
          email: string | null;
          emergency_contact: Json | null;
          facility_id: string;
          first_name: string | null;
          full_name: string | null;
          id: string;
          is_active: boolean | null;
          last_login: string | null;
          last_name: string | null;
          mobile_shortcuts: Json | null;
          phone: string | null;
          position: string | null;
          preferences: Json | null;
          preferred_language: string | null;
          role: string | null;
          timezone: string | null;
          total_points: number | null;
          updated_at: string | null;
          work_schedule: Json | null;
        };
        Insert: {
          active_sessions?: number | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          department?: string | null;
          email?: string | null;
          emergency_contact?: Json | null;
          facility_id: string;
          first_name?: string | null;
          full_name?: string | null;
          id: string;
          is_active?: boolean | null;
          last_login?: string | null;
          last_name?: string | null;
          mobile_shortcuts?: Json | null;
          phone?: string | null;
          position?: string | null;
          preferences?: Json | null;
          preferred_language?: string | null;
          role?: string | null;
          timezone?: string | null;
          total_points?: number | null;
          updated_at?: string | null;
          work_schedule?: Json | null;
        };
        Update: {
          active_sessions?: number | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          department?: string | null;
          email?: string | null;
          emergency_contact?: Json | null;
          facility_id?: string;
          first_name?: string | null;
          full_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_login?: string | null;
          last_name?: string | null;
          mobile_shortcuts?: Json | null;
          phone?: string | null;
          position?: string | null;
          preferences?: Json | null;
          preferred_language?: string | null;
          role?: string | null;
          timezone?: string | null;
          total_points?: number | null;
          updated_at?: string | null;
          work_schedule?: Json | null;
        };
        Relationships: [];
      };
      webhook_notifications: {
        Row: {
          created_at: string | null;
          id: string;
          payload: Json;
          status: string | null;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          payload: Json;
          status?: string | null;
          url: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          payload?: Json;
          status?: string | null;
          url?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      seed_daily_operations_tasks: {
        Args: {};
        Returns: undefined;
      };
    };
    Enums: {
      tool_status: 'dirty' | 'clean' | 'problem' | 'new_barcode' | 'active';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      tool_status: ['dirty', 'clean', 'problem', 'new_barcode', 'active'],
    },
  },
} as const;
