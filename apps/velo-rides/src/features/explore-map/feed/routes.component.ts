import { Component, effect, inject } from '@angular/core';
import { RoutesStore, RouteStore } from '@velo/routes/data-access';

import { hlm } from '@spartan-ng/brain/core';

import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideMapPin } from '@ng-icons/lucide';
import { hlmLarge } from '@spartan-ng/ui-typography-helm';
import { MapStore } from '@velo/maps/data-access';
import { RouteTypesComponent } from './route-types.component';
import { RoutesFeedComponent } from './routes-feed.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteSkeletonComponent } from '../../shared/components/route-skeleton.component';

@Component({
  standalone: true,
  selector: 'sidebar-viewing-map',
  providers: [provideIcons({ lucideArrowLeft, lucideMapPin })],
  imports: [RouteTypesComponent, RoutesFeedComponent, RouteSkeletonComponent],
  template: `
    <velo-route-types></velo-route-types>

    <section class="pl-2.5 pr-4">
      <h2 class="${hlmLarge} mb-4">
        Routes in area
        @if ($routesLoaded() && !$routesError()) {
          ({{ $routes()?.features?.length || 0 }})
        }
      </h2>

      @if ($routesLoading()) {
        <div class="flex flex-col gap-3">
          @for (i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; track i) {
            <velo-route-skeleton></velo-route-skeleton>
          }
        </div>
      }

      @if ($routesLoaded() && !$routesError()) {
        <velo-routes-feed
          [routes]="$routes().features"
          [hoveredRouteFeedId]="$hoveredRouteFeedId()"
          (onSelectRoute)="onSelectRoute($event)"
          (onHoverRoute)="onHoverRoute($event)"
          (onZoomToRoute)="zoomToRoute($event)"
        ></velo-routes-feed>
      }

      @if ($routesError()) {
        <div class="flex flex-col gap-3">
          <h2 class="${hlmLarge}">Error loading routes</h2>
          <p class="text-sm text-gray-500">Please try again later</p>
        </div>
      }
    </section>
  `,
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

  readonly refreshRoutesOnChangeRoute = effect(() => {
    console.log('error', this.$routesError());
    console.log('call state', this.$routeCallState());
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
}
