# Library Seed Data

## Overview

This document describes the comprehensive seed data available for the Cliniio library system. The seed data provides a complete set of educational content covering all aspects of sterilization management in healthcare facilities.

## 🌱 Quick Start

### Run the Seed Data

```bash
# Seed the library with comprehensive content
npm run seed:library
```

### Manual SQL Execution

```bash
# Run the SQL file directly
npx supabase db reset --linked --file supabase/seed_library_data.sql
```

## 📚 Content Categories

### 1. **Sterilization Courses** (5 items)

- **Sterilization Fundamentals** - Complete introduction to sterilization processes
- **Advanced Sterilization Techniques** - Master advanced methods and troubleshooting
- **Autoclave Operation and Maintenance** - Equipment operation and maintenance
- **Biological Indicator Testing** - BI testing procedures and documentation
- **Sterilization Safety Protocols** - Safety procedures and emergency response

### 2. **Procedures** (8 items)

- **Steam Sterilization Procedure** - Step-by-step steam sterilization process
- **Chemical Sterilization Procedure** - Chemical sterilization protocols
- **Instrument Preparation and Packaging** - Proper preparation and packaging
- **Sterilization Cycle Monitoring** - Monitoring and compliance procedures
- **Endoscope Reprocessing Protocol** - Specialized endoscope handling
- **Implant Sterilization Requirements** - Surgical implant sterilization
- **Emergency Sterilization Procedures** - Emergency protocols and failures

### 3. **Policies** (6 items)

- **Infection Control Policy** - Comprehensive infection prevention guidelines
- **Sterilization Quality Assurance Policy** - QA measures and compliance
- **Equipment Maintenance Policy** - Maintenance and calibration standards
- **Staff Training and Competency Policy** - Training requirements and assessments
- **FDA Sterilization Guidelines** - FDA regulations and compliance
- **AAMI Standards Compliance** - AAMI standards for medical instrumentation
- **Joint Commission Sterilization Standards** - Joint Commission requirements

### 4. **Learning Pathways** (3 items)

- **Sterilization Technician Certification Path** - Complete certification pathway
- **Infection Prevention Specialist Track** - Advanced infection control track
- **Quality Assurance Manager Program** - Management and QA program

### 5. **Technology and Innovation** (2 items)

- **Digital Sterilization Monitoring** - Digital systems and automation
- **AI-Powered Quality Control** - AI applications in quality control

### 6. **Management and Leadership** (2 items)

- **Sterilization Department Management** - Leadership and management principles
- **Budget Planning for Sterilization** - Financial planning and optimization

## 🎯 Content Features

### Difficulty Levels

- **Beginner** - Entry-level content for new staff
- **Intermediate** - Mid-level content for experienced staff
- **Advanced** - Expert-level content for specialists

### Departments

- **Central Sterile** - Primary sterilization department
- **Clinical** - Clinical staff and infection control
- **Compliance** - Regulatory and compliance teams
- **Management** - Leadership and management
- **HR** - Human resources and training

### Content Types

- **Course** - Interactive learning modules
- **Procedure** - Step-by-step operational procedures
- **Policy** - Organizational policies and guidelines
- **Learning Pathway** - Comprehensive certification tracks

### Repeat Settings

- **Yearly** - Annual recertification required
- **Quarterly** - Quarterly updates and refreshers
- **One-time** - Single completion required

## 📊 Content Statistics

| Category          | Count | Duration Range  | Difficulty Distribution                |
| ----------------- | ----- | --------------- | -------------------------------------- |
| Courses           | 5     | 25-120 minutes  | 2 Beginner, 2 Intermediate, 1 Advanced |
| Procedures        | 8     | 15-40 minutes   | 3 Beginner, 3 Intermediate, 2 Advanced |
| Policies          | 6     | 20-50 minutes   | 1 Beginner, 4 Intermediate, 1 Advanced |
| Learning Pathways | 3     | 180-300 minutes | 1 Intermediate, 2 Advanced             |
| Technology        | 2     | 55-70 minutes   | 1 Intermediate, 1 Advanced             |
| Management        | 2     | 90-120 minutes  | 1 Intermediate, 1 Advanced             |

## 🔧 Technical Details

### Database Tables

- **knowledge_hub_content** - Main content table
- **knowledge_hub_user_progress** - User progress tracking

### Required Fields

