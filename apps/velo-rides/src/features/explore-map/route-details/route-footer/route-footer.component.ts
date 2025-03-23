import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideDownload } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  standalone: true,
  selector: 'velo-route-footer',
  providers: [
    provideIcons({
      lucideDownload,
    }),
  ],
  imports: [HlmButtonDirective, NgIconComponent, RouterLink],
  templateUrl: './route-footer.component.html',
})
export class RouteFooterComponent {
  routeId = input<string>();
  exportRouteToGpx = output<void>();

  formattedRouteId = computed(() => this.routeId().split('/')[1]);

  onClickExportRouteToGpx() {
    this.exportRouteToGpx.emit();
  }
}
