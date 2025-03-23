# Route Stepper Angular Directive

## Overview

The Route Stepper Angular Directive provides a simple way to implement multi-step flows in your Angular applications. It's built on top of Angular signals for reactive state management and follows best practices for Angular directive development. This implementation uses the new Angular signal-based inputs introduced in Angular 17+ and encapsulates all state management within the directive, providing a context-based approach that doesn't require template references or service injection.

## Installation

The directive is part of the `ui-route-stepper` library and can be imported directly into your Angular modules or standalone components.

```typescript
import { BrnStepperDirective } from '@your-org/ui-route-stepper';
// or
import { BrnStepperModule } from '@your-org/ui-route-stepper';
```

## Basic Usage

### Define your steps

First, define the steps for your stepper:

```typescript
import { Component } from '@angular/core';
import { Step } from '@your-org/ui-route-stepper';

@Component({
  selector: 'app-step-flow',
  templateUrl: './step-flow.component.html',
})
export class StepFlowComponent {
  steps: Step[] = [
    { id: 'personal', title: 'Personal Information' },
    { id: 'contact', title: 'Contact Details' },
    { id: 'review', title: 'Review and Submit' },
  ];

  submit() {
    console.log('Form submitted');
  }
}
```

### Use the directive in your template

Then, use the directive in your template with a template reference variable:

```html
<div class="stepper-container" [brnStepper]="steps" [initialStep]="'personal'" #stepper="brnStepper" (stepChange)="onStepChange($event)">
  <!-- Display current step information -->
  <h2>{{ stepper.current.title }}</h2>

  <!-- Step navigation -->
  <div class="navigation">
    <button *ngIf="!stepper.isFirst" (click)="stepper.prev()">Back</button>

    <button *ngIf="!stepper.isLast" (click)="stepper.next()">Next</button>

    <button *ngIf="stepper.isLast" (click)="submit()">Submit</button>
  </div>

  <!-- Conditional content based on current step -->
  <ng-container [ngSwitch]="stepper.current.id">
    <app-personal-step *ngSwitchCase="'personal'"></app-personal-step>
    <app-contact-step *ngSwitchCase="'contact'"></app-contact-step>
    <app-review-step *ngSwitchCase="'review'"></app-review-step>
  </ng-container>
</div>
```

### Handle Step Changes

You can listen to step changes via the `stepChange` output:

```typescript
import { Component } from '@angular/core';
import { Step } from '@your-org/ui-route-stepper';

@Component({
  selector: 'app-step-flow',
  templateUrl: './step-flow.component.html',
})
export class StepFlowComponent {
  steps: Step[] = [
    { id: 'personal', title: 'Personal Information' },
    { id: 'contact', title: 'Contact Details' },
    { id: 'review', title: 'Review and Submit' },
  ];

  onStepChange(step: Step) {
    console.log('Step changed to:', step.id);
  }

  submit() {
    console.log('Form submitted');
  }
}
```

### Signal-Based Configuration

The directive uses signal-based inputs for better performance and reactivity:

```typescript
import { Component, signal } from '@angular/core';
import { Step } from '@your-org/ui-route-stepper';

@Component({
  selector: 'app-dynamic-step-flow',
  templateUrl: './dynamic-step-flow.component.html',
})
export class DynamicStepFlowComponent {
  // You can use signals for reactive step management
  steps = signal<Step[]>([
    { id: 'personal', title: 'Personal Information' },
    { id: 'contact', title: 'Contact Details' },
  ]);

  // Signal-based initial step that can be changed reactively
  currentInitialStep = signal<string>('personal');

  // You can dynamically update steps
  addReviewStep() {
    this.steps.update((steps) => [...steps, { id: 'review', title: 'Review and Submit' }]);
  }

  // Change initial step dynamically
  setInitialStep(id: string) {
    this.currentInitialStep.set(id);
  }
}
```

```html
<div class="stepper-container" [brnStepper]="steps()" [initialStep]="currentInitialStep()" #stepper="brnStepper">
  <h2>{{ stepper.current.title }}</h2>
  <!-- Rest of your template -->
</div>
```

## Advanced Usage

### Using with Reactive Forms

The stepper can be integrated with Angular's reactive forms to create multi-step forms:

