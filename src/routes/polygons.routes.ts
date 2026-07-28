import { Router, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { MainRoutes, SubRoutes } from '../types';
import { GeoJsonConverterService } from '../geojson-converter.service';

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

function getRequestParam(key: string): string {
  if (!key) return '';
  return key.replace(":", "");
}

/**
 * Processes polygon raw JSON data and converts TOS format features into GeoJSON format.
 */
function processPolygonResponse(data: any): any {
  if (!data) return null;
  const responseObj = typeof data === 'string' ? JSON.parse(data) : data;
  const { features, diagramData } = responseObj;
  if (diagramData && features && Array.isArray(features)) {
    GeoJsonConverterService.convertPolygonsToGeoJson(diagramData, features);
  }
  return {
    type: "FeatureCollection",
    features,
  };
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
      const data = loadPolygonJson(filename);
      if (!data) {
        return res.status(400).json({ error: `Polygon file '${filename}' not found` });
      }
      const responseObj = processPolygonResponse(data);
      res.json(responseObj);
    }
  );

  // GET /api/polygons/tree/:filename
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.TREE}/:filename`,
    (req: Request, res: Response) => {
      const filename = getRequestParam(req.params.filename as string);
      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.TREE}/${filename} received`);
      const data = loadPolygonJson(filename);
      if (!data) {
        return res.status(400).json({ error: `Polygon file '${filename}' not found` });
      }
      const responseObj = processPolygonResponse(data);
      res.json(responseObj);
    }
  );

  // GET /api/polygons/system-info/:filename
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.SYSTEM_INFO}/:filename`,
    (req: Request, res: Response) => {
      const filename = getRequestParam(req.params.filename as string);
      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.SYSTEM_INFO}/${filename} received`);
      const data = loadPolygonJson(filename);
      if (!data) {
        return res.status(400).json({ error: `Polygon file '${filename}' not found` });
      }
      const responseObj = processPolygonResponse(data);
      res.json(responseObj);
    }
  );

  // GET /api/polygons/dynamic-diagram/:nodeId
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.DYNAMIC_DIAGRAM}/:nodeId`,
    (req: Request, res: Response) => {
      const nodeId = getRequestParam(req.params.nodeId as string);
      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.DYNAMIC_DIAGRAM}/${nodeId} received`);
      const data = loadPolygonJson(nodeId);
      if (!data) {
        return res.status(400).json({ error: `Polygon file '${nodeId}' not found` });
      }
      const responseObj = processPolygonResponse(data);
      res.json(responseObj);
    }
  );

}
