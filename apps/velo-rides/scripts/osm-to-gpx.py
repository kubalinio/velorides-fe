#!/usr/bin/env python3

"""
osmrelation_to_gpx.py

This script downloads a relation from OSM (given the relation number), fetches
all the ways contained and then writes the contents into a GPX file for easy
import into other tools (for instance, a handheld GPS unit/GPS-equipped phone).
Requires python3.

Based on the perl script available at
http://wiki.openstreetmap.org/wiki/Relations/Relations_to_GPX
(updated in various ways)

Uses OSM API v0.6 (see http://wiki.openstreetmap.org/wiki/API_v0.6)

Usage:
python3 osmrelation_to_gpx.py -o relation.gpx 12345678
"""

import argparse
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import sys
import os

API_BASE = "http://www.openstreetmap.org/api/0.6/"
LINK_BASE = "http://www.openstreemap.org/relation/"
GPX_ATTR = {"version": "1.1",
            "creator": "osmrelation_to_gpx",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xmlns": "http://www.topografix.com/GPX/1/1",
            "xsi:schemaLocation": "http://www.topografix.com/GPX/1/1/gpx.xsd"}


def fetch_relation(rel):
    """
    Fetch the relation by ID number. The API call "relation/#id/full" fetches
    both the relation and all ways and nodes it references in a single XML
    response. The structure should be:

    <osm>
        <node ...>+
        <way>+
            <nd...>+
            <tag...>*
        <relation>
            <member...>+
            <tag...>*

    Returns an ElementTree root object (the <osm> node) for further processing.
    """
    url = API_BASE+"relation/"+str(rel)+"/full"
    try:
        f = urllib.request.urlopen(url)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("Failed to open %s, HTTP 404 (relation number invalid?)" % (url))
        else:
            print("Failed to open %s, HTTP error %s: %s" % (url, e.code, e.reason))
        sys.exit(1)
    except urllib.error.URLError as e:
        print("Failed to open %s, reason: %s" % (url, e.reason))
        sys.exit(1)

    try:
        osm = ET.parse(f).getroot()
    except ET.ParseError as e:
        print("Error parsing received XML: " + str(e))
        sys.exit(1)

    if osm.tag != "osm":
        print("Top level of received document is not 'osm' (found '%s'): cannot parse" % osm.tag)
        sys.exit(1)

    return osm


def build_gpx(rel):
    """
    Uses the downloaded relation data to build an GPX-format XML document.
    One <trkseg> is created per <way> in the relation, plus some <metadata>
    Returns an ElementTree object
    """

    root = ET.Element("gpx", **GPX_ATTR)
    print("Fetching relation: %s" % rel)
    osm = fetch_relation(rel)

    print("Found %d nodes, %d ways" % (len(osm.findall('./node')),
                                       len(osm.findall('./way'))))

    # build a dictionary of {nodeid: (lat, long)} for later lookup
    nodell = {e.attrib['id']: (float(e.attrib['lat']), float(e.attrib['lon']))
              for e in osm.findall('./node')}

    # find the bounding box
    bounds = {'minlat': str(min(n[0] for n in nodell.values())),
              'maxlat': str(max(n[0] for n in nodell.values())),
              'minlon': str(min(n[1] for n in nodell.values())),
              'maxlon': str(max(n[1] for n in nodell.values()))}

    # add some metadata from the <relation> tags
    meta = ET.SubElement(root, "metadata")
    trk = ET.SubElement(root, "trk")
    relname = osm.find('./relation/tag[@k="name"]')
    if relname is not None:
        name = relname.attrib['v']
        print("Relation name: %s" % name)
        metaname = ET.SubElement(meta, "name")
        metaname.text = name
        trkname = ET.SubElement(trk, "name")
        trkname.text = name
    desc = ET.SubElement(meta, "desc")
    desc.text = "OSM Relation #%s" % rel
    ET.SubElement(meta, "link", href=LINK_BASE+str(rel))
    ET.SubElement(meta, "bounds", **bounds)

    # loop over the ways in the relation
    # creating one <trkseg> element per way
    for way in osm.findall('./relation/member[@type="way"]'):
        trkseg = ET.SubElement(trk, "trkseg")
        for nd in osm.findall('./way[@id="%s"]/nd' % way.attrib['ref']):
            ll = nodell[nd.attrib['ref']]
            ET.SubElement(trkseg, "trkpt", lat=str(ll[0]), lon=str(ll[1]))

    return root

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("relation", type=int, help="Relation to fetch")
    parser.add_argument("-o", "--output", type=str, default=None,
                        help="File for output (defaults to osmREL.gpx)")
    parser.add_argument("-y", "--overwrite", action="store_true",
                        default=False, help="Overwrite existing file")
    args = parser.parse_args()

    etree = ET.ElementTree(build_gpx(args.relation))

    if args.output:
        fname = args.output
    else:
        fname = "osm%s.gpx" % args.relation
        print("Saving to %s" % fname)

    if os.path.exists(fname) and not args.overwrite:
        print("%s exists, not overwriting" % fname)
        sys.exit(1)

    if fname == '-':
        etree.write(sys.stdout, xml_declaration=True, encoding="unicode")
    else:
        etree.write(fname, xml_declaration=True, encoding="UTF-8")
