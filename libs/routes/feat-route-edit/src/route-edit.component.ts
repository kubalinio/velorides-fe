import {
  Component,
  effect,
  inject,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  BrnStepperDirective,
  BrnStepperItemDirective,
} from '@spartan-ng/ui-stepper-brn';
import { RouteStore } from '@velo/routes-data-access';
import {
  EditFormComponent,
  WayFormData,
} from './edit-form/edit-form.component';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { EditHeaderComponent } from './header/header.component';
import { RoutesUiStepperIndicatorComponent } from '@velo/routes-ui-route-stepper';
// import { environment } from '../../../../apps/velo-rides/src/environments/environment';
import { osmAuth } from 'osm-auth';

@Component({
  standalone: true,
  selector: 'lib-routes-feat-route-edit',
  imports: [
    BrnStepperDirective,
    ReactiveFormsModule,
    EditFormComponent,
    BrnStepperItemDirective,
    HlmButtonDirective,
    EditHeaderComponent,
    RoutesUiStepperIndicatorComponent,
  ],
  templateUrl: './route-edit.component.html',
})
export class RouteEditComponent {
  private readonly routeStore = inject(RouteStore);

  @ViewChild(BrnStepperDirective) protected stepper: BrnStepperDirective<
    typeof this.steps
  >;
  @ViewChild(EditFormComponent) currentForm?: EditFormComponent;

  readonly _activatedRoute = inject(ActivatedRoute);

  // Get route ID from route params and fetch route
  readonly getRouteOnChangeId = this._activatedRoute.paramMap.subscribe(
    (params) => {
      const routeId = params.get('id');
      if (routeId) {
        this.routeStore.getRouteById(Number(routeId));
      }
    },
  );

  // Route ways from store;
  $routeWays = this.routeStore.routeWays;
  $selectedRoute = this.routeStore.selectedRoute;

  // Steps for stepper
  protected steps: GeoJSON.Feature[] & { id: string }[] = [];

  // Track the current step form validity
  protected currentStepValid = false;

  auth = new osmAuth({
    apiUrl: 'https://master.apis.dev.openstreetmap.org',
    url: 'https://master.apis.dev.openstreetmap.org',
    client_id: 'BoQU2aPpXO5EpIG1hOd-p3nG8UoOulH5bg4zwycjlKo',
    redirect_uri: 'http://127.0.0.1:4200/explore-map/1829759/edit',
    scope: 'read_prefs write_api',
    singlepage: true,
  });

  $osmUserDetails: WritableSignal<{
    display_name: string;
    id: number;
    count: number;
  } | null> = signal(null);

  private getUserDetails() {
    this.auth.xhr(
      { method: 'GET', path: '/api/0.6/user/details.json' },
      (err, result) => {
        console.log('OSM AUTH ERROR ', err);

        if (result) {
          this.$osmUserDetails.set(JSON.parse(result).user);
        }
      },
    );
  }

  constructor() {
    effect(() => {
      const currentRoute = this.$routeWays();

      if (!currentRoute) return;

      this.steps = currentRoute.map((way) => ({
        ...way,
        id: `${way.id}`,
        title: `Way ${way.properties?.['name'] ?? 'Unnamed'}`,
      }));

      if (this.steps.length > 0 && !this.routeStore.selectedWay()) {
        setTimeout(() => this.selectWayZoom(this.steps[0]), 0);
      }

      if (
        window.location.search
          .slice(1)
          .split('&')
          .some(function (p) {
            return p.indexOf('code=') === 0;
          })
      ) {
        this.auth.authenticate(function () {
          history.pushState({}, '', window.location.pathname);
        });
      }
    });

    this.getUserDetails();
  }

  // Computed property to get current step index
  get currentStepIndex(): number {
    if (!this.stepper || !this.stepper.current) return 0;

    const index = this.stepper.all.findIndex(
      (step) => step.id === this.stepper.current.id,
    );

    // Return a default value if not found, rather than -1
    return index >= 0 ? index : 0;
  }

  selectWayZoom(way: GeoJSON.Feature) {
    this.routeStore.setSelectedWay(
      way as unknown as GeoJSON.Feature<GeoJSON.LineString>,
    );
  }

  onChangeStep(step: GeoJSON.Feature) {
    this.routeStore.setSelectedWay(
      step as unknown as GeoJSON.Feature<GeoJSON.LineString>,
    );
  }

  // Update form validity status from child component
  onFormValidityChange(isValid: boolean): void {
    this.currentStepValid = isValid;
  }

  // Handle form submission from child component
  onWayFormSubmit(wayFormData: WayFormData): void {
    // Extract the numeric ID from the wayId (remove 'way-' prefix)
    const wayIdNumeric = wayFormData.wayId.replace('way-', '');

    // Here you would save the data to the backend
    // this.routeStore.updateWay(wayIdNumeric, wayFormData);

    // For demo, just log the data
    console.log(`Updating way ${wayIdNumeric} with:`, {
      name: wayFormData.name,
      surface: wayFormData.surface,
    });

    // Proceed to next step if not the last step
    if (this.stepper && !this.stepper.isLast) {
      this.stepper.next();
    }
  }

  // Go to previous step
  prevStep(): void {
    if (this.stepper) {
      this.stepper.prev();
    }
  }

  // Skip step
  skipStep(): void {
    if (this.stepper) {
      this.stepper.next();
    }
  }

  // Handle next step with validation
  nextStep(): void {
    if (!this.stepper || !this.stepper.current || !this.currentForm) return;

    // Trigger form submission in the child component
    this.currentForm.submitForm();
  }

  // Submit the final step
  onFinalSubmit(): void {
    if (!this.currentForm) return;

    // Submit the current form
    this.currentForm.submitForm();

    // Here you could add additional logic for final submission
    // such as updating the entire route or finalizing the changes
    console.log('Final step submitted. Route editing complete.');
    this.stepper.reset();

    // Optionally reset the stepper or navigate away
    // this.router.navigate(['/routes']);
  }

  loginToOSM() {
    this.auth.authenticate(() => {
      if (this.auth.authenticated()) {
        this.getUserDetails();
      }
    });
  }

  logoutFromOSM() {
    this.auth.logout();
    this.$osmUserDetails.set(null);
  }
}
