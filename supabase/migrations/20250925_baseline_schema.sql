

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."seed_daily_operations_tasks"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Sterilization check
  insert into public.home_daily_operations_tasks (
    id, facility_id, created_at, updated_at, created_by, updated_by,
    estimated_duration, actual_duration, completed, points, due_date,
    assigned_to, type, category, priority, status, title, description
  )
  values (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    now(), now(),
    '1625d7dc-49b0-4357-afe6-bda58b10ec41',
    '1625d7dc-49b0-4357-afe6-bda58b10ec41',
    15, null, false, 10, current_date,
    '1625d7dc-49b0-4357-afe6-bda58b10ec41',
    'sterilization', 'compliance', 'high', 'pending',
    'Check sterilization room logs',
    'Verify and sign off today’s sterilization records.'
  )
  on conflict do nothing;

  -- Inventory spot-check
  insert into public.home_daily_operations_tasks (
    id, facility_id, created_at, updated_at, created_by, updated_by,
    estimated_duration, actual_duration, completed, points, due_date,
    assigned_to, type, category, priority, status, title, description
  )
  values (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    now(), now(),
    '1625d7dc-49b0-4357-afe6-bda58b10ec41',
    '1625d7dc-49b0-4357-afe6-bda58b10ec41',
    20, null, false, 8, current_date,
    '1625d7dc-49b0-4357-afe6-bda58b10ec41',
    'inventory', 'supplies', 'medium', 'pending',
    'Inventory spot-check',
    'Perform a quick verification of critical supply levels.'
  )
  on conflict do nothing;

  -- Environmental cleaning
  insert into public.home_daily_operations_tasks (
    id, facility_id, created_at, updated_at, created_by, updated_by,
    estimated_duration, actual_duration, completed, points, due_date,
    assigned_to, type, category, priority, status, title, description
  )
  values (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    now(), now(),
    '1625d7dc-49b0-4357-afe6-bda58b10ec41',
    '1625d7dc-49b0-4357-afe6-bda58b10ec41',
    10, null, false, 6, current_date,
    '1625d7dc-49b0-4357-afe6-bda58b10ec41',
    'environmental', 'cleaning', 'low', 'pending',
    'Clean procedure room surfaces',
    'Wipe down and disinfect high-touch surfaces in procedure rooms.'
  )
  on conflict do nothing;
end;
$$;


ALTER FUNCTION "public"."seed_daily_operations_tasks"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_created_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.created_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_created_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_facilities_created_by"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if new.facility_id is null then
    new.facility_id := current_setting('request.facility_id', true);
  end if;
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  new.updated_by := auth.uid();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_facilities_created_by"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_feed" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "activity_type" character varying,
    "activity_title" character varying,
    "activity_description" "text",
    "module" character varying,
    "related_record_type" character varying,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "user_id" "uuid",
    "facility_id" "uuid",
    "metadata" "jsonb",
    "related_record_id" "uuid"
);


ALTER TABLE "public"."activity_feed" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_challenge_completions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone,
    "facility_id" "uuid",
    "user_id" "uuid",
    "challenge_type" character varying,
    "rewards" "jsonb",
    "completed_at" timestamp with time zone,
    "time_taken_ms" integer,
    "score" integer,
    "challenge_id" "uuid",
    "updated_at" timestamp with time zone,
    "data" "jsonb"
);


ALTER TABLE "public"."ai_challenge_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_content_recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "content_id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "reasoning" "text",
    "content_metadata" "jsonb",
    "confidence_level" numeric,
    "user_context" "jsonb",
    "content_context" "jsonb",
    "click_through_rate" numeric,
    "completion_rate" numeric,
    "ai_confidence_score" numeric,
    "last_ai_analysis" timestamp with time zone,
    "feature_vector" "jsonb",
    "expires_at" timestamp with time zone,
    "facility_id" "uuid",
    "recommendation_reason" "text",
    "tags" "text"[],
    "learning_context" "text",
    "ai_model_version" character varying,
    "recommendation_timing" character varying,
    "algorithm_used" character varying,
    "model_version" character varying,
    "recommendation_algorithm" character varying,
    "user_feedback" "text",
    "recommendation_type" character varying,
    "user_feedback_rating" integer,
    "recommendation_score" numeric,
    "is_displayed" boolean,
    "is_clicked" boolean,
    "is_completed" boolean,
    "display_count" integer,
    "click_count" integer,
    "completion_count" integer
);


ALTER TABLE "public"."ai_content_recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_learning_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid",
    "session_start" timestamp with time zone,
    "session_end" timestamp with time zone,
    "learning_path_progress" "jsonb",
    "recommendation_effectiveness" "jsonb",
    "user_id" "uuid",
    "confidence_metrics" "jsonb",
    "model_predictions" "jsonb",
    "skill_progression" "jsonb",
    "retention_indicators" "jsonb",
    "comprehension_indicators" "jsonb",
    "difficulty_assessment" "jsonb",
    "attention_metrics" "jsonb",
    "engagement_score" numeric,
    "knowledge_gaps_identified" "text"[],
    "facility_id" "uuid",
    "updated_at" timestamp with time zone,
    "content_items_accessed" "text"[],
    "created_at" timestamp with time zone,
    "learning_patterns" "jsonb",
    "session_duration_minutes" integer
);


ALTER TABLE "public"."ai_learning_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_learning_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "facility_id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "avoided_content_types" "text"[],
    "next_learning_milestone" "text",
    "skill_gaps" "text"[],
    "ai_confidence_score" numeric,
    "last_ai_analysis" timestamp with time zone,
    "completion_rate_by_category" "jsonb",
    "optimal_study_duration" integer,
    "knowledge_retention_rate" numeric,
    "learning_efficiency_score" numeric,
    "content_affinity_scores" "jsonb",
    "difficulty_progression" "jsonb",
    "learning_recommendations" "jsonb",
    "study_patterns" "jsonb",
    "learning_preferences" "jsonb",
    "content_interaction_patterns" "jsonb",
    "model_version" character varying,
    "preferred_content_categories" "text"[]
);


ALTER TABLE "public"."ai_learning_insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_task_performance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metadata" "jsonb",
    "user_id" "uuid",
    "facility_id" "uuid",
    "data" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "task_id" "uuid",
    "completion_time_ms" integer,
    "accuracy_score" numeric,
    "user_satisfaction" integer,
    "completed_at" timestamp with time zone,
    "task_type" character varying,
    "baseline_time" integer,
    "actual_duration" integer,
    "time_saved" integer,
    "efficiency_score" numeric
);


ALTER TABLE "public"."ai_task_performance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "record_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "session_id" "uuid",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "module" character varying,
    "action" character varying,
    "table_name" character varying,
    "user_agent" "text",
    "user_id" "uuid",
    "facility_id" "uuid",
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."autoclave_equipment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying,
    "status" character varying,
    "facility_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "location" character varying,
    "serial_number" character varying,
    "model" character varying
);


ALTER TABLE "public"."autoclave_equipment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."autoclave_receipts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "receipt_number" "text" NOT NULL,
    "autoclave_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."autoclave_receipts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."autoclaves" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "model" "text",
    "serial_number" "text",
    "facility_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."autoclaves" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."barcode_counts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."barcode_counts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bi_activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "activity_type" "text" NOT NULL,
    "description" "text",
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bi_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bi_failure_incidents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "cycle_id" "uuid",
    "incident_type" character varying(50) NOT NULL,
    "severity" character varying(20) NOT NULL,
    "status" character varying(20) NOT NULL,
    "description" "text",
    "failure_reason" "text",
    "detected_at" timestamp with time zone DEFAULT "now"(),
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb",
    CONSTRAINT "bi_failure_incidents_severity_check" CHECK ((("severity")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[]))),
    CONSTRAINT "bi_failure_incidents_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['open'::character varying, 'investigating'::character varying, 'resolved'::character varying, 'closed'::character varying])::"text"[])))
);


ALTER TABLE "public"."bi_failure_incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bi_test_kits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "status" character varying,
    "expiry_date" "date",
    "incubation_time_minutes" integer,
    "incubation_temperature_celsius" numeric,
    "quantity" integer,
    "min_quantity" integer,
    "max_quantity" integer,
    "cost" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "updated_by" "uuid" NOT NULL,
    "name" character varying,
    "manufacturer" character varying,
    "lot_number" character varying,
    "serial_number" character varying,
    "location" character varying,
    "barcode" character varying,
    "supplier" character varying,
    "notes" "text",
    "facility_id" "uuid" NOT NULL
);


ALTER TABLE "public"."bi_test_kits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bi_test_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bi_expiry_date" "date",
    "incubation_time_minutes" integer,
    "incubation_temperature_celsius" numeric,
    "test_conditions" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "result" character varying,
    "bi_lot_number" character varying,
    "failure_reason" "text",
    "status" character varying,
    "test_date" timestamp with time zone,
    "cycle_id" "uuid" NOT NULL,
    "operator_id" "uuid" NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "audit_signature" "text",
    "compliance_notes" "text",
    "skip_reason" "text",
    "test_number" character varying
);


ALTER TABLE "public"."bi_test_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."biological_indicator_tests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "test_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "result" "text",
    "notes" "text",
    "facility_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."biological_indicator_tests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."biological_indicators" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "result" character varying,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "data" "jsonb",
    "facility_id" "uuid" NOT NULL
);


ALTER TABLE "public"."biological_indicators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."certifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "valid_until" "date",
    "name" character varying,
    "description" character varying,
    "issuing_organization" character varying,
    "created_at" timestamp with time zone,
    "is_active" boolean,
    "validity_period_months" integer,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."certifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cleaning_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "user_id" "uuid",
    "facility_id" "uuid",
    "compliance_score" numeric,
    "description" "text",
    "status" "text",
    "room_id" character varying
);


ALTER TABLE "public"."cleaning_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_type" character varying,
    "description" "text",
    "title" character varying,
    "estimated_duration_minutes" integer,
    "department" character varying,
    "tags" "text"[],
    "prerequisites" "text"[],
    "learning_objectives" "text"[],
    "points" integer,
    "is_repeat" boolean,
    "is_active" boolean,
    "author_id" "uuid" NOT NULL,
    "content" "jsonb",
    "media" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "published_at" timestamp with time zone,
    "archived_at" timestamp with time zone,
    "facility_id" "uuid" NOT NULL,
    "difficulty_level" character varying,
    "domain" character varying,
    "status" character varying
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_alert_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_email" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "body" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_alert_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environmental_cleaning_predefined_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "updated_by" "uuid",
    "quality_checkpoints" "text"[],
    "compliance_requirements" "text"[],
    "safety_notes" "text",
    "required_equipment" "text"[],
    "required_supplies" "text"[],
    "task_description" "text",
    "task_name" character varying,
    "category_id" "uuid",
    "task_order" integer,
    "is_required" boolean,
    "estimated_duration_minutes" integer,
    "is_active" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "facility_id" "uuid",
    "created_by" "uuid"
);


