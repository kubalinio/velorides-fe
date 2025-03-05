import { Component, inject, output, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideMapPin } from '@ng-icons/lucide';
import {
  HlmLargeDirective,
  HlmPDirective,
  HlmMutedDirective,
} from '@spartan-ng/ui-typography-helm';
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
    HlmLargeDirective,
    HlmPDirective,
    HlmMutedDirective,
  ],
  providers: [provideIcons({ lucideMapPin })],
  templateUrl: './viewpoints.component.html',
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
