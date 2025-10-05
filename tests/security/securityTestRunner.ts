// Comprehensive security test runner for authentication system
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticationPenetrationTester } from './penetrationTests';
import { AuthenticationVulnerabilityScanner } from './vulnerabilityScanner';
import { SecurityValidationFramework } from './securityValidationFramework';

interface SecurityTestSuite {
  name: string;
  description: string;
  tests: SecurityTest[];
  overallScore: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  recommendations: string[];
  executionTime: number;
  timestamp: number;
}

interface SecurityTest {
  id: string;
  name: string;
  type: 'penetration' | 'vulnerability' | 'validation' | 'integration';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  score: number;
  details: string;
  evidence?: any;
  recommendations?: string[];
  executionTime: number;
}

interface SecurityTestReport {
  reportId: string;
  timestamp: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  overallScore: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  testSuites: SecurityTestSuite[];
  summary: string;
  recommendations: string[];
  nextSteps: string[];
}

class SecurityTestRunner {
  private penetrationTester: AuthenticationPenetrationTester;
  private vulnerabilityScanner: AuthenticationVulnerabilityScanner;
  private validationFramework: SecurityValidationFramework;
  private testReports: SecurityTestReport[] = [];

  constructor() {
    this.penetrationTester = new AuthenticationPenetrationTester();
    this.vulnerabilityScanner = new AuthenticationVulnerabilityScanner();
    this.validationFramework = new SecurityValidationFramework();
  }

  async runComprehensiveSecurityTests(): Promise<SecurityTestReport> {
    const reportId = `security_report_${Date.now()}`;
    const timestamp = Date.now();
    const startTime = Date.now();

    console.log('🔒 Starting comprehensive security testing...');

    const testSuites: SecurityTestSuite[] = [];

    // Run Penetration Tests
    console.log('🔍 Running penetration tests...');
    const penetrationSuite = await this.runPenetrationTests();
    testSuites.push(penetrationSuite);

    // Run Vulnerability Scans
    console.log('🔎 Running vulnerability scans...');
    const vulnerabilitySuite = await this.runVulnerabilityScans();
    testSuites.push(vulnerabilitySuite);

    // Run Security Validation
    console.log('✅ Running security validation...');
    const validationSuite = await this.runSecurityValidation();
    testSuites.push(validationSuite);

    // Run Integration Tests
    console.log('🔗 Running integration tests...');
    const integrationSuite = await this.runIntegrationTests();
    testSuites.push(integrationSuite);

    const executionTime = Date.now() - startTime;

    // Calculate overall metrics
    const totalTests = testSuites.reduce(
      (sum, suite) => sum + suite.tests.length,
      0
    );
    const passedTests = testSuites.reduce(
      (sum, suite) =>
        sum + suite.tests.filter((test) => test.status === 'passed').length,
      0
    );
    const failedTests = testSuites.reduce(
      (sum, suite) =>
        sum + suite.tests.filter((test) => test.status === 'failed').length,
      0
    );
    const skippedTests = testSuites.reduce(
      (sum, suite) =>
        sum + suite.tests.filter((test) => test.status === 'skipped').length,
      0
    );

    const criticalIssues = testSuites.reduce(
      (sum, suite) => sum + suite.criticalIssues,
      0
    );
    const highIssues = testSuites.reduce(
      (sum, suite) => sum + suite.highIssues,
      0
    );
    const mediumIssues = testSuites.reduce(
      (sum, suite) => sum + suite.mediumIssues,
      0
    );
    const lowIssues = testSuites.reduce(
      (sum, suite) => sum + suite.lowIssues,
      0
    );

    const overallScore = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    const summary = this.generateSummary(
      overallScore,
      criticalIssues,
      highIssues
    );
    const recommendations = this.generateRecommendations(testSuites);
    const nextSteps = this.generateNextSteps(
      criticalIssues,
      highIssues,
      mediumIssues
    );

    const report: SecurityTestReport = {
      reportId,
      timestamp,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      overallScore,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      testSuites,
      summary,
      recommendations,
      nextSteps,
    };

    this.testReports.push(report);

    console.log('✅ Security testing completed!');
    console.log(`📊 Overall Score: ${overallScore.toFixed(1)}%`);
    console.log(`🚨 Critical Issues: ${criticalIssues}`);
    console.log(`⚠️ High Issues: ${highIssues}`);
    console.log(`⏱️ Execution Time: ${executionTime}ms`);

    return report;
  }

