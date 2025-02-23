import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  // "@id": "relation/3281111",
  // "colour": "green",
  // "description": "Kalety - Koszęcin - Tworóg - Miasteczko Śl - Świerklaniec - Woźniki",
  // "distance": "110 km",
  // "name": "Leśno Rajza",
  // "network": "lcn",
  // "note": "Cała pętla wraz z trasami dojazdowymi",
  // "osmc:symbol": "green:white:LR:green",
  // "ref": "LR",
  // "route": "bicycle",
  // "type": "route",
  // "wikidata": "Q18431475",
  // "wikipedia": "pl:Leśno Rajza"

  formatRoute(route: NonNullable<GeoJSON.Feature['properties']>) {
    return {
      '@id': route['@id'],
      colour: route['colour'],
      description: route['description'],
      distance: route['distance'],
      name: route['name'],
      network: route['network'],
      note: route['note'],
      'osmc:symbol': route['osmc:symbol'],
      ref: route['ref'],
      route: route['route'],
      type: route['type'],
      wikidata: route['wikidata'],
    };
  }
}
