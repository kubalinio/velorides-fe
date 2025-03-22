import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { hlm } from '@spartan-ng/brain/core';
import { ExploreMapComponent } from './layouts/module-map/map.component';
import { RoutesStore, RouteStore } from '@velo/routes-data-access';

@Component({
  standalone: true,
  imports: [
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
    ExploreMapComponent,
  ],
  template: `
    <mat-sidenav-container
      class="md:!h-[calc(100vh-64px)] !h-[calc(100vh-56px)] md:!top-16 !top-14 !bg-sidebar-background"
    >
      <mat-sidenav-content
        [class]="
          hlm(
            '!bg-sidebar-background !border-sidebar-background !border-0',
            $selectedRoute() && '!bg-gradient-map'
          )
        "
      >
        <section
          [class]="
            hlm(
              'h-full rounded-r-2xl overflow-hidden shadow-md mr-2',
              !$isSidebarOpen() && 'mr-0'
            )
          "
        >
          <velo-explore-map></velo-explore-map>
        </section>
      </mat-sidenav-content>

      <mat-sidenav
        #sidenav
        mode="side"
        position="end"
        [opened]="$isSidebarOpen()"
        class="velo-sidenav"
      >
        <mat-nav-list class="velo-nav-list">
          <router-outlet></router-outlet>
        </mat-nav-list>
      </mat-sidenav>
    </mat-sidenav-container>
  `,
  styleUrls: ['./explore-map.component.scss'],
})
export class ExploreMapViewComponent {
  protected readonly hlm = hlm;

  private readonly routesStore = inject(RoutesStore);
  private readonly routeStore = inject(RouteStore);

  $selectedRoute = this.routeStore.selectedRoute;
  $isSidebarOpen = this.routesStore.isSidebarOpen;

  toggleSidenav() {
    this.routesStore.toggleSidebar();
  }
}