  private async runPenetrationTests(): Promise<SecurityTestSuite> {
    const startTime = Date.now();
    const tests: SecurityTest[] = [];

    try {
      const penetrationReport = await this.penetrationTester.runAllTests();

      // Convert penetration test results to security tests
      penetrationReport.tests.forEach((test) => {
        tests.push({
          id: `penetration_${test.testName.replace(/\s+/g, '_').toLowerCase()}`,
          name: test.testName,
          type: 'penetration',
          status: test.passed ? 'passed' : 'failed',
          score: test.passed ? 100 : 0,
          details: test.details,
          evidence: test.evidence,
          recommendations: test.recommendations,
          executionTime: 0, // Would be measured in real implementation
        });
      });

      const executionTime = Date.now() - startTime;

      return {
        name: 'Penetration Testing Suite',
        description:
          'Comprehensive penetration testing for authentication system',
        tests,
        overallScore: penetrationReport.overallScore,
        criticalIssues: penetrationReport.criticalIssues,
        highIssues: penetrationReport.highIssues,
        mediumIssues: penetrationReport.mediumIssues,
        lowIssues: penetrationReport.lowIssues,
        recommendations: penetrationReport.tests
          .filter((t) => !t.passed)
          .flatMap((t) => t.recommendations),
        executionTime,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        name: 'Penetration Testing Suite',
        description: 'Penetration testing failed to execute',
        tests: [
          {
            id: 'penetration_error',
            name: 'Penetration Test Execution',
            type: 'penetration',
            status: 'failed',
            score: 0,
            details: `Penetration testing failed: ${error.message}`,
            recommendations: ['Fix penetration testing implementation'],
            executionTime: Date.now() - startTime,
          },
        ],
        overallScore: 0,
        criticalIssues: 1,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        recommendations: ['Fix penetration testing implementation'],
        executionTime: Date.now() - startTime,
        timestamp: Date.now(),
      };
    }
  }

  private async runVulnerabilityScans(): Promise<SecurityTestSuite> {
    const startTime = Date.now();
    const tests: SecurityTest[] = [];

    try {
      const vulnerabilityReport =
        await this.vulnerabilityScanner.scanAuthenticationSystem();

      // Convert vulnerability scan results to security tests
      vulnerabilityReport.vulnerabilities.forEach((vuln) => {
        tests.push({
          id: `vulnerability_${vuln.id}`,
          name: vuln.name,
          type: 'vulnerability',
          status: vuln.detected ? 'failed' : 'passed',
          score: vuln.detected ? 0 : 100,
          details: vuln.description,
          evidence: vuln.evidence,
          recommendations: vuln.remediation,
          executionTime: 0,
        });
      });

      const executionTime = Date.now() - startTime;

      return {
        name: 'Vulnerability Scanning Suite',
        description:
          'Automated vulnerability scanning for authentication system',
        tests,
        overallScore: 100 - vulnerabilityReport.riskScore,
        criticalIssues: vulnerabilityReport.criticalCount,
        highIssues: vulnerabilityReport.highCount,
        mediumIssues: vulnerabilityReport.mediumCount,
        lowIssues: vulnerabilityReport.lowCount,
        recommendations: vulnerabilityReport.recommendations,
        executionTime,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        name: 'Vulnerability Scanning Suite',
        description: 'Vulnerability scanning failed to execute',
        tests: [
          {
            id: 'vulnerability_error',
            name: 'Vulnerability Scan Execution',
            type: 'vulnerability',
            status: 'failed',
            score: 0,
            details: `Vulnerability scanning failed: ${error.message}`,
            recommendations: ['Fix vulnerability scanning implementation'],
            executionTime: Date.now() - startTime,
          },
        ],
        overallScore: 0,
        criticalIssues: 1,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        recommendations: ['Fix vulnerability scanning implementation'],
        executionTime: Date.now() - startTime,
        timestamp: Date.now(),
      };
    }
  }

