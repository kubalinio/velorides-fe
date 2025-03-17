import { Component, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideLoaderCircle } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';

@Component({
  selector: 'velo-loader-circle',
  providers: [provideIcons({ lucideLoaderCircle })],
  imports: [NgIconComponent],
  template: `
    <span [class]="hlm('text-gray-700', classNames())">
      <ng-icon
        name="lucideLoaderCircleComponent"
        size="42"
        class="animate-spin"
      ></ng-icon>
    </span>
  `,
})
export class LoaderCircleComponent {
  protected readonly hlm = hlm;
  classNames = input<string>('');
}
