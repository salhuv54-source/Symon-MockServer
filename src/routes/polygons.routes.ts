import { Router, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { MainRoutes, SubRoutes } from '../types';
import { SingleGeoJsonData, SingleGeoJsonTosFormat } from '../interfaces/bit-and-polygons-server-response.interface';

const MAPS_DIR = path.resolve(__dirname, '..', '..', 'assets', 'maps-and-polygons');

/**
 * Safely loads a map/polygon JSON file from the maps-and-polygons directory.
 * Returns the parsed JSON data, or null if not found or invalid.
 */
function loadPolygonJson(filename: string): any {
  try {
    let mapsDir = MAPS_DIR;
    if (!fs.existsSync(mapsDir)) {
      mapsDir = path.resolve(process.cwd(), 'assets', 'maps-and-polygons');
    }
    const safeFilename = path.basename(filename);
    const possibleNames = [
      safeFilename,
      safeFilename.endsWith('.json') ? safeFilename : `${safeFilename}.json`
    ];

    for (const name of possibleNames) {
      const filePath = path.join(mapsDir, name);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
      }
    }
    console.warn(`[RouteService] Polygon/Map file not found in ${mapsDir} for query: ${filename}`);
  } catch (error) {
    console.error(`[RouteService] Error reading/parsing polygon/map JSON file for ${filename}:`, error);
  }
  return null;
}

export default function polygonsRoutes(router: Router): void {

  // GET /api/polygons/bit/:filename/:id/:isExpandBitResultInNewTab
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.BIT}/:filename/:id/:isExpandBitResultInNewTab`,
    (req: Request, res: Response) => {
      const filename = getRequestParam(req.params.filename as string);
      const id = getRequestParam(req.params.id as string);
      const isExpandBitResultInNewTab = getRequestParam(req.params.isExpandBitResultInNewTab as string);
      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.BIT}/${filename}/${id}/${isExpandBitResultInNewTab} received`);
      const data = loadPolygonJson(filename) || {};
      res.json(data);
    }
  );

  // GET /api/polygons/tree/:filename
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.TREE}/:filename`,
    (req: Request, res: Response) => {
      const filename = getRequestParam(req.params.filename as string);
      const data = loadPolygonJson(filename);
      const responseObj = JSON.parse(data);
      const { features, diagramData } = responseObj;
      convertPolygonsToGeoJson(diagramData, features);


      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.TREE}/${filename} received`);
      if (responseObj === null) {
        return res.status(400).json({ error: `Polygon file '${filename}' not found` });
      }
      res.json(responseObj);
    }
  );

  // GET /api/polygons/system-info/:filename
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.SYSTEM_INFO}/:filename`,
    (req: Request, res: Response) => {
      const filename = getRequestParam(req.params.filename as string);
      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.SYSTEM_INFO}/${filename} received`);
      const data = loadPolygonJson(filename) || {};
      res.json(data);
    }
  );

  // GET /api/polygons/dynamic-diagram/:nodeId
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.DYNAMIC_DIAGRAM}/:nodeId`,
    (req: Request, res: Response) => {
      const nodeId = getRequestParam(req.params.nodeId as string);
      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.DYNAMIC_DIAGRAM}/${nodeId} received`);
      const data = loadPolygonJson(nodeId) || {};
      res.json(data);
    }
  );

}
function getRequestParam(key: string): string {
  return key.replace(":", "");
}

