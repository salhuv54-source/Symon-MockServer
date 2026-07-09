import * as path from 'path';
import * as fs from 'fs';
import { loadModelFromFile } from './model-loader';
import appStore from './app-store';

/**
 * Path to the directory where model .fsx files are stored.
 * Resolves to the workspace root: assets/model/
 */
const MODELS_DIR = path.resolve(__dirname, '..', 'assets', 'model');

/**
 * Upload service that loads model .fsx files from the assets directory
 * and stores the parsed data into the application's in-memory store.
 */
class UploadService {
  /**
   * Load a model by its file name (without extension or with .fsx extension).
   * Looks in assets/mock-data-jsons/model/<fileName>.fsx
   *
   * @param fileName - The name of the model file (e.g., "System1_Export" or "System1_Export.fsx")
   * @returns The model name under which it was stored
   * @throws If the file doesn't exist or parsing fails
   */
  async uploadModel(fileName: string): Promise<string> {
    // Normalize file name: ensure it has .fsx extension
    const normalizedName = fileName.endsWith('.fsx') ? fileName : `${fileName}.fsx`;
    const filePath = path.join(MODELS_DIR, normalizedName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Model file not found: ${filePath}`);
    }

    console.log(`[UploadService] Loading model from: ${filePath}`);

    // Parse the FSX file into ModelData
    const modelData = await loadModelFromFile(filePath);

    // Use the system name from the model as the storage key
    const modelName = modelData.system.name || normalizedName.replace('.fsx', '');

    // Store in the application's in-memory store
    appStore.setModel(modelName, modelData);

    console.log(`[UploadService] Model "${modelName}" loaded and stored successfully.`);
    return modelName;
  }

  /**
   * List all available .fsx model files in the models directory.
   */
  listAvailableModels(): string[] {
    if (!fs.existsSync(MODELS_DIR)) {
      return [];
    }

    return fs
      .readdirSync(MODELS_DIR)
      .filter((file) => file.endsWith('.fsx'))
      .map((file) => file.replace('.fsx', ''));
  }
}

const uploadService = new UploadService();
export default uploadService;