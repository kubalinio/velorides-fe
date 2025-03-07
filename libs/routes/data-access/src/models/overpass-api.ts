interface RouteElement {
  type: 'relation' | 'way';
  id: number;

  tags: {
    name?: string;
    network?: string;
    ref?: string;
    route?: string;
    type?: string;
    wikidata?: string;
    wikipedia?: string;
    colour?: string;
    description?: string;
    distance?: string;
    website?: string;
    from?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    copyright: string;
  };
  elements: RouteElement[];
}

export type { OverpassResponse, RouteElement };
