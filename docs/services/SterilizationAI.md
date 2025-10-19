# Sterilization AI Service - Modular Architecture

This directory contains the refactored, modular version of the sterilization AI service that was previously a single 1,523-line file.

## 🏗️ Architecture Overview

The service has been broken down into focused, maintainable modules:

```
sterilization/
├── types.ts                    # All interfaces and data structures
├── settingsManager.ts          # AI settings and configuration management
├── visionServices.ts           # Google Vision, Azure Vision, image processing
├── openaiService.ts            # ChatGPT-4 integration and response parsing
├── analysisServices.ts         # Tool condition, barcode, tool type analysis
├── optimizationServices.ts     # Cycle optimization and workflow suggestions
├── analyticsServices.ts        # Predictive analytics and trend analysis
├── complianceServices.ts       # Compliance monitoring and BI validation
├── sterilizationAIService.ts   # Main orchestrator service
└── index.ts                    # Export aggregator
```

## 🚀 Usage

### Basic Usage (Recommended)

```typescript
import { SterilizationAIService } from '@/services/ai/sterilizationAIService';

const aiService = new SterilizationAIService('facility-123');
await aiService.initialize();

// Analyze tool condition
const assessment = await aiService.analyzeToolCondition('tool-456', imageFile);

// Get cycle optimization
const optimization = await aiService.getCycleOptimization('cycle-789');

// Get predictive analytics
const analytics = await aiService.getPredictiveAnalytics();
```

### Advanced Usage (Direct Service Access)

```typescript
import {
  AnalysisServices,
  VisionServices,
} from '@/services/ai/sterilizationAIService';

const analysisService = new AnalysisServices('facility-123');
const visionService = new VisionServices();

// Direct service usage
const result = await analysisService.analyzeToolCondition(
  'tool-456',
  imageFile
);
```

## 🔧 Key Features

### 1. **Analysis Services**

- Tool condition assessment with computer vision
- Barcode quality detection
- Tool type recognition
- Problem detection and risk assessment

### 2. **Optimization Services**

- Cycle optimization using historical data
- Intelligent workflow suggestions
- Parameter recommendations

### 3. **Analytics Services**

- Predictive analytics for equipment maintenance
- Real-time insights generation
- Historical trend analysis

### 4. **Compliance Services**

- Compliance monitoring for sterilization cycles
- Biological indicator validation
- Regulatory updates tracking

### 5. **Vision Services**

- Barcode analysis and quality assessment
- Text-based tool analysis using OpenAI

### 6. **OpenAI Services**

- ChatGPT-4 integration for text analysis
- Response parsing and recommendations
- Connection testing

## 📊 Data Flow

```
Image/Data Input → Vision Services → OpenAI Analysis → Service Processing → Database Storage
     ↓
Settings Manager → Feature Flags → Service Execution → Results & Insights
```

## 🔐 Configuration

The service requires proper configuration of API keys and settings:

```typescript
// Required environment variables
VITE_OPENAI_API_KEY =
  your_openai_api_key_here -
  // Required database tables
  sterilization_ai_settings -
  sterilization_ai_tool_assessments -
  sterilization_ai_cycle_optimizations -
  sterilization_ai_workflow_suggestions;
```

## 🧪 Testing

Each module can be tested independently:

```typescript
import { AnalysisServices } from './analysisServices';

describe('AnalysisServices', () => {
  let service: AnalysisServices;

  beforeEach(() => {
    service = new AnalysisServices('test-facility');
  });

  test('should analyze tool condition', async () => {
    // Test implementation
  });
});
```

## 📈 Benefits of Refactoring

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Individual services can be unit tested
3. **Reusability**: Services can be used independently
4. **Readability**: Code is easier to understand and navigate
5. **Scalability**: New features can be added as separate modules
6. **Debugging**: Issues can be isolated to specific modules

## 🔄 Migration from Old Service

The old monolithic service has been replaced with this modular structure. All existing functionality is preserved, but now organized into logical, focused modules.

**Old import:**

```typescript
import { SterilizationAIService } from '@/services/ai/sterilizationAIService';
```

**New import (same interface):**

```typescript
import { SterilizationAIService } from '@/services/ai/sterilizationAIService';
```

The public API remains unchanged, ensuring backward compatibility.
