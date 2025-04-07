import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
// import geojsonToOsm from 'geojsontoosm';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'any',
})
export class RouteWaysService {
  private readonly http = inject(HttpClient);

  formatSufaceName(surface: string) {
    // const surfacePrimitive = surface.replace('_', ':');
    // console.log('surfacePrimitive', surfacePrimitive.toUpperCase());
    // return surface;

    switch (surface) {
      case 'n/a':
        return 'N/A';
      case 'paved':
        return 'Paved';
      case 'asphalt':
        return 'Asphalt';
      case 'gravel':
        return 'Gravel';
      case 'ground':
        return 'Ground';
      case 'unpaved':
        return 'Unpaved';
      case 'wood':
        return 'Wood';
      case 'compacted':
        return 'Compacted';
      case 'paving_stones':
        return 'Paving Stones';
      case 'unhewn_cobblestone':
        return 'Unhewn Cobblestone';
      case 'cobblestone':
        return 'Cobblestone';
      case 'sand':
        return 'Sand';
      case 'fine_gravel':
        return 'Fine Gravel';
      case 'concrete:plates':
        return 'Concrete Plates';
      case 'set':
        return 'Set';
      case 'grass':
        return 'Grass';
      case 'concrete':
        return 'Concrete';
      case 'grass_paver':
        return 'Grass Paver';
      case 'dirt':
        return 'Dirt';

      default:
        return surface;
    }
  }

  getSurfaceColor(surface: string) {
    switch (surface) {
      case 'paved':
        return '#3b82f6';
      case 'asphalt':
        return '#374151';
      case 'gravel':
        return '#eab308';
      case 'ground':
        return '#78716c';
      case 'unpaved':
        return '#f97316';
      case 'wood':
        return '#262626';
      case 'compacted':
        return '#f59e0b';
      case 'paving_stones':
        return '#3b82f6';
      case 'cobblestone':
        return '#78716c';
      case 'unhewn_cobblestone':
      case 'concrete':
      case 'fine_gravel':
      case 'sand':
      case 'concrete:plates':
        return '#374151';

      default:
        return '#dc2626';
    }
  }