function convertPolygonsToGeoJson({ width, height }, features) {
  for (let i = 0; i < features?.length; i++) {
    features[i] = convertTosFormatToSymonFormatJSON(
      features[i],
      width,
      height,
    );
  }
}
function convertTosFormatToSymonFormatJSON(
    TosJSON: SingleGeoJsonTosFormat,
    width: number,
    height: number,
  ): SingleGeoJsonData {
    const initialSymonJSON: SingleGeoJsonData =
      getInitialFeatureSymonFormatJSON();

    initialSymonJSON.properties = {
      ...initialSymonJSON.properties,
      polygonText: TosJSON.content,
      sensorId: TosJSON.nodeId,
      polygonId: TosJSON.polygonId,
      fontSize: TosJSON.fontSize,
      polygonTextColor: TosJSON.shapeTextBrush.toLowerCase(),
      shapeImageName: TosJSON.shapeImageName ?? undefined,
      linkedDiagram: TosJSON.linkedDiagram,
      options: {
        ...initialSymonJSON.properties.options,
        fillColor: TosJSON.shapeGeneralBackground,
        opacity: TosJSON.shapeOpacity,
        initOpacity: TosJSON.shapeOpacity,
        borderOpacity: TosJSON.borderOpacity,
        borderColor: TosJSON.shapeBorderBrush,
        borderThickness: TosJSON.shapeStrokeThickness,
        radius:
          TosJSON.radius > 0
            ? scalingRadiusCoords(TosJSON.radius, width)
            : undefined,
      },
    };
    initialSymonJSON.geometry = {
      type: TosJSON.shapeImageName ? "Image" : TosJSON.coordinatesGeometry.type,
      coordinates: scalingTosCoordinatesToSymonCoordinates(
        TosJSON.coordinatesGeometry.coordinates,
        TosJSON.coordinatesGeometry.type,
        width,
        height,
      ),
    };

    return initialSymonJSON;
}
function scalingRadiusCoords(radius: number, widthOfScreenX: number) {
  return radius / widthOfScreenX;
}
function scalingTosCoordinatesToSymonCoordinates(
  tosCoorinates: any,
  tosType: string,
  width: number,
  height: number,
) {
  switch (tosType) {
    case "Polygon":
      const polygonCoords: number[][] = tosCoorinates[0].map(
        (ele: number[]) => {
          const { x, y } = getCoordinatesAfterCalc(ele, width, height);
          return [x, y];
        },
      );
      return [polygonCoords];
    case "Point":
      const pointCoords: number[] = tosCoorinates;
      const { x, y } = getCoordinatesAfterCalc(
        pointCoords,
        width,
        height,
      );
      return [x, y];
    default:
      const defaultCoords: number[][] = tosCoorinates[0].map(
        (ele: number[]) => {
          const { x, y } = getCoordinatesAfterCalc(ele, width, height);
          return [x, y];
        },
      );
      return [defaultCoords];
  }
}
function  getCoordinatesAfterCalc(
  coordinates: number[],
  sizeOfScreenX: number,
  sizeOfScreenY: number,
) {
  const x =
    (coordinates[0] / sizeOfScreenX) * (sizeOfScreenX / sizeOfScreenY);
  const y = -1 * (coordinates[1] / sizeOfScreenY);
  return { x, y };
}
function getInitialFeatureSymonFormatJSON(): SingleGeoJsonData {
    const initialFeature: SingleGeoJsonData = {
      properties: {
        polygonText: "TEST!",
        polygonId: "10000002",
        sensorId: 10000002,
        isTextRotate: false,
        polygonFunctions: {},
        isNoCommunication: false,
        fontSize: 16,
        polygonTextColor: "#000000",
        isUnderScore: false,
        isItalic: false,
        isBold: false,
        options: {
          fill: true,
          stroke: true,
          color: undefined,
          weight: 4,
          opacity: 1,
          initOpacity: 1,
          borderOpacity: 0,
          borderColor: "#ffffff",
          borderThickness: 0,
          fillColor: "ff7a00",
          fillOpacity: 0.1,
          clickable: true,
          className: "leaflet-polygon ",
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [0.0527777777777778, 0.4676685185194445],
            [0.0527777777777778, 0.4348907407407417],
            [0.2288888888888889, 0.4348907407407417],
            [0.2288888888888889, 0.4676685185194445],
            [0.0527777777777778, 0.4676685185194445],
          ],
        ],
      },
      type: "Feature",
    };

    return initialFeature;
  }




