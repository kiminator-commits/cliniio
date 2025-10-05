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

    if (context === 'home') {
      // Home page should only handle general dashboard questions
      const homeKeywords = [
        'dashboard',
        'home',
        'overview',
        'summary',
        'metrics',
        'stats',
        'performance',
        'tasks',
        'gamification',
        'points',
        'level',
        'streak',
        'leaderboard',
        'challenge',
        'navigation',
        'menu',
        'help',
        'assistant',
        'cliniio',
        'general',
        'status',
        'welcome',
        'getting started',
        'tutorial',
        'onboarding',
      ];

      // Check for specific exclusions first
      const exclusionKeywords = [
        'settings',
        'configuration',
        'admin',
        'setup',
        'sterilization',
        'autoclave',
        'inventory',
        'stock',
        'cleaning',
        'disinfection',
        'password',
        'login',
        'access',
        'account',
        'user',
        'permission',
        'report',
        'analytics',
        'data',
        'export',
        'training',
        'course',
        'learning',
        'education',
      ];

      // If question contains exclusion keywords, it's not relevant to home
      if (
        exclusionKeywords.some((keyword) => questionLower.includes(keyword))
      ) {
        return false;
      }

      // Otherwise, check if it contains home keywords
      return homeKeywords.some((keyword) => questionLower.includes(keyword));
    }

    return true; // Allow general questions on other pages
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

    if (context === 'environmental-clean') {
      if (
        questionLower.includes('sterilization') ||
        questionLower.includes('autoclave')
      ) {
        return 'For sterilization questions, try the Sterilization page or ask your manager.';
      }
      return "That question isn't related to environmental cleaning. Try the Relevant Information section above, or ask your manager for other topics.";
    }

    if (context === 'home') {
      // Specific redirects for home page based on question type
      if (
        questionLower.includes('sterilization') ||
        questionLower.includes('autoclave') ||
        questionLower.includes('bi') ||
        questionLower.includes('biological indicator')
      ) {
        return "That's a sterilization question! Please go to the Sterilization page for specialized help, or contact your clinic administrator for detailed guidance.";
      }

      if (
        questionLower.includes('inventory') ||
        questionLower.includes('stock') ||
        questionLower.includes('supply') ||
        questionLower.includes('order') ||
        questionLower.includes('purchase')
      ) {
        return "That's an inventory question! Please go to the Inventory page for specialized help, or contact your clinic administrator for detailed guidance.";
      }

      if (
        questionLower.includes('cleaning') ||
        questionLower.includes('disinfection') ||
        questionLower.includes('environmental')
      ) {
        return "That's an environmental cleaning question! Please go to the Environmental Clean page for specialized help, or contact your clinic administrator for detailed guidance.";
      }

      if (
        questionLower.includes('password') ||
        questionLower.includes('login') ||
        questionLower.includes('access') ||
        questionLower.includes('account') ||
        questionLower.includes('user') ||
        questionLower.includes('permission')
      ) {
        return 'For system access issues, please contact your clinic administrator or IT support. They can help with login problems, password resets, and account permissions.';
      }

      if (
        questionLower.includes('settings') ||
        questionLower.includes('configuration') ||
        questionLower.includes('admin') ||
        questionLower.includes('setup')
      ) {
        return 'For system settings and configuration questions, please contact your clinic administrator. They have access to the necessary administrative functions.';
      }

      if (
        questionLower.includes('report') ||
        questionLower.includes('analytics') ||
        questionLower.includes('data') ||
        questionLower.includes('export')
      ) {
        return 'For detailed reports and analytics, please go to the Analytics page or contact your clinic administrator for comprehensive data analysis.';
      }

      if (
        questionLower.includes('training') ||
        questionLower.includes('course') ||
        questionLower.includes('learning') ||
        questionLower.includes('education')
      ) {
        return 'For training and learning resources, please go to the Learning Hub or contact your clinic administrator for educational materials and courses.';
      }

      // General redirect for any other off-topic questions
      return 'I can only help with general dashboard questions here. For specialized topics like sterilization, inventory, cleaning, or system administration, please go to the appropriate page or contact your clinic administrator for detailed assistance.';
    }

    return "That question isn't related to your current page. Try the Relevant Information section above, or ask your manager for other topics.";
  };

  return { checkQuestionRelevance, getRedirectMessage };
};
