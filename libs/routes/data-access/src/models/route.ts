import { Feature } from 'geojson';

type RouteTypeResponse = {
  route: GeoJSON.FeatureCollection;
  subways: GeoJSON.FeatureCollection;
};

type RouteDetailsState = {
  routeWays: GeoJSON.Feature[] | undefined;
};

type RouteInteractionState = {
  hoveredSubwayId: string | null;
  selectedRoute: NonNullable<Feature['properties']> | undefined;
  selectedRouteBounds: GeoJSON.Feature | undefined;
  selectedWay:
    | (GeoJSON.Feature<GeoJSON.LineString> & {
        properties: GeoJSON.Feature<GeoJSON.LineString>['properties'] & {
          bounds: string;
        };
      })
    | undefined;
};

const routeInitialState: RouteDetailsState = {
  routeWays: [],
};

const routeInteractionInitialState: RouteInteractionState = {
  hoveredSubwayId: null,
  selectedRoute: undefined,
  selectedRouteBounds: undefined,
  selectedWay: undefined,
};

export type { RouteTypeResponse, RouteDetailsState, RouteInteractionState };
export { routeInitialState, routeInteractionInitialState };