ALTER TABLE "public"."environmental_cleaning_predefined_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environmental_cleaning_task_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "updated_at" timestamp with time zone,
    "facility_id" "uuid",
    "name" character varying,
    "icon" character varying,
    "color" character varying,
    "updated_by" "uuid",
    "created_by" "uuid",
    "is_active" boolean,
    "sort_order" integer,
    "description" "text",
    "created_at" timestamp with time zone
);


ALTER TABLE "public"."environmental_cleaning_task_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environmental_cleaning_task_details" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "is_completed" boolean,
    "completed_by" "uuid",
    "completed_at" timestamp with time zone,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "duration_minutes" integer,
    "quality_score" numeric,
    "compliance_verified" boolean,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "facility_id" "uuid",
    "created_by" "uuid",
    "updated_by" "uuid",
    "photos" "jsonb",
    "environmental_clean_id" "uuid",
    "task_order" integer,
    "notes" "text",
    "task_description" "text",
    "task_name" character varying,
    "is_required" boolean
);


ALTER TABLE "public"."environmental_cleaning_task_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environmental_cleans_enhanced" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quality_score" numeric,
    "compliance_notes" "text",
    "supplies_consumed" "jsonb",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "verified_at" timestamp with time zone,
    "verified_by" "uuid",
    "cleaner_id" "uuid",
    "failed_items" "jsonb",
    "completed_items" "jsonb",
    "checklist_items" "jsonb",
    "compliance_score" numeric,
    "user_activities" "jsonb",
    "completed_time" timestamp with time zone,
    "started_time" timestamp with time zone,
    "scheduled_time" timestamp with time zone,
    "room_id" "uuid",
    "inventory_usage" "jsonb",
    "updated_by" "uuid",
    "created_by" "uuid",
    "task_end_times" "jsonb",
    "supervisor_notes" "text",
    "task_durations" "jsonb",
    "facility_id" "uuid",
    "supervisor_review_at" timestamp with time zone,
    "photos" "jsonb",
    "supervisor_review_by" "uuid",
    "corrective_actions" "jsonb",
    "task_start_times" "jsonb",
    "notes" "text",
    "cleaning_type" character varying,
    "status" character varying,
    "room_name" character varying,
    "quality_issues" "jsonb",
    "task_completion_details" "jsonb",
    "equipment_used" "jsonb"
);


ALTER TABLE "public"."environmental_cleans_enhanced" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipment_maintenance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "maintenance_type" character varying,
    "equipment_id" character varying,
    "facility_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" character varying,
    "created_by" "uuid" NOT NULL,
    "updated_by" "uuid" NOT NULL,
    "technician" character varying,
    "scheduled_date" "date",
    "completed_date" "date",
    "cost" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text",
    "autoclave_id" "uuid"
);


ALTER TABLE "public"."equipment_maintenance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message" "text" NOT NULL,
    "stack_trace" "text",
    "context" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."error_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_agent" "text",
    "error_message" "text",
    "context" "text",
    "updated_by" "uuid",
    "created_by" "uuid",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "facility_id" "uuid",
    "user_id" "uuid",
    "metadata" "jsonb",
    "error_stack" "text"
);


ALTER TABLE "public"."error_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."facilities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "is_active" boolean,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "hourly_rate" numeric,
    "staff_count" integer,
    "name" character varying,
    "type" character varying,
    "subscription_tier" character varying,
    "created_by" "uuid",
    "contact_info" "jsonb",
    "settings" "jsonb",
    "address" "jsonb",
    "updated_by" "uuid"
);


ALTER TABLE "public"."facilities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."facility_compliance_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "enforce_bi" boolean DEFAULT false,
    "enforce_ci" boolean DEFAULT false,
    "allow_overrides" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."facility_compliance_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."facility_notification_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facility_id" "uuid",
    "email_service_config" "jsonb",
    "sms_service_config" "jsonb",
    "webhook_service_config" "jsonb",
    "escalation_levels" "jsonb",
    "auto_notification_enabled" boolean,
    "notification_delay_minutes" integer,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "notification_channels" "text"[],
    "regulatory_bodies" "text"[]
);


ALTER TABLE "public"."facility_notification_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."facility_office_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone,
    "open_holidays" boolean,
    "end_hour" integer,
    "updated_by" "uuid",
    "timezone" "text",
    "start_hour" integer,
    "working_days" "jsonb",
    "facility_id" "uuid",
    "created_by" "uuid",
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."facility_office_hours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."home_challenge_completions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "challenge_id" "uuid",
    "user_id" "uuid",
    "facility_id" "uuid",
    "completed_at" timestamp with time zone,
    "points_earned" integer
);


ALTER TABLE "public"."home_challenge_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."home_challenges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "difficulty" character varying,
    "description" "text",
    "title" character varying,
    "points" integer,
    "facility_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "is_active" boolean,
    "updated_by" "uuid",
    "time_estimate" character varying,
    "category" character varying
);


ALTER TABLE "public"."home_challenges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."home_daily_operations_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" character varying,
    "facility_id" "uuid",
    "completed" boolean,
    "points" integer,
    "due_date" "date",
    "assigned_to" "uuid",
    "completed_by" "uuid",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "estimated_duration" integer,
    "actual_duration" integer,
    "title" character varying,
    "description" "text",
    "category" character varying,
    "priority" character varying,
    "status" character varying
);


ALTER TABLE "public"."home_daily_operations_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_ai_barcode_analysis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_id" "uuid",
    "analysis_result" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."inventory_ai_barcode_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_ai_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quality_assurance_enabled" boolean,
    "compliance_monitoring_enabled" boolean,
    "audit_trail_enhancement_enabled" boolean,
    "performance_monitoring" boolean,
    "ai_enabled" boolean,
    "facility_id" "uuid",
    "smart_categorization_enabled" boolean,
    "auto_classification_enabled" boolean,
    "smart_form_filling_enabled" boolean,
    "intelligent_workflow_enabled" boolean,
    "updated_by" "uuid",
    "risk_assessment_enabled" boolean,
    "scanner_intelligence_enabled" boolean,
    "multi_format_barcode_support" boolean,
    "cycle_optimization_enabled" boolean,
    "seasonal_analysis_enabled" boolean,
    "cost_optimization_enabled" boolean,
    "maintenance_prediction_enabled" boolean,
    "demand_forecasting_enabled" boolean,
    "predictive_analytics_enabled" boolean,
    "inventory_counting_enabled" boolean,
    "damage_detection_enabled" boolean,
    "quality_assessment_enabled" boolean,
    "image_recognition_enabled" boolean,
    "smart_validation_enabled" boolean,
    "error_prevention_enabled" boolean,
    "real_time_monitoring_enabled" boolean,
    "anomaly_detection_enabled" boolean,
    "predictive_maintenance_enabled" boolean,
    "smart_notifications_enabled" boolean,
    "barcode_scanning_enabled" boolean,
    "ai_confidence_threshold" numeric,
    "ai_data_retention_days" integer,
    "real_time_processing_enabled" boolean,
    "data_sharing_enabled" boolean,
    "local_ai_processing_enabled" boolean,
    "ai_version" character varying,
    "encrypted_data_transmission" boolean,
    "openai_api_key_encrypted" "text",
    "google_vision_api_key_encrypted" "text",
    "azure_computer_vision_key_encrypted" "text",
    "resource_optimization" boolean,
    "created_by" "uuid",
    "computer_vision_enabled" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "ai_model_training" boolean,
    "auto_optimization_enabled" boolean
);


ALTER TABLE "public"."inventory_ai_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_checks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facility_id" "uuid",
    "user_id" "uuid",
    "data" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "accuracy" numeric,
    "items_checked" integer
);


ALTER TABLE "public"."inventory_checks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reorder_point" numeric,
    "facility_id" "uuid",
    "quantity" integer,
    "data" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "expiration_date" "date",
    "unit_cost" numeric,
    "name" "text",
    "category" character varying,
    "reorder_level" integer,
    "status" "text"
);


ALTER TABLE "public"."inventory_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "total_items" integer,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "data" "jsonb",
    "user_id" "uuid",
    "status" character varying,
    "facility_id" "uuid"
);


ALTER TABLE "public"."inventory_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_article_ratings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "review" "text",
    "article_id" "uuid",
    "rating" integer
);


ALTER TABLE "public"."knowledge_article_ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_article_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "ip_address" "inet",
    "session_id" "uuid",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "view_duration_seconds" integer,
    "user_agent" "text",
    "article_id" "uuid"
);


ALTER TABLE "public"."knowledge_article_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "summary" "text",
    "facility_id" "uuid",
    "category_id" "uuid",
    "author_id" "uuid",
    "editor_id" "uuid",
    "published_at" timestamp with time zone,
    "last_modified_at" timestamp with time zone,
    "version" integer,
    "reading_time_minutes" integer,
    "featured" boolean,
    "allow_comments" boolean,
    "seo_keywords" "text"[],
    "seo_description" "text",
    "seo_title" character varying,
    "difficulty_level" character varying,
    "created_at" timestamp with time zone,
    "title" character varying,
    "updated_by" "uuid",
    "created_by" "uuid",
    "updated_at" timestamp with time zone,
    "visibility" character varying,
    "status" character varying,
    "tags" "text"[],
    "content" "text"
);


ALTER TABLE "public"."knowledge_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_bookmarks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "notes" "text",
    "folder_name" character varying,
    "user_id" "uuid",
    "article_id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."knowledge_bookmarks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "updated_by" "uuid",
    "created_by" "uuid",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "icon" character varying,
    "is_active" boolean,
    "sort_order" integer,
    "parent_category_id" "uuid",
    "facility_id" "uuid",
    "color" character varying,
    "description" "text",
    "name" character varying
);


