import { Injectable, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

export interface MapPosition {
  center: [number, number];
  zoom: number;
  bearing?: number;
  pitch?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MapUrlService implements OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  private readonly DEFAULT_CENTER: [number, number] = [
    18.966941330820333, 50.66308832195875,
  ];
  private readonly DEFAULT_ZOOM = 10;
  private readonly DEFAULT_BEARING = 0;
  private readonly DEFAULT_PITCH = 0;

  $mapPosition = signal<MapPosition>({
    center: this.DEFAULT_CENTER,
    zoom: this.DEFAULT_ZOOM,
    bearing: this.DEFAULT_BEARING,
    pitch: this.DEFAULT_PITCH,
  });

  constructor() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (Object.keys(params).length === 0) {
          return this.initializeDefaultParams();
        }

        this.updateFromParams(params);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize URL with default parameters
   */
  private initializeDefaultParams(): void {
    const defaultPosition: MapPosition = {
      center: this.DEFAULT_CENTER,
      zoom: this.DEFAULT_ZOOM,
      bearing: this.DEFAULT_BEARING,
      pitch: this.DEFAULT_PITCH,
    };

    this.$mapPosition.set(defaultPosition);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        lng: defaultPosition.center[0].toFixed(6),
        lat: defaultPosition.center[1].toFixed(6),
        zoom: defaultPosition.zoom.toFixed(2),
        ...(defaultPosition.bearing !== undefined &&
        defaultPosition.bearing !== 0
          ? { bearing: defaultPosition.bearing.toFixed(2) }
          : {}),
        ...(defaultPosition.pitch !== undefined && defaultPosition.pitch !== 0
          ? { pitch: defaultPosition.pitch.toFixed(2) }
          : {}),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * Update map position from URL parameters
   */
  private updateFromParams(params: Record<string, string>): void {
    const position: MapPosition = {
      center: [...this.DEFAULT_CENTER],
      zoom: this.DEFAULT_ZOOM,
      bearing: this.DEFAULT_BEARING,
      pitch: this.DEFAULT_PITCH,
    };

    // Parse URL parameters
    if (params['lng'] && params['lat']) {
      const lng = parseFloat(params['lng']);
      const lat = parseFloat(params['lat']);
      if (!isNaN(lng) && !isNaN(lat)) {
        position.center = [lng, lat];
      }
    }

    if (params['zoom']) {
      const zoom = parseFloat(params['zoom']);
      if (!isNaN(zoom)) {
        position.zoom = zoom;
      }
    }

    if (params['bearing']) {
      const bearing = parseFloat(params['bearing']);
      if (!isNaN(bearing)) {
        position.bearing = bearing;
      }
    }

    if (params['pitch']) {
      const pitch = parseFloat(params['pitch']);
      if (!isNaN(pitch)) {
        position.pitch = pitch;
      }
    }

    // Update the map position signal
    this.$mapPosition.set(position);
  }

  /**
   * Update the URL with the current map position
   */
  updateUrl(position: MapPosition): void {
    const current = this.$mapPosition();
    const isSignificantChange =
      Math.abs(position.center[0] - current.center[0]) > 0.0001 ||
      Math.abs(position.center[1] - current.center[1]) > 0.0001 ||
      Math.abs(position.zoom - current.zoom) > 0.1;

    if (!isSignificantChange) return;

    this.$mapPosition.set(position);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        lng: position.center[0].toFixed(6),
        lat: position.center[1].toFixed(6),
        zoom: position.zoom.toFixed(2),
        ...(position.bearing !== undefined && position.bearing !== 0
          ? { bearing: position.bearing.toFixed(2) }
          : {}),
        ...(position.pitch !== undefined && position.pitch !== 0
          ? { pitch: position.pitch.toFixed(2) }
          : {}),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
