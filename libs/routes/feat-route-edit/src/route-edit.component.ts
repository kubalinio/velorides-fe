import { Component } from '@angular/core';
import { RoutesUiRouteStepperComponent } from '@velo/routes-ui-route-stepper';

@Component({
  standalone: true,
  selector: 'lib-routes-feat-route-edit',
  imports: [RoutesUiRouteStepperComponent],
  templateUrl: './route-edit.component.html',
})
export class RouteEditComponent {}
