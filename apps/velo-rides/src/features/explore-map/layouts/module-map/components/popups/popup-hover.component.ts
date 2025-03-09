import { Component, Input } from '@angular/core';
import { hlmMuted } from '@spartan-ng/ui-typography-helm';
import { PopupComponent } from '@velo/ngx-maplibre-gl';

@Component({
  standalone: true,
  selector: 'map-hover-popup',
  imports: [PopupComponent],
  template: `
    @if (hoverRoute) {
      <mgl-popup [feature]="hoverRoute" [offset]="12" [closeButton]="false">
        <div class="px-2 space-y-1">
          <h3 class="text-base font-semibold">
            {{ getPopupTitle() }}
          </h3>

          @if (hoverRoute.properties?.distance) {
            <p class="${hlmMuted}">
              {{
                hoverRoute.properties?.distance.includes('km')
                  ? hoverRoute.properties?.distance
                  : hoverRoute.properties?.distance + ' km'
              }}
            </p>
          }

          @if (hoverRoute.properties?.surface) {
            <p class="${hlmMuted}">
              <span>Surface: </span>
              <span class="font-semibold">{{
                hoverRoute.properties?.surface
              }}</span>
            </p>
          }
        </div>
      </mgl-popup>
    }
  `,
})
export class HoverPopupComponent {
  @Input() hoverRoute: GeoJSON.Feature<GeoJSON.Point> | null;

  getPopupTitle() {
    if (!this.hoverRoute?.properties?.name) {
      if (this.hoverRoute.properties?.type !== 'way') {
        return 'Unnamed Route';
      }

      if (this.hoverRoute.properties?.type === 'way') {
        return 'Unnamed Way';
      }
    }

    return this.hoverRoute.properties?.name ?? 'Unnamed';
  }
}