ALTER TABLE "public"."knowledge_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_hub_content" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "is_active" boolean,
    "updated_at" timestamp with time zone,
    "updated_by" "uuid",
    "created_by" "uuid",
    "passing_score" integer,
    "title" character varying,
    "category" character varying,
    "mandatory_repeat" boolean,
    "repeat_settings" "jsonb",
    "estimated_duration" integer,
    "created_at" timestamp with time zone,
    "progress" integer,
    "due_date" "date",
    "status" character varying,
    "department" character varying,
    "description" "text",
    "tags" "text"[],
    "domain" character varying,
    "content_type" character varying,
    "facility_id" "uuid",
    "type" character varying,
    "difficulty_level" character varying
);


ALTER TABLE "public"."knowledge_hub_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_hub_user_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_id" "uuid",
    "progress_percentage" integer,
    "score" integer,
    "assigned_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "due_date" "date",
    "time_spent" integer,
    "attempts_count" integer,
    "is_repeat" boolean,
    "repeat_count" integer,
    "last_completed_at" timestamp with time zone,
    "notes" "text",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "last_accessed" timestamp with time zone,
    "content_type" character varying,
    "metadata" "jsonb",
    "status" character varying,
    "user_id" "uuid"
);


ALTER TABLE "public"."knowledge_hub_user_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_learning_paths" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "difficulty_level" character varying,
    "created_by" "uuid",
    "facility_id" "uuid",
    "category_id" "uuid",
    "updated_by" "uuid",
    "estimated_duration_hours" integer,
    "is_active" boolean,
    "featured" boolean,
    "title" character varying,
    "description" "text"
);


ALTER TABLE "public"."knowledge_learning_paths" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_quiz_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "earned_points" integer,
    "status" character varying,
    "user_id" "uuid" NOT NULL,
    "quiz_id" "uuid" NOT NULL,
    "attempt_number" integer,
    "score_percentage" numeric,
    "total_points" integer,
    "time_taken_minutes" integer,
    "answers" "jsonb",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."knowledge_quiz_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_quizzes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "max_attempts" integer,
    "passing_score_percentage" integer,
    "description" "text",
    "updated_by" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" character varying,
    "difficulty_level" character varying,
    "time_limit_minutes" integer,
    "category_id" "uuid" NOT NULL,
    "is_active" boolean
);


ALTER TABLE "public"."knowledge_quizzes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_user_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "article_id" "uuid" NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "time_spent_minutes" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "progress_status" character varying,
    "learning_path_id" "uuid" NOT NULL,
    "step_id" "uuid" NOT NULL,
    "completion_percentage" numeric
);


ALTER TABLE "public"."knowledge_user_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."learning_modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_type" character varying,
    "content_url" "text",
    "estimated_duration_minutes" integer,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "time_spent" integer,
    "score" numeric,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean,
    "title" character varying,
    "difficulty_level" character varying
);


ALTER TABLE "public"."learning_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."learning_pathways" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "target_audience" "text"[],
    "points" integer,
    "media" "jsonb",
    "prerequisites" "jsonb",
    "completion_threshold" integer,
    "allow_parallel" boolean,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_sequential" boolean,
    "estimated_total_duration_minutes" integer,
    "total_items" integer,
    "title" character varying,
    "description" "text",
    "published_at" timestamp with time zone,
    "domain" character varying,
    "status" character varying,
    "archived_at" timestamp with time zone,
    "department" character varying,
    "pathway_items" "jsonb",
    "author_id" "uuid" NOT NULL,
    "difficulty_level" character varying,
    "tags" "text"[],
    "is_active" boolean
);


ALTER TABLE "public"."learning_pathways" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."login_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone,
    "email" "text",
    "ip_address" "text",
    "updated_at" timestamp with time zone,
    "user_agent" "text",
    "attempted_at" timestamp with time zone,
    "success" boolean
);


ALTER TABLE "public"."login_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."monitoring_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" character varying,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "facility_id" "uuid",
    "action" character varying,
    "level" character varying,
    "user_id" "uuid",
    "message" "text",
    "metadata" "jsonb"
);


ALTER TABLE "public"."monitoring_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."monitoring_performance_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "metric_name" "text" NOT NULL,
    "metric_value" numeric,
    "recorded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."monitoring_performance_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "severity" character varying,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "is_read" boolean,
    "action_data" "jsonb",
    "facility_id" "uuid",
    "user_id" "uuid",
    "notification_type" character varying,
    "title" character varying,
    "message" "text",
    "module" character varying,
    "action_url" "text"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."office_closures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone,
    "recurring_pattern" "jsonb",
    "updated_at" timestamp with time zone,
    "is_recurring" boolean,
    "facility_id" "uuid",
    "closure_date" "date",
    "description" "text",
    "closure_type" "text"
);


ALTER TABLE "public"."office_closures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."performance_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "month" character varying,
    "metric_name" "text",
    "date" "date",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "metric_value" numeric,
    "facility_id" "uuid",
    "user_id" "uuid"
);


ALTER TABLE "public"."performance_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."policies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content_type" character varying,
    "domain" character varying,
    "policy_number" character varying,
    "version" character varying,
    "status" character varying,
    "department" character varying,
    "tags" "text"[],
    "description" "text",
    "archived_at" timestamp with time zone,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "points" integer,
    "estimated_read_time_minutes" integer,
    "compliance_required" boolean,
    "review_date" "date",
    "effective_date" "date",
    "media" "jsonb",
    "content" "jsonb",
    "author_id" "uuid" NOT NULL,
    "is_active" boolean,
    "is_repeat" boolean,
    "title" character varying
);


ALTER TABLE "public"."policies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procedures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "estimated_duration_minutes" integer,
    "published_at" timestamp with time zone,
    "domain" character varying,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content_type" character varying,
    "description" "text",
    "difficulty_level" character varying,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "points" integer,
    "title" character varying,
    "tags" "text"[],
    "safety_level" character varying,
    "equipment_required" "text"[],
    "materials_required" "text"[],
    "archived_at" timestamp with time zone,
    "is_repeat" boolean,
    "is_active" boolean,
    "author_id" "uuid" NOT NULL,
    "department" character varying,
    "status" character varying,
    "version" character varying,
    "procedure_number" character varying,
    "content" "jsonb",
    "media" "jsonb"
);


ALTER TABLE "public"."procedures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_feedback" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type" character varying(50) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "priority" character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    "user_id" "uuid",
    "facility_id" "uuid",
    "contact_email" character varying(255),
    "status" character varying(20) DEFAULT 'new'::character varying NOT NULL,
    "assigned_to" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "page_url" character varying(500),
    "user_agent" "text",
    "browser_info" "jsonb" DEFAULT '{}'::"jsonb",
    "internal_notes" "text",
    "resolution_notes" "text",
    "estimated_effort" character varying(50),
    "target_version" character varying(50),
    CONSTRAINT "product_feedback_priority_check" CHECK ((("priority")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[]))),
    CONSTRAINT "product_feedback_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['new'::character varying, 'reviewing'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'closed'::character varying])::"text"[]))),
    CONSTRAINT "product_feedback_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['bug'::character varying, 'feature'::character varying, 'improvement'::character varying, 'other'::character varying])::"text"[])))
);


ALTER TABLE "public"."product_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quality_incidents" (
    "created_at" timestamp with time zone,
    "id" "uuid",
    "status" character varying,
    "incident_type" character varying,
    "severity" "text",
    "description" "text",
    "reported_by" "uuid",
    "cost_impact" numeric,
    "updated_at" timestamp with time zone,
    "user_id" "uuid",
    "resolved_at" timestamp with time zone,
    "metadata" "jsonb",
    "facility_id" "uuid"
);


ALTER TABLE "public"."quality_incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quick_actions" (
    "action_name" character varying,
    "user_id" "uuid",
    "action_target" character varying,
    "action_icon" character varying,
    "action_color" character varying,
    "position" integer,
    "id" "uuid",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "facility_id" "uuid",
    "is_active" boolean,
    "action_type" character varying
);


ALTER TABLE "public"."quick_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."realtime_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "channel" "text" NOT NULL,
    "user_id" "uuid",
    "subscribed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."realtime_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rooms" (
    "department" character varying,
    "created_by" "uuid",
    "floor" character varying,
    "building" character varying,
    "room_type" character varying,
    "name" character varying,
    "barcode" character varying,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "is_active" boolean,
    "updated_by" "uuid",
    "capacity" integer,
    "id" "uuid"
);


ALTER TABLE "public"."rooms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sds_chemical_recommendations" (
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "user_rating" integer,
    "user_notes" "text",
    "completed_at" timestamp with time zone,
    "assigned_to" "uuid",
    "ai_confidence_score" numeric,
    "estimated_time_to_create" integer,
    "gap_analysis_id" "uuid",
    "facility_id" "uuid",
    "id" "uuid",
    "chemical_name" character varying,
    "category" character varying,
    "manufacturer" character varying,
    "priority" character varying,
    "risk_level" character varying,
    "reason" "text",
    "suggested_action" "text",
    "ai_reasoning" "text",
    "status" character varying
);


ALTER TABLE "public"."sds_chemical_recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sds_gap_analysis" (
    "id" "uuid",
    "analysis_date" timestamp with time zone,
    "total_chemicals" integer,
    "recommendations" "jsonb",
    "existing_sds_sheets" integer,
    "missing_sds_sheets" integer,
    "coverage_percentage" numeric,
    "high_priority_missing" integer,
    "medium_priority_missing" integer,
    "low_priority_missing" integer,
    "compliance_score" numeric,
    "ai_insights" "jsonb",
    "facility_id" "uuid",
    "library_snapshot" "jsonb",
    "inventory_snapshot" "jsonb",
    "created_at" timestamp with time zone,
    "estimated_total_time" integer,
    "analysis_type" character varying
);


