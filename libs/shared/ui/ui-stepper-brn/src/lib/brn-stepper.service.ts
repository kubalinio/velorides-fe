import { EventEmitter, signal, computed, Injectable } from '@angular/core';
import type { Get, Metadata, Step, Stepper } from '../core';
import {
  executeTransition,
  generateCommonStepperUseFns,
  generateStepperUtils,
  getInitialMetadata,
  getInitialStepIndex,
  updateStepIndex,
} from '../core';

// Export the type for type checking purposes, but don't expose the actual service
export { StepperStateService };

/**
 * Service that manages stepper state - internal implementation
 * This service is NOT meant to be used directly by consumers
 */
@Injectable()
class StepperStateService<Steps extends Step[]> implements Stepper<Steps> {
  // Internal signals
  private steps = signal<Steps>([] as unknown as Steps);
  private stepIndex = signal<number>(0);
  private metadataStore = signal<Record<Get.Id<Steps>, Metadata>>(
    {} as Record<Get.Id<Steps>, Metadata>,
  );
  private utilsCore = computed(() => generateStepperUtils(...this.steps()));

  // Computed properties for internal use
  private currentStep = computed(() => this.steps()[this.stepIndex()]);
  private isLastStep = computed(
    () => this.stepIndex() === this.steps().length - 1,
  );
  private isFirstStep = computed(() => this.stepIndex() === 0);

  // Step change event
  public readonly stepChange = new EventEmitter<Steps[number]>();

  // Initialize the stepper
  initialize(
    steps: Steps,
    initialStep?: Get.Id<Steps>,
    initialMetadata?: Partial<Record<Get.Id<Steps>, Metadata>>,
  ): void {
    this.steps.set(steps);

    if (initialStep) {
      const initialStepIndex = getInitialStepIndex(steps, initialStep);
      this.stepIndex.set(initialStepIndex);
    }

    if (initialMetadata) {
      this.metadataStore.set(getInitialMetadata(steps, initialMetadata));
    } else {
      this.resetMetadata();
    }
  }

  // Getters that return values from computed signals to satisfy the Stepper interface
  get current(): Steps[number] {
    return this.currentStep();
  }

  get isLast(): boolean {
    return this.isLastStep();
  }

  get isFirst(): boolean {
    return this.isFirstStep();
  }

  // Stepper interface implementation
  get all(): Steps {
    return this.steps();
  }

  get metadata(): Record<Get.Id<Steps>, Metadata> {
    return this.metadataStore();
  }

  utils(): ReturnType<typeof generateStepperUtils> {
    return this.utilsCore();
  }

  next(): void {
    updateStepIndex(this.steps(), this.stepIndex() + 1, (newIndex) => {
      this.stepIndex.set(newIndex);
      this.stepChange.emit(this.current);
    });
  }

  prev(): void {
    updateStepIndex(this.steps(), this.stepIndex() - 1, (newIndex) => {
      this.stepIndex.set(newIndex);
      this.stepChange.emit(this.current);
    });
  }

  get<Id extends Get.Id<Steps>>(id: Id): Get.StepById<Steps, Id> {
    return this.steps().find((step) => step.id === id) as Get.StepById<
      Steps,
      Id
    >;
  }

  goTo(id: Get.Id<Steps>): void {
    const index = this.steps().findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Step with id "${id}" not found.`);

    updateStepIndex(this.steps(), index, (newIndex) => {
      this.stepIndex.set(newIndex);
      this.stepChange.emit(this.current);
    });
  }

  reset(): void {
    const initialIndex = 0;
    updateStepIndex(this.steps(), initialIndex, (newIndex) => {
      this.stepIndex.set(newIndex);
      this.stepChange.emit(this.current);
    });
  }

  async beforeNext(callback: () => Promise<boolean> | boolean): Promise<void> {
    await executeTransition({
      stepper: this as unknown as Stepper<Step[]>,
      direction: 'next',
      callback,
      before: true,
    });
  }

  async afterNext(callback: () => Promise<void> | void): Promise<void> {
    this.next();
    await executeTransition({
      stepper: this as unknown as Stepper<Step[]>,
      direction: 'next',
      callback,
      before: false,
    });
  }

  async beforePrev(callback: () => Promise<boolean> | boolean): Promise<void> {
    await executeTransition({
      stepper: this as unknown as Stepper<Step[]>,
      direction: 'prev',
      callback,
      before: true,
    });
  }

  async afterPrev(callback: () => Promise<void> | void): Promise<void> {
    this.prev();
    await executeTransition({
      stepper: this as unknown as Stepper<Step[]>,
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
      stepper: this as unknown as Stepper<Step[]>,
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
      stepper: this as unknown as Stepper<Step[]>,
      direction: 'goTo',
      callback,
      before: false,
      targetId: id,
    });
  }

  setMetadata<M extends Metadata>(id: Get.Id<Steps>, data: M): void {
    this.metadataStore.update((prev) => {
      if (prev[id] === data) return prev;
      return { ...prev, [id]: data };
    });
  }

  getMetadata<M extends Metadata>(id: Get.Id<Steps>): M {
    return this.metadataStore()[id] as M;
  }

  resetMetadata(keepInitialMetadata?: boolean): void {
    const initialMetadata = keepInitialMetadata
      ? this.metadataStore()
      : undefined;
    this.metadataStore.set(getInitialMetadata(this.steps(), initialMetadata));
  }

  when<Id extends Get.Id<Steps>, R1, R2>(
    id: Id | [Id, ...boolean[]],
    whenFn: (step: Get.StepById<Steps, Id>) => R1,
    elseFn?: (step: Get.StepSansId<Steps, Id>) => R2,
  ): R1 | R2 {
    const commonFns = generateCommonStepperUseFns(
      this.steps(),
      this.current,
      this.stepIndex(),
    );
    return commonFns.when(id, whenFn, elseFn);
  }

  switch<R>(when: Get.Switch<Steps, R>): R {
    const commonFns = generateCommonStepperUseFns(
      this.steps(),
      this.current,
      this.stepIndex(),
    );
    return commonFns.switch(when);
  }

  match<State extends Get.Id<Steps>, R>(
    state: State,
    matches: Get.Switch<Steps, R>,
  ): R | null {
    const commonFns = generateCommonStepperUseFns(
      this.steps(),
      this.current,
      this.stepIndex(),
    );
    return commonFns.match(state, matches);
  }
}
