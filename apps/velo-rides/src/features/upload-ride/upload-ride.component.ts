import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';

@Component({
  template: `
    <mat-sidenav-container class="!h-[calc(100vh-64px)] !top-16">
      <mat-sidenav-content class="!bg-gray-200">
        <section class="h-full rounded-r-2xl overflow-hidden shadow-md mr-2">
          <router-outlet></router-outlet>
        </section>
      </mat-sidenav-content>
      <mat-sidenav
        #sidenav
        mode="side"
        position="end"
        [opened]="sidenavIsOpen"
        (openedChange)="onSidenavChange()"
        class="!bg-gray-200 !border-gray-200"
      >
        <mat-nav-list>
          <h3 matSubheader>Upload ride</h3>
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
  standalone: true,
  imports: [
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
  ],
})
export class UploadRideComponent {
  sidenavIsOpen = true;

  toggleSidenav() {
    this.sidenavIsOpen = !this.sidenavIsOpen;
  }

  onSidenavChange() {}
}
