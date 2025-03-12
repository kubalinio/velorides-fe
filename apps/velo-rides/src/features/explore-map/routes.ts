import { Routes } from '@angular/router';
import { SidebarComponent } from './feed/module-sidebar/sidebar.component';
import { EditRouteComponent } from './edit/edit-route.component';
export const EXPLORE_MAP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./explore-map.component').then((m) => m.ExploreMapViewComponent),
    children: [
      {
        path: 'explore-map',
        component: SidebarComponent,
      },
      {
        path: 'explore-map/:id',
        component: EditRouteComponent,
      },
    ],
  },
];
