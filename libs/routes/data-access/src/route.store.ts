import { inject } from '@angular/core';
import { RouteService } from './services/route.service';
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
import { Feature } from 'geojson';

import { tapResponse } from '@ngrx/operators';
import type { RouteDetailsState, RouteInteractionState } from './models/route';
import {
  routeInitialState,
  routeInteractionInitialState,
} from './models/route';
import {
  setLoaded,
  setLoading,
  withCallState,
} from '@angular-architects/ngrx-toolkit';

export const RouteStore = signalStore(
  { providedIn: 'root' },
  withState<RouteDetailsState>(routeInitialState),
  withState<RouteInteractionState>(routeInteractionInitialState),
  withProps(() => ({
    _routeService: inject(RouteService),
  })),
  withMethods((store) => ({
    getRouteById: rxMethod<number>(
      pipe(
        tap(() =>
          patchState(store, {
            ...routeInitialState,
            ...setLoading('getRoute'),
          }),
        ),
        switchMap((id: number) =>
          store._routeService.getRouteById(id).pipe(
            tapResponse(
              (route) => {
                patchState(store, {
                  selectedRoute: route.route.features[0]
                    .properties as NonNullable<Feature['properties']>,
                  selectedRouteBounds: route.route.features[0],
                  routeWays: route.subways.features,
                  ...setLoaded('getRoute'),
                });
              },
              (error) => {
                console.error(error);
                patchState(store, {
                  ...routeInitialState,
                  ...setLoaded('getRoute'),
                  // ...setError('getRoute', error),
                });
              },
            ),
          ),
        ),
        tap(() => setLoaded('getRoute')),
      ),
    ),
    setSelectedRoute: rxMethod(
      pipe(
        tap((route: NonNullable<Feature['properties']>) => {
          patchState(store, {
            selectedRoute: route,
          });
        }),
      ),
    ),
    setSelectedRouteBounds: rxMethod<GeoJSON.Feature>(
      pipe(
        tap((route) => {
          patchState(store, {
            selectedRouteBounds: route as GeoJSON.Feature,
          });
        }),
      ),
    ),
    clearSelectedRoute: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, {
            selectedRoute: undefined,
            selectedRouteBounds: undefined,
          });
        }),
      ),
    ),
    setHoveredSubwayId: rxMethod<string>(
      pipe(tap((id: string) => patchState(store, { hoveredSubwayId: id }))),
    ),
  })),
  withCallState({ collection: 'getRoute' }),
);
