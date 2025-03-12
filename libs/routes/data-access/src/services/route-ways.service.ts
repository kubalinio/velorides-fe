import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'any',
})
export class RouteWaysService {
  formatSufaceName(surface: string) {
    switch (surface) {
      case 'paved':
        return 'Paved';
      case 'asphalt':
        return 'Asphalt';
      case 'gravel':
        return 'Gravel';
      case 'ground':
        return 'Ground';
      case 'unpaved':
        return 'Unpaved';
      case 'wood':
        return 'Wood';
      case 'compacted':
        return 'Compacted';
      case 'paving_stones':
        return 'Paving Stones';
      case 'unhewn_cobblestone':
        return 'Unhewn Cobblestone';
      case 'cobblestone':
        return 'Cobblestone';

      default:
        return surface;
    }
  }

  getSurfaceColor(surface: string) {
    switch (surface) {
      case 'paved':
        return '#3b82f6';
      case 'asphalt':
        return '#374151';
      case 'gravel':
        return '#eab308';
      case 'ground':
        return '#78716c';
      case 'unpaved':
        return '#f97316';
      case 'wood':
        return '#262626';
      case 'compacted':
        return '#f59e0b';
      case 'paving_stones':
        return '#3b82f6';
      case 'unhewn_cobblestone':
        return '#374151';
      case 'cobblestone':
        return '#78716c';
      case 'concrete':
        return '#dc2626';
      default:
        return '#dc2626';
    }
  }
}
