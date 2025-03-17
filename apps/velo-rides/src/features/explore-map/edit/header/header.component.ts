import { Component, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmLargeDirective } from '@spartan-ng/ui-typography-helm';

@Component({
  standalone: true,
  selector: 'velo-edit-header',
  imports: [HlmButtonDirective, NgIconComponent, HlmLargeDirective],
  providers: [
    provideIcons({
      lucideArrowLeft,
    }),
  ],
  template: `
    <div class="relative flex items-center justify-center mt-2 mb-4 h-full">
      <button
        hlmBtn
        variant="secondary"
        size="icon"
        class="absolute left-0 size-8"
        (click)="onClickReturn()"
      >
        <ng-icon name="lucide:arrow-left" class="!size-4"></ng-icon>
      </button>

      <h2 hlmLarge class="font-semibold">Selected Route</h2>
    </div>
  `,
})
export class EditHeaderComponent {
  clearSelectedRoute = output<void>();

  onClickReturn() {
    this.clearSelectedRoute.emit();
  }
}
