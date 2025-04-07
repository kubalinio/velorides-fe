import { inject } from '@angular/core';
import { RouteService } from './services/route.service';
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { catchError, map, Observable, of, pipe, switchMap } from 'rxjs';
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
  setError,
  setLoaded,
  setLoading,
  withCallState,
} from '@angular-architects/ngrx-toolkit';
import { RouteWaysService } from './services/route-ways.service';

export const RouteStore = signalStore(
  { providedIn: 'root' },
  withState<RouteDetailsState>(routeInitialState),
  withState<RouteInteractionState>(routeInteractionInitialState),
  withProps(() => ({
    _routeService: inject(RouteService),
    _routeWaysService: inject(RouteWaysService),
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
              (error: { message: string }) => {
                patchState(store, {
                  ...routeInitialState,
                  ...setLoaded('getRoute'),
                  ...setError(error.message, 'getRoute'),
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
    setSelectedWay: rxMethod<GeoJSON.Feature<GeoJSON.LineString>>(
      pipe(
        tap((way: GeoJSON.Feature<GeoJSON.LineString>) =>
          patchState(store, {
            selectedWay: {
              ...way,
              properties: {
                ...way.properties,
                bounds: JSON.stringify(way.geometry.coordinates),
              },
            },
          }),
        ),
      ),
    ),
    getChangeset: rxMethod<{
      osm_username: string;
      routeId: string;
    }>(
      pipe(
        tap(() =>
          patchState(store, {
            ...routeInitialState,
            ...setLoading('getChangeset'),
          }),
        ),
        switchMap((args) =>
          store._routeWaysService.getChangeset(args).pipe(
            tapResponse(
              () => {
                patchState(store, {
                  ...routeInitialState,
                  ...setLoaded('getChangeset'),
                });
              },
              (error: { message: string }) => {
                patchState(store, {
                  ...routeInitialState,
                  ...setLoaded('updateWay'),
                  ...setError(error.message, 'updateWay'),
                });
              },
            ),
          ),
        ),
      ),
    ),
    updateWay(payload: {
      osm_username: string | null;
      routeId: string;
      wayId: string;
      surface: string;
    }): Observable<{ success: boolean; error: string }> {
      patchState(store, (state) => ({
        ...state,
        ...setLoading('updateWay'),
      }));

      return store._routeWaysService.updateRouteWay(payload).pipe(
        tapResponse(
          (response: { success: boolean; error: string }) => {
            if (response && response.success) {
              patchState(store, (state) => ({
                ...state,
                ...setLoaded('updateWay'),
              }));
              // in routeWays() signal here if the service provides enough info.
            } else {
              patchState(store, (state) => ({
                ...state,
                ...setError(response.error || 'Update failed', 'updateWay'),
              }));
            }
          },
          (error: Error | any) => {
            patchState(store, (state) => ({
              ...state,
              ...setError(
                error?.message || 'An unknown error occurred during update',
                'updateWay',
              ),
            }));
          },
        ),
        // Ensure the original response is passed through for the component subscriber
        map((response) => response),
        // Catch errors in the stream and convert them to a success:false emission
        catchError((error) => {
          patchState(store, (state) => ({
            ...state,
            ...setError(error?.message || 'Failed to update way', 'updateWay'),
          }));
          // Return an observable emitting a standard error object
          return of({
            success: false,
            error: error?.message || 'Failed to update way',
          });
        }),
      );
    },
    closeChangeset: rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, (state) => ({
            ...state,
            ...setLoading('closeChangeset'),
          })),
        ),
        switchMap((changesetId: string) =>
          store._routeWaysService.closeChangesetOSM(changesetId).pipe(
            tapResponse(
              () => {
                patchState(store, (state) => ({
                  ...state,
                  ...setLoaded('closeChangeset'),
                }));
              },
              (error: { message: string }) => {
                patchState(store, (state) => ({
                  ...state,
                  ...setError(error.message, 'closeChangeset'),
                }));
              },
            ),
          ),
        ),
      ),
    ),
  })),
  withCallState({ collection: 'getRoute' }),
  withCallState({ collection: 'updateWay' }),
  withCallState({ collection: 'closeChangeset' }),
);
