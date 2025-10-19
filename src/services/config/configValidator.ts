/**
 * Configuration Validation Service
 * Validates environment configuration and prevents secret leakage
 */

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RequiredConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  ai: {
    openaiApiKey: string;
  };
  optional?: {
    googleVisionApiKey?: string;
    azureVisionApiKey?: string;
    azureVisionEndpoint?: string;
  };
}

export class ConfigValidator {
  private static instance: ConfigValidator;

  private constructor() {}

  static getInstance(): ConfigValidator {
    if (!ConfigValidator.instance) {
      ConfigValidator.instance = new ConfigValidator();
    }
    return ConfigValidator.instance;
  }

  /**
   * Validate all required configuration
   */
  validateConfiguration(): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required environment variables
    const requiredVars = {
      'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
      'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'VITE_OPENAI_API_KEY': import.meta.env.VITE_OPENAI_API_KEY
    };

    for (const [varName, value] of Object.entries(requiredVars)) {
      if (!value) {
        errors.push(`Missing required environment variable: ${varName}`);
      } else if (this.containsSecrets(value)) {
        warnings.push(`Potential secret in environment variable: ${varName}`);
      }
    }

    // Check optional variables
    const optionalVars = {
      'VITE_GOOGLE_VISION_API_KEY': import.meta.env.VITE_GOOGLE_VISION_API_KEY,
      'VITE_AZURE_VISION_API_KEY': import.meta.env.VITE_AZURE_VISION_API_KEY,
      'VITE_AZURE_VISION_ENDPOINT': import.meta.env.VITE_AZURE_VISION_ENDPOINT
    };

    for (const [varName, value] of Object.entries(optionalVars)) {
      if (value && this.containsSecrets(value)) {
        warnings.push(`Potential secret in optional environment variable: ${varName}`);
      }
    }

    // Validate Supabase URL format
    if (requiredVars['VITE_SUPABASE_URL'] && !this.isValidSupabaseUrl(requiredVars['VITE_SUPABASE_URL'])) {
      errors.push('Invalid Supabase URL format');
    }

    // Validate OpenAI API key format
    if (requiredVars['VITE_OPENAI_API_KEY'] && !this.isValidOpenAIKey(requiredVars['VITE_OPENAI_API_KEY'])) {
      errors.push('Invalid OpenAI API key format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if a value contains potential secrets
   */
  private containsSecrets(value: string): boolean {
    const secretPatterns = [
      /sk-[a-zA-Z0-9]{20,}/, // OpenAI API keys
      /Bearer [a-zA-Z0-9._-]+/, // Bearer tokens
      /password/i, // Password fields
      /secret/i, // Secret fields
      /token/i, // Token fields
      /key/i // Key fields
    ];

    return secretPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Validate Supabase URL format
   */
  private isValidSupabaseUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && urlObj.hostname.includes('supabase');
    } catch {
      return false;
    }
  }

  /**
   * Validate OpenAI API key format
   */
  private isValidOpenAIKey(key: string): boolean {
    return /^sk-[a-zA-Z0-9]{48,}$/.test(key);
  }

  /**
   * Get sanitized configuration for logging
   */
  getSanitizedConfig(): Record<string, string> {
    const config: Record<string, string> = {};
    
    const envVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_OPENAI_API_KEY',
      'VITE_GOOGLE_VISION_API_KEY',
      'VITE_AZURE_VISION_API_KEY',
      'VITE_AZURE_VISION_ENDPOINT'
    ];

    for (const varName of envVars) {
      const value = import.meta.env[varName];
      if (value) {
        config[varName] = this.sanitizeValue(varName, value);
      }
    }

    return config;
  }

  /**
   * Sanitize a configuration value for logging
   */
  private sanitizeValue(key: string, value: string): string {
    const lowerKey = key.toLowerCase();
    
    // Sanitize sensitive values
    if (lowerKey.includes('key') || lowerKey.includes('token') || lowerKey.includes('secret')) {
      return '[REDACTED]';
    }
    
    // Sanitize URLs but keep domain
    if (lowerKey.includes('url') || lowerKey.includes('endpoint')) {
      try {
        const url = new URL(value);
        return `${url.protocol}//${url.hostname}${url.pathname}`;
      } catch {
        return '[REDACTED]';
      }
    }
    
    return value;
  }

  /**
   * Validate configuration on startup
   */
  static validateOnStartup(): void {
    const validator = ConfigValidator.getInstance();
    const result = validator.validateConfiguration();
    
    if (!result.isValid) {
      throw new Error(`Configuration validation failed: ${result.errors.join(', ')}`);
    }
    
    if (result.warnings.length > 0) {
      console.warn('Configuration warnings:', result.warnings);
    }
  }
}

// Export singleton instance
export const configValidator = ConfigValidator.getInstance();

// Validate configuration on import
ConfigValidator.validateOnStartup();
