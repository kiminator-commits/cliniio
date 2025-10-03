// Compatibility layer to maintain existing imports
// This allows us to use the simplified versions without breaking existing code

export { SimpleInventoryLoadBalancer as InventoryLoadBalancer } from './SimpleInventoryLoadBalancer';
export { simpleInventoryLoadBalancer as inventoryLoadBalancer } from './SimpleInventoryLoadBalancer';

// Re-export the types for compatibility
export type { LoadBalancerConfig } from './SimpleInventoryLoadBalancer';
