import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  BrnStepperModule,
  BrnStepperDirective,
  BrnStepperItemDirective,
} from '@spartan-ng/ui-stepper-brn';

type StepId = 'way-1' | 'way-2' | 'way-3';
type StepMetadata = { form: FormGroup };

@Component({
  standalone: true,
  selector: 'lib-routes-ui-route-stepper',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BrnStepperModule,
    BrnStepperDirective,
    BrnStepperItemDirective,
  ],
  templateUrl: './route-stepper.component.html',
})
export class RoutesUiRouteStepperComponent {
  steps = [
    { id: 'way-1', title: 'Way 1' },
    { id: 'way-2', title: 'Way 2' },
    { id: 'way-3', title: 'Way 3' },
  ];

  @ViewChild(BrnStepperDirective) protected stepper: BrnStepperDirective<
    typeof this.steps
  >;

  // Form groups for each step
  wayForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Initialize forms
    this.wayForm = this.fb.group({
      'way-1': ['', Validators.required],
      'way-2': ['', Validators.required],
      'way-3': ['', Validators.required],
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

  // Helper method to safely navigate to a step (called from template)
  navigateToStep(id: string): void {
    if (!this.stepper) return;

    if (['way-1', 'way-2', 'way-3'].includes(id)) {
      this.goToStep(id as StepId);
    }
  }

  // Navigate to step only if previous steps are valid
  goToStep(stepId: StepId): void {
    const targetIndex = this.stepper.all.findIndex(
      (step) => step.id === stepId,
    );
    const currentIndex = this.currentStepIndex;

    // Allow backward navigation
    if (targetIndex < currentIndex) {
      this.stepper.goTo(stepId);
      return;
    }

    // For forward navigation, validate all previous steps
    let canProceed = true;
    for (let i = 0; i < targetIndex; i++) {
      const step = this.stepper.all[i];
      const metadata = this.stepper.getMetadata<StepMetadata>(
        step.id as StepId,
      );
      if (metadata && metadata['form'] && !metadata['form'].valid) {
        canProceed = false;
        // Mark all controls as touched to show validation errors
        metadata['form'].markAllAsTouched();
        // Navigate to the first invalid step
        if (i < currentIndex) {
          this.stepper.goTo(step.id);
          return;
        }
        break;
      }
    }

    if (canProceed) {
      this.stepper.goTo(stepId);
    }
  }

  // Handle next step with validation
  nextStep(): void {
    const currentStep = this.stepper.current;
    const metadata = this.stepper.getMetadata<StepMetadata>(
      currentStep.id as StepId,
    );

    if (metadata && metadata['form']) {
      metadata['form'].markAllAsTouched();
      if (metadata['form'].valid) {
        this.stepper.next();
      }
    } else {
      this.stepper.next();
    }
  }

  // Check if a form control is invalid
  isInvalid(stepId: string, controlName: string): boolean {
    const form = this.getFormForStep(stepId as StepId);
    const control = form?.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  // Get the appropriate form for a step
  getFormForStep(stepId: StepId): FormGroup | null {
    switch (stepId) {
      case 'way-1':
        return this.wayForm;
      case 'way-2':
        return this.wayForm;
      case 'way-3':
        return this.wayForm;
      default:
        return null;
    }
  }

  // Get country name from country code
  getCountryName(countryCode: string): string {
    const countries: Record<string, string> = {
      US: 'United States',
      CA: 'Canada',
      UK: 'United Kingdom',
      AU: 'Australia',
    };
    return countries[countryCode] || countryCode;
  }

  // Check if form can be submitted
  canSubmit(): boolean {
    return this.wayForm.valid && this.wayForm.valid && this.wayForm.valid;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.canSubmit()) {
      // Combine all form data
      const formData = {
        ...this.wayForm.value,
        ...this.wayForm.value,
        ...this.wayForm.value,
      };

      console.log('Form submitted:', formData);
      alert('Form submitted successfully!');

      // Reset the stepper and forms
      this.wayForm.reset();
      this.wayForm.reset();
      this.wayForm.reset();
      this.stepper.reset();
    }
  }
}
