# Supabase Schema Documentation - October 19, 2025

> **Last Updated**: October 19, 2025  
> **Note**: Update this file after any major schema changes

## Database Overview
**Total Tables**: ~150+ tables  
**RLS Policies**: ~400+ policies (comprehensive security)  
**Multi-tenant**: Facility-based isolation throughout

## Core Business Domains

### 🏥 Facility Management
- **facilities** - Healthcare facility information
- **locations** - Physical locations within facilities
- **user_facilities** - User-facility relationships
- **facility_roles** - Role definitions per facility
- **user_facility_roles** - User role assignments

### 👥 User Management & Authentication
- **users** - User accounts and profiles
- **user_invitations** - Pending user invitations
- **user_sessions** - Active user sessions
- **trusted_devices** - Device trust management
- **login_attempts** - Security tracking

### 🔬 Sterilization Workflow
- **sterilization_cycles** - Sterilization process cycles
- **sterilization_sessions** - Sterilization sessions
- **sterilization_events** - Event tracking
- **sterilization_batches** - Batch processing
- **sterilization_cycle_tools** - Tool associations
- **tools** - Sterilization tools inventory
- **tool_batches** - Tool batch management

### 🧪 Biological Indicators (BI)
- **biological_indicators** - BI inventory
- **biological_indicator_tests** - Test results
- **bi_test_kits** - Test kit management
- **bi_test_results** - Test outcomes
- **bi_failure_incidents** - Failure tracking
- **bi_failure_workflow_steps** - Failure resolution workflow
- **bi_incidents** - Incident management
- **bi_activity_log** - Activity tracking

### 📦 Inventory Management
- **inventory_items** - Item catalog
- **inventory_orders** - Order management
- **inventory_suppliers** - Supplier information
- **inventory_usage** - Usage tracking
- **inventory_checks** - Inventory audits
- **supplier_performance** - Supplier metrics

### 🧹 Environmental Cleaning
- **environmental_cleans_enhanced** - Cleaning records
- **environmental_cleaning_predefined_tasks** - Task templates
- **environmental_cleaning_task_categories** - Task categories
- **environmental_cleaning_task_details** - Task details
- **cleaning_tasks** - Cleaning task management
- **cleaning_schedules** - Schedule management

### 📚 Knowledge & Learning
- **knowledge_articles** - Article content
- **knowledge_categories** - Content categorization
- **knowledge_hub_content** - Hub content
- **knowledge_hub_courses** - Course management
- **knowledge_hub_modules** - Course modules
- **knowledge_hub_lessons** - Lesson content
- **knowledge_hub_user_progress** - User progress tracking
- **knowledge_quiz_attempts** - Quiz attempts
- **knowledge_quizzes** - Quiz content

### 🤖 AI & Analytics
- **ai_settings** - AI configuration
- **ai_usage_logs** - AI usage tracking
- **ai_evals** - AI evaluation data
- **ai_task_performance** - Task performance metrics
- **ai_learning_analytics** - Learning analytics
- **ai_learning_insights** - Learning insights
- **ai_content_recommendations** - Content recommendations
- **ai_challenge_completions** - Challenge completions

### 💰 Billing & Subscriptions
- **billing_accounts** - Billing account management
- **subscriptions** - Subscription management
- **invoices** - Invoice tracking

### 📊 Compliance & Auditing
- **audit_flags** - Compliance flags
- **audit_logs** - Audit trail
- **compliance_requirements** - Compliance tracking
- **facility_compliance_settings** - Compliance configuration
- **quality_incidents** - Quality incident tracking

### 🔒 Security & Monitoring
- **security_audit_log** - Security audit trail
- **security_events** - Security event tracking
- **error_logs** - Error logging
- **error_reports** - Error reporting
- **system_logs** - System logging
- **monitoring_events** - Event monitoring
- **performance_metrics** - Performance tracking

## Key Security Patterns

### Row Level Security (RLS)
- **Facility Isolation**: Most tables use `facility_id` for tenant isolation
- **User Isolation**: User-specific data isolated by `user_id`
- **Role-Based Access**: Admin/manager/user role hierarchies
- **JWT Claims**: Uses `request.jwt.claims.facility_id` for context

### Common RLS Patterns
1. **Facility RLS**: `facility_id = current_setting('request.jwt.claims.facility_id')`
2. **User RLS**: `user_id = auth.uid()`
3. **Admin RLS**: Role-based admin access
4. **Service Role**: System-level access for background processes

## Database Architecture Notes
- **Multi-tenant**: Facility-based data isolation
- **Comprehensive RLS**: Every table has security policies
- **Audit Trail**: Extensive logging and monitoring
- **AI Integration**: Dedicated AI/ML tables
- **Real-time**: Realtime subscriptions enabled
- **Performance**: Indexed for healthcare workflow performance

---
*This documentation should be updated whenever the schema changes significantly.*