ALTER TABLE "public"."sds_gap_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sds_sheets" (
    "osha_hazards" "text"[],
    "safe_handling" "text"[],
    "reproductive_toxicity" "text",
    "id" "uuid",
    "engineering_controls" "text"[],
    "pdf_file_size" integer,
    "revision_date" "date",
    "aquatic_toxicity" "text",
    "carcinogenicity" "text",
    "conditions_to_avoid" "text"[],
    "version" character varying,
    "stability" "text",
    "reference_list" "text"[],
    "molecular_weight" numeric,
    "notes" "text",
    "pdf_file_path" "text",
    "chemical_name" character varying,
    "cas_number" character varying,
    "physical_hazards" "text"[],
    "molecular_formula" character varying,
    "epa_regulations" "text"[],
    "appearance" "text",
    "first_aid_inhalation" "text",
    "health_hazards" "text"[],
    "odor" "text",
    "solubility" "text",
    "transport_hazard_class" character varying,
    "decomposition_products" "text"[],
    "density" character varying,
    "melting_point" character varying,
    "boiling_point" character varying,
    "emergency_procedures" "text"[],
    "packing_group" character varying,
    "chronic_effects" "text"[],
    "protective_equipment" "text"[],
    "status" character varying,
    "updated_by" "uuid",
    "special_hazards" "text"[],
    "extinguishing_media" "text"[],
    "incompatible_materials" "text"[],
    "priority" character varying,
    "risk_level" character varying,
    "first_aid_ingestion" "text",
    "first_aid_eye_contact" "text",
    "bioaccumulation" "text",
    "un_number" character varying,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "proper_shipping_name" character varying,
    "dot_classification" character varying,
    "first_aid_skin_contact" "text",
    "personal_protection" "text"[],
    "title" character varying,
    "description" "text",
    "environmental_hazards" "text"[],
    "biodegradability" "text",
    "facility_id" "uuid",
    "pdf_uploaded_at" timestamp with time zone,
    "last_ai_analysis" timestamp with time zone,
    "ai_confidence_score" numeric,
    "ai_recommendations" "jsonb",
    "storage_requirements" "text"[],
    "disposal_methods" "text"[],
    "ghs_classification" "text"[],
    "acute_effects" "text"[],
    "created_by" "uuid",
    "ventilation_requirements" "text",
    "monitoring_methods" "text"[],
    "exposure_limits" "text"[]
);


ALTER TABLE "public"."sds_sheets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."status_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "color" character varying NOT NULL,
    "icon" character varying NOT NULL,
    "description" "text",
    "is_core" boolean DEFAULT false NOT NULL,
    "is_published" boolean DEFAULT true NOT NULL,
    "category" character varying,
    "requires_verification" boolean DEFAULT false,
    "auto_transition" boolean DEFAULT false,
    "transition_to" character varying,
    "alert_level" character varying,
    "sort_order" integer DEFAULT 0,
    "facility_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "status_types_alert_level_check" CHECK ((("alert_level")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[])))
);


ALTER TABLE "public"."status_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sterilization_batches" (
    "cycle_id" "uuid" NOT NULL,
    "package_count" integer,
    "total_items" integer,
    "requested_by" "uuid" NOT NULL,
    "requested_for" timestamp with time zone,
    "id" "uuid" NOT NULL,
    "package_type" character varying,
    "package_id" character varying,
    "batch_name" character varying,
    "packaged_at" timestamp with time zone,
    "facility_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "batch_type" character varying,
    "completed_at" timestamp with time zone,
    "priority" character varying,
    "packaged_by" "uuid" NOT NULL,
    "status" character varying,
    "notes" "text",
    "chemical_indicator_added" boolean,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "package_size" character varying
);


ALTER TABLE "public"."sterilization_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sterilization_cycle_tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cycle_id" "uuid" NOT NULL,
    "tool_id" "uuid" NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sterilization_cycle_tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sterilization_cycles" (
    "temperature_celsius" numeric,
    "id" "uuid" NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "operator_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "duration_minutes" integer,
    "pressure_psi" numeric,
    "parameters" "jsonb",
    "results" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tools" "jsonb",
    "cycle_time" integer,
    "autoclave_id" "uuid" NOT NULL,
    "tool_batch_id" "uuid" NOT NULL,
    "cycle_type" character varying,
    "cycle_number" character varying,
    "status" character varying,
    "notes" "text"
);


ALTER TABLE "public"."sterilization_cycles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sterilization_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "notes" "text",
    "occurred_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sterilization_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sterilization_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "cycle_id" "uuid",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sterilization_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_performance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "performance_score" numeric,
    "total_orders" integer,
    "last_order_date" "date",
    "quality_rating" numeric,
    "cost_trend" character varying,
    "delivery_time_days" integer,
    "category" character varying,
    "supplier_name" character varying,
    "facility_id" "uuid",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone
);


ALTER TABLE "public"."supplier_performance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tool_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" character varying,
    "category" character varying,
    "description" "text",
    "name" character varying
);


ALTER TABLE "public"."tool_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tools" (
    "id" "uuid" NOT NULL,
    "barcode" character varying,
    "tool_type" character varying,
    "tool_name" character varying,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" character varying,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "latitude" numeric,
    "longitude" numeric,
    "gps_accuracy" numeric,
    "location_timestamp" timestamp with time zone,
    "notes" "text",
    "facility_id" "uuid" NOT NULL,
    "current_cycle_id" "uuid" NOT NULL,
    "last_sterilized" timestamp with time zone,
    "location" character varying,
    "sterilization_count" integer,
    "maintenance_due_date" "date",
    "metadata" "jsonb",
    "model" character varying,
    "manufacturer" character varying,
    "serial_number" character varying
);


ALTER TABLE "public"."tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_certifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "issued_at" timestamp with time zone,
    "user_id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "certification_name" "text",
    "expiry_date" "date"
);


ALTER TABLE "public"."user_certifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_facilities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_facilities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_gamification_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "completed_tasks" integer,
    "total_points" integer,
    "facility_id" "uuid",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "user_id" "uuid",
    "best_streak" integer,
    "current_streak" integer,
    "date" "date",
    "total_tasks" integer
);


ALTER TABLE "public"."user_gamification_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_learning_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "updated_at" timestamp with time zone,
    "module_name" "text",
    "created_at" timestamp with time zone,
    "progress" numeric,
    "user_id" "uuid",
    "time_spent_minutes" integer,
    "score" numeric
);


ALTER TABLE "public"."user_learning_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "preference_key" character varying,
    "facility_id" "uuid",
    "created_at" timestamp with time zone,
    "user_id" "uuid",
    "preference_type" character varying,
    "updated_at" timestamp with time zone,
    "preference_value" "jsonb",
    "is_global" boolean
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "status" character varying,
    "learning_pathway_id" "uuid",
    "created_at" timestamp with time zone,
    "is_repeat" boolean,
    "progress_percentage" integer,
    "content_type" character varying,
    "attempts_count" integer,
    "notes" "text",
    "metadata" "jsonb",
    "content_id" "uuid",
    "user_id" "uuid",
    "repeat_count" integer,
    "last_completed_at" timestamp with time zone,
    "time_spent_minutes" integer,
    "due_date" "date",
    "completed_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "assigned_at" timestamp with time zone,
    "score" integer
);


ALTER TABLE "public"."user_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_security_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "remember_me_duration" integer,
    "user_id" "uuid",
    "updated_at" timestamp with time zone,
    "inactive_timeout" integer,
    "created_at" timestamp with time zone,
    "session_timeout" integer,
    "two_factor_enabled" boolean,
    "require_reauth_for_sensitive" boolean
);


ALTER TABLE "public"."user_security_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "is_active" boolean,
    "logout_time" timestamp with time zone,
    "login_time" timestamp with time zone,
    "ip_address" "inet",
    "session_token" "text",
    "device_info" "jsonb",
    "user_id" "uuid",
    "last_activity" timestamp with time zone,
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_training_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "completion_date" "date",
    "facility_id" "uuid",
    "user_id" "uuid",
    "score" numeric,
    "expiry_date" "date",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "notes" "text",
    "completion_status" character varying,
    "training_type" character varying
);


ALTER TABLE "public"."user_training_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facility_id" "uuid" NOT NULL,
    "preferences" "jsonb",
    "last_login" timestamp with time zone,
    "is_active" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "date_of_birth" "date",
    "emergency_contact" "jsonb",
    "work_schedule" "jsonb",
    "total_points" integer,
    "mobile_shortcuts" "jsonb",
    "active_sessions" integer,
    "email" character varying,
    "full_name" character varying,
    "role" character varying,
    "department" character varying,
    "position" character varying,
    "phone" character varying,
    "avatar_url" "text",
    "bio" "text",
    "preferred_language" character varying,
    "timezone" character varying,
    "first_name" character varying,
    "last_name" character varying
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "url" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."webhook_notifications" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_feed"
    ADD CONSTRAINT "activity_feed_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_challenge_completions"
    ADD CONSTRAINT "ai_challenge_completions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_content_recommendations"
    ADD CONSTRAINT "ai_content_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_learning_analytics"
    ADD CONSTRAINT "ai_learning_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_learning_insights"
    ADD CONSTRAINT "ai_learning_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_task_performance"
    ADD CONSTRAINT "ai_task_performance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autoclave_equipment"
    ADD CONSTRAINT "autoclave_equipment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autoclave_receipts"
    ADD CONSTRAINT "autoclave_receipts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autoclaves"
    ADD CONSTRAINT "autoclaves_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."barcode_counts"
    ADD CONSTRAINT "barcode_counts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bi_activity_log"
    ADD CONSTRAINT "bi_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bi_failure_incidents"
    ADD CONSTRAINT "bi_failure_incidents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bi_test_kits"
    ADD CONSTRAINT "bi_test_kits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bi_test_results"
    ADD CONSTRAINT "bi_test_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."biological_indicator_tests"
    ADD CONSTRAINT "biological_indicator_tests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."biological_indicators"
    ADD CONSTRAINT "biological_indicators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cleaning_tasks"
    ADD CONSTRAINT "cleaning_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_alert_queue"
    ADD CONSTRAINT "email_alert_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environmental_cleaning_predefined_tasks"
    ADD CONSTRAINT "environmental_cleaning_predefined_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environmental_cleaning_task_categories"
    ADD CONSTRAINT "environmental_cleaning_task_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environmental_cleaning_task_details"
    ADD CONSTRAINT "environmental_cleaning_task_details_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environmental_cleans_enhanced"
    ADD CONSTRAINT "environmental_cleans_enhanced_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."equipment_maintenance"
    ADD CONSTRAINT "equipment_maintenance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_logs"
    ADD CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_reports"
    ADD CONSTRAINT "error_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."facilities"
    ADD CONSTRAINT "facilities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."facility_compliance_settings"
    ADD CONSTRAINT "facility_compliance_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."facility_notification_config"
    ADD CONSTRAINT "facility_notification_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."facility_office_hours"
    ADD CONSTRAINT "facility_office_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."home_challenge_completions"
    ADD CONSTRAINT "home_challenge_completions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."home_challenges"
    ADD CONSTRAINT "home_challenges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."home_daily_operations_tasks"
    ADD CONSTRAINT "home_daily_operations_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_ai_barcode_analysis"
    ADD CONSTRAINT "inventory_ai_barcode_analysis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_ai_settings"
    ADD CONSTRAINT "inventory_ai_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_checks"
    ADD CONSTRAINT "inventory_checks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_orders"
    ADD CONSTRAINT "inventory_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_article_ratings"
    ADD CONSTRAINT "knowledge_article_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_article_views"
    ADD CONSTRAINT "knowledge_article_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_articles"
    ADD CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_bookmarks"
    ADD CONSTRAINT "knowledge_bookmarks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_categories"
    ADD CONSTRAINT "knowledge_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_hub_content"
    ADD CONSTRAINT "knowledge_hub_content_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_hub_user_progress"
    ADD CONSTRAINT "knowledge_hub_user_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_learning_paths"
    ADD CONSTRAINT "knowledge_learning_paths_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_quiz_attempts"
    ADD CONSTRAINT "knowledge_quiz_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_quizzes"
    ADD CONSTRAINT "knowledge_quizzes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_user_progress"
    ADD CONSTRAINT "knowledge_user_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."learning_modules"
    ADD CONSTRAINT "learning_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."learning_pathways"
    ADD CONSTRAINT "learning_pathways_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."login_attempts"
    ADD CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monitoring_events"
    ADD CONSTRAINT "monitoring_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monitoring_performance_metrics"
    ADD CONSTRAINT "monitoring_performance_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."office_closures"
    ADD CONSTRAINT "office_closures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."performance_metrics"
    ADD CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."policies"
    ADD CONSTRAINT "policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedures"
    ADD CONSTRAINT "procedures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_feedback"
    ADD CONSTRAINT "product_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."realtime_subscriptions"
    ADD CONSTRAINT "realtime_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."status_types"
    ADD CONSTRAINT "status_types_name_facility_id_key" UNIQUE ("name", "facility_id");



