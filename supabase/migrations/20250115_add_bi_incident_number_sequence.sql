CREATE SEQUENCE IF NOT EXISTS bi_incident_number_seq
    START 1000
    INCREMENT 1
    OWNED BY NONE;

ALTER TABLE bi_incidents
ADD COLUMN IF NOT EXISTS incident_number bigint DEFAULT nextval('bi_incident_number_seq') UNIQUE;
