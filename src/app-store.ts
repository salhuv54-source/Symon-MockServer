import { DataType, ModelData } from './types';

/**
 * In-memory store that holds all loaded model data in the application.
 */
class AppStore {
  private models: Map<string, ModelData> = new Map();
  private activeModelName: string | null = null;

  /**
   * Store a model under a given name and set it as active.
   */
  setModel(name: string, data: ModelData): void {
    this.models.set(name, data);
    this.activeModelName = name;
  }

  /**
   * Retrieve the active model.
   */
  getActiveModel(): ModelData | undefined {
    if (this.activeModelName) {
      return this.models.get(this.activeModelName);
    }
    const names = this.getModelNames();
    if (names.length > 0) {
      return this.models.get(names[0]);
    }
    return undefined;
  }

  /**
   * Set the active model name.
   */
  setActiveModel(name: string): void {
    if (this.models.has(name)) {
      this.activeModelName = name;
    }
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
    const deleted = this.models.delete(name);
    if (this.activeModelName === name) {
      const names = this.getModelNames();
      this.activeModelName = names.length > 0 ? names[0] : null;
    }
    return deleted;
  }

  /**
   * Clear all stored models.
   */
  clearAll(): void {
    this.models.clear();
    this.activeModelName = null;
  }
}

// Singleton instance
const appStore = new AppStore();
export default appStore;