ALTER TABLE ONLY "public"."status_types"
    ADD CONSTRAINT "status_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sterilization_batches"
    ADD CONSTRAINT "sterilization_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sterilization_cycle_tools"
    ADD CONSTRAINT "sterilization_cycle_tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sterilization_cycles"
    ADD CONSTRAINT "sterilization_cycles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sterilization_events"
    ADD CONSTRAINT "sterilization_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sterilization_sessions"
    ADD CONSTRAINT "sterilization_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_performance"
    ADD CONSTRAINT "supplier_performance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tool_batches"
    ADD CONSTRAINT "tool_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tools"
    ADD CONSTRAINT "tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_certifications"
    ADD CONSTRAINT "user_certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_facilities"
    ADD CONSTRAINT "user_facilities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_gamification_stats"
    ADD CONSTRAINT "user_gamification_stats_facility_unique" UNIQUE ("facility_id");



ALTER TABLE ONLY "public"."user_gamification_stats"
    ADD CONSTRAINT "user_gamification_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_learning_progress"
    ADD CONSTRAINT "user_learning_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_security_settings"
    ADD CONSTRAINT "user_security_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_training_records"
    ADD CONSTRAINT "user_training_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_notifications"
    ADD CONSTRAINT "webhook_notifications_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_logs_created_by" ON "public"."audit_logs" USING "btree" ("created_by");



CREATE INDEX "idx_audit_logs_updated_by" ON "public"."audit_logs" USING "btree" ("updated_by");



CREATE INDEX "idx_bi_activity_log_facility_id" ON "public"."bi_activity_log" USING "btree" ("facility_id");



CREATE INDEX "idx_certifications_name" ON "public"."certifications" USING "btree" ("name");



CREATE INDEX "idx_certifications_user_id" ON "public"."certifications" USING "btree" ("user_id");



CREATE INDEX "idx_certifications_user_name" ON "public"."certifications" USING "btree" ("user_id", "name");



CREATE INDEX "idx_cleaning_tasks_facility_id" ON "public"."cleaning_tasks" USING "btree" ("facility_id");



CREATE INDEX "idx_env_clean_predefined_tasks_facility_id" ON "public"."environmental_cleaning_predefined_tasks" USING "btree" ("facility_id");



CREATE INDEX "idx_env_clean_task_categories_facility_id" ON "public"."environmental_cleaning_task_categories" USING "btree" ("facility_id");



CREATE INDEX "idx_env_clean_task_details_env_clean_id" ON "public"."environmental_cleaning_task_details" USING "btree" ("environmental_clean_id");



CREATE INDEX "idx_env_clean_task_details_facility_id" ON "public"."environmental_cleaning_task_details" USING "btree" ("facility_id");



CREATE INDEX "idx_env_cleans_enhanced_cleaner_id" ON "public"."environmental_cleans_enhanced" USING "btree" ("cleaner_id");



CREATE INDEX "idx_env_cleans_enhanced_facility_id" ON "public"."environmental_cleans_enhanced" USING "btree" ("facility_id");



CREATE INDEX "idx_env_cleans_enhanced_room_id" ON "public"."environmental_cleans_enhanced" USING "btree" ("room_id");



CREATE INDEX "idx_facility_compliance_settings_facility_id" ON "public"."facility_compliance_settings" USING "btree" ("facility_id");



CREATE INDEX "idx_facility_office_hours_facility_id" ON "public"."facility_office_hours" USING "btree" ("facility_id");



CREATE INDEX "idx_home_challenge_completions_challenge_id" ON "public"."home_challenge_completions" USING "btree" ("challenge_id");



CREATE INDEX "idx_home_challenge_completions_facility_id" ON "public"."home_challenge_completions" USING "btree" ("facility_id");



CREATE INDEX "idx_home_challenge_completions_user_id" ON "public"."home_challenge_completions" USING "btree" ("user_id");



CREATE INDEX "idx_home_challenges_facility_id" ON "public"."home_challenges" USING "btree" ("facility_id");



CREATE INDEX "idx_home_daily_ops_assigned_to" ON "public"."home_daily_operations_tasks" USING "btree" ("assigned_to");



CREATE INDEX "idx_home_daily_ops_completed_by" ON "public"."home_daily_operations_tasks" USING "btree" ("completed_by");



CREATE INDEX "idx_home_daily_ops_facility_id" ON "public"."home_daily_operations_tasks" USING "btree" ("facility_id");



CREATE INDEX "idx_monitoring_performance_metrics_facility_id" ON "public"."monitoring_performance_metrics" USING "btree" ("facility_id");



CREATE INDEX "idx_office_closures_closure_date" ON "public"."office_closures" USING "btree" ("closure_date");



CREATE INDEX "idx_office_closures_facility_id" ON "public"."office_closures" USING "btree" ("facility_id");



CREATE INDEX "idx_product_feedback_created_at" ON "public"."product_feedback" USING "btree" ("created_at");



CREATE INDEX "idx_product_feedback_facility_id" ON "public"."product_feedback" USING "btree" ("facility_id");



CREATE INDEX "idx_product_feedback_priority" ON "public"."product_feedback" USING "btree" ("priority");



CREATE INDEX "idx_product_feedback_status" ON "public"."product_feedback" USING "btree" ("status");



CREATE INDEX "idx_product_feedback_type" ON "public"."product_feedback" USING "btree" ("type");



CREATE INDEX "idx_product_feedback_user_id" ON "public"."product_feedback" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_rooms_barcode" ON "public"."rooms" USING "btree" ("barcode");



CREATE INDEX "idx_rooms_is_active" ON "public"."rooms" USING "btree" ("is_active");



CREATE INDEX "idx_rooms_name" ON "public"."rooms" USING "btree" ("name");



CREATE INDEX "idx_sterilization_cycle_tools_cycle_id" ON "public"."sterilization_cycle_tools" USING "btree" ("cycle_id");



CREATE INDEX "idx_sterilization_events_session_id" ON "public"."sterilization_events" USING "btree" ("session_id");



CREATE INDEX "idx_sterilization_sessions_facility_id" ON "public"."sterilization_sessions" USING "btree" ("facility_id");



CREATE INDEX "idx_user_gamification_stats_facility_id" ON "public"."user_gamification_stats" USING "btree" ("facility_id");



CREATE INDEX "idx_user_gamification_stats_user_date" ON "public"."user_gamification_stats" USING "btree" ("user_id", "date");



CREATE INDEX "idx_user_gamification_stats_user_id" ON "public"."user_gamification_stats" USING "btree" ("user_id");



CREATE INDEX "idx_user_learning_progress_module" ON "public"."user_learning_progress" USING "btree" ("module_name");



CREATE INDEX "idx_user_learning_progress_user_id" ON "public"."user_learning_progress" USING "btree" ("user_id");



CREATE INDEX "idx_user_learning_progress_user_module" ON "public"."user_learning_progress" USING "btree" ("user_id", "module_name");



CREATE INDEX "idx_user_preferences_facility_id" ON "public"."user_preferences" USING "btree" ("facility_id");



CREATE INDEX "idx_user_preferences_lookup" ON "public"."user_preferences" USING "btree" ("user_id", "preference_type", "preference_key");



CREATE INDEX "idx_user_preferences_user_id" ON "public"."user_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_user_progress_content_id" ON "public"."user_progress" USING "btree" ("content_id");



CREATE INDEX "idx_user_progress_learning_pathway_id" ON "public"."user_progress" USING "btree" ("learning_pathway_id");



CREATE INDEX "idx_user_progress_user_content" ON "public"."user_progress" USING "btree" ("user_id", "content_id");



CREATE INDEX "idx_user_progress_user_id" ON "public"."user_progress" USING "btree" ("user_id");



CREATE INDEX "idx_user_roles_facility_id" ON "public"."user_roles" USING "btree" ("facility_id");



CREATE INDEX "idx_user_roles_user_id" ON "public"."user_roles" USING "btree" ("user_id");



CREATE INDEX "idx_user_sessions_session_token" ON "public"."user_sessions" USING "btree" ("session_token");



CREATE INDEX "idx_user_sessions_user_active" ON "public"."user_sessions" USING "btree" ("user_id", "is_active");



CREATE INDEX "idx_user_sessions_user_id" ON "public"."user_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_user_training_records_facility_id" ON "public"."user_training_records" USING "btree" ("facility_id");



CREATE INDEX "idx_user_training_records_user_id" ON "public"."user_training_records" USING "btree" ("user_id");



CREATE INDEX "idx_user_training_records_user_type" ON "public"."user_training_records" USING "btree" ("user_id", "training_type");



CREATE UNIQUE INDEX "user_facilities_user_facility_idx" ON "public"."user_facilities" USING "btree" ("user_id", "facility_id");