```typescript
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrnStepperDirective } from '@your-org/ui-route-stepper';

@Component({
  selector: 'app-multi-step-form',
  templateUrl: './multi-step-form.component.html',
})
export class MultiStepFormComponent implements OnInit {
  steps = [
    { id: 'personal', title: 'Personal Information' },
    { id: 'contact', title: 'Contact Details' },
    { id: 'review', title: 'Review and Submit' },
  ];

  personalForm!: FormGroup;
  contactForm!: FormGroup;

  @ViewChild('stepper') stepper!: BrnStepperDirective<typeof this.steps>;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.personalForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });

    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  onNextWithValidation(): void {
    // Check which form to validate based on current step
    if (this.stepper.current.id === 'personal' && this.personalForm.valid) {
      this.stepper.next();
    } else if (this.stepper.current.id === 'contact' && this.contactForm.valid) {
      this.stepper.next();
    }
  }

  submit(): void {
    if (this.personalForm.valid && this.contactForm.valid) {
      const formData = {
        ...this.personalForm.value,
        ...this.contactForm.value,
      };
      // Process form submission
      console.log('Form data:', formData);
    }
  }
}
```

```html
<div class="stepper-container" [brnStepper]="steps" #stepper="brnStepper">
  <h2>{{ stepper.current.title }}</h2>

  <!-- Conditional content based on current step -->
  <ng-container [ngSwitch]="stepper.current.id">
    <ng-container *ngSwitchCase="'personal'">
      <form [formGroup]="personalForm">
        <div class="form-field">
          <label>First Name</label>
          <input formControlName="firstName" />
        </div>
        <div class="form-field">
          <label>Last Name</label>
          <input formControlName="lastName" />
        </div>
      </form>
    </ng-container>

    <ng-container *ngSwitchCase="'contact'">
      <form [formGroup]="contactForm">
        <div class="form-field">
          <label>Email</label>
          <input type="email" formControlName="email" />
        </div>
        <div class="form-field">
          <label>Phone</label>
          <input formControlName="phone" />
        </div>
      </form>
    </ng-container>

    <ng-container *ngSwitchCase="'review'">
      <div class="review-data">
        <h3>Personal Information</h3>
        <p>First Name: {{ personalForm.get('firstName')?.value }}</p>
        <p>Last Name: {{ personalForm.get('lastName')?.value }}</p>

        <h3>Contact Details</h3>
        <p>Email: {{ contactForm.get('email')?.value }}</p>
        <p>Phone: {{ contactForm.get('phone')?.value }}</p>
      </div>
    </ng-container>
  </ng-container>

  <!-- Navigation controls -->
  <div class="navigation">
    <button *ngIf="!stepper.isFirst" (click)="stepper.prev()">Back</button>

    <button *ngIf="!stepper.isLast" (click)="onNextWithValidation()">Next</button>

    <button *ngIf="stepper.isLast" (click)="submit()">Submit</button>
  </div>
</div>
```

### Using Async Transitions

The stepper supports async transitions with the `beforeNext`, `afterNext`, `beforePrev`, and other transition methods:

```typescript
import { Component, ViewChild } from '@angular/core';
import { BrnStepperDirective } from '@your-org/ui-route-stepper';

@Component({
  selector: 'app-async-stepper',
  template: `
    <div [brnStepper]="steps" #stepper="brnStepper">
      <h2>{{ stepper.current.title }}</h2>

      <button (click)="validateAndProceed()">Next</button>
    </div>
  `,
})
export class AsyncStepperComponent {
  steps = [
    { id: 'step1', title: 'Step 1' },
    { id: 'step2', title: 'Step 2' },
    { id: 'step3', title: 'Step 3' },
  ];

  @ViewChild('stepper') stepper!: BrnStepperDirective<typeof this.steps>;

  async validateAndProceed(): Promise<void> {
    // Use beforeNext to run validation before proceeding
    await this.stepper.beforeNext(async () => {
      // Perform async validation or API calls
      const isValid = await this.validateCurrentStep();
      return isValid; // Return true to proceed, false to prevent transition
    });
  }

  async validateCurrentStep(): Promise<boolean> {
    // Simulate API call or validation
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });
  }
}
```

## API Reference

### Components

- `BrnStepperDirective`: The directive that attaches to a DOM element and provides stepper functionality.

### Signal-Based Inputs

- `[brnStepper]`: The array of step objects. Each step must have an `id` property. This is a required input.
- `[initialStep]`: (Optional) The ID of the initial step to display.
- `[initialMetadata]`: (Optional) Initial metadata for the steps.

