import { Injectable } from '@angular/core';
import { BrnStepperDirective, Step } from '@spartan-ng/ui-stepper-brn';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StepperService {
  private stepperInstance = signal<BrnStepperDirective<Step[]> | null>(null);

  setStepperInstance(stepper: BrnStepperDirective<Step[]>) {
    this.stepperInstance.set(stepper);
  }
}
