import { Component, inject, effect } from '@angular/core';
import { RoutesStore, RouteStore } from '@velo/routes/data-access';

import { hlm } from '@spartan-ng/brain/core';

import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideMapPin,
  lucideExternalLink,
} from '@ng-icons/lucide';
import { hlmLarge } from '@spartan-ng/ui-typography-helm';
import { MapStore } from '@velo/maps/data-access';
import { RouteTypesComponent } from './route-types.component';
import { RoutesFeedComponent } from './routes-feed.component';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'sidebar-viewing-map',
  providers: [
    provideIcons({ lucideArrowLeft, lucideMapPin, lucideExternalLink }),
  ],
  imports: [RouteTypesComponent, RoutesFeedComponent],
  template: `
    <sidebar-route-types></sidebar-route-types>

    <section class="pl-2.5 pr-4">
      <h2 class="${hlmLarge} mb-4">
        Routes in area ({{ $routes()?.features?.length || 0 }})
      </h2>

      @if (!$routesLoaded()) {
        <div class="flex items-center justify-center h-full">
          Loading routes...
        </div>
      }

      @if ($routesLoaded()) {
        <sidebar-routes-feed
          [routes]="$routes().features"
          [hoveredRouteFeedId]="$hoveredRouteFeedId()"
          (onSelectRoute)="onSelectRoute($event)"
          (onHoverRoute)="onHoverRoute($event)"
        ></sidebar-routes-feed>
      }
    </section>
  `,
})
export class SidebarComponent {
  protected readonly hlm = hlm;
  private readonly router = inject(Router);
  readonly routesStore = inject(RoutesStore);
  readonly routeStore = inject(RouteStore);
  readonly mapStore = inject(MapStore);

  $bbox = this.mapStore.bbox;
  $routes = this.routesStore.routes;
  $hoveredRouteFeedId = this.routesStore.hoveredRouteFeedId;
  $routesLoaded = this.routesStore.getRoutesLoaded;

  constructor() {
    effect(() => {
      const bbox = this.$bbox();
      if (bbox) this.routesStore.getRouteByArea(bbox);
    });
  }

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
}
