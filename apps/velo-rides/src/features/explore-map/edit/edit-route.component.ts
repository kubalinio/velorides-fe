import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { hlm } from '@spartan-ng/brain/core';

import {
  GpxExportService,
  RoutesStore,
  RouteStore,
} from '@velo/routes/data-access';
import { RouteWaysComponent } from './route-ways/route-ways.component';
import { RouteSkeletonComponent } from '../../shared/components/route-skeleton.component';

import { HlmLargeDirective } from '@spartan-ng/ui-typography-helm';
import { RouteAlertErrorComponent } from './route-alert-error/route-alert-error.component';
import { RouteDetailsComponent } from './route-details/route-details.component';
import { RouteFooterComponent } from './route-footer/route-footer.component';
import { EditHeaderComponent } from './header/header.component';

@Component({
  selector: 'app-edit-route',
  standalone: true,
  imports: [
    EditHeaderComponent,
    RouteWaysComponent,
    RouteDetailsComponent,
    RouteSkeletonComponent,
    RouteAlertErrorComponent,
    RouteFooterComponent,

    HlmLargeDirective,
  ],
  templateUrl: './edit-route.component.html',
})
export class EditRouteComponent {
  protected readonly hlm = hlm;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly routeStore = inject(RouteStore);
  private readonly routesStore = inject(RoutesStore);
  private readonly gpxExportService = inject(GpxExportService);

  $selectedRoute = this.routeStore.selectedRoute;
  $selectedRouteBounds = this.routeStore.selectedRouteBounds;
  $routeWays = this.routeStore.routeWays;

  $isLoadingWays = this.routeStore.getRouteLoading;
  $isLoadedWays = this.routeStore.getRouteLoaded;
  $isErrorWays = this.routeStore.getRouteError;

  readonly getRouteOnChangeId = this.activatedRoute.paramMap.subscribe(
    (params) => {
      const routeId = params.get('id');
      if (routeId) {
        this.routeStore.getRouteById(Number(routeId));
      }
    },
  );

  clearSelectedRoute() {
    this.routeStore.clearSelectedRoute();
    this.routesStore.setHoveredRouteFeedId(null);
    this.router.navigate(['/explore-map']);
  }

  exportRouteToGpx() {
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

  retryLoadingWays() {
    this.routeStore.getRouteById(
      Number(this.activatedRoute.snapshot.params['id']),
    );
  }
}
