import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { BBox } from 'geojson';
import osmtogeojson from 'osmtogeojson';
import { RouteType } from './models/routes';

interface RouteElement {
  type: 'relation' | 'way';
  id: number;

  tags: {
    name?: string;
    network?: string;
    ref?: string;
    route?: string;
    type?: string;
    wikidata?: string;
    wikipedia?: string;
    colour?: string;
    description?: string;
    distance?: string;
    website?: string;
    from?: string;
    [key: string]: string | undefined;
  };
}

export interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    copyright: string;
  };
  elements: RouteElement[];
}

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  private readonly http = inject(HttpClient);

  formatRoute(route: NonNullable<GeoJSON.Feature['properties']>) {
    return {
      '@id': route['@id'],
      colour: route['colour'],
      description: route['description'],
      distance: route['distance'],
      name: route['name'],
      network: route['network'],
      note: route['note'],
      'osmc:symbol': route['osmc:symbol'],
      ref: route['ref'],
      route: route['route'],
      type: route['type'],
      wikidata: route['wikidata'],
    };
  }

  getRouteByArea(
    bbox: BBox,
    routeTypes: RouteType[],
  ): Observable<GeoJSON.FeatureCollection> {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    const overpassQuery = `
      [bbox:${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}][out:json][timeout:90];
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

          const routesWithBounds = routeFeatures.map((feature) => {
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

  getRouteById(id: number): Observable<GeoJSON.FeatureCollection> {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    const overpassQuery = `
      [out:json][timeout:90];
      rel(id:${id})
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
          return of(osmtogeojson(response));
        }),
      );
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

// [out:json][timeout:250];
// (
//   nwr["highway"="tertiary"][!"surface"](50.74481986170457,18.842239379882812,50.83369767098071,18.959140777587894);
// );
// out body;
// >;
// out skel qt;

// [out:json][timeout:250];
// (
//   nwr["highway"~"^(tertiary|residential|motorway|trunk|primary|secondary|unclassified|residential)$"][!"surface"]({{bbox}});
// );
// out body;
// >;
// out skel qt;
