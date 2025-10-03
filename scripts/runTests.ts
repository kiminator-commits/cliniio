#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface TestOptions {
  watch?: boolean;
  coverage?: boolean;
  verbose?: boolean;
  pattern?: string;
  file?: string;
  ci?: boolean;
}

class TestRunner {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Run tests with specified options
   */
  async runTests(options: TestOptions = {}) {
    console.log('🧪 Starting test execution...\n');

    try {
      // Check if Jest is available
      if (!this.isJestAvailable()) {
        console.error('❌ Jest is not available. Please install it first:');
        console.error('   npm install --save-dev jest @types/jest');
        return;
      }

      // Build Jest command
      const jestCommand = this.buildJestCommand(options);

      console.log(`📋 Executing: ${jestCommand}\n`);

      // Execute Jest
      execSync(jestCommand, {
        stdio: 'inherit',
        cwd: this.projectRoot,
        env: { ...process.env, NODE_ENV: 'test' },
      });

      console.log('\n✅ Tests completed successfully!');
    } catch (error) {
      console.error('\n❌ Test execution failed:', error);
      process.exit(1);
    }
  }

  /**
   * Check if Jest is available in the project
   */
  private isJestAvailable(): boolean {
    const jestPath = join(this.projectRoot, 'node_modules', '.bin', 'jest');
    const jestConfigPath = join(this.projectRoot, 'jest.config.js');

    return existsSync(jestPath) && existsSync(jestConfigPath);
  }

  /**
   * Build Jest command based on options
   */
  private buildJestCommand(options: TestOptions): string {
    const args: string[] = [];

    // Add Jest executable
    args.push('npx jest');

    // Add watch mode
    if (options.watch) {
      args.push('--watch');
    }

    // Add coverage
    if (options.coverage) {
      args.push('--coverage');
    }

    // Add verbose output
    if (options.verbose) {
      args.push('--verbose');
    }

    // Add CI mode
    if (options.ci) {
      args.push('--ci');
      args.push('--coverage');
      args.push('--watchAll=false');
    }

    // Add test pattern
    if (options.pattern) {
      args.push(`--testNamePattern="${options.pattern}"`);
    }

    // Add specific file
    if (options.file) {
      args.push(options.file);
    }

    return args.join(' ');
  }

  /**
   * Run specific test file
   */
  async runTestFile(filePath: string, options: TestOptions = {}) {
    if (!existsSync(filePath)) {
      console.error(`❌ Test file not found: ${filePath}`);
      return;
    }

    await this.runTests({ ...options, file: filePath });
  }

  /**
   * Run tests matching a pattern
   */
  async runTestsByPattern(pattern: string, options: TestOptions = {}) {
    await this.runTests({ ...options, pattern });
  }

  /**
   * Run tests with coverage
   */
  async runTestsWithCoverage(options: TestOptions = {}) {
    await this.runTests({ ...options, coverage: true });
  }

  /**
   * Run tests in watch mode
   */
  async runTestsInWatchMode(options: TestOptions = {}) {
    await this.runTests({ ...options, watch: true });
  }

  /**
   * Run tests in CI mode
   */
  async runTestsInCIMode(options: TestOptions = {}) {
    await this.runTests({ ...options, ci: true });
  }

  /**
   * Show test help
   */
  showHelp() {
    console.log(`
🧪 Cliniio Test Runner

Usage:
  npm run test:run [options]
  npm run test:watch
  npm run test:coverage
  npm run test:ci

Options:
  --watch, -w          Run tests in watch mode
  --coverage, -c       Generate coverage report
  --verbose, -v        Verbose output
  --pattern, -p        Run tests matching pattern
  --file, -f           Run specific test file
  --ci                 Run tests in CI mode
  --help, -h           Show this help

Examples:
  npm run test:run -- --pattern="Login"
  npm run test:run -- --file="tests/integration/login/login.test.tsx"
  npm run test:run -- --coverage --verbose

Environment Variables:
  NODE_ENV=test        Set test environment
  CI=true              Enable CI mode
    `);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new TestRunner();

  // Parse command line arguments
  const options: TestOptions = {};
  let filePath: string | undefined;
  let pattern: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--coverage':
      case '-c':
        options.coverage = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--ci':
        options.ci = true;
        break;
      case '--file':
      case '-f':
        filePath = args[++i];
        break;
      case '--pattern':
      case '-p':
        pattern = args[++i];
        break;
      case '--help':
      case '-h':
        runner.showHelp();
        return;
      default:
        if (arg.startsWith('-')) {
          console.error(`❌ Unknown option: ${arg}`);
          runner.showHelp();
          process.exit(1);
        } else {
          // Assume it's a file path
          filePath = arg;
        }
    }
  }

  // Execute tests based on options
  if (filePath) {
    await runner.runTestFile(filePath, options);
  } else if (pattern) {
    await runner.runTestsByPattern(pattern, options);
  } else {
    await runner.runTests(options);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export default TestRunner;
