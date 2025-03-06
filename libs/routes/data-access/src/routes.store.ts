import { inject } from '@angular/core';
import { RoutesService } from './routes.service';
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { debounceTime, pipe, switchMap } from 'rxjs';
import { tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Feature, BBox } from 'geojson';
import { tapResponse } from '@ngrx/operators';
import { RouteType } from './models/routes';

export const RouteStore = signalStore(
  { providedIn: 'root' },
  withState({
    selectedRoute: undefined as NonNullable<Feature['properties']> | undefined,
    routesOnArea: undefined as GeoJSON.FeatureCollection | undefined,
    selectedRouteType: ['lcn', 'rcn', 'ncn', 'icn'] as RouteType[],
    selectedRouteBounds: undefined as GeoJSON.Feature | undefined,
  }),
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
        switchMap(({ bbox }) =>
          store._routesService.getRouteByArea(bbox, store.selectedRouteType()),
        ),
        tap((routes: GeoJSON.FeatureCollection) =>
          patchState(store, { routesOnArea: routes }),
        ),
      ),
    ),
    setSelectedRoute: rxMethod(
      pipe(
        tap((route: NonNullable<Feature['properties']>) =>
          patchState(store, { selectedRoute: route }),
        ),
      ),
    ),
    clearSelectedRoute: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { selectedRoute: undefined });
          patchState(store, { selectedRouteBounds: undefined });
        }),
      ),
    ),
    getRouteByArea: rxMethod<BBox>(
      pipe(
        debounceTime(3000),
        switchMap((bbox: BBox) =>
          store._routesService
            .getRouteByArea(bbox, store.selectedRouteType())
            .pipe(
              tapResponse({
                next(routes: GeoJSON.FeatureCollection) {
                  patchState(store, {
                    routesOnArea: routes,
                  });
                },
                error(error) {
                  console.error(error);
                },
              }),
            ),
        ),
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
  })),
);
