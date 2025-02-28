export interface Viewpoint {
  type: 'Feature';
  properties: {
    '@id': string;
    tourism: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  id: string;
}

export const ViewpointType = {
  VIEWPOINT: 'viewpoint',
  ATTRACTION: 'attraction',
} as const;

export type ViewpointType = (typeof ViewpointType)[keyof typeof ViewpointType];

export type WaypointsFilterType = ViewpointType[] | [];
