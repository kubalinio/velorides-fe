import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';

import { provideIcons, NgIconComponent } from '@ng-icons/core';
import {
  lucideUser,
  lucideLayers,
  lucideCircleUser,
  lucideLogOut,
} from '@ng-icons/lucide';
import {
  HlmAvatarComponent,
  HlmAvatarFallbackDirective,
  HlmAvatarImageDirective,
} from '@spartan-ng/ui-avatar-helm';
import { HlmMenuModule, HlmMenuItemModule } from '@spartan-ng/ui-menu-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
@Component({
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,

    HlmButtonDirective,
    BrnMenuTriggerDirective,

    RouterOutlet,
    MatMenuModule,
    HlmAvatarImageDirective,
    HlmAvatarComponent,
    HlmAvatarFallbackDirective,
    HlmMenuModule,
    HlmMenuItemModule,
    NgIconComponent,
  ],
  providers: [
    provideIcons({ lucideUser, lucideLayers, lucideCircleUser, lucideLogOut }),
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  links = [
    {
      url: '/explore-map',
      routerLink: false,
      label: 'Explore Map',
    },
    {
      url: '/organise-ride',
      routerLink: false,
      label: 'Organise Ride',
      disabled: true,
    },
  ];
}