### Outputs

- `(stepChange)`: Event emitted when the current step changes.

### Methods

- `next()`: Navigate to the next step.
- `prev()`: Navigate to the previous step.
- `goTo(id)`: Navigate to a specific step by ID.
- `reset()`: Reset the stepper to the initial state.
- `beforeNext(callback)`: Execute a function before navigating to the next step.
- `afterNext(callback)`: Execute a function after navigating to the next step.
- `beforePrev(callback)`: Execute a function before navigating to the previous step.
- `afterPrev(callback)`: Execute a function after navigating to the previous step.
- `beforeGoTo(id, callback)`: Execute a function before navigating to a specific step.
- `afterGoTo(id, callback)`: Execute a function after navigating to a specific step.
- `setMetadata(id, data)`: Set metadata for a specific step.
- `getMetadata(id)`: Get metadata for a specific step.
- `resetMetadata(keepInitialMetadata)`: Reset the metadata.

### Properties

- `current`: The current step object.
- `isLast`: Whether the current step is the last step.
- `isFirst`: Whether the current step is the first step.
- `all`: All steps in the stepper.
- `metadata`: Metadata for all steps.

## Conditional Rendering

The directive provides several methods for conditional rendering:

- `when(id, whenFn, elseFn)`: Execute a function based on the current step ID.
- `switch(when)`: Similar to a switch statement for different step IDs.
- `match(state, matches)`: Match the current state against a set of possible states.

## Benefits of the Encapsulated Directive Approach

Using an encapsulated directive approach provides several advantages:

1. **Self-Contained**: All state management is contained within the directive, reducing component complexity.
2. **Simplified Usage**: Users only need to use the directive with a template reference variable.
3. **Cleaner API**: The public API is clearly defined by the directive's interface.
4. **Better Encapsulation**: The stepper state is properly encapsulated in the directive.
5. **Improved Testability**: The directive can be tested directly without internal service dependencies.
6. **No Service Injection**: Components don't need to inject any services.
7. **Separation of Concerns**: Clear separation between the directive API and internal implementation.

## Benefits of Signal-Based Inputs

Using signal-based inputs in this directive provides several advantages:

1. **Improved Performance**: Signals are more efficient than Angular's traditional change detection.
2. **Fine-Grained Reactivity**: Only components that depend on changed signals are updated.
3. **Better Debugging**: Signal changes are more traceable and easier to debug.
4. **No Zone.js Dependency**: Signal-based reactivity doesn't require Zone.js.
5. **Enhanced Type Safety**: Signal-based inputs provide better TypeScript type checking.
6. **Reactive Programming Model**: Integrates well with RxJS and other reactive programming patterns.

## Migration Guide from v1 to v2

### What Changed?

In v2, the `StepperStateService` is now encapsulated within the directive instead of being exposed as a public API. This provides better encapsulation and a simpler API surface.

### How to Migrate

1. **Remove service injection** - You no longer need to inject `StepperStateService` in your components:

```typescript
// BEFORE
import { Component, OnInit } from '@angular/core';
import { Step, StepperStateService } from '@your-org/ui-route-stepper';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  providers: [StepperStateService]
})
export class StepperComponent implements OnInit {
  steps = [...];

  constructor(public stepper: StepperStateService<typeof this.steps>) {}

  ngOnInit() {
    this.stepper.initialize(this.steps, 'initial-step');
  }
}
```

```typescript
// AFTER
import { Component } from '@angular/core';
import { Step } from '@your-org/ui-route-stepper';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html'
})
export class StepperComponent {
  steps = [...];
}
```

2. **Use template reference variables** - Instead of injecting the service, use the directive's export:

```html
<!-- BEFORE -->
<div [brnStepper]="steps" [initialStep]="'initial-step'">
  <h2>{{ stepper.current.title }}</h2>
  <button (click)="stepper.next()">Next</button>
</div>
```

```html
<!-- AFTER -->
<div [brnStepper]="steps" [initialStep]="'initial-step'" #stepper="brnStepper">
  <h2>{{ stepper.current.title }}</h2>
  <button (click)="stepper.next()">Next</button>
</div>
```

3. **Replace service event subscriptions** with the directive's output:

```typescript
// BEFORE
this.stepper.stepChange.subscribe((step) => {
  console.log('Step changed:', step);
});
```

