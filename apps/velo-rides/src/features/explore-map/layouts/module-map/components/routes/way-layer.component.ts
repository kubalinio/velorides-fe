import { Component, inject } from '@angular/core';
import { LayerComponent } from '@velo/ngx-maplibre-gl';
import { MapInteractionService } from '../../services/map-interaction.service';
import { RouteStore } from '@velo/routes-data-access';

@Component({
  selector: 'map-way-layer',
  standalone: true,
  imports: [LayerComponent],
  template: `
    <mgl-layer
      id="route-way"
      type="line"
      source="route-way"
      [layout]="{
        'line-join': 'round',
        'line-cap': 'round',
      }"
      [paint]="{
        'line-color': [
          'match',
          ['get', 'surface'],
          'paved',
          '#3b82f6',
          'asphalt',
          '#374151',
          'gravel',
          '#eab308',
          'ground',
          '#78716c',
          'unpaved',
          '#f97316',
          'wood',
          '#262626',
          'compacted',
          '#f59e0b',
          'paving_stones',
          '#3b82f6',
          'unhewn_cobblestone',
          '#374151',
          'cobblestone',
          '#78716c',
          'concrete',
          '#dc2626',
          '#dc2626',
        ],
        'line-width': [
          'case',
          [
            'in',
            ['get', 'surface'],
            [
              'literal',
              [
                'asphalt',
                'concrete',
                'paved',
                'unpaved',
                'ground',
                'wood',
                'gravel',
                'compacted',
                'paving_stones',
                'unhewn_cobblestone',
                'cobblestone',
              ],
            ],
          ],
          6,
          8,
        ],
        'line-opacity': [
          'case',
          [
            '==',
            ['get', 'id'],
            $hoverWayId() || $selectedWay()?.properties['id'] || '',
          ],
          1,
          0,
        ],
      }"
      (layerMouseEnter)="this.$mapInteraction.onMouseMoveWay($event)"
      (layerMouseMove)="this.$mapInteraction.onMouseMoveWay($event)"
      (layerMouseLeave)="this.onMouseLeaveWay()"
    >
    </mgl-layer>
  `,
})
export class WayLayerComponent {
  private readonly mapInteractionService = inject(MapInteractionService);
  private readonly routeStore = inject(RouteStore);

  $routeWays = this.routeStore.routeWays;
  $hoverWayId = this.routeStore.hoveredSubwayId;
  $mapInteraction = this.mapInteractionService;
  $selectedWay = this.routeStore.selectedWay;

  onMouseLeaveWay() {
    this.routeStore.setHoveredSubwayId(null);
    this.$mapInteraction.onMouseLeave();
  }
}
