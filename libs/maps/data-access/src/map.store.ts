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
  })),
  withHooks((store) => ({
    onInit() {
      store.getMapTiles('bright');
    },
  })),
);
