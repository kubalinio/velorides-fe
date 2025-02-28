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
import { switchMap, tap } from 'rxjs';
import { WaypointsFilterType, ViewpointType } from './models/viewpoint';

type WaypointsState = {
  viewpoints: GeoJSON.FeatureCollection | null;
  selectedViewpoint: WaypointsFilterType;
};

export const WaypointsStore = signalStore(
  { providedIn: 'root' },
  withState<WaypointsState>({
    viewpoints: null,
    selectedViewpoint: [],
  }),
  withProps(() => ({
    _waypointsService: inject(WaypointsService),
  })),
  withMethods((store) => ({
    getViewpoints: rxMethod<void>(() =>
      store._waypointsService.getViewpoints(store.selectedViewpoint()).pipe(
        tap((viewpoints: GeoJSON.FeatureCollection) =>
          patchState<WaypointsState>(store, {
            viewpoints: viewpoints,
          }),
        ),
      ),
    ),
    setSelectedViewpoint: rxMethod<ViewpointType>(
      switchMap((viewpoint: ViewpointType) =>
        store._waypointsService
          .updateWaypointsFilter(store.selectedViewpoint(), viewpoint)
          .pipe(
            tap((waypoints: WaypointsFilterType) =>
              patchState<WaypointsState>(store, {
                selectedViewpoint: waypoints,
              }),
            ),
            switchMap((waypoints) =>
              store._waypointsService.getViewpoints(waypoints).pipe(
                tap((viewpoints: GeoJSON.FeatureCollection) =>
                  patchState<WaypointsState>(store, {
                    viewpoints: viewpoints,
                  }),
                ),
              ),
            ),
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
