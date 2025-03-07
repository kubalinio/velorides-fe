import { Component, inject, effect } from '@angular/core';
import { RoutesStore, RouteStore } from '@velo/routes/data-access';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { hlm } from '@spartan-ng/brain/core';

import { provideIcons } from '@ng-icons/core';
import { NgIconComponent } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideMapPin,
  lucideExternalLink,
} from '@ng-icons/lucide';
import { hlmLarge } from '@spartan-ng/ui-typography-helm';
import { MapStore } from '@velo/maps/data-access';
import { Router } from '@angular/router';
@Component({
  standalone: true,
  selector: 'sidebar-viewing-map',
  providers: [
    provideIcons({ lucideArrowLeft, lucideMapPin, lucideExternalLink }),
  ],
  imports: [NgIconComponent, HlmCardDirective],
  template: `
    <section class="pl-1 pr-2.5">
      <div class="flex flex-col gap-3 p-6">
        <h2 class="${hlmLarge}">Route Types</h2>

        <ul
          class="flex flex-col gap-3 [&>li]:flex [&>li]:gap-2 [&>li]:items-center"
        >
          <li>
            <span class="inline-block size-5 rounded-full bg-violet-500"></span>
            <span>Route International</span>
          </li>

          <li>
            <span class="inline-block size-5 rounded-full bg-red-700"></span>
            <span>Route National</span>
          </li>

          <li>
            <span class="inline-block size-5 rounded-full bg-orange-500"></span>
            <span>Route Regional</span>
          </li>

          <li>
            <span class="inline-block size-5 rounded-full bg-black"></span>
            <span>Route Local</span>
          </li>
        </ul>
      </div>
    </section>

    <div class="p-4">
      <h2 class="${hlmLarge} mb-4">
        Routes with uncompleted data ({{
          $routesOnArea()?.features?.length || 0
        }})
      </h2>

      @if ($routesOnArea()) {
        <ul class="space-y-3 mt-4">
          @for (
            element of $routesOnArea()?.features || [];
            track element.properties.id
          ) {
            <li
              [class]="
                hlm(
                  'p-3 cursor-pointer border-l-4',
                  element.properties.network === 'icn' && 'border-l-violet-500',
                  element.properties.network === 'ncn' && 'border-l-red-700',
                  element.properties.network === 'rcn' && 'border-l-orange-500',
                  element.properties.network === 'lcn' && 'border-l-black'
                )
              "
              (click)="selectRoute(element)"
              hlmCard
            >
              <h4 class="font-semibold">
                {{ element.properties.name || 'Unnamed Route' }}
              </h4>
              @if (element.properties.distance) {
                <p class="text-sm">
                  Distance: {{ element.properties.distance }}
                </p>
              }
              @if (element.properties.description) {
                <p class="text-sm">
                  Description: {{ element.properties.description }}
                </p>
              }
              @if (element.properties.website) {
                <a
                  [href]="element.properties.website"
                  target="_blank"
                  class="text-sm text-primary flex items-center gap-1 mt-1"
                >
                  <ng-icon name="lucide:external-link" class="!size-3" />
                  Website
                </a>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly routesStore = inject(RoutesStore);
  private readonly routeStore = inject(RouteStore);

  private readonly mapStore = inject(MapStore);
  protected readonly hlm = hlm;

  $routesOnArea = this.routesStore.routesOnArea;
  $bbox = this.mapStore.bbox;

  constructor() {
    effect(() => {
      const bbox = this.$bbox();
      if (bbox) this.routesStore.getRouteByArea(bbox);
    });
  }

  selectRoute(element: GeoJSON.Feature) {
    this.routeStore.setSelectedRoute(
      element.properties as NonNullable<GeoJSON.Feature['properties']>,
    );

    this.routeStore.setSelectedRouteBounds(element);

    this.router.navigate(['/explore-map', element.properties.id.split('/')[1]]);
  }
}
