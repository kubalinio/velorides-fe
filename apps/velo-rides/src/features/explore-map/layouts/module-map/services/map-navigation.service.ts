import { effect, inject, Injectable } from '@angular/core';
import { MapInitService } from './map-init.service';
import { LngLatBounds } from 'maplibre-gl';
import { RouteStore, RoutesStore } from '@velo/routes-data-access';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MapNavigationService {
  private readonly router = inject(Router);
  private readonly mapInitService = inject(MapInitService);
  private readonly routesStore = inject(RoutesStore);
  private readonly routeStore = inject(RouteStore);
  readonly map$ = this.mapInitService.map$;

  $routesWithUncompletedData = this.routesStore.routes;

  $selectedRoute = this.routeStore.selectedRoute;
  $selectedRouteBounds = this.routeStore.selectedRouteBounds;
  $selectedWay = this.routeStore.selectedWay;

  $hoveredSubwayId = this.routeStore.hoveredSubwayId;
  $hoveredRouteFeedId = this.routesStore.hoveredRouteFeedId;

  readonly onSelectedRouteChange = effect(() => {
    const selectedRouteBounds = this.$selectedRouteBounds();
    const map = this.mapInitService.getMap();

    if (selectedRouteBounds && map) {
      this.boundEntireRoute(selectedRouteBounds as unknown as GeoJSON.Feature);
    }
  });

  readonly onSelectedWayChange = effect(() => {
    const selectedWay =
      this.$selectedWay() as GeoJSON.Feature<GeoJSON.LineString>;
    const map = this.mapInitService.getMap();

    if (selectedWay && map) {
      this.boundEntireRoute(selectedWay, {
        padding: 256,
        maxZoom: 15.5,
      });
    }
  });

  clearSelectedRoute() {
    this.mapInitService.clickPopupFeature = null;
    this.routeStore.clearSelectedRoute();

    this.router.navigate(['/explore-map']);
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

  private boundEntireRoute(
    route: GeoJSON.Feature,
    options?: {
      padding?: number;
      maxZoom?: number;
    },
  ) {
    const map = this.mapInitService.getMap();
    if (!map) return;

    if (!route.properties?.bounds) {
      console.warn('Route bounds are undefined, cannot fit bounds to map');
      return;
    }

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
        padding: options?.padding ?? 64,
        maxZoom: options?.maxZoom ?? 17,
      });
    }

    if (route.geometry.type === 'MultiLineString') {
      coordinates.forEach((lineString) => {
        lineString.forEach((coord) => {
          bounds.extend([coord[0], coord[1]]);
        });
      });

      map.fitBounds(bounds, {
        padding: options?.padding ?? 64,
        maxZoom: options?.maxZoom ?? 17,
      });
    }
  }
}
