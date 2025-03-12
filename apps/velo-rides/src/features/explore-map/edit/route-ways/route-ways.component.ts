import { Component, inject, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideExternalLink } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmCardContentDirective } from '@spartan-ng/ui-card-helm';

import { RouteStore, RouteWaysService } from '@velo/routes/data-access';

@Component({
  selector: 'velo-route-ways',
  standalone: true,
  imports: [HlmCardDirective, HlmCardContentDirective, NgIconComponent],
  providers: [
    provideIcons({
      lucideExternalLink,
    }),
  ],
  templateUrl: './route-ways.component.html',
})
export class RouteWaysComponent {
  private readonly routeStore = inject(RouteStore);
  private readonly routeWaysService = inject(RouteWaysService);
  readonly routeWays = input<GeoJSON.Feature[]>([]);
  readonly hlm = hlm;

  $hoveredSubwayId = this.routeStore.hoveredSubwayId;

  selectSubway(id: string | null) {
    this.routeStore.setHoveredSubwayId(id);
  }

  readonly getSurfaceColor = this.routeWaysService.getSurfaceColor;

  readonly formatSufaceName = this.routeWaysService.formatSufaceName;
}
