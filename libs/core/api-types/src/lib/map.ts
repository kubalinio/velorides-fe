import type { LayerSpecification } from 'maplibre-gl';

export interface mapTiles {
  id: string;
  name: string;
  url: string;
}

export interface mapTilesResponse {
  version: number;
  styles: mapTiles[];
  name: string;
  sources: Record<string, { url: string; type: string }>;
  layers: LayerSpecification[];
  metadata: Record<string, any>;
  glyphs: string;
  sprite: string;
  bearing: number;
  pitch: number;
  center: [number, number];
  zoom: number;
}
