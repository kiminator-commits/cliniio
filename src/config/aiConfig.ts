// AI Service Configuration
export const aiConfig = {
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.3,
    baseURL: 'https://api.openai.com/v1',
  },

  // Google Vision Configuration
  googleVision: {
    apiKey: import.meta.env.VITE_GOOGLE_VISION_API_KEY || '',
    baseURL: 'https://vision.googleapis.com/v1',
  },

  // Azure Vision Configuration
  azureVision: {
    apiKey: import.meta.env.VITE_AZURE_VISION_API_KEY || '',
    endpoint: import.meta.env.VITE_AZURE_VISION_ENDPOINT || '',
  },

  // AI Model Configuration
  models: {
    // Computer Vision Models
    toolConditionAssessment: {
      provider: 'openai', // 'openai', 'custom'
      modelName: 'medical-instrument-analysis-v1',
      confidenceThreshold: 0.85,
      maxProcessingTime: 10000, // ms
    },

    // Predictive Analytics Models
    cycleOptimization: {
      provider: 'openai',
      modelName: 'sterilization-cycle-optimizer-v1',
      confidenceThreshold: 0.8,
      maxProcessingTime: 15000,
    },

    // Workflow Suggestion Models
    workflowSuggestion: {
      provider: 'openai',
      modelName: 'sterilization-workflow-advisor-v1',
      confidenceThreshold: 0.9,
      maxProcessingTime: 8000,
    },
  },

  // Processing Configuration
  processing: {
    // Real-time processing settings
    realTime: {
      enabled: true,
      maxConcurrentRequests: 5,
      requestTimeout: 30000, // ms
      retryAttempts: 3,
      retryDelay: 1000, // ms
    },

    // Batch processing settings
    batch: {
      enabled: true,
      batchSize: 50,
      maxBatchProcessingTime: 300000, // 5 minutes
      parallelProcessing: true,
      maxParallelBatches: 3,
    },
  },

  // Security Configuration
  security: {
    // API key encryption
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2',
      saltRounds: 10000,
    },

    // Data privacy
    privacy: {
      dataRetentionDays: 90,
      anonymizePersonalData: true,
      encryptSensitiveData: true,
      auditLogging: true,
    },
  },

  // Performance Configuration
  performance: {
    // Caching settings
    caching: {
      enabled: true,
      cacheSize: 1000,
      ttl: 3600000, // 1 hour
      maxAge: 86400000, // 24 hours
    },

    // Rate limiting
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      burstLimit: 10,
    },
  },

  // Monitoring Configuration
  monitoring: {
    // Performance metrics
    metrics: {
      enabled: true,
      collectionInterval: 60000, // 1 minute
      retentionPeriod: 2592000000, // 30 days
    },

    // Error tracking
    errorTracking: {
      enabled: true,
      logLevel: 'error',
      maxErrorLogSize: 1000,
      errorReporting: true,
    },

    // Usage analytics
    usageAnalytics: {
      enabled: true,
      trackApiCalls: true,
      trackProcessingTime: true,
      trackAccuracy: true,
      trackCosts: true,
    },
  },

  // Development Configuration
  development: {
    // Debug mode
    debug: process.env.NODE_ENV === 'development',

    // Mock services for development
    mockServices: process.env.NODE_ENV === 'development',

    // Logging level
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',

    // Test data
    testData: {
      enabled: process.env.NODE_ENV === 'development',
      sampleImages: true,
      sampleAnalytics: true,
    },
  },
};

// AI Service Endpoints
export const aiEndpoints = {
  // OpenAI endpoints
  openai: {
    chat: `${aiConfig.openai.baseURL}/chat/completions`,
    models: `${aiConfig.openai.baseURL}/models`,
    embeddings: `${aiConfig.openai.baseURL}/embeddings`,
  },

  // Google Vision endpoints
  googleVision: {
    analyze: `${aiConfig.googleVision.baseURL}/images:annotate`,
    asyncBatch: `${aiConfig.googleVision.baseURL}/images:asyncBatchAnnotate`,
  },

  // Azure Vision endpoints
  azureVision: {
    analyze: `${aiConfig.azureVision.endpoint}/vision/v3.2/analyze`,
    describe: `${aiConfig.azureVision.endpoint}/vision/v3.2/describe`,
    tag: `${aiConfig.azureVision.endpoint}/vision/v3.2/tag`,
    objects: `${aiConfig.azureVision.endpoint}/vision/v3.2/read/analyze`,
  },
};

// AI Feature Flags
export const aiFeatureFlags = {
  // Computer Vision Features
  computerVision: {
    toolConditionAssessment: true,
    barcodeQualityDetection: true,
    toolTypeRecognition: true,
    cleaningValidation: true,
    damageDetection: true,
    wearAnalysis: true,
  },

  // Predictive Analytics Features
  predictiveAnalytics: {
    cycleOptimization: true,
    failurePrediction: true,
    efficiencyOptimization: true,
    resourcePlanning: true,
    maintenancePrediction: true,
    qualityPrediction: true,
  },

  // Smart Workflow Features
  smartWorkflow: {
    intelligentWorkflowSelection: true,
    automatedProblemDetection: true,
    smartPhaseTransitions: true,
    batchOptimization: true,
    toolGrouping: true,
    cycleScheduling: true,
  },

  // Quality Assurance Features
  qualityAssurance: {
    biologicalIndicatorAnalysis: true,
    complianceMonitoring: true,
    auditTrailEnhancement: true,
    riskAssessment: true,
    qualityMetrics: true,
    regulatoryCompliance: true,
  },

  // Real-time Monitoring Features
  realTimeMonitoring: {
    anomalyDetection: true,
    predictiveMaintenance: true,
    qualityDriftDetection: true,
    smartNotifications: true,
    performanceMonitoring: true,
    alertManagement: true,
  },
};

// AI Model Performance Thresholds
export const aiPerformanceThresholds = {
  // Accuracy thresholds
  accuracy: {
    excellent: 0.95,
    good: 0.85,
    acceptable: 0.75,
    poor: 0.65,
  },

  // Processing time thresholds (ms)
  processingTime: {
    excellent: 1000,
    good: 3000,
    acceptable: 5000,
    poor: 10000,
  },

  // Confidence thresholds
  confidence: {
    high: 0.9,
    medium: 0.75,
    low: 0.6,
  },

  // Cost thresholds (per API call)
  cost: {
    low: 0.001,
    medium: 0.01,
    high: 0.1,
  },
};

// AI Service Health Check Configuration
export const aiHealthCheck = {
  // Health check intervals
  intervals: {
    apiHealth: 300000, // 5 minutes
    modelPerformance: 3600000, // 1 hour
    systemResources: 60000, // 1 minute
  },

  // Health check timeouts
  timeouts: {
    apiResponse: 10000, // 10 seconds
    modelInference: 30000, // 30 seconds
    databaseQuery: 5000, // 5 seconds
  },

  // Health check thresholds
  thresholds: {
    maxErrorRate: 0.05, // 5%
    maxResponseTime: 10000, // 10 seconds
    minSuccessRate: 0.95, // 95%
  },
};

export default aiConfig;
