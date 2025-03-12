import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { hlm } from '@spartan-ng/brain/core';
import { ExploreMapComponent } from './layouts/module-map/map.component';

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
    <mat-sidenav-container class="!h-[calc(100vh-64px)] !top-16">
      <mat-sidenav-content class="!bg-gray-200">
        <section
          [class]="
            hlm(
              'h-full rounded-r-2xl overflow-hidden shadow-md mr-2',
              !sidenavIsOpen() && 'mr-0'
            )
          "
        >
          <app-explore-map></app-explore-map>
        </section>
      </mat-sidenav-content>
      <mat-sidenav
        #sidenav
        mode="side"
        position="end"
        [opened]="sidenavIsOpen()"
        (openedChange)="onSidenavChange()"
        class="!bg-gray-200 !border-gray-200"
      >
        <mat-nav-list>
          <router-outlet></router-outlet>
        </mat-nav-list>
      </mat-sidenav>
    </mat-sidenav-container>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        width: 100%;
      }
      mat-sidenav-container {
        height: 100%;
      }
    `,
  ],
})
export class ExploreMapViewComponent {
  protected readonly hlm = hlm;
  sidenavIsOpen = signal(true);

  toggleSidenav() {
    this.sidenavIsOpen.update((isOpen) => !isOpen);
  }

  onSidenavChange() {}
}
