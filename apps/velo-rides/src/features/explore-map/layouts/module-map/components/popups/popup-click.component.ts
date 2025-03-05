import { Component, Input, output } from '@angular/core';
import { PopupComponent } from '@velo/ngx-maplibre-gl';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideZoomIn } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  standalone: true,
  selector: 'map-click-popup',
  providers: [provideIcons({ lucideZoomIn })],
  imports: [PopupComponent, NgIconComponent, HlmButtonDirective],
  template: `
    @if (selectedRoute && clickPopupFeature) {
      <mgl-popup
        [feature]="clickPopupFeature"
        [offset]="12"
        [closeButton]="false"
        [closeOnClick]="true"
        (popupClose)="closePopupHandler()"
      >
        <div class="px-2 flex flex-col gap-2">
          <h3 class="text-base font-semibold">
            {{ selectedRoute.name ?? 'Unnamed Route' }}
          </h3>

          @if (selectedRoute.distance) {
            <p class="text-sm text-muted-foreground mb-2">
              {{
                selectedRoute.distance.includes('km')
                  ? selectedRoute.distance
                  : selectedRoute.distance + ' km'
              }}
            </p>
          }

          @if (selectedRoute.description) {
            <p class="text-sm text-muted-foreground">
              {{ selectedRoute.description }}
            </p>
          } @else if (selectedRoute.from && selectedRoute.to) {
            <p class="text-sm text-muted-foreground">
              {{ selectedRoute.from }} -
              {{ selectedRoute.to }}
            </p>
          }

          <button
            (click)="zoomToRouteHandler()"
            hlmBtn
            variant="ghost"
            class="hover:text-gray-700 p-1 ml-auto h-auto"
          >
            <ng-icon name="lucide:zoom-in" class="!size-4" />
          </button>
        </div>
      </mgl-popup>
    }
  `,
})
export class ClickPopupComponent {
  @Input() selectedRoute: any;
  @Input() clickPopupFeature: GeoJSON.Feature<GeoJSON.Point> | null;
  closePopup = output<void>();
  zoomToRoute = output<GeoJSON.Feature>();

  closePopupHandler() {
    this.closePopup.emit();
  }

  zoomToRouteHandler() {
    this.zoomToRoute.emit(this.clickPopupFeature);
  }
}
