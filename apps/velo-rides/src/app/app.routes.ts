import { Route } from '@angular/router';
import { HOME_ROUTES } from '../features/home/routes';
import { UPLOAD_RIDE_ROUTES } from '../features/upload-ride/routes';
import { EXPLORE_MAP_ROUTES } from '../features/explore-map/routes';
export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('../features/shared/layout/layout.component').then(
        (m) => m.LayoutComponent,
      ),
    children: [...HOME_ROUTES, ...UPLOAD_RIDE_ROUTES, ...EXPLORE_MAP_ROUTES],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
