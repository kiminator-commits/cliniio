-- Seed data for Cliniio Dashboard Time Savings
-- This will populate the Time Saved metrics with realistic operational data

-- 1. Sterilization Cycles Data (showing efficiency gains from organized workflows)
INSERT INTO sterilization_cycles (
  id,
  facility_id,
  cycle_type,
  status,
  duration_minutes,
  baseline_duration_minutes,
  temperature_celsius,
  pressure_psi,
  completed_at,
  created_at,
  updated_at
) VALUES 
-- Today's cycles (showing time savings)
('cycle-001', '550e8400-e29b-41d4-a716-446655440000', 'steam', 'completed', 45, 60, 134, 30, '2024-01-15T08:30:00Z', '2024-01-15T08:00:00Z', '2024-01-15T08:45:00Z'),
('cycle-002', '550e8400-e29b-41d4-a716-446655440000', 'steam', 'completed', 42, 60, 134, 30, '2024-01-15T10:15:00Z', '2024-01-15T10:00:00Z', '2024-01-15T10:42:00Z'),
('cycle-003', '550e8400-e29b-41d4-a716-446655440000', 'steam', 'completed', 48, 60, 134, 30, '2024-01-15T14:20:00Z', '2024-01-15T14:00:00Z', '2024-01-15T14:48:00Z'),
('cycle-004', '550e8400-e29b-41d4-a716-446655440000', 'steam', 'completed', 44, 60, 134, 30, '2024-01-15T16:45:00Z', '2024-01-15T16:30:00Z', '2024-01-15T17:14:00Z'),

-- This month's cycles (showing monthly time savings)
('cycle-005', '550e8400-e29b-41d4-a716-446655440000', 'steam', 'completed', 46, 60, 134, 30, '2024-01-10T09:00:00Z', '2024-01-10T08:45:00Z', '2024-01-10T09:31:00Z'),
('cycle-006', '550e8400-e29b-41d4-a716-446655440000', 'steam', 'completed', 43, 60, 134, 30, '2024-01-12T11:30:00Z', '2024-01-12T11:15:00Z', '2024-01-12T11:58:00Z'),
('cycle-007', '550e8400-e29b-41d4-a716-446655440000', 'steam', 'completed', 47, 60, 134, 30, '2024-01-14T13:45:00Z', '2024-01-14T13:30:00Z', '2024-01-14T14:17:00Z');

-- 2. Daily Operations Tasks Data (showing task completion efficiency)
INSERT INTO home_daily_operations_tasks (
  id,
  facility_id,
  title,
  description,
  category,
  priority,
  points,
  estimated_duration,
  actual_duration,
  completed,
  status,
  completed_at,
  created_at,
  updated_at
) VALUES 
-- Today's completed tasks (showing time savings)
('task-001', '550e8400-e29b-41d4-a716-446655440000', 'Sterilization Room Setup', 'Prepare sterilization room for morning cycles', 'sterilization', 'high', 25, 30, 22, true, 'completed', '2024-01-15T07:45:00Z', '2024-01-15T07:30:00Z', '2024-01-15T07:52:00Z'),
('task-002', '550e8400-e29b-41d4-a716-446655440000', 'Equipment Calibration', 'Calibrate sterilization equipment', 'equipment', 'medium', 20, 45, 38, true, 'completed', '2024-01-15T09:20:00Z', '2024-01-15T09:00:00Z', '2024-01-15T09:38:00Z'),
('task-003', '550e8400-e29b-41d4-a716-446655440000', 'Inventory Check', 'Daily inventory verification', 'inventory', 'medium', 15, 25, 18, true, 'completed', '2024-01-15T11:15:00Z', '2024-01-15T11:00:00Z', '2024-01-15T11:33:00Z'),
('task-004', '550e8400-e29b-41d4-a716-446655440000', 'Room Cleaning', 'Post-procedure room cleaning', 'cleaning', 'high', 30, 40, 32, true, 'completed', '2024-01-15T15:30:00Z', '2024-01-15T15:15:00Z', '2024-01-15T16:02:00Z'),

-- This month's completed tasks
('task-005', '550e8400-e29b-41d4-a716-446655440000', 'Weekly Equipment Maintenance', 'Comprehensive equipment check', 'equipment', 'high', 40, 60, 52, true, 'completed', '2024-01-08T10:00:00Z', '2024-01-08T09:45:00Z', '2024-01-08T10:52:00Z'),
('task-006', '550e8400-e29b-41d4-a716-446655440000', 'Compliance Documentation', 'Update compliance records', 'compliance', 'medium', 25, 35, 28, true, 'completed', '2024-01-11T14:00:00Z', '2024-01-11T13:45:00Z', '2024-01-11T14:28:00Z'),
('task-007', '550e8400-e29b-41d4-a716-446655440000', 'Staff Training Session', 'Monthly safety training', 'training', 'high', 35, 50, 42, true, 'completed', '2024-01-13T16:00:00Z', '2024-01-13T15:45:00Z', '2024-01-13T16:42:00Z');

