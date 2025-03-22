import { Routes } from '@angular/router';
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
    ],
  },
];
