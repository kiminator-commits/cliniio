// Security testing configuration
export interface SecurityTestConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  penetration: PenetrationTestConfig;
  vulnerability: VulnerabilityScanConfig;
  validation: SecurityValidationConfig;
  monitoring: SecurityMonitoringConfig;
}

export interface PenetrationTestConfig {
  enabled: boolean;
  threads: number;
  delay: number;
  maxAttempts: number;
  testTimeout: number;
  retryAttempts: number;
}

export interface VulnerabilityScanConfig {
  enabled: boolean;
  depth: 'shallow' | 'deep' | 'comprehensive';
  threads: number;
  timeout: number;
  includeInfo: boolean;
  customRules: boolean;
}

export interface SecurityValidationConfig {
  enabled: boolean;
  rules: 'all' | 'critical' | 'high' | 'custom';
  threshold: number;
  timeout: number;
  parallel: boolean;
}

export interface SecurityMonitoringConfig {
  enabled: boolean;
  interval: number;
  alerts: boolean;
  webhooks: string[];
  email: string[];
  slack: string[];
}

export const securityTestConfig: SecurityTestConfig = {
  baseUrl: process.env.SECURITY_TEST_BASE_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.SECURITY_TEST_TIMEOUT || '30000'),
  retries: parseInt(process.env.SECURITY_TEST_RETRIES || '3'),

  penetration: {
    enabled: process.env.PENETRATION_TEST_ENABLED === 'true',
    threads: parseInt(process.env.PENETRATION_TEST_THREADS || '10'),
    delay: parseInt(process.env.PENETRATION_TEST_DELAY || '1000'),
    maxAttempts: parseInt(process.env.PENETRATION_TEST_MAX_ATTEMPTS || '20'),
    testTimeout: parseInt(process.env.PENETRATION_TEST_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.PENETRATION_TEST_RETRIES || '3'),
  },

  vulnerability: {
    enabled: process.env.VULNERABILITY_SCAN_ENABLED === 'true',
    depth:
      (process.env.VULNERABILITY_SCAN_DEPTH as
        | 'shallow'
        | 'deep'
        | 'comprehensive') || 'deep',
    threads: parseInt(process.env.VULNERABILITY_SCAN_THREADS || '5'),
    timeout: parseInt(process.env.VULNERABILITY_SCAN_TIMEOUT || '60000'),
    includeInfo: process.env.VULNERABILITY_SCAN_INCLUDE_INFO === 'true',
    customRules: process.env.VULNERABILITY_SCAN_CUSTOM_RULES === 'true',
  },

  validation: {
    enabled: process.env.SECURITY_VALIDATION_ENABLED === 'true',
    rules:
      (process.env.SECURITY_VALIDATION_RULES as
        | 'all'
        | 'critical'
        | 'high'
        | 'custom') || 'all',
    threshold: parseInt(process.env.SECURITY_VALIDATION_THRESHOLD || '75'),
    timeout: parseInt(process.env.SECURITY_VALIDATION_TIMEOUT || '30000'),
    parallel: process.env.SECURITY_VALIDATION_PARALLEL === 'true',
  },

  monitoring: {
    enabled: process.env.SECURITY_MONITORING_ENABLED === 'true',
    interval: parseInt(process.env.SECURITY_MONITORING_INTERVAL || '300000'), // 5 minutes
    alerts: process.env.SECURITY_MONITORING_ALERTS === 'true',
    webhooks: process.env.SECURITY_MONITORING_WEBHOOKS?.split(',') || [],
    email: process.env.SECURITY_MONITORING_EMAIL?.split(',') || [],
    slack: process.env.SECURITY_MONITORING_SLACK?.split(',') || [],
  },
};

// Alert configuration
export interface AlertConfig {
  critical: AlertLevelConfig;
  high: AlertLevelConfig;
  medium: AlertLevelConfig;
  low: AlertLevelConfig;
}

export interface AlertLevelConfig {
  enabled: boolean;
  channels: string[];
  threshold: number;
  cooldown: number;
}

export const alertConfig: AlertConfig = {
  critical: {
    enabled: true,
    channels: ['email', 'slack', 'webhook'],
    threshold: 0, // Alert on any critical issues
    cooldown: 0, // No cooldown for critical issues
  },
  high: {
    enabled: true,
    channels: ['email', 'slack'],
    threshold: 3, // Alert on 3+ high issues
    cooldown: 300000, // 5 minutes cooldown
  },
  medium: {
    enabled: false,
    channels: ['email'],
    threshold: 10, // Alert on 10+ medium issues
    cooldown: 1800000, // 30 minutes cooldown
  },
  low: {
    enabled: false,
    channels: ['email'],
    threshold: 20, // Alert on 20+ low issues
    cooldown: 3600000, // 1 hour cooldown
  },
};

