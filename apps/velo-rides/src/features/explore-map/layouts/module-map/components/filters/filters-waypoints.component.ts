import { Component, inject, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideBinoculars, lucideWaypoints } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import {
  HlmMenuComponent,
  HlmMenuGroupComponent,
  HlmMenuItemCheckboxDirective,
  HlmMenuItemCheckComponent,
  HlmMenuItemIconDirective,
} from '@spartan-ng/ui-menu-helm';
import { WaypointsStore } from '@velo/waypoints-data-access';
import { ViewpointType } from 'libs/waypoints/data-access/src/models/viewpoint';
import { hlm } from '@spartan-ng/brain/core';
import { RoutesStore } from '@velo/routes-data-access';

@Component({
  selector: 'filters-waypoints',
  standalone: true,
  imports: [
    BrnMenuTriggerDirective,
    HlmMenuComponent,
    HlmMenuItemIconDirective,
    HlmMenuItemCheckComponent,
    HlmMenuGroupComponent,
    HlmMenuItemCheckboxDirective,
    HlmButtonDirective,
    NgIconComponent,
  ],
  providers: [provideIcons({ lucideBinoculars, lucideWaypoints })],
  template: `
    <div
      [class]="
        hlm('absolute top-4 left-4', $isSidebarOpen() && 'max-sm:hidden')
      "
    >
      <div class="flex w-full items-center justify-center">
        <button
          hlmBtn
          variant="default"
          align="center"
          [brnMenuTriggerFor]="menu"
        >
          <ng-icon name="lucide:waypoints" hlmMenuIcon />
          <span>Waypoints</span>
        </button>
      </div>

      <ng-template #menu>
        <hlm-menu class="" variant="menubar">
          <hlm-menu-group>
            <button
              hlmMenuItemCheckbox
              class="pl-4 pr-1.5 justify-end"
              [checked]="viewpointChecked()"
              (triggered)="setSelectedViewpoint('viewpoint')"
            >
              <hlm-menu-item-check class="size-3 left-1" />

              <ng-icon name="lucide:binoculars" hlmMenuIcon />

              <span>Viewpoints</span>
            </button>
          </hlm-menu-group>
        </hlm-menu>
      </ng-template>
    </div>
  `,
})
export class FiltersWaypointsComponent {
  readonly hlm = hlm;
  private readonly waypointsStore = inject(WaypointsStore);
  private readonly routesStore = inject(RoutesStore);

  $isSidebarOpen = this.routesStore.isSidebarOpen;
  $selectedViewpoint = this.waypointsStore.selectedViewpoint;

  viewpointChecked = signal(
    this.$selectedViewpoint().includes('viewpoint' as never),
  );

  ngOnInit() {
    this.waypointsStore.getViewpoints();
  }

  setSelectedViewpoint(viewpoint: ViewpointType) {
    this.viewpointChecked.set(!this.viewpointChecked());
    this.waypointsStore.setSelectedViewpoint(viewpoint);
  }
}
