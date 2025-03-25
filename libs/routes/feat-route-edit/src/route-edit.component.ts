import { Component, effect, inject, ViewChild } from '@angular/core';
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
    });
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
}