- `id` - Unique identifier (UUID)
- `title` - Content title
- `description` - Content description
- `category` - Content category
- `content_type` - Type of content
- `domain` - Content domain
- `tags` - Searchable tags
- `status` - Publication status
- `department` - Target department
- `difficulty_level` - Content difficulty
- `estimated_duration` - Duration in minutes
- `is_active` - Active status
- `facility_id` - Facility association
- `created_by` - Creator user ID
- `updated_by` - Last updater user ID

### Optional Fields

- `due_date` - Assignment due date
- `progress` - Completion progress
- `passing_score` - Required passing score
- `mandatory_repeat` - Repeat requirement
- `repeat_settings` - Repeat configuration

## 🚀 Usage Examples

### Accessing Content in Code

```typescript
// Fetch all library content
import { fetchLibraryContent } from '@/features/library/services/libraryService';

const content = await fetchLibraryContent();
console.log('Total content items:', content.length);

// Filter by category
const courses = content.filter((item) => item.category === 'Courses');
const procedures = content.filter((item) => item.category === 'Procedures');

// Filter by difficulty
const beginnerContent = content.filter((item) => item.level === 'Beginner');
const advancedContent = content.filter((item) => item.level === 'Advanced');
```

### Database Queries

```sql
-- Get all published content
SELECT * FROM knowledge_hub_content
WHERE status = 'published' AND is_active = true;

-- Get content by department
SELECT * FROM knowledge_hub_content
WHERE department = 'central_sterile';

-- Get content by difficulty level
SELECT * FROM knowledge_hub_content
WHERE difficulty_level = 'beginner';

-- Get content requiring repeat
SELECT * FROM knowledge_hub_content
WHERE mandatory_repeat = true;
```

## 🔄 Updating Seed Data

### Adding New Content

1. Edit `supabase/seed_library_data.sql`
2. Add new INSERT statements following the existing pattern
3. Run `npm run seed:library` to update

### Modifying Existing Content

1. Edit the existing INSERT statements in the seed file
2. Run `npm run seed:library` to update
3. Or update directly in the database

### Removing Content

1. Remove INSERT statements from seed file
2. Or mark content as inactive: `UPDATE knowledge_hub_content SET is_active = false WHERE id = 'content-id';`

## 🛡️ Safety Features

### Backup Creation

- Automatic backup before seeding
- Backup stored in `./database-backups/`
- Timestamped backup files

### Verification

- Content count verification
- Category distribution check
- Difficulty level validation

### Environment Detection

- Production environment warnings
- Confirmation prompts for safety
- Rollback instructions

## 📈 Performance Considerations

### Content Loading

- Content is loaded asynchronously
- Pagination support for large datasets
- Caching for frequently accessed content

### Search Optimization

- Full-text search on titles and descriptions
- Tag-based filtering
- Category and department filtering

### User Progress

- Efficient progress tracking
- Batch updates for performance
- Optimized queries for dashboard views

## 🎓 Educational Value

### Learning Objectives

- Comprehensive sterilization knowledge
- Practical procedure training
- Policy compliance understanding
- Management and leadership skills

### Certification Paths

- Sterilization Technician Certification
- Infection Prevention Specialist
- Quality Assurance Manager

### Continuing Education

- Annual recertification requirements
- Quarterly updates and refreshers
- New technology and innovation training

## 🔍 Troubleshooting

### Common Issues

**Content not appearing:**

- Check `is_active = true`
- Verify `status = 'published'`
- Confirm `facility_id` matches

**User progress not tracking:**

- Check `knowledge_hub_user_progress` table
- Verify user ID and content ID relationships
- Check RLS policies

**Search not working:**

- Verify tags are properly formatted
- Check category and department values
- Ensure content is published and active

### Debug Queries

```sql
-- Check content status
SELECT id, title, status, is_active, facility_id
FROM knowledge_hub_content
ORDER BY created_at DESC;

-- Check user progress
SELECT u.id, u.title, p.progress_percentage, p.status
FROM knowledge_hub_content u
LEFT JOIN knowledge_hub_user_progress p ON u.id = p.content_id
WHERE p.user_id = 'your-user-id';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('knowledge_hub_content', 'knowledge_hub_user_progress');
```

## 📞 Support

For issues with library seed data:

1. Check the troubleshooting section above
2. Review the database logs
3. Verify RLS policies are correct
4. Check user permissions and facility associations

The library seed data provides a solid foundation for the Cliniio sterilization management system, covering all essential aspects of healthcare sterilization education and training.
