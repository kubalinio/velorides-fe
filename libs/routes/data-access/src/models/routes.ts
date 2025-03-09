const RouteTypes = {
  LOCAL: 'lcn',
  REGIONAL: 'rcn',
  NATIONAL: 'ncn',
  INTERNATIONAL: 'icn',
} as const;

type RouteType = (typeof RouteTypes)[keyof typeof RouteTypes];

interface RoutesListState {
  listConfig: RoutesListConfig;
  routes: GeoJSON.FeatureCollection;
}

interface RoutesInteractionState {
  selectedRouteType: RouteType[];
  hoveredRouteFeedId: string | null;
}

interface RoutesListConfig {
  type: 'ALL';
  currentPage: number;
}

const routesInitialState: RoutesListState = {
  listConfig: {
    type: 'ALL',
    currentPage: 1,
  },
  routes: {
    type: 'FeatureCollection',
    features: [],
  },
};

const routesInteractionInitialState: RoutesInteractionState = {
  selectedRouteType: ['lcn', 'rcn', 'ncn', 'icn'] as RouteType[],
  hoveredRouteFeedId: null,
};

export type {
  RouteType,
  RoutesListState,
  RoutesInteractionState,
  RoutesListConfig,
};
export { RouteTypes, routesInitialState, routesInteractionInitialState };