```html
<!-- AFTER -->
<div [brnStepper]="steps" [initialStep]="'initial-step'" #stepper="brnStepper" (stepChange)="onStepChange($event)">
  <!-- ... -->
</div>
```

```typescript
onStepChange(step: Step) {
  console.log('Step changed:', step);
}
```

4. **Use ViewChild to access the stepper programmatically**:

```typescript
@ViewChild('stepper') stepper!: BrnStepperDirective<typeof this.steps>;

// Now you can use this.stepper in your component methods
nextStep() {
  this.stepper.next();
}
```

### Benefits of This Change

- Simpler component code with less boilerplate
- Better encapsulation of internal implementation details
- Clearer API surface
- Improved testability
- More aligned with standard Angular patterns for directives

## Context-Based Approach (Recommended)

The stepper now provides a context-based approach using Angular's dependency injection system. This approach:

1. Doesn't require template references
2. Doesn't require service injection in your components
3. Allows any child component to access the stepper via the `useStepper()` hook

### Using the useStepper() Hook

Any component within the stepper's context can access the stepper:

```typescript
import { Component } from '@angular/core';
import { useStepper } from '@your-org/ui-route-stepper';

@Component({
  selector: 'app-my-step-content',
  template: `
    <h3>{{ stepper.current['title'] }}</h3>
    <button (click)="next()">Continue</button>
  `,
})
export class MyStepContentComponent {
  // Inject the stepper context
  protected stepper = useStepper();

  next() {
    if (this.validateStep()) {
      this.stepper.next();
    }
  }

  validateStep() {
    // Your validation logic here
    return true;
  }
}
```

### Built-in Components

The library provides several components that use the context approach:

#### Stepper Header Component

Shows the current step title and optionally displays progress:

```html
<div [brnStepper]="steps" [initialStep]="'personal'">
  <!-- The header component automatically accesses the stepper context -->
  <app-stepper-header [showProgress]="true"></app-stepper-header>

  <!-- Your step content here -->

  <!-- Navigation automatically works with the stepper context -->
  <app-stepper-navigation [onSubmit]="submit" submitLabel="Complete"></app-stepper-navigation>
</div>
```

#### Stepper Navigation Component

Provides navigation buttons that automatically work with the stepper context:

```typescript
import { Component } from '@angular/core';
import { Step } from '@your-org/ui-route-stepper';

@Component({
  selector: 'app-step-flow',
  template: `
    <div [brnStepper]="steps" [initialStep]="'personal'">
      <app-stepper-header></app-stepper-header>

      <!-- Step content based on current step -->
      <ng-container [ngSwitch]="steps[0].id">
        <app-personal-step *ngSwitchCase="'personal'"></app-personal-step>
        <app-contact-step *ngSwitchCase="'contact'"></app-contact-step>
        <app-review-step *ngSwitchCase="'review'"></app-review-step>
      </ng-container>

      <app-stepper-navigation [onSubmit]="submit"></app-stepper-navigation>
    </div>
  `,
})
export class StepFlowComponent {
  steps: Step[] = [
    { id: 'personal', title: 'Personal Information' },
    { id: 'contact', title: 'Contact Details' },
    { id: 'review', title: 'Review and Submit' },
  ];

  submit = () => {
    console.log('Form submitted');
  };
}
```

### Using with Reactive Forms

To validate steps before navigation in nested components:

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { useStepper } from '@your-org/ui-route-stepper';

@Component({
  selector: 'app-personal-step',
  template: `
    <form [formGroup]="form">
      <div class="form-field">
        <label for="firstName">First Name</label>
        <input id="firstName" formControlName="firstName" />
        <div *ngIf="form.get('firstName')?.invalid && form.get('firstName')?.touched" class="error">First name is required</div>
      </div>

      <div class="form-field">
        <label for="lastName">Last Name</label>
        <input id="lastName" formControlName="lastName" />
        <div *ngIf="form.get('lastName')?.invalid && form.get('lastName')?.touched" class="error">Last name is required</div>
      </div>
    </form>
  `,
})
export class PersonalStepComponent {
  form: FormGroup;
  stepper = useStepper();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });

    // Override the stepper's next method to validate this form
    const originalNext = this.stepper.next;
    this.stepper.next = () => {
      if (this.form.valid) {
        originalNext.call(this.stepper);
      } else {
        // Mark all fields as touched to show validation errors
        this.form.markAllAsTouched();
      }
    };
  }
}
```
