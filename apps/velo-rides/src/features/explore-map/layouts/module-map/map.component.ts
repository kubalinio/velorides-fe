import { Component, inject, ViewChild } from '@angular/core';
import {
  MapComponent,
  GeoJSONSourceComponent,
  FeatureComponent,
} from '@velo/ngx-maplibre-gl';
import { LngLatBounds } from 'maplibre-gl';
import { MatCardModule } from '@angular/material/card';

import { SidebarButtonComponent } from './components/sidebar-button.component';
import { HoverPopupComponent } from './components/popups/popup-hover.component';
import { ClickPopupComponent } from './components/popups/popup-click.component';

import { MapStore, MapUrlService } from '@velo/maps/data-access';
import { FiltersRouteComponent } from './components/filters/filters-route.component';
import { ViewingMapViewpointsComponent } from './components/viewpoints/viewpoints.component';
import { FiltersWaypointsComponent } from './components/filters/filters-waypoints.component';
import { MapInitService } from './services/map-init.service';
import { MapInteractionService } from './services/map-interaction.service';
import { MapNavigationService } from './services/map-navigation.service';
import {
  RoutesStore,
  RouteStore,
  RouteWaysService,
} from '@velo/routes/data-access';
import { MapStylesService } from './services/map-styles.service';
import { WayLayerComponent } from './components/routes/way-layer.component';
import { RouteLayerComponent } from './components/routes/route-layer.component';

@Component({
  standalone: true,
  selector: 'app-explore-map',
  imports: [
    MapComponent,
    MatCardModule,
    GeoJSONSourceComponent,
    FeatureComponent,
    SidebarButtonComponent,
    HoverPopupComponent,
    ClickPopupComponent,
    FiltersRouteComponent,
    FiltersWaypointsComponent,
    ViewingMapViewpointsComponent,
    WayLayerComponent,
    RouteLayerComponent,
  ],
  templateUrl: './map.component.html',
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
export class ExploreMapComponent {
  @ViewChild('mapInstance') mapInstance: MapComponent;

  private readonly mapStore = inject(MapStore);
  private readonly mapUrlService = inject(MapUrlService);
  private readonly routesStore = inject(RoutesStore);
  private readonly routeStore = inject(RouteStore);

  readonly routeWaysService = inject(RouteWaysService);

  private readonly mapInitService = inject(MapInitService);
  private readonly mapInteractionService = inject(MapInteractionService);

  private readonly mapNavigationService = inject(MapNavigationService);
  readonly mapStylesService = inject(MapStylesService);

  $routesWithUncompletedData = this.routesStore.routes;
  $routeWays = this.routeStore.routeWays;
  $selectedRoute = this.routeStore.selectedRoute;

  bounds: LngLatBounds;
  points: GeoJSON.FeatureCollection<GeoJSON.Point>;

  $mapTiles = this.mapStore.mapTiles;
  $mapPosition = this.mapUrlService.$mapPosition;
  $mapInitService = this.mapInitService;

  $mapInteraction = this.mapInteractionService;
  $mapNavigationService = this.mapNavigationService;

  ngOnInit() {
    this.mapStore.getMapTiles('standard');
  }
}
