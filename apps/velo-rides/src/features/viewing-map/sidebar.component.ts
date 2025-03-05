import { Component, inject, effect } from '@angular/core';
import { RouteStore } from '@velo/routes/data-access';
import {
  HlmCardDirective,
  HlmCardContentDirective,
  HlmCardHeaderDirective,
  HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { hlm } from '@spartan-ng/brain/core';

import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { provideIcons } from '@ng-icons/core';
import { NgIconComponent } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideMapPin,
  lucideExternalLink,
} from '@ng-icons/lucide';
import { hlmLarge } from '@spartan-ng/ui-typography-helm';
import { MapStore } from '@velo/maps/data-access';
@Component({
  standalone: true,
  selector: 'sidebar-viewing-map',
  providers: [
    provideIcons({ lucideArrowLeft, lucideMapPin, lucideExternalLink }),
  ],
  imports: [
    NgIconComponent,
    HlmButtonDirective,
    HlmCardDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    HlmCardContentDirective,
  ],
  template: `
    <section class="pl-1 pr-2.5">
      @if ($selectedRoute()) {
        <div class="relative flex items-center justify-center mt-2 mb-4">
          <button
            hlmBtn
            variant="secondary"
            size="icon"
            class="absolute left-0"
            (click)="clearSelectedRoute()"
          >
            <ng-icon name="lucide:arrow-left" class="!size-4" />
          </button>

          <h2 class="${hlmLarge}">Selected Route</h2>
        </div>

        <div class="overflow-x-hidden flex flex-col gap-2">
          <div hlmCardHeader class="space-y-1">
            <h3 hlmCardTitle>
              {{ $selectedRoute().name ?? 'Unnamed Route' }}
            </h3>

            <div class="flex items-center gap-2">
              @if ($selectedRoute().from || $selectedRoute().description) {
                <ng-icon name="lucide:map-pin" class="!size-4" />
              }
              <span>
                @if ($selectedRoute().from) {
                  {{ $selectedRoute().from }}
                } @else if ($selectedRoute().description) {
                  {{ $selectedRoute().description.split(' - ')[0] }}
                }
              </span>
            </div>
          </div>

          <ul
            hlmCardContent
            class="space-y-2 [&>li]:flex [&>li]:gap-2 [&>li]:items-center"
          >
            <li>
              <span>Network:</span>
              @if ($selectedRoute().network) {
                <span class="font-semibold">{{
                  $selectedRoute().network
                }}</span>
              } @else {
                <span class="font-semibold">N/A</span>
              }
            </li>

            <li>
              <span>Distance:</span>
              @if ($selectedRoute().distance) {
                <span class="font-semibold">{{
                  $selectedRoute().distance.includes('km')
                    ? $selectedRoute().distance
                    : $selectedRoute().distance + ' km'
                }}</span>
              } @else {
                <span class="font-semibold">N/A</span>
              }
            </li>

            <li>
              <span>Route:</span>
              @if ($selectedRoute().route) {
                <span class="line-clamp-1 font-semibold">{{
                  $selectedRoute().route
                }}</span>
              } @else {
                <span class="font-semibold">N/A</span>
              }
            </li>

            @if ($selectedRoute().website) {
              <li>
                <span>Website:</span>
                <a
                  [href]="$selectedRoute().website"
                  target="_blank"
                  class="text-primary font-semibold line-clamp-1"
                  >{{ $selectedRoute().website }}</a
                >
              </li>
            }

            @if ($selectedRoute()['wikipedia']) {
              <li class="cursor-pointer">
                <a
                  [href]="$selectedRoute()['wikipedia']"
                  target="_blank"
                  class="flex items-center gap-2"
                >
                  <ng-icon name="lucide:external-link" class="!size-4" />

                  <span>Wikipedia</span>
                </a>
              </li>
            }

            <li class="cursor-pointer">
              <a
                [href]="'https://openstreetmap.org/' + $selectedRoute()['id']"
                target="_blank"
                class="flex items-center gap-2"
              >
                <ng-icon name="lucide:external-link" class="!size-4" />

                <span>OpenStreetMap</span>
              </a>
            </li>
          </ul>

          <a
            [href]="'https://openstreetmap.org/' + $selectedRoute()['id']"
            target="_blank"
            hlmBtn
            variant="default"
            class="mt-4 ml-auto self-end"
          >
            Update
          </a>
        </div>
      } @else {
        <div class="flex flex-col gap-3 p-6">
          <h2 class="${hlmLarge}">Route Types</h2>

          <ul
            class="flex flex-col gap-3 [&>li]:flex [&>li]:gap-2 [&>li]:items-center"
          >
            <li>
              <span
                class="inline-block size-5 rounded-full bg-violet-500"
              ></span>
              <span>Route International</span>
            </li>

            <li>
              <span class="inline-block size-5 rounded-full bg-red-700"></span>
              <span>Route National</span>
            </li>

            <li>
              <span
                class="inline-block size-5 rounded-full bg-orange-500"
              ></span>
              <span>Route Regional</span>
            </li>

            <li>
              <span class="inline-block size-5 rounded-full bg-black"></span>
              <span>Route Local</span>
            </li>
          </ul>
        </div>
      }
    </section>

    @if (!$selectedRoute()) {
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
                    element.properties.network === 'icn' &&
                      'border-l-violet-500',
                    element.properties.network === 'ncn' && 'border-l-red-700',
                    element.properties.network === 'rcn' &&
                      'border-l-orange-500',
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
    }
  `,
})
export class SidebarComponent {
  protected readonly hlm = hlm;
  private readonly routeStore = inject(RouteStore);
  private readonly mapStore = inject(MapStore);

  $selectedRoute = this.routeStore.selectedRoute;
  $routesOnArea = this.routeStore.routesOnArea;
  $bbox = this.mapStore.bbox;

  constructor() {
    effect(() => {
      const bbox = this.$bbox();
      if (bbox) this.routeStore.getRouteByArea(bbox);
    });
  }

  clearSelectedRoute() {
    this.routeStore.clearSelectedRoute();
  }

  selectRoute(element: GeoJSON.Feature) {
    this.routeStore.setSelectedRoute(
      element.properties as NonNullable<GeoJSON.Feature['properties']>,
    );

    this.routeStore.setSelectedRouteBounds(element);
  }
}
