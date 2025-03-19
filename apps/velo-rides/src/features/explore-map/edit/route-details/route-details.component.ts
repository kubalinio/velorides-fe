import { Component, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideExternalLink, lucideMapPin } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { HlmCardContentDirective } from '@spartan-ng/ui-card-helm';
import { HlmCardTitleDirective } from '@spartan-ng/ui-card-helm';
import { HlmCardHeaderDirective } from '@spartan-ng/ui-card-helm';
import { Feature } from 'geojson';

@Component({
  standalone: true,
  selector: 'velo-route-details',
  providers: [
    provideIcons({
      lucideMapPin,
      lucideExternalLink,
    }),
  ],
  imports: [
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    HlmCardContentDirective,
    NgIconComponent,
  ],
  templateUrl: './route-details.component.html',
})
export class RouteDetailsComponent {
  protected readonly hlm = hlm;

  $selectedRoute = input<NonNullable<Feature['properties']>>();
}
