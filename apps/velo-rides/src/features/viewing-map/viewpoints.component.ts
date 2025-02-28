import { Component, inject, output, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideMapPin } from '@ng-icons/lucide';
import { hlmLarge, hlmP } from '@spartan-ng/ui-typography-helm';
import { hlmMuted } from '@spartan-ng/ui-typography-helm';
import {
  ClusterPointDirective,
  GeoJSONSourceComponent,
  MarkersForClustersComponent,
  PointDirective,
  PopupComponent,
} from '@velo/ngx-maplibre-gl';
import { WaypointsStore } from '@velo/waypoints/data-access';

@Component({
  selector: 'viewing-map-viewpoints',
  standalone: true,
  imports: [
    MarkersForClustersComponent,
    PointDirective,
    ClusterPointDirective,
    GeoJSONSourceComponent,
    PopupComponent,
    NgIconComponent,
  ],
  providers: [provideIcons({ lucideMapPin })],
  template: `
    @if ($viewpoints()) {
      <mgl-geojson-source
        id="viewpoints"
        [data]="$viewpoints()"
        [cluster]="true"
        [clusterMaxZoom]="9"
        [clusterRadius]="50"
        [clusterMinPoints]="2"
      ></mgl-geojson-source>

      <mgl-markers-for-clusters source="viewpoints">
        <ng-template mglPoint let-feature>
          <div
            class="size-5 rounded-full bg-gray-800 border-2 border-gray-600 text-white flex items-center justify-center font-semibold cursor-pointer"
            [title]="feature.properties['name']"
            (click)="setSelectedViewpoint($event, feature)"
          ></div>
        </ng-template>
        <ng-template mglClusterPoint let-feature>
          <div
            class="size-9 rounded-full bg-gray-800 border-2 border-gray-600 text-white flex items-center justify-center font-semibold"
            (click)="zoomToCluster($event, feature)"
          >
            {{ feature.properties?.point_count }}
          </div>
        </ng-template>
      </mgl-markers-for-clusters>

      @if (selectedViewpoint(); as selectedViewpointValue) {
        <mgl-popup
          [feature]="selectedViewpointValue"
          (popupClose)="selectedViewpoint.set(null)"
          [closeButton]="false"
          [closeOnClick]="true"
          [className]="'!max-w-[320px]'"
        >
          <div class="px-2">
            <h3 class="${hlmLarge} text-sm">
              {{ selectedViewpointValue.properties['name'] }}
            </h3>

            <p class="${hlmP} text-xs flex items-center gap-x-1 !mt-1">
              <ng-icon name="lucide:map-pin" class="!size-4" />
              {{ selectedViewpointValue.geometry.coordinates[0].toFixed(6) }}
              {{ selectedViewpointValue.geometry.coordinates[1].toFixed(6) }}
            </p>

            <a
              [href]="
                'https://www.openstreetmap.org/edit?' +
                selectedViewpointValue.properties['id']
              "
              target="_blank"
              class="${hlmMuted} text-xs flex items-center gap-x-1 whitespace-nowrap mt-4"
            >
              Incorrect data? You can update it here
            </a>
          </div>
        </mgl-popup>
      }
    }
  `,
})
export class ViewingMapViewpointsComponent {
  private readonly waypointsStore = inject(WaypointsStore);

  selectedViewpoint = signal<GeoJSON.Feature<GeoJSON.Point> | null>(null);
  centerMapToCluster = output<{
    coords: number[];
  }>();

  $viewpoints = this.waypointsStore.viewpoints;

  ngOnInit() {
    this.waypointsStore.getViewpoints();
  }

  setSelectedViewpoint(
    _event: MouseEvent,
    feature: GeoJSON.Feature<GeoJSON.Point>,
  ) {
    this.selectedViewpoint.set(feature);
  }

  zoomToCluster(_event: any, feature: GeoJSON.Feature<GeoJSON.Point>) {
    this.centerMapToCluster.emit({
      coords: feature.geometry.coordinates,
    });
  }
}
