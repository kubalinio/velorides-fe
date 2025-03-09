import { effect, inject, Injectable } from '@angular/core';
import { MapLayerMouseEvent } from 'maplibre-gl';
import { MapUrlService } from '@velo/maps/data-access';
import { MapStore } from '@velo/maps/data-access';
import { RouteStore } from '@velo/routes/data-access';
import { MapInitService } from './map-init.service';
import { Marker } from 'maplibre-gl';
import { BBox } from 'geojson';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MapInteractionService {
  private readonly router = inject(Router);

  private readonly mapStore = inject(MapStore);
  private readonly routeStore = inject(RouteStore);
  private readonly mapUrlService = inject(MapUrlService);
  private readonly mapInitService = inject(MapInitService);

  readonly map$ = this.mapInitService.map$;

  coordinates: number[];
  cursorStyle: string = 'grab';
  hoverRoute: GeoJSON.Feature<GeoJSON.Point> | null;

  clickPopupFeature = this.mapInitService.clickPopupFeature;

  constructor() {
    effect(() => {
      this.map$();
    });
  }

  onMapMoveEnd() {
    const map = this.mapInitService.getMap();
    if (!map) return;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = map.getPitch();
    const bounds = map.getBounds();

    const bboxPayload = [
      Number(bounds._sw.lat.toFixed(6)), // south
      Number(bounds._sw.lng.toFixed(6)), // west
      Number(bounds._ne.lat.toFixed(6)), // north
      Number(bounds._ne.lng.toFixed(6)), // east
    ] as BBox;

    this.mapStore.setBbox(bboxPayload);

    this.mapUrlService.updateUrl({
      center: [center.lng, center.lat],
      zoom,
      bearing,
      pitch,
    });
  }

  onDragEnd(marker: Marker) {
    this.coordinates = marker.getLngLat().toArray();
  }

  onMouseEnter(_evt: MapLayerMouseEvent) {
    this.cursorStyle = 'pointer';
  }

  onMouseMove(evt: MapLayerMouseEvent) {
    this.hoverRoute = {
      geometry: {
        coordinates: [evt.lngLat.lng, evt.lngLat.lat],
        type: 'Point',
      },
      properties: {
        name: evt.features[0].properties.name,
        distance: evt.features[0].properties.distance,
      },
      id: evt.features[0].properties['@id'],
      type: 'Feature',
    };
  }

  onMouseMoveWay(evt: MapLayerMouseEvent) {
    this.routeStore.setHoveredSubwayId(evt.features[0].properties.id);

    this.hoverRoute = {
      geometry: {
        coordinates: [evt.lngLat.lng, evt.lngLat.lat],
        type: 'Point',
      },
      properties: {
        type: 'way',
        surface: evt.features[0].properties.surface ?? 'N/A',
      },
      id: evt.features[0].properties['@id'],
      type: 'Feature',
    };
  }

  onMouseLeave() {
    this.cursorStyle = 'grab';
    this.hoverRoute = null;
  }

  onRouteClick(evt: MapLayerMouseEvent) {
    if (
      this.routeStore.selectedRoute()?.['id'] === evt.features[0].properties.id
    ) {
      return;
    }

    this.clickPopupFeature = {
      geometry: {
        coordinates: [evt.lngLat.lng, evt.lngLat.lat],
        type: 'Point',
      },
      properties: evt.features[0].properties,
      type: 'Feature',
    };

    this.routeStore.setSelectedRoute(
      evt.features[0].properties as NonNullable<GeoJSON.Feature['properties']>,
    );

    this.routeStore.setSelectedRouteBounds(evt.features[0] as GeoJSON.Feature);

    this.router.navigate([
      '/explore-map',
      evt.features[0].properties.id.split('/')[1],
    ]);
  }
}