CREATE OR REPLACE TRIGGER "set_facilities_created_at" BEFORE INSERT ON "public"."facilities" FOR EACH ROW EXECUTE FUNCTION "public"."set_created_at"();



CREATE OR REPLACE TRIGGER "set_facilities_updated_at" BEFORE UPDATE ON "public"."facilities" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_activity_feed" BEFORE INSERT ON "public"."activity_feed" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_ai_challenge_completions" BEFORE INSERT ON "public"."ai_challenge_completions" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_ai_content_recommendations" BEFORE INSERT ON "public"."ai_content_recommendations" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_ai_learning_analytics" BEFORE INSERT ON "public"."ai_learning_analytics" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_ai_learning_insights" BEFORE INSERT ON "public"."ai_learning_insights" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_ai_task_performance" BEFORE INSERT ON "public"."ai_task_performance" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_audit_logs" BEFORE INSERT ON "public"."audit_logs" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_bi_failure_incidents" BEFORE INSERT ON "public"."bi_failure_incidents" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_bi_test_kits" BEFORE INSERT ON "public"."bi_test_kits" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_bi_test_results" BEFORE INSERT ON "public"."bi_test_results" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_cleaning_tasks" BEFORE INSERT ON "public"."cleaning_tasks" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_environmental_cleaning_predefined_tasks" BEFORE INSERT ON "public"."environmental_cleaning_predefined_tasks" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_environmental_cleaning_task_categories" BEFORE INSERT ON "public"."environmental_cleaning_task_categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_environmental_cleaning_task_details" BEFORE INSERT ON "public"."environmental_cleaning_task_details" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_environmental_cleans_enhanced" BEFORE INSERT ON "public"."environmental_cleans_enhanced" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_equipment_maintenance" BEFORE INSERT ON "public"."equipment_maintenance" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_error_reports" BEFORE INSERT ON "public"."error_reports" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_facility_notification_config" BEFORE INSERT ON "public"."facility_notification_config" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_facility_office_hours" BEFORE INSERT ON "public"."facility_office_hours" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_home_challenge_completions" BEFORE INSERT ON "public"."home_challenge_completions" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_home_challenges" BEFORE INSERT ON "public"."home_challenges" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_home_daily_operations_tasks" BEFORE INSERT ON "public"."home_daily_operations_tasks" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_inventory_ai_settings" BEFORE INSERT ON "public"."inventory_ai_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_inventory_checks" BEFORE INSERT ON "public"."inventory_checks" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_inventory_items" BEFORE INSERT ON "public"."inventory_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_inventory_orders" BEFORE INSERT ON "public"."inventory_orders" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_knowledge_articles" BEFORE INSERT ON "public"."knowledge_articles" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_knowledge_categories" BEFORE INSERT ON "public"."knowledge_categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_knowledge_hub_content" BEFORE INSERT ON "public"."knowledge_hub_content" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_knowledge_learning_paths" BEFORE INSERT ON "public"."knowledge_learning_paths" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_knowledge_quizzes" BEFORE INSERT ON "public"."knowledge_quizzes" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();






CREATE OR REPLACE TRIGGER "set_facility_defaults_notifications" BEFORE INSERT ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_office_closures" BEFORE INSERT ON "public"."office_closures" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_performance_metrics" BEFORE INSERT ON "public"."performance_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_product_feedback" BEFORE INSERT ON "public"."product_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_quality_incidents" BEFORE INSERT ON "public"."quality_incidents" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_quick_actions" BEFORE INSERT ON "public"."quick_actions" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_sds_chemical_recommendations" BEFORE INSERT ON "public"."sds_chemical_recommendations" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_sds_gap_analysis" BEFORE INSERT ON "public"."sds_gap_analysis" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_sds_sheets" BEFORE INSERT ON "public"."sds_sheets" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_status_types" BEFORE INSERT ON "public"."status_types" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_sterilization_batches" BEFORE INSERT ON "public"."sterilization_batches" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_sterilization_cycles" BEFORE INSERT ON "public"."sterilization_cycles" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_supplier_performance" BEFORE INSERT ON "public"."supplier_performance" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_tool_batches" BEFORE INSERT ON "public"."tool_batches" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_tools" BEFORE INSERT ON "public"."tools" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_user_facilities" BEFORE INSERT ON "public"."user_facilities" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_user_gamification_stats" BEFORE INSERT ON "public"."user_gamification_stats" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_user_preferences" BEFORE INSERT ON "public"."user_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_user_training_records" BEFORE INSERT ON "public"."user_training_records" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "set_facility_defaults_users" BEFORE INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."set_facilities_created_by"();



CREATE OR REPLACE TRIGGER "update_product_feedback_updated_at" BEFORE UPDATE ON "public"."product_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bi_activity_log"
    ADD CONSTRAINT "bi_activity_log_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bi_activity_log"
    ADD CONSTRAINT "bi_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bi_failure_incidents"
    ADD CONSTRAINT "bi_failure_incidents_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "public"."sterilization_cycles"("id");



ALTER TABLE ONLY "public"."bi_failure_incidents"
    ADD CONSTRAINT "bi_failure_incidents_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id");



ALTER TABLE ONLY "public"."bi_failure_incidents"
    ADD CONSTRAINT "bi_failure_incidents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id");



ALTER TABLE ONLY "public"."equipment_maintenance"
    ADD CONSTRAINT "equipment_maintenance_autoclave_id_fkey" FOREIGN KEY ("autoclave_id") REFERENCES "public"."autoclave_equipment"("id");



ALTER TABLE ONLY "public"."facility_compliance_settings"
    ADD CONSTRAINT "facility_compliance_settings_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_quiz_attempts"
    ADD CONSTRAINT "knowledge_quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."knowledge_quizzes"("id");



ALTER TABLE ONLY "public"."knowledge_quiz_attempts"
    ADD CONSTRAINT "knowledge_quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."knowledge_quizzes"
    ADD CONSTRAINT "knowledge_quizzes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."knowledge_categories"("id");



ALTER TABLE ONLY "public"."knowledge_quizzes"
    ADD CONSTRAINT "knowledge_quizzes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."knowledge_quizzes"
    ADD CONSTRAINT "knowledge_quizzes_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id");



ALTER TABLE ONLY "public"."knowledge_quizzes"
    ADD CONSTRAINT "knowledge_quizzes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."knowledge_user_progress"
    ADD CONSTRAINT "knowledge_user_progress_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."courses"("id");



ALTER TABLE ONLY "public"."knowledge_user_progress"
    ADD CONSTRAINT "knowledge_user_progress_learning_path_id_fkey" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_pathways"("id");



ALTER TABLE ONLY "public"."knowledge_user_progress"
    ADD CONSTRAINT "knowledge_user_progress_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "public"."learning_modules"("id");



ALTER TABLE ONLY "public"."knowledge_user_progress"
    ADD CONSTRAINT "knowledge_user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."learning_modules"
    ADD CONSTRAINT "learning_modules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."learning_pathways"
    ADD CONSTRAINT "learning_pathways_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."monitoring_performance_metrics"
    ADD CONSTRAINT "monitoring_performance_metrics_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."policies"
    ADD CONSTRAINT "policies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."procedures"
    ADD CONSTRAINT "procedures_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."product_feedback"
    ADD CONSTRAINT "product_feedback_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_feedback"
    ADD CONSTRAINT "product_feedback_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_feedback"
    ADD CONSTRAINT "product_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."status_types"
    ADD CONSTRAINT "status_types_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."status_types"
    ADD CONSTRAINT "status_types_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."status_types"
    ADD CONSTRAINT "status_types_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sterilization_cycle_tools"
    ADD CONSTRAINT "sterilization_cycle_tools_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "public"."sterilization_cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sterilization_cycle_tools"
    ADD CONSTRAINT "sterilization_cycle_tools_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sterilization_cycle_tools"
    ADD CONSTRAINT "sterilization_cycle_tools_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sterilization_cycles"
    ADD CONSTRAINT "sterilization_cycles_autoclave_id_fkey" FOREIGN KEY ("autoclave_id") REFERENCES "public"."autoclave_equipment"("id");



ALTER TABLE ONLY "public"."sterilization_cycles"
    ADD CONSTRAINT "sterilization_cycles_tool_batch_id_fkey" FOREIGN KEY ("tool_batch_id") REFERENCES "public"."tool_batches"("id");



ALTER TABLE ONLY "public"."sterilization_events"
    ADD CONSTRAINT "sterilization_events_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sterilization_events"
    ADD CONSTRAINT "sterilization_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sterilization_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sterilization_sessions"
    ADD CONSTRAINT "sterilization_sessions_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "public"."sterilization_cycles"("id");



ALTER TABLE ONLY "public"."sterilization_sessions"
    ADD CONSTRAINT "sterilization_sessions_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tool_batches"
    ADD CONSTRAINT "tool_batches_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id");



ALTER TABLE ONLY "public"."user_facilities"
    ADD CONSTRAINT "user_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_facilities"
    ADD CONSTRAINT "user_facilities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow login attempt recording" ON "public"."login_attempts" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow login attempt updates" ON "public"."login_attempts" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow users to read their facility gamification stats" ON "public"."user_gamification_stats" FOR SELECT USING ((("auth"."uid"() = "user_id") AND ("facility_id" IS NOT NULL)));



CREATE POLICY "Facility admins can view facility feedback" ON "public"."product_feedback" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_facilities" "uf"
  WHERE (("uf"."facility_id" = "product_feedback"."facility_id") AND ("uf"."user_id" = "auth"."uid"()) AND ("uf"."role" = 'admin'::"text")))));



CREATE POLICY "Facility members can access SDS gap analysis" ON "public"."sds_gap_analysis" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access SDS recommendations" ON "public"."sds_chemical_recommendations" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access SDS sheets" ON "public"."sds_sheets" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access monitoring events" ON "public"."monitoring_events" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access notifications" ON "public"."notifications" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access office closures" ON "public"."office_closures" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access performance metrics" ON "public"."performance_metrics" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access quality incidents" ON "public"."quality_incidents" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access quick actions" ON "public"."quick_actions" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access sterilization cycles" ON "public"."sterilization_cycles" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access sterilization data" ON "public"."sterilization_batches" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access sterilization tools" ON "public"."tools" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access supplier performance" ON "public"."supplier_performance" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Facility members can access tool batches" ON "public"."tool_batches" USING (("facility_id" IN ( SELECT "user_facilities"."facility_id"
   FROM "public"."user_facilities"
  WHERE ("user_facilities"."user_id" = "auth"."uid"()))));



