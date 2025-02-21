export interface Source {
  type: string;
  url?: string;
  tiles?: string[];
  tileSize?: number;
  maxzoom?: number;
  minzoom?: number;
  attribution?: string;
}

export interface Paint {
  [key: string]: any;
}

export interface Layout {
  [key: string]: any;
}

export interface Layer {
  id: string;
  type: string;
  source: string;
  'source-layer'?: string;
  paint?: Paint;
  layout?: Layout;
  minzoom?: number;
  maxzoom?: number;
  filter?: any[];
  metadata?: any;
}

export interface mapTiles {
  version: number;
  name?: string;
  metadata?: any;
  center?: [number, number];
  zoom?: number;
  bearing?: number;
  pitch?: number;
  light?: any;
  sources: {
    [key: string]: Source;
  };
  sprite?: string;
  glyphs?: string;
  layers: Layer[];
  id?: string;
  created?: string;
  modified?: string;
  owner?: string;
  visibility?: string;
  protected?: boolean;
  draft?: boolean;
}
