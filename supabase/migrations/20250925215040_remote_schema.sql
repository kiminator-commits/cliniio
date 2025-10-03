drop extension if exists "pg_net";

alter table "public"."bi_failure_incidents" drop constraint "bi_failure_incidents_severity_check";

alter table "public"."bi_failure_incidents" drop constraint "bi_failure_incidents_status_check";

alter table "public"."product_feedback" drop constraint "product_feedback_priority_check";

alter table "public"."product_feedback" drop constraint "product_feedback_status_check";

alter table "public"."product_feedback" drop constraint "product_feedback_type_check";

alter table "public"."status_types" drop constraint "status_types_alert_level_check";


  create table "public"."bi_resolution_workflows" (
    "id" uuid not null default gen_random_uuid(),
    "incident_id" uuid not null,
    "resolution_steps" jsonb,
    "resolved_by" uuid,
    "resolved_at" timestamp with time zone default now()
      );



  create table "public"."bi_test_analytics" (
    "id" uuid not null default gen_random_uuid(),
    "test_id" uuid not null,
    "metric_name" text not null,
    "metric_value" numeric,
    "recorded_at" timestamp with time zone default now()
      );



  create table "public"."cleaning_schedules" (
    "id" uuid not null default gen_random_uuid(),
    "room_id" uuid not null,
    "schedule_date" date not null,
    "status" text default 'pending'::text,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."environmental_clean_logs" (
    "id" uuid not null default gen_random_uuid(),
    "room_id" uuid not null,
    "task_id" uuid,
    "performed_by" uuid,
    "performed_at" timestamp with time zone default now(),
    "notes" text
      );


alter table "public"."rooms" alter column "id" set not null;

CREATE UNIQUE INDEX bi_resolution_workflows_pkey ON public.bi_resolution_workflows USING btree (id);

CREATE UNIQUE INDEX bi_test_analytics_pkey ON public.bi_test_analytics USING btree (id);

CREATE UNIQUE INDEX cleaning_schedules_pkey ON public.cleaning_schedules USING btree (id);

CREATE UNIQUE INDEX environmental_clean_logs_pkey ON public.environmental_clean_logs USING btree (id);

CREATE INDEX idx_ai_learning_analytics_facility_id ON public.ai_learning_analytics USING btree (facility_id);

CREATE INDEX idx_ai_learning_analytics_user_id ON public.ai_learning_analytics USING btree (user_id);

CREATE INDEX idx_ai_learning_analytics_user_session ON public.ai_learning_analytics USING btree (user_id, session_start);

CREATE UNIQUE INDEX rooms_pkey ON public.rooms USING btree (id);

alter table "public"."bi_resolution_workflows" add constraint "bi_resolution_workflows_pkey" PRIMARY KEY using index "bi_resolution_workflows_pkey";

alter table "public"."bi_test_analytics" add constraint "bi_test_analytics_pkey" PRIMARY KEY using index "bi_test_analytics_pkey";

alter table "public"."cleaning_schedules" add constraint "cleaning_schedules_pkey" PRIMARY KEY using index "cleaning_schedules_pkey";

alter table "public"."environmental_clean_logs" add constraint "environmental_clean_logs_pkey" PRIMARY KEY using index "environmental_clean_logs_pkey";

alter table "public"."rooms" add constraint "rooms_pkey" PRIMARY KEY using index "rooms_pkey";

alter table "public"."bi_resolution_workflows" add constraint "bi_resolution_workflows_incident_id_fkey" FOREIGN KEY (incident_id) REFERENCES bi_failure_incidents(id) ON DELETE CASCADE not valid;

alter table "public"."bi_resolution_workflows" validate constraint "bi_resolution_workflows_incident_id_fkey";

alter table "public"."bi_resolution_workflows" add constraint "bi_resolution_workflows_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES users(id) not valid;

alter table "public"."bi_resolution_workflows" validate constraint "bi_resolution_workflows_resolved_by_fkey";

alter table "public"."bi_test_analytics" add constraint "bi_test_analytics_test_id_fkey" FOREIGN KEY (test_id) REFERENCES bi_test_results(id) ON DELETE CASCADE not valid;

alter table "public"."bi_test_analytics" validate constraint "bi_test_analytics_test_id_fkey";

alter table "public"."cleaning_schedules" add constraint "cleaning_schedules_room_id_fkey" FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE not valid;

alter table "public"."cleaning_schedules" validate constraint "cleaning_schedules_room_id_fkey";

alter table "public"."environmental_clean_logs" add constraint "environmental_clean_logs_performed_by_fkey" FOREIGN KEY (performed_by) REFERENCES users(id) not valid;

alter table "public"."environmental_clean_logs" validate constraint "environmental_clean_logs_performed_by_fkey";

alter table "public"."environmental_clean_logs" add constraint "environmental_clean_logs_room_id_fkey" FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE not valid;

alter table "public"."environmental_clean_logs" validate constraint "environmental_clean_logs_room_id_fkey";

alter table "public"."environmental_clean_logs" add constraint "environmental_clean_logs_task_id_fkey" FOREIGN KEY (task_id) REFERENCES cleaning_tasks(id) not valid;

alter table "public"."environmental_clean_logs" validate constraint "environmental_clean_logs_task_id_fkey";

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

grant delete on table "public"."bi_resolution_workflows" to "anon";

grant insert on table "public"."bi_resolution_workflows" to "anon";

grant references on table "public"."bi_resolution_workflows" to "anon";

grant select on table "public"."bi_resolution_workflows" to "anon";

grant trigger on table "public"."bi_resolution_workflows" to "anon";

grant truncate on table "public"."bi_resolution_workflows" to "anon";

grant update on table "public"."bi_resolution_workflows" to "anon";

grant delete on table "public"."bi_resolution_workflows" to "authenticated";

grant insert on table "public"."bi_resolution_workflows" to "authenticated";

grant references on table "public"."bi_resolution_workflows" to "authenticated";

grant select on table "public"."bi_resolution_workflows" to "authenticated";

grant trigger on table "public"."bi_resolution_workflows" to "authenticated";

grant truncate on table "public"."bi_resolution_workflows" to "authenticated";

grant update on table "public"."bi_resolution_workflows" to "authenticated";

grant delete on table "public"."bi_resolution_workflows" to "service_role";

grant insert on table "public"."bi_resolution_workflows" to "service_role";

grant references on table "public"."bi_resolution_workflows" to "service_role";

grant select on table "public"."bi_resolution_workflows" to "service_role";

grant trigger on table "public"."bi_resolution_workflows" to "service_role";

grant truncate on table "public"."bi_resolution_workflows" to "service_role";

grant update on table "public"."bi_resolution_workflows" to "service_role";

grant delete on table "public"."bi_test_analytics" to "anon";

grant insert on table "public"."bi_test_analytics" to "anon";

grant references on table "public"."bi_test_analytics" to "anon";

grant select on table "public"."bi_test_analytics" to "anon";

grant trigger on table "public"."bi_test_analytics" to "anon";

grant truncate on table "public"."bi_test_analytics" to "anon";

grant update on table "public"."bi_test_analytics" to "anon";

grant delete on table "public"."bi_test_analytics" to "authenticated";

grant insert on table "public"."bi_test_analytics" to "authenticated";

grant references on table "public"."bi_test_analytics" to "authenticated";

grant select on table "public"."bi_test_analytics" to "authenticated";

grant trigger on table "public"."bi_test_analytics" to "authenticated";

grant truncate on table "public"."bi_test_analytics" to "authenticated";

grant update on table "public"."bi_test_analytics" to "authenticated";

grant delete on table "public"."bi_test_analytics" to "service_role";

grant insert on table "public"."bi_test_analytics" to "service_role";

grant references on table "public"."bi_test_analytics" to "service_role";

grant select on table "public"."bi_test_analytics" to "service_role";

grant trigger on table "public"."bi_test_analytics" to "service_role";

grant truncate on table "public"."bi_test_analytics" to "service_role";

grant update on table "public"."bi_test_analytics" to "service_role";

grant delete on table "public"."cleaning_schedules" to "anon";

grant insert on table "public"."cleaning_schedules" to "anon";

grant references on table "public"."cleaning_schedules" to "anon";

grant select on table "public"."cleaning_schedules" to "anon";

grant trigger on table "public"."cleaning_schedules" to "anon";

grant truncate on table "public"."cleaning_schedules" to "anon";

grant update on table "public"."cleaning_schedules" to "anon";

grant delete on table "public"."cleaning_schedules" to "authenticated";

grant insert on table "public"."cleaning_schedules" to "authenticated";

grant references on table "public"."cleaning_schedules" to "authenticated";

grant select on table "public"."cleaning_schedules" to "authenticated";

grant trigger on table "public"."cleaning_schedules" to "authenticated";

grant truncate on table "public"."cleaning_schedules" to "authenticated";

grant update on table "public"."cleaning_schedules" to "authenticated";

grant delete on table "public"."cleaning_schedules" to "service_role";

grant insert on table "public"."cleaning_schedules" to "service_role";

grant references on table "public"."cleaning_schedules" to "service_role";

grant select on table "public"."cleaning_schedules" to "service_role";

grant trigger on table "public"."cleaning_schedules" to "service_role";

grant truncate on table "public"."cleaning_schedules" to "service_role";

grant update on table "public"."cleaning_schedules" to "service_role";

grant delete on table "public"."environmental_clean_logs" to "anon";

grant insert on table "public"."environmental_clean_logs" to "anon";

grant references on table "public"."environmental_clean_logs" to "anon";

grant select on table "public"."environmental_clean_logs" to "anon";

grant trigger on table "public"."environmental_clean_logs" to "anon";

grant truncate on table "public"."environmental_clean_logs" to "anon";

grant update on table "public"."environmental_clean_logs" to "anon";

grant delete on table "public"."environmental_clean_logs" to "authenticated";

grant insert on table "public"."environmental_clean_logs" to "authenticated";

grant references on table "public"."environmental_clean_logs" to "authenticated";

grant select on table "public"."environmental_clean_logs" to "authenticated";

grant trigger on table "public"."environmental_clean_logs" to "authenticated";

grant truncate on table "public"."environmental_clean_logs" to "authenticated";

grant update on table "public"."environmental_clean_logs" to "authenticated";

grant delete on table "public"."environmental_clean_logs" to "service_role";

grant insert on table "public"."environmental_clean_logs" to "service_role";

grant references on table "public"."environmental_clean_logs" to "service_role";

grant select on table "public"."environmental_clean_logs" to "service_role";

grant trigger on table "public"."environmental_clean_logs" to "service_role";

grant truncate on table "public"."environmental_clean_logs" to "service_role";

grant update on table "public"."environmental_clean_logs" to "service_role";


