import { inject } from '@angular/core';

import { Step, Stepper, Utils } from '../core';

import { InjectionToken } from '@angular/core';

export type StepperToken<Steps extends Step[]> = Stepper<Steps> & {
  utils: Utils<Steps>;
};

export const STEPPER_TOKEN = new InjectionToken<StepperToken<Step[]>>(
  'STEPPER_TOKEN',
);

/**
 * Injection token for accessing the stepper instance from any component.
 * This allows child components to access the stepper context without template references or service injection.
 */
export const STEPPER_CONTEXT = new InjectionToken<Stepper<Step[]>>(
  'STEPPER_CONTEXT',
);

/**
 * Injects the stepper context from any component.
 * This allows child components to access the stepper context without template references or service injection.
 */
export function injectStepperContext<T extends Step[] = Step[]>(): Stepper<T> {
  return inject(STEPPER_CONTEXT) as unknown as Stepper<T>;
}
