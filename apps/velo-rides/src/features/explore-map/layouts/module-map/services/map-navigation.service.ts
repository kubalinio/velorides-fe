import { effect, inject, Injectable } from '@angular/core';
import { MapInitService } from './map-init.service';
import { LngLatBounds } from 'maplibre-gl';
import { RouteStore } from '@velo/routes/data-access';

@Injectable({
  providedIn: 'root',
})
export class MapNavigationService {
  private readonly mapInitService = inject(MapInitService);
  private readonly routeStore = inject(RouteStore);

  readonly map$ = this.mapInitService.map$;

  $routesWithUncompletedData = this.routeStore.routesOnArea;
  $selectedRoute = this.routeStore.selectedRoute;
  $selectedRouteBounds = this.routeStore.selectedRouteBounds;

  constructor() {
    effect(() => {
      const selectedRouteBounds = this.$selectedRouteBounds();
      const map = this.mapInitService.getMap();

      if (selectedRouteBounds && map) {
        this.boundEntireRoute(
          selectedRouteBounds as unknown as GeoJSON.Feature,
        );
      }
    });
  }

  clearSelectedRoute() {
    this.mapInitService.clickPopupFeature = null;
    this.routeStore.clearSelectedRoute();
  }

  centerMapToCluster(event: { coords: number[] }) {
    const map = this.mapInitService.getMap();
    if (!map) return;

    const coordinates = event.coords;

    map.flyTo({
      center: [coordinates[0], coordinates[1]],
      zoom: map.getZoom() + 1.25,
      bearing: 0,
      pitch: 0,
    });
  }

  zoomToRoute(element: GeoJSON.Feature) {
    const map = this.mapInitService.getMap();
    if (!map) return;
    this.boundEntireRoute(element);
  }

  private boundEntireRoute(route: GeoJSON.Feature) {
    const map = this.mapInitService.getMap();
    if (!map) return;

    const coordinates = JSON.parse(route.properties.bounds);
    const bounds = new LngLatBounds();

    if (
      route.geometry.type === 'LineString' ||
      route.geometry.type === 'Point'
    ) {
      coordinates.forEach((coord) => {
        bounds.extend([coord[0], coord[1]]);
      });

      map.fitBounds(bounds, {
        padding: 64,
      });
    }

    if (route.geometry.type === 'MultiLineString') {
      coordinates.forEach((lineString) => {
        lineString.forEach((coord) => {
          bounds.extend([coord[0], coord[1]]);
        });
      });

      map.fitBounds(bounds, {
        padding: 64,
      });
    }
  }
}
