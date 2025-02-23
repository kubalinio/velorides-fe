export const RouteTypes = {
  LOCAL: 'lcn',
  REGIONAL: 'rcn',
  NATIONAL: 'ncn',
  INTERNATIONAL: 'icn',
} as const;

export type RouteType = (typeof RouteTypes)[keyof typeof RouteTypes];
