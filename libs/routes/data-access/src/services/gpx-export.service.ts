import { Injectable } from '@angular/core';
import * as JXON from 'jxon';

JXON.config({
  attrPrefix: '@',
  attrKey: '$attributes',
  valueKey: '$value',
  parseValues: true,
});

interface GpxOptions {
  creator?: string;
  metadata?: any;
  featureTitle?: (props: any) => string;
  featureDescription?: (props: any) => string;
  featureLink?: (props: any) => string;
  featureCoordTimes?: ((feature: any) => any) | string;
}

interface GpxPoint {
  $attributes: {
    lat: number;
    lon: number;
  };
  ele?: number;
  time?: string;
  [key: string]: any;
}

interface GpxSegment {
  trkpt: GpxPoint[];
}

interface GpxTrack {
  name: string;
  desc: string;
  trkseg: GpxSegment[];
  link?: { $attributes: { href: string } };
  [key: string]: any;
}

interface GpxWaypoint {
  $attributes: {
    lat: number;
    lon: number;
  };
  name: string;
  desc: string;
  ele?: number;
  link?: { $attributes: { href: string } };
  [key: string]: any;
}

interface GpxStructure {
  gpx: {
    $attributes: {
      xmlns: string;
      'xmlns:xsi': string;
      'xsi:schemaLocation': string;
      version: string;
      creator?: string;
    };
    metadata: any;
    wpt: GpxWaypoint[];
    trk: GpxTrack[];
    [key: string]: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class GpxExportService {
  /**
   * Converts GeoJSON to GPX
   * @param geojson GeoJSON object
   * @param options Options for the GPX export
   * @returns GPX content as string
   */
  toGpx(geojson: any, options?: GpxOptions): string {
    options = this.mergeOptions(
      {
        creator: 'togpx',
        metadata: undefined,
        featureTitle: this.get_feature_title.bind(this),
        featureDescription: this.get_feature_description.bind(this),
        featureLink: undefined,
        featureCoordTimes: this.get_feature_coord_times.bind(this),
      },
      options || {},
    );

    // is featureCoordTimes is a string -> look for the specified property
    if (typeof options.featureCoordTimes === 'string') {
      const customTimesFieldKey = options.featureCoordTimes;
      options.featureCoordTimes = function (feature: any) {
        return feature.properties[customTimesFieldKey];
      };
    }

    // make gpx object
    const gpx: GpxStructure = {
      gpx: {
        $attributes: {
          xmlns: 'http://www.topografix.com/GPX/1/1',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation':
            'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd',
          version: '1.1',
        },
        metadata: null,
        wpt: [],
        trk: [],
      },
    };

    if (options.creator) {
      gpx.gpx.$attributes.creator = options.creator;
    }

    if (options.metadata) {
      gpx.gpx.metadata = options.metadata;
    } else {
      delete gpx.gpx.metadata;
    }

    let features: any[];
    if (geojson.type === 'FeatureCollection') {
      features = geojson.features;
    } else if (geojson.type === 'Feature') {
      features = [geojson];
    } else {
      features = [{ type: 'Feature', properties: {}, geometry: geojson }];
    }

    features.forEach((f: any) => {
      this.mapFeature(f, gpx, options);
    });

    const gpx_str = JXON.stringify(gpx);
    return gpx_str;
  }

  private mapFeature(f: any, gpx: GpxStructure, options: GpxOptions): void {
    let o: any;
    let coords: any;

    switch (f.geometry.type) {
      // POIs
      case 'Point':
      case 'MultiPoint':
        coords = f.geometry.coordinates;
        if (f.geometry.type === 'Point') coords = [coords];
        coords.forEach((coordinates: any) => {
          o = {
            $attributes: {
              lat: coordinates[1],
              lon: coordinates[0],
            },
            name:
              typeof options.featureTitle === 'function'
                ? options.featureTitle(f.properties)
                : '',
            desc:
              typeof options.featureDescription === 'function'
                ? options.featureDescription(f.properties)
                : '',
          };
          if (coordinates[2] !== undefined) {
            o.ele = coordinates[2];
          }
          this.add_feature_link(o, f, options);
          gpx.gpx.wpt.push(o);
        });
        break;

      // LineStrings
      case 'LineString':
      case 'MultiLineString':
        coords = f.geometry.coordinates;
        const times =
          typeof options.featureCoordTimes === 'function'
            ? options.featureCoordTimes(f)
            : null;
        if (f.geometry.type === 'LineString') coords = [coords];
        o = {
          name:
            typeof options.featureTitle === 'function'
              ? options.featureTitle(f.properties)
              : '',
          desc:
            typeof options.featureDescription === 'function'
              ? options.featureDescription(f.properties)
              : '',
        };
        this.add_feature_link(o, f, options);
        o.trkseg = [];
        coords.forEach((coordinates: any) => {
          const seg: GpxSegment = { trkpt: [] };
          coordinates.forEach((c: any, i: number) => {
            const point: GpxPoint = {
              $attributes: {
                lat: c[1],
                lon: c[0],
              },
            };
            if (c[2] !== undefined) {
              point.ele = c[2];
            }
            if (times && times[i]) {
              point.time = times[i];
            }
            seg.trkpt.push(point);
          });
          o.trkseg.push(seg);
        });
        gpx.gpx.trk.push(o);
        break;

      // Polygons / Multipolygons
      case 'Polygon':
      case 'MultiPolygon':
        o = {
          name:
            typeof options.featureTitle === 'function'
              ? options.featureTitle(f.properties)
              : '',
          desc:
            typeof options.featureDescription === 'function'
              ? options.featureDescription(f.properties)
              : '',
        };
        this.add_feature_link(o, f, options);
        o.trkseg = [];
        coords = f.geometry.coordinates;
        const polyTimes =
          typeof options.featureCoordTimes === 'function'
            ? options.featureCoordTimes(f)
            : null;
        if (f.geometry.type === 'Polygon') coords = [coords];
        coords.forEach((poly: any) => {
          poly.forEach((ring: any) => {
            const seg: GpxSegment = { trkpt: [] };
            let i = 0;
            ring.forEach((c: any) => {
              const point: GpxPoint = {
                $attributes: {
                  lat: c[1],
                  lon: c[0],
                },
              };
              if (c[2] !== undefined) {
                point.ele = c[2];
              }
              if (polyTimes && polyTimes[i]) {
                point.time = polyTimes[i];
              }
              i++;
              seg.trkpt.push(point);
            });
            o.trkseg.push(seg);
          });
        });
        gpx.gpx.trk.push(o);
        break;

      case 'GeometryCollection':
        f.geometry.geometries.forEach((geometry: any) => {
          const pseudo_feature = {
            properties: f.properties,
            geometry: geometry,
          };
          this.mapFeature(pseudo_feature, gpx, options);
        });
        break;

      default:
        console.log('warning: unsupported geometry type: ' + f.geometry.type);
    }
  }

  private mergeOptions(defaults: GpxOptions, options: GpxOptions): GpxOptions {
    for (const k in defaults) {
      if (options.hasOwnProperty(k) && k in defaults) {
        (defaults as any)[k] = (options as any)[k];
      }
    }
    return defaults;
  }

  private get_feature_title(props: any): string {
    // a simple default heuristic to determine a title for a given feature
    // uses a nested `tags` object or the feature's `properties` if present
    // and then searchs for the following properties to construct a title:
    // `name`, `ref`, `id`
    if (!props) return '';
    if (typeof props.tags === 'object') {
      const tags_title = this.get_feature_title(props.tags);
      if (tags_title !== '') return tags_title;
    }
    if (props.name) return props.name;
    if (props.ref) return props.ref;
    if (props.id) return props.id;
    return '';
  }

  private get_feature_description(props: any): string {
    // constructs a description for a given feature
    // uses a nested `tags` object or the feature's `properties` if present
    // and then concatenates all properties to construct a description.
    if (!props) return '';
    if (typeof props.tags === 'object')
      return this.get_feature_description(props.tags);
    let res = '';
    for (const k in props) {
      if (typeof props[k] === 'object') continue;
      res += k + '=' + props[k] + '\n';
    }
    return res.substr(0, res.length - 1);
  }

  private get_feature_coord_times(feature: any): any {
    if (!feature.properties) return null;
    return feature.properties.times || feature.properties.coordTimes || null;
  }

  private add_feature_link(o: any, f: any, options: GpxOptions): void {
    if (options.featureLink && typeof options.featureLink === 'function') {
      o.link = {
        $attributes: {
          href: options.featureLink(f.properties),
        },
      };
    }
  }

  /**
   * Generates a file name for the GPX export
   * @param routeName Name of the route
   * @returns Formatted file name
   */
  generateFileName(routeName: string): string {
    const sanitizedName = routeName
      ? routeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      : 'unnamed_route';

    const date = new Date().toISOString().split('T')[0];
    return `velo_rides_${sanitizedName}_${date}.gpx`;
  }

  /**
   * Triggers download of GPX file
   * @param gpxContent GPX content as string
   * @param fileName Name of the file to download
   */
  downloadGpxFile(gpxContent: string, fileName: string): void {
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
