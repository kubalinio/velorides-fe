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
import { RouteTypeResponse } from './models/route';

export const RouteStore = signalStore(
  { providedIn: 'root' },
  withState({
    selectedRoute: undefined as NonNullable<Feature['properties']> | undefined,
    selectedRouteBounds: undefined as GeoJSON.Feature | undefined,
    routeSubways: [] as GeoJSON.Feature[] | undefined,
  }),
  withProps(() => ({
    _routeService: inject(RouteService),
  })),
  withMethods((store) => ({
    setSelectedRoute: rxMethod(
      pipe(
        tap((route: NonNullable<Feature['properties']>) => {
          patchState(store, {
            selectedRoute: route,
            routeSubways: [],
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
    getRouteById: rxMethod<number>(
      pipe(
        switchMap((id: number) => store._routeService.getRouteById(id)),
        tap((route: RouteTypeResponse) => {
          patchState(store, {
            selectedRoute: route.route.features[0].properties as NonNullable<
              Feature['properties']
            >,
            selectedRouteBounds: route.route.features[0],
            routeSubways: route.subways.features,
          });
        }),
      ),
    ),
  })),
);
