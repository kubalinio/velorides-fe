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
        return 'bg-blue-500';
      case 'asphalt':
        return 'bg-gray-700';
      case 'gravel':
        return 'bg-yellow-500';
      case 'ground':
        return 'bg-stone-500';
      case 'unpaved':
        return 'bg-orange-500';
      case 'wood':
        return 'bg-neutral-800';
      case 'compacted':
        return 'bg-yellow-500';
      case 'paving_stones':
        return 'bg-blue-500';
      case 'unhewn_cobblestone':
        return 'bg-gray-700';
      case 'cobblestone':
        return 'bg-stone-500';
      case 'concrete':
        return 'bg-red-600';
      default:
        return 'bg-red-600';
    }
  }
}
