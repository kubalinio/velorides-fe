import { Component, inject } from '@angular/core';
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

import { MapStore } from '@velo/maps/data-access';
import { RouteStore } from '@velo/routes/data-access';
import { FiltersRouteComponent } from './filters/filters-route.component';
import { ViewingMapViewpointsComponent } from './viewpoints.component';
import { FiltersWaypointsComponent } from './filters/filters-waypoints.component';
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
        [style]="$mapTiles()"
        [zoom]="[11]"
        [center]="[18.966941330820333, 50.66308832195875]"
        [cursorStyle]="cursorStyle"
        [fitBounds]="bounds"
        [fitBoundsOptions]="{
          padding: 10,
        }"
        [maxZoom]="18"
        (mapLoad)="onMapReady($event)"
      >
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
          (closePopup)="clearSelectedRoute()"
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
  private map: Map;
  bounds: LngLatBounds;

  private readonly mapStore = inject(MapStore);
  private readonly routeStore = inject(RouteStore);

  coordinates: number[];
  points: GeoJSON.FeatureCollection<GeoJSON.Point>;
  hoverRoute: GeoJSON.Feature<GeoJSON.Point> | null;
  clickPopupFeature: GeoJSON.Feature<GeoJSON.Point> | null;
  cursorStyle: string = 'grab';
  // private map: Map;
  $mapTiles = this.mapStore.mapTiles;
  $bicycleRoutes = this.mapStore.bicycleRoutes;
  $selectedRoute = this.routeStore.selectedRoute;

  ngOnInit() {
    this.mapStore.getMapTiles('standard');
    this.mapStore.getBicycleRoutes();
  }

  onMapReady(map: Map) {
    this.map = map;
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
}
