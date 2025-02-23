import { inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  withProps,
  withHooks,
  patchState,
  // patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MapService } from './map.service';
import { StyleSpecification } from 'maplibre-gl';
import { pipe, switchMap, tap } from 'rxjs';
import { RouteType } from './models/routes';

export const MapStore = signalStore(
  { providedIn: 'root' },
  withState({
    style: 'standard' as const,
    mapTiles: undefined as StyleSpecification | undefined,
    bicycleRoutes: undefined as
      | GeoJSON.FeatureCollection['features']
      | undefined,
    selectedRouteType: ['lcn', 'rcn', 'ncn', 'icn'] as RouteType[],
  }),
  withProps(() => ({
    _mapService: inject(MapService),
  })),
  withMethods((store) => ({
    getMapTiles: rxMethod<string>(
      pipe(
        switchMap((styleType) =>
          store._mapService
            .getMapTiles(styleType)
            .pipe(tap((style) => patchState(store, { mapTiles: style }))),
        ),
      ),
    ),
    getBicycleRoutes: rxMethod<void>(
      pipe(
        switchMap(() =>
          store._mapService
            .getBicycleRoutes(store.selectedRouteType())
            .pipe(
              tap((routes: GeoJSON.FeatureCollection['features']) =>
                patchState(store, { bicycleRoutes: routes }),
              ),
            ),
        ),
      ),
    ),
    changeRouteType: rxMethod<RouteType>(
      pipe(
        tap((routeType) => {
          patchState(store, {
            selectedRouteType: store.selectedRouteType().includes(routeType)
              ? store.selectedRouteType().filter((type) => type !== routeType)
              : [...store.selectedRouteType(), routeType],
          });
        }),
        switchMap(() =>
          store._mapService.getBicycleRoutes(store.selectedRouteType()),
        ),
        tap((routes: GeoJSON.FeatureCollection['features']) =>
          patchState(store, { bicycleRoutes: routes }),
        ),
      ),
    ),
  })),
  withHooks((store) => ({
    onInit() {
      store.getMapTiles('standard');
      store.getBicycleRoutes();
    },
  })),
);
