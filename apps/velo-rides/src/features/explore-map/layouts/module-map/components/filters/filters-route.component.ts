import { Component, inject } from '@angular/core';
import {
  BrnPopoverComponent,
  BrnPopoverContentDirective,
  BrnPopoverTriggerDirective,
} from '@spartan-ng/brain/popover';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmPopoverContentDirective } from '@spartan-ng/ui-popover-helm';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideRoute } from '@ng-icons/lucide';
import { HlmSwitchComponent } from '@spartan-ng/ui-switch-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { MapStore } from '@velo/maps/data-access';
import { RouteType } from 'libs/routes/data-access/src/models/routes';
import { RoutesStore, RouteStore } from '@velo/routes/data-access';

@Component({
  standalone: true,
  selector: 'filters-route',
  imports: [
    BrnPopoverComponent,
    BrnPopoverTriggerDirective,
    BrnPopoverContentDirective,
    HlmPopoverContentDirective,
    HlmButtonDirective,
    NgIconComponent,

    HlmSwitchComponent,
    HlmLabelDirective,
  ],
  providers: [provideIcons({ lucideRoute })],
  template: `
    <div class="absolute bottom-4 left-4">
      <brn-popover sideOffset="12" closeDelay="100" align="start">
        <button
          id="edit-profile"
          variant="default"
          size="icon"
          brnPopoverTrigger
          hlmBtn
        >
          <ng-icon name="lucide:route" class="!size-4" />
        </button>
        <div hlmPopoverContent class="grid gap-4" *brnPopoverContent="let ctx">
          <div class="grid gap-2">
            <h3 class="text-sm font-medium">Route Types</h3>

            <div class="grid gap-3">
              <label class="flex items-center" hlmLabel>
                <hlm-switch
                  [checked]="$selectedRouteType().includes('icn')"
                  class="mr-2"
                  (checkedChange)="changeRouteType('icn')"
                />
                <span>International Routes</span>
              </label>

              <label class="flex items-center" hlmLabel>
                <hlm-switch
                  [checked]="$selectedRouteType().includes('ncn')"
                  class="mr-2"
                  (checkedChange)="changeRouteType('ncn')"
                />
                <span>National Routes</span>
              </label>

              <label class="flex items-center" hlmLabel>
                <hlm-switch
                  [checked]="$selectedRouteType().includes('rcn')"
                  class="mr-2"
                  (checkedChange)="changeRouteType('rcn')"
                />
                <span>Regional Routes</span>
              </label>

              <label class="flex items-center" hlmLabel>
                <hlm-switch
                  [checked]="$selectedRouteType().includes('lcn')"
                  class="mr-2"
                  (checkedChange)="changeRouteType('lcn')"
                />
                <span>Local Routes</span>
              </label>
            </div>
          </div>
        </div>
      </brn-popover>
    </div>
  `,
})
export class FiltersRouteComponent {
  private readonly mapStore = inject(MapStore);
  private readonly routesStore = inject(RoutesStore);
  private readonly routeStore = inject(RouteStore);

  $selectedRouteType = this.routesStore.selectedRouteType;

  changeRouteType(routeType: RouteType) {
    this.routesStore.changeRouteType({
      bbox: this.mapStore.bbox(),
      routeType,
    });

    const selectedRoute = this.routeStore.selectedRoute();

    if (
      selectedRoute &&
      !this.$selectedRouteType().includes(selectedRoute.network as RouteType)
    ) {
      this.routeStore.setSelectedRoute(undefined);
    }
  }
}
