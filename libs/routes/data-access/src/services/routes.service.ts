import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { BBox, Feature } from 'geojson';
import osmtogeojson from 'osmtogeojson';
import { RouteType } from '../models/routes';
import { OverpassResponse } from '../models/overpass-api';

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  private readonly http = inject(HttpClient);

  getRoutesByArea(
    bbox: BBox,
    routeTypes: RouteType[],
  ): Observable<GeoJSON.FeatureCollection> {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    const overpassQuery = `
      [bbox:${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}][out:json][timeout:120];
      (
        relation["route"="bicycle"][network~"^(${routeTypes.join('|')})$"][!distance];
        way["route"="bicycle"][network~"^(${routeTypes.join('|')})$"][!distance];
        relation["route"="bicycle"][!network][!distance];
      );
      out geom;
    `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http
      .post<OverpassResponse>(
        overpassUrl,
        'data=' + encodeURIComponent(overpassQuery),
        { headers },
      )
      .pipe(
        switchMap((response: OverpassResponse) => {
          const { type, features } = osmtogeojson(response);

          const routeFeatures = features.filter(
            (feature) =>
              (feature.geometry?.type === 'LineString' ||
                feature.geometry?.type === 'MultiLineString') &&
              feature.id?.toString().includes('relation'),
          );

          const sortedRoutes = this.sortRoutesByNetwork(routeFeatures);

          const routesWithBounds = sortedRoutes.map((feature) => {
            const route = feature as GeoJSON.Feature<GeoJSON.LineString>;

            const bounds = this.boundEntireRouteCoordinates(route);

            return {
              ...feature,
              properties: {
                ...feature.properties,
                bounds,
              },
            };
          });

          const routes = {
            type,
            features: routesWithBounds,
          };

          return of(routes as unknown as GeoJSON.FeatureCollection);
        }),
      );
  }

  private sortRoutesByNetwork(routes: GeoJSON.Feature[]) {
    const networkPriority = {
      icn: 0,
      ncn: 1,
      rcn: 2,
      lcn: 3,
    };

    return routes.sort((a: Feature, b: Feature) => {
      const aNetwork = (a.properties?.['network'] as string)?.toLowerCase();
      const bNetwork = (b.properties?.['network'] as string)?.toLowerCase();

      const aPriority =
        networkPriority[aNetwork as keyof typeof networkPriority] ?? 4;
      const bPriority =
        networkPriority[bNetwork as keyof typeof networkPriority] ?? 4;

      return aPriority - bPriority;
    });
  }

  private boundEntireRouteCoordinates(route: GeoJSON.Feature) {
    if (route.geometry.type === 'LineString') {
      return JSON.stringify(route.geometry.coordinates);
    }

    if (route.geometry.type === 'MultiLineString') {
      return JSON.stringify(route.geometry.coordinates);
    }

    return undefined;
  }
}
