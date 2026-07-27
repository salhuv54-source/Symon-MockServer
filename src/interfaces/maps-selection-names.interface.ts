export enum MapSelectionTypes {
  SERVICEABILITY_MAP_TYPE = "SERVICEABILITY_MAP_TYPE",
  SYSTEM_INFO_MAP_TYPE = "SYSTEM_INFO_MAP_TYPE",
}

export interface MapsSelection {
  mapSelectionType: MapSelectionTypes;
  mapsSelectionsNames: string[];
  currentMapName: string;
  currentMapHistoryIndex: number;
  userMapSelectionHistory: string[];
}

export interface MapsSelectionCollection {
  [type: string]: MapsSelection;
}
