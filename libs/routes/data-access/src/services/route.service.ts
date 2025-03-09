import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import osmtogeojson from 'osmtogeojson';
import { RouteTypeResponse } from '../models/route';
import { OverpassResponse } from '../models/overpass-api';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private readonly http = inject(HttpClient);

  getRouteById(id: number): Observable<RouteTypeResponse> {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    const overpassQuery = `
      [out:json][timeout:90];
      rel(${id});
      out geom;
      rel(${id});
      way(r);
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
          const { elements, ...rest } = response;

          const routeGeoJson = osmtogeojson({
            ...rest,
            elements: [elements[0]],
          });
          const subways = osmtogeojson({
            ...rest,
            elements: elements.slice(1),
          });

          if (routeGeoJson.features && routeGeoJson.features.length > 0) {
            const routeFeature = routeGeoJson
              .features[0] as GeoJSON.Feature<GeoJSON.LineString>;
            const bounds = this.boundEntireRouteCoordinates(routeFeature);

            routeGeoJson.features[0] = {
              ...routeFeature,
              properties: {
                ...routeFeature.properties,
                bounds,
              },
            };
          }

          return of({
            route: routeGeoJson,
            subways,
          });
        }),
      );
  }

  getrouteWays(id: number): Observable<GeoJSON.FeatureCollection> {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    const overpassQuery = `
      [out:json][timeout:90];
      rel(${id});
      way(r);
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
