import { Component, inject } from '@angular/core';
import {
  MapComponent,
  ControlComponent,
  MarkerComponent,
  LayerComponent,
  GeoJSONSourceComponent,
  FeatureComponent,
} from '@velo/ngx-maplibre-gl';
import { MapLayerMouseEvent, Marker } from 'maplibre-gl';
import { MatCardModule } from '@angular/material/card';

import { SidebarButtonComponent } from './sidebar-button.component';
import { HoverPopupComponent } from './popup-hover.component';
import { ClickPopupComponent } from './popup-click.component';

import { MapStore } from '@velo/maps/data-access';
import { RouteStore } from '@velo/routes/data-access';
import { FiltersRouteComponent } from './filters-route.component';
@Component({
  standalone: true,
  selector: 'app-viewing-map',
  imports: [
    MapComponent,
    ControlComponent,
    MarkerComponent,
    MatCardModule,
    LayerComponent,
    GeoJSONSourceComponent,
    FeatureComponent,
    SidebarButtonComponent,
    HoverPopupComponent,
    ClickPopupComponent,
    FiltersRouteComponent,
  ],
  template: `
    <section class="map-container relative">
      <mgl-map
        [style]="$mapTiles()"
        [zoom]="[11.3]"
        [center]="[18.966941330820333, 50.66308832195875]"
        [cursorStyle]="cursorStyle"
      >
        <!-- <mgl-marker
          [lngLat]="[18.966941330820333, 50.66308832195875]"
          [draggable]="true"
          (markerDragEnd)="onDragEnd($event)"
        ></mgl-marker> -->
        <!-- @if (coordinates) {
          <mgl-control position="bottom-left">
            <mat-card appearance="outlined">
              <div>Longitude:&nbsp;{{ coordinates[0] }}</div>
              <div>Latitude:&nbsp;{{ coordinates[1] }}</div>
            </mat-card>
          </mgl-control>
        } -->

        <mgl-geojson-source id="routes">
          @for (
            route of $bicycleRoutes() ?? [];
            track route.properties['@id']
          ) {
            <mgl-feature
              [geometry]="route.geometry"
              [properties]="route.properties"
            ></mgl-feature>
          }
        </mgl-geojson-source>

        <mgl-layer
          id="route"
          type="line"
          source="routes"
          [layout]="{
            'line-join': 'round',
            'line-cap': 'round',
          }"
          [paint]="{
            'line-color': ['coalesce', ['get', 'colour'], '#1515fa'],
            'line-width': [
              'case',
              ['==', ['get', '@id'], $selectedRoute()?.['@id'] ?? ''],
              4,
              2,
            ],
            'line-opacity': [
              'case',
              ['==', ['get', '@id'], $selectedRoute()?.['@id'] ?? ''],
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
        ></map-click-popup>
      </mgl-map>
      <sidebar-button></sidebar-button>

      <div class="absolute bottom-4 left-4">
        <filters-route></filters-route>
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
  private readonly mapStore = inject(MapStore);
  private readonly routeStore = inject(RouteStore);

  coordinates: number[];
  points: GeoJSON.FeatureCollection<GeoJSON.Point>;
  hoverRoute: GeoJSON.Feature<GeoJSON.Point> | null;
  clickPopupFeature: GeoJSON.Feature<GeoJSON.Point> | null;
  cursorStyle: string = 'grab';

  $mapTiles = this.mapStore.mapTiles;
  $bicycleRoutes = this.mapStore.bicycleRoutes;
  $selectedRoute = this.routeStore.selectedRoute;

  ngOnInit() {
    this.mapStore.getMapTiles('standard');
    this.mapStore.getBicycleRoutes();
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

  selectRoute(event: MouseEvent, route: GeoJSON.Feature<GeoJSON.Point>) {
    event.stopPropagation();
    this.routeStore.setSelectedRoute(
      route.properties as NonNullable<GeoJSON.Feature['properties']>,
    );
  }
}
