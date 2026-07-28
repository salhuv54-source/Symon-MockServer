import { BitReport } from "./bit.interface";
import { SensorsCollection } from "./sensor.interface";

export interface BitReportAndPolygonServerResponse {
  bitReport: BitReport;
  polygons: MapGeoJsonDataCollection;
  allSensors?: SensorsCollection;
}

export interface SingleGeoJsonTosFormat {
  content: string;
  tooltip?: string;
  nodeId: number;
  polygonId: string;
  shapeWidth?: number;
  shapeHeight?: number;
  shapeImageSource?: string;
  shapeImageName?: string;
  shapeMode?: string;
  position?: number[];
  diagramName?: string;
  linkedDiagram?: string;
  radius: number;
  fontSize: number;
  fontFamily?: string;
  shapeGeneralBackground: string;
  shapeDataBackground?: string;
  shapeBitBackground?: string;
  shapeOpacity: number;
  borderOpacity: number;
  shapeZIndex?: number;
  shapeBorderBrush?: string;
  shapeStrokeThickness?: number;
  shapeStrokeDashStyle?: number;
  geometry: string;
  coordinatesGeometry: {
    coordinates: number[] | number[][] | number[][][];
    type: string;
  };
  shapeTextBrush: string;
  shapeActionFileSource?: string;
  diagramItemType?: string;
}

export interface MapGeoJsonDataCollection {
  type: "FeatureCollection";
  diagramData?: DiagramData;
  features: SingleGeoJsonData[];
}

export interface DiagramData {
  sizeX: number;
  sizeY: number;
  width: number;
  height: number;
  diagramBackground: string;
  diagramImageName: string;
  diagramOrder?: string;
}

export interface SingleGeoJsonData {
  type: "Feature";
  geometry: { coordinates: number[] | number[][] | number[][][]; type: string };
  properties: GeoJsonProperties;
}

export interface CustomPolygonProperties {
  sensorId: number;
  polygonId: string;
  polygonText: string;
  polygonTextColor: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderScore: boolean;
  isTextRotate: boolean;
  isNoCommunication: boolean;
  polygonFunctions: MapPolygonCustomPropFunctionsCollection;
  isNotPartOfSensorTree?: boolean;
  shapeImageName?: string;
  linkedDiagram?: string;
}

export interface MapPolygonCustomPropFunctionsCollection {
  [functionName: string]: MapPolygonFunctionsParams | {};
}

export interface MapPolygonFunctionsParams {
  [ParamteterName: string]: string | number;
}

export interface GeoJsonProperties extends CustomPolygonProperties {
  options: PolygonStyleProperties;
}

export interface PolygonStyleProperties {
  clickable?: boolean;
  color?: string;
  fill?: boolean;
  fillColor?: string;
  fillOpacity?: number;
  opacity?: number;
  initOpacity?: number;
  borderOpacity?: number;
  borderThickness?: number;
  borderColor?: string;
  radius?: number;
  stroke?: boolean;
  weight?: number;
  className?: string;
}