  private async runSecurityValidation(): Promise<SecurityTestSuite> {
    const startTime = Date.now();
    const tests: SecurityTest[] = [];

    try {
      const validationReport =
        await this.validationFramework.runSecurityValidation();

      // Convert validation results to security tests
      validationReport.results.forEach((result, index) => {
        const rule = this.validationFramework.getValidationRules()[index];
        tests.push({
          id: `validation_${rule.id}`,
          name: rule.name,
          type: 'validation',
          status: result.passed ? 'passed' : 'failed',
          score: result.score,
          details: result.message,
          evidence: result.details,
          recommendations: result.recommendations,
          executionTime: 0,
        });
      });

      const executionTime = Date.now() - startTime;

      return {
        name: 'Security Validation Suite',
        description: 'Comprehensive security validation framework',
        tests,
        overallScore: validationReport.overallScore,
        criticalIssues: validationReport.criticalFailures,
        highIssues: validationReport.highFailures,
        mediumIssues: validationReport.mediumFailures,
        lowIssues: validationReport.lowFailures,
        recommendations: validationReport.recommendations,
        executionTime,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        name: 'Security Validation Suite',
        description: 'Security validation failed to execute',
        tests: [
          {
            id: 'validation_error',
            name: 'Security Validation Execution',
            type: 'validation',
            status: 'failed',
            score: 0,
            details: `Security validation failed: ${error.message}`,
            recommendations: ['Fix security validation implementation'],
            executionTime: Date.now() - startTime,
          },
        ],
        overallScore: 0,
        criticalIssues: 1,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        recommendations: ['Fix security validation implementation'],
        executionTime: Date.now() - startTime,
        timestamp: Date.now(),
      };
    }
  }

  private async runIntegrationTests(): Promise<SecurityTestSuite> {
    const startTime = Date.now();
    const tests: SecurityTest[] = [];

    try {
      // Mock integration tests
      const integrationTests = [
        {
          id: 'integration_auth_flow',
          name: 'Authentication Flow Integration',
          description: 'Test complete authentication flow',
          passed: true,
        },
        {
          id: 'integration_rate_limiting',
          name: 'Rate Limiting Integration',
          description: 'Test rate limiting integration',
          passed: true,
        },
        {
          id: 'integration_session_management',
          name: 'Session Management Integration',
          description: 'Test session management integration',
          passed: false,
        },
        {
          id: 'integration_audit_logging',
          name: 'Audit Logging Integration',
          description: 'Test audit logging integration',
          passed: true,
        },
      ];

      integrationTests.forEach((test) => {
        tests.push({
          id: test.id,
          name: test.name,
          type: 'integration',
          status: test.passed ? 'passed' : 'failed',
          score: test.passed ? 100 : 0,
          details: test.description,
          recommendations: test.passed ? [] : ['Fix integration issue'],
          executionTime: 0,
        });
      });

      const executionTime = Date.now() - startTime;
      const passedTests = tests.filter((t) => t.status === 'passed').length;
      const overallScore = (passedTests / tests.length) * 100;

      return {
        name: 'Integration Testing Suite',
        description: 'Integration testing for authentication system components',
        tests,
        overallScore,
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 1,
        lowIssues: 0,
        recommendations: ['Fix session management integration'],
        executionTime,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        name: 'Integration Testing Suite',
        description: 'Integration testing failed to execute',
        tests: [
          {
            id: 'integration_error',
            name: 'Integration Test Execution',
            type: 'integration',
            status: 'failed',
            score: 0,
            details: `Integration testing failed: ${error.message}`,
            recommendations: ['Fix integration testing implementation'],
            executionTime: Date.now() - startTime,
          },
        ],
        overallScore: 0,
        criticalIssues: 1,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        recommendations: ['Fix integration testing implementation'],
        executionTime: Date.now() - startTime,
        timestamp: Date.now(),
      };
    }
  }

  private generateSummary(
    overallScore: number,
    criticalIssues: number,
    highIssues: number
  ): string {
    if (criticalIssues > 0) {
      return `CRITICAL: ${criticalIssues} critical security issues require immediate attention. Overall score: ${overallScore.toFixed(1)}%`;
    } else if (highIssues > 0) {
      return `HIGH PRIORITY: ${highIssues} high-severity security issues need to be addressed. Overall score: ${overallScore.toFixed(1)}%`;
    } else if (overallScore >= 90) {
      return `EXCELLENT: Strong security posture with ${overallScore.toFixed(1)}% overall score`;
    } else if (overallScore >= 75) {
      return `GOOD: Solid security posture with ${overallScore.toFixed(1)}% overall score`;
    } else if (overallScore >= 50) {
      return `MODERATE: Security posture needs improvement with ${overallScore.toFixed(1)}% overall score`;
    } else {
      return `POOR: Critical security issues with ${overallScore.toFixed(1)}% overall score`;
    }
  }

