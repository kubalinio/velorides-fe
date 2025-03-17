import { inject } from '@angular/core';
import { RoutesService } from './services/routes.service';
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

import { pipe, switchMap } from 'rxjs';
import { tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { BBox } from 'geojson';
import { tapResponse } from '@ngrx/operators';

import type {
  RoutesListState,
  RouteType,
  RoutesInteractionState,
} from './models/routes';
import {
  routesDataState,
  routesInteractionInitialState,
} from './models/routes';
import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
} from '@angular-architects/ngrx-toolkit';

export const RoutesStore = signalStore(
  { providedIn: 'root' },
  withState<RoutesListState>(routesDataState),
  withState<RoutesInteractionState>(routesInteractionInitialState),
  withProps(() => ({
    _routesService: inject(RoutesService),
  })),
  withMethods((store) => ({
    changeRouteType: rxMethod<{ bbox: BBox; routeType: RouteType }>(
      pipe(
        tap(({ routeType }) => {
          patchState(store, {
            selectedRouteType: store.selectedRouteType().includes(routeType)
              ? store.selectedRouteType().filter((type) => type !== routeType)
              : [...store.selectedRouteType(), routeType],
          });
        }),
      ),
    ),
    getRoutesByArea: rxMethod<BBox>(
      pipe(
        tap(() =>
          patchState(store, {
            ...routesDataState,
            ...setLoading('getRoutes'),
          }),
        ),
        switchMap((bbox: BBox) => {
          return store._routesService
            .getRoutesByArea(bbox, store.selectedRouteType())
            .pipe(
              tapResponse({
                next(routes: GeoJSON.FeatureCollection) {
                  patchState(store, {
                    routes: routes,
                    ...setLoaded('getRoutes'),
                  });
                },
                error(error: { message: string }) {
                  patchState(store, {
                    ...routesDataState,
                    ...setLoaded('getRoutes'),
                    ...setError(error.message, 'getRoutes'),
                  });
                },
              }),
            );
        }),
      ),
    ),
    setHoveredRouteFeedId: rxMethod<string>(
      pipe(tap((id: string) => patchState(store, { hoveredRouteFeedId: id }))),
    ),
    toggleSidebar: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isSidebarOpen: !store.isSidebarOpen() })),
      ),
    ),
  })),
  withCallState({ collection: 'getRoutes' }),
);
