import { Component, inject } from '@angular/core';
import { RoutesStore, RouteStore } from '@velo/routes/data-access';

import { hlm } from '@spartan-ng/brain/core';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideMapPin,
  lucideRefreshCw,
  lucideTriangleAlert,
} from '@ng-icons/lucide';

import { MapStore } from '@velo/maps/data-access';
import { RouteTypesComponent } from './route-types.component';
import { RoutesFeedComponent } from './routes-feed.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteSkeletonComponent } from '../../shared/components/route-skeleton.component';
import {
  HlmAlertDescriptionDirective,
  HlmAlertDirective,
  HlmAlertIconDirective,
  HlmAlertTitleDirective,
} from '@spartan-ng/ui-alert-helm';
import { HlmLargeDirective } from '@spartan-ng/ui-typography-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  standalone: true,
  selector: 'sidebar-viewing-map',
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideMapPin,
      lucideTriangleAlert,
      lucideRefreshCw,
    }),
  ],
  imports: [
    RouteTypesComponent,
    RoutesFeedComponent,
    RouteSkeletonComponent,
    HlmAlertDirective,
    HlmAlertDescriptionDirective,
    HlmAlertIconDirective,
    HlmAlertTitleDirective,
    HlmLargeDirective,
    NgIconComponent,
    HlmButtonDirective,
  ],
  templateUrl: './routes.component.html',
})
export class RoutesComponent {
  protected readonly hlm = hlm;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  readonly routesStore = inject(RoutesStore);
  readonly routeStore = inject(RouteStore);
  readonly mapStore = inject(MapStore);

  $bbox = this.mapStore.bbox;
  $routes = this.routesStore.routes;
  $hoveredRouteFeedId = this.routesStore.hoveredRouteFeedId;

  $routesLoading = this.routesStore.getRoutesLoading;
  $routesLoaded = this.routesStore.getRoutesLoaded;
  $routesError = this.routesStore.getRoutesError;
  $routeCallState = this.routesStore.getRoutesCallState;

  readonly refreshRoutesOnChangePosition =
    this.activatedRoute.queryParams.subscribe(() => {
      if (this.$bbox()) {
        this.routesStore.getRoutesByArea(this.$bbox());
      }
    });

  onSelectRoute(element: GeoJSON.Feature) {
    this.routeStore.setSelectedRoute(
      element.properties as NonNullable<GeoJSON.Feature['properties']>,
    );

    this.routeStore.setSelectedRouteBounds(element);

    this.router.navigate(['/explore-map', element.properties.id.split('/')[1]]);
  }

  onHoverRoute(id: string | null) {
    this.routesStore.setHoveredRouteFeedId(id);
  }

  zoomToRoute(element: GeoJSON.Feature) {
    this.routeStore.setSelectedRouteBounds(element);
  }

  refreshRoutes() {
    this.routesStore.getRoutesByArea(this.$bbox());
  }
}
