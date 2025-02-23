import { Routes } from '@angular/router';
import { DisplayMapComponent } from './map.component';

export const VIEWING_MAP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./viewing.component').then((m) => m.ViewingMapComponent),
    children: [
      {
        path: 'viewing-map',
        component: DisplayMapComponent,
      },
    ],
  },
];
