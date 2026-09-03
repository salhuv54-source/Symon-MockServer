import * as path from 'path';
import * as fs from 'fs';

let cachedAssetsDir: string | null = null;

/**
 * Resolves the absolute path to the assets directory reliably across environments:
 * - Development with ts-node (root/src/ -> root/assets)
 * - Production compiled build with node (root/dist/src/ or root/dist/ -> root/assets)
 * - Docker container (WORKDIR /usr/src/app -> /usr/src/app/assets)
 */
export function getAssetsDir(): string {
  if (cachedAssetsDir && fs.existsSync(cachedAssetsDir)) {
    return cachedAssetsDir;
  }

  // 1. Try relative to process.cwd() (works in Docker /usr/src/app and root dev execution)
  const cwdCandidate = path.resolve(process.cwd(), 'assets');
  if (fs.existsSync(cwdCandidate)) {
    cachedAssetsDir = cwdCandidate;
    return cachedAssetsDir;
  }

  // 2. Walk up directory tree from __dirname to find an 'assets' folder
  let currentDir = __dirname;
  while (currentDir !== path.dirname(currentDir)) {
    const candidate = path.join(currentDir, 'assets');
    if (fs.existsSync(candidate)) {
      cachedAssetsDir = candidate;
      return cachedAssetsDir;
    }
    currentDir = path.dirname(currentDir);
  }

  // 3. Fallback to process.cwd()/assets
  return cwdCandidate;
}

/**
 * Resolves the path to a file or folder inside the assets directory.
 */
export function getAssetPath(...subPaths: string[]): string {
  return path.join(getAssetsDir(), ...subPaths);
}
