import { Component } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';

import {
  BrnHoverCardComponent,
  BrnHoverCardContentDirective,
  BrnHoverCardTriggerDirective,
} from '@spartan-ng/brain/hover-card';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

import { HlmHoverCardContentComponent } from '@spartan-ng/ui-hovercard-helm';

@Component({
  standalone: true,
  selector: 'velo-route-types',
  imports: [
    BrnHoverCardComponent,
    BrnHoverCardContentDirective,
    BrnHoverCardTriggerDirective,
    HlmHoverCardContentComponent,
    HlmButtonDirective,
  ],
  templateUrl: './route-types.component.html',
})
export class RouteTypesComponent {
  protected readonly hlm = hlm;
}
