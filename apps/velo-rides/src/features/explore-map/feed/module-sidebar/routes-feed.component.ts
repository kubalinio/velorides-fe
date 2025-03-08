import { Component, input, output } from '@angular/core';

import { NgIconComponent } from '@ng-icons/core';
import { hlm } from '@spartan-ng/brain/core';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';

@Component({
  standalone: true,
  selector: 'sidebar-routes-feed',
  imports: [NgIconComponent, HlmCardDirective],
  templateUrl: './routes-feed.component.html',
})
export class RoutesFeedComponent {
  protected readonly hlm = hlm;

  routes = input<GeoJSON.Feature[]>([]);
  hoveredRouteFeedId = input<string | null>(null);

  onSelectRoute = output<GeoJSON.Feature>();
  onHoverRoute = output<string | null>();
}
