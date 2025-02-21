import { Injectable } from '@angular/core';
import { StyleSpecification } from 'maplibre-gl';
import { of } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private readonly OSM_STYLES = {
    standard: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
    bright: {
      type: 'raster' as const,
      tiles: ['https://a.tile.openstreetmap.org/bright/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
    humanitarian: {
      type: 'raster' as const,
      tiles: ['https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team',
    },
    cyclosm: {
      type: 'raster' as const,
      tiles: ['https://tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors, CyclOSM',
    },
    transport: {
      type: 'raster' as const,
      tiles: [
        'https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=YOUR_API_KEY',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors, Thunderforest',
    },
  };

  getMapTiles(styleType: string): Observable<StyleSpecification> {
    return of({
      version: 8 as const,
      sources: {
        'osm-tiles': this.OSM_STYLES[styleType as keyof typeof this.OSM_STYLES],
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    });
  }

  getAvailableStyles(): Observable<string[]> {
    return of(Object.keys(this.OSM_STYLES));
  }
}
