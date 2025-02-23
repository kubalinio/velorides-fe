import { Component, inject } from '@angular/core';
import { RouteStore } from '@velo/routes/data-access';
import {
  HlmCardContentDirective,
  HlmCardHeaderDirective,
  HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';

import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { provideIcons } from '@ng-icons/core';
import { NgIconComponent } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideMapPin,
  lucideExternalLink,
} from '@ng-icons/lucide';
import { hlmLarge } from '@spartan-ng/ui-typography-helm';
@Component({
  standalone: true,
  selector: 'sidebar-viewing-map',
  providers: [
    provideIcons({ lucideArrowLeft, lucideMapPin, lucideExternalLink }),
  ],
  imports: [
    NgIconComponent,
    HlmButtonDirective,
    HlmCardHeaderDirective,
    HlmCardContentDirective,
    HlmCardTitleDirective,
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

        <div class="overflow-x-hidden">
          <div hlmCardHeader class="space-y-1">
            <h3 hlmCardTitle>
              {{ $selectedRoute().name }}
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
            @if ($selectedRoute().distance) {
              <li>
                <span>Distance:</span>
                <span class="font-semibold">{{
                  $selectedRoute().distance.includes('km')
                    ? $selectedRoute().distance
                    : $selectedRoute().distance + ' km'
                }}</span>
              </li>
            }

            @if ($selectedRoute().route) {
              <li>
                <span>Route:</span>
                <span class="line-clamp-1 font-semibold">{{
                  $selectedRoute().route
                }}</span>
              </li>
            }

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

            <li class="cursor-pointer">
              <a
                [href]="'https://openstreetmap.org/' + $selectedRoute()['@id']"
                target="_blank"
                class="flex items-center gap-2"
              >
                <ng-icon name="lucide:external-link" class="!size-4" />

                <span>OpenStreetMap</span>
              </a>
            </li>
          </ul>
        </div>
      } @else {
        <div class="flex flex-col gap-3 p-6">
          <h2 class="${hlmLarge}">Route Types</h2>

          <ul
            class="flex flex-col gap-3 [&>li]:flex [&>li]:gap-2 [&>li]:items-center"
          >
            <li>
              <span class="inline-block size-5 rounded-full bg-red-900"></span>
              <span>Route International</span>
            </li>

            <li>
              <span class="inline-block size-5 rounded-full bg-blue-900"></span>
              <span>Route National</span>
            </li>

            <li>
              <span
                class="inline-block size-5 rounded-full bg-yellow-300"
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
  `,
})
export class SidebarComponent {
  private readonly routeStore = inject(RouteStore);

  $selectedRoute = this.routeStore.selectedRoute;

  clearSelectedRoute() {
    this.routeStore.clearSelectedRoute();
  }
}
