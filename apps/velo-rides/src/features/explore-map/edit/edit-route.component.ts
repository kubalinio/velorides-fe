import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideExternalLink,
  lucideMapPin,
  lucideDownload,
} from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmCardContentDirective,
  HlmCardHeaderDirective,
  HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';

import { GpxExportService, RouteStore } from '@velo/routes/data-access';
import { RouteSubwaysComponent } from './route-subways.component';

@Component({
  selector: 'app-edit-route',
  standalone: true,
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideMapPin,
      lucideExternalLink,
      lucideDownload,
    }),
  ],
  imports: [
    HlmButtonDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    HlmCardContentDirective,
    NgIconComponent,
    RouteSubwaysComponent,
  ],
  templateUrl: './edit-route.component.html',
})
export class EditRouteComponent {
  protected readonly hlm = hlm;
  private readonly routeStore = inject(RouteStore);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly gpxExportService = inject(GpxExportService);

  $selectedRoute = this.routeStore.selectedRoute;
  $selectedRouteBounds = this.routeStore.selectedRouteBounds;
  $routeSubways = this.routeStore.routeSubways;
  $isRouteLoading = this.routeStore.isRouteLoading;
  constructor() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const routeId = params.get('id');
      if (routeId) {
        this.routeStore.getRouteById(Number(routeId));
      }
    });
  }

  clearSelectedRoute() {
    this.routeStore.clearSelectedRoute();
    this.router.navigate(['/explore-map']);
  }

  exportRouteAsGpx() {
    const selectedRoute = this.$selectedRoute();
    const selectedRouteBounds = this.$selectedRouteBounds();

    if (!selectedRoute || !selectedRouteBounds) {
      console.error('No route selected or route bounds not available');
      return;
    }

    try {
      const gpxContent = this.gpxExportService.toGpx(selectedRouteBounds, {
        creator: 'Velo Rides',
        featureTitle: () => selectedRoute.name || 'Unnamed Route',
        featureDescription: () => selectedRoute.description || '',
      });

      const fileName = this.gpxExportService.generateFileName(
        selectedRoute['name'] || 'unnamed_route',
      );

      this.gpxExportService.downloadGpxFile(gpxContent, fileName);
    } catch (error) {
      console.error('Error exporting route as GPX:', error);
    }
  }
}
