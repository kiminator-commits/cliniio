#!/usr/bin/env ts-node

/**
 * TypeScript Strict Mode Compliance Checker
 *
 * This script checks the inventory system for strict mode compliance
 * and reports any violations that need to be fixed.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComplianceIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'error' | 'warning' | 'info';
}

class StrictModeChecker {
  private issues: ComplianceIssue[] = [];
  private inventoryFiles: string[] = [];

  constructor() {
    this.findInventoryFiles();
  }

  private findInventoryFiles(): void {
    const srcDir = path.join(process.cwd(), 'src');
    this.scanDirectory(srcDir);
  }

  private scanDirectory(dir: string): void {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        // Check if it's an inventory-related file
        if (this.isInventoryFile(fullPath)) {
          this.inventoryFiles.push(fullPath);
        }
      }
    }
  }

  private isInventoryFile(filePath: string): boolean {
    const inventoryKeywords = [
      'inventory',
      'Inventory',
      'store',
      'Store',
      'types',
      'hooks',
      'components',
    ];

    return inventoryKeywords.some((keyword) => filePath.includes(keyword));
  }

  public checkStrictModeCompliance(): void {
    console.log('🔍 Checking TypeScript strict mode compliance...\n');

    for (const file of this.inventoryFiles) {
      this.checkFile(file);
    }

    this.reportIssues();
  }

  private checkFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Check for common strict mode violations
        this.checkLine(filePath, lineNumber, line);
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }

  private checkLine(filePath: string, lineNumber: number, line: string): void {
    const trimmedLine = line.trim();

    // Check for implicit any
    if (trimmedLine.includes(': any') || trimmedLine.includes('as any')) {
      this.addIssue(filePath, lineNumber, 'Explicit any type usage', 'error');
    }

    // Check for optional chaining without null checks
    if (trimmedLine.includes('?.') && !trimmedLine.includes('??')) {
      this.addIssue(
        filePath,
        lineNumber,
        'Optional chaining without null coalescing',
        'warning'
      );
    }

    // Check for non-null assertion operator
    if (trimmedLine.includes('!.')) {
      this.addIssue(
        filePath,
        lineNumber,
        'Non-null assertion operator usage',
        'warning'
      );
    }

    // Check for type assertions
    if (trimmedLine.includes('as ') && !trimmedLine.includes('as const')) {
      this.addIssue(filePath, lineNumber, 'Type assertion usage', 'warning');
    }

    // Check for undefined checks
    if (trimmedLine.includes('undefined') && !trimmedLine.includes('null')) {
      this.addIssue(
        filePath,
        lineNumber,
        'Undefined check without null check',
        'info'
      );
    }

    // Check for optional properties
    if (trimmedLine.includes('?:') && !trimmedLine.includes('| null')) {
      this.addIssue(
        filePath,
        lineNumber,
        'Optional property without null union type',
        'warning'
      );
    }
  }

  private addIssue(
    filePath: string,
    lineNumber: number,
    issue: string,
    severity: ComplianceIssue['severity']
  ): void {
    this.issues.push({
      file: path.relative(process.cwd(), filePath),
      line: lineNumber,
      issue,
      severity,
    });
  }

  private reportIssues(): void {
    if (this.issues.length === 0) {
      console.log('✅ No strict mode compliance issues found!');
      return;
    }

    console.log(`📊 Found ${this.issues.length} compliance issues:\n`);

    const errors = this.issues.filter((i) => i.severity === 'error');
    const warnings = this.issues.filter((i) => i.severity === 'warning');
    const infos = this.issues.filter((i) => i.severity === 'info');

    if (errors.length > 0) {
      console.log('❌ Errors:');
      errors.forEach((issue) => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
      });
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️  Warnings:');
      warnings.forEach((issue) => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
      });
      console.log('');
    }

    if (infos.length > 0) {
      console.log('ℹ️  Info:');
      infos.forEach((issue) => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
      });
      console.log('');
    }

    console.log(
      `📈 Summary: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info`
    );

    if (errors.length > 0) {
      process.exit(1);
    }
  }
}

// Run the checker
const checker = new StrictModeChecker();
checker.checkStrictModeCompliance();
