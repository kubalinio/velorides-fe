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