CREATE POLICY "Public read access to knowledge articles" ON "public"."knowledge_articles" FOR SELECT USING (true);



CREATE POLICY "Public read access to knowledge categories" ON "public"."knowledge_categories" FOR SELECT USING (true);



CREATE POLICY "Public read access to knowledge hub content" ON "public"."knowledge_hub_content" FOR SELECT USING (true);



CREATE POLICY "Public read access to policies" ON "public"."policies" FOR SELECT USING (true);



CREATE POLICY "Public read access to procedures" ON "public"."procedures" FOR SELECT USING (true);



CREATE POLICY "System admins can view all feedback" ON "public"."product_feedback" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Users can access their facility" ON "public"."facilities" FOR SELECT USING (("id" = ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can access their own facility activity_feed" ON "public"."activity_feed" USING ((("facility_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Users can delete their own ratings" ON "public"."knowledge_article_ratings" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own feedback" ON "public"."product_feedback" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert ratings in their facility" ON "public"."knowledge_article_ratings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."knowledge_articles" "a"
     JOIN "public"."user_facilities" "uf" ON (("uf"."facility_id" = "a"."facility_id")))
  WHERE (("a"."id" = "knowledge_article_ratings"."article_id") AND ("uf"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own account row" ON "public"."users" USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own certifications" ON "public"."user_certifications" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own facility links" ON "public"."user_facilities" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own gamification stats" ON "public"."user_gamification_stats" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own learning progress" ON "public"."user_learning_progress" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own preferences" ON "public"."user_preferences" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own progress" ON "public"."user_progress" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own security settings" ON "public"."user_security_settings" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own sessions" ON "public"."user_sessions" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own training records" ON "public"."user_training_records" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own feedback" ON "public"."product_feedback" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND (("status")::"text" = 'new'::"text")));



CREATE POLICY "Users can update their own ratings" ON "public"."knowledge_article_ratings" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view article ratings in their facility" ON "public"."knowledge_article_ratings" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."knowledge_articles" "a"
     JOIN "public"."user_facilities" "uf" ON (("uf"."facility_id" = "a"."facility_id")))
  WHERE (("a"."id" = "knowledge_article_ratings"."article_id") AND ("uf"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own feedback" ON "public"."product_feedback" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own facility links" ON "public"."user_facilities" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own login attempts" ON "public"."login_attempts" FOR SELECT USING (("email" = ("auth"."jwt"() ->> 'email'::"text")));



ALTER TABLE "public"."activity_feed" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_challenge_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_content_recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_learning_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_learning_insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_task_performance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."autoclave_equipment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bi_failure_incidents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bi_test_kits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bi_test_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."biological_indicators" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cleaning_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environmental_cleaning_predefined_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environmental_cleaning_task_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environmental_cleaning_task_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environmental_cleans_enhanced" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."equipment_maintenance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."facilities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "facilities_delete_policy" ON "public"."facilities" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role")::"text" = 'admin'::"text")))) OR ("auth"."role"() = 'dashboard_user'::"text") OR ("auth"."role"() = 'authenticator'::"text")));



CREATE POLICY "facilities_insert_policy" ON "public"."facilities" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role")::"text" = 'admin'::"text")))) OR ("auth"."role"() = 'dashboard_user'::"text") OR ("auth"."role"() = 'authenticator'::"text")));



CREATE POLICY "facilities_select_policy" ON "public"."facilities" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role")::"text" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."facility_id" = "facilities"."id")))) OR ("auth"."role"() = 'dashboard_user'::"text") OR ("auth"."role"() = 'anon'::"text")));



CREATE POLICY "facilities_update_policy" ON "public"."facilities" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role")::"text" = 'admin'::"text")))) OR ("auth"."role"() = 'dashboard_user'::"text") OR ("auth"."role"() = 'authenticator'::"text"))) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role")::"text" = 'admin'::"text")))) OR ("auth"."role"() = 'dashboard_user'::"text") OR ("auth"."role"() = 'authenticator'::"text")));



