import { inject, Injectable, signal } from '@angular/core';
import { MapUrlService } from '@velo/maps/data-access';
import { RoutesStore } from '@velo/routes/data-access';
import { Map } from 'maplibre-gl';
import { BBox } from 'geojson';

@Injectable({
  providedIn: 'root',
})
export class MapInitService {
  private readonly mapUrlService = inject(MapUrlService);
  private readonly routesStore = inject(RoutesStore);

  private readonly _map = signal<Map | null>(null);
  readonly map$ = this._map.asReadonly();

  initialCenter: [number, number];
  initialZoom: number;
  clickPopupFeature: GeoJSON.Feature<GeoJSON.Point> | null;

  $mapPosition = this.mapUrlService.$mapPosition;
  $routesWithUncompletedData = this.routesStore.routes;

  constructor() {
    const position = this.$mapPosition();
    this.initialCenter = position.center;
    this.initialZoom = position.zoom;
  }

  onMapReady(map: Map) {
    this._map.set(map);
    const position = this.$mapPosition();

    map.flyTo({
      center: position.center,
      zoom: position.zoom,
      bearing: position.bearing || 0,
      pitch: position.pitch || 0,
      duration: 0, // No animation for URL-based updates
    });

    if (position.bearing) {
      map.setBearing(position.bearing);
    }
    if (position.pitch) {
      map.setPitch(position.pitch);
    }

    // Get initial routes for the current bounds
    const bounds = map.getBounds();
    const bboxPayload = [
      Number(bounds._sw.lat.toFixed(6)), // south
      Number(bounds._sw.lng.toFixed(6)), // west
      Number(bounds._ne.lat.toFixed(6)), // north
      Number(bounds._ne.lng.toFixed(6)), // east
    ] as BBox;
    this.routesStore.getRoutesByArea(bboxPayload);
  }

  getMap(): Map | null {
    return this._map();
  }
}
