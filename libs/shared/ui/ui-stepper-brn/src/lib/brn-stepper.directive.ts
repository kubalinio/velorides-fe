import {
  Directive,
  inject,
  OnInit,
  input,
  effect,
  output,
} from '@angular/core';
import type { Get, Metadata, Step, Stepper } from '../core';
import { generateStepperUtils } from '../core';
import { STEPPER_CONTEXT } from './brn-stepper.token';
import { StepperStateService } from './brn-stepper.service';
// import { STEPPER_TOKEN } from './brn-stepper.token';

/**
 * Directive that provides stepper functionality for Angular components.
 * The stepper state is fully encapsulated within the directive.
 *
 * @example
 * ```html
 * <div [brnStepper]="steps" [initialStep]="'first'">
 *   <!-- Child components can access the stepper via injection -->
 * </div>
 * ```
 */
@Directive({
  selector: '[brnStepper]',
  exportAs: 'brnStepper',
  standalone: true,
  providers: [
    StepperStateService,
    { provide: STEPPER_CONTEXT, useExisting: BrnStepperDirective },
  ],
})
export class BrnStepperDirective<Steps extends Step[]>
  implements OnInit, Stepper<Steps>
{
  // Signal-based inputs
  readonly steps = input.required<Steps>();
  readonly initialStep = input<Get.Id<Steps> | undefined>(undefined);
  readonly initialMetadata = input<
    Partial<Record<Get.Id<Steps>, Metadata>> | undefined
  >(undefined);

  // Inject the stepper service (internal use only)
  private stepperService = inject(StepperStateService<Steps>);

  // Output for step changes
  readonly stepChange = output<Steps[number]>();

  constructor() {
    // Connect the service's stepChange event to the directive's output
    this.stepperService.stepChange.subscribe((step) => {
      this.stepChange.emit(step);
    });

    // Set up effect to initialize stepper when inputs change
    effect(() => {
      const steps = this.steps();
      const initialStep = this.initialStep();
      const initialMetadata = this.initialMetadata();

      if (!steps.length) return;

      this.stepperService.initialize(steps, initialStep, initialMetadata);
    });
  }

  ngOnInit(): void {
    if (!this.steps().length) {
      throw new Error('[brnStepper] requires steps to be provided');
    }
  }

  // Implement the Stepper interface by delegating to the internal service
  get current(): Steps[number] {
    return this.stepperService.current;
  }

  get isLast(): boolean {
    return this.stepperService.isLast;
  }

  get isFirst(): boolean {
    return this.stepperService.isFirst;
  }

  get all(): Steps {
    return this.stepperService.all;
  }

  get metadata(): Record<Get.Id<Steps>, Metadata> {
    return this.stepperService.metadata;
  }

  utils(): ReturnType<typeof generateStepperUtils> {
    return this.stepperService.utils();
  }

  next(): void {
    this.stepperService.next();
  }

  prev(): void {
    this.stepperService.prev();
  }

  get<Id extends Get.Id<Steps>>(id: Id): Get.StepById<Steps, Id> {
    return this.stepperService.get(id);
  }

  goTo(id: Get.Id<Steps>): void {
    this.stepperService.goTo(id);
  }

  reset(): void {
    this.stepperService.reset();
  }

  async beforeNext(callback: () => Promise<boolean> | boolean): Promise<void> {
    return this.stepperService.beforeNext(callback);
  }

  async afterNext(callback: () => Promise<void> | void): Promise<void> {
    return this.stepperService.afterNext(callback);
  }

  async beforePrev(callback: () => Promise<boolean> | boolean): Promise<void> {
    return this.stepperService.beforePrev(callback);
  }

  async afterPrev(callback: () => Promise<void> | void): Promise<void> {
    return this.stepperService.afterPrev(callback);
  }

  async beforeGoTo(
    id: Get.Id<Steps>,
    callback: () => Promise<boolean> | boolean,
  ): Promise<void> {
    return this.stepperService.beforeGoTo(id, callback);
  }

  async afterGoTo(
    id: Get.Id<Steps>,
    callback: () => Promise<void> | void,
  ): Promise<void> {
    return this.stepperService.afterGoTo(id, callback);
  }

  setMetadata<M extends Metadata>(id: Get.Id<Steps>, data: M): void {
    this.stepperService.setMetadata(id, data);
  }

  getMetadata<M extends Metadata>(id: Get.Id<Steps>): M {
    return this.stepperService.getMetadata(id);
  }

  resetMetadata(keepInitialMetadata?: boolean): void {
    this.stepperService.resetMetadata(keepInitialMetadata);
  }

  when<Id extends Get.Id<Steps>, R1, R2>(
    id: Id | [Id, ...boolean[]],
    whenFn: (step: Get.StepById<Steps, Id>) => R1,
    elseFn?: (step: Get.StepSansId<Steps, Id>) => R2,
  ): R1 | R2 {
    return this.stepperService.when(id, whenFn, elseFn);
  }

  switch<R>(when: Get.Switch<Steps, R>): R {
    return this.stepperService.switch(when);
  }

  match<State extends Get.Id<Steps>, R>(
    state: State,
    matches: Get.Switch<Steps, R>,
  ): R | null {
    return this.stepperService.match(state, matches);
  }
}
