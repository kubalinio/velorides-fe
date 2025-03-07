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
import { RouteTypeResponse } from './models/route';

export const RouteStore = signalStore(
  { providedIn: 'root' },
  withState({
    routesOnArea: undefined as GeoJSON.FeatureCollection | undefined,
    selectedRouteType: ['lcn', 'rcn', 'ncn', 'icn'] as RouteType[],
    selectedRoute: undefined as NonNullable<Feature['properties']> | undefined,
    selectedRouteBounds: undefined as GeoJSON.Feature | undefined,
    routeSubways: [] as GeoJSON.Feature[] | undefined,
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
        tap((route: NonNullable<Feature['properties']>) => {
          patchState(store, { selectedRoute: route });
        }),
      ),
    ),
    clearSelectedRoute: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, {
            selectedRoute: undefined,
            selectedRouteBounds: undefined,
            routeSubways: [],
          });
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
    getRouteById: rxMethod<number>(
      pipe(
        switchMap((id: number) => store._routesService.getRouteById(id)),
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
