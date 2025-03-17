import { Component, output } from '@angular/core';
import { HlmAlertIconDirective } from '@spartan-ng/ui-alert-helm';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  HlmAlertDescriptionDirective,
  HlmAlertDirective,
  HlmAlertTitleDirective,
} from '@spartan-ng/ui-alert-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { lucideRefreshCw } from '@ng-icons/lucide';

@Component({
  standalone: true,
  selector: 'velo-route-alert-error',
  providers: [
    provideIcons({
      lucideRefreshCw,
    }),
  ],
  imports: [
    HlmAlertDirective,
    HlmAlertTitleDirective,
    HlmAlertDescriptionDirective,
    HlmAlertIconDirective,
    HlmButtonDirective,
    NgIconComponent,
  ],
  templateUrl: './route-alert-error.component.html',
})
export class RouteAlertErrorComponent {
  retryLoadingWays = output<void>();

  onClickRetry() {
    this.retryLoadingWays.emit();
  }
}
