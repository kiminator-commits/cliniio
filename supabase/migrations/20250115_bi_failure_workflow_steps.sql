-- Migration: Add BI Failure Workflow Steps tracking
-- This enables multi-user collaboration on BI failure resolution workflows

CREATE TABLE IF NOT EXISTS "public"."bi_failure_workflow_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "incident_id" "uuid" NOT NULL,
    "step_id" character varying(50) NOT NULL, -- 'quarantine', 're-sterilization', 'new-bi-test', 'documentation'
    "step_order" integer NOT NULL, -- 1, 2, 3, 4
    "status" character varying(20) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    "completed_by_user_id" "uuid",
    "completed_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bi_failure_workflow_steps_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "bi_failure_workflow_steps_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying])::"text"[]))),
    CONSTRAINT "bi_failure_workflow_steps_step_id_check" CHECK ((("step_id")::"text" = ANY ((ARRAY['quarantine'::character varying, 're-sterilization'::character varying, 'new-bi-test'::character varying, 'documentation'::character varying])::"text"[])))
);

-- Foreign key constraints
ALTER TABLE ONLY "public"."bi_failure_workflow_steps"
    ADD CONSTRAINT "bi_failure_workflow_steps_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "public"."bi_failure_incidents"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."bi_failure_workflow_steps"
    ADD CONSTRAINT "bi_failure_workflow_steps_completed_by_user_id_fkey" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."users"("id");

-- Indexes for performance
CREATE INDEX "idx_bi_failure_workflow_steps_incident_id" ON "public"."bi_failure_workflow_steps" ("incident_id");
CREATE INDEX "idx_bi_failure_workflow_steps_status" ON "public"."bi_failure_workflow_steps" ("status");
CREATE INDEX "idx_bi_failure_workflow_steps_step_order" ON "public"."bi_failure_workflow_steps" ("step_order");

-- Enable RLS
ALTER TABLE "public"."bi_failure_workflow_steps" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view workflow steps for their facility" ON "public"."bi_failure_workflow_steps"
    FOR SELECT USING (
        incident_id IN (
            SELECT id FROM "public"."bi_failure_incidents" 
            WHERE facility_id = (
                SELECT facility_id FROM "public"."users" 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update workflow steps for their facility" ON "public"."bi_failure_workflow_steps"
    FOR UPDATE USING (
        incident_id IN (
            SELECT id FROM "public"."bi_failure_incidents" 
            WHERE facility_id = (
                SELECT facility_id FROM "public"."users" 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert workflow steps for their facility" ON "public"."bi_failure_workflow_steps"
    FOR INSERT WITH CHECK (
        incident_id IN (
            SELECT id FROM "public"."bi_failure_incidents" 
            WHERE facility_id = (
                SELECT facility_id FROM "public"."users" 
                WHERE id = auth.uid()
            )
        )
    );

-- Grant permissions
GRANT ALL ON TABLE "public"."bi_failure_workflow_steps" TO "anon";
GRANT ALL ON TABLE "public"."bi_failure_workflow_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."bi_failure_workflow_steps" TO "service_role";

-- Function to initialize workflow steps for a new incident
CREATE OR REPLACE FUNCTION "public"."initialize_bi_failure_workflow_steps"("incident_id" "uuid")
RETURNS "void"
LANGUAGE "plpgsql"
AS $$
BEGIN
    -- Insert default workflow steps
    INSERT INTO "public"."bi_failure_workflow_steps" (
        "incident_id", "step_id", "step_order", "status"
    ) VALUES 
        (incident_id, 'quarantine', 1, 'pending'),
        (incident_id, 're-sterilization', 2, 'pending'),
        (incident_id, 'new-bi-test', 3, 'pending'),
        (incident_id, 'documentation', 4, 'pending');
END;
$$;

-- Function to get workflow progress for an incident
CREATE OR REPLACE FUNCTION "public"."get_bi_failure_workflow_progress"("incident_id" "uuid")
RETURNS TABLE (
    "step_id" character varying,
    "step_order" integer,
    "status" character varying,
    "completed_by_user_id" "uuid",
    "completed_at" timestamp with time zone,
    "notes" "text"
)
LANGUAGE "plpgsql"
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wfs.step_id,
        wfs.step_order,
        wfs.status,
        wfs.completed_by_user_id,
        wfs.completed_at,
        wfs.notes
    FROM "public"."bi_failure_workflow_steps" wfs
    WHERE wfs.incident_id = get_bi_failure_workflow_progress.incident_id
    ORDER BY wfs.step_order;
END;
$$;

-- Trigger to automatically initialize workflow steps when a new incident is created
CREATE OR REPLACE FUNCTION "public"."trigger_initialize_workflow_steps"()
RETURNS "trigger"
LANGUAGE "plpgsql"
AS $$
BEGIN
    -- Only initialize for new incidents with 'open' status
    IF NEW.status = 'open' AND OLD IS NULL THEN
        PERFORM "public"."initialize_bi_failure_workflow_steps"(NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "initialize_workflow_steps_trigger"
    AFTER INSERT ON "public"."bi_failure_incidents"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."trigger_initialize_workflow_steps"();