ALTER TABLE "public"."facility_notification_config" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "facility_notification_config_policy" ON "public"."facility_notification_config" USING (("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."facility_office_hours" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "facility_office_hours_policy" ON "public"."facility_office_hours" USING (("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."home_challenge_completions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "home_challenge_completions_policy" ON "public"."home_challenge_completions" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."home_challenges" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "home_challenges_policy" ON "public"."home_challenges" USING (("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."home_daily_operations_tasks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "home_daily_operations_tasks_policy" ON "public"."home_daily_operations_tasks" USING (("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."inventory_ai_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inventory_ai_settings_policy" ON "public"."inventory_ai_settings" USING (("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."inventory_checks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inventory_checks_policy" ON "public"."inventory_checks" USING (("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."inventory_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inventory_items_policy" ON "public"."inventory_items" USING (("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."inventory_orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inventory_orders_policy" ON "public"."inventory_orders" USING (("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."knowledge_article_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_article_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_bookmarks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_hub_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_hub_user_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_learning_paths" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_quiz_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_quizzes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_user_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."learning_modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."learning_pathways" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."login_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."monitoring_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."office_closures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."performance_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."policies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quality_incidents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quick_actions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rls_activity_feed" ON "public"."activity_feed" USING ((("facility_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "rls_ai_challenge_completions" ON "public"."ai_challenge_completions" USING ((("facility_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "rls_ai_content_recommendations" ON "public"."ai_content_recommendations" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_ai_learning_analytics" ON "public"."ai_learning_analytics" USING ((("facility_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "rls_ai_learning_insights" ON "public"."ai_learning_insights" USING ((("facility_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "rls_ai_task_performance" ON "public"."ai_task_performance" USING ((("facility_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "rls_audit_logs" ON "public"."audit_logs" USING ((("facility_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "rls_autoclave_equipment" ON "public"."autoclave_equipment" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_bi_test_kits" ON "public"."bi_test_kits" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_bi_test_results" ON "public"."bi_test_results" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_biological_indicators" ON "public"."biological_indicators" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_certifications" ON "public"."certifications" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "rls_cleaning_tasks" ON "public"."cleaning_tasks" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_courses" ON "public"."courses" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_environmental_cleaning_predefined_tasks" ON "public"."environmental_cleaning_predefined_tasks" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_environmental_cleaning_task_categories" ON "public"."environmental_cleaning_task_categories" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_environmental_cleaning_task_details" ON "public"."environmental_cleaning_task_details" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_environmental_cleans_enhanced" ON "public"."environmental_cleans_enhanced" USING (("facility_id" = ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "rls_equipment_maintenance" ON "public"."equipment_maintenance" USING (("facility_id" = "auth"."uid"()));



CREATE POLICY "rls_error_reports" ON "public"."error_reports" USING ((("facility_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "rls_facilities" ON "public"."facilities" USING (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."facility_id" = "facilities"."id")))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role")::"text" = 'admin'::"text")))) OR ("auth"."role"() = 'anon'::"text")));



CREATE POLICY "rls_status_types_delete" ON "public"."status_types" FOR DELETE USING ((("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("is_core" = false)));



CREATE POLICY "rls_status_types_insert" ON "public"."status_types" FOR INSERT WITH CHECK (("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "rls_status_types_select" ON "public"."status_types" FOR SELECT USING ((("is_published" = true) OR ("is_core" = true) OR ("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())))));



CREATE POLICY "rls_status_types_update" ON "public"."status_types" FOR UPDATE USING ((("facility_id" IN ( SELECT "users"."facility_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("is_core" = false)));



ALTER TABLE "public"."rooms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sds_chemical_recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sds_gap_analysis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sds_sheets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."status_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sterilization_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sterilization_cycles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_performance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tool_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_facilities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_gamification_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_learning_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_security_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_training_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."seed_daily_operations_tasks"() TO "anon";
GRANT ALL ON FUNCTION "public"."seed_daily_operations_tasks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."seed_daily_operations_tasks"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_created_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_created_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_created_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_facilities_created_by"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_facilities_created_by"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_facilities_created_by"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."activity_feed" TO "anon";
GRANT ALL ON TABLE "public"."activity_feed" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_feed" TO "service_role";



GRANT ALL ON TABLE "public"."ai_challenge_completions" TO "anon";
GRANT ALL ON TABLE "public"."ai_challenge_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_challenge_completions" TO "service_role";



GRANT ALL ON TABLE "public"."ai_content_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."ai_content_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_content_recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."ai_learning_analytics" TO "anon";
GRANT ALL ON TABLE "public"."ai_learning_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_learning_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."ai_learning_insights" TO "anon";
GRANT ALL ON TABLE "public"."ai_learning_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_learning_insights" TO "service_role";



GRANT ALL ON TABLE "public"."ai_task_performance" TO "anon";
GRANT ALL ON TABLE "public"."ai_task_performance" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_task_performance" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."autoclave_equipment" TO "anon";
GRANT ALL ON TABLE "public"."autoclave_equipment" TO "authenticated";
GRANT ALL ON TABLE "public"."autoclave_equipment" TO "service_role";



GRANT ALL ON TABLE "public"."autoclave_receipts" TO "anon";
GRANT ALL ON TABLE "public"."autoclave_receipts" TO "authenticated";
GRANT ALL ON TABLE "public"."autoclave_receipts" TO "service_role";



GRANT ALL ON TABLE "public"."autoclaves" TO "anon";
GRANT ALL ON TABLE "public"."autoclaves" TO "authenticated";
GRANT ALL ON TABLE "public"."autoclaves" TO "service_role";



GRANT ALL ON TABLE "public"."barcode_counts" TO "anon";
GRANT ALL ON TABLE "public"."barcode_counts" TO "authenticated";
GRANT ALL ON TABLE "public"."barcode_counts" TO "service_role";



GRANT ALL ON TABLE "public"."bi_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."bi_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."bi_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."bi_failure_incidents" TO "anon";
GRANT ALL ON TABLE "public"."bi_failure_incidents" TO "authenticated";
GRANT ALL ON TABLE "public"."bi_failure_incidents" TO "service_role";



GRANT ALL ON TABLE "public"."bi_test_kits" TO "anon";
GRANT ALL ON TABLE "public"."bi_test_kits" TO "authenticated";
GRANT ALL ON TABLE "public"."bi_test_kits" TO "service_role";



GRANT ALL ON TABLE "public"."bi_test_results" TO "anon";
GRANT ALL ON TABLE "public"."bi_test_results" TO "authenticated";
GRANT ALL ON TABLE "public"."bi_test_results" TO "service_role";



GRANT ALL ON TABLE "public"."biological_indicator_tests" TO "anon";
GRANT ALL ON TABLE "public"."biological_indicator_tests" TO "authenticated";
GRANT ALL ON TABLE "public"."biological_indicator_tests" TO "service_role";



GRANT ALL ON TABLE "public"."biological_indicators" TO "anon";
GRANT ALL ON TABLE "public"."biological_indicators" TO "authenticated";
GRANT ALL ON TABLE "public"."biological_indicators" TO "service_role";



GRANT ALL ON TABLE "public"."certifications" TO "anon";
GRANT ALL ON TABLE "public"."certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."certifications" TO "service_role";



GRANT ALL ON TABLE "public"."cleaning_tasks" TO "anon";
GRANT ALL ON TABLE "public"."cleaning_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."cleaning_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."email_alert_queue" TO "anon";
GRANT ALL ON TABLE "public"."email_alert_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."email_alert_queue" TO "service_role";



GRANT ALL ON TABLE "public"."environmental_cleaning_predefined_tasks" TO "anon";
GRANT ALL ON TABLE "public"."environmental_cleaning_predefined_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."environmental_cleaning_predefined_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."environmental_cleaning_task_categories" TO "anon";
GRANT ALL ON TABLE "public"."environmental_cleaning_task_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."environmental_cleaning_task_categories" TO "service_role";



GRANT ALL ON TABLE "public"."environmental_cleaning_task_details" TO "anon";
GRANT ALL ON TABLE "public"."environmental_cleaning_task_details" TO "authenticated";
GRANT ALL ON TABLE "public"."environmental_cleaning_task_details" TO "service_role";



GRANT ALL ON TABLE "public"."environmental_cleans_enhanced" TO "anon";
GRANT ALL ON TABLE "public"."environmental_cleans_enhanced" TO "authenticated";
GRANT ALL ON TABLE "public"."environmental_cleans_enhanced" TO "service_role";



GRANT ALL ON TABLE "public"."equipment_maintenance" TO "anon";
GRANT ALL ON TABLE "public"."equipment_maintenance" TO "authenticated";
GRANT ALL ON TABLE "public"."equipment_maintenance" TO "service_role";



GRANT ALL ON TABLE "public"."error_logs" TO "anon";
GRANT ALL ON TABLE "public"."error_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."error_logs" TO "service_role";



GRANT ALL ON TABLE "public"."error_reports" TO "anon";
GRANT ALL ON TABLE "public"."error_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."error_reports" TO "service_role";



GRANT ALL ON TABLE "public"."facilities" TO "anon";
GRANT ALL ON TABLE "public"."facilities" TO "authenticated";
GRANT ALL ON TABLE "public"."facilities" TO "service_role";



GRANT ALL ON TABLE "public"."facility_compliance_settings" TO "anon";
GRANT ALL ON TABLE "public"."facility_compliance_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."facility_compliance_settings" TO "service_role";



GRANT ALL ON TABLE "public"."facility_notification_config" TO "anon";
GRANT ALL ON TABLE "public"."facility_notification_config" TO "authenticated";
GRANT ALL ON TABLE "public"."facility_notification_config" TO "service_role";



GRANT ALL ON TABLE "public"."facility_office_hours" TO "anon";
GRANT ALL ON TABLE "public"."facility_office_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."facility_office_hours" TO "service_role";



GRANT ALL ON TABLE "public"."home_challenge_completions" TO "anon";
GRANT ALL ON TABLE "public"."home_challenge_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."home_challenge_completions" TO "service_role";



GRANT ALL ON TABLE "public"."home_challenges" TO "anon";
GRANT ALL ON TABLE "public"."home_challenges" TO "authenticated";
GRANT ALL ON TABLE "public"."home_challenges" TO "service_role";



GRANT ALL ON TABLE "public"."home_daily_operations_tasks" TO "anon";
GRANT ALL ON TABLE "public"."home_daily_operations_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."home_daily_operations_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_ai_barcode_analysis" TO "anon";
GRANT ALL ON TABLE "public"."inventory_ai_barcode_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_ai_barcode_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_ai_settings" TO "anon";
GRANT ALL ON TABLE "public"."inventory_ai_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_ai_settings" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_checks" TO "anon";
GRANT ALL ON TABLE "public"."inventory_checks" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_checks" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_items" TO "anon";
GRANT ALL ON TABLE "public"."inventory_items" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_items" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_orders" TO "anon";
GRANT ALL ON TABLE "public"."inventory_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_orders" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_article_ratings" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_article_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_article_ratings" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_article_views" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_article_views" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_article_views" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_articles" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_articles" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_bookmarks" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_categories" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_categories" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_hub_content" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_hub_content" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_hub_content" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_hub_user_progress" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_hub_user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_hub_user_progress" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_learning_paths" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_learning_paths" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_learning_paths" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_quiz_attempts" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_quiz_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_quiz_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_quizzes" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_quizzes" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_quizzes" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_user_progress" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_user_progress" TO "service_role";



GRANT ALL ON TABLE "public"."learning_modules" TO "anon";
GRANT ALL ON TABLE "public"."learning_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."learning_modules" TO "service_role";



GRANT ALL ON TABLE "public"."learning_pathways" TO "anon";
GRANT ALL ON TABLE "public"."learning_pathways" TO "authenticated";
GRANT ALL ON TABLE "public"."learning_pathways" TO "service_role";



GRANT ALL ON TABLE "public"."login_attempts" TO "anon";
GRANT ALL ON TABLE "public"."login_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."login_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."monitoring_events" TO "anon";
GRANT ALL ON TABLE "public"."monitoring_events" TO "authenticated";
GRANT ALL ON TABLE "public"."monitoring_events" TO "service_role";



GRANT ALL ON TABLE "public"."monitoring_performance_metrics" TO "anon";
GRANT ALL ON TABLE "public"."monitoring_performance_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."monitoring_performance_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."office_closures" TO "anon";
GRANT ALL ON TABLE "public"."office_closures" TO "authenticated";
GRANT ALL ON TABLE "public"."office_closures" TO "service_role";



GRANT ALL ON TABLE "public"."performance_metrics" TO "anon";
GRANT ALL ON TABLE "public"."performance_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."performance_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."policies" TO "anon";
GRANT ALL ON TABLE "public"."policies" TO "authenticated";
GRANT ALL ON TABLE "public"."policies" TO "service_role";



GRANT ALL ON TABLE "public"."procedures" TO "anon";
GRANT ALL ON TABLE "public"."procedures" TO "authenticated";
GRANT ALL ON TABLE "public"."procedures" TO "service_role";



GRANT ALL ON TABLE "public"."product_feedback" TO "anon";
GRANT ALL ON TABLE "public"."product_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."product_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."quality_incidents" TO "anon";
GRANT ALL ON TABLE "public"."quality_incidents" TO "authenticated";
GRANT ALL ON TABLE "public"."quality_incidents" TO "service_role";



GRANT ALL ON TABLE "public"."quick_actions" TO "anon";
GRANT ALL ON TABLE "public"."quick_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."quick_actions" TO "service_role";



GRANT ALL ON TABLE "public"."realtime_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."realtime_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."realtime_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."rooms" TO "anon";
GRANT ALL ON TABLE "public"."rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."rooms" TO "service_role";



GRANT ALL ON TABLE "public"."sds_chemical_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."sds_chemical_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."sds_chemical_recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."sds_gap_analysis" TO "anon";
GRANT ALL ON TABLE "public"."sds_gap_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."sds_gap_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."sds_sheets" TO "anon";
GRANT ALL ON TABLE "public"."sds_sheets" TO "authenticated";
GRANT ALL ON TABLE "public"."sds_sheets" TO "service_role";



GRANT ALL ON TABLE "public"."status_types" TO "anon";
GRANT ALL ON TABLE "public"."status_types" TO "authenticated";
GRANT ALL ON TABLE "public"."status_types" TO "service_role";



GRANT ALL ON TABLE "public"."sterilization_batches" TO "anon";
GRANT ALL ON TABLE "public"."sterilization_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."sterilization_batches" TO "service_role";



GRANT ALL ON TABLE "public"."sterilization_cycle_tools" TO "anon";
GRANT ALL ON TABLE "public"."sterilization_cycle_tools" TO "authenticated";
GRANT ALL ON TABLE "public"."sterilization_cycle_tools" TO "service_role";



GRANT ALL ON TABLE "public"."sterilization_cycles" TO "anon";
GRANT ALL ON TABLE "public"."sterilization_cycles" TO "authenticated";
GRANT ALL ON TABLE "public"."sterilization_cycles" TO "service_role";



GRANT ALL ON TABLE "public"."sterilization_events" TO "anon";
GRANT ALL ON TABLE "public"."sterilization_events" TO "authenticated";
GRANT ALL ON TABLE "public"."sterilization_events" TO "service_role";



GRANT ALL ON TABLE "public"."sterilization_sessions" TO "anon";
GRANT ALL ON TABLE "public"."sterilization_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sterilization_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_performance" TO "anon";
GRANT ALL ON TABLE "public"."supplier_performance" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_performance" TO "service_role";



GRANT ALL ON TABLE "public"."tool_batches" TO "anon";
GRANT ALL ON TABLE "public"."tool_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."tool_batches" TO "service_role";



GRANT ALL ON TABLE "public"."tools" TO "anon";
GRANT ALL ON TABLE "public"."tools" TO "authenticated";
GRANT ALL ON TABLE "public"."tools" TO "service_role";



GRANT ALL ON TABLE "public"."user_certifications" TO "anon";
GRANT ALL ON TABLE "public"."user_certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."user_certifications" TO "service_role";



GRANT ALL ON TABLE "public"."user_facilities" TO "anon";
GRANT ALL ON TABLE "public"."user_facilities" TO "authenticated";
GRANT ALL ON TABLE "public"."user_facilities" TO "service_role";



GRANT ALL ON TABLE "public"."user_gamification_stats" TO "anon";
GRANT ALL ON TABLE "public"."user_gamification_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."user_gamification_stats" TO "service_role";



GRANT ALL ON TABLE "public"."user_learning_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_learning_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_learning_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_security_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_security_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_security_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."user_training_records" TO "anon";
GRANT ALL ON TABLE "public"."user_training_records" TO "authenticated";
GRANT ALL ON TABLE "public"."user_training_records" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_notifications" TO "anon";
GRANT ALL ON TABLE "public"."webhook_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_notifications" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
