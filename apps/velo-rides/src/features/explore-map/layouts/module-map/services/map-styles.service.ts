import { Injectable } from '@angular/core';
import { Expression } from 'maplibre-gl';

@Injectable({
  providedIn: 'any',
})
export class MapStylesService {
  readonly routePaint = {
    'line-color': [
      'match',
      ['get', 'network'],
      'icn',
      '#8b5cf6',
      'ncn',
      '#b91c1c',
      'rcn',
      '#f97316',
      'lcn',
      '#000000',
      '#000000',
    ] as unknown as Expression,
    'line-width': [
      'case',
      [
        '==',
        ['get', 'id'],
        ['coalesce', ['get', 'selectedRouteId'], ['get', 'hoveredRouteId'], ''],
      ],
      4,
      2,
    ] as unknown as Expression,
    'line-opacity': [
      'case',
      [
        '==',
        ['get', 'id'],
        ['coalesce', ['get', 'selectedRouteId'], ['get', 'hoveredRouteId'], ''],
      ],
      0.8,
      0.5,
    ] as unknown as Expression,
    'line-gap-width': 0,
    'line-blur': 0,
    'line-translate': [0, 0],
  };

  readonly routeSubwayPaint = {
    'line-color': [
      'match',
      ['get', 'surface'],
      'paved',
      '#3b82f6',
      'asphalt',
      '#374151',
      'gravel',
      '#eab308',
      'ground',
      '#78716c',
      'unpaved',
      '#f97316',
      'wood',
      '#262626',
      'compacted',
      '#f59e0b',
      'paving_stones',
      '#3b82f6',
      'unhewn_cobblestone',
      '#374151',
      'cobblestone',
      '#78716c',
      'concrete',
      '#dc2626',
      '#dc2626',
    ] as unknown as Expression,
    'line-width': [
      'case',
      [
        'in',
        ['get', 'surface'],
        [
          'literal',
          [
            'asphalt',
            'concrete',
            'paved',
            'unpaved',
            'ground',
            'wood',
            'gravel',
            'compacted',
            'paving_stones',
            'unhewn_cobblestone',
            'cobblestone',
          ],
        ],
      ],
      6,
      8,
    ] as unknown as Expression,
    'line-opacity': [
      'case',
      ['==', ['get', 'id'], ['coalesce', ['get', 'hoveredSubwayId'], '']],
      1,
      0,
    ] as unknown as Expression,
  };

  readonly routeHoverPaint = {
    'line-color': '#888',
    'line-width': 16,
    'line-opacity': 0,
  };
}
