create type "public"."tool_status" as enum ('dirty', 'clean', 'problem', 'new_barcode', 'active');

alter table "public"."bi_failure_incidents" drop constraint "bi_failure_incidents_severity_check";

alter table "public"."bi_failure_incidents" drop constraint "bi_failure_incidents_status_check";

alter table "public"."product_feedback" drop constraint "product_feedback_priority_check";

alter table "public"."product_feedback" drop constraint "product_feedback_status_check";

alter table "public"."product_feedback" drop constraint "product_feedback_type_check";

alter table "public"."status_types" drop constraint "status_types_alert_level_check";

alter table "public"."tools" add column "current_phase" character varying;

alter table "public"."tools" add column "priority" integer;

alter table "public"."tools" add column "updated_by" uuid;

alter table "public"."tools" alter column "status" set data type tool_status using "status"::tool_status;

alter table "public"."tools" add constraint "tools_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."tools" validate constraint "tools_updated_by_fkey";

alter table "public"."bi_failure_incidents" add constraint "bi_failure_incidents_severity_check" CHECK (((severity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."bi_failure_incidents" validate constraint "bi_failure_incidents_severity_check";

alter table "public"."bi_failure_incidents" add constraint "bi_failure_incidents_status_check" CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'investigating'::character varying, 'resolved'::character varying, 'closed'::character varying])::text[]))) not valid;

alter table "public"."bi_failure_incidents" validate constraint "bi_failure_incidents_status_check";

alter table "public"."product_feedback" add constraint "product_feedback_priority_check" CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."product_feedback" validate constraint "product_feedback_priority_check";

alter table "public"."product_feedback" add constraint "product_feedback_status_check" CHECK (((status)::text = ANY ((ARRAY['new'::character varying, 'reviewing'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'closed'::character varying])::text[]))) not valid;

alter table "public"."product_feedback" validate constraint "product_feedback_status_check";

alter table "public"."product_feedback" add constraint "product_feedback_type_check" CHECK (((type)::text = ANY ((ARRAY['bug'::character varying, 'feature'::character varying, 'improvement'::character varying, 'other'::character varying])::text[]))) not valid;

alter table "public"."product_feedback" validate constraint "product_feedback_type_check";

alter table "public"."status_types" add constraint "status_types_alert_level_check" CHECK (((alert_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."status_types" validate constraint "status_types_alert_level_check";


