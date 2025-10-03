#!/usr/bin/env node

/**
 * Security Configuration Validation Script
 *
 * This script checks for:
 * 1. Hardcoded credentials in source code
 * 2. Missing environment variables
 * 3. Weak credential patterns
 * 4. Security configuration issues
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import {
  getSecurityConfigStatus,
  validateSecurityConfiguration,
} from '../src/config/securityConfig';

// File extensions to scan for credentials
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.toml'];
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
];

// Patterns that indicate hardcoded credentials
const CREDENTIAL_PATTERNS = [
  // API Keys
  /(api[_-]?key|apikey)\s*[:=]\s*['"`][^'"`]{20,}['"`]/gi,
  /(supabase[_-]?url|supabase[_-]?key)\s*[:=]\s*['"`][^'"`]{20,}['"`]/gi,
  /(openai|anthropic|google|azure)[_-]?api[_-]?key\s*[:=]\s*['"`][^'"`]{20,}['"`]/gi,

  // JWT Tokens
  /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,

  // Passwords
  /password\s*[:=]\s*['"`][^'"`]{3,}['"`]/gi,

  // URLs with credentials
  /https?:\/\/[^\/]+:[^@]+@[^\s]+/g,

  // Hardcoded secrets
  /secret\s*[:=]\s*['"`][^'"`]{10,}['"`]/gi,
  /token\s*[:=]\s*['"`][^'"`]{10,}['"`]/gi,
];

// Weak credential patterns
const WEAK_PATTERNS = [
  /password\s*[:=]\s*['"`](admin|test|123|password|qwerty)[^'"`]*['"`]/gi,
  /api[_-]?key\s*[:=]\s*['"`](test|mock|demo|sample)[^'"`]*['"`]/gi,
];

interface SecurityIssue {
  file: string;
  line: number;
  pattern: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  suggestion: string;
}

interface SecurityReport {
  issues: SecurityIssue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  environment: {
    isValid: boolean;
    missing: string[];
    present: string[];
  };
  recommendations: string[];
}

class SecurityScanner {
  private issues: SecurityIssue[] = [];
  private scannedFiles = 0;

  async scanDirectory(dir: string): Promise<void> {
    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          if (!IGNORE_DIRS.includes(item)) {
            await this.scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          await this.scanFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dir}:`, error);
    }
  }

  async scanFile(filePath: string): Promise<void> {
    const ext = extname(filePath);
    if (!SCAN_EXTENSIONS.includes(ext)) return;

    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      this.scannedFiles++;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Check for credential patterns
        for (const pattern of CREDENTIAL_PATTERNS) {
          if (pattern.test(line)) {
            this.addIssue(
              filePath,
              lineNumber,
              pattern.source,
              'CRITICAL',
              'Hardcoded credential detected',
              'Move to environment variable'
            );
          }
        }

        // Check for weak patterns
        for (const pattern of WEAK_PATTERNS) {
          if (pattern.test(line)) {
            this.addIssue(
              filePath,
              lineNumber,
              pattern.source,
              'HIGH',
              'Weak credential pattern detected',
              'Use strong, unique credentials'
            );
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan file ${filePath}:`, error);
    }
  }

  private addIssue(
    file: string,
    line: number,
    pattern: string,
    severity: SecurityIssue['severity'],
    description: string,
    suggestion: string
  ): void {
    this.issues.push({
      file,
      line,
      pattern,
      severity,
      description,
      suggestion,
    });
  }

  generateReport(): SecurityReport {
    const summary = {
      total: this.issues.length,
      critical: this.issues.filter((i) => i.severity === 'CRITICAL').length,
      high: this.issues.filter((i) => i.severity === 'HIGH').length,
      medium: this.issues.filter((i) => i.severity === 'MEDIUM').length,
      low: this.issues.filter((i) => i.severity === 'LOW').length,
    };

    const recommendations = this.generateRecommendations(summary);

    return {
      issues: this.issues,
      summary,
      environment: validateSecurityConfiguration(),
      recommendations,
    };
  }

  private generateRecommendations(
    summary: SecurityReport['summary']
  ): string[] {
    const recommendations: string[] = [];

    if (summary.critical > 0) {
      recommendations.push(
        '🚨 IMMEDIATE ACTION REQUIRED: Remove all hardcoded credentials'
      );
      recommendations.push(
        '🔐 Move all sensitive data to environment variables'
      );
    }

    if (summary.high > 0) {
      recommendations.push(
        '⚠️ Replace weak credential patterns with secure alternatives'
      );
    }

    if (summary.total > 0) {
      recommendations.push('📋 Review all security issues before deployment');
      recommendations.push('🔍 Run security scan after each credential change');
    }

    return recommendations;
  }

  getScannedFilesCount(): number {
    return this.scannedFiles;
  }
}

async function main(): Promise<void> {
  console.log('🔐 Cliniio Security Scanner');
  console.log('============================\n');

  const scanner = new SecurityScanner();

  // Scan source code
  console.log('📁 Scanning source code for security issues...');
  await scanner.scanDirectory('./src');
  await scanner.scanDirectory('./supabase');

  // Generate report
  const report = scanner.generateReport();

  // Display results
  console.log(`\n📊 Security Scan Results`);
  console.log(`========================`);
  console.log(`Files scanned: ${scanner.getScannedFilesCount()}`);
  console.log(`Total issues: ${report.summary.total}`);
  console.log(`Critical: ${report.summary.critical} 🚨`);
  console.log(`High: ${report.summary.high} ⚠️`);
  console.log(`Medium: ${report.summary.medium} 🔶`);
  console.log(`Low: ${report.summary.low} 🔵`);

  // Display environment configuration
  console.log(`\n🌍 Environment Configuration`);
  console.log(`===========================`);
  console.log(`Valid: ${report.environment.isValid ? '✅ Yes' : '❌ No'}`);
  console.log(
    `Configured: ${report.environment.present.length}/${report.environment.present.length + report.environment.missing.length}`
  );

  if (report.environment.missing.length > 0) {
    console.log(`\nMissing variables:`);
    report.environment.missing.forEach((key) => console.log(`  ❌ ${key}`));
  }

  // Display critical issues
  if (report.summary.critical > 0) {
    console.log(`\n🚨 CRITICAL ISSUES (IMMEDIATE ACTION REQUIRED)`);
    console.log(`=============================================`);
    report.issues
      .filter((i) => i.severity === 'CRITICAL')
      .forEach((issue) => {
        console.log(`\nFile: ${issue.file}:${issue.line}`);
        console.log(`Issue: ${issue.description}`);
        console.log(`Suggestion: ${issue.suggestion}`);
      });
  }

  // Display recommendations
  if (report.recommendations.length > 0) {
    console.log(`\n💡 Recommendations`);
    console.log(`==================`);
    report.recommendations.forEach((rec) => console.log(`• ${rec}`));
  }

  // Exit with appropriate code
  if (report.summary.critical > 0) {
    console.log(`\n❌ Security scan failed - Critical issues found`);
    process.exit(1);
  } else if (report.summary.total > 0) {
    console.log(`\n⚠️ Security scan completed with warnings`);
    process.exit(0);
  } else {
    console.log(`\n✅ Security scan passed - No issues found`);
    process.exit(0);
  }
}

// Run the scanner
main().catch((error) => {
  console.error('❌ Security scan failed:', error);
  process.exit(1);
});
