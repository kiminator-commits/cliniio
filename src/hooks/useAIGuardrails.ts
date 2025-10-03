export const useAIGuardrails = () => {
  // AI Guardrails - Check if question is relevant to current context
  const checkQuestionRelevance = (
    question: string,
    context: string
  ): boolean => {
    const questionLower = question.toLowerCase();

    if (context === 'sterilization') {
      const sterilizationKeywords = [
        'sterilization',
        'sterilize',
        'autoclave',
        'bi',
        'biological indicator',
        'csa',
        'z314',
        'steam',
        'cycle',
        'load',
        'packaging',
        'maintenance',
        'cleaning',
        'validation',
        'monitoring',
        'temperature',
        'pressure',
        'exposure',
        'drying',
        'cooling',
        'documentation',
        'traceability',
      ];
      return sterilizationKeywords.some((keyword) =>
        questionLower.includes(keyword)
      );
    }

    if (context === 'inventory') {
      const inventoryKeywords = [
        'inventory',
        'stock',
        'supply',
        'order',
        'purchase',
        'tracking',
        'expiry',
        'lot',
        'serial',
        'barcode',
        'scan',
        'count',
        'reorder',
      ];
      return inventoryKeywords.some((keyword) =>
        questionLower.includes(keyword)
      );
    }

    if (context === 'environmental-clean') {
      const cleaningKeywords = [
        'cleaning',
        'disinfection',
        'environmental',
        'infection control',
        'protocol',
        'procedure',
        'schedule',
        'checklist',
        'compliance',
      ];
      return cleaningKeywords.some((keyword) =>
        questionLower.includes(keyword)
      );
    }

    return true; // Allow general questions on home/general pages
  };

  // Generate redirect message for off-topic questions
  const getRedirectMessage = (context: string, question: string): string => {
    const questionLower = question.toLowerCase();

    if (context === 'sterilization') {
      if (
        questionLower.includes('inventory') ||
        questionLower.includes('stock') ||
        questionLower.includes('supply')
      ) {
        return "That's an inventory question! Please go to the Inventory page or ask your manager for inventory-related help.";
      }
      if (
        questionLower.includes('cleaning') &&
        !questionLower.includes('autoclave') &&
        !questionLower.includes('sterilization')
      ) {
        return 'For general cleaning questions, try the Environmental Clean page or ask your manager.';
      }
      if (
        questionLower.includes('password') ||
        questionLower.includes('login') ||
        questionLower.includes('system')
      ) {
        return 'For system access issues, try Cliniio Help or contact your manager.';
      }
      return "That question isn't related to sterilization. Try the Relevant Information section above for standards and protocols, or ask your manager for other topics.";
    }

    if (context === 'inventory') {
      if (
        questionLower.includes('sterilization') ||
        questionLower.includes('autoclave')
      ) {
        return "That's a sterilization question! Please go to the Sterilization page or ask your manager for sterilization-related help.";
      }
      return "That question isn't related to inventory. Try the Relevant Information section above, or ask your manager for other topics.";
    }

    return "That question isn't related to your current page. Try the Relevant Information section above, or ask your manager for other topics.";
  };

  return { checkQuestionRelevance, getRedirectMessage };
};
