import { ModelData } from './types';

/**
 * In-memory store that holds all loaded model data in the application.
 */
class AppStore {
  private models: Map<string, ModelData> = new Map();

  /**
   * Store a model under a given name.
   */
  setModel(name: string, data: ModelData): void {
    this.models.set(name, data);
  }

  /**
   * Retrieve a model by name.
   */
  getModel(name: string): ModelData | undefined {
    return this.models.get(name);
  }

  /**
   * Check if a model exists in the store.
   */
  hasModel(name: string): boolean {
    return this.models.has(name);
  }

  /**
   * Get all loaded model names.
   */
  getModelNames(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Get all loaded models.
   */
  getAllModels(): Map<string, ModelData> {
    return new Map(this.models);
  }

  /**
   * Remove a model from the store.
   */
  removeModel(name: string): boolean {
    return this.models.delete(name);
  }

  /**
   * Clear all stored models.
   */
  clearAll(): void {
    this.models.clear();
  }
}

// Singleton instance
const appStore = new AppStore();
export default appStore;