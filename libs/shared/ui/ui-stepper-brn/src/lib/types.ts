import type { Get, Metadata, Step, Stepper, Utils } from '../core';
import type { TemplateRef, Type } from '@angular/core';

export type ScopedProps<Steps extends Step[]> = {
  /** The initial step to display. */
  initialStep?: Get.Id<Steps>;
  /** The initial metadata. */
  initialMetadata?: Record<Get.Id<Steps>, Metadata>;
  /** The content to render */
  content?: TemplateRef<any>;
};

export type StepperReturn<Steps extends Step[]> = {
  /** The steps of the stepper. */
  steps: Steps;
  /**
   * `utils` provides helper functions to interact with steps in the stepper.
   * These functions allow you to get steps by their ID or index, get the first and last steps,
   * and navigate through the steps by retrieving neighbors or adjacent steps.
   *
   * @returns An object containing utility methods to interact with the steps
   */
  utils: Utils<Steps>;
  /**
   * `StepperScope` component is a wrapper that provides the stepper context to its children.
   * It uses Angular's dependency injection system to provide the stepper instance.
   *
   * @param props - The configuration object containing `initialStep` and content.
   * @param props.initialStep - The ID of the step to start with (optional).
   * @param props.initialMetadata - The initial metadata (optional).
   * @param props.content - The content template to be wrapped by the stepper.
   * @returns An Angular component that wraps the content with the stepper context.
   */
  StepperScope: Type<{
    props: ScopedProps<Steps>;
  }>;
  /**
   * `injectStepper` function returns an object that manages the current step in the stepper.
   * You can use this function in component constructor to get the current step, navigate to the next or previous step,
   * and reset the stepper to the initial state.
   *
   * @param options - Configuration options
   * @param options.initialStep - The ID of the step to start with (optional).
   * @param options.initialMetadata - The initial metadata (optional).
   * @returns An object containing properties and methods to interact with the stepper.
   */
  injectStepper: (options?: {
    initialStep?: Get.Id<Steps>;
    initialMetadata?: Partial<Record<Get.Id<Steps>, Metadata>>;
  }) => Stepper<Steps>;
};
