import { Component, effect, inject, ViewChild } from '@angular/core';
import {
  MapComponent,
  LayerComponent,
  GeoJSONSourceComponent,
  FeatureComponent,
} from '@velo/ngx-maplibre-gl';
import { LngLatBounds, Map, MapLayerMouseEvent, Marker } from 'maplibre-gl';
import { MatCardModule } from '@angular/material/card';

import { SidebarButtonComponent } from './sidebar-button.component';
import { HoverPopupComponent } from './popup-hover.component';
import { ClickPopupComponent } from './popup-click.component';

import { MapStore, MapUrlService } from '@velo/maps/data-access';
import { RouteStore } from '@velo/routes/data-access';
import { FiltersRouteComponent } from './filters/filters-route.component';
import { ViewingMapViewpointsComponent } from './viewpoints.component';
import { FiltersWaypointsComponent } from './filters/filters-waypoints.component';
import { BBox } from 'geojson';

@Component({
  standalone: true,
  selector: 'app-viewing-map',
  imports: [
    MapComponent,
    MatCardModule,
    LayerComponent,
    GeoJSONSourceComponent,
    FeatureComponent,
    SidebarButtonComponent,
    HoverPopupComponent,
    ClickPopupComponent,
    FiltersRouteComponent,
    ViewingMapViewpointsComponent,
    FiltersWaypointsComponent,
  ],
  template: `
    <section class="map-container relative">
      <mgl-map
        #mapInstance
        [style]="$mapTiles()"
        [zoom]="[initialZoom]"
        [center]="initialCenter"
        [cursorStyle]="cursorStyle"
        [fitBounds]="bounds"
        [fitBoundsOptions]="{
          padding: 10,
        }"
        [maxZoom]="18"
        (mapLoad)="onMapReady($event)"
        (moveEnd)="onMapMoveEnd()"
      >
        <mgl-geojson-source id="routes">
          @for (
            route of $routesWithUncompletedData()?.features ?? [];
            track route.properties['id']
          ) {
            <mgl-feature
              [geometry]="route.geometry"
              [properties]="route.properties"
            ></mgl-feature>
          }
        </mgl-geojson-source>

        <viewing-map-viewpoints
          (centerMapToCluster)="centerMapToCluster($event)"
        ></viewing-map-viewpoints>

        <mgl-layer
          id="route"
          type="line"
          source="routes"
          [layout]="{
            'line-join': 'round',
            'line-cap': 'round',
          }"
          [paint]="{
            'line-color': [
              'match',
              ['get', 'network'],
              'icn',
              '#8b5cf6',
              'ncn',
              '#b91c1c',
              'rcn',
              '#f97316',
              'lcn',
              '#000000',
              '#000000',
            ],
            'line-width': [
              'case',
              ['==', ['get', 'id'], $selectedRoute()?.['id'] ?? ''],
              4,
              2,
            ],
            'line-opacity': [
              'case',
              ['==', ['get', 'id'], $selectedRoute()?.['id'] ?? ''],
              0.9,
              0.5,
            ],
            'line-gap-width': 0,
            'line-blur': 0,
            'line-translate': [0, 0],
          }"
        >
        </mgl-layer>
        <mgl-layer
          id="route-hover"
          type="line"
          source="routes"
          [layout]="{
            'line-join': 'round',
            'line-cap': 'round',
          }"
          [paint]="{
            'line-color': '#888',
            'line-width': 16,
            'line-opacity': 0,
          }"
          (layerMouseEnter)="onMouseEnter($event)"
          (layerMouseMove)="onMouseMove($event)"
          (layerMouseLeave)="onMouseLeave()"
          (layerClick)="onRouteClick($event)"
        >
        </mgl-layer>

        <map-hover-popup [hoverRoute]="hoverRoute"></map-hover-popup>

        <map-click-popup
          [selectedRoute]="$selectedRoute()"
          [clickPopupFeature]="clickPopupFeature"
          (closePopup)="clearSelectedRoute()"
          (zoomToRoute)="zoomToRoute($event)"
        ></map-click-popup>
      </mgl-map>

      <sidebar-button></sidebar-button>

      <div class="absolute bottom-4 left-4">
        <filters-route></filters-route>
      </div>

      <div class="absolute top-4 left-4">
        <filters-waypoints></filters-waypoints>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }
      .map-container {
        height: 100%;
        width: 100%;
      }
      mgl-map {
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class DisplayMapComponent {
  @ViewChild('mapInstance') mapInstance: MapComponent;
  private map: Map;
  private readonly mapStore = inject(MapStore);
  private readonly routeStore = inject(RouteStore);
  private readonly mapUrlService = inject(MapUrlService);

  bounds: LngLatBounds;
  initialCenter: [number, number];
  initialZoom: number;

  coordinates: number[];
  points: GeoJSON.FeatureCollection<GeoJSON.Point>;
  hoverRoute: GeoJSON.Feature<GeoJSON.Point> | null;
  clickPopupFeature: GeoJSON.Feature<GeoJSON.Point> | null;
  cursorStyle: string = 'grab';

  $mapTiles = this.mapStore.mapTiles;
  $mapPosition = this.mapUrlService.$mapPosition;

  $selectedRoute = this.routeStore.selectedRoute;
  $routesWithUncompletedData = this.routeStore.routesOnArea;
  $selectedRouteBounds = this.routeStore.selectedRouteBounds;

  constructor() {
    effect(() => {
      const selectedRouteBounds = this.$selectedRouteBounds();

      if (selectedRouteBounds) {
        this.boundEntireRoute(
          selectedRouteBounds as unknown as GeoJSON.Feature,
        );
      }
    });
  }

  ngOnInit() {
    this.mapStore.getMapTiles('standard');
  }

  onMapReady(map: Map) {
    const position = this.$mapPosition();
    this.map = map;
    this.initialCenter = position.center;
    this.initialZoom = position.zoom;

    this.map.flyTo({
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
  }

  onMapMoveEnd() {
    if (!this.map) return;

    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    const bearing = this.map.getBearing();
    const pitch = this.map.getPitch();
    const bounds = this.map.getBounds();

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

  onMouseLeave() {
    this.cursorStyle = 'grab';
    this.hoverRoute = null;
  }

  onRouteClick(evt: MapLayerMouseEvent) {
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
  }

  clearSelectedRoute() {
    this.clickPopupFeature = null;
    this.routeStore.clearSelectedRoute();
  }

  centerMapToCluster(event: { coords: number[] }) {
    const coordinates = event.coords;

    this.map.flyTo({
      center: [coordinates[0], coordinates[1]],
      zoom: this.map.getZoom() + 1.25,
      bearing: 0,
      pitch: 0,
    });
  }

  zoomToRoute(element: GeoJSON.Feature) {
    this.boundEntireRoute(element);
  }

  private boundEntireRoute(route: GeoJSON.Feature) {
    const coordinates = JSON.parse(route.properties.bounds);
    const bounds = new LngLatBounds();

    if (
      route.geometry.type === 'LineString' ||
      route.geometry.type === 'Point'
    ) {
      coordinates.forEach((coord) => {
        bounds.extend([coord[0], coord[1]]);
      });

      this.map.fitBounds(bounds, {
        padding: 64,
      });
    }

    if (route.geometry.type === 'MultiLineString') {
      coordinates.forEach((lineString) => {
        lineString.forEach((coord) => {
          bounds.extend([coord[0], coord[1]]);
        });
      });

      this.map.fitBounds(bounds, {
        padding: 64,
      });
    }
  }
}
