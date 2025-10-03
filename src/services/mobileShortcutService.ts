/**
 * Mobile Shortcut Service
 * Handles mobile device shortcuts for scanner workflows
 */

export interface MobileShortcut {
  id: string;
  name: string;
  enabled: boolean;
  shortcutType: string;
  workflowType: 'dirty' | 'clean' | 'inventory';
}

export interface MobileShortcutSettings {
  dirtyScans: {
    enabled: boolean;
    name: string;
    shortcutType: string;
  };
  cleanScans: {
    enabled: boolean;
    name: string;
    shortcutType: string;
  };
  inventoryScans: {
    enabled: boolean;
    name: string;
    shortcutType: string;
  };
}

class MobileShortcutService {
  private static instance: MobileShortcutService;
  private settings: MobileShortcutSettings;

  private constructor() {
    this.settings = this.loadSettings();
  }

  static getInstance(): MobileShortcutService {
    if (!MobileShortcutService.instance) {
      MobileShortcutService.instance = new MobileShortcutService();
    }
    return MobileShortcutService.instance;
  }

  private loadSettings(): MobileShortcutSettings {
    const saved = localStorage.getItem('mobileShortcutSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse mobile shortcut settings:', error);
      }
    }

    // Default settings
    return {
      dirtyScans: {
        enabled: true,
        name: 'Dirty Scans',
        shortcutType: 'Double-tap back',
      },
      cleanScans: {
        enabled: true,
        name: 'Clean Scans',
        shortcutType: 'Volume Down + Power',
      },
      inventoryScans: {
        enabled: false,
        name: 'Inventory Scans',
        shortcutType: 'Side button double-tap',
      },
    };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(
        'mobileShortcutSettings',
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error('Failed to save mobile shortcut settings:', error);
    }
  }

  getSettings(): MobileShortcutSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<MobileShortcutSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();
  }

  isShortcutEnabled(workflowType: 'dirty' | 'clean' | 'inventory'): boolean {
    switch (workflowType) {
      case 'dirty':
        return this.settings.dirtyScans.enabled;
      case 'clean':
        return this.settings.cleanScans.enabled;
      case 'inventory':
        return this.settings.inventoryScans.enabled;
      default:
        return false;
    }
  }

  getShortcutName(workflowType: 'dirty' | 'clean' | 'inventory'): string {
    switch (workflowType) {
      case 'dirty':
        return this.settings.dirtyScans.name;
      case 'clean':
        return this.settings.cleanScans.name;
      case 'inventory':
        return this.settings.inventoryScans.name;
      default:
        return '';
    }
  }

  getShortcutType(workflowType: 'dirty' | 'clean' | 'inventory'): string {
    switch (workflowType) {
      case 'dirty':
        return this.settings.dirtyScans.shortcutType;
      case 'clean':
        return this.settings.cleanScans.shortcutType;
      case 'inventory':
        return this.settings.inventoryScans.shortcutType;
      default:
        return '';
    }
  }

  // Handle mobile shortcut activation
  handleShortcutActivation(
    workflowType: 'dirty' | 'clean' | 'inventory'
  ): void {
    if (!this.isShortcutEnabled(workflowType)) {
      console.log(`Shortcut for ${workflowType} workflow is disabled`);
      return;
    }

    console.log(`Mobile shortcut activated for ${workflowType} workflow`);

    // Emit a custom event that the app can listen to
    const event = new CustomEvent('mobileShortcutActivated', {
      detail: {
        workflowType,
        shortcutName: this.getShortcutName(workflowType),
        shortcutType: this.getShortcutType(workflowType),
        timestamp: new Date().toISOString(),
      },
    });

    window.dispatchEvent(event);
  }

  // Initialize mobile shortcut listeners
  initializeShortcuts(): void {
    // Listen for custom events that might be triggered by mobile shortcuts
    window.addEventListener('mobileShortcutActivated', ((event: Event) => {
      const customEvent = event as CustomEvent;
      const { workflowType } = customEvent.detail;
      this.handleShortcutActivation(workflowType);
    }) as EventListener);

    // For development/testing, add keyboard shortcuts
    if (process.env.NODE_ENV === 'development') {
      document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + 1 for dirty workflow
        if ((event.ctrlKey || event.metaKey) && event.key === '1') {
          event.preventDefault();
          this.handleShortcutActivation('dirty');
        }
        // Ctrl/Cmd + 2 for clean workflow
        if ((event.ctrlKey || event.metaKey) && event.key === '2') {
          event.preventDefault();
          this.handleShortcutActivation('clean');
        }
        // Ctrl/Cmd + 3 for inventory workflow
        if ((event.ctrlKey || event.metaKey) && event.key === '3') {
          event.preventDefault();
          this.handleShortcutActivation('inventory');
        }
      });
    }
  }
}

export default MobileShortcutService;
