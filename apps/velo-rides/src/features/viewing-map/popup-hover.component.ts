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
            {{ hoverRoute.properties?.name }}
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
        </div>
      </mgl-popup>
    }
  `,
})
export class HoverPopupComponent {
  @Input() hoverRoute: GeoJSON.Feature<GeoJSON.Point> | null;

  ngOnInit() {
    console.log(this.hoverRoute);
  }
}
