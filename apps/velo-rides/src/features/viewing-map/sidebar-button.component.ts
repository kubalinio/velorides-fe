import { Component, inject } from '@angular/core';

import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

import { provideIcons } from '@ng-icons/core';
import { NgIconComponent } from '@ng-icons/core';
import { lucidePanelRight } from '@ng-icons/lucide';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';

import { ViewingMapComponent } from './viewing.component';

@Component({
  standalone: true,
  selector: 'sidebar-button',
  imports: [HlmButtonDirective, HlmIconDirective, NgIconComponent],
  providers: [provideIcons({ lucidePanelRight })],
  template: `
    <button
      hlmBtn
      variant="default"
      size="icon"
      class="absolute top-4 right-4 shadow-z2"
      (click)="toggleSidenav()"
    >
      <ng-icon hlm name="lucidePanelRight" size="base" class="text-white" />
    </button>
  `,
})
export class SidebarButtonComponent {
  private viewingMapComponent = inject(ViewingMapComponent);

  toggleSidenav() {
    this.viewingMapComponent.toggleSidenav();
  }
}
