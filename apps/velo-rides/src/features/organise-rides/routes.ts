import { Routes } from '@angular/router';
import { DisplayMapComponent } from './components/map/map.component';

export const ORGANISE_MAP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./organise.component').then((m) => m.OrganiseRidesComponent),
    children: [
      {
        path: 'organise-ride',
        component: DisplayMapComponent,
      },
      { path: 'routes', redirectTo: 'display-map' },
    ],
  },
];
