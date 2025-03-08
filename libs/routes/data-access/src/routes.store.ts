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
import { RouteType } from './models/routes';

export const RoutesStore = signalStore(
  { providedIn: 'root' },
  withState({
    routesOnArea: undefined as GeoJSON.FeatureCollection | undefined,
    selectedRouteType: ['lcn', 'rcn', 'ncn', 'icn'] as RouteType[],
    hoveredRouteFeedId: null as string | null,
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
    getRouteByArea: rxMethod<BBox>(
      pipe(
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
    setHoveredRouteFeedId: rxMethod<string>(
      pipe(tap((id: string) => patchState(store, { hoveredRouteFeedId: id }))),
    ),
  })),
);
