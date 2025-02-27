import {
  signalStore,
  withMethods,
  withProps,
  withState,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { WaypointsService } from './waypoints.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap } from 'rxjs';

type WaypointsState = {
  viewpoints: GeoJSON.FeatureCollection | null;
};

export const WaypointsStore = signalStore(
  { providedIn: 'root' },
  withState<WaypointsState>({
    viewpoints: null,
  }),
  withProps(() => ({
    _waypointsService: inject(WaypointsService),
  })),
  withMethods((store) => ({
    getViewpoints: rxMethod<void>(() =>
      store._waypointsService
        .getViewpoints()
        .pipe(
          tap((viewpoints: GeoJSON.FeatureCollection) =>
            patchState<WaypointsState>(store, { viewpoints }),
          ),
        ),
    ),
  })),
  withHooks((store) => ({
    onInit() {
      store.getViewpoints();
    },
  })),
);
