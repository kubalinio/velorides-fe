import { Component } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';

@Component({
  standalone: true,
  selector: 'sidebar-route-types',
  templateUrl: './route-types.component.html',
})
export class RouteTypesComponent {
  protected readonly hlm = hlm;
}
