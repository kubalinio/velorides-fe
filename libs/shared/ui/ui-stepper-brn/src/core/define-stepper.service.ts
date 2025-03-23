import {
  Component,
  Injectable,
  TemplateRef,
  inject,
  signal,
} from '@angular/core';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import type { Get, Metadata, Step, Stepper } from '.';
import type { StepperReturn } from '../lib/types';

import {
  executeTransition,
  generateCommonStepperUseFns,
  generateStepperUtils,
  getInitialMetadata,
  getInitialStepIndex,
  updateStepIndex,
} from '.';
import { STEPPER_TOKEN } from '../lib/brn-stepper.token';

/**
 * Creates a stepper service and utility functions for managing stepper state in Angular.
 *
 * @param steps - The steps to be included in the stepper.
 * @returns An object containing the stepper service, component, and utility functions.
 */
export const defineStepper = <const Steps extends Step[]>(
  ...steps: Steps
): StepperReturn<Steps> => {
  const utils = generateStepperUtils(...steps);

  // Create a token for dependency injection

  // Create the stepper provider factory
  const createStepperProvider = (options?: {
    initialStep?: Get.Id<Steps>;
    initialMetadata?: Partial<Record<Get.Id<Steps>, Metadata>>;
  }) => {
    const { initialStep, initialMetadata } = options ?? {};
    const initialStepIndex = getInitialStepIndex(steps, initialStep);

    // Create an injectable service that manages the stepper state
    @Injectable()
    class StepperService implements Stepper<Steps> {
      private stepIndexSignal = signal<number>(initialStepIndex);
      private metadataSignal = signal<Record<Get.Id<Steps>, Metadata>>(
        getInitialMetadata(steps, initialMetadata),
      );

      // Properties that conform to the Stepper interface
      get current(): Steps[number] {
        return steps[this.stepIndexSignal()];
      }

      get isLast(): boolean {
        return this.stepIndexSignal() === steps.length - 1;
      }

      get isFirst(): boolean {
        return this.stepIndexSignal() === 0;
      }

      get metadata(): Record<Get.Id<Steps>, Metadata> {
        return this.metadataSignal();
      }

      readonly all = steps;

      next(): void {
        updateStepIndex(steps, this.stepIndexSignal() + 1, (newIndex) => {
          this.stepIndexSignal.set(newIndex);
        });
      }

      prev(): void {
        updateStepIndex(steps, this.stepIndexSignal() - 1, (newIndex) => {
          this.stepIndexSignal.set(newIndex);
        });
      }

      get<Id extends Get.Id<Steps>>(id: Id): Get.StepById<Steps, Id> {
        return steps.find((step) => step.id === id) as Get.StepById<Steps, Id>;
      }

      goTo(id: Get.Id<Steps>): void {
        const index = steps.findIndex((s) => s.id === id);
        if (index === -1) throw new Error(`Step with id "${id}" not found.`);
        updateStepIndex(steps, index, (newIndex) => {
          this.stepIndexSignal.set(newIndex);
        });
      }

      reset(): void {
        updateStepIndex(
          steps,
          getInitialStepIndex(steps, initialStep),
          (newIndex) => {
            this.stepIndexSignal.set(newIndex);
          },
        );
      }

      async beforeNext(
        callback: () => Promise<boolean> | boolean,
      ): Promise<void> {
        await executeTransition({
          stepper: this,
          direction: 'next',
          callback,
          before: true,
        });
      }

      async afterNext(callback: () => Promise<void> | void): Promise<void> {
        this.next();
        await executeTransition({
          stepper: this,
          direction: 'next',
          callback,
          before: false,
        });
      }

      async beforePrev(
        callback: () => Promise<boolean> | boolean,
      ): Promise<void> {
        await executeTransition({
          stepper: this,
          direction: 'prev',
          callback,
          before: true,
        });
      }

      async afterPrev(callback: () => Promise<void> | void): Promise<void> {
        this.prev();
        await executeTransition({
          stepper: this,
          direction: 'prev',
          callback,
          before: false,
        });
      }

      async beforeGoTo(
        id: Get.Id<Steps>,
        callback: () => Promise<boolean> | boolean,
      ): Promise<void> {
        await executeTransition({
          stepper: this,
          direction: 'goTo',
          callback,
          before: true,
          targetId: id,
        });
      }

      async afterGoTo(
        id: Get.Id<Steps>,
        callback: () => Promise<void> | void,
      ): Promise<void> {
        this.goTo(id);
        await executeTransition({
          stepper: this,
          direction: 'goTo',
          callback,
          before: false,
          targetId: id,
        });
      }

      setMetadata<M extends Metadata>(id: Get.Id<Steps>, data: M): void {
        this.metadataSignal.update((prev) => {
          if (prev[id] === data) return prev;
          return { ...prev, [id]: data };
        });
      }

      getMetadata<M extends Metadata>(id: Get.Id<Steps>): M {
        return this.metadataSignal()[id] as M;
      }

      resetMetadata(keepInitialMetadata?: boolean): void {
        this.metadataSignal.set(
          getInitialMetadata(
            steps,
            keepInitialMetadata ? initialMetadata : undefined,
          ),
        );
      }

      // Add conditional methods from common stepper use functions
      when<Id extends Get.Id<Steps>, R1, R2>(
        id: Id | [Id, ...boolean[]],
        whenFn: (step: Get.StepById<Steps, Id>) => R1,
        elseFn?: (step: Get.StepSansId<Steps, Id>) => R2,
      ): R1 | R2 {
        const commonFns = generateCommonStepperUseFns(
          steps,
          this.current,
          this.stepIndexSignal(),
        );
        return commonFns.when(id, whenFn, elseFn);
      }

      switch<R>(when: Get.Switch<Steps, R>): R {
        const commonFns = generateCommonStepperUseFns(
          steps,
          this.current,
          this.stepIndexSignal(),
        );
        return commonFns.switch(when);
      }

      match<State extends Get.Id<Steps>, R>(
        state: State,
        matches: Get.Switch<Steps, R>,
      ): R | null {
        const commonFns = generateCommonStepperUseFns(
          steps,
          this.current,
          this.stepIndexSignal(),
        );
        return commonFns.match(state, matches);
      }
    }

    return StepperService;
  };

  // Create the Injectable factory
  const injectStepper = (options?: {
    initialStep?: Get.Id<Steps>;
    initialMetadata?: Partial<Record<Get.Id<Steps>, Metadata>>;
  }): Stepper<Steps> => {
    // Try to inject from parent, otherwise create new instance
    try {
      return inject(STEPPER_TOKEN) as unknown as Stepper<Steps>;
    } catch {
      const StepperService = createStepperProvider(options);
      return new StepperService();
    }
  };

  // Create the Angular component that provides the stepper
  @Component({
    selector: 'app-stepper-scope',
    template: `<ng-container *ngIf="props.content">
      <ng-container *ngTemplateOutlet="props.content"></ng-container>
    </ng-container>`,
    standalone: true,
    imports: [NgIf, NgTemplateOutlet],
    providers: [
      {
        provide: STEPPER_TOKEN,
        useFactory: () => {
          const component = inject(StepperScopeComponent);
          const StepperService = createStepperProvider({
            initialStep: component.props.initialStep,
            initialMetadata: component.props.initialMetadata as Partial<
              Record<Get.Id<Steps>, Metadata>
            >,
          });
          return new StepperService();
        },
      },
    ],
  })
  class StepperScopeComponent {
    props: {
      initialStep?: Get.Id<Steps>;
      initialMetadata?: Record<Get.Id<Steps>, Metadata>;
      content?: TemplateRef<any>;
    } = {};
  }

  return {
    steps,
    utils,
    StepperScope: StepperScopeComponent,
    injectStepper,
  };
};
