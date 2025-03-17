import { Component, input, output } from '@angular/core';

import { provideIcons } from '@ng-icons/core';
import { lucideLocateFixed } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';

@Component({
  standalone: true,
  selector: 'velo-routes-feed',
  providers: [provideIcons({ lucideLocateFixed })],
  imports: [HlmCardDirective],
  templateUrl: './routes-feed.component.html',
})
export class RoutesFeedComponent {
  protected readonly hlm = hlm;

  routes = input<GeoJSON.Feature[]>([]);
  hoveredRouteFeedId = input<string | null>(null);

  onSelectRoute = output<GeoJSON.Feature>();
  onHoverRoute = output<string | null>();
  onZoomToRoute = output<GeoJSON.Feature>();
}
