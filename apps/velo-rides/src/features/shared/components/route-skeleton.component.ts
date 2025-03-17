import { Component, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { HlmSkeletonComponent } from '@spartan-ng/ui-skeleton-helm';

@Component({
  selector: 'velo-route-skeleton',
  imports: [HlmSkeletonComponent],
  template: `
    <hlm-skeleton
      [class]="hlm('h-[5.75rem] w-full bg-white', classNames())"
    ></hlm-skeleton>
  `,
})
export class RouteSkeletonComponent {
  protected readonly hlm = hlm;
  classNames = input<string>('');
}
