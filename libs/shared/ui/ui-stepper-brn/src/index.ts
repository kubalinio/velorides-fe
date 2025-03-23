// Types
export type { Step, Stepper, Get } from './core/types';
export type { StepperReturn, ScopedProps } from './lib/types';

// Directive
export * from './lib/brn-stepper.directive';
export * from './lib/brn-stepper-item.directive';
export * from './lib/brn-stepper-navigation.directive';

import { NgModule } from '@angular/core';
import { BrnStepperDirective } from './lib/brn-stepper.directive';
import { BrnStepperNavigationDirective } from './lib/brn-stepper-navigation.directive';
import { BrnStepperItemDirective } from './lib/brn-stepper-item.directive';

@NgModule({
  imports: [
    BrnStepperDirective,
    BrnStepperNavigationDirective,
    BrnStepperItemDirective,
  ],
  exports: [
    BrnStepperDirective,
    BrnStepperNavigationDirective,
    BrnStepperItemDirective,
  ],
})
export class BrnStepperModule {}
