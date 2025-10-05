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
  'skipping-bi-indicator-tests',
  'Skipping BI Indicator Tests',
  'Learn when and how to properly skip biological indicator tests in Cliniio, including documentation requirements and compliance considerations for skipped tests.',
  '<div class="help-article">
  <div class="article-intro">
    <h1>Skipping BI Indicator Tests</h1>
    <p class="lead">Learn when and how to properly skip biological indicator tests in Cliniio, including documentation requirements and compliance considerations for skipped tests.</p>
  </div>

  <div class="impact-section">
    <h2>⚠️ When Skipping BI Tests is Allowed</h2>
    <div class="impact-highlight">
      <div class="impact-stat">
        <div class="stat-number">Limited</div>
        <div class="stat-label">Skip Scenarios</div>
      </div>
      <div class="impact-description">
        <ul>
          <li>• Equipment maintenance or repair</li>
          <li>• Emergency sterilization needs</li>
          <li>• BI indicator supply shortage</li>
          <li>• Documented facility protocols</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="workflow">
    <h2>📋 How to Skip BI Tests in Cliniio</h2>
    <ol class="steps">
      <li>
        <div>
          <strong>Access Sterilization Cycle</strong>
          <p>Navigate to the sterilization cycle you need to run and select "Start Cycle" or "Load Sterilizer" option.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Select Skip BI Test Option</strong>
          <p>In the cycle configuration screen, look for the "BI Testing" section and select "Skip BI Test" checkbox or toggle.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Provide Skip Reason</strong>
          <p>Enter a detailed reason for skipping the BI test in the required text field. This is mandatory for compliance documentation.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Select Skip Category</strong>
          <p>Choose the appropriate category from the dropdown menu (Equipment Maintenance, Emergency, Supply Shortage, etc.).</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Add Supporting Documentation</strong>
          <p>Upload any relevant documents, photos, or notes that support the reason for skipping the BI test.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Review and Confirm</strong>
          <p>Review all skip information for accuracy and completeness before confirming the sterilization cycle without BI testing.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Complete Cycle Documentation</strong>
          <p>Ensure the cycle is properly documented with all skip details for future reference and compliance audits.</p>
        </div>
      </li>
    </ol>
  </div>

  <div class="grid">
    <div class="metric-card">
      <div class="metric-icon">📝</div>
      <h3>Documentation Requirements</h3>
      <p>Mandatory Information</p>
      <p>Detailed reason, category selection, supporting evidence, and supervisor approval for all skipped BI tests.</p>
    </div>
    
    <div class="metric-card">
      <div class="metric-icon">⚠️</div>
      <h3>Compliance Considerations</h3>
      <p>Regulatory Impact</p>
      <p>Skipped BI tests must be documented and justified according to facility protocols and regulatory requirements.</p>
    </div>
    
    <div class="metric-card">
      <div class="metric-icon">📊</div>
      <h3>Analytics Tracking</h3>
      <p>Skip Monitoring</p>
      <p>All skipped BI tests are tracked in analytics for trend analysis and compliance reporting purposes.</p>
    </div>
  </div>

  <div class="metric-overview">
    <h2>📋 Valid Reasons for Skipping BI Tests</h2>
    <ul class="key-points">
      <li><strong>Equipment Maintenance:</strong> When sterilizer is undergoing scheduled maintenance, repair, or calibration procedures.</li>
      <li><strong>Emergency Situations:</strong> Critical patient care needs that require immediate sterilization without BI testing capability.</li>
      <li><strong>Supply Shortage:</strong> Temporary unavailability of biological indicators due to supply chain issues or delivery delays.</li>
      <li><strong>Equipment Malfunction:</strong> BI incubator failure or malfunction that prevents proper BI testing.</li>
      <li><strong>Facility Protocols:</strong> Documented facility policies that allow specific skip scenarios under controlled conditions.</li>
      <li><strong>Training Purposes:</strong> Educational cycles for staff training that do not require BI testing validation.</li>
    </ul>
  </div>

  <div class="metric-overview">
    <h2>🚫 Invalid Reasons for Skipping BI Tests</h2>
    <ul class="key-points">
      <li><strong>Convenience:</strong> Skipping BI tests for convenience or to save time is never acceptable.</li>
      <li><strong>Cost Savings:</strong> Reducing BI testing frequency to save money violates safety protocols.</li>
      <li><strong>Staff Shortage:</strong> Inadequate staffing is not a valid reason to skip essential BI testing.</li>
      <li><strong>Equipment Availability:</strong> Having multiple sterilizers does not justify skipping BI tests on any unit.</li>
      <li><strong>Previous Success:</strong> Past successful cycles do not eliminate the need for current BI testing.</li>
      <li><strong>Low-Risk Items:</strong> Even low-risk items require proper sterilization validation through BI testing.</li>
    </ul>
  </div>

  <div class="impact-section">
    <h2>📊 Skip Tracking and Analytics</h2>
    <div class="impact-highlight">
      <div class="impact-stat">
        <div class="stat-number">100%</div>
        <div class="stat-label">Documentation Required</div>
      </div>
      <div class="impact-description">
        <ul>
          <li>• All skipped tests are logged in Cliniio analytics</li>
          <li>• Skip frequency is monitored for trends</li>
          <li>• Reports show skip reasons and patterns</li>
          <li>• Compliance tracking for audit purposes</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="workflow">
    <h2>📋 Post-Skip Procedures</h2>
    <ol class="steps">
      <li>
        <div>
          <strong>Resume Normal Testing</strong>
          <p>As soon as the skip reason is resolved, immediately resume normal BI testing procedures.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Verify Equipment Function</strong>
          <p>If equipment was the skip reason, verify proper function before resuming BI testing.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Document Resolution</strong>
          <p>Record the resolution of the skip condition and return to normal BI testing protocols.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Review Skip Frequency</strong>
          <p>Monitor skip frequency to ensure it remains within acceptable limits and facility protocols.</p>
        </div>
      </li>
    </ol>
  </div>

  <div class="next-steps">
    <h2>📚 Related Resources</h2>
    <ul>
      <li><a href="#">BI Testing Documentation Requirements</a></li>
      <li><a href="#">Compliance Reporting Procedures</a></li>
      <li><a href="#">Analytics Dashboard Guide</a></li>
      <li><a href="#">Emergency Sterilization Protocols</a></li>
      <li><a href="#">Quality Assurance Programs</a></li>
    </ul>
  </div>
</div>',
  'bi-testing',
  'skip-procedures',
  4,
  true,
  true,
  0,
  NOW(),
  NOW()
);
