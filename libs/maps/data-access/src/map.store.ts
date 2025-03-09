import { inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  withProps,
  withHooks,
  patchState,
  // patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MapService } from './map.service';
import { StyleSpecification } from 'maplibre-gl';
import { pipe, switchMap, tap } from 'rxjs';
import { BBox } from 'geojson';

export const MapStore = signalStore(
  { providedIn: 'root' },
  withState({
    bbox: undefined as BBox | undefined,
    bicycleRoutes: undefined as
      | GeoJSON.FeatureCollection['features']
      | undefined,
    mapTiles: undefined as StyleSpecification | undefined,
    style: 'standard' as const,
  }),
  withProps(() => ({
    _mapService: inject(MapService),
  })),
  withMethods((store) => ({
    getMapTiles: rxMethod<string>(
      pipe(
        switchMap((style) =>
          store._mapService
            .getMapTiles(style as 'standard' | 'satellite')
            .pipe(tap((style) => patchState(store, { mapTiles: style }))),
        ),
      ),
    ),
    setBbox: rxMethod<BBox>(
      pipe(tap((bbox: BBox) => patchState(store, { bbox }))),
    ),
  })),
  withHooks((store) => ({
    onInit() {
      store.getMapTiles('standard');
    },
  })),
);
