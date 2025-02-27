import { Component, Input, output } from '@angular/core';
import { PopupComponent } from '@velo/ngx-maplibre-gl';

@Component({
  standalone: true,
  selector: 'map-click-popup',
  imports: [PopupComponent],
  template: `
    @if (selectedRoute && clickPopupFeature) {
      <mgl-popup
        [feature]="clickPopupFeature"
        [offset]="12"
        [closeButton]="false"
        [closeOnClick]="true"
        (popupClose)="closePopupHandler()"
      >
        <div class="px-2">
          <h3 class="text-base font-semibold">{{ selectedRoute.name }}</h3>

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
        </div>
      </mgl-popup>
    }
  `,
})
export class ClickPopupComponent {
  @Input() selectedRoute: any;
  @Input() clickPopupFeature: GeoJSON.Feature<GeoJSON.Point> | null;
  closePopup = output<void>();

  closePopupHandler() {
    this.closePopup.emit();
  }
}
