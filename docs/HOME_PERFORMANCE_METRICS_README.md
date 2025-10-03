# Home Page Performance Metrics Guide

## Overview

The home page displays key performance metrics that provide real-time insights into your facility's efficiency, cost savings, and AI-powered improvements. These metrics are calculated using data from across all Cliniio modules and are updated automatically.

## Performance Metrics Dashboard

The dashboard consists of four main metric cards, each displaying different aspects of your facility's performance:

### 1. Time Savings Card

**What it shows:**

- **Time Saved (Day)**: Hours saved today through AI assistance and process improvements
- **Time Saved (Month)**: Cumulative hours saved this month

**How it's calculated:**

- Aggregates time savings from completed AI tasks across all modules
- Compares actual task completion time vs. estimated time without AI
- Data source: `ai_task_performance` table
- Updates: Real-time as tasks are completed

**What it means:**

- Higher numbers indicate more efficient operations
- Shows immediate impact of AI assistance
- Helps justify AI investment through quantifiable time savings

### 2. Cost Savings Card

**What it shows:**

- **Monthly Savings**: Dollar amount saved this month through AI efficiency
- **Annual Savings**: Projected annual savings based on current performance

**How it's calculated:**
The enhanced AI-driven calculation includes multiple factors:

#### Direct Time Savings

- Staff cost savings from time saved on tasks
- Uses facility-specific hourly rates (default: $45/hour)
- Formula: `(time_saved_minutes / 60) × hourly_rate`

#### Indirect AI Efficiency Savings

- Faster decision-making (30% improvement)
- Better accuracy (15% improvement)
- Scaled by staff count and working hours
- Formula: `hourly_rate × staff_count × 0.3 × 0.5_hours_per_day`

#### Error Prevention Savings

- Analyzes historical quality incidents
- Calculates prevented errors (AI reduces by 40%)
- Facility-type specific cost estimates
- Data source: `quality_incidents` table

#### Compliance & Risk Mitigation

- Reduces compliance violations (60% reduction)
- Prevents costly regulatory fines
- Conservative estimates: 2 violations prevented per month
- Cost per violation: $500 average

#### Resource Optimization

- Inventory waste reduction (AI optimizes ordering)
- Sterilization efficiency improvements
- Real-time data from existing tables
- Data sources: `inventory_items`, `sterilization_cycles`

#### Growth Projection

- 15% year-over-year improvement factor
- Shows increasing value over time

**What it means:**

- Demonstrates clear ROI for AI investment
- Shows comprehensive business impact
- Helps justify continued Cliniio usage

### 3. AI & Process Efficiency Card

**What it shows:**

- **Time Saved**: Current timeframe time savings (daily/weekly/monthly)
- **Cost Saved**: Current timeframe cost savings

**How it's calculated:**

- Uses the same enhanced calculation as Cost Savings Card
- Timeframe selector: daily, weekly, or monthly
- Real-time updates every 2 minutes
- Data source: `aiImpactMeasurementService`

**What it means:**

- Focused view of AI impact
- Simple, clean display of key metrics
- No distracting extra information

### 4. Team Performance Card

**What it shows:**

- **Skills**: Overall team skill level percentage
- **Inventory Efficiency**: Inventory management accuracy percentage
- **Sterilization Efficiency**: Sterilization process efficiency percentage

**How it's calculated:**

#### Skills Score

- Based on AI task completion rates
- Considers task difficulty and user performance
- Data source: `ai_task_performance` table
- Formula: `(completed_tasks / total_tasks) × 100`

#### Inventory Efficiency

- Real-time inventory accuracy from actual data
- Data source: `inventory_items` table
- Formula: `(accurate_items / total_items) × 100`

#### Sterilization Efficiency

- Performance score from sterilization cycles
- Considers cycle completion, quality, and timing
- Data source: `sterilization_cycles` table
- Fallback: AI task sterilization performance

**What it means:**

- Identifies areas for team improvement
- Shows module-specific performance
- Helps allocate training resources

## Data Sources & Updates

### Real-time Data Sources

- **AI Task Performance**: `ai_task_performance` table
- **Quality Incidents**: `quality_incidents` table
- **Inventory Items**: `inventory_items` table
- **Sterilization Cycles**: `sterilization_cycles` table
- **Facility Data**: `facilities` table

### Update Frequency

- **Time Savings**: Real-time as tasks complete
- **Cost Savings**: Every 2 minutes
- **Team Performance**: Every 5 minutes
- **AI Efficiency**: Every 2 minutes

### Data Freshness

- All metrics show when they were last updated
- Automatic fallbacks if data is unavailable
- Graceful degradation for missing information

## Understanding the Numbers

### Time Savings Interpretation

- **0-2 hours/day**: Normal operations, minimal AI impact
- **2-5 hours/day**: Good AI utilization, noticeable efficiency gains
- **5+ hours/day**: Excellent AI integration, significant time savings

### Cost Savings Interpretation

- **$0-100/month**: Early adoption phase, minimal savings
- **$100-500/month**: Growing efficiency, positive ROI
- **$500+/month**: Strong AI integration, excellent ROI

### Team Performance Interpretation

- **80-100%**: Excellent performance, minimal improvement needed
- **60-80%**: Good performance, some areas for improvement
- **Below 60%**: Needs attention, consider additional training

## Troubleshooting

### If Metrics Show 0 or Low Values

1. Check if AI tasks are being completed
2. Verify data exists in source tables
3. Ensure proper facility configuration
4. Check for recent activity in modules

### If Metrics Don't Update

1. Verify real-time connections are active
2. Check browser console for errors
3. Ensure user has proper permissions
4. Restart the application if needed

### Data Accuracy Issues

1. Verify source table data integrity
2. Check calculation formulas in services
3. Ensure proper timezone handling
4. Validate facility cost configurations

## Configuration

### Facility-Specific Settings

- **Hourly Rate**: Set in `facilities.hourly_rate` (default: $45)
- **Facility Type**: Affects error cost estimates
- **Staff Count**: Influences indirect savings calculations

### Customization Options

- Update frequency intervals
- Calculation parameters
- Display preferences
- Metric thresholds

## Performance Impact

### Database Queries

- Optimized queries with proper indexing
- Cached results to reduce database load
- Batch updates to minimize real-time overhead

### Real-time Updates

- Efficient subscription management
- Automatic cleanup of unused connections
- Graceful fallbacks for connection issues

## Future Enhancements

### Planned Improvements

- Machine learning-based predictions
- Industry benchmarking comparisons
- Custom metric definitions
- Advanced visualization options

### Integration Opportunities

- External accounting systems
- HR management platforms
- Quality management systems
- Regulatory compliance tracking

---

_This guide covers the core performance metrics displayed on the Cliniio home page. For detailed information about specific modules or advanced features, refer to the respective module documentation._
