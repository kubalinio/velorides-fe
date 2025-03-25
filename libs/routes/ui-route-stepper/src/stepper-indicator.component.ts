import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BrnStepperModule } from '@spartan-ng/ui-stepper-brn';

@Component({
  standalone: true,
  selector: 'ui-route-stepper-indicator',
  imports: [CommonModule, ReactiveFormsModule, BrnStepperModule],
  templateUrl: './stepper-indicator.component.html',
})
export class RoutesUiStepperIndicatorComponent {
  size = input<number>(100);
  strokeWidth = input<number>(10);
  currentStep = input<number>(1);
  totalSteps = input<number>(10);

  radius = computed(() => (this.size() - this.strokeWidth()) / 2);
  circumference = computed(() => this.radius() * 2 * Math.PI);
  fillPercentage = computed(
    () => (this.currentStep() / this.totalSteps()) * 100,
  );
  dashOffset = computed(
    () =>
      this.circumference() -
      (this.circumference() * this.fillPercentage()) / 100,
  );
}
