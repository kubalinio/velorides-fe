import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import mockViewpoints from './mocks/waypoints-viewpoints.json';

@Injectable({
  providedIn: 'root',
})
export class WaypointsService {
  getViewpoints(): Observable<GeoJSON.FeatureCollection> {
    return of({
      type: 'FeatureCollection' as const,
      features: mockViewpoints.features.map((feature) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: feature.geometry.coordinates as [number, number],
        },
        properties: {
          id: feature.id,
          name: feature.properties.name || 'Unnamed Viewpoint',
          description:
            feature.properties.description || 'No description available',
        },
      })),
    });
  }
}
