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
  routesInitialState,
  routesInteractionInitialState,
} from './models/routes';
import {
  setLoaded,
  setLoading,
  withCallState,
} from '@angular-architects/ngrx-toolkit';

export const RoutesStore = signalStore(
  { providedIn: 'root' },
  withState<RoutesListState>(routesInitialState),
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
    getRouteByArea: rxMethod<BBox>(
      pipe(
        switchMap((bbox: BBox) => {
          return store._routesService
            .getRouteByArea(bbox, store.selectedRouteType())
            .pipe(
              tap(() => setLoading('getRoutes')),
              tapResponse({
                next(routes: GeoJSON.FeatureCollection) {
                  patchState(store, {
                    routes: routes,
                    ...setLoaded('getRoutes'),
                  });
                },
                error(error) {
                  console.error(error);
                  patchState(store, {
                    ...routesInitialState,
                    ...setLoaded('getRoutes'),
                    // ...setError('getRoutes'),
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
  })),
  withCallState({ collection: 'getRoutes' }),
);
