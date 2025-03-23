import { Routes } from '@angular/router';

import { RouteEditComponent } from '@velo/routes-feat-route-edit';

import { RouteListComponent } from './route-list/route-list.component';
import { RouteDetailsComponent } from './route-details/route-details.component';
export const EXPLORE_MAP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./explore-map.component').then((m) => m.ExploreMapViewComponent),
    children: [
      {
        path: 'explore-map',
        component: RouteListComponent,
      },
      {
        path: 'explore-map/:id',
        component: RouteDetailsComponent,
      },
      {
        path: 'explore-map/:id/edit',
        component: RouteEditComponent,
      },
    ],
  },
];
