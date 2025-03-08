import { Component, inject, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideExternalLink } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmCardContentDirective } from '@spartan-ng/ui-card-helm';

import { RouteStore } from '@velo/routes/data-access';

@Component({
  selector: 'velo-route-subways',
  standalone: true,
  imports: [HlmCardDirective, HlmCardContentDirective, NgIconComponent],
  providers: [
    provideIcons({
      lucideExternalLink,
    }),
  ],
  templateUrl: './route-subways.component.html',
})
export class RouteSubwaysComponent {
  private readonly routeStore = inject(RouteStore);
  readonly routeSubways = input<GeoJSON.Feature[]>([]);
  readonly hlm = hlm;

  selectSubway(id: string | null) {
    this.routeStore.setHoveredSubwayId(id);
  }
}
