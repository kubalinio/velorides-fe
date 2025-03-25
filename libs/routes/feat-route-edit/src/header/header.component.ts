import { Component, inject, input, output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmLargeDirective } from '@spartan-ng/ui-typography-helm';

@Component({
  standalone: true,
  selector: 'velo-route-edit-header',
  imports: [HlmButtonDirective, NgIconComponent, HlmLargeDirective],
  providers: [
    provideIcons({
      lucideArrowLeft,
    }),
  ],
  template: `
    <div class="relative flex items-center justify-center mt-2 mb-4 h-full">
      <a
        hlmBtn
        variant="secondary"
        size="icon"
        class="absolute left-0 size-8"
        (click)="onClickReturn()"
      >
        <ng-icon name="lucide:arrow-left" class="!size-4"></ng-icon>
      </a>

      <h2 hlmLarge class="font-semibold line-clamp-1" title="{{ routeName() }}">
        {{ routeName() || 'Unnamed Route' }}
      </h2>
    </div>
  `,
})
export class EditHeaderComponent {
  routeName = input<string>('');
  readonly _router = inject(Router);
  readonly _route = inject(ActivatedRoute);
  clearSelectedRoute = output<void>();

  onClickReturn() {
    this._router.navigate(['/explore-map', this._route.snapshot.params['id']]);
  }
}
