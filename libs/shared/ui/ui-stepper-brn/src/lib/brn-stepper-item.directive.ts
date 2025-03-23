// brn-stepper-item.directive.ts
import { Directive, inject, Input, OnInit } from '@angular/core';
import { STEPPER_CONTEXT } from './brn-stepper.token';
import type { Step } from '../core';

@Directive({
  selector: '[brnStepperItem]',
  standalone: true,
  host: {
    '[attr.aria-current]': 'stepId',
    '[attr.aria-active]': 'isActive',
    '[attr.data-active]': 'isActive',
  },
})
export class BrnStepperItemDirective implements OnInit {
  // Get the parent stepper through the context token
  private stepper = inject(STEPPER_CONTEXT);

  // Inputs to define the step
  @Input() step!: Step;

  ngOnInit() {
    if (!this.step.id) {
      throw new Error('[brnStepperItem] requires stepId to be provided');
    }

    // Initialize metadata if provided
    if (this.step) {
      this.stepper.setMetadata(this.step.id, this.step['metadata']);
    }
  }

  // Helper methods can be added here
  get isActive(): boolean {
    return this.stepper.current.id === this.step.id;
  }

  // TODO: Implement isCompleted logic with utils
  // get isCompleted(): boolean {
  // return this.stepper.utils().isCompleted(this.stepId);
  // }

  navigateTo(): void {
    this.stepper.goTo(this.step.id);
  }
}
