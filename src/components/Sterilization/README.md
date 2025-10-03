# Sterilization Module – Developer Notes

## Overview

This module manages tool sterilization workflows including:

- Timed phases (Bath 1, Bath 2, Drying, Autoclave)
- Barcode scanning and tool tracking
- BI test validation and enforcement
- Operator verification and audit logging

---

## Core Components

- `SterilizationDashboard.tsx`: Main UI container
- `SterilizationScannerModal.tsx`: Workflow selector & barcode scanner
- `PhaseTimer.tsx`: Per-phase countdown timer logic
- `BiologicalIndicatorTest.tsx`: Daily BI logging + quarantine logic
- `SterilizationAnalytics.tsx`: Real-time metrics

---

## State Management

Zustand store simplified to 5 focused slices:

- `biologicalIndicatorSlice.ts`: Comprehensive BI test tracking and validation
- `toolManagementSlice.ts`: Tool lifecycle, workflow state, and batch tracking
- `complianceSettingsSlice.ts`: Settings and enforcement rules
- `sterilizationCycleSlice.ts`: Cycle management and phase tracking
- `uiStateSlice.ts`: Modal visibility, workflow state, and scanner data

---

## Config

- Centralized in `workflowConfig.ts`
- Controls phase durations, labels, and valid IDs

---

## Audit Trail

- Events include digital signature using `generateAuditSignature()`
- Operator name must be verified before critical actions

---

## Persistence & Recovery

- Timers auto-save to localStorage
- Stale timers alert the user on resume

---

## TO-DO

- Migrate localStorage fallback to Supabase
- Add CI/BI test frequency toggles per clinic
- Enforce HIPAA-compliant audit storage
