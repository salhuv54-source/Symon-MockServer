import { SingleGeoJsonData, SingleGeoJsonTosFormat } from './interfaces/bit-and-polygons-server-response.interface';

/**
 * Service class responsible for converting TOS format polygons and geometry
 * into Symon format GeoJSON features.
 */
export class GeoJsonConverterService {
  /**
   * Converts features array in-place using diagramData dimensions (width & height).
   */
  public static convertPolygonsToGeoJson(diagramData: any, features: any[]): void {
    if (!diagramData || !features || !Array.isArray(features)) return;
    const { width, height } = diagramData;
    for (let i = 0; i < features.length; i++) {
      features[i] = GeoJsonConverterService.convertTosFormatToSymonFormatJSON(
        features[i],
        width,
        height,
      );
    }
  }

  /**
   * Converts TOS format single feature to Symon format GeoJSON feature.
   */
  public static convertTosFormatToSymonFormatJSON(
    TosJSON: SingleGeoJsonTosFormat,
    width: number,
    height: number,
  ): SingleGeoJsonData {
    const initialSymonJSON: SingleGeoJsonData =
      GeoJsonConverterService.getInitialFeatureSymonFormatJSON();

    initialSymonJSON.properties = {
      ...initialSymonJSON.properties,
      polygonText: TosJSON.content,
      sensorId: TosJSON.nodeId,
      polygonId: TosJSON.polygonId,
      fontSize: TosJSON.fontSize,
      polygonTextColor: TosJSON.shapeTextBrush ? TosJSON.shapeTextBrush.toLowerCase() : "#000000",
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
            ? GeoJsonConverterService.scalingRadiusCoords(TosJSON.radius, width)
            : undefined,
      },
    };

    initialSymonJSON.geometry = {
      type: TosJSON.shapeImageName ? "Image" : (TosJSON.coordinatesGeometry?.type || "Polygon"),
      coordinates: TosJSON.coordinatesGeometry ? GeoJsonConverterService.scalingTosCoordinatesToSymonCoordinates(
        TosJSON.coordinatesGeometry.coordinates,
        TosJSON.coordinatesGeometry.type,
        width,
        height,
      ) : [],
    };

    return initialSymonJSON;
  }

  private static scalingRadiusCoords(radius: number, widthOfScreenX: number): number {
    return radius / widthOfScreenX;
  }

  private static scalingTosCoordinatesToSymonCoordinates(
    tosCoordinates: any,
    tosType: string,
    width: number,
    height: number,
  ): any {
    switch (tosType) {
      case "Polygon": {
        const polygonCoords: number[][] = tosCoordinates[0].map(
          (ele: number[]) => {
            const { x, y } = GeoJsonConverterService.getCoordinatesAfterCalc(ele, width, height);
            return [x, y];
          },
        );
        return [polygonCoords];
      }
      case "Point": {
        const pointCoords: number[] = tosCoordinates;
        const { x, y } = GeoJsonConverterService.getCoordinatesAfterCalc(
          pointCoords,
          width,
          height,
        );
        return [x, y];
      }
      default: {
        const defaultCoords: number[][] = tosCoordinates[0].map(
          (ele: number[]) => {
            const { x, y } = GeoJsonConverterService.getCoordinatesAfterCalc(ele, width, height);
            return [x, y];
          },
        );
        return [defaultCoords];
      }
    }
  }

  private static getCoordinatesAfterCalc(
    coordinates: number[],
    sizeOfScreenX: number,
    sizeOfScreenY: number,
  ): { x: number; y: number } {
    const x =
      (coordinates[0] / sizeOfScreenX) * (sizeOfScreenX / sizeOfScreenY);
    const y = -1 * (coordinates[1] / sizeOfScreenY);
    return { x, y };
  }

  private static getInitialFeatureSymonFormatJSON(): SingleGeoJsonData {
    return {
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
  }
}