// Test data configuration
export interface TestDataConfig {
  validCredentials: {
    email: string;
    password: string;
  };
  invalidCredentials: {
    email: string;
    password: string;
  };
  adminCredentials: {
    email: string;
    password: string;
  };
  testUsers: Array<{
    email: string;
    password: string;
    role: string;
  }>;
}

export const testDataConfig: TestDataConfig = {
  validCredentials: {
    email: process.env.TEST_VALID_EMAIL || 'test@example.com',
    password: process.env.TEST_VALID_PASSWORD || 'TestPassword123!',
  },
  invalidCredentials: {
    email: process.env.TEST_INVALID_EMAIL || 'invalid@example.com',
    password: process.env.TEST_INVALID_PASSWORD || 'WrongPassword123!',
  },
  adminCredentials: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!',
  },
  testUsers: [
    {
      email: 'user1@example.com',
      password: 'User1Password123!',
      role: 'user',
    },
    {
      email: 'user2@example.com',
      password: 'User2Password123!',
      role: 'user',
    },
    {
      email: 'moderator@example.com',
      password: 'ModeratorPassword123!',
      role: 'moderator',
    },
  ],
};

// Performance configuration
export interface PerformanceConfig {
  maxConcurrentTests: number;
  testTimeout: number;
  retryDelay: number;
  maxRetries: number;
  memoryLimit: string;
  cpuLimit: string;
}

export const performanceConfig: PerformanceConfig = {
  maxConcurrentTests: parseInt(process.env.MAX_CONCURRENT_TESTS || '10'),
  testTimeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  retryDelay: parseInt(process.env.RETRY_DELAY || '1000'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  memoryLimit: process.env.MEMORY_LIMIT || '512m',
  cpuLimit: process.env.CPU_LIMIT || '1',
};

// Reporting configuration
export interface ReportingConfig {
  format: 'json' | 'html' | 'pdf' | 'xml';
  outputDir: string;
  includeEvidence: boolean;
  includeRecommendations: boolean;
  includeCharts: boolean;
  template: string;
}

export const reportingConfig: ReportingConfig = {
  format:
    (process.env.REPORT_FORMAT as 'json' | 'html' | 'pdf' | 'xml') || 'html',
  outputDir: process.env.REPORT_OUTPUT_DIR || './reports',
  includeEvidence: process.env.REPORT_INCLUDE_EVIDENCE === 'true',
  includeRecommendations: process.env.REPORT_INCLUDE_RECOMMENDATIONS === 'true',
  includeCharts: process.env.REPORT_INCLUDE_CHARTS === 'true',
  template: process.env.REPORT_TEMPLATE || 'default',
};

// Validation rules configuration
export interface ValidationRulesConfig {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxLength: number;
  };
  accountLockout: {
    maxAttempts: number;
    lockoutDuration: number;
    progressiveLockout: boolean;
  };
  sessionManagement: {
    timeout: number;
    secureTokens: boolean;
    secureCookies: boolean;
    sessionInvalidation: boolean;
  };
  rateLimiting: {
    ipLimit: number;
    userLimit: number;
    windowSize: number;
    progressiveDelays: boolean;
  };
}

export const validationRulesConfig: ValidationRulesConfig = {
  passwordPolicy: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === 'true',
    maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '128'),
  },
  accountLockout: {
    maxAttempts: parseInt(process.env.ACCOUNT_LOCKOUT_MAX_ATTEMPTS || '5'),
    lockoutDuration: parseInt(process.env.ACCOUNT_LOCKOUT_DURATION || '30'),
    progressiveLockout: process.env.ACCOUNT_LOCKOUT_PROGRESSIVE === 'true',
  },
  sessionManagement: {
    timeout: parseInt(process.env.SESSION_TIMEOUT || '30'),
    secureTokens: process.env.SESSION_SECURE_TOKENS === 'true',
    secureCookies: process.env.SESSION_SECURE_COOKIES === 'true',
    sessionInvalidation: process.env.SESSION_INVALIDATION === 'true',
  },
  rateLimiting: {
    ipLimit: parseInt(process.env.RATE_LIMIT_IP || '10'),
    userLimit: parseInt(process.env.RATE_LIMIT_USER || '5'),
    windowSize: parseInt(process.env.RATE_LIMIT_WINDOW || '15'),
    progressiveDelays: process.env.RATE_LIMIT_PROGRESSIVE === 'true',
  },
};

// Export all configurations
export {
  securityTestConfig,
  alertConfig,
  testDataConfig,
  performanceConfig,
  reportingConfig,
  validationRulesConfig,
};
