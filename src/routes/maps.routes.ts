import { Router, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { MainRoutes, SubRoutes } from '../types';

const MAPS_DIR = path.resolve(__dirname, '..', '..', 'assets', 'maps-and-polygons');

function getRequestParam(key: string): string {
  if (!key) return '';
  return key.replace(":", "");
}

/**
 * Resolves the absolute file path for a map or image file from the MAPS_DIR directory.
 * Searches for the exact filename, as well as common image and JSON extensions.
 */
function getMapFilePath(filename: string): string | null {
  try {
    let mapsDir = MAPS_DIR;
    if (!fs.existsSync(mapsDir)) {
      mapsDir = path.resolve(process.cwd(), 'assets', 'maps-and-polygons');
    }
    const safeFilename = path.basename(filename);
    const possibleNames = [
      safeFilename,
      `${safeFilename}.png`,
      `${safeFilename}.jpg`,
      `${safeFilename}.jpeg`,
      `${safeFilename}.svg`,
      `${safeFilename}.json`
    ];

    for (const name of possibleNames) {
      const filePath = path.join(mapsDir, name);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return filePath;
      }
    }
    console.warn(`[RouteService] Map file not found in ${mapsDir} for query: ${filename}`);
  } catch (error) {
    console.error(`[RouteService] Error resolving map file path for ${filename}:`, error);
  }
  return null;
}

/**
 * Handles sending the map file using Express res.sendFile.
 */
function handleSendMapFile(req: Request, res: Response, paramKey: string = 'filename'): void {
  const rawParam = req.params[paramKey] as string;
  const filename = getRequestParam(rawParam);
  console.log(`[RouteService] GET ${req.originalUrl || req.url} received for filename: "${filename}"`);

  const filePath = getMapFilePath(filename);
  if (!filePath) {
    res.status(404).json({ error: `Map file '${filename}' not found` });
    return;
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`[RouteService] Error sending file ${filePath}:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: `Error serving map file '${filename}'` });
      }
    }
  });
}

export default function mapsRoutes(router: Router): void {
  // GET /api/maps/bit/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.BIT}/:filename`,
    (req: Request, res: Response) => {
      handleSendMapFile(req, res);
    }
  );

  // GET /api/maps/tree/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.TREE}/:filename`,
    (req: Request, res: Response) => {
      handleSendMapFile(req, res);
    }
  );

  // GET /api/maps/system-info/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.SYSTEM_INFO}/:filename`,
    (req: Request, res: Response) => {
      handleSendMapFile(req, res);
    }
  );

  // GET /api/maps/dynamic-diagram/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.DYNAMIC_DIAGRAM}/:filename`,
    (req: Request, res: Response) => {
      handleSendMapFile(req, res);
    }
  );

  // GET /api/maps/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}/:filename`,
    (req: Request, res: Response) => {
      handleSendMapFile(req, res);
    }
  );
}
