import { Component, computed, inject, input, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBinoculars,
  lucideExternalLink,
  lucideGrid2x2,
  lucideLocateFixed,
} from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmCardContentDirective } from '@spartan-ng/ui-card-helm';
import {
  HlmMenuComponent,
  HlmMenuGroupComponent,
  HlmMenuItemCheckboxDirective,
  HlmMenuItemCheckComponent,
  HlmMenuItemIconDirective,
} from '@spartan-ng/ui-menu-helm';

import { RouteStore, RouteWaysService } from '@velo/routes-data-access';

@Component({
  selector: 'velo-route-ways',
  standalone: true,
  imports: [
    HlmCardDirective,
    HlmCardContentDirective,
    NgIconComponent,
    BrnMenuTriggerDirective,
    HlmMenuComponent,
    HlmMenuItemIconDirective,
    HlmMenuItemCheckComponent,
    HlmMenuGroupComponent,
    HlmMenuItemCheckboxDirective,
    HlmButtonDirective,
  ],
  providers: [
    provideIcons({
      lucideExternalLink,
      lucideBinoculars,
      lucideGrid2x2,
      lucideLocateFixed,
    }),
  ],
  templateUrl: './route-ways.component.html',
})
export class RouteWaysComponent {
  private readonly routeStore = inject(RouteStore);
  private readonly routeWaysService = inject(RouteWaysService);
  readonly hlm = hlm;
  readonly routeWays = input<GeoJSON.Feature[]>([]);

  $surfacesChecked = signal<string[]>([]);
  surfaceTypesAvailable = computed(() => this.getAvailableSurfaces());
  readonly $selectedWay = this.routeStore.selectedWay;

  readonly $filteredRouteWays = computed(() => {
    if (this.$surfacesChecked().length === 0) {
      return this.routeWays();
    }

    return this.routeWays().filter((way) => {
      if (this.$surfacesChecked().includes('n/a') && !way.properties.surface) {
        return true;
      }

      return this.$surfacesChecked().includes(way.properties.surface);
    });
  });

  readonly $surfacesCheckedCount = computed(() => {
    return this.$filteredRouteWays().length;
  });

  $hoveredSubwayId = this.routeStore.hoveredSubwayId;

  selectSubway(id: string | null) {
    this.routeStore.setHoveredSubwayId(id);
  }

  selectWayZoom(way: GeoJSON.Feature) {
    this.routeStore.setSelectedWay(
      way as unknown as GeoJSON.Feature<GeoJSON.LineString>,
    );
  }

  readonly getSurfaceColor = this.routeWaysService.getSurfaceColor;

  readonly getSurfaceName = this.routeWaysService.formatSufaceName;

  onSelectSurface(surface: string) {
    const surfacePrimitive = surface.toLowerCase().replace(' ', '_');

    this.$surfacesChecked.update((prev) => {
      if (prev.includes(surfacePrimitive)) {
        return prev.filter((s) => s !== surfacePrimitive);
      }

      return [...prev, surfacePrimitive];
    });
  }

  private getAvailableSurfaces(): { name: string; title: string }[] {
    const routeWays = this.routeWays();

    const surfaceTypes = routeWays.map((way) => {
      if (!way.properties.surface) return 'n/a';

      return way.properties.surface;
    });

    const uniqueSurfaceTypes: Set<string> = new Set(surfaceTypes);

    const surfaceTypesAvailableNames = Array.from(uniqueSurfaceTypes).map(
      (surface) => ({
        name: surface,
        title: this.getSurfaceName(surface) ?? surface,
      }),
    );

    return surfaceTypesAvailableNames;
  }
}
