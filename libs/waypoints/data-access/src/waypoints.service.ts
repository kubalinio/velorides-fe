import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import mockViewpoints from './mocks/waypoints-viewpoints.json';
import { WaypointsFilterType, ViewpointType } from './models/viewpoint';

@Injectable({
  providedIn: 'root',
})
export class WaypointsService {
  getViewpoints(
    waypointsSelectedFilter: WaypointsFilterType,
  ): Observable<GeoJSON.FeatureCollection> {
    const filteredViewpoints = mockViewpoints.features.filter((feature) =>
      waypointsSelectedFilter.includes(feature.properties.tourism as never),
    );

    return of({
      type: 'FeatureCollection' as const,
      features: filteredViewpoints.map((feature) => ({
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

  updateWaypointsFilter(
    waypoints: WaypointsFilterType,
    selectedViewpoints: ViewpointType,
  ): Observable<WaypointsFilterType> {
    if (waypoints.includes(selectedViewpoints as never)) {
      return of(
        waypoints.filter((viewpoint) => viewpoint !== selectedViewpoints),
      );
    }

    return of([...waypoints, selectedViewpoints]);
  }
}