-- 3. AI Task Performance Data (for AI Time Saved metrics)
INSERT INTO ai_task_performance (
  id,
  user_id,
  facility_id,
  task_id,
  task_type,
  completion_time_ms,
  accuracy_score,
  user_satisfaction,
  completed_at,
  baseline_time,
  actual_duration,
  time_saved,
  efficiency_score,
  data
) VALUES 
-- Today's AI-assisted task completions
('ai-perf-001', 'user-001', '550e8400-e29b-41d4-a716-446655440000', 'task-001', 'sterilization_setup', 1320000, 95, 5, '2024-01-15T07:52:00Z', 30, 22, 8, 95, '{"category": "sterilization", "ai_assisted": true, "time_saved_minutes": 8}'),
('ai-perf-002', 'user-001', '550e8400-e29b-41d4-a716-446655440000', 'task-002', 'equipment_calibration', 2280000, 92, 4, '2024-01-15T09:38:00Z', 45, 38, 7, 92, '{"category": "equipment", "ai_assisted": true, "time_saved_minutes": 7}'),
('ai-perf-003', 'user-002', '550e8400-e29b-41d4-a716-446655440000', 'task-003', 'inventory_check', 1080000, 98, 5, '2024-01-15T11:33:00Z', 25, 18, 7, 98, '{"category": "inventory", "ai_assisted": true, "time_saved_minutes": 7}'),

-- This month's AI-assisted completions
('ai-perf-004', 'user-001', '550e8400-e29b-41d4-a716-446655440000', 'task-005', 'equipment_maintenance', 3120000, 90, 4, '2024-01-08T10:52:00Z', 60, 52, 8, 90, '{"category": "equipment", "ai_assisted": true, "time_saved_minutes": 8}'),
('ai-perf-005', 'user-003', '550e8400-e29b-41d4-a716-446655440000', 'task-006', 'compliance_docs', 1680000, 94, 5, '2024-01-11T14:28:00Z', 35, 28, 7, 94, '{"category": "compliance", "ai_assisted": true, "time_saved_minutes": 7}');

-- 4. Performance Metrics Summary (for caching)
INSERT INTO performance_metrics (
  id,
  date,
  metric_type,
  daily_time_saved,
  monthly_time_saved,
  facility_id,
  created_at,
  updated_at
) VALUES 
-- Time saved metrics
('perf-001', '2024-01-15', 'time_saved', 45, 1350, '550e8400-e29b-41d4-a716-446655440000', '2024-01-15T18:00:00Z', '2024-01-15T18:00:00Z'),
('perf-002', '2024-01-15', 'ai_efficiency', 22, 660, '550e8400-e29b-41d4-a716-446655440000', '2024-01-15T18:00:00Z', '2024-01-15T18:00:00Z');

-- 5. User Gamification Stats (for gamification metrics)
INSERT INTO user_gamification_stats (
  id,
  user_id,
  facility_id,
  total_points,
  level,
  rank,
  current_streak,
  best_streak,
  total_tasks,
  completed_tasks,
  created_at,
  updated_at
) VALUES 
('gam-001', 'user-001', '550e8400-e29b-41d4-a716-446655440000', 150, 3, 2, 5, 12, 25, 20, '2024-01-01T00:00:00Z', '2024-01-15T18:00:00Z'),
('gam-002', 'user-002', '550e8400-e29b-41d4-a716-446655440000', 120, 2, 3, 3, 8, 20, 15, '2024-01-01T00:00:00Z', '2024-01-15T18:00:00Z'),
('gam-003', 'user-003', '550e8400-e29b-41d4-a716-446655440000', 95, 2, 4, 2, 6, 18, 12, '2024-01-01T00:00:00Z', '2024-01-15T18:00:00Z');

-- Summary of what this seed data provides:
-- 
-- TIME SAVED (Operational Efficiency):
-- - Daily: 45 minutes saved (from sterilization cycles + task completions)
-- - Monthly: 1,350 minutes (22.5 hours) saved
-- 
-- AI TIME SAVED (Cliniio Value):
-- - Daily: 22 minutes saved through AI assistance
-- - Monthly: 660 minutes (11 hours) saved through AI
-- 
-- This demonstrates the clear distinction:
-- - Time Saved = Value of organized workflows
-- - AI Time Saved = Value of Cliniio AI platform
