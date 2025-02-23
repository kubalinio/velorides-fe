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

export const MapStore = signalStore(
  { providedIn: 'root' },
  withState({
    style: 'standard' as const,
    mapTiles: undefined as StyleSpecification | undefined,
    bicycleRoutes: undefined as
      | GeoJSON.FeatureCollection['features']
      | undefined,
  }),
  withProps(() => ({
    _mapService: inject(MapService),
  })),
  withMethods((store) => ({
    getMapTiles: rxMethod<string>(
      pipe(
        switchMap((styleType) =>
          store._mapService
            .getMapTiles(styleType)
            .pipe(tap((style) => patchState(store, { mapTiles: style }))),
        ),
      ),
    ),
    getBicycleRoutes: rxMethod<void>(
      pipe(
        switchMap(() =>
          store._mapService
            .getBicycleRoutes()
            .pipe(
              tap((routes: GeoJSON.FeatureCollection['features']) =>
                patchState(store, { bicycleRoutes: routes }),
              ),
            ),
        ),
      ),
    ),
  })),
  withHooks((store) => ({
    onInit() {
      store.getMapTiles('standard');
      store.getBicycleRoutes();
    },
  })),
);
