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
  HlmCardDirective,
  HlmCardHeaderDirective,
  HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { hlmLarge, HlmLargeDirective } from '@spartan-ng/ui-typography-helm';
import { GpxExportService, RouteStore } from '@velo/routes/data-access';

@Component({
  standalone: true,
  selector: 'app-edit-route',
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
    HlmLargeDirective,
    HlmCardDirective,
  ],
  template: `
    <section class="pl-1 pr-2.5">
      <div class="relative flex items-center justify-center mt-2 mb-4 h-full">
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

      @if ($selectedRoute()) {
        <div class="overflow-x-hidden flex flex-col gap-2">
          <div hlmCardHeader class="space-y-1">
            <h3 hlmCardTitle>
              {{ $selectedRoute()['name'] ?? 'Unnamed Route' }}
            </h3>

            <div class="flex items-center gap-2">
              @if (
                $selectedRoute()['from'] || $selectedRoute()['description']
              ) {
                <ng-icon name="lucide:map-pin" class="!size-4" />
              }
              <span>
                @if ($selectedRoute()['from']) {
                  {{ $selectedRoute()['from'] }}
                } @else if ($selectedRoute()['description']) {
                  {{ $selectedRoute()['description'].split(' - ')[0] }}
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
              @if ($selectedRoute()['network']) {
                <span class="font-semibold">{{
                  $selectedRoute()['network']
                }}</span>
              } @else {
                <span class="font-semibold">N/A</span>
              }
            </li>

            <li>
              <span>Distance:</span>
              @if ($selectedRoute()['distance']) {
                <span class="font-semibold">{{
                  $selectedRoute()['distance'].includes('km')
                    ? $selectedRoute()['distance']
                    : $selectedRoute()['distance'] + ' km'
                }}</span>
              } @else {
                <span class="font-semibold">N/A</span>
              }
            </li>

            <li>
              <span>Route:</span>
              @if ($selectedRoute()['route']) {
                <span class="line-clamp-1 font-semibold">{{
                  $selectedRoute()['route']
                }}</span>
              } @else {
                <span class="font-semibold">N/A</span>
              }
            </li>

            @if ($selectedRoute()['website']) {
              <li>
                <span>Website:</span>
                <a
                  [href]="$selectedRoute()['website']"
                  target="_blank"
                  class="text-primary font-semibold line-clamp-1"
                  >{{ $selectedRoute()['website'] }}</a
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

          @if ($routeSubways()) {
            <div class="flex mt-4 w-full flex-col gap-4">
              <h3 hlmLarge>Subways</h3>

              <ul class="pb-20 overflow-y-auto flex flex-col gap-3">
                @for (
                  route of $routeSubways();
                  let i = $index;
                  track route.properties['id']
                ) {
                  <li
                    class="flex gap-2 py-1.5 pr-2 pl-12 items-center justify-between relative overflow-hidden border-0"
                    hlmCard
                  >
                    <div
                      [class]="
                        hlm(
                          'flex left-0 items-center justify-center h-full w-9 absolute top-0 bottom-0 pr-1',
                          !route.properties['surface'] && 'bg-red-600',
                          route.properties['surface'] === 'paved' &&
                            'bg-blue-500',
                          route.properties['surface'] === 'asphalt' &&
                            'bg-gray-700',
                          route.properties['surface'] === 'gravel' &&
                            'bg-yellow-500',
                          route.properties['surface'] === 'ground' &&
                            'bg-stone-500',
                          route.properties['surface'] === 'unpaved' &&
                            'bg-orange-500',
                          route.properties['surface'] === 'wood' &&
                            'bg-brown-500',
                          route.properties['surface'] === 'compacted' &&
                            'bg-yellow-500'
                        )
                      "
                    >
                      <span hlmLarge class="text-white w-full text-right">
                        {{ i + 1 }}.
                      </span>
                    </div>

                    <div
                      class="flex gap-2 p-0 items-center justify-start"
                      hlmCardContent
                    >
                      <span hlmLarge>
                        {{ route.properties['surface'] ?? 'N/A' }}
                      </span>
                    </div>

                    <div hlmCardFooter>
                      <a
                        [href]="
                          'https://openstreetmap.org/' + route.properties['id']
                        "
                        target="_blank"
                        class="flex items-center gap-2"
                      >
                        <span>Edit</span>
                        <ng-icon name="lucide:external-link" class="!size-4" />
                      </a>
                    </div>
                  </li>
                }
              </ul>
            </div>
          }

          <div
            class="bottom-0 right-4 py-4 px-6 bg-gray-300 flex gap-2 mt-4 w-[22rem] fixed justify-between"
          >
            <button
              hlmBtn
              variant="outline"
              (click)="exportRouteAsGpx()"
              class="flex items-center gap-2"
            >
              <ng-icon name="lucide:download" class="!size-4" />
              Export GPX
            </button>

            <a
              [href]="'https://openstreetmap.org/' + $selectedRoute()['id']"
              target="_blank"
              hlmBtn
              variant="default"
            >
              Update
            </a>
          </div>
        </div>
      } @else {
        <div class="p-4 text-center">
          <p>No route selected. Please select a route from the map.</p>
        </div>
      }
    </section>
  `,
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

  ngOnInit() {
    if (this.activatedRoute.snapshot.params['id']) {
      this.routeStore.getRouteById(this.activatedRoute.snapshot.params['id']);
    }
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
