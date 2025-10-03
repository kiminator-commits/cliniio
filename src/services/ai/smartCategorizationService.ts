import { InventoryAIService } from './inventoryAIService';

export interface CategorizationSuggestion {
  category: string;
  subcategory?: string;
  tags: string[];
  confidence: number;
  reasoning: string;
}

export interface SmartFormFill {
  suggestedName?: string;
  suggestedDescription?: string;
  suggestedCategory?: string;
  suggestedSubcategory?: string;
  suggestedTags?: string[];
  suggestedLocation?: string;
  suggestedSupplier?: string;
  confidence: number;
}

export class SmartCategorizationService {
  private aiService: InventoryAIService;

  constructor(facilityId: string) {
    this.aiService = new InventoryAIService(facilityId);
  }

  /**
   * Get smart categorization suggestions for an item
   */
  async getCategorizationSuggestions(
    itemName: string,
    description?: string
  ): Promise<CategorizationSuggestion[]> {
    try {
      // Get AI categorization
      const aiCategorization = await this.aiService.categorizeItem(
        itemName,
        'text'
      );

      // Generate additional suggestions based on patterns
      const patternSuggestions = this.generatePatternBasedSuggestions(
        itemName,
        description
      );

      // Combine and rank suggestions
      const allSuggestions = [
        {
          ...aiCategorization,
          reasoning:
            'AI-powered categorization based on item name and description',
        },
        ...patternSuggestions,
      ];

      // Sort by confidence and ensure proper typing
      return allSuggestions
        .filter(
          (suggestion): suggestion is CategorizationSuggestion =>
            'confidence' in suggestion &&
            typeof suggestion.confidence === 'number'
        )
        .sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Smart categorization failed:', error);
      // Fallback to pattern-based suggestions
      return this.generatePatternBasedSuggestions(itemName, description);
    }
  }

  /**
   * Get smart form fill suggestions
   */
  async getSmartFormFill(
    partialData: Partial<{
      name: string;
      description: string;
      category: string;
      imageFile?: File;
    }>
  ): Promise<SmartFormFill> {
    try {
      const suggestions: SmartFormFill = { confidence: 0 };

      // If we have an image, analyze it first
      if (partialData.imageFile) {
        const imageAnalysis = await this.aiService.analyzeImage(
          partialData.imageFile
        );
        if (imageAnalysis) {
          suggestions.suggestedTags =
            (imageAnalysis as unknown as { suggestions?: string[] })
              .suggestions || [];
          suggestions.confidence = Math.max(
            suggestions.confidence,
            (imageAnalysis as unknown as { confidence?: number }).confidence ||
              0
          );
        }
      }

      // Generate name suggestions if not provided
      if (!partialData.name && partialData.description) {
        suggestions.suggestedName = this.generateNameFromDescription(
          partialData.description
        );
      }

      // Generate description suggestions if not provided
      if (!partialData.description && partialData.name) {
        suggestions.suggestedDescription = this.generateDescriptionFromName(
          partialData.name
        );
      }

      // Get categorization suggestions
      if (partialData.name || partialData.description) {
        const categorization = await this.getCategorizationSuggestions(
          partialData.name || '',
          partialData.description
        );

        if (categorization.length > 0) {
          const bestMatch = categorization[0];
          suggestions.suggestedCategory = bestMatch.category;
          suggestions.suggestedSubcategory = bestMatch.subcategory;
          suggestions.suggestedTags = bestMatch.tags;
          suggestions.confidence = Math.max(
            suggestions.confidence,
            bestMatch.confidence
          );
        }
      }

      // Generate location suggestions
      if (partialData.category) {
        suggestions.suggestedLocation = this.suggestLocation(
          partialData.category
        );
      }

      // Generate supplier suggestions
      if (partialData.category) {
        suggestions.suggestedSupplier = this.suggestSupplier(
          partialData.category
        );
      }

      return suggestions;
    } catch (error) {
      console.error('Smart form fill failed:', error);
      return { confidence: 0 };
    }
  }

  /**
   * Validate and suggest improvements for existing item data
   */
  async validateAndSuggest(itemData: {
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    tags: string[];
  }): Promise<{
    isValid: boolean;
    suggestions: string[];
    warnings: string[];
    improvements: Partial<typeof itemData>;
  }> {
    const suggestions: string[] = [];
    const warnings: string[] = [];
    const improvements: Partial<typeof itemData> = {};

    // Validate name
    if (itemData.name.length < 3) {
      warnings.push('Item name is too short');
      suggestions.push(
        'Use a more descriptive name (e.g., "Sterile 4x4 Gauze Pads" instead of "Gauze")'
      );
    }

    // Validate description
    if (!itemData.description || itemData.description.length < 10) {
      warnings.push('Description is too brief');
      suggestions.push(
        'Add more details about specifications, usage, and storage requirements'
      );
    }

    // Validate category
    if (!this.isValidCategory(itemData.category)) {
      warnings.push('Category may not be optimal');
      const betterCategory = await this.aiService.categorizeItem(
        itemData.name,
        'text'
      );
      if (
        betterCategory &&
        (betterCategory as unknown as { confidence?: number }).confidence &&
        (betterCategory as unknown as { confidence?: number }).confidence! > 0.8
      ) {
        improvements.category = (
          betterCategory as unknown as { category?: string }
        ).category;
        improvements.subcategory = (
          betterCategory as unknown as { subcategory?: string }
        ).subcategory;
      }
    }

    // Validate tags
    if (itemData.tags.length < 2) {
      suggestions.push('Add more tags for better searchability');
      const suggestedTags = this.generateTagsFromName(itemData.name);
      improvements.tags = [...itemData.tags, ...suggestedTags];
    }

    // Check for common issues
    if (
      itemData.name.toLowerCase().includes('item') ||
      itemData.name.toLowerCase().includes('product')
    ) {
      warnings.push('Generic item name detected');
      suggestions.push(
        'Use specific, descriptive names instead of generic terms'
      );
    }

    return {
      isValid: warnings.length === 0,
      suggestions,
      warnings,
      improvements,
    };
  }

