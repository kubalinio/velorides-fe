import { inject } from '@angular/core';
import { RoutesService } from './routes.service';
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { pipe } from 'rxjs';
import { tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Feature } from 'geojson';

export const RouteStore = signalStore(
  { providedIn: 'root' },
  withState({
    selectedRoute: undefined as NonNullable<Feature['properties']> | undefined,
  }),
  withProps(() => ({
    _routesService: inject(RoutesService),
  })),
  withMethods((store) => ({
    // getRoutes: rxMethod(
    //   pipe(
    //     switchMap((route: NonNullable<GeoJSON.Feature['properties']>) =>
    //       store._routesService
    //         .getRoute(route)
    //         .pipe(tap((route) => patchState(store, { selectedRoute: route }))),
    //     ),
    //   ),
    // ),
    setSelectedRoute: rxMethod(
      pipe(
        tap((route: NonNullable<Feature['properties']>) =>
          patchState(store, { selectedRoute: route }),
        ),
      ),
    ),
    clearSelectedRoute: rxMethod<void>(
      pipe(tap(() => patchState(store, { selectedRoute: undefined }))),
    ),
  })),
);
