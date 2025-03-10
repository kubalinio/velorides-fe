import { Routes } from '@angular/router';
import { DisplayMapComponent } from './components/map/map.component';

export const UPLOAD_RIDE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./upload-ride.component').then((m) => m.UploadRideComponent),
    children: [
      {
        path: 'upload-ride',
        component: DisplayMapComponent,
      },
      { path: 'routes', redirectTo: 'upload-ride' },
    ],
  },
];
