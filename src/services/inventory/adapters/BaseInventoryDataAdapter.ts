export abstract class BaseInventoryDataAdapter {
  /**
   * Base class for all inventory adapters.
   * Provides no-op default implementations so concrete adapters can override as needed.
   */

  async initialize(): Promise<void> {
    // Default no-op
  }

  async getAllItems(): Promise<unknown[]> {
    return [];
  }

  async getItemById(_id: string): Promise<unknown | null> {
    return null;
  }

  async saveItem(_item: unknown): Promise<void> {
    // Default no-op
  }

  async deleteItem(_id: string): Promise<void> {
    // Default no-op
  }

  async clearCache(): Promise<void> {
    // Default no-op
  }
}
