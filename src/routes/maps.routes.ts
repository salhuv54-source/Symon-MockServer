import { Router, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { MainRoutes, SubRoutes } from '../types';

const MAPS_DIR = path.resolve(__dirname, '..', '..', 'assets', 'maps-and-polygons');

/**
 * Safely loads a map JSON file from the MAPS_DIR directory.
 * Returns the parsed JSON data, or null if not found or invalid.
 */
function loadMapJson(filename: string): any {
  try {
    const safeFilename = path.basename(filename);
    const possibleNames = [
      safeFilename,
      safeFilename.endsWith('.json') ? safeFilename : `${safeFilename}.json`
    ];

    for (const name of possibleNames) {
      const filePath = path.join(MAPS_DIR, name);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
      }
    }
    console.warn(`[RouteService] Map file not found in ${MAPS_DIR} for query: ${filename}`);
  } catch (error) {
    console.error(`[RouteService] Error reading/parsing map JSON file for ${filename}:`, error);
  }
  return null;
}

export default function mapsRoutes(router: Router): void {
  // GET /api/maps/bit/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.BIT}/:filename`,
    (req: Request, res: Response) => {
      const filename = req.params.filename as string;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_MAPS}${SubRoutes.BIT}/${filename} received`);
      const data = loadMapJson(filename);
      if (data === null) {
        return res.status(400).json({ error: `Map file '${filename}' not found` });
      }
      res.json({ filename, data });
    }
  );

  // GET /api/maps/tree/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.TREE}/:filename`,
    (req: Request, res: Response) => {
      const filename = req.params.filename as string;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_MAPS}${SubRoutes.TREE}/${filename} received`);
      const data = loadMapJson(filename);
      if (data === null) {
        return res.status(400).json({ error: `Map file '${filename}' not found` });
      }
      res.json({ filename, data });
    }
  );

  // GET /api/maps/system-info/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.SYSTEM_INFO}/:filename`,
    (req: Request, res: Response) => {
      const filename = req.params.filename as string;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_MAPS}${SubRoutes.SYSTEM_INFO}/${filename} received`);
      const data = loadMapJson(filename);
      if (data === null) {
        return res.status(400).json({ error: `Map file '${filename}' not found` });
      }
      res.json({ filename, data });
    }
  );

  // GET /api/maps/dynamic-diagram/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.DYNAMIC_DIAGRAM}/:filename`,
    (req: Request, res: Response) => {
      const filename = req.params.filename as string;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_MAPS}${SubRoutes.DYNAMIC_DIAGRAM}/${filename} received`);
      const data = loadMapJson(filename);
      if (data === null) {
        return res.status(400).json({ error: `Map file '${filename}' not found` });
      }
      res.json({ filename, data });
    }
  );
}
