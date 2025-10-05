INSERT INTO help_articles (
  slug,
  title,
  excerpt,
  content,
  category,
  subcategory,
  priority,
  is_published,
  is_featured,
  view_count,
  created_at,
  updated_at
) VALUES (
  'sterilization-performance-analytics-dashboard',
  'Sterilization Performance Analytics Dashboard',
  'Understand and interpret sterilization metrics, KPIs, and performance indicators in Cliniio''s analytics dashboard for data-driven decision making.',
  '<div class="help-article">
  <div class="article-intro">
    <h1>Sterilization Performance Analytics Dashboard</h1>
    <p class="lead">Understand and interpret sterilization metrics, KPIs, and performance indicators in Cliniio''s analytics dashboard for data-driven decision making.</p>
  </div>

  <div class="metric-overview">
    <h2>📊 Analytics Dashboard Overview</h2>
    <p>The Sterilization Performance Analytics Dashboard provides real-time insights into your sterilization operations, including cycle success rates, equipment performance, efficiency metrics, and compliance indicators. This centralized view helps you monitor trends, identify issues, and optimize sterilization processes.</p>
  </div>

  <div class="grid">
    <div class="metric-card">
      <div class="metric-icon">📈</div>
      <h3>Success Rate Metrics</h3>
      <p>Cycle Performance</p>
      <p>Monitor sterilization cycle success rates, failure analysis, and trend patterns over time.</p>
    </div>
    
    <div class="metric-card">
      <div class="metric-icon">⏱️</div>
      <h3>Efficiency Indicators</h3>
      <p>Operational Metrics</p>
      <p>Track cycle times, throughput rates, equipment utilization, and operational efficiency.</p>
    </div>
    
    <div class="metric-card">
      <div class="metric-icon">🔧</div>
      <h3>Equipment Performance</h3>
      <p>Maintenance Insights</p>
      <p>Monitor individual sterilizer performance, maintenance schedules, and equipment reliability.</p>
    </div>
  </div>

  <div class="workflow">
    <h2>📋 Navigating the Analytics Dashboard</h2>
    <ol class="steps">
      <li>
        <div>
          <strong>Access Analytics Tab</strong>
          <p>Click on the "Analytics" tab in the sterilization module to open the performance dashboard.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Select Time Period</strong>
          <p>Choose your analysis timeframe using the date range selector (daily, weekly, monthly, or custom).</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Filter by Equipment</strong>
          <p>Select specific sterilizers or view aggregate data across all equipment in your facility.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Review Key Metrics</strong>
          <p>Examine the main dashboard showing success rates, cycle counts, efficiency metrics, and alerts.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Drill Down into Details</strong>
          <p>Click on specific metrics or charts to view detailed breakdowns and historical trends.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Export Analytics Data</strong>
          <p>Generate reports or export data for further analysis, presentations, or compliance documentation.</p>
        </div>
      </li>
    </ol>
  </div>

  <div class="metric-overview">
    <h2>📊 Key Performance Indicators (KPIs)</h2>
    <ul class="key-points">
      <li><strong>Cycle Success Rate:</strong> Percentage of successful sterilization cycles. Target should be 100%.</li>
      <li><strong>Average Cycle Time:</strong> Mean duration of sterilization cycles, including heating, exposure, and cooling phases.</li>
      <li><strong>Equipment Utilization:</strong> Percentage of time sterilizers are actively running versus idle time.</li>
      <li><strong>Throughput Rate:</strong> Number of cycles completed per day/week/month by each sterilizer.</li>
      <li><strong>Failure Rate:</strong> Percentage of failed cycles with detailed breakdown by cause and equipment.</li>
      <li><strong>Maintenance Frequency:</strong> Frequency of maintenance events and their impact on operational efficiency.</li>
    </ul>
  </div>

  <div class="impact-section">
    <h2>📈 Performance Trend Analysis</h2>
    <div class="impact-highlight">
      <div class="impact-stat">
        <div class="stat-number">100%</div>
        <div class="stat-label">Success Target</div>
      </div>
      <div class="impact-description">
        <ul>
          <li>• Monitor success rate trends over time</li>
          <li>• Identify seasonal patterns or variations</li>
          <li>• Track improvement initiatives and their impact</li>
          <li>• Compare performance across different equipment</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="workflow">
    <h2>📋 Using Analytics for Decision Making</h2>
    <ol class="steps">
      <li>
        <div>
          <strong>Identify Performance Issues</strong>
          <p>Use trend analysis to spot declining success rates, increasing cycle times, or equipment problems.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Compare Equipment Performance</strong>
          <p>Analyze data across multiple sterilizers to identify best practices and performance variations.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Optimize Scheduling</strong>
          <p>Use utilization data to optimize sterilization schedules and improve operational efficiency.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Plan Maintenance</strong>
          <p>Schedule preventive maintenance based on performance trends and equipment utilization patterns.</p>
        </div>
      </li>
    </ol>
  </div>

  <div class="metric-overview">
    <h2>⚠️ Analytics Dashboard Alerts</h2>
    <ul class="key-points">
      <li><strong>Performance Alerts:</strong> Automated notifications when success rates drop below acceptable thresholds.</li>
      <li><strong>Equipment Alerts:</strong> Warnings for equipment malfunctions, maintenance needs, or unusual performance patterns.</li>
      <li><strong>Compliance Alerts:</strong> Notifications for missed cycles, documentation gaps, or regulatory compliance issues.</li>
      <li><strong>Trend Alerts:</strong> Early warnings for declining performance trends before they become critical issues.</li>
    </ul>
  </div>

  <div class="next-steps">
    <h2>📚 Related Resources</h2>
    <ul>
      <li><a href="#">Generating Sterilization Cycle Reports in Cliniio</a></li>
      <li><a href="#">Exporting Sterilization Data for Audits</a></li>
      <li><a href="#">Setting Up Performance Alerts</a></li>
      <li><a href="#">Analytics Data Interpretation Guide</a></li>
    </ul>
  </div>
</div>',
  'reporting-compliance',
  'analytics-dashboard',
  2,
  true,
  true,
  0,
  NOW(),
  NOW()
);
