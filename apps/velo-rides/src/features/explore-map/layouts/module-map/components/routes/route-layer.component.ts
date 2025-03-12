import { Component, inject } from '@angular/core';
import { LayerComponent } from '@velo/ngx-maplibre-gl';
import { MapNavigationService } from '../../services/map-navigation.service';
import { RoutesStore, RouteStore } from '@velo/routes/data-access';
import { MapInteractionService } from '../../services/map-interaction.service';

@Component({
  selector: 'map-route-layer',
  standalone: true,
  imports: [LayerComponent],
  templateUrl: './route-layer.component.html',
})
export class RouteLayerComponent {
  private readonly mapNavigationService = inject(MapNavigationService);
  private readonly routesStore = inject(RoutesStore);
  private readonly routeStore = inject(RouteStore);
  private readonly mapInteractionService = inject(MapInteractionService);

  $mapInteraction = this.mapInteractionService;
  $mapNavigationService = this.mapNavigationService;

  $hoveredRouteFeedId = this.routesStore.hoveredRouteFeedId;
  $selectedRoute = this.routeStore.selectedRoute;
}
