import * as fs from 'fs';
import * as path from 'path';
import { MapsSelectionCollection, MapSelectionTypes } from './interfaces/maps-selection-names.interface';

/**
 * Loads JSON diagram files located inside the maps-and-polygons directory,
 * extracts the map selection names, and constructs a MapsSelectionCollection object.
 */
export function GenerateMapsSelectionCollection(): MapsSelectionCollection {
  // Determine MAPS_DIR path
  let mapsDir = path.resolve(__dirname, '..', 'assets', 'maps-and-polygons');
  if (!fs.existsSync(mapsDir)) {
    mapsDir = path.resolve(process.cwd(), 'assets', 'maps-and-polygons');
  }

  // Base collection structure
  const collection: MapsSelectionCollection = {
    [MapSelectionTypes.SERVICEABILITY_MAP_TYPE]: {
      mapSelectionType: MapSelectionTypes.SERVICEABILITY_MAP_TYPE,
      mapsSelectionsNames: [],
      currentMapName: '',
      currentMapHistoryIndex: -1,
      userMapSelectionHistory: []
    },
    [MapSelectionTypes.SYSTEM_INFO_MAP_TYPE]: {
      mapSelectionType: MapSelectionTypes.SYSTEM_INFO_MAP_TYPE,
      mapsSelectionsNames: [],
      currentMapName: '',
      currentMapHistoryIndex: -1,
      userMapSelectionHistory: []
    }
  };

  if (!fs.existsSync(mapsDir)) {
    console.warn(`[MapsSelectionGenerator] Directory not found: ${mapsDir}`);
    return collection;
  }

  try {
    const files = fs.readdirSync(mapsDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const discoveredMapNames: string[] = [];

    for (const file of jsonFiles) {
      const filePath = path.join(mapsDir, file);
      try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(rawData);

        // Case 1: Check if the JSON is already a MapsSelectionCollection format
        if (
          parsed &&
          typeof parsed === 'object' &&
          (parsed[MapSelectionTypes.SERVICEABILITY_MAP_TYPE] || parsed[MapSelectionTypes.SYSTEM_INFO_MAP_TYPE])
        ) {
          for (const key of [MapSelectionTypes.SERVICEABILITY_MAP_TYPE, MapSelectionTypes.SYSTEM_INFO_MAP_TYPE]) {
            if (parsed[key]) {
              const selection = parsed[key];
              const names: string[] = selection.mapsSelectionsNames || [];
              const currName = selection.currentMapName || (names.length > 0 ? names[0] : '');
              collection[key] = {
                mapSelectionType: selection.mapSelectionType || key,
                mapsSelectionsNames: names,
                currentMapName: currName,
                currentMapHistoryIndex: selection.currentMapHistoryIndex ?? (currName ? names.indexOf(currName) : -1),
                userMapSelectionHistory: selection.userMapSelectionHistory || (currName ? [currName] : [])
              };
            }
          }
          return collection;
        }

        // Case 2: Array of diagram objects or strings
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (typeof item === 'string') {
              discoveredMapNames.push(item);
            } else if (item && typeof item === 'object') {
              const name = item.name || item.mapName || item.title || item.id;
              if (name) discoveredMapNames.push(String(name));
            }
          }
        } else if (parsed && typeof parsed === 'object') {
          // Case 3: Object containing a diagrams or maps array
          if (Array.isArray(parsed.diagrams)) {
            for (const item of parsed.diagrams) {
              if (typeof item === 'string') {
                discoveredMapNames.push(item);
              } else if (item && typeof item === 'object') {
                const name = item.name || item.mapName || item.title || item.id;
                if (name) discoveredMapNames.push(String(name));
              }
            }
          } else if (Array.isArray(parsed.maps)) {
            for (const item of parsed.maps) {
              if (typeof item === 'string') {
                discoveredMapNames.push(item);
              } else if (item && typeof item === 'object') {
                const name = item.name || item.mapName || item.title || item.id;
                if (name) discoveredMapNames.push(String(name));
              }
            }
          } else {
            // Individual diagram object
            const name = parsed.name || parsed.mapName || parsed.title || parsed.id;
            if (name) {
              discoveredMapNames.push(String(name));
            } else {
              // Fallback to filename without .json
              discoveredMapNames.push(file.replace(/\.json$/i, ''));
            }
          }
        }
      } catch (err) {
        console.error(`[MapsSelectionGenerator] Failed to read or parse ${file}:`, (err as Error).message);
        // Fallback to filename without .json
        discoveredMapNames.push(file.replace(/\.json$/i, ''));
      }
    }

    // Deduplicate discovered map names
    const uniqueMapNames = Array.from(new Set(discoveredMapNames));

    // Populate default types with discovered map names if not already set
    for (const key of [MapSelectionTypes.SERVICEABILITY_MAP_TYPE, MapSelectionTypes.SYSTEM_INFO_MAP_TYPE]) {
      if (collection[key].mapsSelectionsNames.length === 0 && uniqueMapNames.length > 0) {
        collection[key].mapsSelectionsNames = uniqueMapNames;
        collection[key].currentMapName = uniqueMapNames[0];
        collection[key].currentMapHistoryIndex = 0;
        collection[key].userMapSelectionHistory = [uniqueMapNames[0]];
      }
    }
  } catch (err) {
    console.error('[MapsSelectionGenerator] Error reading maps directory:', (err as Error).message);
  }

  return collection;
}