  // Private helper methods
  private generatePatternBasedSuggestions(
    itemName: string,
    description?: string
  ): CategorizationSuggestion[] {
    const suggestions: CategorizationSuggestion[] = [];
    const text = `${itemName} ${description || ''}`.toLowerCase();

    // Medical supplies patterns
    if (
      text.includes('gauze') ||
      text.includes('bandage') ||
      text.includes('tape')
    ) {
      suggestions.push({
        category: 'supplies',
        subcategory: 'wound_care',
        tags: ['medical', 'disposable', 'wound_care', 'first_aid'],
        confidence: 0.9,
        reasoning: 'Pattern match: wound care supplies',
      });
    }

    // Surgical instruments patterns
    if (
      text.includes('scalpel') ||
      text.includes('forceps') ||
      text.includes('clamp')
    ) {
      suggestions.push({
        category: 'tools',
        subcategory: 'surgical',
        tags: ['medical', 'reusable', 'surgical', 'sterilizable'],
        confidence: 0.9,
        reasoning: 'Pattern match: surgical instruments',
      });
    }

    // Office equipment patterns
    if (
      text.includes('computer') ||
      text.includes('printer') ||
      text.includes('desk')
    ) {
      suggestions.push({
        category: 'hardware',
        subcategory: 'office',
        tags: ['office', 'equipment', 'technology', 'non_medical'],
        confidence: 0.8,
        reasoning: 'Pattern match: office equipment',
      });
    }

    // Sterilization equipment patterns
    if (
      text.includes('autoclave') ||
      text.includes('sterilizer') ||
      text.includes('uv')
    ) {
      suggestions.push({
        category: 'equipment',
        subcategory: 'sterilization',
        tags: ['medical', 'equipment', 'sterilization', 'critical'],
        confidence: 0.95,
        reasoning: 'Pattern match: sterilization equipment',
      });
    }

    return suggestions;
  }

  private generateNameFromDescription(description: string): string {
    // Simple heuristic to generate a name from description
    const words = description.split(' ').filter((word) => word.length > 3);
    if (words.length >= 2) {
      return words
        .slice(0, 3)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ');
    }
    return (
      description.substring(0, 30) + (description.length > 30 ? '...' : '')
    );
  }

  private generateDescriptionFromName(name: string): string {
    // Generate a basic description from the item name
    const nameLower = name.toLowerCase();

    if (nameLower.includes('gauze')) {
      return 'Sterile gauze pads for wound care and medical procedures. Available in various sizes for different applications.';
    }

    if (nameLower.includes('scalpel')) {
      return 'Sterilizable surgical scalpel for precise cutting during medical procedures. Includes safety features and ergonomic design.';
    }

    if (nameLower.includes('autoclave')) {
      return 'Medical-grade autoclave for sterilization of medical instruments and equipment. Features temperature and pressure monitoring.';
    }

    return `Medical ${name} for healthcare facility use. Please refer to manufacturer specifications for detailed information.`;
  }

  private suggestLocation(category: string): string {
    const locationMap: Record<string, string> = {
      supplies: 'Storage Room A',
      tools: 'Sterilization Area',
      equipment: 'Equipment Room',
      hardware: 'Office Storage',
      general: 'General Storage',
    };

    return locationMap[category] || 'General Storage';
  }

  private suggestSupplier(category: string): string {
    const supplierMap: Record<string, string> = {
      supplies: 'Medical Supply Co.',
      tools: 'Surgical Instruments Inc.',
      equipment: 'Medical Equipment Corp.',
      hardware: 'Office Supply Plus',
      general: 'General Medical Supply',
    };

    return supplierMap[category] || 'General Medical Supply';
  }

  private generateTagsFromName(name: string): string[] {
    const tags: string[] = [];
    const nameLower = name.toLowerCase();

    // Add category-based tags
    if (nameLower.includes('sterile') || nameLower.includes('sterilization')) {
      tags.push('sterile', 'sterilization');
    }

    if (nameLower.includes('disposable')) {
      tags.push('disposable', 'single_use');
    }

    if (nameLower.includes('reusable')) {
      tags.push('reusable', 'multi_use');
    }

    // Add medical-specific tags
    if (nameLower.includes('medical') || nameLower.includes('surgical')) {
      tags.push('medical', 'clinical');
    }

    return tags;
  }

  private isValidCategory(category: string): boolean {
    const validCategories = [
      'supplies',
      'tools',
      'equipment',
      'hardware',
      'general',
    ];
    return validCategories.includes(category);
  }
}