  getWay(_wayId: string): Observable<any> {
    const url = `https://api.openstreetmap.org/api/0.6/way/${_wayId}.xml`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/xml; charset=utf-8',
      Accept: 'application/xml',
    });

    return this.http.get(url, { headers, responseType: 'text' });
  }

  getChangeset({
    osm_username,
    routeId,
  }: {
    osm_username: string;
    routeId: string;
  }): Observable<string | null | void> {
    const changesetId = localStorage.getItem(`route-${routeId}-changeset`);
    const url = `https://api.openstreetmap.org/api/0.6/changeset/${changesetId}`;

    const access_token = localStorage.getItem(
      'https://www.openstreetmap.orgoauth2_access_token',
    );

    if (!access_token || !osm_username) {
      throw new Error('No OSM credentials found');
    }

    const authHeaders = new HttpHeaders({
      'Content-Type': 'application/xml; charset=utf-8',
      Authorization: `Bearer ${access_token}`,
    });

    if (!changesetId) {
      return this.createChangesetOSM(osm_username, routeId);
    }

    return this.http
      .get(url, { responseType: 'text', headers: authHeaders })
      .pipe(
        switchMap((response) => {
          if (response.includes('closed')) {
            localStorage.removeItem(`route-${routeId}-changeset`);

            return this.createChangesetOSM(osm_username, routeId);
          }

          return of(response);
        }),
      );
  }

  createChangesetOSM(
    osm_username: string,
    routeId: string,
  ): Observable<void | null> {
    const url = `https://api.openstreetmap.org/api/0.6/changeset/create`;

    if (!osm_username) {
      throw new Error('No OSM username found');
    }

    if (localStorage.getItem(`route-${routeId}-changeset`)) {
      return of(null);
    }

    const changesetXML = `<osm>
      <changeset>
        <tag k="created_by" v="${osm_username}"/>
        <tag k="comment" v="Updating route way properties"/>
      </changeset>
    </osm>`;

    const access_token = localStorage.getItem(
      'https://www.openstreetmap.orgoauth2_access_token',
    );

    if (!access_token || !osm_username) {
      throw new Error('No OSM credentials found');
    }

    const authHeaders = new HttpHeaders({
      'Content-Type': 'application/xml; charset=utf-8',
      Authorization: `Bearer ${access_token}`,
    });

    return this.http
      .put<string>(url, changesetXML, { headers: authHeaders })
      .pipe(
        map((response) => {
          localStorage.setItem(`route-${routeId}-changeset`, response);
        }),
      );
  }

  closeChangesetOSM(routeId: string): Observable<any> {
    const changesetId = localStorage.getItem(`route-${routeId}-changeset`);

    if (!changesetId) {
      return of({ success: false, error: 'No changeset found' });
    }

    const url = `https://api.openstreetmap.org/api/0.6/changeset/${changesetId}/close`;

    const access_token = localStorage.getItem(
      'https://www.openstreetmap.orgoauth2_access_token',
    );

    const headers = new HttpHeaders({
      'Content-Type': 'application/xml; charset=utf-8',
      Authorization: `Bearer ${access_token}`,
    });

    return this.http.put(url, {}, { headers }).pipe(
      map(() => {
        localStorage.removeItem(`route-${routeId}-changeset`);

        return { success: true };
      }),
      catchError((error) =>
        of({
          success: false,
          error: error.message || 'Failed to close changeset',
        }),
      ),
    );
  }

  updateRouteWay(args: {
    osm_username: string | null;
    routeId: string;
    wayId: string;
    surface: string | undefined;
  }): Observable<any> {
    // https://master.apis.dev.openstreetmap.org/api/0.6/user/details.json
    const wayIdClean = args.wayId.split('/')[1];
    const url = `https://api.openstreetmap.org/api/0.6/way/${wayIdClean}`;
    const access_token = localStorage.getItem(
      'https://www.openstreetmap.orgoauth2_access_token',
    );
    const changesetId = localStorage.getItem(`route-${args.routeId}-changeset`);

    if (!access_token) {
      // throw new Error('No access token found');
      return of({ success: false, error: 'No OSM credentials found' });
    }

    if (!changesetId) {
      console.log('No changeset found', args);

      return this.createChangesetOSM(args.osm_username!, args.routeId);
    }

    const authHeaders = new HttpHeaders({
      'Content-Type': 'application/xml; charset=utf-8',
      Authorization: `Bearer ${access_token}`,
    });

    return this.getWay(wayIdClean).pipe(
      switchMap((osmData) => {
        // get the changeset id from the osm data

        const osmDataWithChangeset = osmData.replace(
          /changeset="\d+"/,
          `changeset="${changesetId}"`,
        );

        let updatedOsmData = osmDataWithChangeset;

        // Check for surface tag in two formats: as an attribute or as a tag element
        const surfaceAttributeRegex = /surface="([^"]*)"/;
        const surfaceTagRegex = /<tag k="surface" v="([^"]*)"\/?>/;

        // Extract current surface value if it exists
        let currentSurface = null;

        if (!args.surface) {
          return of({ success: true, message: 'No surface provided' });
        }

        if (surfaceAttributeRegex.test(updatedOsmData)) {
          const match = updatedOsmData.match(surfaceAttributeRegex);
          currentSurface = match ? match[1] : null;

          // If surface is the same, return without making PUT request
          if (currentSurface === args.surface || !args.surface) {
            return of({ success: true, message: 'Surface already up to date' });
          }

          // Replace surface attribute
          updatedOsmData = updatedOsmData.replace(
            surfaceAttributeRegex,
            `surface="${args.surface}"`,
          );
        } else if (surfaceTagRegex.test(updatedOsmData)) {
          const match = updatedOsmData.match(surfaceTagRegex);
          currentSurface = match ? match[1] : null;

          // If surface is the same, return without making PUT request
          if (currentSurface === args.surface) {
            return of({ success: true, message: 'Surface already up to date' });
          }

          // Replace existing surface tag
          updatedOsmData = updatedOsmData.replace(
            surfaceTagRegex,
            `<tag k="surface" v="${args.surface}"/>`,
          );
        } else {
          // Add new surface tag if none exists
          const wayEndTag = '</way>';
          const wayEndPosition = updatedOsmData.indexOf(wayEndTag);

          if (wayEndPosition !== -1) {
            const newSurfaceTag = `<tag k="surface" v="${args.surface}"/>`;
            updatedOsmData =
              updatedOsmData.slice(0, wayEndPosition) +
              newSurfaceTag +
              updatedOsmData.slice(wayEndPosition);
          }
        }

        // Make the PUT request with updated changeset
        return this.http
          .put(url, updatedOsmData, { headers: authHeaders })
          .pipe(
            map(() => ({ success: true, wayData: updatedOsmData })),
            catchError((error) =>
              of({
                success: false,
                error: error.message || 'Failed to update way',
                wayData: updatedOsmData,
              }),
            ),
          );
      }),
      catchError((error) =>
        of({
          success: false,
          error: error.message || 'Failed to create changeset',
        }),
      ),
      catchError((error) =>
        of({
          success: false,
          error: error.message || 'Failed to get way data from OSM',
        }),
      ),
    );
  }
}

// Example of OSM XML RETURN
// <osm version="0.6" generator="geojsontoosm">
// <node id="-1" lat="50.7765951" lon="19.260028"/>
// <node id="-2" lat="50.7765645" lon="19.2600371"/>
// <node id="-3" lat="50.7764698" lon="19.2600641"/>
// <node id="-4" lat="50.7756285" lon="19.2603044"/>
// <way id="-1">
// <nd ref="-1"/>
// <nd ref="-2"/>
// <nd ref="-3"/>
// <nd ref="-4"/>
// <tag k="bicycle" v="yes"/>
// <tag k="highway" v="residential"/>
// <tag k="name" v="Szkolna"/>
// <tag k="surface" v="asphalt"/>
// <tag k="id" v="way/27462348"/>
// <tag k="bounds" v="[[19.260028,50.7765951],[19.2600371,50.7765645],[19.2600641,50.7764698],[19.2603044,50.7756285]]"/>
// </way></osm>
