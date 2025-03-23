import { Directive, ElementRef, input, Renderer2 } from '@angular/core';
import { injectStepperContext } from './brn-stepper.token';

/**
 * A reusable navigation directive for steppers
 * Uses the stepper context instead of requiring the stepper to be passed
 */
@Directive({
  selector: 'brn-stepper-navigation',
  standalone: true,
})
export class BrnStepperNavigationDirective {
  // Inject the stepper from context
  protected readonly stepper = injectStepperContext();

  // Customization inputs with defaults
  readonly backLabel = input<string>('Back');
  readonly nextLabel = input<string>('Next');
  readonly submitLabel = input<string>('Submit');
  readonly disabled = input<boolean>(false);
  readonly showSubmit = input<boolean>(true);

  // Submit handler passed from parent
  readonly onSubmit = input<() => void>(() => {
    console.log('Submit clicked, but no handler provided');
  });

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {
    this.initializeNavigation();
  }

  private initializeNavigation(): void {
    // Create container
    const container = this.renderer.createElement('div');
    this.renderer.setAttribute(container, 'class', 'stepper-navigation');

    // Create back button if not first step
    if (!this.stepper.isFirst) {
      const backButton = this.createButton(
        'nav-button prev-button',
        this.backLabel(),
        () => this.stepper.prev(),
      );
      this.renderer.appendChild(container, backButton);
    }

    // Create next button if not last step
    if (!this.stepper.isLast) {
      const nextButton = this.createButton(
        'nav-button next-button',
        this.nextLabel(),
        () => this.stepper.next(),
      );
      this.renderer.appendChild(container, nextButton);
    }

    // Create submit button if it's the last step and showSubmit is true
    if (this.stepper.isLast && this.showSubmit()) {
      const submitButton = this.createButton(
        'nav-button submit-button',
        this.submitLabel(),
        () => this.onSubmit()(),
      );
      this.renderer.appendChild(container, submitButton);
    }

    // Append the container to the host element
    this.renderer.appendChild(this.el.nativeElement, container);
  }

  private createButton(
    className: string,
    label: string,
    clickHandler: () => void,
  ): any {
    const button = this.renderer.createElement('button');

    // Set class attribute
    this.renderer.setAttribute(button, 'class', className);

    // Set button content
    this.renderer.setProperty(button, 'textContent', label);

    // Set disabled attribute if needed
    if (this.disabled()) {
      this.renderer.setAttribute(button, 'disabled', 'true');
    }

    // Add click event listener
    this.renderer.listen(button, 'click', clickHandler);

    return button;
  }
}
