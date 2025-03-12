import { Component, inject } from '@angular/core';
import { LayerComponent } from '@velo/ngx-maplibre-gl';
import { MapNavigationService } from '../../services/map-navigation.service';
import { MapInteractionService } from '../../services/map-interaction.service';

@Component({
  selector: 'map-route-layer',
  standalone: true,
  imports: [LayerComponent],
  templateUrl: './route-layer.component.html',
})
export class RouteLayerComponent {
  private readonly mapNavigationService = inject(MapNavigationService);
  private readonly mapInteractionService = inject(MapInteractionService);

  $mapInteraction = this.mapInteractionService;

  $hoveredRouteFeedId = this.mapNavigationService.$hoveredRouteFeedId;
  $selectedRoute = this.mapNavigationService.$selectedRoute;
  $hoveredSubwayId = this.mapNavigationService.$hoveredSubwayId;
}