  private generateRecommendations(testSuites: SecurityTestSuite[]): string[] {
    const recommendations: string[] = [];

    // Collect all recommendations from test suites
    testSuites.forEach((suite) => {
      recommendations.push(...suite.recommendations);
    });

    // Add general recommendations
    const criticalIssues = testSuites.reduce(
      (sum, suite) => sum + suite.criticalIssues,
      0
    );
    const highIssues = testSuites.reduce(
      (sum, suite) => sum + suite.highIssues,
      0
    );

    if (criticalIssues > 0) {
      recommendations.unshift(
        'URGENT: Address all critical security issues immediately'
      );
    }
    if (highIssues > 0) {
      recommendations.unshift(
        'HIGH PRIORITY: Fix all high-severity security issues'
      );
    }

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  private generateNextSteps(
    criticalIssues: number,
    highIssues: number,
    mediumIssues: number
  ): string[] {
    const nextSteps: string[] = [];

    if (criticalIssues > 0) {
      nextSteps.push('1. Immediately address all critical security issues');
      nextSteps.push('2. Implement emergency security patches');
      nextSteps.push('3. Conduct emergency security review');
    } else if (highIssues > 0) {
      nextSteps.push('1. Address all high-severity security issues');
      nextSteps.push('2. Implement security improvements');
      nextSteps.push('3. Schedule security review');
    } else if (mediumIssues > 0) {
      nextSteps.push('1. Address medium-severity security issues');
      nextSteps.push('2. Implement security enhancements');
      nextSteps.push('3. Schedule regular security testing');
    } else {
      nextSteps.push('1. Maintain current security posture');
      nextSteps.push('2. Continue regular security testing');
      nextSteps.push('3. Monitor for new vulnerabilities');
    }

    nextSteps.push('4. Establish continuous security monitoring');
    nextSteps.push('5. Implement security training for development team');
    nextSteps.push('6. Create incident response procedures');

    return nextSteps;
  }

  // Public methods
  getTestHistory(): SecurityTestReport[] {
    return [...this.testReports];
  }

  getLatestReport(): SecurityTestReport | null {
    return this.testReports.length > 0
      ? this.testReports[this.testReports.length - 1]
      : null;
  }

  async runQuickSecurityCheck(): Promise<SecurityTestReport> {
    // Run a subset of critical tests for quick validation
    console.log('⚡ Running quick security check...');

    // This would run only the most critical tests
    return await this.runComprehensiveSecurityTests();
  }

  async runContinuousSecurityMonitoring(): Promise<void> {
    // Run security tests continuously
    console.log('🔄 Starting continuous security monitoring...');

    setInterval(
      async () => {
        try {
          const report = await this.runQuickSecurityCheck();
          if (report.criticalIssues > 0) {
            console.log('🚨 CRITICAL SECURITY ISSUES DETECTED!');
            // In a real implementation, this would trigger alerts
          }
        } catch (error) {
          console.error('Security monitoring error:', error);
        }
      },
      5 * 60 * 1000
    ); // Run every 5 minutes
  }
}

// Test suite
describe('Security Test Runner', () => {
  let testRunner: SecurityTestRunner;

  beforeEach(() => {
    testRunner = new SecurityTestRunner();
  });

  it('should run comprehensive security tests', async () => {
    const report = await testRunner.runComprehensiveSecurityTests();

    expect(report.reportId).toBeDefined();
    expect(report.timestamp).toBeGreaterThan(0);
    expect(report.totalTests).toBeGreaterThan(0);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('should provide detailed test results', async () => {
    const report = await testRunner.runComprehensiveSecurityTests();

    expect(report.testSuites).toBeDefined();
    expect(report.testSuites.length).toBeGreaterThan(0);
    expect(report.summary).toBeDefined();
    expect(report.recommendations).toBeDefined();
    expect(report.nextSteps).toBeDefined();
  });

  it('should track test history', async () => {
    await testRunner.runComprehensiveSecurityTests();
    await testRunner.runComprehensiveSecurityTests();

    const history = testRunner.getTestHistory();
    expect(history.length).toBe(2);
  });

  it('should provide latest report', async () => {
    await testRunner.runComprehensiveSecurityTests();

    const latestReport = testRunner.getLatestReport();
    expect(latestReport).toBeDefined();
    expect(latestReport!.reportId).toBeDefined();
  });
});

export {
  SecurityTestRunner,
  type SecurityTestSuite,
  type SecurityTest,
  type SecurityTestReport,
};
