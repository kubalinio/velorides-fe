import { Route } from '@angular/router';
import { HOME_ROUTES } from '../features/home/routes';
import { ORGANISE_MAP_ROUTES } from '../features/organise-rides/routes';
import { VIEWING_MAP_ROUTES } from '../features/viewing-map/routes';
export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('../features/shared/layout/layout.component').then(
        (m) => m.LayoutComponent,
      ),
    children: [...HOME_ROUTES, ...ORGANISE_MAP_ROUTES, ...VIEWING_MAP_ROUTES],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
